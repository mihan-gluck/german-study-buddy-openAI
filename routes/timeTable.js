const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const { verifyToken, isAdmin } = require('../middleware/auth');
const cron = require("node-cron");
const User = require("../models/User");
const transporter = require("../config/emailConfig");
const MeetingLink = require('../models/MeetingLink');

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
      // ✅ Find the most recent timetable for the student
      const latestTT = await TimeTable.findOne({
        batch: student.batch,
        medium: student.medium,
        plan: student.subscription,
      }).sort({ weekStartDate: -1 }).lean();

      if (!latestTT) continue;

      // ✅ Convert weekStartDate and weekEndDate to Date objects
      const weekStart = new Date(latestTT.weekStartDate);
      const weekEnd = new Date(latestTT.weekEndDate);

      // ✅ Check if today is within the timetable’s valid week range
      if (now < weekStart || now > weekEnd) {
        console.log(`📅 Skipping ${student.name}: today's date is outside the timetable range (${weekStart.toDateString()} - ${weekEnd.toDateString()}).`);
        continue;
      }

      const todaySlots = latestTT[todayWeekday];
      if (!todaySlots?.length) continue;

      for (const slot of todaySlots) {
        const [hour, minute] = slot.start.split(':').map(Number);
        const classDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
        const reminderTime = new Date(classDate.getTime() - 60 * 60 * 1000); // 1 hour before

        const diffMinutes = (now.getTime() - reminderTime.getTime()) / (1000 * 60);
        if (diffMinutes >= 0 && diffMinutes < 1) {
          // ✅ Find meeting link based on student's details
          const meetingLink = await findMeetingLink(
            student.batch,
            student.medium,
            slot.teacherId || student.assignedTeacher
          );

          console.log(`📩 Sending reminder to ${student.email} for class at ${slot.start}`);

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: student.email,
          subject: '⏰ Class Reminder - Glück Global',
          html: `
                  <div style="font-family: Arial, sans-serif; text-align:center; background:#f9f9f9; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                      
                      <div style="max-width:600px; margin:2px; background:#000e89; border-radius:8px;">
                        <h2 style="color:white; margin:0; padding:10px 10px;">Glück Global - Class Reminder</h2>
                      </div>

                      <p>Hello <strong>${student.name}</strong>,</p>
                      <p>This is a reminder for your upcoming class:</p>

                      <ul style="list-style:none; padding:0; font-size:15px; text-align:center;">
                        <li><strong>Day:</strong> ${todayWeekday}</li>
                        <li><strong>Time:</strong> ${slot.start} - ${slot.end}</li>
                      </ul>

                      ${
                        meetingLink
                          ? `
                            <p style="margin-top: 20px; font-size:15px;">
                              Please use the following link to join your upcoming class:
                              <br />
                              <a href="${meetingLink.link}" target="_blank" 
                                style="display:inline-block; margin-top:10px; background-color:#000e89; color:#fff; 
                                        text-decoration:none; padding:10px 20px; border-radius:6px;">
                                Join Class
                              </a>
                            </p>
                          `
                          : `
                            <p style="margin-top: 20px; color:#999; font-size:14px;">
                              No meeting link is currently available for this class.
                            </p>
                          `
                      }

                      <p style="margin-top:20px;">Please be prepared and join on time.</p>

                      <p style="font-size:13px; color:#888;">
                        Best regards,<br>
                        <strong>Glück Global Pvt Ltd</strong>
                      </p>
                    </div>
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


// ==========================
// ✅ FIND MEETING LINK BY BATCH, MEDIUM, & ASSIGNED TEACHER
// ==========================
async function findMeetingLink(batch, medium, teacherId) {
  try {
    const link = await MeetingLink.findOne({ batch, medium, teacherId });
    return link;
  } catch (err) {
    console.error('Error finding meeting link:', err.message);
    throw err;
  }
}

module.exports = router;
