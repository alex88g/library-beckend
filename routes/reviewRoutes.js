const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");

// Skapa recension (kräver inloggning)
router.post("/", verifyToken, reviewController.createReview);

// Hämta alla recensioner för en bok
router.get("/book/:bookId", reviewController.getReviewsByBookId);

// Uppdatera en recension (kräver inloggning)
router.put("/:id", verifyToken, reviewController.updateReview);

// Radera en recension (kräver inloggning)
router.delete("/:id", verifyToken, reviewController.deleteReview);

module.exports = router;
