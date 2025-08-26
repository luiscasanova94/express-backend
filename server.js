const express = require('express');
const { login, logout } = require('./auth'); 
const { authenticateToken } = require('./auth/middleware');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/login', login);

app.post('/logout', authenticateToken, logout); 

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username} (ID: ${req.user.id})` });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});