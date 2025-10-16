// routes/courseMaterial.js

const express = require("express");
const router = express.Router();
const CourseMaterial = require("../models/CourseMaterial");
const upload = require("../middleware/upload"); // your multer setup

// POST /api/courseMaterial
// Upload files and save course material
router.post("/", upload.array("files"), async (req, res) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one file must be uploaded." });
    }

    // Map uploaded files to materials array
    const materials = req.files.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/course-materials/${file.filename}`,
    }));

    // Create new course material document
    const newCourseMaterial = new CourseMaterial({
      course,
      materials,
    });

    await newCourseMaterial.save();

    res.status(201).json({
      message: "Course materials uploaded and saved successfully.",
      data: newCourseMaterial,
    });
  } catch (error) {
    console.error("❌ Error adding course materials:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET all course materials
router.get("/", async (req, res) => {
  try {
    const materials = await CourseMaterial.find().populate("course");
    res.status(200).json({
      message: "Course materials fetched successfully.",
      data: materials,
    });
  } catch (error) {
    console.error("❌ Error fetching course materials:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE a specific file from course materials
router.delete("/:materialId/file", async (req, res) => {
  try {
    const { materialId } = req.params;
    const { fileId } = req.query;

    if (!fileId) {
      return res.status(400).json({ message: "File ID is required." });
    }

    const material = await CourseMaterial.findById(materialId);
    if (!material) {
      return res.status(404).json({ message: "Material not found." });
    }

    // Remove the file from the materials array
    material.materials = material.materials.filter(file => file._id.toString() !== fileId);
    await material.save();

    res.status(200).json({
      message: "File deleted successfully.",
      data: material,
    });
  } catch (error) {
    console.error("❌ Error deleting file from course materials:", error);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
