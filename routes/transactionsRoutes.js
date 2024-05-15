const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionsController");
const authenticate = require("../middlewares/authenticateToken");

//router.post("/", authenticate, transactionController.createTransaction);
router.get("/", authenticate, transactionController.getAllTransactions);
router.get("/:id", authenticate, transactionController.getTransactionById);
router.patch("/:id", authenticate, transactionController.updateTransactionById);
router.delete(
  "/:id",
  authenticate,
  transactionController.deleteTransactionById
);
router.post("/recharge", authenticate, transactionController.rechargeWallet);
router.post("/topup", authenticate, transactionController.topup);

router.get(
  "/user/:id",
  authenticate,
  transactionController.getTransactionsByUserId
);

router.get(
  "/beneficiary/:id",
  authenticate,
  transactionController.getTransactionsByBeneficiaryId
);

module.exports = router;
