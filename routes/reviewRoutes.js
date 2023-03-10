const express = require("express");
const router = express.Router();

const {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
} = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/full-auth");

router.route("/").get(getAllReviews).post(authenticateUser, createReview);
router
	.route("/:id")
	.get(getSingleReview)
	.patch(authenticateUser, updateReview)
	.delete(authenticateUser, deleteReview);

module.exports = router;
