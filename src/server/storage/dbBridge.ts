import { db as fileDb, fileDatabase, FileDatabase } from './fileDatabase.js';
import { postgresDb, postgresPool } from '../db/client.js';

export const dbBridge = fileDb;
export const db = fileDb;
export { fileDb, fileDatabase, FileDatabase, postgresDb, postgresPool };
