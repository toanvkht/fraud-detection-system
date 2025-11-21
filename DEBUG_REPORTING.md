# Debugging Extension Reporting Issues

## How to Debug "Report Threat" Not Working

### Step 1: Check Backend is Running

```bash
# Make sure server is running
npm run dev

# Should show:
# Server running on port 3000
```

Test backend:
```bash
curl http://localhost:3000/api/health
```

---

### Step 2: Check Extension Console Logs

**Open Service Worker Console:**
1. Go to `chrome://extensions`
2. Find "AntiPhish"
3. Click **"service worker"** link
4. Keep this console open

**What to look for:**
```
AntiPhish: Reporting threat to backend... {url: "...", analysis: {...}}
AntiPhish: Response status: 201
AntiPhish: Threat reported successfully: {id: 8, message: {...}}
```

**If you see errors:**
```
AntiPhish: Error reporting threat: Error: Not authenticated
→ Solution: You're not logged in. Login first.

AntiPhish: Server error response: {"error": "..."}
→ Solution: Check backend logs

AntiPhish: Response status: 500
→ Solution: Backend error, check server console
```

---

### Step 3: Check Backend Logs

In your terminal where `npm run dev` is running, look for:

```
Creating message: {
  content: 'http://example.com',
  source: 'browser_extension',
  sender: 'example.com',
  userId: 5
}
Message created: { id: 8, user_id: 5, content: '...', ... }
Analysis result: { is_scam: false, score: 15, ... }
```

**If you see errors:**
```
Error creating message: [Error details]
```

---

### Step 4: Manual Test via curl

Test if backend endpoint works:

```bash
# 1. Login to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"YOUR_PASSWORD\"}"

# Copy the token from response

# 2. Create message
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"content\":\"http://test-site.xyz\",\"source\":\"browser_extension\",\"sender\":\"test-site.xyz\",\"meta\":{\"riskScore\":50}}"

# Should return:
# {"id":8,"message":{...},"analysis":{...}}
```

---

### Step 5: Check Extension Auth

**In extension popup, right-click → Inspect:**

```javascript
// Check if token exists
chrome.storage.local.get(['authToken', 'user'], (data) => {
    console.log('Auth token:', data.authToken ? 'Present' : 'Missing');
    console.log('User:', data.user);
});
```

**Should show:**
```
Auth token: Present
User: {id: 5, email: "admin@gmail.com", name: "toan"}
```

**If missing:**
- Login via website (http://localhost:3000/login.html)
- Wait 3 seconds for sync
- Check again

---

### Step 6: Test Reporting Step-by-Step

1. **Reload extension:**
   ```
   chrome://extensions → Reload AntiPhish
   ```

2. **Make sure you're logged in:**
   ```
   Click extension → Should show "Logged in as..."
   ```

3. **Visit a test site:**
   ```
   http://example.com
   ```

4. **Open extension popup:**
   ```
   Should show risk analysis
   ```

5. **Open service worker console BEFORE clicking Report:**
   ```
   chrome://extensions → Click "service worker"
   ```

6. **Click "Report Threat"**

7. **Watch service worker console:**
   ```
   Should immediately show:
   AntiPhish: Reporting threat to backend...
   ```

8. **Wait for response:**
   ```
   Success: AntiPhish: Threat reported successfully
   Error: AntiPhish: Error reporting threat
   ```

9. **Check database:**
   ```bash
   node check-db.js
   ```

---

## Common Issues & Solutions

### Issue 1: "Not authenticated" error

**Console shows:**
```
AntiPhish: Error reporting threat: Error: Not authenticated
```

**Solution:**
```
1. Login via http://localhost:3000/login.html
2. Wait 3 seconds on dashboard
3. Reopen extension popup
4. Should show "Logged in as..."
5. Try reporting again
```

---

### Issue 2: Network error (fetch failed)

**Console shows:**
```
Failed to fetch
TypeError: NetworkError
```

**Solutions:**

**A. Backend not running:**
```bash
# Check if server is running
curl http://localhost:3000/api/health

# If fails, start server:
npm run dev
```

**B. CORS issue:**
```
Check backend console for:
"Access to fetch at 'http://localhost:3000/api/messages' from origin 'chrome-extension://...' has been blocked by CORS policy"

Solution: Backend should allow extension origin
```

**C. Wrong URL:**
```javascript
// Check in background.js
const API_BASE_URL = 'http://localhost:3000/api';
// Should be exactly this
```

---

### Issue 3: HTTP 500 Server Error

**Console shows:**
```
AntiPhish: Response status: 500
AntiPhish: Server error response: {"error":"Server error"}
```

**Solution:**
```
1. Check backend console for error details
2. Common issues:
   - Database connection failed
   - Invalid data format
   - Missing fields in request
```

**Check backend logs:**
```
Error creating message: ...
```

---

### Issue 4: HTTP 401 Unauthorized

**Console shows:**
```
AntiPhish: Response status: 401
```

**Solution:**
```
1. Token expired or invalid
2. Logout and login again:
   - Click "Logout" in extension
   - Login via website
   - Wait for sync
   - Try again
```

---

### Issue 5: Button says "Failed" but no logs

**Possible causes:**

**A. Message handler not set up:**
```javascript
// Check popup.js has:
reportBtn.addEventListener('click', async () => {
    const response = await chrome.runtime.sendMessage({
        action: 'reportThreat',
        url: currentAnalysis.url,
        analysis: currentAnalysis
    });
});
```

**B. Background script crashed:**
```
1. Go to chrome://extensions
2. Check for errors under AntiPhish
3. Click "Errors" button if present
4. Reload extension
```

---

## Complete Testing Checklist

- [ ] Backend running (`npm run dev`)
- [ ] Extension reloaded after code changes
- [ ] Logged in via website
- [ ] Extension shows "Logged in as..."
- [ ] Service worker console open
- [ ] Visited test site (http://example.com)
- [ ] Clicked "Report Threat"
- [ ] Saw "Reporting threat..." in service worker console
- [ ] Saw "Response status: 200" or "201"
- [ ] Saw "Threat reported successfully"
- [ ] Button showed "✓ Reported to Dashboard"
- [ ] Ran `node check-db.js`
- [ ] Saw new entry with source: "browser_extension"

---

## Expected Console Output (Success)

### Extension Service Worker Console:
```
AntiPhish: Reporting threat to backend...
{
  url: "http://example.com",
  analysis: {
    riskScore: 15,
    threats: ["Non-secure HTTP connection"],
    status: "warning"
  }
}
AntiPhish: Response status: 200
AntiPhish: Threat reported successfully:
{
  id: 8,
  message: { id: 8, content: "http://example.com", ... },
  analysis: { is_scam: false, score: 15, ... }
}
```

### Backend Console:
```
Creating message: {
  content: 'http://example.com',
  source: 'browser_extension',
  sender: 'example.com',
  userId: 5
}
Message created: { id: 8, ... }
Analysis result: { is_scam: false, score: 15, ... }
POST /api/messages 200
```

### Database:
```bash
$ node check-db.js

📧 MESSAGES:
ID | User        | Source            | Content
8  | admin@...   | browser_extension | http://example.com

📈 STATISTICS:
From Extension: 1
```

---

## Quick Debug Commands

**Check auth in extension:**
```javascript
chrome.storage.local.get(['authToken'], (d) => console.log('Token:', d.authToken?.substring(0,30)));
```

**Test backend manually:**
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"test","source":"test"}'
```

**Check database:**
```bash
node check-db.js
# or
sqlite3 fraud_detection.db "SELECT * FROM messages WHERE source='browser_extension';"
```

---

**If still not working after all checks, provide:**
1. Service worker console output
2. Backend console output
3. Exact error message
4. Result of `node check-db.js`

Last Updated: November 14, 2025
