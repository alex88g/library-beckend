const db = require('../db');

// Skapa recension
exports.createReview = (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole === 'admin') {
    return res.status(403).json({ error: "Admin får inte lämna recensioner." });
  }

  if (!bookId || !rating || !comment) {
    return res.status(400).json({ error: "Alla fält krävs." });
  }

  const sql = `
    INSERT INTO reviews (bookId, userId, rating, comment)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [bookId, userId, rating, comment], (err, result) => {
    if (err) return res.status(500).json({ error: "Fel vid sparning." });
    res.status(201).json({ message: "Recension skapad!", reviewId: result.insertId });
  });
};


// Hämta alla recensioner för en bok
exports.getReviewsByBookId = (req, res) => {
  const bookId = req.params.bookId;
  const sql = `
    SELECT r.id, r.bookId, r.userId, r.rating, r.comment, r.createdAt, r.updatedAt, u.username
    FROM reviews r
    JOIN users u ON r.userId = u.id
    WHERE r.bookId = ?
    ORDER BY r.createdAt DESC
  `;

  db.query(sql, [bookId], (err, results) => {
    if (err) return res.status(500).json({ error: "Fel vid hämtning." });
    res.json(results);
  });
};


// Uppdatera recension
exports.updateReview = (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const sql = `
    UPDATE reviews
    SET rating = ?, comment = ?
    WHERE id = ? AND userId = ?
  `;

  db.query(sql, [rating, comment, id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Fel vid uppdatering." });
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Ingen åtkomst." });
    }
    res.json({ message: "Recension uppdaterad." });
  });
};

// Radera recension
exports.deleteReview = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = `DELETE FROM reviews WHERE id = ? AND userId = ?`;
  db.query(sql, [id, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Fel vid radering." });
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Ingen åtkomst." });
    }
    res.json({ message: "Recension raderad." });
  });
};