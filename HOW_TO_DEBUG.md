# How to Debug AntiPhish Extension - Step by Step

## 🔍 Viewing Console Messages

The extension has **TWO separate consoles** you need to check:

---

## Console 1: Background Service Worker (URL Analysis)

This shows the **risk analysis** happening in the background.

### Steps:

1. **Open Chrome Extensions:**
   ```
   Type in address bar: chrome://extensions
   Press Enter
   ```

2. **Find AntiPhish Extension:**
   - Scroll to "AntiPhish - Phishing Protection"

3. **Open Service Worker Console:**
   - Look for blue text that says **"service worker"**
   - Click it (full text might be "Inspect views service worker")
   - A **new DevTools window** will pop up

4. **What You'll See:**
   ```
   AntiPhish background service worker loaded
   ```

5. **Test It:**
   - Go to any website (like http://example.com)
   - Switch back to the service worker console
   - You should see:
   ```
   AntiPhish: Analysis result for http://example.com :
   {
     status: "warning",
     riskScore: 15,
     threats: ["Non-secure HTTP connection"]
   }
   ```

**Screenshot of where to click:**
```
chrome://extensions page:

┌─────────────────────────────────────────┐
│ AntiPhish - Phishing Protection         │
│ Version 1.0.0                           │
│                                         │
│ Inspect views                           │
│ service worker  ← CLICK THIS           │
│                                         │
│ [Details] [Remove]                      │
└─────────────────────────────────────────┘
```

---

## Console 2: Page Console (Alert Messages)

This shows **alerts being displayed** on the webpage.

### Steps:

1. **Open Any Webpage:**
   ```
   Go to: http://example.com
   (or any website you want to test)
   ```

2. **Open Developer Tools:**
   - Press **F12**
   - OR Right-click anywhere → **Inspect**

3. **Go to Console Tab:**
   - Click the **Console** tab at the top

4. **What You'll See:**
   ```
   AntiPhish content script with alert system loaded
   Current URL: http://example.com
   Document ready state: complete
   ```

5. **When Alert Triggers:**
   If the site is risky, you'll also see:
   ```
   AntiPhish: Received message: showWarning
   AntiPhish: Showing warning banner
   ```

---

## 📝 Full Testing Workflow

**Step-by-Step Example:**

### Setup (One-time):

1. Open `chrome://extensions`
2. Find AntiPhish, click **service worker**
3. Position this console window on one side of screen
4. Keep it open

### Testing:

1. Open a new tab
2. Type URL: `http://example.com`
3. Press **F12** on that page
4. Click **Console** tab
5. Now you have **BOTH consoles open**:
   - Service worker console (shows analysis)
   - Page console (shows alerts)

### What You Should See:

**Service Worker Console:**
```
AntiPhish: Analysis result for http://example.com :
Object {
  status: "warning",
  riskScore: 15,
  threats: Array(1),
  url: "http://example.com"
}
```

**Page Console:**
```
AntiPhish content script with alert system loaded
Current URL: http://example.com
AntiPhish: Received message: showWarning
AntiPhish: Showing warning banner
```

**On the Page:**
- Yellow warning banner should appear at top

---

## 🧪 Manual Test (If Nothing Shows)

If you don't see messages, manually trigger an alert:

1. Open any webpage
2. Press **F12**
3. Click **Console** tab
4. Paste this code and press Enter:

```javascript
chrome.runtime.sendMessage({
    action: 'showDangerAlert',
    analysis: {
        url: 'http://fake-site.xyz',
        domain: 'fake-site.xyz',
        riskScore: 95,
        threats: [
            'Typosquatting detected',
            'Non-secure HTTP connection',
            'Suspicious domain extension'
        ],
        status: 'danger'
    }
});
```

5. **Expected Result:**
   - Console shows: `AntiPhish: Received message: showDangerAlert`
   - Console shows: `AntiPhish: Showing danger alert with analysis: {...}`
   - Page shows: **Red full-page blocking overlay**

---

## 🎯 Test URLs to Try

### Low Risk (Corner Badge):
```
https://bit.ly/test
```
- Risk: ~25
- Console: "Received message: showBadge"
- Page: Corner notification appears

### Medium Risk (Yellow Banner):
```
http://example.com
```
- Risk: 15
- Console: "Received message: showWarning"
- Page: Yellow banner at top

```
http://test-site.xyz
```
- Risk: 40
- Console: "Received message: showWarning"
- Page: Yellow banner at top

### High Risk (Red Overlay):
```
http://192.168.1.1
http://fake-google.xyz
http://paypa1-login.top
```
- Risk: 45-80+
- Console: "Received message: showDangerAlert"
- Page: Full-page red blocking overlay

---

## 🔍 Filtering Console Messages

To see ONLY AntiPhish messages:

1. In the console, look for the **filter box** (usually top of console)
2. Type: `AntiPhish`
3. Press Enter
4. Now you only see extension messages

---

## 🐛 Common Issues

### Issue: "service worker" link is not there

**Fix:**
- The extension might not be loaded
- Click the **Reload** button (🔄) on the extension
- Wait a few seconds
- The "service worker" link should appear

### Issue: Service worker console is empty

**Fix:**
- Visit a website to trigger analysis
- The background worker only runs when needed
- After visiting a site, check console again

### Issue: Page console shows nothing

**Fix:**
- Make sure extension is **Enabled** (toggle on)
- Reload the extension
- Refresh the webpage (F5)
- Check if content script loads (you should see "AntiPhish content script...loaded")

### Issue: Only see errors

**Possible Errors:**
```
Could not inject danger alert: Could not establish connection
```
**Meaning:** Content script didn't load on that page
**Fix:** Some pages (chrome://, about:, file://) don't allow extensions. Try a regular http:// or https:// site.

---

## 📸 Visual Guide

### Service Worker Console Location:
```
chrome://extensions
    ↓
[Find "AntiPhish"]
    ↓
[Click "service worker"]
    ↓
[New DevTools window opens] ← This is Background Console
```

### Page Console Location:
```
[Any webpage]
    ↓
[Press F12]
    ↓
[Click "Console" tab]
    ↓
[See messages here] ← This is Page Console
```

---

## ✅ Success Checklist

When everything works, you should see:

- [ ] Service worker console shows: "AntiPhish background service worker loaded"
- [ ] Service worker console shows: "Analysis result for..." when visiting pages
- [ ] Page console shows: "AntiPhish content script...loaded"
- [ ] Page console shows: "Received message: showWarning/showDangerAlert"
- [ ] Badge icon changes color (✓, !, or ✗)
- [ ] Alerts appear on risky websites

---

## 🎓 Understanding the Flow

```
1. You visit http://example.com
        ↓
2. Background worker detects URL change
        ↓
3. analyzeURL() calculates risk = 15
        ↓
4. Service worker console logs:
   "Analysis result for http://example.com : {riskScore: 15}"
        ↓
5. Background sends message to content script
        ↓
6. Page console logs:
   "Received message: showWarning"
        ↓
7. showWarningBanner() creates yellow banner
        ↓
8. Page console logs:
   "Showing warning banner"
        ↓
9. You see yellow banner on page
```

---

**Need more help?** Check these files:
- `ALERT_TROUBLESHOOTING.md` - Full troubleshooting guide
- `test-phishing.html` - Test page with manual triggers
- `ALERTS_SUMMARY.md` - Complete alert documentation

**Last Updated:** November 14, 2025
