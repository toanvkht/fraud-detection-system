const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;


function authMiddleware(req, res, next) {
const authHeader = req.headers.authorization;
if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
const token = authHeader.split(' ')[1];
if (!token) return res.status(401).json({ error: 'Invalid authorization header' });


try {
const payload = jwt.verify(token, jwtSecret);
req.user = payload;
next();
} catch (err) {
return res.status(401).json({ error: 'Invalid token' });
}
}


module.exports = authMiddleware;