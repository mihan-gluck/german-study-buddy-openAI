//routes/auth.js

require('dotenv').config();  // Load environment variables

const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Course = require("../models/Course");
const StudentLogs = require("../models/StudentLogs");
const router = express.Router();
const transporter = require("../config/emailConfig");

//const auth = require("../middleware/auth");
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const checkRole = require("../middleware/checkRole");
const JWT_SECRET = process.env.JWT_SECRET;

// Read CRM data from Monday.com and create users
cron.schedule(
  "50 23 * * *", // ✅ Every day at 11:50 PM
  async () => {

    try {
      const BOARD_ID = process.env.MONDAY_BOARD_ID;

      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Colombo"
      }); // YYYY-MM-DD

      const query = `
        query ($boardId: [ID!]) {
          boards(ids: $boardId) {
            items_page(limit: 500) {
              items {
                id
                name
                column_values(
                  ids: [
                    "date_mkzs9xr7",
                    "text_mkw3spks",
                    "dropdown_mkw09h9j",
                    "color_mky3jxt1",
                    "dropdown_mkxx6cfp",
                    "dropdown_mkxwsaxq",
                    "dropdown_mkzshj5a",
                    "text_mkw2wpvr",
                    "text_mkv080k2",
                    "text_mkw38wse",
                    "text_mkwz1j6q",
                    "text_mkvdkw8g"
                  ]
                ) {
                  id
                  text
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        "https://api.monday.com/v2",
        { query, variables: { boardId: [BOARD_ID] } },
        {
          headers: {
            Authorization: process.env.MONDAY_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      const items = response.data.data.boards[0].items_page.items;

      const todayItems = items.filter(item => {
        const dateText = item.column_values.find(
          c => c.id === "date_mkzs9xr7"
        )?.text;
        return dateText === today;
      });

      let created = [];
      let skipped = [];

      for (const item of todayItems) {
        const get = id =>
          item.column_values.find(c => c.id === id)?.text || "";

        const name          = item.name;
        const email         = get("text_mkw3spks");
        const medium        = get("dropdown_mkw09h9j");
        const subscription  = get("color_mky3jxt1");
        const batch         = get("dropdown_mkxx6cfp");
        const studentStatus = get("dropdown_mkxwsaxq");
        const level         = get("dropdown_mkzshj5a");
        const phoneNumber   = get("text_mkw2wpvr");
        const address       = get("text_mkv080k2");
        const age           = get("text_mkw38wse");
        const programEnrolled = get("text_mkwz1j6q");
        const leadSource    = get("text_mkvdkw8g");

        if (!email) {
          skipped.push({ name, reason: "No email" });
          continue;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          skipped.push({ name, email, reason: "Already exists" });
          continue;
        }

        const regNo = await generateRegNo("STUDENT");
        const passwordPlain = await generatePassword("STUDENT", regNo);
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const newUser = new User({
          name,
          email,
          regNo,
          password: hashedPassword,
          role: "STUDENT",
          subscription,
          level,
          medium,
          batch,
          studentStatus,
          phoneNumber,
          address,
          age: age ? parseInt(age) : null,
          programEnrolled,
          leadSource
        });

        await newUser.save();

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Welcome to Glück Global Student Portal 🎉",
          html: `
            <div style="font-family: Arial, sans-serif; color: #000000; line-height: 1.6;">
              <p>Hello ${name},</p>

              <p>You have successfully registered to the <strong>Glück Global Student Portal</strong>. Here are your login credentials:</p>

              <ul>
                <li><strong>Web App ID:</strong> ${regNo}</li>
                <li><strong>Password:</strong> ${passwordPlain}</li>
              </ul>

              <p>Please keep this information safe and do not share it with anyone.</p>

              <p>You can access the Portal at: <a href="https://gluckstudentsportal.com" target="_blank">https://gluckstudentsportal.com</a></p>

              <p>Best regards,<br>
              <strong>Glück Global Pvt Ltd</strong></p>
            </div>
          `
        });

        console.log("✅ Monday CRM sync completed");
      }

    } catch (err) {
      console.error("CRM sync error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  {
    timezone: "Asia/Colombo" // ✅ Set timezone to Sri Lanka
  }
);



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

//Password generation
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
      medium: { $in: [medium] },
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

// ✅ Get teachers by student medium
router.get("/teachersByMedium", async (req, res) => {
  try {
    const { medium } = req.query;

    if (!medium) {
      return res.status(400).json({ msg: "Medium is required" });
    }

    const teachers = await User.find({
      role: "TEACHER",
      medium: { $in: [medium] }
    }).select("name email regNo medium assignedCourses");

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ msg: "No teachers found for this medium" });
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
    const { 
      name, 
      email, 
      role, 
      subscription, 
      level, 
      batch, 
      medium, 
      studentStatus, 
      assignedCourses, 
      assignedBatches, 
      assignedTeacher, 
      phoneNumber, 
      address, 
      age, 
      programEnrolled, 
      leadSource,
      languageLevelOpted,
      dateWithdrew,
      reasonForWithdrewing,
      courseCompletionDates,
      qualifications
     } = req.body;

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
      user.studentStatus = studentStatus;
      user.phoneNumber = phoneNumber;
      user.address = address;
      user.age = age;
      user.programEnrolled = programEnrolled;
      user.leadSource = leadSource;
      user.languageLevelOpted = languageLevelOpted;
      user.dateWithdrew = dateWithdrew;
      user.reasonForWithdrawing = reasonForWithdrewing;
      user.courseCompletionDates = courseCompletionDates;
      user.qualifications = qualifications;
      
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
          medium: { $in: [medium] },
          assignedCourses: course._id
        });

        if (teacher) {
          user.assignedTeacher = teacher._id;
        } else {
          return res.status(400).json({ msg: "No teacher found for this level and medium" });
        }
      }
    }

    else if (user.role === "TEACHER") {
      user.assignedBatches = assignedBatches;
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

          <p>You can access the Portal at: <a href="https://gluckstudentsportal.com" target="_blank">https://gluckstudentsportal.com</a></p>

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

    // 🔴 BLOCK WITHDREW STUDENTS
    if (user.role === "STUDENT" && user.studentStatus === "WITHDREW") {
      return res.status(403).json({
        msg: "Your student account has been withdrawn. Access denied."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name 
      },  
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Set cookie instead of sending token
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,   // ❌ keep false for localhost, set true in production (HTTPS)
      sameSite: "Lax", // use "Strict" in production for stronger CSRF protection
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    // ✅ Send user info only (no token in response)
    res.json({
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


// ✅ Logout
router.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    sameSite: "Lax",
  });
  return res.json({ msg: "Logged out successfully" });
});


// ✅ Profile route
router.get("/profile", verifyToken, async (req, res) => {
  try {
    let query = User.findById(req.user.id).select("-password");

    // If the logged-in user is a student → populate teacher info
    if (req.user.role === "STUDENT") {
      query = query.populate("assignedTeacher", "name email"); 
      // 👆 populate assignedTeacher with only name & email fields
    }

    const user = await query;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Get a user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Get teachers by batch
router.get("/teachers-by-batch/:batch", async (req, res) => {
  try {
    const batch = req.params.batch; 
    console.log("🔍 Fetching teachers for batch:", batch);

    if (!batch) {
      return res.status(400).json({ message: "Batch is required." });
    }

    const teachers = await User.find({
      role: "TEACHER",
      assignedBatches: { $in: [batch] } 
    }).select("name");

    teachers.forEach(teacher => {
      console.log("👨‍🏫 Found teacher:", teacher.name);
    });

    // ✅ Always return 200 with array
    res.status(200).json(teachers);

  } catch (error) {
    console.error("❌ Error fetching teachers by batch:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// Update assigned teacher by batch
router.put("/update-teacher-by-batch", async (req, res) => {
  try {
    const { batch, newTeacherId } = req.body;

    if (!batch || !newTeacherId) {
      return res.status(400).json({ 
        message: "Batch and newTeacherId are required." 
      });
    }

    const students = await User.find({
      role: "STUDENT",
      batch: batch
    });

    if (students.length === 0) {
      return res.status(404).json({ 
        message: "No students found for the specified batch." 
      });
    }

    const logs = students.map(student => ({
      action: "UPDATE",
      studentId: student._id,
      levelAtUpdate: student.level,
      batchAtUpdate: student.batch,
      assignedTeacherAtUpdate: student.assignedTeacher,
      statusAtUpdate: student.studentStatus,
      subscriptionAtUpdate: student.subscription,
      mediumAtUpdate: student.medium
    }));

    await StudentLogs.insertMany(logs);
    console.log(`✅ Created ${logs.length} student log entries for teacher update by batch.`);

    const result = await User.updateMany(
      { role: "STUDENT", batch: batch },
      { assignedTeacher: newTeacherId }
    );

    res.status(200).json({ 
      message: `Assigned teacher updated for ${result.nModified} students.` 
    });
    
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});


// ✅ Update user by ID
router.put("/:id", async (req, res) => {
  try {
    // 1️⃣ Get existing user (OLD data)
    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2️⃣ Log OLD data into StudentLogs (if STUDENT)
    if (existingUser.role === "STUDENT") {
      const logEntry = new StudentLogs({
        action: "UPDATE",
        studentId: existingUser._id,
        levelAtUpdate: existingUser.level,
        batchAtUpdate: existingUser.batch,
        assignedTeacherAtUpdate: existingUser.assignedTeacher,
        statusAtUpdate: existingUser.studentStatus,
        subscriptionAtUpdate: existingUser.subscription,
        mediumAtUpdate: existingUser.medium
      });

      await logEntry.save();
    }

    // 3️⃣ Extract NEW data
    const {
      name,
      email,
      role,
      subscription,
      level,
      batch,
      medium,
      assignedCourses,
      assignedTeacher,
      assignedBatches,
      studentStatus,
      phoneNumber,
      address,
      age,
      programEnrolled,
      leadSource,
      languageLevelOpted,
      dateWithdrew,
      courseCompletionDates,
      reasonForWithdrawing,
      qualifications
    } = req.body;

    // 4️⃣ Build update object
    const updateData = {
      name,
      email,
      role,
      subscription,
      level,
      batch,
      medium,
      assignedCourses,
      assignedTeacher,
      assignedBatches,
      studentStatus,
      phoneNumber,
      address,
      age,
      programEnrolled,
      leadSource,
      languageLevelOpted,
      dateWithdrew,
      reasonForWithdrawing,
      courseCompletionDates,
      qualifications
    };

    // 5️⃣ Clear withdraw data if not withdrew
    if (studentStatus !== "WITHDREW") {
      updateData.dateWithdrew = null;
      updateData.reasonForWithdrawing = "";
    }

    // 6️⃣ Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "User updated successfully.",
      data: updatedUser
    });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


// ✅ Delete user by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
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
