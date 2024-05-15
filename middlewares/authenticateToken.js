const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(403)
        .json({ status: false, message: "Forbidden: Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;
