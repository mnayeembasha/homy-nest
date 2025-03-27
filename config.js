require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT;
const SESSION_SECRET = process.env.SESSION_SECRET;
const NODE_ENV = process.env.NODE_ENV;

module.exports = {MONGO_URL,PORT,SESSION_SECRET,NODE_ENV}