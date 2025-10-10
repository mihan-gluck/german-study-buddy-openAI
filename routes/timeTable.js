// routes/timeTable.js

const express = require('express');
const router = express.Router();
const TimeTable = require('../models/TimeTable');
const { verifyToken, isAdmin } = require('../middleware/auth');
const cron = require("node-cron");
const User = require("../models/User"); // Your student model
const transporter = require("../config/emailConfig");

// Create timetable
router.post("/", async (req, res) => {
  try {
    // Destructure required fields from request body
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

    // Create new TimeTable document
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

    // Save to database
    await newTimeTable.save();

    // Log success
    console.log('✅ Timetable saved:', newTimeTable);

    res.status(201).json({ message: 'Time table created successfully.', data: newTimeTable });
  } catch (error) {
    console.error('❌ Error creating time table:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get timetables
router.get("/", async (req, res) => {
  try {
    const timeTables = await TimeTable.find();
    res.status(200).json(timeTables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get timetable by batch, medium, and plan
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


// Run every Sunday at 5:00 PM
cron.schedule("0 17 * * 0", async () => {
  console.log("⏰ Running Sunday 5PM timetable email job...");

  try {
    // Get all students
    const students = await User.find({ role: "STUDENT" });

    for (const student of students) {
      // Get latest timetable for student's batch/medium/plan
      const latestTT = await TimeTable.findOne({
        batch: student.batch,
        medium: student.medium,
        plan: student.subscription, // match your field
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
          <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; text-align: center; padding: 20px; background-color: #f9f9f9;">
            
            <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); padding: 20px;">
              
              <h2 style="color: #000e89; margin-bottom: 10px;">Glück Global Student Portal</h2>
              <p style="font-size: 16px;">Hello <strong>${student.name}</strong>,</p>
              <p style="font-size: 15px;">Here is your timetable for the week:</p>

              <h3 style="margin: 15px 0; color: #444;">
                ${new Date(latestTT.weekStartDate).toDateString()} 
                - 
                ${new Date(latestTT.weekEndDate).toDateString()}
              </h3>

              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
                <thead>
                  <tr style="background-color: #000e89; color: #FFFF2E;">
                    <th style="padding: 10px; border: 1px solid ;">Day</th>
                    <th style="padding: 10px; border: 1px solid ;">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                ${["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
                  .map(day => {
                    const slots = latestTT[day] || [];
                    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1); // ✅ Capitalize first letter
                    if (slots.length === 0) {
                      return `<tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${dayLabel}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">-</td>
                              </tr>`;
                    }
                    return slots.map(slot => `
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;">${dayLabel}</td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${slot.start} - ${slot.end}</td>
                      </tr>
                    `).join("");
                  }).join("")}
              </tbody>
              </table>

              <p style="font-size: 14px; margin-top: 20px;">Please keep this timetable for your reference.</p>

              <p style="margin-top: 30px; font-size: 13px; color: #888;">
                Best regards,<br>
                <strong>Glück Global Pvt Ltd</strong>
              </p>
            </div>
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

//Class Reminder Automation before 1 Hour of class

// Run every 1 minute
cron.schedule("*/1 * * * *", async () => {
  console.log("⏰ Checking for upcoming class reminders...");

  try {
    const students = await User.find({ role: "STUDENT" });

    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    console.log(`📌 Today = ${today}`);

    for (const student of students) {
      const latestTT = await TimeTable.findOne({
        batch: student.batch,
        medium: student.medium,
        plan: student.subscription,
      })
        .sort({ weekStartDate: -1 })
        .lean();

      if (!latestTT || !latestTT[today]) continue;

      for (const slot of latestTT[today]) {
        const [hour, minute] = slot.start.split(":").map(Number);

        const classDate = new Date();
        classDate.setHours(hour, minute, 0, 0);

        const reminderTime = new Date(classDate.getTime() - 60 * 60 * 1000); // 1 hour before
        const now = new Date();

        const diffMinutes = Math.abs((now.getTime() - reminderTime.getTime()) / (1000 * 60));

        console.log(`Student: ${student.email}`);
        console.log(`Now: ${now}`);
        console.log(`Class Start: ${classDate}`);
        console.log(`Reminder Time: ${reminderTime}`);
        console.log(`Diff minutes: ${diffMinutes}`);

        // ✅ Trigger if within 1-minute window
        if (diffMinutes < 1) {
          console.log(`📩 Sending reminder to ${student.email} for ${slot.start}`);

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "⏰ Class Reminder - Glück Global",
            html: `
              <div style="font-family: Arial, sans-serif; text-align:center; background:#f9f9f9; padding:20px;">
                <div style="max-width:600px; margin:auto; background:#fff; padding:20px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                  <div style="max-width:600px; margin:2px; background:#000e89; border-radius:8px;">
                    <h2 style="color:white; margin:0; padding:10px 10px;">Glück Global - Class Reminder</h2>
                  </div>
                  <p>Hello <strong>${student.name}</strong>,</p>
                  <p>This is a reminder for your upcoming class:</p>
                  <ul style="list-style:none; padding:0; font-size:15px;">
                    <li><strong>Day:</strong> ${today.charAt(0).toUpperCase() + today.slice(1)}</li>
                    <li><strong>Time:</strong> ${slot.start} - ${slot.end}</li>
                  </ul>
                  <p>Please be prepared and join on time.</p>
                  <p style="font-size:13px; color:#888;">Best regards,<br><strong>Glück Global Pvt Ltd</strong></p>
                </div>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log(`✅ Reminder sent to ${student.email} for class at ${slot.start}`);
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in reminder cron job:", err);
  }
});

// ✅ Get a timetable by ID
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


// ✅ Update timetable by ID
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
      { new: true } // Return updated document
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


module.exports = router;
