// Quick fix script to manually create timetable for your existing meeting
require('dotenv').config();
const mongoose = require('mongoose');
const MeetingLink = require('../models/MeetingLink');
const TimeTable = require('../models/TimeTable');
const User = require('../models/User');

async function fixExistingMeeting() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get your recent meeting
    const meetingId = '697bbf3f453d28ec152890ad'; // Your meeting ID
    
    console.log('🔍 Looking for meeting:', meetingId);
    const meeting = await MeetingLink.findById(meetingId)
      .populate('createdBy', 'name email');

    if (!meeting) {
      console.log('❌ Meeting not found');
      return;
    }

    console.log('✅ Found meeting:', meeting.topic);
    console.log('   Batch:', meeting.batch);
    console.log('   Start Time:', meeting.startTime);
    console.log('   Zoom Meeting ID:', meeting.zoomMeetingId);

    // Get meeting details
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

    const endDate = new Date(meetingDate.getTime() + meeting.duration * 60000);
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Colombo'
    });

    console.log('\n📅 Meeting Details:');
    console.log('   Day:', dayOfWeek);
    console.log('   Time:', meetingTime, '-', endTime);

    // Check if timetable exists
    let timetable = await TimeTable.findOne({
      batch: meeting.batch,
      weekStartDate: { $lte: meetingDate },
      weekEndDate: { $gte: meetingDate }
    });

    if (!timetable) {
      console.log('\n📅 Creating new timetable...');
      
      // Calculate week start and end
      const dayOfWeekNum = meetingDate.getDay();
      const daysToMonday = dayOfWeekNum === 0 ? -6 : 1 - dayOfWeekNum;
      
      const weekStartDate = new Date(meetingDate);
      weekStartDate.setDate(meetingDate.getDate() + daysToMonday);
      weekStartDate.setHours(0, 0, 0, 0);
      
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);
      weekEndDate.setHours(23, 59, 59, 999);

      // Get first student for medium/plan
      const firstStudent = await User.findById(meeting.attendees[0].studentId);
      
      timetable = new TimeTable({
        batch: meeting.batch,
        medium: firstStudent?.medium?.[0] || 'English',
        plan: firstStudent?.subscription || 'PLATINUM',
        weekStartDate: weekStartDate,
        weekEndDate: weekEndDate,
        assignedTeacher: meeting.createdBy._id,
        [dayOfWeek]: [{
          start: meetingTime,
          end: endTime,
          classStatus: 'Scheduled',
          zoomMeetingId: meeting.zoomMeetingId,
          zoomJoinUrl: meeting.joinUrl,
          zoomPassword: meeting.zoomPassword,
          meetingLinked: true
        }]
      });

      await timetable.save();
      console.log('✅ NEW TIMETABLE CREATED!');
      console.log('   Timetable ID:', timetable._id);
      console.log('   Week:', weekStartDate.toDateString(), 'to', weekEndDate.toDateString());
      console.log('   Slot:', dayOfWeek, meetingTime, '-', endTime);
      console.log('   Meeting linked: true');
    } else {
      console.log('\n✅ Timetable exists:', timetable._id);
      
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
        timetable[dayOfWeek][slotIndex].zoomMeetingId = meeting.zoomMeetingId;
        timetable[dayOfWeek][slotIndex].zoomJoinUrl = meeting.joinUrl;
        timetable[dayOfWeek][slotIndex].zoomPassword = meeting.zoomPassword;
        timetable[dayOfWeek][slotIndex].meetingLinked = true;
        
        await timetable.save();
        console.log('✅ Existing slot updated with meeting info');
      } else {
        timetable[dayOfWeek].push({
          start: meetingTime,
          end: endTime,
          classStatus: 'Scheduled',
          zoomMeetingId: meeting.zoomMeetingId,
          zoomJoinUrl: meeting.joinUrl,
          zoomPassword: meeting.zoomPassword,
          meetingLinked: true
        });
        
        await timetable.save();
        console.log('✅ NEW SLOT ADDED to existing timetable');
        console.log('   Slot:', dayOfWeek, meetingTime, '-', endTime);
      }
    }

    console.log('\n🎉 SUCCESS! Meeting is now linked to timetable');
    console.log('\n✅ Students can now see this meeting in their timetable!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

fixExistingMeeting();
