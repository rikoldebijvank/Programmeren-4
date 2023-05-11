const mysql = require("mysql2")
const logger = require("./utils").logger
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "3306",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "share_a_meal",
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0
})

pool.on('connection', function (connection) {
  logger.debug(
    `Connected to db '${connection.config.database}' on ${connection.config.host}`
  );
});

pool.on('acquire', function (connection) {
  logger.debug('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
  logger.debug('Connection %d released', connection.threadId);
});

module.exports = pool