# 🚀 Quick Start Guide - Foodie Check

## Prerequisites Checklist

### ✅ Already Installed
- [x] **Go 1.27.0** - Installed and verified
- [x] **Node.js** - For Next.js frontend
- [x] **Python** - For OCR engine

### ⚠️ Still Needed
- [ ] **PostgreSQL** - Database server

---

## Step 1: Install PostgreSQL (One-time setup)

### Option A: Download Installer (Recommended)
1. Visit: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Download **PostgreSQL 17** for Windows x64
3. Run the installer
4. **During installation:**
   - Set password for `postgres` user (remember this!)
   - Default port: `5432` (keep it)
   - Install pgAdmin 4 (optional, but useful)
   - Install Stack Builder (optional)
5. After installation completes, verify:
   ```powershell
   psql --version
   ```

### Option B: Via Winget (if installer prompts are blocking)
Open PowerShell **as Administrator** and run:
```powershell
winget install PostgreSQL.PostgreSQL.17 --accept-source-agreements --accept-package-agreements
```

---

## Step 2: Create Database

After PostgreSQL is installed:

```powershell
# Connect to PostgreSQL (will prompt for password)
psql -U postgres

# Inside psql prompt, run:
CREATE DATABASE foodie_check;

# Verify it was created:
\l

# Exit psql:
\q
```

---

## Step 3: Start All Services (3 Terminals)

### Terminal 1: Go Backend API

```powershell
# Navigate to Go backend
cd C:\Users\avira\Desktop\SIH\foodie_check-backend\foodie_check-backend

# Set database connection
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/foodie_check"

# Add Go to PATH for this session
$env:Path = "C:\Program Files\Go\bin;" + $env:Path

# Start the server (migrations run automatically)
go run .
```

**Expected output:**
```
Connected to PostgreSQL successfully.
Server starting on port 8080
```

**Test it:**
Open browser: http://localhost:8080/api/health

---

### Terminal 2: Python OCR Engine

```powershell
# Navigate to OCR service
cd C:\Users\avira\Desktop\SIH\foodie_check\services\ocr-engine

# Activate virtual environment
.\venv\Scripts\activate

# If venv doesn't exist, create it first:
# python -m venv venv
# .\venv\Scripts\activate
# pip install -r requirements.txt

# Set database connection (use same password as Terminal 1)
$env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@localhost:5432/foodie_check"

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Test it:**
```powershell
curl http://localhost:8000
```

---

### Terminal 3: Next.js Frontend

```powershell
# Navigate to web app
cd C:\Users\avira\Desktop\SIH\foodie_check\apps\web

# Install dependencies (first time only)
# npm install

# Start Next.js dev server
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

**Open the app:**
http://localhost:3000

---

## Step 4: Test the Full System

1. **Open** http://localhost:3000 in your browser
2. **Upload** front and back images of food packaging
3. **Click** "Generate Compliance Report"
4. **View** the Legal Metrology compliance table

### Verify Database

```powershell
psql -U postgres -d foodie_check

# Check tables exist:
\dt

# Should show: scans, compliance_rules, products, inspections, etc.

# Check compliance rules are populated:
SELECT COUNT(*) FROM compliance_rules;
# Should return: 8

# View recent scans:
SELECT id, user_id, overall_status, passed, failed, created_at 
FROM scans 
ORDER BY created_at DESC 
LIMIT 5;

# Exit:
\q
```

---

## Architecture Summary

```
┌─────────────────┐
│  Browser :3000  │  ← Next.js Frontend
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌──────────────┐
│ Python :8000│  │  Go :8080    │  ← Backend APIs
└──────┬──────┘  └──────┬───────┘
       │                │
       └────────┬───────┘
                ▼
      ┌──────────────────┐
      │ PostgreSQL :5432 │  ← Database
      └──────────────────┘
```

**Data Flow:**
1. User uploads images → Next.js
2. Next.js → Python OCR (port 8000)
3. Python extracts text + evaluates rules
4. Python saves to PostgreSQL
5. Frontend can also query Go API for history

---

## Troubleshooting

### Error: "psql is not recognized"
**Solution:** PostgreSQL isn't installed or not in PATH.
- Restart PowerShell after installing PostgreSQL
- Or use full path: `"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres`

### Error: "go is not recognized" 
**Solution:** Add Go to PATH:
```powershell
$env:Path = "C:\Program Files\Go\bin;" + $env:Path
```

### Error: "connection refused" to PostgreSQL
**Solution:** 
- Check PostgreSQL service is running:
  ```powershell
  Get-Service -Name postgresql*
  ```
- Start it if stopped:
  ```powershell
  Start-Service postgresql-x64-17
  ```

### Error: "database foodie_check does not exist"
**Solution:** Create it:
```powershell
psql -U postgres -c "CREATE DATABASE foodie_check;"
```

### Error: Frontend CORS issues
**Solution:** Already fixed! The Go backend has CORS middleware that accepts requests from localhost:3000.

---

## Next Steps

Once all 3 services are running:

1. ✅ Test with real food packaging images
2. ✅ Verify compliance rules are working
3. ✅ Check database is storing scans
4. 📝 Add authentication (optional)
5. 🚀 Deploy to production

---

## Quick Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| PostgreSQL | 5432 | `localhost:5432` | Database |
| Python OCR | 8000 | `http://localhost:8000` | OCR + Rules |
| Go Backend | 8080 | `http://localhost:8080` | REST API |
| Next.js | 3000 | `http://localhost:3000` | Frontend |

**Database Connection String:**
```
postgresql://postgres:YOUR_PASSWORD@localhost:5432/foodie_check
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

---

**For detailed troubleshooting and deployment, see `INTEGRATION_GUIDE.md`**
