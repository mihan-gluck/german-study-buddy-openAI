# Student Portal Credentials - Analytics & Tracking Guide

## 🎯 Overview

This guide explains how to track and analyze which students have received their portal credentials via email.

---

## 📊 Quick Check - How Many Students Received Credentials?

### Method 1: Quick Count (Fastest)

**Command:**
```bash
node scripts/quick-credentials-count.js
```

**Output:**
```
============================================================
📊 STUDENT PORTAL CREDENTIALS - QUICK COUNT
============================================================

📋 Total Students:        150
✅ Credentials Sent:      142 (94.7%)
❌ Credentials Not Sent:  8 (5.3%)
📆 Sent Today:            5

============================================================
```

**Use Case:** Quick dashboard check, daily monitoring

---

### Method 2: Detailed Analysis (Comprehensive)

**Command:**
```bash
node scripts/check-credentials-sent.js
```

**Output Includes:**
- Total students count
- Credentials sent vs not sent (with percentages)
- Breakdown by time period (today, this week, this month, this year)
- Breakdown by subscription (SILVER, PLATINUM, None)
- Breakdown by level (A1, A2, B1, B2, C1, C2)
- List of recently sent credentials (last 10)
- List of students who never received credentials
- Export options

**Use Case:** Weekly reports, detailed analysis, troubleshooting

---

### Method 3: Export Data (For Reports)

**Export All Students:**
```bash
node scripts/export-credentials-sent.js --all
```

**Export Only Students Who Received Credentials:**
```bash
node scripts/export-credentials-sent.js --sent
```

**Export Only Students Who Never Received Credentials:**
```bash
node scripts/export-credentials-sent.js --not-sent
```

**Export as CSV:**
```bash
node scripts/export-credentials-sent.js --all --format=csv
```

**Export as JSON:**
```bash
node scripts/export-credentials-sent.js --all --format=json
```

**Use Case:** Monthly reports, Excel analysis, data backup

---

## 📋 What Data is Tracked?

### Database Field: `lastCredentialsEmailSent`

**Location:** `models/User.js`

**Type:** Date (timestamp)

**Values:**
- `null` or `undefined` = Credentials never sent
- `Date` = Timestamp when credentials were last sent

**Example:**
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  regNo: "STUD042",
  lastCredentialsEmailSent: "2026-02-07T14:30:00.000Z"  // ✅ Sent
}

{
  name: "Jane Smith",
  email: "jane@example.com",
  regNo: "STUD043",
  lastCredentialsEmailSent: null  // ❌ Never sent
}
```

---

## 📊 Detailed Analysis Output

### Example Output from `check-credentials-sent.js`:

```
📊 Checking Student Portal Credentials Status

================================================================================
✅ Connected to MongoDB

📋 Total Students in System: 150

================================================================================


📊 CREDENTIALS STATISTICS
================================================================================
✅ Credentials Sent:     142 students (94.7%)
❌ Credentials Not Sent: 8 students (5.3%)
================================================================================


📅 CREDENTIALS SENT BY TIME PERIOD
================================================================================
📆 Today:      5 students
📆 This Week:  23 students
📆 This Month: 67 students
📆 This Year:  142 students
================================================================================


💎 CREDENTIALS SENT BY SUBSCRIPTION
================================================================================
🥈 SILVER:   85 students
👑 PLATINUM: 52 students
❓ No Sub:   5 students
================================================================================


📚 CREDENTIALS SENT BY LEVEL
================================================================================
A1: 45 students
A2: 38 students
B1: 32 students
B2: 18 students
C1: 7 students
C2: 2 students
================================================================================


🕐 RECENTLY SENT CREDENTIALS (Last 10)
================================================================================
1. John Doe (STUD042)
   Email: john@example.com
   Level: A2 | Subscription: SILVER
   Sent: Feb 7, 2026, 02:30 PM

2. Jane Smith (STUD043)
   Email: jane@example.com
   Level: B1 | Subscription: PLATINUM
   Sent: Feb 7, 2026, 01:15 PM

... (8 more)
================================================================================


⚠️  STUDENTS WHO NEVER RECEIVED CREDENTIALS
================================================================================
Total: 8 students

1. Alice Johnson (STUD150)
   Email: alice@example.com
   Level: A1 | Subscription: SILVER
   Created: Feb 5, 2026 (2 days ago)

2. Bob Wilson (STUD151)
   Email: bob@example.com
   Level: A2 | Subscription: None
   Created: Feb 4, 2026 (3 days ago)

... (6 more)
================================================================================


📋 SUMMARY
================================================================================
Total Students:           150
Credentials Sent:         142 (94.7%)
Credentials Not Sent:     8 (5.3%)
Sent Today:               5
Sent This Week:           23
Sent This Month:          67
================================================================================
```

---

## 📁 Export File Formats

### JSON Format

**Filename:** `students-credentials-all-2026-02-07T10-30-00.json`

**Structure:**
```json
{
  "exportDate": "2026-02-07T10:30:00.000Z",
  "filterType": "all",
  "totalStudents": 150,
  "statistics": {
    "credentialsSent": 142,
    "credentialsNotSent": 8,
    "bySubscription": {
      "SILVER": 85,
      "PLATINUM": 52,
      "None": 13
    },
    "byLevel": {
      "A1": 45,
      "A2": 38,
      "B1": 32,
      "B2": 18,
      "C1": 7,
      "C2": 2
    }
  },
  "students": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "regNo": "STUD042",
      "level": "A2",
      "subscription": "SILVER",
      "credentialsSent": "Yes",
      "lastSentDate": "Feb 7, 2026, 02:30 PM",
      "accountCreated": "Jan 15, 2026",
      "daysWithoutCredentials": 0
    }
    // ... more students
  ]
}
```

### CSV Format

**Filename:** `students-credentials-all-2026-02-07T10-30-00.csv`

**Structure:**
```csv
Name,Email,RegNo,Level,Subscription,Credentials Sent,Last Sent Date,Account Created,Days Without Credentials
"John Doe",john@example.com,STUD042,A2,SILVER,Yes,"Feb 7, 2026, 02:30 PM","Jan 15, 2026",0
"Jane Smith",jane@example.com,STUD043,B1,PLATINUM,Yes,"Feb 7, 2026, 01:15 PM","Jan 20, 2026",0
"Alice Johnson",alice@example.com,STUD150,A1,SILVER,No,Never,"Feb 5, 2026",2
```

---

## 🔍 Use Cases

### 1. Daily Monitoring

**Check how many credentials were sent today:**
```bash
node scripts/quick-credentials-count.js
```

**Frequency:** Daily (morning check)

---

### 2. Weekly Report

**Generate detailed weekly report:**
```bash
node scripts/check-credentials-sent.js > weekly-report-$(date +%Y-%m-%d).txt
```

**Frequency:** Every Monday

---

### 3. Monthly Analysis

**Export data for monthly review:**
```bash
node scripts/export-credentials-sent.js --all --format=csv
```

**Frequency:** First day of each month

---

### 4. Troubleshooting

**Find students who never received credentials:**
```bash
node scripts/export-credentials-sent.js --not-sent
```

**Action:** Manually resend credentials from Admin Dashboard

---

### 5. Audit & Compliance

**Export all data for audit:**
```bash
node scripts/export-credentials-sent.js --all --format=json
```

**Frequency:** Quarterly or as needed

---

## 🎯 Integration with Admin Dashboard

### View in Admin Dashboard

**Location:** Admin Dashboard → Students Tab

**Column:** "Last Credentials Sent"

**Shows:**
- Formatted date/time when credentials were sent
- "Never sent" if credentials were never sent
- Hover tooltip with full timestamp

**Actions:**
- Click 📧 envelope button to resend credentials
- View real-time status updates

---

## 📊 Metrics & KPIs

### Key Performance Indicators

**1. Credentials Delivery Rate**
```
(Students with Credentials Sent / Total Students) × 100
```
**Target:** > 95%

**2. Average Time to Send Credentials**
```
Average(Credentials Sent Date - Account Created Date)
```
**Target:** < 24 hours

**3. Daily Credentials Sent**
```
Count of credentials sent today
```
**Target:** Match daily new student registrations

**4. Students Without Credentials (Age)**
```
Students with no credentials sent for > 7 days
```
**Target:** 0 students

---

## 🚨 Alerts & Notifications

### When to Take Action

**🔴 Critical (Immediate Action):**
- Students without credentials for > 7 days
- Credentials delivery rate < 90%
- Email sending failures

**🟡 Warning (Review Soon):**
- Students without credentials for > 3 days
- Credentials delivery rate < 95%
- Unusual spike in "not sent" count

**🟢 Normal:**
- Credentials delivery rate > 95%
- All students receive credentials within 24 hours
- Daily credentials match new registrations

---

## 🔧 Automation Ideas

### 1. Daily Cron Job

**Schedule:** Every morning at 9:00 AM

**Script:**
```bash
#!/bin/bash
# Daily credentials check
node scripts/quick-credentials-count.js | mail -s "Daily Credentials Report" admin@gluckglobal.com
```

---

### 2. Weekly Report Email

**Schedule:** Every Monday at 10:00 AM

**Script:**
```bash
#!/bin/bash
# Weekly detailed report
node scripts/check-credentials-sent.js > /tmp/weekly-report.txt
mail -s "Weekly Credentials Report" admin@gluckglobal.com < /tmp/weekly-report.txt
```

---

### 3. Alert for Unsent Credentials

**Schedule:** Every day at 6:00 PM

**Script:**
```bash
#!/bin/bash
# Check for students without credentials
COUNT=$(node scripts/quick-credentials-count.js | grep "Credentials Not Sent" | awk '{print $4}')
if [ "$COUNT" -gt 10 ]; then
  echo "Alert: $COUNT students without credentials!" | mail -s "ALERT: Credentials Not Sent" admin@gluckglobal.com
fi
```

---

## 📝 Best Practices

### 1. Regular Monitoring
- ✅ Check credentials count daily
- ✅ Review detailed report weekly
- ✅ Export data monthly for records

### 2. Proactive Actions
- ✅ Resend credentials if not sent within 24 hours
- ✅ Verify email addresses for failed sends
- ✅ Monitor Monday.com sync for issues

### 3. Data Backup
- ✅ Export credentials data monthly
- ✅ Keep historical records for audit
- ✅ Document any manual interventions

### 4. Quality Assurance
- ✅ Verify credentials work after sending
- ✅ Check spam folders if students report not receiving
- ✅ Test email delivery regularly

---

## 🛠️ Troubleshooting

### Issue: High "Not Sent" Count

**Possible Causes:**
1. Monday.com sync not running
2. Email service issues
3. Invalid email addresses
4. Cron job not executing

**Solution:**
```bash
# Check recent sync
node scripts/check-credentials-sent.js

# Manually resend from Admin Dashboard
# Or run sync script
node scripts/sync-all-monday-students.js
```

---

### Issue: Credentials Sent but Student Can't Login

**Possible Causes:**
1. Wrong password format
2. Email went to spam
3. Student using wrong credentials

**Solution:**
1. Verify in Admin Dashboard "Last Credentials Sent" column
2. Click 📧 to resend credentials
3. Ask student to check spam folder
4. Verify email address is correct

---

## 📞 Support

For issues or questions:
- Check Admin Dashboard first
- Run diagnostic scripts
- Review backend logs
- Contact system administrator

---

**Last Updated:** February 7, 2026  
**Scripts Location:** `/scripts/`  
**Documentation:** This file
