// seed.js
const db = require('./db');

async function seed() {
  await db.query(
    `INSERT INTO known_phishing_urls (url, domain, source, severity)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    ['https://phish-example.com/login','phish-example.com','seed','high']
  );
  console.log('seeded');
  process.exit(0);
}

seed().catch(e=>{console.error(e); process.exit(1);});
