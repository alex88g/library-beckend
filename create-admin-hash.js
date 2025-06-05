require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const username = 'admin';
const email = 'admin@example.com';
const password = process.env.ADMIN_PASSWORD;
const role = 'admin';

if (!password) {
  console.error('❌ ADMIN_PASSWORD saknas i .env');
  process.exit();
}

const hash = bcrypt.hashSync(password, 10);

db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
  if (err) {
    console.error('❌ Fel vid kontroll av användare:', err);
    process.exit();
  }

  if (results.length > 0) {
    // Användaren finns – uppdatera lösenord
    db.query(
      'UPDATE users SET password = ?, email = ?, role = ? WHERE username = ?',
      [hash, email, role, username],
      (err) => {
        if (err) {
          console.error('❌ Fel vid uppdatering:', err);
        } else {
          console.log('🔁 Lösenordet för admin uppdaterat.');
        }
        process.exit();
      }
    );
  } else {
    // Skapa ny admin
    db.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      [username, hash, email, role],
      (err) => {
        if (err) {
          console.error('❌ Fel vid skapande av admin:', err);
        } else {
          console.log('✅ Ny admin skapad.');
        }
        process.exit();
      }
    );
  }
});
