const mongoose = require("mongoose");

const timeRangeSchema = new mongoose.Schema({
  start: { type: String, required: true }, // e.g. "09:00"
  end: { type: String, required: true },    // e.g. "11:00"
  classStatus: { 
    type: String, 
    enum: ["Scheduled", "Cancelled"], 
    default: "Scheduled" 
  }
}, { _id: false }); // _id not needed for subdocuments

const TimeTableSchema = new mongoose.Schema({
  batch: { type: String, required: true },
  medium: { type: String, required: true },
  plan: { type: String, required: true },
  weekStartDate: { type: Date, required: true },
  weekEndDate: { type: Date, required: true },
  assignedTeacher: { type: String, ref: 'User', required: true }, 

  monday: { type: [timeRangeSchema], default: [] },
  tuesday: { type: [timeRangeSchema], default: [] },
  wednesday: { type: [timeRangeSchema], default: [] },
  thursday: { type: [timeRangeSchema], default: [] },
  friday: { type: [timeRangeSchema], default: [] },
  saturday: { type: [timeRangeSchema], default: [] },
  sunday: { type: [timeRangeSchema], default: [] },
});

module.exports = mongoose.model("TimeTable", TimeTableSchema);
