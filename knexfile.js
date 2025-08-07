// ⚠️ SECURITY NOTICE: This file is safe to commit to GitHub
// All sensitive credentials are stored in environment variables
// Create a .env file with your actual database credentials

require('dotenv').config();

module.exports = {

  development: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || "todo_app",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 10000,
  },

  staging: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || "todo_app",
      user: process.env.DB_USER || "root", 
      password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 10000,
  },

  production: {
    client: "mysql",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10
    },
    acquireConnectionTimeout: 10000,
    createTimeoutMillis: 10000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
  }

};
