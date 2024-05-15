const express = require("express");
const router = express.Router();
const beneficiaryController = require("../controllers/beneficiaryController");
const authenticateToken = require("../middlewares/authenticateToken");

router.post("/", authenticateToken, beneficiaryController.createBeneficiary);
router.get("/", authenticateToken, beneficiaryController.getAllBeneficiaries);
router.get("/:id", authenticateToken, beneficiaryController.getBeneficiaryById);
router.put(
  "/:id",
  authenticateToken,
  beneficiaryController.updateBeneficiaryById
);
router.delete(
  "/:id",
  authenticateToken,
  beneficiaryController.deleteBeneficiaryById
);

module.exports = router;
