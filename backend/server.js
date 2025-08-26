const express = require('express');
const cors = require('cors'); 
const { login, logout } = require('./auth'); 
const { authenticateToken } = require('./auth/middleware');
const searchHistoryController = require('./controllers/searchHistoryController'); // Import the new controller
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/login', login);
app.post('/logout', authenticateToken, logout); 

app.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username} (ID: ${req.user.id})` });
});

app.post('/history', authenticateToken, searchHistoryController.createSearchHistory);
app.get('/history', authenticateToken, searchHistoryController.getAllSearchHistory);
app.get('/history/:id', authenticateToken, searchHistoryController.getSearchHistoryById);
app.put('/history/:id', authenticateToken, searchHistoryController.updateSearchHistory);
app.delete('/history/:id', authenticateToken, searchHistoryController.deleteSearchHistory);


app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
});