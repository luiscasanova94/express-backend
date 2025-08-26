const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('./index'); 
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ message: 'Token has been invalidated. Please log in again.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };