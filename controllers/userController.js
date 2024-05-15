const User = require("../models/User");

const {
  generateAccessToken,
  getUserCurrentToken,
} = require("../utils/accessTokenUtil");

const credit = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.balance = user.balance + amount;
    const updatedUser = await user.save();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};

const debit = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newBalance = user.balance - amount;
    if (newBalance < 0) {
      throw new Error("You don't have enough balance in your wallet.");
    }
    user.balance = newBalance;
    const updatedUser = await user.save();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user balance:", error);
    throw error;
  }
};

const profile = async (req, res) => {
  try {
    //const accessToken = getUserCurrentToken(req);
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user) {
      const accessToken = generateAccessToken(user);
      return res
        .status(200)
        .json({ status: true, message: "Success", user, accessToken });
    } else {
      return res.status(404).json({ status: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

const getUserByUserId = async (userId) => {
  try {
    const user = await User.find({ userID: userId }).sort({ createdAt: -1 });
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    res.json({ status: true, message: "Success", user });
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

module.exports = { credit, debit, profile, getUserByUserId };
