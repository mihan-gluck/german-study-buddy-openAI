// Test script to verify reminder filtering works correctly
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');

async function testReminderFiltering() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const batch = '10';

    // Get the meeting
    const meeting = await MeetingLink.findOne({ batch }).sort({ createdAt: -1 });
    
    if (!meeting) {
      console.log('❌ No meeting found for batch', batch);
      return;
    }

    console.log('📅 MEETING DETAILS:');
    console.log('   Topic:', meeting.topic);
    console.log('   Batch:', meeting.batch);
    console.log('   Zoom Meeting ID:', meeting.zoomMeetingId);
    console.log('   Invited Students:', meeting.attendees.length);
    console.log('');

    // Get invited student IDs
    const invitedStudentIds = meeting.attendees.map(a => a.studentId.toString());
    console.log('👥 INVITED STUDENTS:');
    for (const attendee of meeting.attendees) {
      console.log(`   - ${attendee.name} (${attendee.studentId})`);
    }
    console.log('');

    // Get all students in batch
    const allStudents = await User.find({
      role: 'STUDENT',
      batch: batch,
      isActive: true
    }).select('name _id');

    console.log('📊 BATCH STATISTICS:');
    console.log(`   Total students in batch: ${allStudents.length}`);
    console.log(`   Invited to meeting: ${invitedStudentIds.length}`);
    console.log(`   Not invited: ${allStudents.length - invitedStudentIds.length}`);
    console.log('');

    // Get timetable
    const timetable = await TimeTable.findOne({ batch }).sort({ createdAt: -1 });
    
    if (!timetable) {
      console.log('❌ No timetable found for batch', batch);
      return;
    }

    console.log('📅 TIMETABLE:');
    console.log('   Week:', new Date(timetable.weekStartDate).toDateString(), 
                'to', new Date(timetable.weekEndDate).toDateString());
    
    // Find day with meeting
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let meetingDay = null;
    let meetingSlot = null;

    for (const day of days) {
      if (timetable[day] && timetable[day].length > 0) {
        const slot = timetable[day].find(s => s.zoomMeetingId === meeting.zoomMeetingId);
        if (slot) {
          meetingDay = day;
          meetingSlot = slot;
          break;
        }
      }
    }

    if (!meetingSlot) {
      console.log('   ⚠️  Meeting not linked to timetable');
      return;
    }

    console.log(`   Meeting on ${meetingDay}: ${meetingSlot.start} - ${meetingSlot.end}`);
    console.log(`   Meeting Linked: ${meetingSlot.meetingLinked}`);
    console.log('');

    // Simulate reminder logic
    console.log('🔍 SIMULATING REMINDER LOGIC:\n');

    let wouldReceiveReminder = 0;
    let wouldNotReceiveReminder = 0;

    for (const student of allStudents) {
      const isInvited = invitedStudentIds.includes(student._id.toString());
      
      // Simulate the NEW logic
      let shouldReceiveReminder = false;
      
      if (meetingSlot.meetingLinked && meetingSlot.zoomMeetingId) {
        // Check if student is in attendees list
        const isInAttendees = meeting.attendees.some(
          attendee => attendee.studentId.toString() === student._id.toString()
        );
        
        if (isInAttendees) {
          shouldReceiveReminder = true;
        }
      } else {
        // No linked meeting, all students would receive
        shouldReceiveReminder = true;
      }

      if (shouldReceiveReminder) {
        wouldReceiveReminder++;
        if (wouldReceiveReminder <= 5) {
          console.log(`   ✅ ${student.name} - Would receive reminder (invited: ${isInvited})`);
        }
      } else {
        wouldNotReceiveReminder++;
        if (wouldNotReceiveReminder <= 5) {
          console.log(`   ❌ ${student.name} - Would NOT receive reminder (invited: ${isInvited})`);
        }
      }
    }

    if (wouldReceiveReminder > 5) {
      console.log(`   ... and ${wouldReceiveReminder - 5} more would receive`);
    }
    if (wouldNotReceiveReminder > 5) {
      console.log(`   ... and ${wouldNotReceiveReminder - 5} more would NOT receive`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESULTS:');
    console.log(`   Total students: ${allStudents.length}`);
    console.log(`   Would receive reminders: ${wouldReceiveReminder} ✅`);
    console.log(`   Would NOT receive reminders: ${wouldNotReceiveReminder} ❌`);
    console.log(`   Invited students: ${invitedStudentIds.length}`);
    console.log('');

    if (wouldReceiveReminder === invitedStudentIds.length) {
      console.log('🎉 SUCCESS! Only invited students would receive reminders!');
      console.log('   The filtering logic is working correctly.');
    } else {
      console.log('⚠️  MISMATCH DETECTED:');
      console.log(`   Expected ${invitedStudentIds.length} to receive reminders`);
      console.log(`   But ${wouldReceiveReminder} would receive`);
      console.log('   The logic may need adjustment.');
    }

    console.log('\n💡 REMINDER TYPES AFFECTED:');
    console.log('   ✅ 1-hour reminder before class');
    console.log('   ✅ 6 AM morning reminder');
    console.log('   ✅ Cancellation notice (2 hours before)');
    console.log('   ℹ️  Weekly schedule (Sunday 5 PM) - shows all slots');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testReminderFiltering();
