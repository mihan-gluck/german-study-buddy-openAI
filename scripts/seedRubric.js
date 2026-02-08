//scripts/seedRubric.js

const mongoose = require('mongoose');
const Rubric = require('../models/Rubric');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gluck-portal'; // Fallback to local MongoDB

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  // Clear existing rubrics (for development purposes)
  await Rubric.deleteMany({});
  // Seed rubrics
  const rubrics = [
    { level: 'A1', taskType: 'writing_email', criteria: [
      { name: 'Grammar', maxScore: 10, description: 'Correct use of basic grammar structures.' },
      { name: 'Vocabulary', maxScore: 10, description: 'Use of appropriate vocabulary for A1 level.' },
      { name: 'Coherence', maxScore: 10, description: 'Logical flow and organization of ideas.' }
    ]},
    { level: 'A2', taskType: 'essay', criteria: [
      { name: 'Grammar', maxScore: 15, description: 'Correct use of intermediate grammar structures.' },
      { name: 'Vocabulary', maxScore: 15, description: 'Use of appropriate vocabulary for A2 level.' },
      { name: 'Coherence', maxScore: 10, description: 'Logical flow and organization of ideas.' }
    ]},
    // Add more rubrics as needed
  ];
  await Rubric.insertMany(rubrics);
  console.log('✅ Rubrics seeded successfully!');
  mongoose.disconnect();
})
.catch(err => {
  console.error('❌ Error connecting to MongoDB:', err);
});

async function run() {
  await mongoose.connect(process.env.MONGOURI);

  await Rubric.create({
    level: "A2",
    taskType: "writing_email",
    criteria: [
      { name: "task_fulfillment", maxScore: 5 },
      { name: "grammar", maxScore: 5 },
      { name: "vocabulary", maxScore: 5 },
      { name: "coherence", maxScore: 5 },
      { name: "orthography", maxScore: 5 }
    ]
  });

  console.log("Seeded");
  process.exit();
}

run();
