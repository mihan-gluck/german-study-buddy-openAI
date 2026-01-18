require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function checkTeachers() {
  await mongoose.connect(process.env.MONGO_URI);
  const teachers = await User.find({ role: 'TEACHER' }).select('name _id');
  console.log('Teachers in MongoDB:');
  teachers.forEach(t => console.log(`  ${t.name} - ${t._id}`));
  await mongoose.connection.close();
}

checkTeachers();
