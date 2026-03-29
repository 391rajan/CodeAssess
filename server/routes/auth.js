const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/authMiddleware");

const SALT_ROUNDS = 10;

// Internal utility
const generateToken = (res, userId, rememberMe, role) => {
  const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days vs 7 days
  const jwtExpiresIn = rememberMe ? "30d" : "7d";

  const token = jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: jwtExpiresIn }
  );

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
};

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Please add all fields" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
    }

    const emailLc = email.toLowerCase();
    const userExists = await User.findOne({ email: emailLc });
    if (userExists) {
      return res.status(400).json({ success: false, error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const passwordHash = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email: emailLc,
      passwordHash,
      role: "student",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Registration pending admin approval",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Server error during registration" });
  }
});

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const emailLc = email.toLowerCase();
    const user = await User.findOne({ email: emailLc });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    if (user.role === "student") {
      if (user.status === "rejected") {
        return res.status(403).json({ success: false, error: "Your account has been rejected. Contact admin." });
      }
      if (user.status === "pending") {
        return res.status(403).json({ success: false, error: "Your account is pending admin approval" });
      }
    }

    generateToken(res, user._id, rememberMe === true, user.role);

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error during login" });
  }
});

// @route GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// @route POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
