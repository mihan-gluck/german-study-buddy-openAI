// scripts/diagnose-timetable-linking.js
// Diagnose why a meeting isn't showing in timetable

require('dotenv').config();
const mongoose = require('mongoose');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');
const User = require('../models/User');

async function diagnose(batch) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════');
    console.log('  TIMETABLE LINKING DIAGNOSTIC TOOL');
    console.log('═══════════════════════════════════════════════\n');

    // 1. Check meetings for this batch
    console.log('📋 STEP 1: Checking Meetings for Batch', batch);
    console.log('─────────────────────────────────────────────\n');

    const meetings = await MeetingLink.find({ batch: batch })
      .sort({ startTime: 1 });

    if (meetings.length === 0) {
      console.log('❌ No meetings found for Batch', batch);
      console.log('\n💡 Create a meeting first in "My Meetings"\n');
      return;
    }

    console.log(`✅ Found ${meetings.length} meeting(s):\n`);
    
    meetings.forEach((meeting, index) => {
      const meetingDate = new Date(meeting.startTime);
      const dayOfWeek = meetingDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        timeZone: 'Asia/Colombo' 
      });
      const meetingTime = meetingDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Colombo'
      });

      console.log(`  ${index + 1}. ${meeting.topic}`);
      console.log(`     ID: ${meeting._id}`);
      console.log(`     Date: ${meetingDate.toDateString()}`);
      console.log(`     Day: ${dayOfWeek}`);
      console.log(`     Time: ${meetingTime}`);
      console.log(`     Duration: ${meeting.duration} minutes`);
      console.log(`     Students: ${meeting.attendees.length}`);
      console.log('');
    });

    // 2. Check timetables for this batch
    console.log('\n📅 STEP 2: Checking Timetables for Batch', batch);
    console.log('─────────────────────────────────────────────\n');

    const timetables = await TimeTable.find({ batch: batch })
      .sort({ weekStartDate: 1 });

    if (timetables.length === 0) {
      console.log('❌ No timetables found for Batch', batch);
      console.log('\n💡 SOLUTION: Create a timetable first!');
      console.log('\nSteps:');
      console.log('1. Admin logs in');
      console.log('2. Goes to "Timetable Management"');
      console.log('3. Creates timetable for Batch', batch);
      console.log('4. Adds time slots matching meeting times\n');
      
      console.log('Meeting times to add:');
      meetings.forEach((meeting, index) => {
        const meetingDate = new Date(meeting.startTime);
        const dayOfWeek = meetingDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          timeZone: 'Asia/Colombo' 
        });
        const meetingTime = meetingDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Colombo'
        });
        console.log(`  ${index + 1}. ${dayOfWeek} at ${meetingTime}`);
      });
      console.log('');
      return;
    }

    console.log(`✅ Found ${timetables.length} timetable(s):\n`);
    
    timetables.forEach((tt, index) => {
      console.log(`  ${index + 1}. Week: ${new Date(tt.weekStartDate).toDateString()} to ${new Date(tt.weekEndDate).toDateString()}`);
      console.log(`     ID: ${tt._id}`);
      console.log(`     Assigned Teacher: ${tt.assignedTeacher}`);
      
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const slotsCount = days.reduce((sum, day) => sum + (tt[day]?.length || 0), 0);
      console.log(`     Total Slots: ${slotsCount}`);
      
      days.forEach(day => {
        if (tt[day] && tt[day].length > 0) {
          console.log(`     ${day}: ${tt[day].map(s => s.start).join(', ')}`);
        }
      });
      console.log('');
    });

    // 3. Check linking status
    console.log('\n🔗 STEP 3: Checking Linking Status');
    console.log('─────────────────────────────────────────────\n');

    let linkedCount = 0;
    let notLinkedCount = 0;

    for (const meeting of meetings) {
      const meetingDate = new Date(meeting.startTime);
      const dayOfWeek = meetingDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        timeZone: 'Asia/Colombo' 
      }).toLowerCase();
      const meetingTime = meetingDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Colombo'
      });

      console.log(`📌 ${meeting.topic}`);
      console.log(`   Date: ${meetingDate.toDateString()}`);
      console.log(`   Day: ${dayOfWeek}`);
      console.log(`   Time: ${meetingTime}`);

      // Find matching timetable
      const matchingTT = timetables.find(tt => {
        const start = new Date(tt.weekStartDate);
        const end = new Date(tt.weekEndDate);
        return meetingDate >= start && meetingDate <= end;
      });

      if (!matchingTT) {
        console.log(`   ❌ NO TIMETABLE for this week`);
        console.log(`   💡 Create timetable covering ${meetingDate.toDateString()}\n`);
        notLinkedCount++;
        continue;
      }

      console.log(`   ✅ Timetable found: ${matchingTT._id}`);

      // Check if day has slots
      const daySlots = matchingTT[dayOfWeek];
      if (!daySlots || daySlots.length === 0) {
        console.log(`   ❌ NO SLOTS for ${dayOfWeek}`);
        console.log(`   💡 Add ${dayOfWeek} slot at ${meetingTime}\n`);
        notLinkedCount++;
        continue;
      }

      // Check if time matches
      const matchingSlot = daySlots.find(slot => {
        const timeDiff = Math.abs(
          new Date(`1970-01-01T${slot.start}`) - 
          new Date(`1970-01-01T${meetingTime}`)
        );
        return timeDiff < 300000; // 5 minutes
      });

      if (!matchingSlot) {
        console.log(`   ❌ NO MATCHING TIME SLOT`);
        console.log(`   Available slots: ${daySlots.map(s => s.start).join(', ')}`);
        console.log(`   💡 Add slot at ${meetingTime} or adjust meeting time\n`);
        notLinkedCount++;
        continue;
      }

      // Check if linked
      if (matchingSlot.meetingLinked && matchingSlot.zoomMeetingId === meeting.zoomMeetingId) {
        console.log(`   ✅ LINKED to slot ${matchingSlot.start} - ${matchingSlot.end}`);
        console.log(`   🎉 This meeting shows in timetable!\n`);
        linkedCount++;
      } else {
        console.log(`   ⚠️ SLOT EXISTS but NOT LINKED`);
        console.log(`   Slot: ${matchingSlot.start} - ${matchingSlot.end}`);
        console.log(`   💡 Run manual linking script:`);
        console.log(`   node scripts/manual-link-meeting-to-timetable.js ${meeting._id}\n`);
        notLinkedCount++;
      }
    }

    // 4. Summary
    console.log('\n═══════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════\n');
    console.log(`Total Meetings: ${meetings.length}`);
    console.log(`Linked: ${linkedCount} ✅`);
    console.log(`Not Linked: ${notLinkedCount} ❌\n`);

    if (notLinkedCount > 0) {
      console.log('🔧 ACTIONS NEEDED:\n');
      console.log('1. Create timetables for missing weeks');
      console.log('2. Add time slots matching meeting times');
      console.log('3. Or run manual linking script for existing meetings\n');
    } else {
      console.log('🎉 All meetings are properly linked!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
  }
}

// Get batch from command line
const batch = process.argv[2];

if (!batch) {
  console.log('❌ Please provide a batch number');
  console.log('\nUsage: node scripts/diagnose-timetable-linking.js <batch>');
  console.log('\nExample: node scripts/diagnose-timetable-linking.js 10');
  process.exit(1);
}

diagnose(batch);
