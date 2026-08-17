// Auth DAO — handles all direct database operations for the User collection.
// Controllers should call the service layer, which calls this DAO.

const User = require("../models/userModel");

/**
 * Find a user by email.
 * @param {string} email
 * @param {boolean} [includePassword=false]
 * @returns {Promise<import('../models/userModel').default | null>}
 */
const findByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includePassword) query.select("+password");
  return query;
};

/**
 * Create a new user document.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<import('../models/userModel').default>}
 */
const createUser = (data) => User.create(data);

module.exports = { findByEmail, createUser };
