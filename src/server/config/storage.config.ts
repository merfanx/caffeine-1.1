import path from 'path';
import fs from 'fs';

/**
 * ============================================================================
 * CAFFEINE ACADEMIC OS — STORAGE CONFIGURATION & ISOLATION LAYER
 * ============================================================================
 * Enforces strict separation between Application Code and Persistent Data:
 * - APPLICATION CODE: Stateless, replaceable, immutable code in /src and /dist
 * - USER & PERSISTENT DATA: Stored exclusively in the isolated storage root
 *
 * Environment Variables Supported:
 * - STORAGE_ROOT / CAFFEINE_STORAGE_DIR / SHARED_STORAGE_PATH: Base storage directory
 * - DATA_DIR: Custom path for database JSON files
 * - UPLOADS_DIR: Custom path for user files & media uploads
 * - LOGS_DIR: Custom path for audit & system logs
 * - BACKUPS_DIR: Custom path for archive snapshots
 * - SECRETS_DIR: Custom path for persisted cryptographic keys
 * ============================================================================
 */

export interface StorageConfig {
  storageRoot: string;
  dataDir: string;
  uploadsDir: string;
  logsDir: string;
  backupsDir: string;
  secretsDir: string;
  tempDir: string;
}

function resolveStorageRoot(): string {
  // 1. Explicit environment variable override
  if (process.env.STORAGE_ROOT && process.env.STORAGE_ROOT.trim().length > 0) {
    return path.resolve(process.env.STORAGE_ROOT.trim());
  }
  if (process.env.CAFFEINE_STORAGE_DIR && process.env.CAFFEINE_STORAGE_DIR.trim().length > 0) {
    return path.resolve(process.env.CAFFEINE_STORAGE_DIR.trim());
  }
  if (process.env.SHARED_STORAGE_PATH && process.env.SHARED_STORAGE_PATH.trim().length > 0) {
    return path.resolve(process.env.SHARED_STORAGE_PATH.trim());
  }

  // 2. Standard container shared volume mount: /shared or ./shared
  const dockerSharedPath = '/shared';
  try {
    if (fs.existsSync(dockerSharedPath) && fs.statSync(dockerSharedPath).isDirectory()) {
      const probeFile = path.join(dockerSharedPath, `.probe_writable_${Date.now()}`);
      fs.writeFileSync(probeFile, '1', 'utf8');
      fs.unlinkSync(probeFile);
      return dockerSharedPath;
    }
  } catch (_) {
    // If /shared is not writable or protected, fall through to safe local shared
  }

  // 3. Fallback to ./shared in current working directory
  return path.resolve(process.cwd(), 'shared');
}

const baseRoot = resolveStorageRoot();

export const storageConfig: StorageConfig = {
  storageRoot: baseRoot,
  dataDir: process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(baseRoot, 'data', 'db'),
  uploadsDir: process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.join(baseRoot, 'uploads'),
  logsDir: process.env.LOGS_DIR ? path.resolve(process.env.LOGS_DIR) : path.join(baseRoot, 'logs'),
  backupsDir: process.env.BACKUPS_DIR ? path.resolve(process.env.BACKUPS_DIR) : path.join(baseRoot, 'backups'),
  secretsDir: process.env.SECRETS_DIR ? path.resolve(process.env.SECRETS_DIR) : path.join(baseRoot, 'secrets'),
  tempDir: process.env.TEMP_DIR ? path.resolve(process.env.TEMP_DIR) : path.join(baseRoot, 'tmp')
};

/**
 * Initializes and ensures all storage directories exist with safe filesystem permissions.
 */
export function ensureStorageDirectories(): { initialized: boolean; paths: StorageConfig; errors: string[] } {
  const errors: string[] = [];
  const dirs = [
    storageConfig.storageRoot,
    storageConfig.dataDir,
    storageConfig.uploadsDir,
    storageConfig.logsDir,
    storageConfig.backupsDir,
    storageConfig.secretsDir,
    storageConfig.tempDir
  ];

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      }
    } catch (err: any) {
      errors.push(`Failed to create directory "${dir}": ${err.message}`);
    }
  }

  return {
    initialized: errors.length === 0,
    paths: storageConfig,
    errors
  };
}

/**
 * Calculates directory usage and statistics without exposing sensitive contents.
 */
export function getStorageDirectoryStats(dirPath: string): { exists: boolean; fileCount: number; sizeBytes: number } {
  try {
    if (!fs.existsSync(dirPath)) {
      return { exists: false, fileCount: 0, sizeBytes: 0 };
    }

    let fileCount = 0;
    let sizeBytes = 0;

    function traverse(currentDir: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          traverse(full);
        } else if (entry.isFile()) {
          fileCount++;
          try {
            const stat = fs.statSync(full);
            sizeBytes += stat.size;
          } catch (_) {}
        }
      }
    }

    traverse(dirPath);
    return { exists: true, fileCount, sizeBytes };
  } catch (_) {
    return { exists: false, fileCount: 0, sizeBytes: 0 };
  }
}

/**
 * Safely inspects storage health for system diagnostics.
 */
export function getStorageHealthReport() {
  const isWritable = (dir: string): boolean => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const testFile = path.join(dir, `.test_write_${Date.now()}`);
      fs.writeFileSync(testFile, 'ok', 'utf8');
      fs.unlinkSync(testFile);
      return true;
    } catch (_) {
      return false;
    }
  };

  const dataStats = getStorageDirectoryStats(storageConfig.dataDir);
  const uploadsStats = getStorageDirectoryStats(storageConfig.uploadsDir);
  const logsStats = getStorageDirectoryStats(storageConfig.logsDir);
  const backupsStats = getStorageDirectoryStats(storageConfig.backupsDir);

  const allWritable =
    isWritable(storageConfig.dataDir) &&
    isWritable(storageConfig.uploadsDir) &&
    isWritable(storageConfig.logsDir) &&
    isWritable(storageConfig.backupsDir);

  return {
    status: allWritable ? 'healthy' : 'degraded',
    isIsolated: true,
    storageRoot: storageConfig.storageRoot,
    directories: {
      data: { ...dataStats, writable: isWritable(storageConfig.dataDir) },
      uploads: { ...uploadsStats, writable: isWritable(storageConfig.uploadsDir) },
      logs: { ...logsStats, writable: isWritable(storageConfig.logsDir) },
      backups: { ...backupsStats, writable: isWritable(storageConfig.backupsDir) },
      secrets: { exists: fs.existsSync(storageConfig.secretsDir), writable: isWritable(storageConfig.secretsDir) },
      temp: { exists: fs.existsSync(storageConfig.tempDir), writable: isWritable(storageConfig.tempDir) }
    },
    totalFiles: dataStats.fileCount + uploadsStats.fileCount + logsStats.fileCount + backupsStats.fileCount,
    totalSizeBytes: dataStats.sizeBytes + uploadsStats.sizeBytes + logsStats.sizeBytes + backupsStats.sizeBytes
  };
}

// Ensure base directories exist upon loading module
try {
  ensureStorageDirectories();
} catch (_) {}
