// Determine environment: development, staging, or production
const environment = process.env.NODE_ENV || "development";
const config = require("../knexfile.js")[environment];
const knex = require("knex")(config);

// Log the current environment for debugging
console.log(`Database connected in ${environment} mode`);

module.exports = knex;
