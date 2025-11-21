# Auth Sync Issue - FIXED!

## Problem

When you login via http://localhost:3000/login.html, the extension popup doesn't show you as logged in because:
- Website saves auth to `localStorage`
- Extension reads auth from `chrome.storage`
- These are separate storage systems

## Solution

Created an auth sync script that automatically copies login data from website to extension.

---

## What Was Added

**New File: extension/scripts/sync-auth.js**
- Runs on all localhost:3000 pages
- Monitors localStorage for auth data
- Syncs to chrome.storage every 2 seconds
- Updates immediately when you login

**Updated: extension/manifest.json**
- Added sync-auth.js as content script for localhost:3000

**Updated: extension/popup/popup.js**
- Listens for chrome.storage changes
- Automatically updates UI when auth syncs

---

## How to Test

### Step 1: Reload Extension
```
1. Go to chrome://extensions
2. Find "AntiPhish"
3. Click 🔄 Reload
```

### Step 2: Login via Website
```
1. Go to http://localhost:3000/login.html
2. Login with your account (e.g., admin@gmail.com)
3. You should be redirected to dashboard
```

### Step 3: Check Console (Optional)
```
1. On the login/dashboard page, press F12
2. Look for console messages:
   "AntiPhish: Auth sync script loaded"
   "AntiPhish: Auth synced to extension storage"
   "Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   "User: admin@gmail.com"
```

### Step 4: Open Extension Popup
```
1. Click the AntiPhish icon in toolbar
2. Should now show:
   ✅ "Logged in as admin@gmail.com"
   ✅ "Report Threat" button is enabled
```

---

## How It Works

```
1. User visits http://localhost:3000/login.html
        ↓
2. sync-auth.js content script loads
        ↓
3. Checks localStorage every 2 seconds
        ↓
4. Finds: authToken and user
        ↓
5. Copies to chrome.storage.local
        ↓
6. popup.js detects storage change
        ↓
7. Calls checkAuthStatus()
        ↓
8. Updates UI to show logged in state
```

---

## Debugging

### Check if sync script is running:

1. Go to http://localhost:3000
2. Press F12
3. Console should show:
   ```
   AntiPhish: Auth sync script loaded on http://localhost:3000/
   AntiPhish: Auth sync monitoring active
   ```

### Check if auth is in localStorage:

In browser console (F12):
```javascript
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', localStorage.getItem('user'));
```

Should show:
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
User: {"id":5,"email":"admin@gmail.com","name":"toan"}
```

### Check if auth is in chrome.storage:

In extension popup, right-click → Inspect, then in console:
```javascript
chrome.storage.local.get(['authToken', 'user'], (data) => {
    console.log('Extension storage:', data);
});
```

Should show:
```
Extension storage: {
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {id: 5, email: "admin@gmail.com", name: "toan"}
}
```

---

## Troubleshooting

### Issue: Extension still shows "Login to Account"

**Solution 1: Wait 2 seconds**
- The sync happens every 2 seconds
- Close and reopen extension popup after 2-3 seconds

**Solution 2: Reload extension**
```
1. Go to chrome://extensions
2. Reload AntiPhish extension
3. Reopen popup
```

**Solution 3: Check if you're on localhost:3000**
- Sync only works on localhost:3000 pages
- Visit http://localhost:3000 after logging in
- Wait 2 seconds
- Check extension popup again

### Issue: Console shows "No auth data found"

**This means localStorage is empty. Solution:**
```
1. Make sure you actually logged in
2. Check if redirect to dashboard happened
3. On dashboard, check localStorage (F12 console):
   localStorage.getItem('authToken')
```

### Issue: Sync script doesn't load

**Check manifest:**
```
1. Open extension/manifest.json
2. Look for:
   {
     "matches": ["http://localhost:3000/*"],
     "js": ["scripts/sync-auth.js"],
     "run_at": "document_idle"
   }
3. If missing, extension wasn't reloaded properly
```

---

## Manual Sync (Emergency)

If automatic sync fails, you can manually sync:

1. Login via website
2. Open extension popup
3. Right-click popup → Inspect
4. In console, paste:

```javascript
// Get from localStorage
const token = 'YOUR_TOKEN_HERE'; // Copy from website localStorage
const user = {
    id: 5,
    email: 'admin@gmail.com',
    name: 'toan'
};

// Save to chrome.storage
chrome.storage.local.set({
    authToken: token,
    user: user
}, () => {
    console.log('Manually synced!');
    location.reload(); // Reload popup
});
```

---

## Testing Complete Flow

### Test 1: Fresh Login
```
1. Logout if logged in (click Logout in extension)
2. Close all localhost:3000 tabs
3. Go to http://localhost:3000/login.html
4. Login
5. Wait 3 seconds on dashboard
6. Open extension popup
7. Should show: "Logged in as..."
```

### Test 2: Already Logged In
```
1. Already logged in to website
2. Visit any localhost:3000 page
3. Wait 2-3 seconds
4. Open extension popup
5. Should show logged in state
```

### Test 3: Report Threat
```
1. Ensure logged in (step 1 or 2 above)
2. Visit http://example.com
3. Open extension popup
4. Should show: "Logged in as..."
5. Click "Report Threat"
6. Should show: "✓ Reported to Dashboard"
7. Run: node check-db.js
8. Should see new report with source: "browser_extension"
```

---

## Files Modified

1. **extension/scripts/sync-auth.js** (NEW)
   - Auth sync logic
   - Monitors localStorage
   - Copies to chrome.storage

2. **extension/manifest.json** (UPDATED)
   - Added sync-auth.js content script
   - Runs on localhost:3000

3. **extension/popup/popup.js** (UPDATED)
   - Listens for storage changes
   - Auto-updates UI

---

## Summary

✅ **Automatic auth sync** - No manual steps needed
✅ **Works after login** - Syncs within 2-3 seconds
✅ **Real-time updates** - Popup updates automatically
✅ **Persistent** - Stays synced across browser sessions

**Now when you login via the website, the extension automatically knows!**

---

Last Updated: November 14, 2025
