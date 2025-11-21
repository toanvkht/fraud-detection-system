// backend/src/seed.js (add at top)
const { Pool } = require('pg');
const pool = new Pool(); // uses process.env.* from .env

async function showConnectionInfo(client) {
  const res = await client.query('SELECT current_database() AS db, current_schema() AS schema, current_user AS user;');
  console.log('DB connection info:', res.rows[0]);
}

async function seed() {
  const client = await pool.connect();
  try {
    await showConnectionInfo(client);
    // existing seed logic...
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

