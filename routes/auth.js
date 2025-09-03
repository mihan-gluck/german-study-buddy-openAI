//routes/auth.js

require('dotenv').config();  // Load environment variables

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

//const auth = require("../middleware/auth");
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const checkRole = require("../middleware/checkRole");

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { regNo, name, email, password, role, subscription, batch, elevenLabsWidgetLink, elevenLabsApiKey } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });
    
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      regNo,
      name,
      email,
      password: hashedPassword,
      role,
    });
    if (user.role === 'student') {
      user.subscription = subscription;
      user.batch = batch;
      user.elevenLabsWidgetLink = elevenLabsWidgetLink;
      user.elevenLabsApiKey = elevenLabsApiKey;
    };

    await user.save();
    console.log("New user created:", user);
    res.status(201).json({ msg: "User created successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },  // include name in token payload
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        profilePhoto: user.profilePhoto || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Profile route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Protected role-based routes
router.get("/protected", verifyToken, (req, res) => {
  res.json({ msg: "You have access!", user: req.user });
});

router.get("/admin-dashboard", verifyToken, checkRole('admin'), (req, res) => {
  res.json({ msg: "Welcome to the admin dashboard" });
});

router.get("/teacher-dashboard", verifyToken, checkRole('teacher'), (req, res) => {
  res.json({ msg: "Welcome to the teacher dashboard" });
});

router.get("/student-dashboard", verifyToken, checkRole('student'), (req, res) => {
  res.json({ msg: "Welcome to the student dashboard" });
});

module.exports = router;
