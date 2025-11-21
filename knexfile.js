// knexfile.js
require('dotenv').config();
const path = require('path');

const useSQLite = process.env.DB_USE_SQLITE === 'true' || !process.env.DB_HOST;

module.exports = {
  development: useSQLite ? {
    client: 'sqlite3',
    connection: {
      filename: path.join(__dirname, 'fraud-detection.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  } : {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    pool: { min: 2, max: 10 },
    seeds: {
      directory: './seeds'
    }
  }
};
