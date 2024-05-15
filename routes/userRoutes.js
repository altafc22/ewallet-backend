const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middlewares/authenticateToken");

router.get("/profile", authenticate, userController.profile);
router.get("/:id", authenticate, userController.getUserByUserId);

module.exports = router;
