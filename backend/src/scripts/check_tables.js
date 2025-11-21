 const path = require('path');
 const db = require(path.join(__dirname, '..', 'src', 'db'));
 (async () => {
 try {
 const exists = await db.schema.hasTable('known_phishing_urls');
 console.log('known_phishing_urls exists?', exists);
 const tables = await db.raw(`SELECT tablename FROM pg_catalog.pg_tables 
WHERE schemaname='public'`);
 console.log('public tables:', tables.rows.map(r => r.tablename));
 } catch (err) {
 console.error(err);
 } finally {
 await db.destroy();
 }
 })();