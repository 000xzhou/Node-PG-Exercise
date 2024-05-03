const { Client } = require("pg");
let dotenv = require("dotenv").config();

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${process.env.DB_URL_TEST}`;
} else {
  DB_URI = `${process.env.DB_URL}`;
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
