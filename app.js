const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Uppdaterad lista med tillåtna origin-domäner
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://library-frontend-git-main-alexs-projects-6727ece4.vercel.app',
  'https://library-frontend-xybl.vercel.app',
  'https://library-frontend.vercel.app' // Lägg till alla varianter av din frontend-URL
];

// Förbättrad CORS-konfiguration
const corsOptions = {
  origin: function (origin, callback) {
    // Tillåt requests utan origin (t.ex. Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blockerad CORS-origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Använd CORS-middleware
app.use(cors(corsOptions));

// Hantera preflight requests för alla routes
app.options(/^\/.*$/, cors(corsOptions));

// Middleware för att logga inkommande requests
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path} from ${req.headers.origin}`);
  next();
});

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reviews', reviewRoutes);

// Felhanteringsmiddleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 hantering
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log('Tillåtna origins:', allowedOrigins);
});