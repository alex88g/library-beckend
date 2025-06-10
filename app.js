const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Tillåtna domäner (kan även användas i fallback om regex inte räcker)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://library-frontend.vercel.app',
  'https://library-frontend-xybl.vercel.app',
  'https://library-frontend-git-main-alexs-projects-6727ece4.vercel.app',
  'https://library-frontend-bice.vercel.app'
];

// CORS-inställningar
const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.startsWith('http://localhost') ||
      /^https:\/\/library-frontend(-[\w-]+)?\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn('❌ Blockerad CORS-origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options(/^\/.*$/, cors(corsOptions)); // stöd för preflight i Node 22+
app.use(express.json());

// Test-route
app.get('/cors-test', (req, res) => {
  res.json({
    origin: req.headers.origin,
    message: '✅ CORS test route works!',
  });
});

// Logg för varje inkommande request
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

// API-routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reviews', reviewRoutes);

// Felfångare
app.use((err, req, res, next) => {
  console.error('❌ Fel:', err.stack);
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
  console.log('✅ Tillåtna origins:', allowedOrigins.join(', '));
});
