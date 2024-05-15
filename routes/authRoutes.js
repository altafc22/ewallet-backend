const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authenticate = require("../middlewares/authenticateToken");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/logout", authenticate, authController.logoutUser);

module.exports = router;
