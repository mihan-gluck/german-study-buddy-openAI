// routes/meetingLink.js
const express = require('express');
const router = express.Router();
const MeetingLink = require('../models/MeetingLink');
const { checkRole } = require('../middleware/auth');

// Add links
router.post('/', async (req, res) => {
  try {
    const meetingLink = new MeetingLink({
        teacherId: req.body.teacherId,
        batch: req.body.batch,
        medium: req.body.medium,
        platform: req.body.platform,
        link: req.body.link
    });
   

    const saved = await meetingLink.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('Error saving link:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all meeting links for a specific teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const links = await MeetingLink.find({ teacherId }).sort({ createdAt: -1 });

    if (!links || links.length === 0) {
      return res.status(404).json({ success: false, message: 'No meeting links found for this teacher' });
    }

    res.status(200).json({ success: true, data: links });
  } catch (err) {
    console.error('Error fetching meeting links:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update meeting link by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { batch, medium, platform, link } = req.body;

    const updatedLink = await MeetingLink.findByIdAndUpdate(
      id,
      { batch, medium, platform, link },
      { new: true } // returns updated document
    );

    if (!updatedLink) {
      return res.status(404).json({ success: false, message: 'Meeting link not found' });
    }

    res.status(200).json({ success: true, data: updatedLink });
  } catch (err) {
    console.error('Error updating meeting link:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get single meeting link by ID
router.get('/:id', async (req, res) => {
  try {
    const link = await MeetingLink.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Meeting link not found' });
    }
    res.status(200).json({ success: true, data: link });
  } catch (err) {
    console.error('Error fetching meeting link:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});



module.exports = router;