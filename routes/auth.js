//routes/auth.js

require('dotenv').config();  // Load environment variables

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course");
const router = express.Router();
const transporter = require("../config/emailConfig");

//const auth = require("../middleware/auth");
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const checkRole = require("../middleware/checkRole");

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Reg No generation for different roles
async function generateRegNo(role) {
  // map roles to prefixes
  const prefixMap = {
    STUDENT: "STUD",
    TEACHER: "T",
    ADMIN: "AD"
  };

  const prefix = prefixMap[role] || role.substring(0, 2).toUpperCase(); // fallback

  const lastUser = await User.findOne({
    role: role,
    regNo: { $regex: `^${prefix}\\d+$` }
  })
    .sort({ createdAt: -1 })
    .exec();

  let nextNumber = 1;

  if (lastUser && lastUser.regNo) {
    const match = lastUser.regNo.match(new RegExp(`^${prefix}(\\d+)$`));
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return prefix + String(nextNumber).padStart(3, "0");
}


async function generatePassword(role, regNo) {
  // map roles to prefixes
  const prefixMap = {
    STUDENT: "Student",
    TEACHER: "Teacher",
    ADMIN: "Admin"
  };

  const prefix = prefixMap[role.toUpperCase()] || role;

  // get last 3 characters of regNo
  const lastThreeDigits = regNo.slice(-3);

  // get current year
  const currentYear = new Date().getFullYear();

  // construct password
  const password = `${prefix}${lastThreeDigits}@${currentYear}`;

  return password;
}

// ✅ Get teachers by student level + medium
router.get("/teachers", async (req, res) => {
  try {
    const { level, medium } = req.query;

    if (!level || !medium) {
      return res.status(400).json({ msg: "Level and medium are required" });
    }

    // 1️⃣ Find the course for this level
    const course = await Course.findOne({ title: level }); // assuming title = level like "A1"
    if (!course) {
      return res.status(404).json({ msg: "No course found for this level" });
    }

    // 2️⃣ Find teachers who teach this course & match medium
    const teachers = await User.find({
      role: "TEACHER",
      medium: medium,
      assignedCourses: course._id
    }).select("name email regNo medium assignedCourses");

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ msg: "No teachers found for this level and medium" });
    }

    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, role, subscription, level, batch, medium, conversationId, elevenLabsWidgetLink, elevenLabsApiKey, assignedCourses, assignedTeacher } = req.body;

    const regNo = await generateRegNo(role);  
    const password = await generatePassword(role, regNo); // generate random password
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      regNo,   // <-- assign here
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (user.role === "STUDENT") {
      user.subscription = subscription;
      user.level = level;
      user.batch = batch;
      user.medium = medium;
      
      // 🔍 Teacher assignment
      if (assignedTeacher) {
        // case 1: frontend provided teacher id
        user.assignedTeacher = assignedTeacher;
      } else {
        // case 2: backend finds one automatically
        const course = await Course.findOne({ level });
        if (!course) {
          return res.status(400).json({ msg: "No course found for this level" });
        }

        const teacher = await User.findOne({
          role: "TEACHER",
          medium: medium,
          assignedCourses: course._id
        });

        if (teacher) {
          user.assignedTeacher = teacher._id;
        } else {
          return res.status(400).json({ msg: "No teacher found for this level and medium" });
        }
      }


      if (user.subscription === "PLATINUM") {
        user.conversationId = conversationId;
        user.elevenLabsWidgetLink = elevenLabsWidgetLink;
        user.elevenLabsApiKey = elevenLabsApiKey;
      }
    }

    else if (user.role === "TEACHER") {
      user.medium = medium;
      user.assignedCourses = assignedCourses; // Assign courses if provided
    }

    await user.save();

    // ✉️ Send email
    const passwordPlain = password; // Store plain password temporarily for email
    
 
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Welcome to Glück Global Student Portal 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color: #000000; line-height: 1.6;">
          <p>Hello ${user.name},</p>

          <p>You have successfully registered to the <strong>Glück Global Student Portal</strong>. Here are your login credentials:</p>

          <ul>
            <li><strong>Web App ID:</strong> ${user.regNo}</li>
            <li><strong>Password:</strong> ${passwordPlain}</li>
          </ul>

          <p>Please keep this information safe and do not share it with anyone.</p>

          <p>Best regards,<br>
          <strong>Glück Global Pvt Ltd</strong></p>
        </div>
      `
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
    const { regNo, password } = req.body;

    const user = await User.findOne({ regNo });
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
