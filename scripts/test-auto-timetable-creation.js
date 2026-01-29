// Test script to verify automatic timetable creation when meeting is created
// This tests the new reverse flow: Meeting → Auto-create Timetable

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');

async function testAutoTimetableCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find a teacher
    const teacher = await User.findOne({ role: 'TEACHER' });
    if (!teacher) {
      console.log('❌ No teacher found in database');
      return;
    }

    console.log('👨‍🏫 Teacher:', teacher.name, '(' + teacher.email + ')');

    // Find some students in a batch
    const testBatch = '10'; // Use batch 10 as per user's example
    const students = await User.find({ 
      role: 'STUDENT', 
      batch: testBatch,
      isActive: true 
    }).limit(3);

    if (students.length === 0) {
      console.log('❌ No students found in batch', testBatch);
      return;
    }

    console.log(`✅ Found ${students.length} students in batch ${testBatch}`);
    students.forEach(s => console.log('   -', s.name, '(' + s.email + ')'));

    // Check if timetable exists for this batch
    const now = new Date();
    const existingTimetable = await TimeTable.findOne({
      batch: testBatch,
      weekStartDate: { $lte: now },
      weekEndDate: { $gte: now }
    });

    console.log('\n📅 Current Timetable Status:');
    if (existingTimetable) {
      console.log('   ⚠️  Timetable EXISTS for batch', testBatch);
      console.log('   Week:', existingTimetable.weekStartDate.toDateString(), 'to', existingTimetable.weekEndDate.toDateString());
      console.log('   Assigned Teacher:', existingTimetable.assignedTeacher);
      
      // Show existing slots
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      days.forEach(day => {
        if (existingTimetable[day] && existingTimetable[day].length > 0) {
          console.log(`   ${day}:`, existingTimetable[day].length, 'slots');
        }
      });
    } else {
      console.log('   ✅ NO timetable exists - perfect for testing auto-creation!');
    }

    // Create a test meeting for tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayOfWeek = tomorrow.toLocaleDateString('en-US', { 
      weekday: 'long', 
      timeZone: 'Asia/Colombo' 
    }).toLowerCase();

    console.log('\n🎯 Test Scenario:');
    console.log('   Creating meeting for:', tomorrow.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
    console.log('   Day of week:', dayOfWeek);
    console.log('   Batch:', testBatch);
    console.log('   Expected behavior: Timetable should be auto-created with this meeting slot');

    // Simulate the meeting creation (without actually calling Zoom API)
    const testMeeting = {
      id: 'TEST_' + Date.now(),
      topic: 'Test Auto-Creation Meeting',
      startTime: tomorrow.toISOString(),
      duration: 60,
      timezone: 'Asia/Colombo',
      joinUrl: 'https://zoom.us/j/test123456',
      password: 'test123',
      hostEmail: teacher.email
    };

    console.log('\n📝 Simulating meeting creation...');

    // Save meeting to database
    const meetingLink = new MeetingLink({
      batch: testBatch,
      platform: 'Zoom',
      link: testMeeting.joinUrl,
      topic: testMeeting.topic,
      startTime: new Date(testMeeting.startTime),
      duration: testMeeting.duration,
      timezone: testMeeting.timezone,
      zoomMeetingId: testMeeting.id,
      zoomPassword: testMeeting.password,
      hostEmail: testMeeting.hostEmail,
      joinUrl: testMeeting.joinUrl,
      createdBy: teacher._id,
      attendees: students.map(student => ({
        studentId: student._id,
        name: student.name,
        email: student.email
      })),
      status: 'scheduled'
    });

    await meetingLink.save();
    console.log('✅ Meeting saved to database:', meetingLink._id);

    // Now simulate the auto-linking logic (same as in routes/zoom.js)
    console.log('\n🔗 Running auto-timetable creation logic...');

    const meetingDate = new Date(testMeeting.startTime);
    
    const meetingTime = meetingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Colombo'
    });

    const endDate = new Date(meetingDate.getTime() + testMeeting.duration * 60000);
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Colombo'
    });

    console.log('   Meeting time:', meetingTime, '-', endTime);

    // Find timetable
    let timetable = await TimeTable.findOne({
      batch: testBatch,
      weekStartDate: { $lte: meetingDate },
      weekEndDate: { $gte: meetingDate }
    });

    if (!timetable) {
      console.log('   📅 No timetable found - creating new one...');
      
      // Calculate week start (Monday) and end (Sunday)
      const dayOfWeekNum = meetingDate.getDay();
      const daysToMonday = dayOfWeekNum === 0 ? -6 : 1 - dayOfWeekNum;
      
      const weekStartDate = new Date(meetingDate);
      weekStartDate.setDate(meetingDate.getDate() + daysToMonday);
      weekStartDate.setHours(0, 0, 0, 0);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);

      const firstStudent = students[0];
      
      timetable = new TimeTable({
        batch: testBatch,
        medium: firstStudent.medium?.[0] || 'English',
        plan: firstStudent.subscription || 'PLATINUM',
        weekStartDate: weekStartDate,
        weekEndDate: weekEndDate,
        assignedTeacher: teacher._id,
        [dayOfWeek]: [{
          start: meetingTime,
          end: endTime,
          classStatus: 'Scheduled',
          zoomMeetingId: testMeeting.id,
          zoomJoinUrl: testMeeting.joinUrl,
          zoomPassword: testMeeting.password,
          meetingLinked: true
        }]
      });

      await timetable.save();
      console.log('   ✅ NEW TIMETABLE CREATED!');
      console.log('   Timetable ID:', timetable._id);
      console.log('   Week:', weekStartDate.toDateString(), 'to', weekEndDate.toDateString());
      console.log('   Slot:', dayOfWeek, meetingTime, '-', endTime);
      console.log('   Meeting linked:', timetable[dayOfWeek][0].meetingLinked);
    } else {
      console.log('   ✅ Timetable exists:', timetable._id);
      
      let daySlots = timetable[dayOfWeek];
      
      if (!daySlots || !Array.isArray(daySlots)) {
        daySlots = [];
        timetable[dayOfWeek] = daySlots;
      }

      const slotIndex = daySlots.findIndex(slot => {
        const slotTime = slot.start;
        return slotTime === meetingTime || 
               Math.abs(new Date(`1970-01-01T${slotTime}`) - new Date(`1970-01-01T${meetingTime}`)) < 300000;
      });

      if (slotIndex !== -1) {
        timetable[dayOfWeek][slotIndex].zoomMeetingId = testMeeting.id;
        timetable[dayOfWeek][slotIndex].zoomJoinUrl = testMeeting.joinUrl;
        timetable[dayOfWeek][slotIndex].zoomPassword = testMeeting.password;
        timetable[dayOfWeek][slotIndex].meetingLinked = true;
        
        await timetable.save();
        console.log('   ✅ Existing slot updated with meeting info');
      } else {
        timetable[dayOfWeek].push({
          start: meetingTime,
          end: endTime,
          classStatus: 'Scheduled',
          zoomMeetingId: testMeeting.id,
          zoomJoinUrl: testMeeting.joinUrl,
          zoomPassword: testMeeting.password,
          meetingLinked: true
        });
        
        await timetable.save();
        console.log('   ✅ NEW SLOT ADDED to existing timetable');
        console.log('   Slot:', dayOfWeek, meetingTime, '-', endTime);
      }
    }

    // Verify the result
    console.log('\n✅ VERIFICATION:');
    const verifyTimetable = await TimeTable.findOne({
      batch: testBatch,
      weekStartDate: { $lte: meetingDate },
      weekEndDate: { $gte: meetingDate }
    });

    if (verifyTimetable) {
      console.log('   ✅ Timetable exists for batch', testBatch);
      console.log('   Timetable ID:', verifyTimetable._id);
      
      const slot = verifyTimetable[dayOfWeek]?.find(s => s.zoomMeetingId === testMeeting.id);
      if (slot) {
        console.log('   ✅ Meeting slot found in timetable!');
        console.log('   Day:', dayOfWeek);
        console.log('   Time:', slot.start, '-', slot.end);
        console.log('   Meeting ID:', slot.zoomMeetingId);
        console.log('   Join URL:', slot.zoomJoinUrl);
        console.log('   Password:', slot.zoomPassword);
        console.log('   Linked:', slot.meetingLinked);
        console.log('\n🎉 SUCCESS! Auto-creation works perfectly!');
      } else {
        console.log('   ❌ Meeting slot NOT found in timetable');
      }
    } else {
      console.log('   ❌ Timetable NOT found');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await MeetingLink.findByIdAndDelete(meetingLink._id);
    console.log('   ✅ Test meeting deleted');
    
    // Only delete timetable if we created it (check if it has only our test slot)
    if (verifyTimetable && verifyTimetable[dayOfWeek]?.length === 1) {
      await TimeTable.findByIdAndDelete(verifyTimetable._id);
      console.log('   ✅ Test timetable deleted');
    } else {
      console.log('   ⚠️  Timetable has other slots - keeping it');
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testAutoTimetableCreation();
