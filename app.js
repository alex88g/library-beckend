const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Tillåtna domäner
const allowedOrigins = [
  'http://localhost:5173',
  'https://library-frontend.vercel.app',
  'https://library-frontend-xybl.vercel.app',
  'https://library-frontend-git-main-alexs-projects-6727ece4.vercel.app',
  'https://library-frontend-bice.vercel.app'
];

// CORS-config
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

// 1. Preflight-fix först
app.options("*", cors(corsOptions));

// 2. CORS middleware
app.use(cors(corsOptions));

// 3. Extra headers om Railway buggar
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (origin.startsWith("http://localhost") ||
      /^https:\/\/library-frontend(-[\w-]+)?\.vercel\.app$/.test(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  next();
});

// Övrigt
app.use(express.json());

app.get('/cors-test', (req, res) => {
  res.json({ message: '✅ CORS fungerar!', origin: req.headers.origin });
});

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reviews', reviewRoutes);

// Error hantering
app.use((err, req, res, next) => {
  console.error('❌ Fel:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Serverstart
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servern kör på port ${PORT}`);
  console.log('✅ Origins:', allowedOrigins.join(', '));
});
