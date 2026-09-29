import fs from 'fs';
import path from 'path';
import { query } from './client';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    try {
      await query(sql);
      console.log(`✓ Migration: ${file}`);
    } catch (err) {
      console.error(`✗ Migration failed: ${file}`, err);
      throw err;
    }
  }

  console.log('All migrations completed');
}

export default runMigrations;
