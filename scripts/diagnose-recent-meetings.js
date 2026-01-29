// Diagnostic script to check recent meetings and their timetable linking status
require('dotenv').config();
const mongoose = require('mongoose');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');
const User = require('../models/User');

async function diagnoseRecentMeetings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the 5 most recent meetings
    const recentMeetings = await MeetingLink.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email role');

    if (recentMeetings.length === 0) {
      console.log('❌ No meetings found in database');
      return;
    }

    console.log(`📋 Found ${recentMeetings.length} recent meetings:\n`);

    for (const meeting of recentMeetings) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📅 Meeting: ${meeting.topic}`);
      console.log(`   ID: ${meeting._id}`);
      console.log(`   Batch: ${meeting.batch}`);
      console.log(`   Created: ${meeting.createdAt}`);
      console.log(`   Start Time: ${meeting.startTime}`);
      console.log(`   Duration: ${meeting.duration} minutes`);
      console.log(`   Zoom Meeting ID: ${meeting.zoomMeetingId}`);
      console.log(`   Created By: ${meeting.createdBy?.name || 'Unknown'} (${meeting.createdBy?.role || 'Unknown'})`);
      console.log(`   Attendees: ${meeting.attendees.length} students`);

      // Get day of week and time
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

      console.log(`   Day: ${dayOfWeek}`);
      console.log(`   Time: ${meetingTime}`);

      // Check if timetable exists for this meeting
      console.log('\n🔍 Checking for timetable...');
      
      const timetable = await TimeTable.findOne({
        batch: meeting.batch,
        weekStartDate: { $lte: meetingDate },
        weekEndDate: { $gte: meetingDate }
      });

      if (!timetable) {
        console.log('   ❌ NO TIMETABLE FOUND for this batch and week');
        console.log('   Expected: Timetable should have been auto-created');
        console.log('   Batch:', meeting.batch);
        console.log('   Week covering:', meetingDate.toDateString());
        
        // Check if any timetable exists for this batch
        const anyTimetable = await TimeTable.findOne({ batch: meeting.batch });
        if (anyTimetable) {
          console.log('\n   ℹ️  Found timetable for this batch but different week:');
          console.log('      Week:', new Date(anyTimetable.weekStartDate).toDateString(), 
                      'to', new Date(anyTimetable.weekEndDate).toDateString());
        } else {
          console.log('\n   ℹ️  No timetable exists for batch', meeting.batch, 'at all');
        }
      } else {
        console.log('   ✅ TIMETABLE FOUND:', timetable._id);
        console.log('   Week:', new Date(timetable.weekStartDate).toDateString(), 
                    'to', new Date(timetable.weekEndDate).toDateString());
        console.log('   Assigned Teacher:', timetable.assignedTeacher);
        
        // Check if this day has slots
        const daySlots = timetable[dayOfWeek];
        
        if (!daySlots || daySlots.length === 0) {
          console.log(`   ❌ NO SLOTS on ${dayOfWeek}`);
          console.log('   Expected: Slot should have been auto-created');
        } else {
          console.log(`   ✅ Found ${daySlots.length} slot(s) on ${dayOfWeek}:`);
          
          // Check if meeting is linked to any slot
          let foundLinkedSlot = false;
          daySlots.forEach((slot, index) => {
            console.log(`      Slot ${index + 1}: ${slot.start} - ${slot.end}`);
            console.log(`         Status: ${slot.classStatus}`);
            console.log(`         Zoom Meeting ID: ${slot.zoomMeetingId || 'None'}`);
            console.log(`         Meeting Linked: ${slot.meetingLinked || false}`);
            
            if (slot.zoomMeetingId === meeting.zoomMeetingId) {
              console.log('         🎉 THIS MEETING IS LINKED!');
              foundLinkedSlot = true;
            }
          });
          
          if (!foundLinkedSlot) {
            console.log(`   ⚠️  Meeting NOT linked to any slot`);
            console.log('   Expected: Meeting should be linked to a slot');
            console.log('   Meeting Time:', meetingTime);
            console.log('   Slot Times:', daySlots.map(s => s.start).join(', '));
          }
        }
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Summary
    console.log('📊 SUMMARY:');
    const linkedCount = await countLinkedMeetings();
    const totalCount = recentMeetings.length;
    console.log(`   Total recent meetings: ${totalCount}`);
    console.log(`   Linked to timetable: ${linkedCount}`);
    console.log(`   Not linked: ${totalCount - linkedCount}`);
    
    if (linkedCount < totalCount) {
      console.log('\n⚠️  ISSUE DETECTED: Some meetings are not linked to timetables');
      console.log('   This suggests the auto-creation logic may not be running');
      console.log('\n💡 POSSIBLE CAUSES:');
      console.log('   1. Server was restarted and old code is running');
      console.log('   2. Auto-creation logic is in try-catch and failing silently');
      console.log('   3. Timezone issues causing date mismatch');
      console.log('   4. Meeting created before auto-creation feature was added');
      console.log('\n🔧 SOLUTIONS:');
      console.log('   1. Restart your Node.js server to load new code');
      console.log('   2. Check server logs for "⚠️ Error linking to timetable"');
      console.log('   3. Try creating a new test meeting');
      console.log('   4. Run manual linking script for existing meetings');
    } else {
      console.log('\n✅ All recent meetings are properly linked!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

async function countLinkedMeetings() {
  const meetings = await MeetingLink.find().sort({ createdAt: -1 }).limit(5);
  let linkedCount = 0;

  for (const meeting of meetings) {
    const meetingDate = new Date(meeting.startTime);
    const dayOfWeek = meetingDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      timeZone: 'Asia/Colombo' 
    }).toLowerCase();

    const timetable = await TimeTable.findOne({
      batch: meeting.batch,
      weekStartDate: { $lte: meetingDate },
      weekEndDate: { $gte: meetingDate }
    });

    if (timetable && timetable[dayOfWeek]) {
      const hasLinkedSlot = timetable[dayOfWeek].some(
        slot => slot.zoomMeetingId === meeting.zoomMeetingId
      );
      if (hasLinkedSlot) linkedCount++;
    }
  }

  return linkedCount;
}

diagnoseRecentMeetings();
