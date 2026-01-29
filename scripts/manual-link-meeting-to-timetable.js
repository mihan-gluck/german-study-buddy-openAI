// scripts/manual-link-meeting-to-timetable.js
// Manually link an existing meeting to a timetable slot

require('dotenv').config();
const mongoose = require('mongoose');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');

async function linkMeetingToTimetable(meetingId) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the meeting
    const meeting = await MeetingLink.findById(meetingId);
    if (!meeting) {
      console.log('❌ Meeting not found');
      return;
    }

    console.log('📋 Meeting Details:');
    console.log('  Topic:', meeting.topic);
    console.log('  Batch:', meeting.batch);
    console.log('  Start Time:', meeting.startTime);
    console.log('  Zoom Meeting ID:', meeting.zoomMeetingId);

    const meetingDate = new Date(meeting.startTime);
    
    // Get day of week
    const dayOfWeek = meetingDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      timeZone: 'Asia/Colombo' 
    }).toLowerCase();
    
    // Get time in HH:MM format
    const meetingTime = meetingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Colombo'
    });

    console.log('\n🔍 Looking for timetable:');
    console.log('  Batch:', meeting.batch);
    console.log('  Day:', dayOfWeek);
    console.log('  Time:', meetingTime);
    console.log('  Date:', meetingDate.toISOString());

    // Find timetable that covers this date
    const timetable = await TimeTable.findOne({
      batch: meeting.batch,
      weekStartDate: { $lte: meetingDate },
      weekEndDate: { $gte: meetingDate }
    });

    if (!timetable) {
      console.log('\n❌ No timetable found for this batch and date');
      console.log('\n💡 Solution: Create a timetable first:');
      console.log('   - Batch:', meeting.batch);
      console.log('   - Week covering:', meetingDate.toDateString());
      console.log('   - Day:', dayOfWeek);
      console.log('   - Time:', meetingTime);
      return;
    }

    console.log('\n✅ Found timetable:', timetable._id);
    console.log('  Week:', new Date(timetable.weekStartDate).toDateString(), 
                'to', new Date(timetable.weekEndDate).toDateString());

    // Check if this day has time slots
    const daySlots = timetable[dayOfWeek];
    
    if (!daySlots || !Array.isArray(daySlots) || daySlots.length === 0) {
      console.log(`\n❌ No time slots defined for ${dayOfWeek}`);
      console.log('\n💡 Solution: Add a time slot to the timetable:');
      console.log('   - Day:', dayOfWeek);
      console.log('   - Time:', meetingTime);
      return;
    }

    console.log(`\n📅 ${dayOfWeek} slots:`, daySlots.map(s => s.start).join(', '));

    // Find matching time slot (with 5-minute tolerance)
    const slotIndex = daySlots.findIndex(slot => {
      const slotTime = slot.start;
      const timeDiff = Math.abs(
        new Date(`1970-01-01T${slotTime}`) - 
        new Date(`1970-01-01T${meetingTime}`)
      );
      return timeDiff < 300000; // 5 minutes in milliseconds
    });

    if (slotIndex === -1) {
      console.log(`\n❌ No matching time slot found for ${meetingTime}`);
      console.log('\n💡 Solution: Add a time slot to the timetable:');
      console.log('   - Day:', dayOfWeek);
      console.log('   - Time:', meetingTime);
      return;
    }

    console.log(`\n✅ Found matching slot at index ${slotIndex}:`, daySlots[slotIndex].start);

    // Update the slot with Zoom meeting info
    timetable[dayOfWeek][slotIndex].zoomMeetingId = meeting.zoomMeetingId;
    timetable[dayOfWeek][slotIndex].zoomJoinUrl = meeting.joinUrl;
    timetable[dayOfWeek][slotIndex].zoomPassword = meeting.zoomPassword;
    timetable[dayOfWeek][slotIndex].meetingLinked = true;
    
    await timetable.save();
    
    console.log('\n🎉 SUCCESS! Meeting linked to timetable slot');
    console.log('  Timetable ID:', timetable._id);
    console.log('  Day:', dayOfWeek);
    console.log('  Slot:', daySlots[slotIndex].start, '-', daySlots[slotIndex].end);
    console.log('  Zoom Meeting ID:', meeting.zoomMeetingId);
    console.log('\n✅ Students can now see this meeting in their timetable!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Get meeting ID from command line
const meetingId = process.argv[2];

if (!meetingId) {
  console.log('❌ Please provide a meeting ID');
  console.log('\nUsage: node scripts/manual-link-meeting-to-timetable.js <meetingId>');
  console.log('\nTo find meeting ID:');
  console.log('1. Go to "My Meetings" in the app');
  console.log('2. Open browser console (F12)');
  console.log('3. Look at the meeting data');
  console.log('4. Copy the _id field');
  process.exit(1);
}

linkMeetingToTimetable(meetingId);
