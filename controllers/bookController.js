const db = require('../db');

// Hämta alla böcker med vem som lånat boken (borrowedBy)
exports.getBooks = (req, res) => {
  const sql = `
    SELECT 
      books.id,
      books.title,
      books.author,
      DATE(books.publishedDate) AS publishedDate, -- Endast datum
      books.description,
      books.isbn,
      books.publisher,
      books.genre,
      books.language,
      books.pages,
      books.coverUrl,
      books.loanPrice,
      books.format,
      books.location,
      books.availability,
      books.createdBy,
      books.updatedAt,
      users.username AS borrowedBy
    FROM books
    LEFT JOIN loans ON books.id = loans.bookId AND loans.returnedAt IS NULL
    LEFT JOIN users ON loans.userId = users.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};




// Lägg till en ny bok
exports.createBook = (req, res) => {
  const {
    title,
    author,
    publishedDate,
    description,
    isbn,
    publisher,
    genre,
    language,
    pages,
    coverUrl,
    loanPrice,
    format,
    location,
    availability,
    createdBy,
  } = req.body;

  if (!title || !author || !publishedDate || !description || !isbn) {
    return res.status(400).json({ message: 'Obligatoriska fält saknas' });
  }

  const sql = `
    INSERT INTO books (
      title, author, publishedDate, description, isbn, publisher,
      genre, language, pages, coverUrl, loanPrice, format, location,
      availability, createdBy, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    title,
    author,
    publishedDate,
    description,
    isbn,
    publisher || null,
    genre || null,
    language || null,
    pages || null,
    coverUrl || null,
    loanPrice || 0.00,
    format || null,
    location || null,
    availability || 'tillgänglig',
    createdBy || null
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);
    res.status(201).json({ message: 'Bok tillagd' });
  });
};


// Uppdatera en befintlig bok
exports.updateBook = (req, res) => {
  const { id } = req.params;
  const {
    title,
    author,
    publishedDate,
    description,
    isbn,
    publisher,
    genre,
    language,
    pages,
    coverUrl,       
    loanPrice,
    format,
    location,
    availability,
    createdBy,
  } = req.body;

  const sql = `
    UPDATE books SET
      title = ?, author = ?, publishedDate = ?, description = ?, isbn = ?,
      publisher = ?, genre = ?, language = ?, pages = ?, coverUrl = ?,
      loanPrice = ?, format = ?, location = ?, availability = ?,createdBy =?, updatedAt = NOW()
    WHERE id = ?
  `;

  const values = [
    title,
    author,
    publishedDate,
    description,
    isbn,
    publisher,
    genre,
    language,
    pages,
    coverUrl,
    loanPrice || 0.00,
    format,
    location,
    availability,
    createdBy,
    id
  ];

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Bok uppdaterad med pris' });
  });
};

// Radera en bok
exports.deleteBook = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM books WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Bok raderad' });
  });
};
