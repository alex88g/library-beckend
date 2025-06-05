require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const username = 'admin';
const email = 'admin@example.com';
const password = process.env.ADMIN_PASSWORD;
const role = 'admin';

const hash = bcrypt.hashSync(password, 10);

db.query(
  'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
  [username, hash, email, role],
  (err, result) => {
    if (err) {
      console.error('Fel vid skapande av admin:', err);
    } else {
      console.log('Admin skapad:', result);
    }
    process.exit();
  }
);
