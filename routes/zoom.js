// routes/zoom.js

const express = require('express');
const router = express.Router();
const zoomService = require('../services/zoomService');
const MeetingLink = require('../models/MeetingLink');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

/**
 * Create a Zoom meeting with selected students
 * POST /api/zoom/create-meeting
 */
router.post('/create-meeting', verifyToken, async (req, res) => {
  try {
    const {
      batch,
      topic,
      startTime,
      duration,
      timezone,
      agenda,
      studentIds // Array of student IDs or names
    } = req.body;

    console.log('📝 Creating Zoom meeting for batch:', batch);
    console.log('👥 Selected students:', studentIds);

    // Validate required fields
    if (!batch || !topic || !startTime || !studentIds || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batch, topic, startTime, and studentIds are required'
      });
    }

    // Get teacher's email for alternative host
    const teacher = await User.findById(req.user.id).select('email name');
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    console.log('👨‍🏫 Teacher:', teacher.name, '(' + teacher.email + ')');

    // Find students by IDs or names
    let students = [];
    
    if (studentIds[0] && typeof studentIds[0] === 'object' && studentIds[0]._id) {
      // If full student objects are passed
      students = studentIds;
    } else {
      // Find students by IDs
      students = await User.find({
        _id: { $in: studentIds },
        role: 'STUDENT'
      }).select('name email batch level');
    }

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No students found with the provided IDs'
      });
    }

    console.log(`✅ Found ${students.length} students`);

    // Prepare attendees for Zoom
    const attendees = students.map(student => ({
      email: student.email,
      name: student.name,
      firstName: student.name.split(' ')[0],
      lastName: student.name.split(' ').slice(1).join(' ') || ''
    }));

    // Create Zoom meeting
    const zoomResult = await zoomService.createMeeting({
      topic,
      startTime,
      duration: duration || 60,
      timezone: timezone || 'Asia/Colombo',
      agenda: agenda || `German Language Class - Batch ${batch}`,
      teacherEmail: teacher.email, // Add teacher as alternative host
      attendees,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        approval_type: 0 // Auto-approve
      }
    });

    if (!zoomResult.success) {
      throw new Error('Failed to create Zoom meeting');
    }

    const meeting = zoomResult.meeting;

    // Save meeting to database
    const meetingLink = new MeetingLink({
      batch,
      platform: 'Zoom',
      link: meeting.joinUrl,
      topic: meeting.topic,
      agenda: meeting.agenda,
      startTime: new Date(meeting.startTime),
      duration: meeting.duration,
      timezone: meeting.timezone,
      zoomMeetingId: meeting.id,
      zoomPassword: meeting.password,
      hostEmail: meeting.hostEmail,
      startUrl: meeting.startUrl,
      joinUrl: meeting.joinUrl,
      createdBy: req.user.id,
      attendees: students.map(student => ({
        studentId: student._id,
        name: student.name,
        email: student.email
      })),
      status: 'scheduled'
    });

    await meetingLink.save();

    console.log('✅ Meeting saved to database');

    res.status(201).json({
      success: true,
      message: `Zoom meeting created successfully with ${students.length} attendees`,
      data: {
        meetingId: meetingLink._id,
        zoomMeetingId: meeting.id,
        topic: meeting.topic,
        startTime: meeting.startTime,
        duration: meeting.duration,
        joinUrl: meeting.joinUrl,
        startUrl: meeting.startUrl,
        password: meeting.password,
        attendeesCount: students.length,
        attendees: students.map(s => ({ name: s.name, email: s.email }))
      }
    });

  } catch (error) {
    console.error('❌ Error creating Zoom meeting:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create Zoom meeting',
      error: error.toString()
    });
  }
});

/**
 * Get all meetings for teacher or admin
 * GET /api/zoom/meetings
 * - Teachers see only their own meetings
 * - Admins see all meetings from all teachers
 */
router.get('/meetings', verifyToken, async (req, res) => {
  try {
    const { status, batch } = req.query;
    
    // Get user to check role
    const user = await User.findById(req.user.id).select('role');
    
    const query = {};
    
    // If user is TEACHER, only show their meetings
    // If user is ADMIN, show all meetings
    if (user.role === 'TEACHER') {
      query.createdBy = req.user.id;
    }
    // For ADMIN, no createdBy filter - show all meetings

    if (status) query.status = status;
    if (batch) query.batch = batch;

    const meetings = await MeetingLink.find(query)
      .populate('createdBy', 'name email role')
      .populate('attendees.studentId', 'name email batch level')
      .sort({ startTime: -1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
      userRole: user.role // Include role in response for frontend
    });

  } catch (error) {
    console.error('❌ Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings'
    });
  }
});

/**
 * Get single meeting details
 * GET /api/zoom/meeting/:id
 */
router.get('/meeting/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await MeetingLink.findById(id)
      .populate('createdBy', 'name email')
      .populate('attendees.studentId', 'name email batch level subscription studentStatus');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Calculate meeting status
    const now = new Date();
    const meetingStart = new Date(meeting.startTime);
    const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

    let currentStatus = meeting.status;
    if (now >= meetingStart && now <= meetingEnd && meeting.status === 'scheduled') {
      currentStatus = 'ongoing';
    } else if (now > meetingEnd && meeting.status !== 'ended') {
      currentStatus = 'ended';
    }

    res.status(200).json({
      success: true,
      data: {
        ...meeting.toObject(),
        currentStatus,
        isOngoing: currentStatus === 'ongoing',
        hasEnded: currentStatus === 'ended',
        canJoin: now >= new Date(meetingStart.getTime() - 10 * 60000), // Can join 10 min before
        timeUntilStart: meetingStart - now,
        attendeesCount: meeting.attendees.length,
        attendedCount: meeting.attendance?.filter(a => a.attended).length || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching meeting details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meeting details'
    });
  }
});

/**
 * Get meetings for a specific student
 * GET /api/zoom/student-meetings
 * Returns all meetings where the logged-in student is an attendee
 */
router.get('/student-meetings', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all meetings where this student is an attendee
    const meetings = await MeetingLink.find({
      'attendees.studentId': studentId
    })
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 });

    // Calculate meeting status for each meeting
    const now = new Date();
    const meetingsWithStatus = meetings.map(meeting => {
      const meetingStart = new Date(meeting.startTime);
      const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

      let currentStatus = meeting.status;
      let canJoin = false;
      let timeUntilStart = meetingStart - now;

      if (now >= meetingStart && now <= meetingEnd && meeting.status === 'scheduled') {
        currentStatus = 'ongoing';
        canJoin = true;
      } else if (now > meetingEnd) {
        currentStatus = 'ended';
      } else if (now >= new Date(meetingStart.getTime() - 10 * 60000)) {
        // Can join 10 minutes before
        canJoin = true;
      }

      // Find student's join URL
      const studentAttendee = meeting.attendees.find(
        a => a.studentId && a.studentId.toString() === studentId
      );

      return {
        _id: meeting._id,
        topic: meeting.topic,
        batch: meeting.batch,
        startTime: meeting.startTime,
        duration: meeting.duration,
        teacher: {
          name: meeting.createdBy?.name || 'Unknown',
          email: meeting.createdBy?.email || ''
        },
        joinUrl: studentAttendee?.joinUrl || meeting.joinUrl,
        password: meeting.zoomPassword,
        status: meeting.status,
        currentStatus: currentStatus,
        canJoin: canJoin,
        isOngoing: currentStatus === 'ongoing',
        hasEnded: currentStatus === 'ended',
        timeUntilStart: timeUntilStart,
        agenda: meeting.agenda
      };
    });

    res.status(200).json({
      success: true,
      count: meetingsWithStatus.length,
      data: meetingsWithStatus
    });

  } catch (error) {
    console.error('❌ Error fetching student meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings'
    });
  }
});

/**
 * Get students by batch for selection
 * GET /api/zoom/students/:batch
 */
router.get('/students/:batch', verifyToken, async (req, res) => {
  try {
    const { batch } = req.params;

    const students = await User.find({
      role: 'STUDENT',
      batch: batch,
      isActive: true
    })
    .select('name email batch level subscription studentStatus')
    .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('❌ Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

/**
 * Get all students (for multi-batch selection)
 * GET /api/zoom/students
 */
router.get('/students', verifyToken, async (req, res) => {
  try {
    const { batch, level, subscription } = req.query;
    
    const query = {
      role: 'STUDENT',
      isActive: true
    };

    if (batch) query.batch = batch;
    if (level) query.level = level;
    if (subscription) query.subscription = subscription;

    const students = await User.find(query)
      .select('name email batch level subscription studentStatus')
      .sort({ batch: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });

  } catch (error) {
    console.error('❌ Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students'
    });
  }
});

/**
 * Update meeting (add/remove attendees)
 * PUT /api/zoom/meeting/:id/attendees
 */
router.put('/meeting/:id/attendees', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { addStudentIds, removeStudentIds } = req.body;

    const meeting = await MeetingLink.findById(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Add new students
    if (addStudentIds && addStudentIds.length > 0) {
      const newStudents = await User.find({
        _id: { $in: addStudentIds },
        role: 'STUDENT'
      }).select('name email');

      const attendees = newStudents.map(student => ({
        email: student.email,
        name: student.name
      }));

      // Add to Zoom
      await zoomService.addRegistrants(meeting.zoomMeetingId, attendees);

      // Add to database
      newStudents.forEach(student => {
        meeting.attendees.push({
          studentId: student._id,
          name: student.name,
          email: student.email
        });
      });
    }

    // Remove students
    if (removeStudentIds && removeStudentIds.length > 0) {
      meeting.attendees = meeting.attendees.filter(
        attendee => !removeStudentIds.includes(attendee.studentId.toString())
      );
    }

    await meeting.save();

    res.status(200).json({
      success: true,
      message: 'Attendees updated successfully',
      data: meeting
    });

  } catch (error) {
    console.error('❌ Error updating attendees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendees'
    });
  }
});

/**
 * Delete Zoom meeting
 * DELETE /api/zoom/meeting/:id
 */
router.delete('/meeting/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await MeetingLink.findById(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Delete from Zoom
    if (meeting.zoomMeetingId) {
      await zoomService.deleteMeeting(meeting.zoomMeetingId);
    }

    // Delete from database
    await MeetingLink.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meeting'
    });
  }
});

/**
 * Get meeting participants for attendance
 * GET /api/zoom/meeting/:meetingId/participants
 */
router.get('/meeting/:meetingId/participants', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.params;

    const participants = await zoomService.getMeetingParticipants(meetingId);

    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants
    });

  } catch (error) {
    console.error('❌ Error fetching participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants'
    });
  }
});

/**
 * Get detailed meeting report with attendance
 * GET /api/zoom/meeting/:meetingId/report
 */
router.get('/meeting/:meetingId/report', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.params;

    const report = await zoomService.getMeetingReport(meetingId);

    res.status(200).json(report);

  } catch (error) {
    console.error('❌ Error fetching meeting report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch meeting report'
    });
  }
});

/**
 * Get attendance for a specific meeting from database
 * GET /api/zoom/meeting/:id/attendance
 */
router.get('/meeting/:id/attendance', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await MeetingLink.findById(id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if meeting has ended
    const now = new Date();
    const meetingEndTime = new Date(meeting.startTime.getTime() + meeting.duration * 60000);
    
    if (now < meetingEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Meeting has not ended yet. Attendance data will be available after the meeting ends.'
      });
    }

    // Fetch attendance from Zoom
    let zoomReport;
    try {
      zoomReport = await zoomService.getMeetingReport(meeting.zoomMeetingId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Attendance data not yet available. Please try again in a few minutes after the meeting ends.'
      });
    }

    // Match Zoom participants with registered students
    const attendanceData = meeting.attendees.map(attendee => {
      const participant = zoomReport.participants.find(p => 
        p.email?.toLowerCase() === attendee.email?.toLowerCase() ||
        p.name?.toLowerCase().includes(attendee.name?.toLowerCase())
      );

      return {
        studentId: attendee.studentId,
        name: attendee.name,
        email: attendee.email,
        attended: !!participant,
        joinTime: participant?.joinTime || null,
        leaveTime: participant?.leaveTime || null,
        duration: participant?.duration || 0,
        durationMinutes: participant?.durationMinutes || 0,
        status: participant ? 'attended' : 'absent'
      };
    });

    // Update meeting with attendance data
    meeting.attendance = attendanceData;
    meeting.attendanceRecorded = true;
    meeting.attendanceRecordedAt = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      data: {
        meetingId: meeting._id,
        zoomMeetingId: meeting.zoomMeetingId,
        topic: meeting.topic,
        startTime: meeting.startTime,
        duration: meeting.duration,
        totalStudents: meeting.attendees.length,
        attendedCount: attendanceData.filter(a => a.attended).length,
        absentCount: attendanceData.filter(a => !a.attended).length,
        attendance: attendanceData,
        summary: zoomReport.summary
      }
    });

  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data'
    });
  }
});

/**
 * Get participant engagement metrics (camera/mic usage)
 * GET /api/zoom/meeting/:meetingId/engagement
 */
router.get('/meeting/:meetingId/engagement', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.params;

    console.log('📊 Fetching engagement data for meeting:', meetingId);

    const engagementData = await zoomService.getParticipantEngagement(meetingId);

    res.status(200).json({
      success: true,
      count: engagementData.length,
      data: engagementData,
      summary: {
        totalParticipants: engagementData.length,
        averageCameraOnTime: Math.round(
          engagementData.reduce((sum, p) => sum + (p.engagement?.cameraOnMinutes || 0), 0) / engagementData.length
        ),
        averageMicOnTime: Math.round(
          engagementData.reduce((sum, p) => sum + (p.engagement?.micOnMinutes || 0), 0) / engagementData.length
        ),
        averageCameraOnPercentage: Math.round(
          engagementData.reduce((sum, p) => sum + (p.engagement?.cameraOnPercentage || 0), 0) / engagementData.length
        )
      }
    });

  } catch (error) {
    console.error('❌ Error fetching engagement data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch engagement data'
    });
  }
});

/**
 * Get STUDENT engagement metrics only (excludes teachers/hosts)
 * GET /api/zoom/meeting/:meetingId/engagement/students
 */
router.get('/meeting/:meetingId/engagement/students', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.params;

    console.log('📊 Fetching STUDENT engagement data for meeting:', meetingId);

    const engagementData = await zoomService.getParticipantEngagement(meetingId);

    // Get meeting from database to identify registered students
    const meeting = await MeetingLink.findOne({ zoomMeetingId: meetingId });
    
    let studentData;
    
    if (meeting && meeting.attendees && meeting.attendees.length > 0) {
      // Filter by registered student emails
      const studentEmails = meeting.attendees.map(a => a.email.toLowerCase());
      studentData = engagementData.filter(p => 
        p.email && studentEmails.includes(p.email.toLowerCase())
      );
    } else {
      // Fallback: Exclude hosts and co-hosts
      studentData = engagementData.filter(p => {
        const email = p.email?.toLowerCase() || '';
        const name = p.name?.toLowerCase() || '';
        
        // Exclude if email contains teacher/admin/host keywords
        const isTeacher = email.includes('teacher') || 
                         email.includes('admin') || 
                         email.includes('gluckglobal.com') ||
                         name.includes('host') ||
                         name.includes('teacher');
        
        return !isTeacher;
      });
    }

    res.status(200).json({
      success: true,
      count: studentData.length,
      data: studentData,
      summary: {
        totalStudents: studentData.length,
        averageCameraOnTime: studentData.length > 0 ? Math.round(
          studentData.reduce((sum, p) => sum + (p.engagement?.cameraOnMinutes || 0), 0) / studentData.length
        ) : 0,
        averageMicOnTime: studentData.length > 0 ? Math.round(
          studentData.reduce((sum, p) => sum + (p.engagement?.micOnMinutes || 0), 0) / studentData.length
        ) : 0,
        averageCameraOnPercentage: studentData.length > 0 ? Math.round(
          studentData.reduce((sum, p) => sum + (p.engagement?.cameraOnPercentage || 0), 0) / studentData.length
        ) : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching student engagement data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student engagement data'
    });
  }
});

/**
 * Get TEACHER/HOST engagement metrics only
 * GET /api/zoom/meeting/:meetingId/engagement/teacher
 */
router.get('/meeting/:meetingId/engagement/teacher', verifyToken, async (req, res) => {
  try {
    const { meetingId } = req.params;

    console.log('📊 Fetching TEACHER engagement data for meeting:', meetingId);

    const engagementData = await zoomService.getParticipantEngagement(meetingId);

    // Get meeting from database to identify the teacher
    const meeting = await MeetingLink.findOne({ zoomMeetingId: meetingId })
      .populate('createdBy', 'name email');
    
    let teacherData;
    
    if (meeting && meeting.hostEmail) {
      // Find by host email
      teacherData = engagementData.find(p => 
        p.email?.toLowerCase() === meeting.hostEmail.toLowerCase()
      );
    } else if (meeting && meeting.createdBy) {
      // Find by creator email
      teacherData = engagementData.find(p => 
        p.email?.toLowerCase() === meeting.createdBy.email.toLowerCase()
      );
    } else {
      // Fallback: Find hosts/co-hosts or teacher emails
      teacherData = engagementData.find(p => {
        const email = p.email?.toLowerCase() || '';
        const name = p.name?.toLowerCase() || '';
        
        return email.includes('teacher') || 
               email.includes('admin') || 
               email.includes('gluckglobal.com') ||
               name.includes('host') ||
               name.includes('teacher');
      });
    }

    if (!teacherData) {
      return res.status(404).json({
        success: false,
        message: 'Teacher/host data not found in meeting'
      });
    }

    res.status(200).json({
      success: true,
      data: teacherData,
      summary: {
        name: teacherData.name,
        email: teacherData.email,
        cameraOnTime: teacherData.engagement?.cameraOnMinutes || 0,
        cameraOnPercentage: teacherData.engagement?.cameraOnPercentage || 0,
        micOnTime: teacherData.engagement?.micOnMinutes || 0,
        micOnPercentage: teacherData.engagement?.micOnPercentage || 0,
        totalDuration: teacherData.durationMinutes || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching teacher engagement data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teacher engagement data'
    });
  }
});

module.exports = router;
