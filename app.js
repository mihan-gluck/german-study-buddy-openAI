//app.js

require("dotenv").config();
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");
//const { verifyToken, isAdmin} = require('./middleware/auth');

const allowedOrigins = ['http://localhost:4200']; // frontend origin



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
const vapiUsageRoutes = require('./routes/vapiUsage');
const elevenlabsUsageRoutes = require('./routes/elevenlabsusage');
const profilePicUploadRoutes = require('./routes/profile');
const timeTableRoutes = require('./routes/timeTable');
const meetingLinkRoutes = require('./routes/meetingLink');
const courseMaterialRoutes = require('./routes/courseMaterial');


const app = express();
const cookieParser = require('cookie-parser');


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

/* mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
})
.catch((err) => {
  console.error("❌ Error connecting to MongoDB Atlas:", err);
}); */

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
//app.use('/api/verifyToken, isAdmin', auth);
app.use('/api/courses', courseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/aiConversations', aiConversationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/protected', roleProtectedRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/vapiUsage', vapiUsageRoutes);
app.use('/api/elevenlabs-usage', elevenlabsUsageRoutes);
app.use('/api/timeTable', timeTableRoutes);
app.use('/api/meetingLink', meetingLinkRoutes);
app.use('/api/courseMaterial', courseMaterialRoutes);



// Protected user profile route
app.get("/api/user/profile", auth.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Angular frontend only for non-API routes in production
const frontendPath = path.join(__dirname, "dist", "angular-germanbuddy", "browser");
app.use(express.static(frontendPath));

// Serve uploads
// app.use('/uploads', express.static('uploads')); 

// Serve static files (images)
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("*", (req, res) => {
  //if it's not an API call, return Angular app
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
  //res.sendFile(path.join(frontendPath, "dist/angular-germanbuddy/index.html"));
});

// server.js or routes/vapi.js
app.post('/api/vapi-usage', (req, res) => {
  /* const { course, assistantID, duration, timestamp } = req.body;

  // Store in DB or log
  console.log(`VAPI USAGE LOG:`, { course, assistantID, duration, timestamp });

  res.status(200).send({ message: 'Usage logged successfully' }); */
});

// Route for routes/vapuUsage.js
app.use('/api/vapi-usage', vapiUsageRoutes);

// Student feedback route
app.use('/api/feedback', feedbackRoutes);


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 


/*require("dotenv").config();
const express = require("express");
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const auth = require("./middleware/auth");
//const bodyParser = require("body-parser");

// Import Routes
const authRoutes = require("./routes/auth");
const User = require("./models/User");

// Initialize Express App
const app = express();


// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS
//app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/germanbuddy-1-2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Use Routes
const courseRoutes = require("./routes/courses");
const subscriptionRoutes = require("./routes/subscriptions");
const aiConversationRoutes = require("./routes/aiConversations");

// backend app.js
app.use('/api/auth', authRoutes)
// app.use("/auth", authRoutes);

// courses, subscriptions, aiConversations
app.use('/api/courses', courseRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/aiConversations', aiConversationRoutes);

// Protected Route for fetching user profile
app.get("/api/user/profile", auth, async (req, res) => {
  try {
    // Assuming the user's ID is stored in the JWT payload (req.user)
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user); // Send user data as response
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
 */