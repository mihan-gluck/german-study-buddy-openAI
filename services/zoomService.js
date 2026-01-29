// services/zoomService.js

const axios = require('axios');
const zoomConfig = require('../config/zoomConfig');

class ZoomService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get Zoom Access Token using Server-to-Server OAuth
   */
  async getAccessToken() {
    try {
      // Check if token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔑 Fetching new Zoom access token...');

      const credentials = Buffer.from(
        `${zoomConfig.clientId}:${zoomConfig.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        `${zoomConfig.oauthUrl}?grant_type=account_credentials&account_id=${zoomConfig.accountId}`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      console.log('✅ Zoom access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  /**
   * Create a Zoom meeting
   * @param {Object} meetingData - Meeting configuration
   * @returns {Object} Created meeting details
   */
  async createMeeting(meetingData) {
    try {
      const token = await this.getAccessToken();

      const {
        topic,
        startTime,
        duration,
        timezone = 'Asia/Colombo',
        agenda,
        attendees = [],
        settings = {}
      } = meetingData;

      // Prepare meeting payload
      const payload = {
        topic: topic || 'German Language Class',
        type: zoomConfig.meetingTypes.SCHEDULED,
        start_time: startTime, // Format: "2024-01-15T10:00:00Z"
        duration: duration || 60, // in minutes
        timezone: timezone,
        agenda: agenda || 'German language learning session',
        settings: {
          ...zoomConfig.defaultSettings,
          ...settings,
          // Enforce video settings - participants join with video on
          host_video: true,
          participant_video: true,
          // No waiting room - direct entry for all participants
          waiting_room: false,
          // Allow joining before host (teacher can start meeting)
          join_before_host: true,
          // Mute on entry (but video stays on)
          mute_upon_entry: true,
          // Registration and approval settings
          approval_type: 2, // Registration required (cannot join without registering)
          registration_type: 1, // Email verification required
          // ✅ DISABLE Zoom's email notifications (we'll use our own)
          registrants_email_notification: false, // ❌ Disabled - using our email system
          registrants_confirmation_email: false, // ❌ Disabled - using our email system
          alternative_hosts_email_notification: false // ❌ Disabled
        }
      };

      // Try to add alternative host if provided (optional - may fail if user not licensed)
      if (meetingData.teacherEmail) {
        payload.settings.alternative_hosts = meetingData.teacherEmail;
        payload.settings.alternative_hosts_email_notification = true;
      }

      console.log('📅 Creating Zoom meeting:', payload.topic);

      let response;
      try {
        response = await axios.post(
          `${zoomConfig.apiBaseUrl}/users/me/meetings`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (error) {
        // If alternative host fails, try again without it
        if (error.response?.data?.code === 1114 && payload.settings.alternative_hosts) {
          console.log('⚠️ Alternative host failed, creating meeting without alternative host...');
          delete payload.settings.alternative_hosts;
          delete payload.settings.alternative_hosts_email_notification;
          
          response = await axios.post(
            `${zoomConfig.apiBaseUrl}/users/me/meetings`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          throw error;
        }
      }

      const meeting = response.data;

      console.log('✅ Zoom meeting created successfully:', meeting.id);

      // Add registrants if provided
      if (attendees && attendees.length > 0) {
        console.log(`👥 Adding ${attendees.length} attendees to meeting...`);
        await this.addRegistrants(meeting.id, attendees);
      }

      return {
        success: true,
        meeting: {
          id: meeting.id,
          meetingId: meeting.id,
          topic: meeting.topic,
          startTime: meeting.start_time,
          duration: meeting.duration,
          timezone: meeting.timezone,
          joinUrl: meeting.join_url,
          startUrl: meeting.start_url,
          password: meeting.password,
          hostEmail: meeting.host_email,
          agenda: meeting.agenda,
          status: meeting.status,
          createdAt: meeting.created_at
        }
      };
    } catch (error) {
      console.error('❌ Error creating Zoom meeting:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create Zoom meeting');
    }
  }

  /**
   * Add registrants to a meeting
   * @param {String} meetingId - Zoom meeting ID
   * @param {Array} attendees - Array of attendee objects with email and name
   * @param {Boolean} sendEmail - Whether to send email notification (default: true)
   */
  async addRegistrants(meetingId, attendees, sendEmail = true) {
    try {
      const token = await this.getAccessToken();
      const results = [];

      for (const attendee of attendees) {
        try {
          const response = await axios.post(
            `${zoomConfig.apiBaseUrl}/meetings/${meetingId}/registrants`,
            {
              email: attendee.email,
              first_name: attendee.firstName || attendee.name?.split(' ')[0] || 'Student',
              last_name: attendee.lastName || attendee.name?.split(' ').slice(1).join(' ') || '',
              auto_approve: true // Automatically approve registration
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              params: {
                occurrence_ids: undefined // For all occurrences
              }
            }
          );

          results.push({
            email: attendee.email,
            name: attendee.name,
            success: true,
            registrantId: response.data.registrant_id,
            joinUrl: response.data.join_url
          });

          console.log(`✅ Added registrant: ${attendee.email}${sendEmail ? ' (email sent)' : ''}`);
        } catch (error) {
          console.error(`❌ Failed to add registrant ${attendee.email}:`, error.response?.data || error.message);
          results.push({
            email: attendee.email,
            name: attendee.name,
            success: false,
            error: error.response?.data?.message || 'Failed to add registrant'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error adding registrants:', error.message);
      throw error;
    }
  }

  /**
   * Get meeting details
   * @param {String} meetingId - Zoom meeting ID
   */
  async getMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${zoomConfig.apiBaseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('❌ Error getting meeting details:', error.response?.data || error.message);
      throw new Error('Failed to get meeting details');
    }
  }

  /**
   * Update a meeting
   * @param {String} meetingId - Zoom meeting ID
   * @param {Object} updateData - Data to update
   */
  async updateMeeting(meetingId, updateData) {
    try {
      const token = await this.getAccessToken();

      // ✅ DISABLE Zoom's email notifications (we use our own email system)
      if (updateData.settings) {
        updateData.settings.registrants_email_notification = false; // ❌ Disabled
      } else {
        updateData.settings = {
          registrants_email_notification: false // ❌ Disabled
        };
      }

      const response = await axios.patch(
        `${zoomConfig.apiBaseUrl}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Meeting updated successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating meeting:', error.response?.data || error.message);
      throw new Error('Failed to update meeting');
    }
  }

  /**
   * Delete a meeting
   * @param {String} meetingId - Zoom meeting ID
   * @param {Object} options - Deletion options
   */
  async deleteMeeting(meetingId, options = {}) {
    try {
      const token = await this.getAccessToken();

      // ✅ DISABLE Zoom's cancellation emails (we send our own)
      const params = {
        schedule_for_reminder: false, // ❌ Don't send Zoom cancellation email
        cancel_meeting_reminder: false // ❌ Don't send Zoom reminder
      };

      await axios.delete(
        `${zoomConfig.apiBaseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: params
        }
      );

      console.log('✅ Meeting deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting meeting:', error.response?.data || error.message);
      throw new Error('Failed to delete meeting');
    }
  }

  /**
   * Get meeting participants (for attendance tracking)
   * @param {String} meetingId - Zoom meeting ID
   */
  async getMeetingParticipants(meetingId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${zoomConfig.apiBaseUrl}/past_meetings/${meetingId}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page_size: 300 // Get up to 300 participants
          }
        }
      );

      const participants = response.data.participants || [];
      
      // Process and format participant data
      return participants.map(p => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        email: p.user_email,
        joinTime: p.join_time,
        leaveTime: p.leave_time,
        duration: p.duration, // in seconds
        durationMinutes: Math.round(p.duration / 60), // convert to minutes
        attentiveness_score: p.attentiveness_score,
        status: p.status,
        participantUserId: p.participant_user_id
      }));
    } catch (error) {
      console.error('❌ Error getting participants:', error.response?.data || error.message);
      
      // If meeting hasn't ended yet, return empty array
      if (error.response?.status === 404) {
        console.log('ℹ️ Meeting not found or hasn\'t ended yet');
        return [];
      }
      
      throw new Error('Failed to get meeting participants');
    }
  }

  /**
   * Get participant QoS (Quality of Service) data including camera/mic usage
   * @param {String} meetingId - Zoom meeting ID
   * @param {String} participantId - Participant ID
   */
  async getParticipantQoS(meetingId, participantId) {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${zoomConfig.apiBaseUrl}/metrics/meetings/${meetingId}/participants/${participantId}/qos`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const qos = response.data;
      
      // Extract video and audio data
      const videoData = qos.user_qos?.video_input || [];
      const audioData = qos.user_qos?.audio_input || [];
      
      // Calculate camera on time
      let cameraOnSeconds = 0;
      videoData.forEach(segment => {
        if (segment.bitrate && segment.bitrate !== '0') {
          // If bitrate exists, camera was on during this segment
          cameraOnSeconds += (segment.frame_rate || 0) > 0 ? 1 : 0;
        }
      });

      // Calculate mic on time
      let micOnSeconds = 0;
      audioData.forEach(segment => {
        if (segment.bitrate && segment.bitrate !== '0') {
          micOnSeconds += 1;
        }
      });

      return {
        participantId: participantId,
        cameraOnSeconds: cameraOnSeconds,
        cameraOnMinutes: Math.round(cameraOnSeconds / 60),
        micOnSeconds: micOnSeconds,
        micOnMinutes: Math.round(micOnSeconds / 60),
        videoQuality: qos.user_qos?.video_input?.[0] || {},
        audioQuality: qos.user_qos?.audio_input?.[0] || {},
        connectionQuality: qos.user_qos?.cpu_usage || {}
      };
    } catch (error) {
      console.error('❌ Error getting participant QoS:', error.response?.data || error.message);
      
      // Return default values if QoS data not available
      return {
        participantId: participantId,
        cameraOnSeconds: 0,
        cameraOnMinutes: 0,
        micOnSeconds: 0,
        micOnMinutes: 0,
        dataAvailable: false
      };
    }
  }

  /**
   * Get detailed participant engagement metrics
   * @param {String} meetingId - Zoom meeting ID
   */
  async getParticipantEngagement(meetingId) {
    try {
      const token = await this.getAccessToken();

      // Get basic participant data
      const participants = await this.getMeetingParticipants(meetingId);

      // Get QoS data for each participant
      const engagementData = await Promise.all(
        participants.map(async (participant) => {
          try {
            const qos = await this.getParticipantQoS(meetingId, participant.id);
            
            return {
              ...participant,
              engagement: {
                cameraOnMinutes: qos.cameraOnMinutes,
                cameraOnSeconds: qos.cameraOnSeconds,
                micOnMinutes: qos.micOnMinutes,
                micOnSeconds: qos.micOnSeconds,
                cameraOnPercentage: participant.duration > 0 
                  ? Math.round((qos.cameraOnSeconds / participant.duration) * 100)
                  : 0,
                micOnPercentage: participant.duration > 0
                  ? Math.round((qos.micOnSeconds / participant.duration) * 100)
                  : 0
              }
            };
          } catch (error) {
            console.error(`Failed to get QoS for participant ${participant.name}:`, error.message);
            return {
              ...participant,
              engagement: {
                cameraOnMinutes: 0,
                cameraOnSeconds: 0,
                micOnMinutes: 0,
                micOnSeconds: 0,
                cameraOnPercentage: 0,
                micOnPercentage: 0,
                dataAvailable: false
              }
            };
          }
        })
      );

      return engagementData;
    } catch (error) {
      console.error('❌ Error getting participant engagement:', error.message);
      throw new Error('Failed to get participant engagement data');
    }
  }

  /**
   * Get detailed meeting report with all metrics
   * @param {String} meetingId - Zoom meeting ID
   */
  async getMeetingReport(meetingId) {
    try {
      const token = await this.getAccessToken();

      // Get meeting details
      const meetingResponse = await axios.get(
        `${zoomConfig.apiBaseUrl}/past_meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const meeting = meetingResponse.data;

      // Get participants
      const participants = await this.getMeetingParticipants(meetingId);

      return {
        success: true,
        meeting: {
          id: meeting.id,
          uuid: meeting.uuid,
          topic: meeting.topic,
          startTime: meeting.start_time,
          endTime: meeting.end_time,
          duration: meeting.duration, // in minutes
          totalMinutes: meeting.duration,
          participantsCount: meeting.participants_count,
          hostId: meeting.host_id
        },
        participants: participants,
        summary: {
          totalParticipants: participants.length,
          averageDuration: participants.length > 0 
            ? Math.round(participants.reduce((sum, p) => sum + p.durationMinutes, 0) / participants.length)
            : 0,
          totalAttendanceMinutes: participants.reduce((sum, p) => sum + p.durationMinutes, 0)
        }
      };
    } catch (error) {
      console.error('❌ Error getting meeting report:', error.response?.data || error.message);
      throw new Error('Failed to get meeting report');
    }
  }

  /**
   * List all meetings for the user
   */
  async listMeetings() {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${zoomConfig.apiBaseUrl}/users/me/meetings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data.meetings || [];
    } catch (error) {
      console.error('❌ Error listing meetings:', error.response?.data || error.message);
      throw new Error('Failed to list meetings');
    }
  }
}

module.exports = new ZoomService();
