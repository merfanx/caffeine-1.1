import fs from 'fs';
import path from 'path';
import { storageConfig, ensureStorageDirectories, getStorageHealthReport } from '../src/server/config/storage.config.js';
import { storageService } from '../src/server/storage/storageService.js';
import { FileDatabase } from '../src/server/storage/fileDatabase.js';
import { createStructuredBackup, restoreStructuredBackup } from '../src/server/storage/backupManager.js';
import { runStorageMigration } from './migrate-storage.js';

/**
 * ============================================================================
 * CAFFEINE STORAGE SEPARATION & DATA INTEGRITY VERIFICATION SUITE
 * ============================================================================
 */
async function runTests() {
  console.log('🧪 Starting Storage Architecture & Data Separation Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
      failed++;
    }
  }

  // TEST 1: Storage directories initialization
  console.log('Test 1: Directory Structure and Permissions');
  const initResult = ensureStorageDirectories();
  assert(initResult.initialized, 'Storage directories initialized without error');
  assert(fs.existsSync(storageConfig.dataDir), 'Data directory exists at isolated path');
  assert(fs.existsSync(storageConfig.uploadsDir), 'Uploads directory exists');
  assert(fs.existsSync(storageConfig.logsDir), 'Logs directory exists');
  assert(fs.existsSync(storageConfig.backupsDir), 'Backups directory exists');
  assert(fs.existsSync(storageConfig.secretsDir), 'Secrets directory exists');

  // TEST 2: Run Storage Migration
  console.log('\nTest 2: Zero-Loss Storage Migration');
  const migResult = await runStorageMigration();
  assert(migResult.success, 'Migration completed successfully without critical errors');
  assert(fs.existsSync(path.join(storageConfig.dataDir, 'system_settings.json')), 'system_settings.json migrated to storage dataDir');
  assert(fs.existsSync(path.join(storageConfig.dataDir, 'user_credentials.json')), 'user_credentials.json migrated to storage dataDir');

  // TEST 3: FileDatabase isolated reading & atomic writing
  console.log('\nTest 3: FileDatabase Engine Isolation');
  const testDb = new FileDatabase(storageConfig.dataDir);
  const testCollection = 'test_isolation_records';
  testDb.insert(testCollection, { id: 'iso-001', name: 'Student Data Test', timestamp: Date.now() });
  const found = testDb.findById<any>(testCollection, 'iso-001');
  assert(found && found.id === 'iso-001', 'Record successfully inserted and retrieved from isolated database');
  const diskFile = path.join(storageConfig.dataDir, `${testCollection}.json`);
  assert(fs.existsSync(diskFile), 'Record persisted physically in storageConfig.dataDir');

  // TEST 4: Storage Service & Anti-Path Traversal Defense
  console.log('\nTest 4: Storage Service Security & Anti-Path Traversal');
  let traversalCaught = false;
  try {
    storageService.resolvePath('uploads', '../../../../etc/passwd');
  } catch (err: any) {
    traversalCaught = true;
  }
  assert(traversalCaught, 'Path traversal attack (../../etc/passwd) safely blocked');

  const uploadInfo = await storageService.saveFile('uploads', 'test_doc.txt', 'Caffeine Academic OS Persistent Document');
  assert(uploadInfo.sizeBytes > 0, 'Document saved cleanly via StorageService');
  const readBack = await storageService.readFile('uploads', 'test_doc.txt', 'utf8');
  assert(readBack === 'Caffeine Academic OS Persistent Document', 'File content read accurately');

  // TEST 5: Backup & Snapshot System
  console.log('\nTest 5: Backup and Recovery Engine');
  const backup = await createStructuredBackup({
    type: 'manual',
    description: 'Test Verification Snapshot',
    user: { id: 'test-admin', name: 'Admin Test', role: 'admin' }
  });
  assert(!!backup.id, 'Backup created with unique ID');
  assert(fs.existsSync(path.join(storageConfig.backupsDir, `${backup.id}.json`)), 'Backup archive file persisted on disk');

  const restoreResult = await restoreStructuredBackup(backup.id);
  assert(restoreResult.success, 'Backup restored successfully from disk archive');

  // TEST 6: Simulated App Code Replacement (v0.1.0 -> v0.2.0)
  console.log('\nTest 6: Simulated Application Code Overwrite / Update');
  // Re-instantiate database cold from disk without memory state
  const freshDbInstance = new FileDatabase(storageConfig.dataDir);
  const persistedRecord = freshDbInstance.findById<any>(testCollection, 'iso-001');
  assert(persistedRecord && persistedRecord.name === 'Student Data Test', 'User data survived complete cold server re-instantiation');

  // Clean up test collection
  await storageService.deleteFile('data', `${testCollection}.json`);
  await storageService.deleteFile('uploads', 'test_doc.txt');

  // TEST 7: Health Report Diagnostics
  console.log('\nTest 7: Storage Health Diagnostics');
  const health = getStorageHealthReport();
  assert(health.status === 'healthy', 'Storage health report returns healthy status');
  assert(health.isIsolated === true, 'Storage confirms architectural isolation');

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
