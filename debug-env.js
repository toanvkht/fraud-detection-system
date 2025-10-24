// debug-env.js
require('dotenv').config();
console.log('NODE CWD:', process.cwd());
console.log('DB_HOST       :', process.env.DB_HOST);
console.log('DB_PORT       :', process.env.DB_PORT);
console.log('DB_USER       :', process.env.DB_USER);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD   :', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_NAME       :', process.env.DB_NAME);
console.log('DB_SSL        :', process.env.DB_SSL);

