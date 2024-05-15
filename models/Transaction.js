const mongoose = require("mongoose");

const topupTransactionSchema = new mongoose.Schema({
  transactionID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  beneficiaryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Beneficiary",
  },
  transactionType: {
    type: String,
    enum: ["Credit", "Debit"],
  },
  transactionCategory: {
    type: String,
    enum: ["Wallet Recharge", "TopUp"],
    required: true,
  },
  decription: {
    type: String,
  },
  transactionAmount: {
    type: Number,
    required: true,
  },
  transactionFee: {
    type: Number,
  },
  totalAmount: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transactionStatus: {
    type: String,
    enum: ["Success", "Failed"], // 1=success, 0=failed
  },
});

topupTransactionSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

const Transaction = mongoose.model("Transaction", topupTransactionSchema);

module.exports = Transaction;
