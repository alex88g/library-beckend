const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initiera Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// REGISTER
exports.register = (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Username, password and email are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hash, email, 'user'],
      async (err2) => {
        if (err2) return res.status(500).json({ message: 'Database error', error: err2 });

        // Skicka välkomstmail via Brevo
        try {
          await emailApi.sendTransacEmail({
            sender: { name: "BookMate", email: process.env.EMAIL_USER },
            to: [{ email }],
            subject: "Welcome to BookMate!",
            htmlContent: `<p>Hi ${username},</p><p>Welcome to BookMate! Your account has been created successfully.</p>`
          });
        } catch (emailErr) {
          console.error("Brevo registration email failed:", emailErr);
        }

        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};

// LOGIN
exports.login = (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = results[0];
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) return res.status(403).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { id, username: name, role } = user;
    res.json({ token, user: { id, username: name, role } });
  });
};

// REQUEST PASSWORD RESET
exports.requestPasswordReset = (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 hour

  db.query(
    'UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?',
    [token, expires, email],
    async (err, result) => {
      if (err || result.affectedRows === 0)
        return res.status(400).json({ message: 'Email not found' });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      try {
        await emailApi.sendTransacEmail({
          sender: { name: "BookMate", email: process.env.EMAIL_USER },
          to: [{ email }],
          subject: "Reset your password",
          htmlContent: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
        });

        res.json({ message: 'Reset email sent successfully via Brevo' });
      } catch (emailErr) {
        console.error("Brevo reset email failed:", emailErr);
        res.status(500).json({ message: 'Error sending reset email', error: emailErr });
      }
    }
  );
};

// RESET PASSWORD
exports.resetPassword = (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  db.query(
    'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > NOW()',
    [token],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(400).json({ message: 'Invalid or expired token' });

      const hash = bcrypt.hashSync(newPassword, 10);
      db.query(
        'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE id = ?',
        [hash, results[0].id],
        (err2) => {
          if (err2) return res.status(500).json({ message: 'Failed to reset password' });
          res.json({ message: 'Password updated successfully' });
        }
      );
    }
  );
};

// DELETE ACCOUNT
exports.deleteAccount = (req, res) => {
  const userId = req.user.id;

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Fel vid borttagning av användare:', err);
      return res.status(500).json({ message: 'Kunde inte ta bort konto' });
    }

    res.json({ message: 'Kontot har raderats' });
  });
};

exports.getProfile = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT id, username, email, role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "User not found" });
    res.json({ user: results[0] });
  });
};

exports.deleteAccount = (req, res) => {
  const userId = req.user.id;
  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting account" });
    res.json({ message: "Account deleted" });
  });
};
