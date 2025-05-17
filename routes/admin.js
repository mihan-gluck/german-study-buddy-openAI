//routes/admin.js

const Subscription = require('../models/subscriptions');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post('/assign-course', authMiddleware, async (req, res) => {
  const { studentId, courseName, assistantId, apiKey } = req.body;

  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if a subscription already exists
    let subscription = await Subscription.findOne({ userId: studentId });

    const newCourse = {
      name: courseName,
      assistantId,
      apiKey,
    };

    if (!subscription) {
      subscription = new Subscription({
        userId: studentId,
        type: 'premium',
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        courses: [newCourse],
      });
    } else {
      subscription.type = 'premium';
      subscription.expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // extend
      subscription.courses.push(newCourse);
      subscription.updatedAt = new Date();
    }

    await subscription.save();
    return res.status(201).json({ message: 'Course assigned successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error assigning course', error: err });
  }
});
