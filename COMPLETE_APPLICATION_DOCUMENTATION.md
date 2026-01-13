# Glück Global - Complete Application Documentation

## 🌟 Application Overview

**Glück Global** is a comprehensive AI-powered language learning platform built with Angular (frontend) and Node.js/Express (backend). The platform specializes in German language learning through role-play conversations with AI tutors, supporting multiple native languages (English, Tamil, Sinhala).

### 🏗️ Architecture
- **Frontend**: Angular 17+ with TypeScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT models (GPT-5.1, GPT-4o-Transcribe, GPT-4o-Mini-TTS)
- **Authentication**: JWT-based with role-based access control
- **File Storage**: Multer for file uploads
- **Real-time Features**: AI chat conversations with speech-to-text and text-to-speech

---

## 👥 User Roles & Access Control

### 1. **STUDENT Role**
- Access to learning modules and AI tutor sessions
- Progress tracking and performance history
- Profile management and subscription details
- Timetable viewing for their assigned classes

### 2. **TEACHER Role**
- Module creation (AI-assisted and manual)
- Student progress monitoring
- Session records and teaching analytics
- Timetable management for their classes

### 3. **ADMIN Role**
- Complete system administration
- User management (students, teachers)
- Module management and analytics
- System-wide reporting and configuration

---

## 🔐 Authentication & Security System

### Authentication Service (`src/app/services/auth.service.ts`)
**Core Functions:**
- `login(email, password)` - User authentication with JWT tokens
- `logout()` - Session termination and token cleanup
- `getUserProfile()` - Fetch current user profile with role information
- `refreshUserProfile()` - Update user state in application
- `isAuthenticated()` - Check authentication status
- `getUserRole()` - Get current user's role for access control
- `deleteUser(id)` - Admin function to remove users

**Security Features:**
- JWT token management with HTTP-only cookies
- Role-based route protection with guards
- Automatic session refresh and validation
- Secure password handling with bcrypt hashing

### Guards System
- **AuthGuard** (`src/app/guards/auth.guard.ts`) - Protects routes requiring authentication
- **RoleGuard** (`src/app/guards/role.guard.ts`) - Enforces role-based access control

---

## 🎯 Core Learning System

### 1. AI Tutor Chat System (`src/app/components/ai-tutor-chat/`)

**Main Features:**
- **Real-time AI Conversations**: GPT-powered role-play sessions in German
- **Speech Integration**: 
  - Speech-to-text using GPT-4o-Transcribe
  - Text-to-speech using GPT-4o-Mini-TTS
  - Audio recording and playback capabilities
- **Multi-language Support**: Native language subtitles (English, Tamil, Sinhala)
- **Session Management**: Automatic session tracking and completion detection
- **Progress Tracking**: Real-time learning analytics and vocabulary tracking

**Key Functions:**
- `startSession(moduleId)` - Initialize AI tutor session
- `sendMessage(message)` - Send user input to AI tutor
- `toggleRecording()` - Handle voice input recording
- `toggleSubtitles()` - Enable/disable native language translations
- `markModuleAsCompleted()` - Complete learning session
- `navigateToSummary()` - Auto-redirect after completion

**AI Integration:**
- **GPT-5.1** for conversation generation and translation
- **GPT-4o-Transcribe** for speech recognition
- **GPT-4o-Mini-TTS** for voice synthesis
- Context-aware responses based on CEFR levels (A1, A2, B1, B2)
- Automatic completion detection in multiple languages

### 2. Learning Modules System (`src/app/components/learning-modules/`)

**Module Types:**
- **Role-play Modules**: Interactive conversation scenarios
- **AI-Generated Modules**: Automatically created content based on parameters
- **Manual Modules**: Teacher-created custom content

**Module Management Features:**
- CEFR level classification (A1, A2, B1, B2)
- Difficulty auto-assignment based on levels
- Category-based organization (focused on "Conversation")
- Version control and update tracking
- Soft delete with trash/recycle bin system

### 3. Translation System (`routes/translation.js`)

**Real-time Translation Features:**
- OpenAI-powered translation using GPT-4o-mini
- Support for German ↔ English, Tamil, Sinhala
- Caching system for improved performance
- Context-aware translations for learning content
- Subtitle generation for AI conversations

---

## 📊 Admin Dashboard System

### 1. Student Management (`src/app/components/admin-dashboard/`)

**Professional Header Design:**
- Blue gradient header with statistics display
- Real-time student count and status overview
- Advanced filtering and search capabilities

**Core Functions:**
- `fetchStudents()` - Load all registered students
- `applyFilters()` - Filter by level, plan, status, batch, teacher
- `deleteUser(id)` - Remove student accounts
- `clearFilters()` - Reset all applied filters

**Student Data Management:**
- Registration number tracking
- Subscription plan management (PLATINUM, SILVER)
- Learning level assignment (A1, A2, B1, B2)
- Batch and medium assignment
- Teacher assignment and tracking
- Status management (UNCERTAIN, ONGOING, COMPLETED, DROPPED)

### 2. Module Management (`src/app/components/admin-dashboard/module-management.component.ts`)

**Professional Interface:**
- Blue gradient header with module statistics
- Comprehensive module lifecycle management
- Version control and history tracking

**Key Features:**
- `loadModules()` - Fetch all learning modules with statistics
- `toggleStatus(module)` - Activate/deactivate modules
- `deleteModule(module)` - Move modules to trash (soft delete)
- `viewHistory(moduleId)` - Display module update history
- `changePage(page)` - Pagination for large datasets

**Module Analytics:**
- Total modules count and status breakdown
- Creator tracking (Teacher vs Admin created)
- Enrollment statistics per module
- Update history and version tracking
- Performance metrics and usage analytics

### 3. Analytics Dashboard (`src/app/components/admin-dashboard/admin-analytics/`)

**Comprehensive Analytics System:**
- **Module Usage Analytics**: Student hours per module, completion rates
- **Teacher Performance Analytics**: Batch performance comparison, teaching effectiveness
- **Detailed Usage Tracking**: Session-level details and learning patterns

**Key Functions:**
- `loadModuleUsageData()` - Fetch module usage statistics
- `loadTeacherPerformanceData()` - Get teacher effectiveness metrics
- `loadDetailedUsageData()` - Detailed session analytics
- `applyModuleUsageFilters()` - Filter analytics by various parameters
- `exportData()` - Export analytics to various formats

**Analytics Features:**
- Real-time dashboard with interactive charts
- Advanced filtering by date, teacher, batch, level
- Export functionality for reports
- Batch statistics and comparison tools
- Student engagement metrics

### 4. Trash Management System (`src/app/components/admin-dashboard/module-trash/`)

**Recycle Bin Features:**
- 30-day automatic cleanup system
- Bulk operations (restore, permanent delete)
- Advanced filtering and search
- Statistics dashboard for trash items

**Key Functions:**
- `loadTrashItems()` - Fetch deleted modules
- `restoreModule(id)` - Restore from trash
- `permanentDelete(id)` - Permanently remove module
- `bulkRestore()` - Restore multiple items
- `emptyTrash()` - Clear all trash items

---

## 👨‍🏫 Teacher Dashboard System

### 1. Module Creation Tools

#### AI Module Creator (`src/app/components/teacher-dashboard/ai-module-creator.component.ts`)
**AI-Powered Content Generation:**
- `generateModule()` - Create modules using OpenAI GPT
- `generateModuleIntroduction()` - Create language-specific introductions
- Automatic difficulty assignment based on CEFR levels
- Context-aware content generation for role-play scenarios

#### Role-play Module Form (`src/app/components/teacher-dashboard/roleplay-module-form.component.ts`)
**Manual Module Creation:**
- `createModule()` - Manual module creation interface
- `updateModule()` - Edit existing modules
- `loadExistingModule()` - Load module data for editing
- Language-specific introduction generation
- AI configuration management for modules

### 2. Session Records (`src/app/components/teacher-dashboard/session-records.component.ts`)
**Teaching Analytics:**
- Student session tracking and monitoring
- Performance analysis and reporting
- Session duration and completion tracking
- Student engagement metrics

---

## 🎓 Student Experience System

### 1. Student AI Dashboard (`src/app/components/student-ai-dashboard/`)

**Learning Analytics:**
- `loadAnalytics()` - Fetch student learning statistics
- Progress tracking across all modules
- Time spent analysis and learning patterns
- Module completion rates and performance metrics

**Dashboard Features:**
- Total modules and completion status
- Learning time tracking (47+ minutes total time)
- Session count and engagement metrics
- Progress visualization and charts

### 2. Student Progress Tracking (`src/app/components/student-progress/`)

**Progress Management:**
- Individual module progress tracking
- CEFR level advancement monitoring
- Learning milestone achievements
- Performance history and trends

### 3. Performance History (`src/app/components/student-dashboard/performance-history.component.ts`)

**Historical Analytics:**
- Detailed session history and performance
- Learning curve analysis and trends
- Module-wise performance breakdown
- Time-based progress tracking

---

## 🏫 Administrative Management

### 1. Teacher Management (`src/app/components/teachers/`)

**Professional Teacher Interface:**
- Green gradient header with teacher statistics
- Comprehensive teacher profile management
- Course and batch assignment tracking

**Key Functions:**
- `fetchTeachers()` - Load all registered teachers
- `applyFilters()` - Filter by course level and medium
- `deleteUser(id)` - Remove teacher accounts
- `clearFilters()` - Reset applied filters

**Teacher Data:**
- Registration number and contact information
- Assigned courses and CEFR levels
- Batch assignments and student counts
- Medium specialization (Sinhala, Tamil)

### 2. Course Management (`src/app/components/courses/`)

**Course Administration:**
- Purple gradient header with course statistics
- Grid and list view modes for course display
- Course creation and editing capabilities

**Features:**
- `loadCourses()` - Fetch all available courses
- `deleteCourse(id)` - Remove courses from system
- `viewMode` toggle between grid and list views
- Course description and level management

### 3. Course Materials (`src/app/components/course-material/`)

**Material Management System:**
- Orange gradient header with material statistics
- File upload and organization system
- Grid and list view modes for materials

**Key Functions:**
- `loadMaterials()` - Fetch all course materials
- `deleteFile(materialId, file)` - Remove specific files
- Material categorization by course
- File type support and validation

---

## 📅 Scheduling & Communication

### 1. Timetable Management (`src/app/components/time-table/`)

**Comprehensive Scheduling:**
- Teal gradient header with schedule statistics
- Weekly schedule management with time slots
- Batch and teacher assignment tracking

**Features:**
- `groupByWeek()` - Organize schedules by week periods
- Multi-day schedule support (Monday-Sunday)
- Class status tracking (Scheduled, Cancelled)
- Teacher and batch assignment per time slot

**Timetable Functions:**
- Weekly schedule creation and editing
- Time slot management with start/end times
- Class status updates and notifications
- Batch-specific schedule viewing

### 2. Meeting Links (`src/app/components/meeting-link/`)

**Virtual Meeting Management:**
- Pink gradient header with meeting statistics
- Platform-specific link management
- Batch and subscription plan organization

**Key Functions:**
- `fetchMeetingLinks()` - Load all meeting configurations
- `deleteLink(id)` - Remove meeting links
- `onUpdate(id)` - Edit existing meeting configurations
- Platform integration (Zoom, Teams, etc.)

---

## 📝 Feedback & Communication

### 1. Feedback System (`src/app/components/feedback/`)

**Student Feedback Management:**
- Teal-green gradient header with feedback statistics
- Rating system with 5-star reviews
- Advanced filtering and analytics

**Features:**
- `loadFeedback()` - Fetch all student feedback
- `applyFilters()` - Filter by rating levels
- `calculateAverageRating()` - Compute overall satisfaction
- Table and card view modes for feedback display

**Feedback Analytics:**
- Average rating calculation and display
- Student satisfaction trends
- Feedback categorization and analysis
- Response tracking and management

---

## 🔧 Backend API System

### 1. Authentication Routes (`routes/auth.js`)
**Security Endpoints:**
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination
- `GET /auth/profile` - User profile retrieval
- `POST /auth/refresh` - Token refresh mechanism

### 2. AI Integration Routes

#### AI Tutor (`routes/aiTutor.js`)
**Conversation Management:**
- `POST /ai-tutor/start-session` - Initialize AI session
- `POST /ai-tutor/send-message` - Process user messages
- `POST /ai-tutor/complete-session` - End learning session
- `GET /ai-tutor/session-history` - Retrieve session data

#### AI Module Generator (`routes/aiModuleGenerator.js`)
**Content Generation:**
- `POST /ai-module/generate` - Create AI-powered modules
- `POST /ai-module/generate-introduction` - Create introductions
- `GET /ai-module/templates` - Fetch module templates

#### Translation Service (`routes/translation.js`)
**Multi-language Support:**
- `POST /api/translate` - Real-time translation service
- Support for German ↔ English, Tamil, Sinhala
- Caching and performance optimization

### 3. Data Management Routes

#### Learning Modules (`routes/learningModules.js`)
**Module Operations:**
- `GET /api/learning-modules` - Fetch modules with filtering
- `POST /api/learning-modules` - Create new modules
- `PUT /api/learning-modules/:id` - Update existing modules
- `DELETE /api/learning-modules/:id` - Soft delete modules
- `GET /api/learning-modules/admin` - Admin module management
- `GET /api/learning-modules/:id/history` - Module history

#### Admin Analytics (`routes/adminAnalytics.js`)
**Analytics Endpoints:**
- `GET /api/admin-analytics/module-usage` - Module usage statistics
- `GET /api/admin-analytics/teacher-performance` - Teacher analytics
- `GET /api/admin-analytics/detailed-usage` - Detailed session data
- `GET /api/admin-analytics/batch-stats` - Batch performance data

#### Module Trash (`routes/moduleTrash.js`)
**Trash Management:**
- `POST /api/module-trash/move/:id` - Move module to trash
- `GET /api/module-trash` - Fetch trash items
- `POST /api/module-trash/restore/:id` - Restore from trash
- `DELETE /api/module-trash/permanent/:id` - Permanent deletion
- `GET /api/module-trash/stats` - Trash statistics

---

## 🗄️ Database Models

### 1. User Model (`models/User.js`)
**User Management:**
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['STUDENT', 'TEACHER', 'ADMIN'],
  regNo: String,
  batch: Number,
  level: ['A1', 'A2', 'B1', 'B2'],
  subscription: ['PLATINUM', 'SILVER'],
  medium: ['Sinhala', 'Tamil'],
  studentStatus: ['UNCERTAIN', 'ONGOING', 'COMPLETED', 'DROPPED'],
  assignedTeacher: ObjectId,
  profilePhoto: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Learning Module Model (`models/LearningModule.js`)
**Module Structure:**
```javascript
{
  title: String,
  description: String,
  level: ['A1', 'A2', 'B1', 'B2'],
  category: String,
  difficulty: ['Beginner', 'Intermediate', 'Advanced'],
  content: Mixed,
  aiConfiguration: Object,
  isActive: Boolean,
  createdBy: ObjectId,
  lastUpdatedBy: ObjectId,
  version: Number,
  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId,
  deleteReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. AI Tutor Session Model (`models/AiTutorSession.js`)
**Session Tracking:**
```javascript
{
  studentId: ObjectId,
  moduleId: ObjectId,
  sessionType: ['learning', 'practice', 'teacher-test'],
  messages: [{
    sender: ['user', 'ai'],
    content: String,
    timestamp: Date,
    audioUrl: String
  }],
  startTime: Date,
  endTime: Date,
  isCompleted: Boolean,
  completionReason: String,
  vocabularyLearned: [String],
  performanceMetrics: Object
}
```

### 4. Student Progress Model (`models/StudentProgress.js`)
**Progress Tracking:**
```javascript
{
  studentId: ObjectId,
  moduleId: ObjectId,
  progress: Number,
  timeSpent: Number,
  completionDate: Date,
  score: Number,
  attempts: Number,
  lastAccessed: Date
}
```

---

## 🎨 UI/UX Design System

### Professional Header System
**Consistent Design Across All Admin Pages:**

1. **Color-Coded Headers:**
   - Students: Blue gradient (`#667eea` to `#764ba2`)
   - Modules: Blue gradient (`#007bff` to `#0056b3`)
   - Teachers: Green gradient (`#28a745` to `#20c997`)
   - Courses: Purple gradient (`#6f42c1` to `#8e44ad`)
   - Materials: Orange gradient (`#fd7e14` to `#e55a4e`)
   - Timetable: Teal gradient (`#17a2b8` to `#138496`)
   - Meetings: Pink gradient (`#e83e8c` to `#d63384`)
   - Analytics: Purple gradient (`#667eea` to `#764ba2`)
   - Trash: Red gradient (`#dc3545` to `#c82333`)
   - Feedback: Teal-green gradient (`#20c997` to `#17a2b8`)

2. **Header Components:**
   - Large title with relevant FontAwesome icons
   - Descriptive subtitle explaining page purpose
   - Statistics display in top-right corner
   - Responsive design for mobile devices

3. **Enhanced UI Elements:**
   - Professional action bars with gradient buttons
   - Filter sections with clean card layouts
   - Results summaries showing data counts
   - View mode toggles (grid/table/list views)
   - Loading states with spinners
   - Error states with retry buttons
   - Empty states with helpful messages

### Responsive Design Features
- **Mobile Navigation**: Hamburger menu with slide-down animation
- **Tablet Optimization**: Optimized card layouts and spacing
- **Desktop Enhancement**: Full-width layouts with proper spacing
- **Touch-Friendly**: Large buttons and touch targets for mobile

---

## 🔧 Advanced Features

### 1. Real-time Translation System
**OpenAI-Powered Translation:**
- Real-time subtitle generation during AI conversations
- Multi-language support (German, English, Tamil, Sinhala)
- Caching system for improved performance
- Context-aware translations for learning content

### 2. Speech Integration
**Voice Features:**
- Speech-to-text using GPT-4o-Transcribe
- Text-to-speech using GPT-4o-Mini-TTS
- Audio recording and playback capabilities
- Voice activity detection and processing

### 3. Module Trash/Recycle System
**Soft Delete Implementation:**
- 30-day automatic cleanup with cron jobs
- Bulk operations (restore, permanent delete)
- Trash statistics and management dashboard
- Recovery system for accidentally deleted content

### 4. Advanced Analytics
**Comprehensive Reporting:**
- Module usage analytics with time tracking
- Teacher performance metrics and comparisons
- Student engagement and learning patterns
- Batch performance analysis and reporting
- Export functionality for external analysis

### 5. Session Management
**Learning Session Control:**
- Automatic session initialization and tracking
- Real-time progress monitoring
- Completion detection in multiple languages
- Auto-redirect after session completion
- Session history and replay capabilities

---

## 🚀 Performance Optimizations

### 1. Caching Systems
- Translation result caching for improved response times
- User profile caching for reduced database queries
- Module data caching for faster loading

### 2. Lazy Loading
- Component-based lazy loading for better initial load times
- Image lazy loading for course materials
- Progressive data loading for large datasets

### 3. Database Optimization
- Indexed queries for faster data retrieval
- Aggregation pipelines for complex analytics
- Connection pooling for improved performance

---

## 🔒 Security Implementation

### 1. Authentication Security
- JWT token-based authentication with HTTP-only cookies
- Password hashing using bcrypt
- Session management with automatic expiration
- Role-based access control (RBAC)

### 2. Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection with content security policies
- File upload validation and restrictions

### 3. API Security
- Rate limiting for API endpoints
- CORS configuration for cross-origin requests
- Request validation middleware
- Error handling without information leakage

---

## 📱 Mobile Responsiveness

### 1. Responsive Navigation
- Hamburger menu for mobile devices
- Touch-friendly navigation elements
- Swipe gestures for mobile interactions

### 2. Mobile-Optimized Components
- Card-based layouts for better mobile viewing
- Collapsible tables and data displays
- Touch-optimized buttons and controls
- Mobile-friendly form inputs

### 3. Performance on Mobile
- Optimized images and assets for mobile
- Reduced data usage with efficient loading
- Touch gesture support for interactions

---

## 🔄 Integration Points

### 1. OpenAI Integration
- GPT-5.1 for advanced conversation generation
- GPT-4o-Transcribe for speech recognition
- GPT-4o-Mini-TTS for voice synthesis
- Custom prompts for educational content

### 2. File Management
- Multer for file upload handling
- File type validation and restrictions
- Secure file storage and retrieval
- Image optimization and processing

### 3. Email Integration
- User registration confirmation emails
- Password reset functionality
- Notification system for important updates
- Batch email capabilities for announcements

---

## 📊 Monitoring & Analytics

### 1. Application Monitoring
- Error tracking and logging
- Performance monitoring and optimization
- User activity tracking and analysis
- System health monitoring

### 2. Learning Analytics
- Student progress tracking and analysis
- Module effectiveness measurement
- Teacher performance evaluation
- Learning outcome assessment

### 3. Business Intelligence
- User engagement metrics
- Feature usage statistics
- Conversion rate tracking
- Revenue and subscription analytics

---

## 🔧 Development & Deployment

### 1. Development Environment
- Angular CLI for frontend development
- Node.js with Express for backend
- MongoDB for database management
- Git version control with feature branches

### 2. Build Process
- Angular production builds with optimization
- Environment-specific configurations
- Asset optimization and minification
- Code splitting for better performance

### 3. Deployment Strategy
- Containerized deployment with Docker
- Environment variable management
- Database migration scripts
- Automated backup systems

---

## 📈 Future Enhancements

### 1. Planned Features
- Advanced AI conversation scenarios
- Gamification elements for learning
- Social learning features and collaboration
- Advanced reporting and analytics dashboard

### 2. Technical Improvements
- Real-time collaboration features
- Advanced caching strategies
- Microservices architecture migration
- Enhanced mobile application

### 3. Educational Enhancements
- Additional language support
- Advanced CEFR level assessments
- Personalized learning paths
- AI-powered learning recommendations

---

This comprehensive documentation covers every aspect of the Glück Global language learning platform, from user authentication to AI-powered conversations, administrative management, and technical implementation details. The platform represents a complete educational ecosystem with advanced AI integration, professional user interfaces, and comprehensive management capabilities.