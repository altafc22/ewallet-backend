const Transaction = require("../models/Transaction");
const moment = require("moment");
moment.suppressDeprecationWarnings = true;
const userController = require("../controllers/userController");
const beneficiaryController = require("../controllers/beneficiaryController");

const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json({
      status: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

// const getAllTransactions = async (req, res) => {
//   try {
//     const transactions = await Transaction.find().sort({ createdAt: -1 });
//     res.json({ status: true, message: "Success", transactions });
//   } catch (error) {
//     res.status(500).json({ status: false, message: error.message });
//   }
// };

const getAllTransactions = async (req, res) => {
  try {
    const userID = req.user._id; //to fetch only current user transactions
    console.log("getAllTransactions " + userID);
    const transactions = await Transaction.find({ userID })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "userID",
        select: "name",
        model: "User",
      })
      .populate({
        path: "beneficiaryID",
        select: "nickname",
        model: "Beneficiary",
      });
    res.json({ status: true, message: "Success", transactions });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).sort({
      createdAt: -1,
    });
    if (!transaction) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }
    res.json({ status: true, message: "Success", transaction });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const updateTransactionById = async (req, res) => {
  if (req.body.transactionType != null) {
    res.transaction.transactionType = req.body.transactionType;
  }
  if (req.body.description != null) {
    res.transaction.description = req.body.description;
  }
  if (req.body.transactionAmount != null) {
    res.transaction.transactionAmount = req.body.transactionAmount;
  }
  if (req.body.transactionFee != null) {
    res.transaction.transactionFee = req.body.transactionFee;
  }
  if (req.body.totalAmount != null) {
    res.transaction.totalAmount = req.body.totalAmount;
  } else {
    var amount = req.body.transactionAmount;
    var fee = req.body.transactionFee;
    res.transaction.totalAmount = amount + fee;
  }
  if (req.body.transactionStatus != null) {
    res.transaction.transactionStatus = req.body.transactionStatus;
  }
  try {
    const updatedTransaction = await res.transaction.save();
    res.json({
      status: true,
      message: "Transaction updated successfully",
      updatedTransaction,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

const deleteTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }
    res.json({ status: true, message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const rechargeWallet = async (req, res) => {
  try {
    const userId = req.user._id;

    const transaction = new Transaction({
      userID: userId,
      transactionType: "Credit",
      transactionCategory: "Wallet Recharge",
      description: req.body.description,
      transactionAmount: req.body.amount,
      transactionFee: 0,
      totalAmount: req.body.amount,
      transactionStatus: "Success",
      createdAt: new Date(),
    });

    // Save transaction
    const transactionData = await transaction.save();
    await Transaction.populate(transactionData, [
      { path: "userID", select: "name", model: "User" },
      {
        path: "beneficiaryID",
        select: ["nickname", "phoneNumber"],
        model: "Beneficiary",
      },
    ]);

    const userData = await userController.credit(userId, req.body.amount);
    res.status(201).json({
      status: true,
      transaction: transactionData,
      balance: userData.balance,
      message: "Wallet recharged successfully",
    });
  } catch (error) {
    console.log(error.t);
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (error) => error.message
      );
      return res
        .status(400)
        .json({ status: false, message: errorMessages.join(", ") });
    }

    res.status(400).json({ status: false, message: error.message });
  }
};

const topup = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const { beneficiaryId, amount } = req.body;

    const fee = 1;
    const totalAmount = amount + fee;

    const validated = await validateTopupTransaction(
      user,
      beneficiaryId,
      totalAmount
    );
    console.log(`transaction validated:${validated}`);

    const transaction = new Transaction({
      userID: userId,
      beneficiaryID: beneficiaryId,
      transactionType: "Debit",
      transactionCategory: "TopUp",
      transactionAmount: amount,
      transactionFee: fee,
      totalAmount: totalAmount,
      transactionStatus: "Success",
      createdAt: new Date(),
    });

    const transactionData = await transaction.save();
    await Transaction.populate(transactionData, [
      { path: "userID", select: "name", model: "User" },
      {
        path: "beneficiaryID",
        select: ["nickname", "phoneNumber"],
        model: "Beneficiary",
      },
    ]);

    const userData = await userController.debit(userId, totalAmount);

    const beneficiaryData = await beneficiaryController.credit(
      beneficiaryId,
      amount
    );

    res.status(201).json({
      status: true,
      message: "Top-up successful",

      transaction: transactionData,
      walletBalance: userData.balance,
      balance: beneficiaryData.balance,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (error) => error.message
      );
      return res
        .status(400)
        .json({ status: false, message: errorMessages.join(", ") });
    }

    res.status(400).json({ status: false, message: error.message });
  }
};

const getTransactionsByUserId = async (req, res) => {
  const userId = req.params.id;
  console.log(`User ID: ${userId}`);
  try {
    const transactions = await Transaction.find({ userID: userId }).sort({
      createdAt: -1,
    });
    if (!transactions) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }
    res.json({ status: true, message: "Success", transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getTransactionsByBeneficiaryId = async (req, res) => {
  const id = req.params.id;

  try {
    const transactions = await Transaction.find({ beneficiaryID: id })
      .sort({
        createdAt: -1,
      })
      .exec();
    await Transaction.populate(transactions, [
      { path: "userID", select: "name", model: "User" },
      {
        path: "beneficiaryID",
        select: ["nickname", "phoneNumber"],
        model: "Beneficiary",
      },
    ]);

    if (!transactions) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }
    res.json({ status: true, message: "Success", transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateTopupTransaction = async (user, beneficiaryId, amount) => {
  console.log(`amount: ${amount}`);

  // Step 1: Fetch top-up transactions made by the current user in the current month
  const currentDate = moment();
  const currentMonth = currentDate.month() + 1;
  const currentYear = currentDate.year();

  const monthStart = moment(`${currentYear}-${currentMonth}-01`).startOf(
    "month"
  );
  const monthEnd = moment(`${currentYear}-${currentMonth}-01`).endOf("month");

  if (amount > user.balance) {
    throw new Error("You don't have enough balance in your wallet.");
  }

  const userTopupTransactions = await Transaction.find({
    userID: user._id,
    transactionCategory: "TopUp",
    createdAt: { $gte: monthStart.toDate(), $lte: monthEnd.toDate() },
  }).sort({ createdAt: -1 });

  // Step 2: Calculate total top-up amount done in this month by the user
  const totalTopupAmountThisMonth = userTopupTransactions.reduce(
    (total, transaction) => total + transaction.totalAmount,
    0
  );

  console.log(`totalTopupAmountThisMonth: ${totalTopupAmountThisMonth}`);

  // Step 3: Remaining total monthly topup limit
  const remainingTopupAmount = 3000 - totalTopupAmountThisMonth;
  console.log(`remainingTopupAmount: ${remainingTopupAmount}`);

  if (amount > remainingTopupAmount) {
    throw new Error("Exceeds maximum total top-up limit\nMonthly limit: 3000");
  }

  // Step 4: Remaining beneficiary topup limit
  const beneficiaryTransactions = userTopupTransactions.filter((transaction) =>
    transaction.beneficiaryID.equals(beneficiaryId)
  );
  const beneficiaryTotalTopup = beneficiaryTransactions.reduce(
    (total, transaction) => total + transaction.totalAmount,
    0
  );

  const beneficiaryMonthlyTopupLimit = user.isVerified ? 500 : 1000;
  console.log(`beneficiaryMonthlyTopupLimit: ${beneficiaryMonthlyTopupLimit}`);

  const beneficiaryRemainingAmount =
    beneficiaryMonthlyTopupLimit - beneficiaryTotalTopup;
  console.log(`beneficiaryRemainingAmount: ${beneficiaryRemainingAmount}`);

  if (amount > beneficiaryRemainingAmount) {
    throw new Error(
      `Exceeds beneficiary's top-up limit\nMonthly limit: ${beneficiaryMonthlyTopupLimit}`
    );
  }

  /*console.log({
    totalTopupAmountThisMonth,
    remainingTopupAmount,
    beneficiaryTotalTopup,
    beneficiaryRemainingAmount,
  });*/

  return true;
};

module.exports = {
  //createTransaction,
  rechargeWallet,
  topup,
  getTransactionsByUserId,
  getTransactionsByBeneficiaryId,
  getAllTransactions,
  getTransactionById,
  updateTransactionById,
  deleteTransactionById,
};
