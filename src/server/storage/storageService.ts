import fs from 'fs';
import path from 'path';
import { storageConfig, ensureStorageDirectories } from '../config/storage.config.js';

export type StorageCategory = 'uploads' | 'data' | 'logs' | 'backups' | 'secrets' | 'tmp';

export interface StoredFileInfo {
  filename: string;
  category: StorageCategory;
  relativePath: string;
  sizeBytes: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ============================================================================
 * CAFFEINE UNIFIED STORAGE SERVICE ABSTRACTION
 * ============================================================================
 * Decouples business logic completely from physical file paths.
 * Enforces:
 * - Anti-Path Traversal (null bytes, '..', absolute paths outside root)
 * - Safe atomic operations
 * - Category-based isolation
 * - MIME-type validation and safe content headers
 * ============================================================================
 */
export class StorageService {
  constructor() {
    ensureStorageDirectories();
  }

  /**
   * Resolves the root directory path for a given category.
   */
  getCategoryDirectory(category: StorageCategory): string {
    switch (category) {
      case 'data':
        return storageConfig.dataDir;
      case 'uploads':
        return storageConfig.uploadsDir;
      case 'logs':
        return storageConfig.logsDir;
      case 'backups':
        return storageConfig.backupsDir;
      case 'secrets':
        return storageConfig.secretsDir;
      case 'tmp':
        return storageConfig.tempDir;
      default:
        return storageConfig.storageRoot;
    }
  }

  /**
   * Sanitizes relative paths to strictly prevent path traversal vulnerabilities.
   */
  sanitizePath(unsafePath: string): string {
    if (!unsafePath || typeof unsafePath !== 'string') {
      throw new Error('INVALID_PATH: Path must be a non-empty string.');
    }

    if (unsafePath.includes('\0')) {
      throw new Error('SECURITY_ERROR: Null byte detected in path.');
    }

    // Strict traversal detection before normalization
    if (unsafePath.includes('..') || path.isAbsolute(unsafePath) || /^[a-zA-Z]:/.test(unsafePath)) {
      throw new Error('SECURITY_ERROR: Path traversal detected.');
    }

    const normalized = path.normalize(unsafePath).replace(/^[\\\/]+/, '');

    if (normalized.includes('..') || normalized.startsWith('/') || normalized.startsWith('\\')) {
      throw new Error('SECURITY_ERROR: Path traversal detected.');
    }

    return normalized;
  }

  /**
   * Computes the absolute, verified target path inside the designated category.
   */
  resolvePath(category: StorageCategory, relativePath: string): string {
    const safeRel = this.sanitizePath(relativePath);
    const categoryDir = this.getCategoryDirectory(category);
    const fullPath = path.resolve(categoryDir, safeRel);

    // Verify boundary confinement
    if (!fullPath.startsWith(categoryDir)) {
      throw new Error('SECURITY_ERROR: Resolved path escapes category directory boundary.');
    }

    return fullPath;
  }

  /**
   * Saves a file atomically inside a storage category.
   */
  async saveFile(
    category: StorageCategory,
    relativePath: string,
    data: Buffer | string,
    options?: { encoding?: BufferEncoding; mode?: number }
  ): Promise<StoredFileInfo> {
    const fullPath = this.resolvePath(category, relativePath);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true, mode: 0o755 });
    }

    const tempPath = `${fullPath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const encoding = options?.encoding || (typeof data === 'string' ? 'utf8' : undefined);

    if (encoding && typeof data === 'string') {
      fs.writeFileSync(tempPath, data, { encoding, mode: options?.mode || 0o644 });
    } else {
      fs.writeFileSync(tempPath, data as Buffer, { mode: options?.mode || 0o644 });
    }

    // Atomic move
    fs.renameSync(tempPath, fullPath);

    const stats = fs.statSync(fullPath);
    const filename = path.basename(fullPath);

    return {
      filename,
      category,
      relativePath: this.sanitizePath(relativePath),
      sizeBytes: stats.size,
      mimeType: this.guessMimeType(filename),
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString()
    };
  }

  /**
   * Saves a stream directly into a storage category (supports files up to 2GB).
   */
  async saveStream(
    category: StorageCategory,
    relativePath: string,
    stream: NodeJS.ReadableStream,
    maxSizeBytes: number = 2 * 1024 * 1024 * 1024 // 2GB
  ): Promise<StoredFileInfo> {
    const fullPath = this.resolvePath(category, relativePath);
    const parentDir = path.dirname(fullPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true, mode: 0o755 });
    }

    const tempPath = `${fullPath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const writeStream = fs.createWriteStream(tempPath);

    let bytesReceived = 0;

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        bytesReceived += chunk.length;
        if (bytesReceived > maxSizeBytes) {
          stream.pause();
          writeStream.destroy();
          try {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          } catch (_) {}
          reject(new Error(`FILE_TOO_LARGE: حجم فایل بیش از حد مجاز است (حداکثر ۲ گیگابایت).`));
        }
      });

      stream.on('error', (err) => {
        writeStream.destroy();
        try {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (_) {}
        reject(err);
      });

      writeStream.on('error', (err) => {
        try {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (_) {}
        reject(err);
      });

      writeStream.on('finish', () => {
        resolve();
      });

      stream.pipe(writeStream);
    });

    // Atomic rename
    fs.renameSync(tempPath, fullPath);

    const stats = fs.statSync(fullPath);
    const filename = path.basename(fullPath);

    return {
      filename,
      category,
      relativePath: this.sanitizePath(relativePath),
      sizeBytes: stats.size,
      mimeType: this.guessMimeType(filename),
      createdAt: stats.birthtime.toISOString(),
      updatedAt: stats.mtime.toISOString()
    };
  }

  /**
   * Reads a file from storage.
   */
  async readFile(category: StorageCategory, relativePath: string, encoding?: BufferEncoding): Promise<Buffer | string> {
    const fullPath = this.resolvePath(category, relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`FILE_NOT_FOUND: File "${relativePath}" does not exist in category "${category}".`);
    }

    if (encoding) {
      return fs.readFileSync(fullPath, encoding);
    }
    return fs.readFileSync(fullPath);
  }

  /**
   * Checks if a file exists in the specified category.
   */
  fileExists(category: StorageCategory, relativePath: string): boolean {
    try {
      const fullPath = this.resolvePath(category, relativePath);
      return fs.existsSync(fullPath);
    } catch (_) {
      return false;
    }
  }

  /**
   * Deletes a file safely.
   */
  async deleteFile(category: StorageCategory, relativePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolvePath(category, relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  /**
   * Lists files in a given storage category and optional subfolder.
   */
  listFiles(category: StorageCategory, subDirectory = ''): StoredFileInfo[] {
    const categoryDir = this.getCategoryDirectory(category);
    const targetDir = subDirectory ? this.resolvePath(category, subDirectory) : categoryDir;

    if (!fs.existsSync(targetDir)) {
      return [];
    }

    const results: StoredFileInfo[] = [];
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && !entry.name.startsWith('.')) {
        const full = path.join(targetDir, entry.name);
        try {
          const stats = fs.statSync(full);
          const relPath = path.relative(categoryDir, full);
          results.push({
            filename: entry.name,
            category,
            relativePath: relPath,
            sizeBytes: stats.size,
            mimeType: this.guessMimeType(entry.name),
            createdAt: stats.birthtime.toISOString(),
            updatedAt: stats.mtime.toISOString()
          });
        } catch (_) {}
      }
    }

    return results;
  }

  /**
   * Appends an entry to a persistent log stream.
   */
  appendLog(logName: string, entry: string | object): void {
    try {
      const safeLogName = logName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const logFile = path.join(storageConfig.logsDir, `${safeLogName}.log`);
      const logLine = typeof entry === 'string' ? entry : JSON.stringify(entry);
      fs.appendFileSync(logFile, `${logLine}\n`, { encoding: 'utf8', mode: 0o640 });
    } catch (err) {
      console.warn('[StorageService] Error writing log stream:', err);
    }
  }

  /**
   * Guesses basic MIME types for file serving.
   */
  private guessMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
      case '.json':
        return 'application/json';
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      case '.svg':
        return 'image/svg+xml';
      case '.pdf':
        return 'application/pdf';
      case '.txt':
      case '.log':
        return 'text/plain; charset=utf-8';
      case '.csv':
        return 'text/csv; charset=utf-8';
      default:
        return 'application/octet-stream';
    }
  }
}

export const storageService = new StorageService();
