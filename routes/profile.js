//routes/profile.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');

// GET /api/profile - Get logged-in user's profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    let profileData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      registeredAt: user.registeredAt,
    };

    // Add role-specific fields
    if (user.role === 'student') {
      profileData.courseAssigned = user.courseAssigned;
      profileData.vapiAccess = user.vapiAccess;
    }

    if (user.role === 'admin') {
      profileData.isAdmin = true;
    }

    if (user.role === 'teacher') {
      profileData.assignedCourses = user.assignedCourses || [];
    }

    res.json({ success: true, user: profileData });
  } catch (err) {
    console.error('Error getting profile:', err);
    res.status(500).json({ success: false, msg: 'Error fetching profile', error: err.message });
  }
});


// PUT /api/profile/update
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, msg: 'Name and email are required' });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true, runValidators: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({ success: true, msg: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error(`Error updating profile for user ${req.user.userId}:`, err);
    res.status(500).json({ success: false, msg: 'Error updating profile', error: err.message });
  }
});


// PUT /api/profile/update-password
router.put('/update-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, msg: 'Please provide both current and new passwords' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, msg: 'Current password is incorrect' });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ success: true, msg: 'Password updated successfully' });
  } catch (err) {
    console.error(`Password update error for user ${req.user.userId}:`, err);
    res.status(500).json({ success: false, msg: 'Error updating password', error: err.message });
  }
});

// POST /api/profile/upload-photo - Upload profile photo
router.post('/upload-photo', verifyToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Update user profilePhoto field with the file path or URL
    // You can store just the relative path or full URL if you have a CDN or domain
    const photoPath = `/uploads/profile-photos/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profilePhoto: photoPath, updatedAt: new Date() },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ msg: 'Profile photo uploaded successfully', profilePhoto: photoPath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Error uploading photo', error: err.message });
  }
});

module.exports = router;



