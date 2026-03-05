import 'dotenv/config';
import app from './app.js';
import migrate from './db/migrate.js';

const PORT = process.env.PORT || 3000;

async function start() {
  await migrate();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
