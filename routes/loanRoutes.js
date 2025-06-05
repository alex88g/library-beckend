const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const {
  getLoans,
  getUserLoans,
  createLoan,
  renewLoan,
  returnLoan
} = require('../controllers/loanController');

// Endast admin: Hämta alla lån
router.get('/', verifyToken, getLoans);

// Inloggad användare: Hämta sina egna lån
router.get('/user/:userId', verifyToken, getUserLoans);

// Endast user: Skapa nytt lån
router.post('/', verifyToken, createLoan);

// Förnya ett lån
router.put('/renew/:loanId', verifyToken, renewLoan);

// Tidig återlämning av lån
router.put('/return/:loanId', verifyToken, returnLoan);

module.exports = router;
