# Monday.com CRM - Column Mapping for Student Portal

## 📋 Columns Pulled from Monday.com Board

When creating a student in the Student Portal from Monday.com CRM, the following columns are extracted:

---

## 🔢 Column IDs and Mapping

| # | Field Name | Monday Column ID | Data Type | Required | Example Value |
|---|------------|------------------|-----------|----------|---------------|
| 1 | **Student Name** | Item Name | Text | ✅ Yes | "John Doe" |
| 2 | **Date** | `date_mkzs9xr7` | Date | ✅ Yes | "2026-02-07" |
| 3 | **Email** | `text_mkw3spks` | Text | ✅ Yes | "john@example.com" |
| 4 | **Medium** | `dropdown_mkw09h9j` | Dropdown | ⚪ Optional | "Online" / "Offline" |
| 5 | **Subscription** | `color_mky3jxt1` | Status/Color | ✅ Yes | "SILVER" / "PLATINUM" |
| 6 | **Batch** | `dropdown_mkxx6cfp` | Dropdown | ⚪ Optional | "Batch A" |
| 7 | **Student Status** | `dropdown_mkxwsaxq` | Dropdown | ✅ Yes | "ONGOING" / "COMPLETED" |
| 8 | **Level** | `dropdown_mkzshj5a` | Dropdown | ✅ Yes | "A1" / "A2" / "B1" / "B2" / "C1" / "C2" |
| 9 | **Phone Number** | `text_mkw2wpvr` | Text | ⚪ Optional | "+94771234567" |
| 10 | **Address** | `text_mkv080k2` | Text | ⚪ Optional | "Colombo, Sri Lanka" |
| 11 | **Age** | `text_mkw38wse` | Text/Number | ⚪ Optional | "25" |
| 12 | **Program Enrolled** | `text_mkwz1j6q` | Text | ⚪ Optional | "German Language Course" |
| 13 | **Lead Source** | `text_mkvdkw8g` | Text | ⚪ Optional | "Facebook" / "Referral" |

---

## 🎯 Field Details

### 1. Student Name (Item Name)
- **Source:** Monday.com item name (not a column)
- **Usage:** Full name of the student
- **Stored in:** `User.name`
- **Required:** Yes

### 2. Date (`date_mkzs9xr7`)
- **Purpose:** Determines when to create the account
- **Format:** YYYY-MM-DD (e.g., "2026-02-07")
- **Logic:** Only students with today's date are processed
- **Required:** Yes (for automatic sync)

### 3. Email (`text_mkw3spks`)
- **Purpose:** Student's email address for login and communication
- **Validation:** Must be unique (no duplicates allowed)
- **Usage:** Login credential + receives welcome email
- **Stored in:** `User.email`
- **Required:** Yes

### 4. Medium (`dropdown_mkw09h9j`)
- **Purpose:** Learning mode preference
- **Options:** "Online" / "Offline" / "Hybrid"
- **Stored in:** `User.medium`
- **Required:** Optional

### 5. Subscription (`color_mky3jxt1`)
- **Purpose:** Subscription plan type
- **Options:** "SILVER" / "PLATINUM"
- **Impact:** Determines access level and features
- **Stored in:** `User.subscription`
- **Required:** Yes

### 6. Batch (`dropdown_mkxx6cfp`)
- **Purpose:** Student's batch or group assignment
- **Examples:** "Batch A", "Morning Batch", "Weekend Batch"
- **Stored in:** `User.batch`
- **Required:** Optional

### 7. Student Status (`dropdown_mkxwsaxq`)
- **Purpose:** Current enrollment status
- **Options:** "ONGOING" / "COMPLETED" / "PAUSED" / "DROPPED"
- **Stored in:** `User.studentStatus`
- **Required:** Yes

### 8. Level (`dropdown_mkzshj5a`)
- **Purpose:** CEFR language proficiency level
- **Options:** "A1" / "A2" / "B1" / "B2" / "C1" / "C2"
- **Impact:** Determines which modules student can access
- **Stored in:** `User.level`
- **Required:** Yes

### 9. Phone Number (`text_mkw2wpvr`)
- **Purpose:** Contact number for communication
- **Format:** Any format (e.g., "+94771234567")
- **Stored in:** `User.phoneNumber`
- **Required:** Optional

### 10. Address (`text_mkv080k2`)
- **Purpose:** Student's physical address
- **Format:** Free text
- **Stored in:** `User.address`
- **Required:** Optional

### 11. Age (`text_mkw38wse`)
- **Purpose:** Student's age
- **Format:** Number (converted from text)
- **Stored in:** `User.age` (as integer)
- **Required:** Optional

### 12. Program Enrolled (`text_mkwz1j6q`)
- **Purpose:** Specific program or course enrolled in
- **Examples:** "German Language Course", "Business German"
- **Stored in:** `User.programEnrolled`
- **Required:** Optional

### 13. Lead Source (`text_mkvdkw8g`)
- **Purpose:** Marketing attribution - how student found you
- **Examples:** "Facebook", "Google Ads", "Referral", "Website"
- **Stored in:** `User.leadSource`
- **Required:** Optional

---

## 🔄 Data Flow Process

```
Monday.com Board (5005161522)
         ↓
   Cron Job (11:50 PM daily)
         ↓
   Filter by Today's Date
         ↓
   Extract 13 Fields
         ↓
   Generate RegNo & Password
         ↓
   Create User in Database
         ↓
   Send Welcome Email
         ↓
   Update lastCredentialsEmailSent
```

---

## 🔐 Auto-Generated Fields

These fields are NOT from Monday.com - they are generated automatically:

| Field | Generation Logic | Example |
|-------|------------------|---------|
| **RegNo** | `STUD` + sequential 3-digit number | `STUD042` |
| **Password** | `Student{last3digits}@{year}` | `Student042@2026` |
| **Role** | Always set to `"STUDENT"` | `STUDENT` |
| **Created At** | Current timestamp | `2026-02-07T16:50:00Z` |
| **Last Credentials Sent** | Email sent timestamp | `2026-02-07T16:50:00Z` |

---

## ✅ Required vs Optional Fields

### ✅ Required (Must be filled in Monday.com):
1. **Student Name** (Item Name)
2. **Date** (must match today for auto-sync)
3. **Email** (must be unique)
4. **Subscription** (SILVER or PLATINUM)
5. **Student Status** (ONGOING, etc.)
6. **Level** (A1-C2)

### ⚪ Optional (Can be empty):
7. Medium
8. Batch
9. Phone Number
10. Address
11. Age
12. Program Enrolled
13. Lead Source

---

## 🚨 Important Notes

### Email Validation
- **Must be unique** - System checks if email already exists
- **Must be valid format** - Standard email validation
- **If missing:** Student is skipped with reason "No email"
- **If duplicate:** Student is skipped with reason "Already exists"

### Date Filtering
- Only students with **today's date** are processed
- Date must be in format: YYYY-MM-DD
- Timezone: Asia/Colombo (Sri Lanka)
- If date is empty or different, student is skipped

### Subscription Values
- Must be exactly: `"SILVER"` or `"PLATINUM"`
- Case-sensitive
- Determines feature access in portal

### Level Values
- Must be one of: `"A1"`, `"A2"`, `"B1"`, `"B2"`, `"C1"`, `"C2"`
- Case-sensitive
- Determines which learning modules are accessible

---

## 📊 Monday.com Board Setup

### Column Configuration Checklist:

- [ ] **Date Column** (`date_mkzs9xr7`) - Type: Date
- [ ] **Email Column** (`text_mkw3spks`) - Type: Text
- [ ] **Medium Column** (`dropdown_mkw09h9j`) - Type: Dropdown
- [ ] **Subscription Column** (`color_mky3jxt1`) - Type: Status/Color
- [ ] **Batch Column** (`dropdown_mkxx6cfp`) - Type: Dropdown
- [ ] **Student Status Column** (`dropdown_mkxwsaxq`) - Type: Dropdown
- [ ] **Level Column** (`dropdown_mkzshj5a`) - Type: Dropdown
- [ ] **Phone Number Column** (`text_mkw2wpvr`) - Type: Text
- [ ] **Address Column** (`text_mkv080k2`) - Type: Text
- [ ] **Age Column** (`text_mkw38wse`) - Type: Text
- [ ] **Program Enrolled Column** (`text_mkwz1j6q`) - Type: Text
- [ ] **Lead Source Column** (`text_mkvdkw8g`) - Type: Text

---

## 🔧 How to Find Column IDs in Monday.com

If you need to verify or update column IDs:

1. Open Monday.com board
2. Open browser Developer Tools (F12)
3. Go to Network tab
4. Perform any action on the board
5. Look for API calls to `api.monday.com/v2`
6. Check the GraphQL query/response for column IDs

**Or use the test script:**
```bash
node scripts/fetch-monday-preview.js
```

This will show all columns and their IDs from your board.

---

## 📝 Code Location

**File:** `routes/auth.js`  
**Lines:** 22-180  
**Function:** Cron job that syncs Monday.com data

**Key Code Section:**
```javascript
const name          = item.name;
const email         = get("text_mkw3spks");
const medium        = get("dropdown_mkw09h9j");
const subscription  = get("color_mky3jxt1");
const batch         = get("dropdown_mkxx6cfp");
const studentStatus = get("dropdown_mkxwsaxq");
const level         = get("dropdown_mkzshj5a");
const phoneNumber   = get("text_mkw2wpvr");
const address       = get("text_mkv080k2");
const age           = get("text_mkw38wse");
const programEnrolled = get("text_mkwz1j6q");
const leadSource    = get("text_mkvdkw8g");
```

---

## 🎯 Summary

**Total Fields Extracted:** 13 fields  
**Required Fields:** 6 fields  
**Optional Fields:** 7 fields  
**Auto-Generated Fields:** 5 fields  

**Board ID:** `5005161522`  
**Sync Schedule:** Daily at 11:50 PM (Sri Lanka time)  
**Processing Logic:** Only students with today's date  

---

**Last Updated:** February 7, 2026  
**Documentation Version:** 1.0
