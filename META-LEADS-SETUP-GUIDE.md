# Meta (Facebook) Lead Ads Setup Guide

## Overview
This guide will help you set up Meta Lead Ads integration using your company Facebook account (no developer account required).

---

## Prerequisites
- Facebook Business Page with Lead Ads
- Admin access to your Facebook Business Page
- Active Lead Ad campaigns

---

## Step 1: Get Your Access Token

### Method 1: Using Graph API Explorer (Recommended)

1. **Go to Graph API Explorer**
   - Visit: https://developers.facebook.com/tools/explorer/
   - Login with your Facebook account (the one managing your business page)

2. **Create or Select an App**
   - If you don't have an app, click "Create App" (it's free)
   - Choose "Business" type
   - Give it a name like "Lead Sync Tool"

3. **Select Your Page**
   - In the Graph API Explorer, click "User or Page" dropdown
   - Select your business page

4. **Add Permissions**
   - Click "Add a permission"
   - Search and add these permissions:
     - `leads_retrieval` (Required - to read leads)
     - `pages_read_engagement` (Required - to access page data)
     - `pages_show_list` (Required - to list your pages)
     - `pages_manage_metadata` (Optional - for additional page info)

5. **Generate Token**
   - Click "Generate Access Token"
   - Approve the permissions
   - Copy the token (starts with "EAAG...")

6. **Extend Token to Long-Lived (60 days)**
   - Go to: https://developers.facebook.com/tools/debug/accesstoken/
   - Paste your token
   - Click "Extend Access Token"
   - Copy the new long-lived token

### Method 2: Using Meta Business Suite

1. Go to Meta Business Suite: https://business.facebook.com
2. Navigate to: Settings → Business Settings
3. Under "Users" → "System Users"
4. Create a new system user
5. Generate an access token with `leads_retrieval` permission
6. Copy the token

---

## Step 2: Get Your Page ID and Form ID

### Option A: Run Our Helper Script

1. **Add your access token to .env file:**
   ```
   META_ACCESS_TOKEN=your_access_token_here
   ```

2. **Run the helper script:**
   ```bash
   node scripts/get-meta-info.js
   ```

3. **Copy the Page ID and Form ID** from the output

### Option B: Manual Method

**Get Page ID:**
1. Go to your Facebook Page
2. Click "About" in the left menu
3. Scroll down to find "Page ID"
4. Or check the URL: facebook.com/[PAGE_ID]

**Get Form ID:**
1. Go to Meta Business Suite
2. Navigate to "Lead Ads Forms"
3. Click on your form
4. The Form ID is in the URL or form details

---

## Step 3: Configure Your .env File

Add these variables to your `.env` file:

```env
# Meta (Facebook) Lead Ads Configuration
META_ACCESS_TOKEN=your_long_lived_access_token
META_PAGE_ID=your_page_id
META_FORM_ID=your_form_id

# Monday.com Configuration (if syncing to Monday)
MONDAY_API_KEY=your_monday_api_key
MONDAY_BOARD_ID=your_board_id
```

---

## Step 4: Test the Integration

### Manual Test
Run the sync manually to test:

```bash
# Test fetching leads
curl -X POST http://localhost:4000/api/meta-leads/sync
```

### Check Status
```bash
# Check sync status
curl http://localhost:4000/api/meta-leads/status
```

---

## Step 5: Verify Automatic Sync

The system is configured to automatically sync leads:
- **Schedule**: Daily at 11:50 PM CET
- **What it does**: Fetches leads from last 24 hours and adds to Monday.com

---

## Troubleshooting

### Error: "Invalid OAuth access token"
- Your token expired (tokens expire after 60 days)
- Generate a new token using Step 1

### Error: "Permissions error"
- Make sure you added all required permissions
- Regenerate token with correct permissions

### Error: "Page not found"
- Verify your PAGE_ID is correct
- Make sure your token has access to that page

### No leads found
- Check if you have active lead ads
- Verify the FORM_ID is correct
- Check the date range (default: last 24 hours)

---

## Token Expiration

Access tokens expire after 60 days. To avoid interruption:

1. Set a reminder to renew your token every 50 days
2. Or use a System User token (doesn't expire)
3. Monitor the logs for authentication errors

---

## Security Best Practices

1. **Never commit .env file to git** (already in .gitignore)
2. **Keep your access token secret**
3. **Use environment variables** for all sensitive data
4. **Rotate tokens regularly**
5. **Use System Users** for production (more secure)

---

## API Endpoints

### Trigger Manual Sync
```
POST /api/meta-leads/sync
```

### Check Sync Status
```
GET /api/meta-leads/status
```

### Get Last Sync Time
```
GET /api/meta-leads/last-sync
```

---

## Need Help?

- Meta Business Help Center: https://www.facebook.com/business/help
- Graph API Documentation: https://developers.facebook.com/docs/graph-api
- Lead Ads API: https://developers.facebook.com/docs/marketing-api/guides/lead-ads

---

## Summary Checklist

- [ ] Get access token from Graph API Explorer
- [ ] Extend token to long-lived (60 days)
- [ ] Get Page ID
- [ ] Get Form ID
- [ ] Add credentials to .env file
- [ ] Run test script to verify
- [ ] Test manual sync
- [ ] Verify automatic sync is working
- [ ] Set reminder to renew token in 50 days
