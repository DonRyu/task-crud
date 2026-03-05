import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      console.log(`Migration completed: ${file}`);
    }
  }
}

export default migrate;