const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');


const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';


exports.signup = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { email, password, name } = req.body;
try {
const existing = await db('users').where({ email }).first();
if (existing) return res.status(400).json({ error: 'Email already registered' });


const password_hash = await bcrypt.hash(password, 10);
// Use email as username if not provided, or derive from email
const username = email.split('@')[0];
const [result] = await db('users').insert({ username, email, password_hash, name }).returning('id');
// SQLite returns {id: 1}, PostgreSQL returns 1, so normalize it
const userId = typeof result === 'object' ? result.id : result;


const token = jwt.sign({ id: userId, email }, jwtSecret, { expiresIn: jwtExpiresIn });
res.json({ token, user: { id: userId, email, name } });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
};


exports.login = async (req, res) => {
const errors = validationResult(req);
if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


const { email, password } = req.body;
try {
const user = await db('users').where({ email }).first();
if (!user) return res.status(400).json({ error: 'Invalid credentials' });


const ok = await bcrypt.compare(password, user.password_hash);
if (!ok) return res.status(400).json({ error: 'Invalid credentials' });


const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
};