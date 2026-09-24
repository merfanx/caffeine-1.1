import fs from 'fs';
import path from 'path';
import { storageConfig } from '../config/storage.config.js';

/**
 * ============================================================================
 * CAFFEINE RESILIENT ATOMIC FILE DATABASE ENGINE
 * ============================================================================
 * Provides robust JSON-based document storage with atomic file writing,
 * automatic directory initialization, backup/restore support, and in-memory caching.
 * Persistent data is stored exclusively in the isolated storageConfig.dataDir directory.
 * ============================================================================
 */

export class FileDatabase {
  private dbDir: string;
  private cache: Map<string, any[]> = new Map();

  constructor(dbDir = storageConfig.dataDir) {
    this.dbDir = dbDir;
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.dbDir)) {
      try {
        fs.mkdirSync(this.dbDir, { recursive: true, mode: 0o755 });
      } catch (err) {
        console.warn('[FileDatabase] Could not create storage data directory:', err);
      }
    }
  }

  private getFilePath(collectionName: string): string {
    const safeName = collectionName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(this.dbDir, `${safeName}.json`);
  }

  private getLegacyFilePath(collectionName: string): string {
    const safeName = collectionName.replace(/[^a-zA-Z0-9_-]/g, '_');
    return path.join(process.cwd(), 'data', 'db', `${safeName}.json`);
  }

  private readRaw<T>(collectionName: string, defaultSeed?: T[]): T[] {
    if (this.cache.has(collectionName)) {
      return this.cache.get(collectionName) as T[];
    }

    const filePath = this.getFilePath(collectionName);
    
    // Check main persistent path first
    if (!fs.existsSync(filePath)) {
      // Fallback: Check legacy path for seamless zero-loss migration
      const legacyPath = this.getLegacyFilePath(collectionName);
      if (fs.existsSync(legacyPath)) {
        try {
          const rawLegacy = fs.readFileSync(legacyPath, 'utf-8');
          const parsed = JSON.parse(rawLegacy);
          if (Array.isArray(parsed)) {
            // Auto-persist to new storage directory
            this.writeRaw(collectionName, parsed);
            return parsed;
          }
        } catch (_) {}
      }

      if (defaultSeed && Array.isArray(defaultSeed) && defaultSeed.length > 0) {
        const seedCopy = [...defaultSeed];
        this.writeRaw(collectionName, seedCopy);
        return seedCopy;
      }
      this.cache.set(collectionName, []);
      return [];
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.cache.set(collectionName, parsed);
        return parsed;
      }
      this.cache.set(collectionName, []);
      return [];
    } catch (err) {
      console.warn(`[FileDatabase] Failed reading ${collectionName}.json, using seed/empty:`, err);
      const fallback = defaultSeed ? [...defaultSeed] : [];
      this.cache.set(collectionName, fallback);
      return fallback;
    }
  }

  private writeRaw<T>(collectionName: string, items: T[]): void {
    this.ensureDirectory();
    this.cache.set(collectionName, items);
    const filePath = this.getFilePath(collectionName);
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    const payload = JSON.stringify(items, null, 2);

    try {
      fs.writeFileSync(tempPath, payload, 'utf-8');
      fs.renameSync(tempPath, filePath);
    } catch (err) {
      console.error(`[FileDatabase] Failed writing ${collectionName}:`, err);
      // Fallback direct write
      try {
        fs.writeFileSync(filePath, payload, 'utf-8');
      } catch (e) {
        console.error(`[FileDatabase] Direct write also failed for ${collectionName}:`, e);
      }
    }
  }

  find<T>(collectionName: string, predicate?: (item: T) => boolean, defaultSeed?: T[]): T[] {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    if (!predicate) {
      return items;
    }
    return items.filter(predicate);
  }

  findOne<T>(collectionName: string, predicate: (item: T) => boolean, defaultSeed?: T[]): T | null {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    return items.find(predicate) || null;
  }

  findById<T extends { id?: string }>(collectionName: string, id: string, defaultSeed?: T[]): T | null {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    return items.find((it) => it.id === id) || null;
  }

  insert<T extends { id?: string }>(collectionName: string, item: T, defaultSeed?: T[]): T {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    const newItem = {
      ...item,
      id: item.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: (item as any).createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    this.writeRaw(collectionName, items);
    return newItem;
  }

  insertMany<T extends { id?: string }>(collectionName: string, newItems: T[], defaultSeed?: T[]): T[] {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    const inserted: T[] = [];

    for (const it of newItems) {
      const itemWithId = {
        ...it,
        id: it.id || `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        createdAt: (it as any).createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(itemWithId);
      inserted.push(itemWithId);
    }

    this.writeRaw(collectionName, items);
    return inserted;
  }

  update<T extends { id?: string }>(collectionName: string, id: string, updates: Partial<T>, defaultSeed?: T[]): T | null {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return null;

    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.writeRaw(collectionName, items);
    return items[idx];
  }

  upsert<T extends { id?: string; year?: number }>(collectionName: string, item: T, defaultSeed?: T[]): T {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    let idx = -1;
    if (item.id) {
      idx = items.findIndex((it) => it.id === item.id);
    } else if (item.year !== undefined) {
      idx = items.findIndex((it) => (it as any).year === item.year);
    }

    const saved = {
      ...item,
      id: item.id || (idx !== -1 ? items[idx].id : `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`),
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      items[idx] = { ...items[idx], ...saved };
    } else {
      (saved as any).createdAt = (saved as any).createdAt || new Date().toISOString();
      items.push(saved);
    }

    this.writeRaw(collectionName, items);
    return saved;
  }

  delete<T extends { id?: string }>(collectionName: string, id: string, defaultSeed?: T[]): boolean {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    const initialLen = items.length;
    const filtered = items.filter((it) => it.id !== id);
    if (filtered.length !== initialLen) {
      this.writeRaw(collectionName, filtered);
      return true;
    }
    return false;
  }

  deleteMany<T>(collectionName: string, predicate: (item: T) => boolean, defaultSeed?: T[]): number {
    const items = this.readRaw<T>(collectionName, defaultSeed);
    const remaining = items.filter((it) => !predicate(it));
    const deletedCount = items.length - remaining.length;
    if (deletedCount > 0) {
      this.writeRaw(collectionName, remaining);
    }
    return deletedCount;
  }

  count(collectionName: string): number {
    const items = this.readRaw<any>(collectionName);
    return items.length;
  }

  exportAll(): { version: string; exportedAt: string; collections: Record<string, any[]> } {
    this.ensureDirectory();
    const result: Record<string, any[]> = {};
    if (fs.existsSync(this.dbDir)) {
      const files = fs.readdirSync(this.dbDir);
      for (const f of files) {
        if (f.endsWith('.json')) {
          const colName = f.replace(/\.json$/, '');
          result[colName] = this.readRaw(colName);
        }
      }
    }
    return {
      version: '2.1.0',
      exportedAt: new Date().toISOString(),
      collections: result
    };
  }

  importAll(payload: { collections: Record<string, any[]> }): boolean {
    if (!payload || !payload.collections || typeof payload.collections !== 'object') {
      return false;
    }
    this.ensureDirectory();
    for (const [colName, list] of Object.entries(payload.collections)) {
      if (Array.isArray(list)) {
        this.writeRaw(colName, list);
      }
    }
    return true;
  }
}

export const fileDatabase = new FileDatabase();
export const fileDb = fileDatabase;
export const db = fileDatabase;
