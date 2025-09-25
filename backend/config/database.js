const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

require("dotenv").config();
const mongoUrl = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(mongoUrl);
  console.log("Conectou o banco de dados!");
}

main().catch((err) => console.log(err));

module.exports = main;