# How to Check Database for Extension Reports

## 📊 Database Structure

Your fraud detection system stores data in these tables:

- **users** - User accounts
- **messages** - Suspicious messages/URLs reported
- **analyses** - Analysis results for each message

When the browser extension reports a threat, it should create:
1. A record in `messages` table (the URL/content)
2. A record in `analyses` table (the risk analysis)

---

## 🔍 Method 1: Using SQLite Command Line (Fastest)

Since you're using SQLite for local development:

### Step 1: Open Database
```bash
cd "d:\IT\COMP1682 - Đồ án\fraud-detection-system"
sqlite3 fraud_detection.db
```

### Step 2: Run Queries

**Check all messages:**
```sql
SELECT * FROM messages;
```

**Check all analyses:**
```sql
SELECT * FROM analyses;
```

**Check messages with their analyses:**
```sql
SELECT
    m.id,
    m.content,
    m.source,
    m.created_at,
    a.is_scam,
    a.score
FROM messages m
LEFT JOIN analyses a ON m.id = a.message_id
ORDER BY m.created_at DESC;
```

**Count reports from extension:**
```sql
SELECT COUNT(*) as extension_reports
FROM messages
WHERE source = 'browser_extension';
```

**Exit SQLite:**
```
.exit
```

---

## 🖥️ Method 2: Using DB Browser for SQLite (GUI)

### Install (if not already installed):
```bash
winget install DB.Browser.for.SQLite
```

### Steps:
1. Open "DB Browser for SQLite"
2. Click **"Open Database"**
3. Navigate to: `d:\IT\COMP1682 - Đồ án\fraud-detection-system`
4. Select: `fraud_detection.db`
5. Click **"Browse Data"** tab
6. Select table: `messages` or `analyses`
7. View all records

---

## 🌐 Method 3: Using Backend API (Most Realistic)

This is how the website actually retrieves data.

### Step 1: Make Sure Server is Running
```bash
cd "d:\IT\COMP1682 - Đồ án\fraud-detection-system"
npm run dev
```

Server should be running on: http://localhost:3000

### Step 2: Login to Get Auth Token

**Create a test account (if you don't have one):**
```bash
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"Test User\"}"
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Save the token from response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {...}
}
```

### Step 3: Query Messages

**Get all your messages:**
```bash
curl http://localhost:3000/api/messages ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get all analyses:**
```bash
curl http://localhost:3000/api/analyses ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get statistics:**
```bash
curl http://localhost:3000/api/analyses/statistics ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Method 4: Test Extension Reporting

Currently, the extension has a `reportThreat` function but it's not fully connected. Let me show you how it works:

### Current Extension Code:
```javascript
// In background.js
async function reportThreat(url, details) {
    const token = await chrome.storage.local.get(['authToken']);

    const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token.authToken ? `Bearer ${token.authToken}` : ''
        },
        body: JSON.stringify({
            url,
            details,
            source: 'browser_extension'
        })
    });
}
```

### Issue:
The extension sends to `/api/reports` but your backend uses `/api/messages`.

---

## ✅ How to Fix Extension Reporting

I can update the extension to properly save reports to your database. The extension should:

1. Send reports to `/api/messages` endpoint
2. Include proper message format
3. Store auth token when user logs in

Would you like me to:
1. Fix the extension to properly report to the database?
2. Create a migration to add a `url_scans` table specifically for extension reports?
3. Both?

---

## 📝 Quick Database Check Script

Create a file: `check-db.js`

```javascript
const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);

async function checkDatabase() {
    console.log('=== Database Contents ===\n');

    // Check users
    const users = await db('users').select('*');
    console.log('Users:', users.length);
    console.table(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        created: new Date(u.created_at).toLocaleString()
    })));

    // Check messages
    const messages = await db('messages').select('*');
    console.log('\nMessages:', messages.length);
    console.table(messages.map(m => ({
        id: m.id,
        user_id: m.user_id,
        source: m.source,
        content: m.content.substring(0, 50) + '...',
        created: new Date(m.created_at).toLocaleString()
    })));

    // Check analyses
    const analyses = await db('analyses')
        .join('messages', 'analyses.message_id', 'messages.id')
        .select(
            'analyses.*',
            'messages.content',
            'messages.source'
        );
    console.log('\nAnalyses:', analyses.length);
    console.table(analyses.map(a => ({
        id: a.id,
        message_id: a.message_id,
        is_scam: a.is_scam,
        score: a.score,
        source: a.source,
        created: new Date(a.created_at).toLocaleString()
    })));

    await db.destroy();
}

checkDatabase().catch(console.error);
```

**Run it:**
```bash
node check-db.js
```

---

## 🎯 What You Should See

After using the extension and reporting threats, you should see:

**In messages table:**
```
id | user_id | content                    | source             | created_at
---+---------+----------------------------+--------------------+------------
1  | 1       | http://fake-site.xyz       | browser_extension  | 2025-11-14...
2  | 1       | Suspicious email text...   | report_page        | 2025-11-14...
```

**In analyses table:**
```
id | message_id | is_scam | score | created_at
---+------------+---------+-------+------------
1  | 1          | true    | 95.0  | 2025-11-14...
2  | 2          | true    | 87.5  | 2025-11-14...
```

---

## 🔍 Troubleshooting

### No records in database?

**Check 1: Is backend running?**
```bash
curl http://localhost:3000/api/health
```

**Check 2: Are migrations run?**
```bash
npm run migrate
```

**Check 3: Does database file exist?**
```bash
dir fraud_detection.db
```

**Check 4: Can you create a test record?**
```bash
curl -X POST http://localhost:3000/api/messages ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN" ^
  -d "{\"content\":\"Test message\",\"source\":\"manual_test\"}"
```

---

## 📊 Expected Flow

1. User visits suspicious site
2. Extension analyzes URL → Risk score calculated
3. User clicks "Report This Site" in popup
4. Extension sends to backend:
   ```
   POST /api/messages
   {
     content: "http://suspicious-site.xyz",
     source: "browser_extension",
     meta: { riskScore: 85, threats: [...] }
   }
   ```
5. Backend creates message record
6. Backend creates analysis record
7. User sees report in dashboard

---

**Want me to fix the extension reporting to properly save to your database?**
