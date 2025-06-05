require("dotenv").config();
const db = require("./db");

const run = async () => {
  const queries = [
    `DROP TABLE IF EXISTS reviews`,
    `DROP TABLE IF EXISTS loans`,
    `DROP TABLE IF EXISTS books`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      resetToken VARCHAR(255),
      resetTokenExpires DATETIME
    )`,
    `CREATE TABLE books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      publishedDate DATE,
      description TEXT,
      isbn VARCHAR(20) UNIQUE,
      publisher VARCHAR(255),
      genre VARCHAR(100),
      language VARCHAR(50),
      pages INT,
      coverUrl TEXT,
      loanPrice DECIMAL(6,2) DEFAULT 0.00,
      availability ENUM('tillgänglig', 'utlånad', 'reserverad') DEFAULT 'tillgänglig',
      format ENUM('inbunden', 'pocket', 'e-bok', 'ljudbok') DEFAULT 'inbunden',
      location VARCHAR(100),
      createdBy INT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE loans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      bookId INT NOT NULL,
      loanDate DATE NOT NULL,
      dueDate DATE,
      renewedAt DATE,
      returnedAt DATE,
      price DECIMAL(6,2),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bookId INT NOT NULL,
      userId INT NOT NULL,
      rating INT CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `INSERT INTO users (username, password, email, role)
     VALUES ('admin', '$2a$10$A2jkIUyoIduXcd3mEf1uceTQ.lB2F4yk4H5ZnaZtrLBQPg1a1m.kK', 'admin@example.com', 'admin')`
  ];

  let conn;
  try {
    conn = await db.getConnection();
    for (const query of queries) {
      console.log("Kör SQL-fråga...");
      await conn.query(query);
    }
    console.log("Alla tabeller skapade och testdata inlagd!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (conn) conn.release();
    await db.end();
  }
};

run();
