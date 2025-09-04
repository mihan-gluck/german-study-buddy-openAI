//routes/auth.js

require('dotenv').config();  // Load environment variables

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();
const transporter = require("../config/emailConfig");

//const auth = require("../middleware/auth");
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const checkRole = require("../middleware/checkRole");

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { regNo, name, email, password, role, subscription, batch, medium, elevenLabsWidgetLink, elevenLabsApiKey } = req.body;

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

    if (user.role === 'STUDENT') {
      user.subscription = subscription;
      user.batch = batch;
      user.medium = medium;

      if(user.subscription === 'PLATINUM') {
        user.elevenLabsWidgetLink = elevenLabsWidgetLink;
        user.elevenLabsApiKey = elevenLabsApiKey;
      }
    };

    await user.save();

    // ✉️ Send email
    const passwordPlain = password; // Store plain password temporarily for email
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Welcome to Glück Global Student Portal 🎉",
      text: `Hello ${user.name},\n\nYou have successfully registered to the Glück Global Student Portal.
      \nHere are your login credentials:\n  📧Email: ${user.email}
      \n  🔒Password: ${passwordPlain}\nPlease keep this information safe and do not share it with anyone.
      \n\n\nBest regards, \nGlück Global Pvt Ltd`
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent to", user.email);
    } catch (err) {
      console.error("❌ Email sending failed:", err);
  }

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

router.get("/admin-dashboard", verifyToken, checkRole('ADMIN'), (req, res) => {
  res.json({ msg: "Welcome to the admin dashboard" });
});

router.get("/teacher-dashboard", verifyToken, checkRole('TEACHER'), (req, res) => {
  res.json({ msg: "Welcome to the teacher dashboard" });
});

router.get("/student-dashboard", verifyToken, checkRole('STUDENT'), (req, res) => {
  res.json({ msg: "Welcome to the student dashboard" });
});

module.exports = router;
