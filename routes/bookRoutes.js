const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { getBooks, createBook, updateBook, deleteBook } = require('../controllers/bookController');

router.get('/', getBooks);
router.post('/', verifyToken, createBook);
router.put('/:id', verifyToken, updateBook);
router.delete('/:id', verifyToken, deleteBook);

module.exports = router;