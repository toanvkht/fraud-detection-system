# AntiPhish Alert System - Troubleshooting Guide

## Issue: Alerts Not Showing

If you're not seeing the blocking overlay or warning banners, follow these steps:

---

## Step 1: Reload the Extension

1. Go to `chrome://extensions`
2. Find "AntiPhish - Phishing Protection"
3. Click the **🔄 Reload** button
4. Make sure it's **Enabled** (toggle should be blue/on)

---

## Step 2: Check Console Logs

### Background Service Worker Logs:
1. Go to `chrome://extensions`
2. Find "AntiPhish" extension
3. Click **"service worker"** link (it will say "Inspect views service worker")
4. A DevTools window will open showing background logs
5. Look for messages starting with "AntiPhish:"

**What you should see:**
```
AntiPhish background service worker loaded
AntiPhish: Analysis result for http://example.xyz :
  { status: "warning", riskScore: 40, threats: [...] }
```

### Page Console Logs:
1. On the page you're testing, press **F12**
2. Go to the **Console** tab
3. Look for messages starting with "AntiPhish:"

**What you should see:**
```
AntiPhish content script with alert system loaded
AntiPhish: Received message: showDangerAlert
AntiPhish: Showing danger alert with analysis: {...}
```

---

## Step 3: Test with Known Patterns

### Test 1: HTTP Site (Should show warning)
```
http://example.com
```
- **Expected Risk:** 15/100
- **Expected Alert:** Yellow warning banner OR corner badge
- **Badge Icon:** ! (yellow)

### Test 2: Suspicious TLD (Should show warning)
```
http://test-site.xyz
```
- **Expected Risk:** 40/100
- **Expected Alert:** Yellow warning banner
- **Badge Icon:** ! (yellow)

### Test 3: IP Address (Should show danger)
```
http://192.168.1.1
```
- **Expected Risk:** 45/100
- **Expected Alert:** Yellow warning banner (below 75 threshold)
- **Badge Icon:** ! (yellow)

### Test 4: High Risk (Should block)
You need a URL with multiple threats. Try typing in address bar:
```
http://fake-paypal.xyz
http://g00gle.top
```
- **Expected Risk:** 80+/100
- **Expected Alert:** Red blocking overlay
- **Badge Icon:** ✗ (red)

**Note:** These domains might not exist, which could cause DNS errors. The extension should still analyze them.

---

## Step 4: Manual Alert Test

If automatic alerts aren't working, test alerts manually:

1. Open any webpage
2. Press **F12** to open console
3. Paste one of these commands:

### Test Blocking Overlay:
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

### Test Warning Banner:
```javascript
chrome.runtime.sendMessage({
    action: 'showWarning',
    threats: [
        'Non-secure HTTP connection',
        'Suspicious domain patterns detected'
    ]
});
```

### Test Alert Badge:
```javascript
chrome.runtime.sendMessage({
    action: 'showBadge',
    type: 'warning',
    title: 'Security Alert',
    message: 'This is a test badge notification'
});
```

---

## Step 5: Check Manifest Permissions

1. Go to `chrome://extensions`
2. Click **Details** on AntiPhish extension
3. Scroll down to **Permissions**

**Required permissions:**
- ✅ Read and change all your data on all websites
- ✅ Display notifications
- ✅ Store data on your device

If any are missing, the manifest.json needs to be fixed.

---

## Step 6: Verify File Structure

Make sure all files exist:

```
extension/
├── manifest.json
├── scripts/
│   ├── background.js
│   ├── content.js
│   └── alerts.css       ← Must exist!
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

---

## Step 7: Check CSS Injection

Open any webpage and:

1. Press **F12**
2. Go to **Elements** tab
3. Look in the `<head>` section
4. You should see:
   ```html
   <link rel="stylesheet" href="chrome-extension://[ID]/scripts/alerts.css">
   ```

If missing, the content script isn't loading properly.

---

## Common Issues & Fixes

### Issue: "Could not inject danger alert" in logs

**Cause:** Content script not loaded on the page

**Fix:**
- Some pages (chrome://, about:, file://) don't allow content scripts
- Try on a regular website (http:// or https://)
- Check manifest.json has `"matches": ["<all_urls>"]`

---

### Issue: Badge shows but no overlay/banner

**Cause:** Risk score below threshold

**Fix:**
- Check console logs for actual risk score
- Test with known high-risk patterns
- Thresholds:
  - Blocking: ≥75
  - Warning: 40-74
  - Badge: 25-39

---

### Issue: Overlay appears but has no styling

**Cause:** CSS file not loaded

**Fix:**
1. Check `scripts/alerts.css` exists
2. Verify manifest.json includes:
   ```json
   "content_scripts": [{
     "css": ["scripts/alerts.css"]
   }]
   ```
3. Reload extension

---

### Issue: Nothing happens at all

**Cause:** Extension not active or crashed

**Fix:**
1. Go to `chrome://extensions`
2. Look for errors under extension name
3. Click **Errors** button if it appears
4. Try removing and re-adding extension:
   - Click **Remove**
   - Click **Load unpacked**
   - Select extension folder again

---

## Debugging Checklist

- [ ] Extension is enabled in chrome://extensions
- [ ] Extension reloaded after code changes
- [ ] Service worker shows "AntiPhish background service worker loaded"
- [ ] Page console shows "AntiPhish content script...loaded"
- [ ] Tested on http:// site (not https://)
- [ ] Tested with known risky patterns (.xyz, IP address)
- [ ] Badge icon changes color based on site
- [ ] Manual alert test works (using chrome.runtime.sendMessage)
- [ ] No errors in service worker console
- [ ] No errors in page console

---

## Test File

Use the included test file:

1. Open `test-phishing.html` in browser
2. File should be at: `d:\IT\COMP1682 - Đồ án\fraud-detection-system\test-phishing.html`
3. Follow instructions in the test page

---

## Still Not Working?

If alerts still don't show after all steps:

1. **Export extension logs:**
   - Service worker console: Right-click → Save as...
   - Page console: Right-click → Save as...

2. **Check manifest.json changes:**
   - Make sure "run_at": "document_start"
   - Make sure css: ["scripts/alerts.css"] is included

3. **Verify content.js has message listener:**
   - Search for: `chrome.runtime.onMessage.addListener`
   - Should have handlers for: showDangerAlert, showWarning, showBadge

4. **Test on simple HTTP server:**
   ```bash
   cd "d:\IT\COMP1682 - Đồ án\fraud-detection-system"
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000/test-phishing.html`

---

## Expected Behavior Summary

| URL Pattern | Risk | Alert Type | Badge |
|-------------|------|------------|-------|
| https://google.com | 0 | None | ✓ Green |
| http://example.com | 15 | Corner badge | ! Yellow |
| http://test.xyz | 40 | Warning banner | ! Yellow |
| http://192.168.1.1 | 45 | Warning banner | ! Yellow |
| http://fake-google.xyz | 80 | Blocking overlay | ✗ Red |
| http://paypa1.top | 65 | Warning banner + notification | ! Yellow |

---

**Last Updated:** November 14, 2025
