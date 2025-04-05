//routes/auth.js

require('dotenv').config();  // Import dotenv to access environment variables

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Import auth and checkRole middlewares
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");  // Import checkRole middleware

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Protected route example
router.get("/protected", auth, (req, res) => {
  res.json({ msg: "You have access!", user: req.user });
});

// Admin-only route - Only accessible by users with the "admin" role
router.get("/admin-dashboard", auth, checkRole('admin'), (req, res) => {
  res.json({ msg: "Welcome to the admin dashboard" });
});

// Teacher-only route - Only accessible by users with the "teacher" role
router.get("/teacher-dashboard", auth, checkRole('teacher'), (req, res) => {
  res.json({ msg: "Welcome to the teacher dashboard" });
});

// Student-only route - Only accessible by users with the "student" role
router.get("/student-dashboard", auth, checkRole('student'), (req, res) => {
  res.json({ msg: "Welcome to the student dashboard" });
});

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword, role });

    // Save user to the database
    await user.save();
    res.status(201).json({ msg: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    // Compare the entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }  // Token expires in 1 hour
    );

    // Respond with the token and user info
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, subscription: user.subscription }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
