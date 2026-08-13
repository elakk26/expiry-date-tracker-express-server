const authService = require("../services/authService");

/**
 * @desc    Register a new user
 * @route   POST /auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.registerUser({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login an existing user
 * @route   POST /auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
