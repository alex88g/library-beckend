const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Tillåt CORS från lokala och deployade klienter
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());

// API-routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reviews', reviewRoutes);

// Starta servern
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
