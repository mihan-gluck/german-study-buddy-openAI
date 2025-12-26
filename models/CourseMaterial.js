// models/CourseMaterial.js

const mongoose = require("mongoose");

const CourseMaterialSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  materials: [
    {fileName: { type: String, required: true },fileUrl: { type: String, required: true },uploadedAt: { type: Date, default: Date.now }}
  ],

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model("CourseMaterial", CourseMaterialSchema);
