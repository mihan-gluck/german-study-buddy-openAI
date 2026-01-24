//app.js

require("dotenv").config();
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");

const allowedOrigins =  ['http://localhost:4200', 'http://16.170.204.125', 'http://13.62.216.210', 'https://13.62.216.210', 'https://gluckstudentsportal.com']; // frontend origin


const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const subscriptionRoutes = require("./routes/subscriptions");
const aiConversationRoutes = require("./routes/aiConversations");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student")
const User = require("./models/User");
const Course = require('./models/Course');
const profileRoutes = require('./routes/profile');
const teacherRoutes = require('./routes/teacher');
const roleProtectedRoutes = require('./routes/roleProtected');
const feedbackRoutes = require('./routes/feedback');

const profilePicUploadRoutes = require('./routes/profile');
const timeTableRoutes = require('./routes/timeTable');
const courseMaterialRoutes = require('./routes/courseMaterial');
const learningModulesRoutes = require('./routes/learningModules');
const aiTutorRoutes = require('./routes/aiTutor');
const studentProgressRoutes = require('./routes/studentProgress');
const aiModuleGeneratorRoutes = require('./routes/aiModuleGenerator');
const sessionRecordsRoutes = require('./routes/sessionRecords');
const translationRoutes = require('./routes/translation');
const moduleTrashRoutes = require('./routes/moduleTrash');
const adminAnalyticsRoutes = require('./routes/adminAnalytics');
const zoomRoutes = require('./routes/zoom');
const upgradeRequestsRoutes = require('./routes/upgradeRequests');
const studentLogRoutes = require('./routes/studentLog');
const studentDocumentsRoutes = require('./routes/studentDocuments');
const documentRequirementsRoutes = require('./routes/documentRequirements');


const app = express();
const cookieParser = require('cookie-parser');

app.set('trust proxy', true); // trust first proxy (if behind a proxy like Nginx or Heroku)

// Middleware
app.use(express.json());

app.use(cors({
  origin: allowedOrigins,
  credentials: true,           // ✅ important for sending cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser()); // Add cookie parser middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ Error connecting to MongoDB Atlas:', err));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/aiConversations', aiConversationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/protected', roleProtectedRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use('/api/timeTable', timeTableRoutes);
app.use('/api/courseMaterial', courseMaterialRoutes);
app.use('/api/learning-modules', learningModulesRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/student-progress', studentProgressRoutes);
app.use('/api/ai', aiModuleGeneratorRoutes);
app.use('/api/session-records', sessionRecordsRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/module-trash', moduleTrashRoutes);
app.use('/api/admin-analytics', adminAnalyticsRoutes);
app.use('/api/zoom', zoomRoutes);
app.use('/api/upgrade-requests', upgradeRequestsRoutes);
app.use('/api/studentLog', studentLogRoutes);
app.use('/api/student-documents', studentDocumentsRoutes);
app.use('/api/document-requirements', documentRequirementsRoutes);


app.get("/api/user/profile", auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const frontendPath = path.join(__dirname, "dist", "angular-germanbuddy", "browser");
app.use(express.static(frontendPath));


app.get("*", (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});



// Student feedback route
app.use('/api/feedback', feedbackRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 

