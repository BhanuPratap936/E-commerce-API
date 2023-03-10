const express = require("express");
const router = express.Router();

const {
	getAllProducts,
	createProduct,
	getSingleProduct,
	updateProduct,
	deleteProduct,
	uploadImage,
} = require("../controllers/productController");

const { getSingleProductReviews } = require("../controllers/reviewController");
const {
	authenticateUser,
	authorizedPermission,
} = require("../middleware/full-auth");

router
	.route("/")
	.get(getAllProducts)
	.post([authenticateUser, authorizedPermission("admin")], createProduct);

router
	.route("/uploadImage")
	.post([authenticateUser, authorizedPermission("admin")], uploadImage);

router
	.route("/:id")
	.get(getSingleProduct)
	.patch([authenticateUser, authorizedPermission("admin")], updateProduct)
	.delete([authenticateUser, authorizedPermission("admin")], deleteProduct);

router.route("/:id/reviews").get(getSingleProductReviews);

module.exports = router;
