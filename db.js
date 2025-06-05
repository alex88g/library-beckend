// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

let connection;

const getConnection = async () => {
  if (!connection) {
    try {
      connection = await mysql.createConnection(process.env.DATABASE_URL);
      console.log("✅ Ansluten till MySQL via Railway");
    } catch (err) {
      console.error("❌ Kunde inte ansluta till databasen:", err.message);
      throw err;
    }
  }
  return connection;
};

module.exports = getConnection;
