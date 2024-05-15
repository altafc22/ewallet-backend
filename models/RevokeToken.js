// Import Mongoose
const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // record will delete after 7 days
  },
});

const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);

module.exports = RevokedToken;
