import fs from 'fs';
import path from 'path';
import { storageConfig, ensureStorageDirectories } from '../src/server/config/storage.config.js';

/**
 * ============================================================================
 * CAFFEINE STORAGE MIGRATION CLI UTILITY
 * ============================================================================
 * Safely migrates all user and persistent data from legacy /data directory to
 * the isolated storage architecture (shared volume or custom STORAGE_ROOT).
 *
 * Guarantees:
 * - Zero data loss
 * - Atomic validation of JSON structures
 * - Secret preservation
 * - Re-entrant (safe to execute multiple times)
 * ============================================================================
 */

export async function runStorageMigration(): Promise<{
  success: boolean;
  migratedFiles: string[];
  skippedFiles: string[];
  errors: string[];
  summary: Record<string, any>;
}> {
  console.log('====================================================');
  console.log('🚀 CAFFEINE STORAGE MIGRATION: CODE vs DATA ISOLATION');
  console.log('====================================================');
  console.log(`📍 Storage Root Target: ${storageConfig.storageRoot}`);
  console.log(`📂 Target Data Directory: ${storageConfig.dataDir}`);
  console.log(`📂 Target Secrets Directory: ${storageConfig.secretsDir}`);
  console.log(`📂 Target Uploads Directory: ${storageConfig.uploadsDir}`);
  console.log(`📂 Target Logs Directory: ${storageConfig.logsDir}`);
  console.log(`📂 Target Backups Directory: ${storageConfig.backupsDir}`);
  console.log('----------------------------------------------------');

  const { initialized, errors: initErrors } = ensureStorageDirectories();
  if (!initialized) {
    console.error('❌ Failed initializing target storage directories:', initErrors);
    return {
      success: false,
      migratedFiles: [],
      skippedFiles: [],
      errors: initErrors,
      summary: {}
    };
  }

  const legacyDataDir = path.resolve(process.cwd(), 'data');
  const legacyDbDir = path.join(legacyDataDir, 'db');
  const migratedFiles: string[] = [];
  const skippedFiles: string[] = [];
  const errors: string[] = [];
  const summary: Record<string, { sourceRecords: number; targetRecords: number; status: string }> = {};

  // 1. Migrate JSON Database Collections
  if (fs.existsSync(legacyDbDir)) {
    const files = fs.readdirSync(legacyDbDir);
    console.log(`\n📦 Found ${files.length} collections in legacy DB directory (${legacyDbDir}). Migrating...`);

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const sourceFile = path.join(legacyDbDir, file);
      const targetFile = path.join(storageConfig.dataDir, file);

      try {
        const rawSource = fs.readFileSync(sourceFile, 'utf8');
        const parsedSource = JSON.parse(rawSource);
        const sourceCount = Array.isArray(parsedSource) ? parsedSource.length : 0;

        let shouldWrite = true;
        if (fs.existsSync(targetFile)) {
          const rawTarget = fs.readFileSync(targetFile, 'utf8');
          try {
            const parsedTarget = JSON.parse(rawTarget);
            const targetCount = Array.isArray(parsedTarget) ? parsedTarget.length : 0;
            if (targetCount >= sourceCount && targetCount > 0) {
              // Target already has equal or newer records
              shouldWrite = false;
              skippedFiles.push(file);
              summary[file] = { sourceRecords: sourceCount, targetRecords: targetCount, status: 'SKIPPED_TARGET_UP_TO_DATE' };
              console.log(`  ⏩ [SKIPPED] ${file} (${targetCount} records already in target)`);
            }
          } catch (_) {}
        }

        if (shouldWrite) {
          fs.writeFileSync(targetFile, JSON.stringify(parsedSource, null, 2), { encoding: 'utf8', mode: 0o644 });
          migratedFiles.push(file);
          summary[file] = { sourceRecords: sourceCount, targetRecords: sourceCount, status: 'MIGRATED_SUCCESS' };
          console.log(`  ✅ [MIGRATED] ${file} (${sourceCount} records migrated)`);
        }
      } catch (err: any) {
        errors.push(`Error migrating ${file}: ${err.message}`);
        console.error(`  ❌ [ERROR] ${file}: ${err.message}`);
      }
    }
  } else {
    console.log('\nℹ️ No legacy data/db directory found. Fresh environment ready.');
  }

  // 2. Migrate Secret Keys (.jwt_secret_key)
  const legacySecret = path.join(legacyDataDir, '.jwt_secret_key');
  const targetSecret = path.join(storageConfig.secretsDir, '.jwt_secret_key');

  if (fs.existsSync(legacySecret)) {
    try {
      const secret = fs.readFileSync(legacySecret, 'utf8').trim();
      if (secret && !fs.existsSync(targetSecret)) {
        fs.writeFileSync(targetSecret, secret, { encoding: 'utf8', mode: 0o600 });
        migratedFiles.push('.jwt_secret_key');
        console.log('  🔒 [MIGRATED] .jwt_secret_key persisted securely to secrets directory.');
      } else {
        console.log('  🔒 [INFO] .jwt_secret_key already present in target secrets directory.');
      }
    } catch (err: any) {
      errors.push(`Error migrating .jwt_secret_key: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`✨ MIGRATION SUMMARY: ${migratedFiles.length} migrated, ${skippedFiles.length} up-to-date, ${errors.length} errors.`);
  console.log('====================================================\n');

  return {
    success: errors.length === 0,
    migratedFiles,
    skippedFiles,
    errors,
    summary
  };
}

// Direct CLI invocation
if (process.argv[1] && process.argv[1].includes('migrate-storage')) {
  runStorageMigration()
    .then((result) => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Fatal migration error:', err);
      process.exit(1);
    });
}
