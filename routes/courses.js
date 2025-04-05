const express = require("express");
const router = express.Router();
const Course = require("../models/courses");

// Create a new course
router.post("/", async (req, res) => {
  try {
    const { title, description, teacherId, students } = req.body;
    const newCourse = new Course({ title, description, teacherId, students });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("teacherId").populate("students");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enroll student in a course
router.post("/:courseId/enroll", async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.students.push(studentId);
    await course.save();
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
