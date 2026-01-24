// scripts/seed-document-requirements.js
// Seed document requirements into database

require('dotenv').config();
const mongoose = require('mongoose');
const DocumentRequirement = require('../models/DocumentRequirement');

const requirements = [
  {
    type: 'CV',
    label: 'CV',
    description: 'Current curriculum vitae or resume',
    required: true,
    category: 'PROFESSIONAL',
    order: 1
  },
  {
    type: 'O_LEVEL_CERTIFICATE',
    label: 'O Level Certificate',
    description: 'Ordinary Level examination certificate',
    required: true,
    category: 'ACADEMIC',
    order: 2
  },
  {
    type: 'A_LEVEL_CERTIFICATE',
    label: 'A Level Certificate',
    description: 'Advanced Level examination certificate',
    required: true,
    category: 'ACADEMIC',
    order: 3
  },
  {
    type: 'ACADEMIC_TRANSCRIPT',
    label: 'Academic Transcript',
    description: 'Official academic transcripts from educational institutions',
    required: true,
    category: 'ACADEMIC',
    order: 4
  },
  {
    type: 'PASSPORT',
    label: 'Passport',
    description: 'Valid passport copy (photo and details page)',
    required: true,
    category: 'IDENTIFICATION',
    order: 5
  },
  {
    type: 'BROWN_CERTIFICATE',
    label: 'Brown Certificate',
    description: 'Brown certificate (if applicable)',
    required: false,
    category: 'ACADEMIC',
    order: 6
  },
  {
    type: 'DEGREE_DIPLOMA',
    label: 'Degree / Diploma',
    description: 'University degree or diploma certificate (if no degree, not required)',
    required: false,
    category: 'ACADEMIC',
    order: 7
  },
  {
    type: 'EXPERIENCE_LETTER',
    label: 'Experience Letter',
    description: 'Work experience letters from previous employers',
    required: false,
    category: 'PROFESSIONAL',
    order: 8
  },
  {
    type: 'LANGUAGE_CERTIFICATE',
    label: 'Language Certificate',
    description: 'Language proficiency certificates or any other extra-curricular activity certificates',
    required: false,
    category: 'ACADEMIC',
    order: 9
  },
  {
    type: 'EXTRACURRICULAR_CERTIFICATE',
    label: 'Extra-curricular Certificate',
    description: 'Certificates for extra-curricular activities, sports, or achievements',
    required: false,
    category: 'OTHER',
    order: 10
  },
  {
    type: 'AFFIDAVIT',
    label: 'Affidavit',
    description: 'Affidavit (only if the name differs across documents)',
    required: false,
    category: 'LEGAL',
    order: 11
  },
  {
    type: 'POLICE_CLEARANCE',
    label: 'Police Clearance',
    description: 'Police clearance certificate (mandatory for Au Pair roles; for others, not mandatory but preferred if available)',
    required: false,
    category: 'LEGAL',
    order: 12
  }
];

async function seedRequirements() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    let created = 0;
    let skipped = 0;
    let updated = 0;

    for (const req of requirements) {
      const existing = await DocumentRequirement.findOne({ type: req.type });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${req.label} (already exists)`);
        skipped++;
      } else {
        await DocumentRequirement.create({
          ...req,
          active: true
        });
        console.log(`✅ Created: ${req.label}`);
        created++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${requirements.length}`);

    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding requirements:', error);
    process.exit(1);
  }
}

seedRequirements();
