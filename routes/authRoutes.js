const express = require('express');
const router = express.Router();
const {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  deleteAccount,
  getProfile
} = require('../controllers/authController');

const verifyToken = require('../middleware/authMiddleware'); 


// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/request-reset
router.post('/request-reset', requestPasswordReset);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

// DELETE /api/auth/delete-account
router.delete('/delete-account', verifyToken, deleteAccount);

router.get('/me', verifyToken, getProfile);         


module.exports = router;
