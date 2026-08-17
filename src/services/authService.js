// Auth Service — business logic layer for authentication.
// Sits between the controller and the DAO.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authDao = require("../dao/authDao");

/**
 * Generate a signed JWT.
 * @param {string} userId
 * @returns {string}
 */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ token: string, user: object }>}
 */
const registerUser = async ({ name, email, password }) => {
  const existing = await authDao.findByEmail(email);
  if (existing) {
    const error = new Error("Email is already registered");
    error.status = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await authDao.createUser({ name, email, password: hashedPassword });
  const token = signToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  };
};

/**
 * Login an existing user.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
const loginUser = async ({ email, password }) => {
  const user = await authDao.findByEmail(email, true);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const token = signToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  };
};

module.exports = { registerUser, loginUser };
