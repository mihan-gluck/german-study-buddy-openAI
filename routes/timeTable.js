const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const { verifyToken, isAdmin } = require('../middleware/auth');
const cron = require("node-cron");
const User = require("../models/User");
const transporter = require("../config/emailConfig");

// ==========================
// ✅ CREATE TIMETABLE
// ==========================
router.post("/", async (req, res) => {
  try {
    const {
      batch,
      medium,
      plan,
      weekStartDate,
      weekEndDate,
      assignedTeacher,
      monday = [],
      tuesday = [],
      wednesday = [],
      thursday = [],
      friday = [],
      saturday = [],
      sunday = []
    } = req.body;

    const newTimeTable = new TimeTable({
      batch,
      medium,
      plan,
      weekStartDate,
      weekEndDate,
      assignedTeacher,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday
    });

    await newTimeTable.save();
    console.log('✅ Timetable saved:', newTimeTable);

    res.status(201).json({ message: 'Time table created successfully.', data: newTimeTable });
  } catch (error) {
    console.error('❌ Error creating time table:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ==========================
// ✅ GET ALL TIMETABLES
// ==========================
router.get("/", async (req, res) => {
  try {
    const timeTables = await TimeTable.find();
    res.status(200).json(timeTables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// ✅ GET TIMETABLE BY STUDENT QUERY
// ==========================
router.get("/forStudent", async (req, res) => {
  try {
    const { batch, medium, plan } = req.query;
    const query = {};
    if (batch) query.batch = batch;
    if (medium) query.medium = medium;
    if (plan) query.plan = plan;

    const timeTables = await TimeTable.find(query);
    res.status(200).json(timeTables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// ✅ GET TIMETABLES BY TEACHER ID (placed BEFORE /:id)
// ==========================
router.get("/forTeacher", async (req, res) => {
  try {
    const { teacherId } = req.query;

    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required" });
    }

    console.log("📩 Received teacherId:", teacherId);

    const timeTables = await TimeTable.find({ assignedTeacher: teacherId });

    console.log(`📊 Found ${timeTables.length} timetables for teacher ${teacherId}`);

    if (!timeTables || timeTables.length === 0) {
      return res.status(404).json({ message: "No timetables found for this teacher." });
    }

    res.status(200).json(timeTables);
  } catch (error) {
    console.error("❌ Error fetching timetable for teacher:", error);
    res.status(500).json({ message: error.message || "Internal server error." });
  }
});

// ==========================
// ✅ GET TIMETABLE BY ID (kept AFTER forTeacher)
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const timeTable = await TimeTable.findById(req.params.id);
    if (!timeTable) {
      return res.status(404).json({ message: "Time table not found." });
    }
    res.status(200).json(timeTable);
  } catch (error) {
    console.error("❌ Error fetching timetable:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ==========================
// ✅ UPDATE TIMETABLE BY ID
// ==========================
router.put("/:id", async (req, res) => {
  try {
    const {
      batch,
      medium,
      plan,
      weekStartDate,
      weekEndDate,
      assignedTeacher,
      monday = [],
      tuesday = [],
      wednesday = [],
      thursday = [],
      friday = [],
      saturday = [],
      sunday = []
    } = req.body;

    const updatedTimeTable = await TimeTable.findByIdAndUpdate(
      req.params.id,
      {
        batch,
        medium,
        plan,
        weekStartDate,
        weekEndDate,
        assignedTeacher,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday
      },
      { new: true }
    );

    if (!updatedTimeTable) {
      return res.status(404).json({ message: "Time table not found." });
    }

    console.log("✅ Timetable updated:", updatedTimeTable);
    res.status(200).json({ message: "Time table updated successfully.", data: updatedTimeTable });
  } catch (error) {
    console.error("❌ Error updating timetable:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ==========================
// ✅ WEEKLY EMAIL CRON (SUNDAY 5PM)
// ==========================
cron.schedule("0 17 * * 0", async () => {
  console.log("⏰ Running Sunday 5PM timetable email job...");
  try {
    const students = await User.find({ role: "STUDENT" });

    for (const student of students) {
      const latestTT = await TimeTable.findOne({
        batch: student.batch,
        medium: student.medium,
        plan: student.subscription,
      })
        .sort({ weekStartDate: -1 })
        .lean();

      if (!latestTT) {
        console.log(`⚠️ No timetable found for ${student.email}`);
        continue;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: "📅 Your Upcoming Timetable - Glück Global",
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; text-align:center;">
            <h2>Glück Global Student Portal</h2>
            <p>Hello <strong>${student.name}</strong>, here is your timetable for the week:</p>
            <h3>${new Date(latestTT.weekStartDate).toDateString()} - ${new Date(latestTT.weekEndDate).toDateString()}</h3>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent timetable to ${student.email}`);
    }
  } catch (err) {
    console.error("❌ Error in timetable cron job:", err);
  }
});

// ==========================
// ✅ CLASS REMINDER CRON (EVERY MINUTE)
// ==========================
cron.schedule('*/1 * * * *', async () => {
  console.log('⏰ Checking for upcoming class reminders...');

  try {
    const students = await User.find({ role: 'STUDENT' });
    if (!students?.length) return;

    const now = new Date();
    const todayWeekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    for (const student of students) {
      const latestTT = await TimeTable.findOne({
        batch: student.batch,
        medium: student.medium,
        plan: student.subscription,
      }).sort({ weekStartDate: -1 }).lean();

      if (!latestTT) continue;

      const todaySlots = latestTT[todayWeekday];
      if (!todaySlots?.length) continue;

      for (const slot of todaySlots) {
        const [hour, minute] = slot.start.split(':').map(Number);
        const classDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
        const reminderTime = new Date(classDate.getTime() - 60 * 60 * 1000);

        const diffMinutes = (now.getTime() - reminderTime.getTime()) / (1000 * 60);
        if (diffMinutes >= 0 && diffMinutes < 1) {
          console.log(`📩 Sending reminder to ${student.email} for class at ${slot.start}`);
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: '⏰ Class Reminder - Glück Global',
            html: `
              <div style="font-family: Arial, sans-serif; text-align:center;">
                <h2>Glück Global - Class Reminder</h2>
                <p>Hello <strong>${student.name}</strong>, this is a reminder for your upcoming class:</p>
                <p><strong>Day:</strong> ${todayWeekday}</p>
                <p><strong>Time:</strong> ${slot.start} - ${slot.end}</p>
              </div>
            `,
          };
          await transporter.sendMail(mailOptions);
          console.log(`✅ Reminder sent to ${student.email}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error in reminder cron job:', err);
  }
});

module.exports = router;
