const express = require("express");
const router = express.Router();

const { register, logIn, logOut } = require("../controllers/authControllers");

router.post("/register", register);
router.post("/login", logIn);
router.get("/logout", logOut);

module.exports = router;
