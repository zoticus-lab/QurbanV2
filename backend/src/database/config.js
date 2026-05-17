try {
  require('dotenv').config();
} catch (e) {
  console.warn('dotenv not available, using process.env directly');
}
const mysql = require('mysql2/promise');

const baseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Handle password - only add if not empty
const pwd = process.env.MYSQL_PASSWORD;
if (pwd && pwd.trim().length > 0) {
  baseConfig.password = pwd;
}

// Config untuk normal operation (dengan database)
const config = {
  ...baseConfig,
  database: process.env.MYSQL_DATABASE || 'qurban_db'
};

// Config untuk setup/migration (tanpa database)
const adminConfig = {
  ...baseConfig
};

const pool = mysql.createPool(config);
const adminPool = mysql.createPool(adminConfig);

// Default export for backward compatibility
module.exports = pool;
// Also expose adminPool for migration
module.exports.adminPool = adminPool;
