// scripts/seed.js

const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');

const uri = 'your-mongodb-atlas-uri-here'; // Replace with your real connection string

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB Atlas');

  // Optional: clear existing documents (for development only)
  await User.deleteMany({});
  await Course.deleteMany({});

  // Seed example users
  await User.create([
    {
      name: 'Admin One',
      email: 'admin1@example.com',
      password: 'hashed-password',
      role: 'admin'
    },
    {
      name: 'Student One',
      email: 'student1@example.com',
      password: 'hashed-password',
      role: 'student'
    }
  ]);

  // Seed example course
  await Course.create({
    title: 'German A1',
    description: 'Basic German for Beginners',
    teacherId: 'some-valid-teacher-id'
  });

  console.log('✅ Seeding complete!');
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

