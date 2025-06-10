const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Lista med tillåtna frontend URL:er
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://library-frontend-git-main-alexs-projects-6727ece4.vercel.app',
  'https://library-frontend-xybl.vercel.app',
  'https://library-frontend.vercel.app'
];

// CORS-konfiguration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); //curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn('❌ Blockerad CORS-origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions)); // aktivera CORS
app.use(express.json()); // parse application/json

// Loggning
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

// Preflight fix för Node v22
app.options(/^\/.*$/, cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reviews', reviewRoutes);

// Felhantering
app.use((err, req, res, next) => {
  console.error('❌ Serverfel:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Starta server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servern körs på port ${PORT}`);
  console.log('✅ Tillåtna origins:', allowedOrigins);
});
