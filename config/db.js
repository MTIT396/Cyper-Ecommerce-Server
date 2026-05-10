const mysql = require("mysql2");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),

  charset: "utf8mb4",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 60000,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  decimalNumbers: true,

  timezone: "+00:00",

  ssl: {
    ca: process.env.DB_CA?.replace(/\\n/g, "\n"),
    rejectUnauthorized: false,
  },
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
