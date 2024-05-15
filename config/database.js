const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      //useNewUrlParser:true,
      //useUnifiedTopology:true,
    })

    .then(() => console.log("DB Connection is Successful"))
    .catch((error) => {
      console.log("Error in Connection");
      console.error(error.message);
      process.exit(1);
    });
};

module.exports = dbConnect;
