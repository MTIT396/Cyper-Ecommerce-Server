const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  charset: "utf8mb4",
  connectionLimit: 5,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  decimalNumbers: true,
  timezone: "+00:00",
};

const pool = mysql.createPool(dbConfig);

pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to Database");
    connection.release();
  }
});

module.exports = pool.promise();
