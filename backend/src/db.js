// backend/src/db.js
require('dotenv').config();
const knex = require('knex');
const path = require('path');

// Use SQLite for local development if DB_USE_SQLITE is true or if PostgreSQL connection fails
const useSQLite = process.env.DB_USE_SQLITE === 'true' || !process.env.DB_HOST;

const db = knex(useSQLite ? {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '../../fraud-detection.db')
  },
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 5
  }
} : {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10
  }
});

console.log(`Database configured: ${useSQLite ? 'SQLite (local)' : 'PostgreSQL'}`);

module.exports = db;
