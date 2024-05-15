const User = require("../models/User");
const RevokedToken = require("../models/RevokeToken");
const {
  generateAccessToken,
  getUserCurrentToken,
} = require("../utils/accessTokenUtil");

const registerUser = async (req, res) => {
  try {
    const { name, phone, username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Username already exists" });
    }
    const newUser = new User({
      name,
      phone,
      username,
      password: password,
      password: password,
    });
    await newUser.save();

    const accessToken = generateAccessToken(newUser);

    res
      .status(201)
      .json({ status: true, message: "Success", user: newUser, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: `Failed to register user: ${err.message}`,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid username or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Authentication successful
    const accessToken = generateAccessToken(user);

    res.json({ status: true, message: "Success", user, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Failed to login" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const token = getUserCurrentToken(req);
    console.log("Logout Token: $");

    // Add token to revoked tokens collection
    await RevokedToken.create({ token, userId });

    res.json({ status: true, message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Failed to logout" });
  }
};

module.exports = { registerUser, loginUser, logoutUser };
