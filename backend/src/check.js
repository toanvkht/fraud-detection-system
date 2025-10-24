// backend/src/check.js - simplified
const express = require('express');
const db = require('./db');
const router = express.Router();

router.post('/check', async (req,res) => {
  const { url } = req.body;
  if(!url) return res.status(400).json({error:'missing url'});
  // naive domain extraction for demo
  const domain = (new URL(url.includes('://') ? url : 'http://'+url)).hostname;
  // query known_phishing
  const { rows } = await db.query('SELECT * FROM known_phishing_urls WHERE domain = $1 LIMIT 10', [domain]);
  res.json({ url, domain, knownMatches: rows });
});

module.exports = router;
