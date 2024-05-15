const express = require("express");
const app = express();

app.use(express.json());

require("dotenv").config();

// Import Routes for eWallet API
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const benefitiariesRoutes = require("./routes/benefitiariesRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");

// Mount the API routes
app.use("/api/v1/auth", authRoutes);

const authenticateToken = require("./middlewares/authenticateToken");
app.use("/api/v1/users", authenticateToken, userRoutes);
app.use("/api/v1/beneficiaries", authenticateToken, benefitiariesRoutes);
app.use("/api/v1/transactions", authenticateToken, transactionsRoutes);

// Connect to the database
const dbConnect = require("./config/database");

dbConnect();

// Define the PORT
const PORT = process.env.PORT || 5001;
const errorHandler = require("./middlewares/errorHandelor");
app.use(errorHandler);

const moment = require("moment-timezone");
const utcTime = moment.utc();
const localTime = utcTime.tz("Asia/Dubai");
console.log("Local Time (Dubai):", localTime.format());

const cors = require("cors");
app.use(cors());

// Start server
app.listen(PORT, () => {
  console.log(`Server Started Successfully at  Port http://localhost:${PORT}`);
});

// Default Route
app.get("/", (req, res) => {
  res.send(`<h1>Welcome to eWallet App</h1>`);
});
