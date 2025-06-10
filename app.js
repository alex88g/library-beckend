const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// ✅ Tillåt både lokal och Vercel-frontend i CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://library-frontend-git-main-alexs-projects-6727ece4.vercel.app',
  'https://library-frontend-xybl.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
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
