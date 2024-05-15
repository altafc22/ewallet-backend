const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.username },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    }
  );
};

function getUserCurrentToken(req) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  return token;
}

module.exports = {
  generateAccessToken,
  getUserCurrentToken,
};
