# Browser Extension Reporting to Database - Complete Guide

## ✅ What's Been Fixed

The browser extension now properly saves URL scans to your database!

### Changes Made:

1. **background.js** - Updated `reportThreat()` to use `/api/messages` endpoint
2. **popup.html** - Added login/logout UI
3. **popup.css** - Added auth section styling
4. **popup.js** - Added authentication check and login functionality
5. **auth.js** - Updated to save credentials to chrome.storage for extension access

---

## 🚀 How to Use Extension Reporting

### Step 1: Reload the Extension

After making changes:
1. Go to `chrome://extensions`
2. Find "AntiPhish"
3. Click **🔄 Reload** button

### Step 2: Login via Website

The extension needs you to login first:

**Option A - Via Extension Popup:**
1. Click the AntiPhish icon in toolbar
2. Scroll down to see "Login to Account" button
3. Click it → Opens login page
4. Login with your credentials

**Option B - Via Website Directly:**
1. Go to http://localhost:3000/login.html
2. Login with your account

**Existing accounts from database:**
- `test@example.com`
- `admin@gmail.com`
- `yourname@example.com`

(Password: whatever you set during signup)

### Step 3: Verify Login in Extension

1. Click AntiPhish icon again
2. You should now see:
   ```
   ✅ Logged in as your-email@example.com
   [Logout]
   ```
3. "Report Threat" button is now enabled

### Step 4: Report a Threat

1. Visit any website (e.g., http://example.com)
2. Click AntiPhish icon
3. Extension analyzes the URL
4. Click **"Report Threat"** button
5. See confirmation: "✓ Reported to Dashboard"

### Step 5: Check Database

Run the database check script:
```bash
cd "d:\IT\COMP1682 - Đồ án\fraud-detection-system"
node check-db.js
```

You should now see:
```
📧 MESSAGES:
...
Source: browser_extension  ← NEW!
```

---

## 📊 How It Works

### Data Flow:

```
1. User visits http://suspicious-site.xyz
        ↓
2. Extension analyzes URL automatically
        ↓
3. Extension shows risk score in popup
        ↓
4. User clicks "Report Threat" button
        ↓
5. popup.js sends message to background.js
        ↓
6. background.js calls reportThreat()
        ↓
7. POST request to /api/messages with:
   {
     content: "http://suspicious-site.xyz",
     source: "browser_extension",
     sender: "suspicious-site.xyz",
     meta: {
       riskScore: 85,
       threats: ["Suspicious TLD", "HTTP connection"],
       status: "warning"
     }
   }
        ↓
8. Backend saves to database
        ↓
9. Creates message record + analysis record
        ↓
10. User sees report in dashboard
```

---

## 🧪 Testing

### Test 1: Report a Safe Site

1. Login via extension popup
2. Visit: https://google.com
3. Click AntiPhish icon
4. Should show: "This Page is Safe" (Risk: 0/100)
5. Click "Report Threat" anyway
6. Check database:
   ```bash
   node check-db.js
   ```
7. Should see new record with:
   - Content: "https://google.com"
   - Source: "browser_extension"
   - Risk Score: 0

### Test 2: Report a Suspicious Site

1. Visit: http://example.com
2. Click AntiPhish icon
3. Should show: "Suspicious Activity" (Risk: 15/100)
4. Click "Report Threat"
5. Check database - should see:
   - Content: "http://example.com"
   - Source: "browser_extension"
   - Risk Score: 15
   - Threats: ["Non-secure HTTP connection"]

### Test 3: Report High-Risk Site

1. Start local test server:
   ```bash
   python -m http.server 8001
   ```
2. Visit: http://localhost:8001/dangerous-test.html
3. Extension should detect password form on HTTP
4. Click "Report Threat"
5. Check database for entry

---

## 🔍 Verifying Reports in Database

### Method 1: Quick Check Script

```bash
node check-db.js
```

Look for:
```
📈 STATISTICS:
From Extension: 3  ← Should be > 0
```

### Method 2: SQL Query

```bash
sqlite3 fraud_detection.db "SELECT * FROM messages WHERE source='browser_extension';"
```

### Method 3: Via API

```bash
# Login first
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"YOUR_PASSWORD"}'

# Get messages
curl http://localhost:3000/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 What Gets Saved

Each extension report creates:

**1. Message Record:**
```json
{
  "id": 8,
  "user_id": 5,
  "content": "http://suspicious-site.xyz",
  "source": "browser_extension",
  "sender": "suspicious-site.xyz",
  "meta": {
    "riskScore": 85,
    "threats": [
      "Suspicious domain extension",
      "Non-secure HTTP connection"
    ],
    "status": "warning",
    "protocol": "http:",
    "timestamp": "2025-11-14T12:34:56.789Z"
  },
  "created_at": "2025-11-14 12:34:56"
}
```

**2. Analysis Record** (if backend creates it):
```json
{
  "id": 8,
  "message_id": 8,
  "is_scam": true,
  "score": 85,
  "explanation": {
    "threats": [...],
    "status": "warning"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "Report Threat" button is disabled

**Solution:**
- You're not logged in
- Click "Login to Account" button
- Login via the website
- Reopen extension popup

### Issue: "Not authenticated" error when clicking Report

**Solution:**
- Extension lost auth token
- Login again via extension popup
- Check console for errors:
  - Open extension popup
  - Right-click → Inspect
  - Check Console tab

### Issue: Report button says "Failed"

**Check 1: Is backend running?**
```bash
curl http://localhost:3000/api/health
```

**Check 2: Is token valid?**
- Open extension popup
- Right-click → Inspect
- Console tab, run:
  ```javascript
  chrome.storage.local.get(['authToken'], (data) => {
    console.log('Token:', data.authToken);
  });
  ```

**Check 3: Check service worker errors:**
- Go to `chrome://extensions`
- Click "service worker" under AntiPhish
- Look for error messages

### Issue: Reports not showing in database

**Check 1: Was request sent?**
- Service worker console should show:
  ```
  AntiPhish: Reporting threat to backend...
  AntiPhish: Threat reported successfully: {id: 8}
  ```

**Check 2: Check backend logs:**
```bash
npm run dev
# Watch for POST /api/messages requests
```

**Check 3: Check message validation:**
- Backend requires: content, source
- Extension sends both
- Check if validation is passing

---

## 📝 Authentication Flow

### First Time Setup:

```
1. User installs extension
2. Extension has no auth data
3. Popup shows "Login to Account" button
4. User clicks → Opens /login.html
5. User logs in
6. auth.js saves to:
   - localStorage (for website)
   - chrome.storage (for extension)
7. User returns to extension
8. Extension reads chrome.storage
9. Shows "Logged in as email@example.com"
10. "Report Threat" button enabled
```

### Subsequent Uses:

```
1. User clicks extension icon
2. popup.js calls checkAuthStatus()
3. Reads chrome.storage.local
4. If token exists → Logged in state
5. If no token → Logged out state
```

---

## 🔐 Security Notes

- Auth token stored in chrome.storage.local
- Only accessible by this extension
- Token sent in Authorization header
- Backend validates token on each request
- Logout clears token from storage

---

## 📊 Expected Database Growth

After reporting 5 sites:

```
📈 STATISTICS:
Total Messages: 12     (+5 from before)
From Extension: 5      (NEW!)
From Website: 7        (existing)
```

---

## ✅ Complete Test Checklist

- [ ] Extension reloaded after code changes
- [ ] Logged in via extension popup
- [ ] Extension shows "Logged in as..."
- [ ] Visited http://example.com
- [ ] Clicked "Report Threat"
- [ ] Saw "✓ Reported to Dashboard"
- [ ] Ran `node check-db.js`
- [ ] Saw "From Extension: 1" (or more)
- [ ] Message source = "browser_extension"
- [ ] Message content = correct URL
- [ ] Meta field contains riskScore and threats

---

## 🎉 Success!

If you see this in database check:

```
📧 MESSAGES:
ID | User | Source            | Content
8  | ...  | browser_extension | http://example.com

📈 STATISTICS:
From Extension: 1  ← SUCCESS!
```

**Your extension is now saving reports to the database!**

---

## 🔄 Quick Recap

**What was broken:**
- Extension sent to `/api/reports` (doesn't exist)
- No authentication system in extension
- Reports never reached database

**What's fixed:**
- Extension sends to `/api/messages` ✅
- Login/logout in popup ✅
- Auth token saved to chrome.storage ✅
- Reports properly saved to database ✅
- Can view reports via `node check-db.js` ✅

**Last Updated:** November 14, 2025
