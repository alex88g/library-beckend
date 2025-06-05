const db = require('../db');

// Admin: Hämta alla lån
exports.getLoans = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied – Admin only' });
  }

  db.query('SELECT * FROM loans', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// User: Hämta sina lån
// Hämta alla lån för en specifik användare, inklusive bokinfo
exports.getUserLoans = (req, res) => {
  const userId = parseInt(req.params.userId);
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ message: 'Access denied – Not your loans' });
  }

  const sql = `
  SELECT loans.*, 
         books.title, 
         books.coverUrl, 
         books.description, 
         books.author, 
         books.genre, 
         books.loanPrice
  FROM loans
  JOIN books ON loans.bookId = books.id
  WHERE loans.userId = ? AND loans.returnedAt IS NULL
  ORDER BY loans.dueDate ASC
`;


  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};


// User: Skapa nytt lån
exports.createLoan = (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can borrow books' });
  }

  const userId = req.user.id;
  const { bookId, durationDays } = req.body;
  const loanPeriod = Math.min(parseInt(durationDays), 30) || 14;

  db.query('SELECT availability FROM books WHERE id = ?', [bookId], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'Book not found' });
    if (results[0].availability !== 'tillgänglig') return res.status(400).json({ message: 'Book is not available' });

    db.query(
      'INSERT INTO loans (userId, bookId, loanDate, dueDate) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))',
      [userId, bookId, loanPeriod],
      (err) => {
        if (err) return res.status(500).json(err);

        db.query('UPDATE books SET availability = "utlånad" WHERE id = ?', [bookId], (err) => {
          if (err) return res.status(500).json(err);
          res.status(201).json({ message: 'Book successfully loaned' });
        });
      }
    );
  });
};

// User: Förnya lån
exports.renewLoan = (req, res) => {
  const loanId = parseInt(req.params.loanId);
  const extensionDays = 14;

  db.query(
    'UPDATE loans SET dueDate = DATE_ADD(dueDate, INTERVAL ? DAY), renewedAt = CURDATE() WHERE id = ?',
    [extensionDays, loanId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: `Loan renewed by ${extensionDays} days.` });
    }
  );
};

// User: Återlämna tidigt
exports.returnLoan = (req, res) => {
  const loanId = parseInt(req.params.loanId);

  db.query('SELECT bookId FROM loans WHERE id = ?', [loanId], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: 'Loan not found' });

    const bookId = results[0].bookId;

    db.query(
      'UPDATE loans SET returnedAt = CURDATE() WHERE id = ?',
      [loanId],
      (err) => {
        if (err) return res.status(500).json(err);

        db.query('UPDATE books SET availability = "tillgänglig" WHERE id = ?', [bookId], (err) => {
          if (err) return res.status(500).json(err);
          res.json({ message: 'Book returned early' });
        });
      }
    );
  });
};
