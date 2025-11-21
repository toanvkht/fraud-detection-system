# Quick Start: Install AntiPhish Browser Extension

## Step-by-Step Installation Guide

### Prerequisites
✅ Chrome or Edge browser
✅ AntiPhish server running (http://localhost:3000)

---

## Part 1: Create Icon Files (One-Time Setup)

### Option A: Quick Method - Use Placeholder Images

You can temporarily use any small blue image as icons. Here's the fastest way:

1. Open Paint or any image editor
2. Create a new image: 128x128 pixels
3. Fill it with blue color (#2563eb)
4. Draw a simple shield or checkmark
5. Save as PNG
6. Resize and save as:
   - `extension/icons/icon16.png` (16x16)
   - `extension/icons/icon32.png` (32x32)
   - `extension/icons/icon48.png` (48x48)
   - `extension/icons/icon128.png` (128x128)

### Option B: Use Online Converter

1. Go to: https://www.online-convert.com/
2. Upload: `extension/icons/icon.svg`
3. Convert to PNG at sizes: 16, 32, 48, 128
4. Download and save in `extension/icons/` folder

### Option C: Download Ready Icons

1. Go to: https://www.flaticon.com/ or https://icons8.com/
2. Search "shield" or "security"
3. Download in sizes: 16, 32, 48, 128 pixels
4. Save as icon16.png, icon32.png, icon48.png, icon128.png

---

## Part 2: Load Extension in Browser

### For Chrome:

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions
   ```
   Or: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Look for toggle in top-right corner
   - Turn it ON

3. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Browse to folder: `d:\IT\COMP1682 - Đồ án\fraud-detection-system\extension`
   - Click "Select Folder"

4. **Done!**
   - Extension appears in toolbar
   - Blue shield icon visible
   - Pin it for easy access

### For Edge:

1. **Open Edge Extensions Page**
   ```
   edge://extensions
   ```
   Or: Menu (⋯) → Extensions → Manage extensions

2. **Enable Developer Mode**
   - Toggle in bottom-left corner
   - Turn it ON

3. **Load Unpacked**
   - Click "Load unpacked"
   - Select folder: `d:\IT\COMP1682 - Đồ án\fraud-detection-system\extension`
   - Click "Select Folder"

4. **Done!**
   - Extension loaded successfully

---

## Part 3: Test the Extension

### Test 1: Safe Site

1. Visit: **https://google.com**
2. Click the AntiPhish icon
3. **Expected**:
   - Badge shows ✓ (green checkmark)
   - Popup says "This Page is Safe"
   - Risk Score: 0/100
   - Protocol: https:

### Test 2: Warning (HTTP Site)

1. Visit: **http://example.com**
2. Click the extension icon
3. **Expected**:
   - Badge shows ! (yellow warning)
   - Popup says "Suspicious Activity Detected"
   - Risk Score: 15/100
   - Threat: "Non-secure HTTP connection"

### Test 3: Danger Simulation

Since we can't visit actual phishing sites, let's simulate:

1. Visit any `.xyz` domain (if you know one safe for testing)
2. Or visit a site with IP address like: http://142.250.185.46 (Google IP)
3. **Expected**:
   - Higher risk score
   - Multiple threats listed

---

## How to Use Daily

### Automatic Protection

Just browse normally! The extension:
- ✅ Automatically scans every page you visit
- ✅ Shows badge icon (✓ ! ✗) on toolbar
- ✅ Warns you about dangerous sites

### Manual Check

1. Click the extension icon anytime
2. View detailed threat report
3. See risk score and specific threats

### Report Suspicious Sites

1. Click extension icon
2. Click "Report Threat" button
3. Threat sent to AntiPhish backend

---

## Understanding the Icons

| Badge | Meaning | Action |
|-------|---------|--------|
| ✓ Green | Safe | Browse normally |
| ! Yellow | Suspicious | Be cautious |
| ✗ Red | Dangerous | Leave immediately |
| ? Gray | Unknown | Can't scan |

---

## Features Overview

### 1. Real-Time Scanning
- Scans URLs as you browse
- Instant threat detection
- Background monitoring

### 2. Visual Warnings
- Badge icon on every tab
- Warning banner on dangerous sites
- Color-coded threat levels

### 3. Detailed Reports
- Risk score (0-100)
- List of specific threats
- Domain and protocol info

### 4. Threat Detection
- ⚠️ Non-HTTPS connections
- ⚠️ IP addresses
- ⚠️ Suspicious domains (.xyz, .top)
- ⚠️ URL shorteners (bit.ly)
- ⚠️ Typosquatting
- ⚠️ Hidden iframes
- ⚠️ Password forms on HTTP

---

## Troubleshooting

### Problem: Extension not loading?

**Solution:**
1. Check Developer Mode is ON
2. Make sure icon files exist (icon16.png, icon32.png, etc.)
3. Look for errors in extension details
4. Try removing and re-adding

### Problem: No badge showing?

**Solution:**
1. Icon PNG files may be missing
2. Create placeholder icons (see Part 1)
3. Reload extension

### Problem: Popup shows "Unable to Scan"?

**Solution:**
- You're on chrome:// or edge:// page (these can't be scanned)
- Navigate to a normal website

### Problem: Report button doesn't work?

**Solution:**
1. Make sure backend server is running
2. Check http://localhost:3000 is accessible
3. Check browser console for errors

---

## Permissions Explained

When you install, the extension asks for:

- ✅ **Read active tab**: To see which URL you're visiting
- ✅ **Storage**: To cache scan results (faster)
- ✅ **All websites**: To scan any site you visit

**Your privacy is protected:**
- ❌ NO browsing history collection
- ❌ NO personal data sent anywhere
- ❌ NO tracking
- ✅ All scans happen locally in your browser

---

## Keyboard Shortcuts (Optional)

You can add a keyboard shortcut:

1. Go to `chrome://extensions/shortcuts`
2. Find "AntiPhish"
3. Set custom shortcut (e.g., Ctrl+Shift+A)
4. Press shortcut to open popup instantly

---

## Uninstall

If you want to remove:

1. Go to `chrome://extensions` or `edge://extensions`
2. Find "AntiPhish - Phishing Protection"
3. Click "Remove"
4. Confirm

---

## Next Steps

After installing:

1. ✅ Browse normally and watch the badge
2. ✅ Test on different sites (safe and suspicious)
3. ✅ Report any threats you find
4. ✅ Check the dashboard for scan history

---

## Demo Script

Want to show someone? Follow this:

1. **Open extension popup** on google.com
   - "See? Green checkmark = safe"

2. **Visit http://example.com**
   - "Badge turns yellow! HTTP warning"

3. **Click Report button**
   - "We can report threats to protect others"

4. **Click Dashboard link**
   - "Opens our full AntiPhish web app"

---

## Quick Tips

💡 **Pin the extension** - Right-click icon → Pin for quick access

💡 **Check before clicking links** - Hover, then check badge

💡 **Red badge?** - Don't enter any personal info!

💡 **Yellow badge?** - Verify the site is legitimate

💡 **Use with website scanner** - Extension + web app = complete protection

---

## Screenshots (What You'll See)

### Loading State
```
┌─────────────────────┐
│  🔵 AntiPhish      │
├─────────────────────┤
│   ⟳ Analyzing...   │
│                     │
└─────────────────────┘
```

### Safe State
```
┌─────────────────────┐
│  🔵 AntiPhish      │
├─────────────────────┤
│      ✓             │
│  This Page is Safe │
│  google.com        │
│                     │
│  Risk: 0/100       │
│  Protocol: https:   │
└─────────────────────┘
```

### Danger State
```
┌─────────────────────┐
│  🔵 AntiPhish      │
├─────────────────────┤
│      ✗             │
│ Phishing Detected! │
│  bad-site.xyz      │
│                     │
│  ⚠ Non-HTTPS       │
│  ⚠ Suspicious TLD  │
│                     │
│  Risk: 85/100      │
└─────────────────────┘
```

---

## Support

**Need help?**
- Check extension console (right-click icon → Inspect popup)
- Check browser console (F12)
- See main project README
- Ensure backend is running

**Report bugs:**
- Note the URL that caused issue
- Check browser console
- Screenshot the error

---

**Status**: ✅ Extension Ready for Installation

**Location**: `d:\IT\COMP1682 - Đồ án\fraud-detection-system\extension`

**Documentation**: See `extension/README.md` for technical details

---

🎉 **You're all set! Install the extension and start browsing safely!**
