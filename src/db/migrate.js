  const fs = require('fs');
  const path = require('path');
  const pool = require('./client');

  async function migrate() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const sql = fs.readFileSync(path.join(migrationsDir, file),     
  'utf8');
        await pool.query(sql);
        console.log(`Migration completed: ${file}`);
      }
    }
  }

  module.exports = migrate;