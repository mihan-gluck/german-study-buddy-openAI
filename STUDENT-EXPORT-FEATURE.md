# Student Data Export Feature

## Overview
The Student Data Export feature allows administrators to select multiple students from the admin dashboard and export their complete data to a CSV file for analysis, reporting, or backup purposes.

## Location
**Admin Dashboard** → Students Table → "Export Selected" button

## How to Use

### 1. Select Students
- Use the checkbox in the table header to select all students
- Or individually select students using the checkbox in each row
- The "Export Selected" button shows the count of selected students

### 2. Export to CSV
- Click the **"Export Selected (X)"** button
- The button is disabled when no students are selected
- A CSV file will be automatically downloaded with the filename format: `students_export_YYYY-MM-DD.csv`

### 3. Success Confirmation
- After export, you'll see a confirmation message: "✅ Successfully exported X student(s) to CSV"

## Exported Fields

The CSV export includes **16 comprehensive fields**:

### Core Student Information
1. **RegNo** - Student registration number
2. **Name** - Full name
3. **Email** - Email address
4. **Level** - Current German level (A1, A2, B1, B2, etc.)
5. **Subscription** - Plan type (PLATINUM, SILVER)
6. **Student Status** - Current status (ONGOING, COMPLETED, PAUSED, etc.)

### Contact & Demographics
7. **Batch** - Batch number/name
8. **Medium** - Learning medium (Online, Offline, Hybrid)
9. **Phone Number** - Contact number
10. **Address** - Physical address
11. **Age** - Student age

### Program Information
12. **Program Enrolled** - Enrolled program name
13. **Lead Source** - Marketing/referral source
14. **Assigned Teacher** - Current teacher name

### System Information
15. **Created At** - Account creation date
16. **Last Credentials Sent** - Last time login credentials were emailed

## Features

### ✅ Smart Selection
- Works with filtered results
- Select all or individual students
- Real-time count display

### ✅ Complete Data Export
- All 13 Monday.com CRM fields
- Additional system fields (teacher, dates)
- Properly formatted CSV with quoted values

### ✅ User-Friendly
- One-click export
- Automatic file download
- Timestamped filenames
- Success confirmation

### ✅ Data Integrity
- Handles missing values (shows "N/A")
- Properly escapes special characters
- UTF-8 encoding for international characters
- Date formatting for readability

## Use Cases

### 📊 Reporting
- Generate student lists for management reports
- Create batch-specific reports
- Track enrollment statistics

### 📧 Communication
- Export contact lists for email campaigns
- Create mailing lists by level or batch
- Share student data with teachers

### 📈 Analysis
- Import into Excel/Google Sheets for analysis
- Track student demographics
- Monitor subscription distribution

### 💾 Backup
- Regular data backups
- Archive historical student data
- Maintain offline records

## Integration with Other Features

### Works With Filters
Export respects current filters:
- Filter by level, plan, status, batch, or teacher
- Select filtered results
- Export only relevant students

### Works With Bulk Operations
Combine with other bulk features:
1. Filter students
2. Select multiple students
3. Export data OR bulk edit OR resend credentials

## Technical Details

### CSV Format
- **Delimiter**: Comma (`,`)
- **Encoding**: UTF-8
- **Quote Character**: Double quotes (`"`)
- **Line Ending**: LF (`\n`)

### File Naming
- **Pattern**: `students_export_YYYY-MM-DD.csv`
- **Example**: `students_export_2026-02-07.csv`

### Browser Compatibility
- Works in all modern browsers
- Uses Blob API for file generation
- Automatic download without popup blockers

## Example CSV Output

```csv
RegNo,Name,Email,Level,Subscription,Student Status,Batch,Medium,Phone Number,Address,Age,Program Enrolled,Lead Source,Assigned Teacher,Created At,Last Credentials Sent
"GB2024001","John Doe","john@example.com","A1","PLATINUM","ONGOING","Batch A","Online","+94771234567","Colombo, Sri Lanka","25","German Language Course","Facebook","Ms. Sarah","2/7/2026","Feb 7, 2026, 10:30 AM"
"GB2024002","Jane Smith","jane@example.com","A2","SILVER","ONGOING","Batch B","Offline","+94771234568","Kandy, Sri Lanka","30","Business German","Referral","Mr. John","2/6/2026","Feb 6, 2026, 09:15 AM"
```

## Tips & Best Practices

### 🎯 Efficient Exporting
1. Use filters to narrow down students before selecting
2. Export in batches for large datasets
3. Use descriptive filenames by renaming after download

### 🔒 Data Security
- Exported files contain sensitive information
- Store securely and delete when no longer needed
- Don't share via unsecured channels

### 📅 Regular Exports
- Export weekly for backup purposes
- Track changes over time
- Maintain historical records

## Troubleshooting

### No Students Selected
**Issue**: Export button is disabled
**Solution**: Select at least one student using checkboxes

### Missing Data in Export
**Issue**: Some fields show "N/A"
**Solution**: This is normal for optional fields that weren't filled during registration

### File Not Downloading
**Issue**: CSV doesn't download
**Solution**: 
- Check browser popup blocker settings
- Ensure browser allows downloads
- Try a different browser

### Special Characters Not Displaying
**Issue**: Names with special characters appear garbled
**Solution**: Open CSV in Excel/Google Sheets with UTF-8 encoding

## Related Features

- **Bulk Student Upload** - Import students from CSV
- **Bulk Edit** - Update multiple students at once
- **Resend Credentials** - Send login details to students
- **Student Filters** - Filter students before export

## Future Enhancements

Potential improvements for future versions:
- [ ] Export to Excel format (.xlsx)
- [ ] Custom field selection
- [ ] Export with course progress data
- [ ] Export with AI tutor session statistics
- [ ] Scheduled automatic exports
- [ ] Email export results

---

**Last Updated**: February 7, 2026
**Version**: 1.0
**Feature Status**: ✅ Active
