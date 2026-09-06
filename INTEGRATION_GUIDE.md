# 🔗 Full Stack Integration Guide

**Connecting Next.js Frontend + Python OCR Engine + Go Backend + PostgreSQL**

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│                      localhost:3000                              │
│                    (Next.js Frontend)                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP Requests
                 │
                 ├─────────────────┐
                 │                 │
                 ▼                 ▼
┌────────────────────────┐  ┌──────────────────────┐
│   Python OCR Engine    │  │    Go Backend API     │
│    localhost:8000      │  │   localhost:8080      │
│      (FastAPI)         │  │    (Go + pgx)         │
└──────────┬─────────────┘  └──────────┬───────────┘
           │                           │
           │                           │
           │                           ▼
           │                ┌─────────────────────┐
           │                │   PostgreSQL DB     │
           │                │   localhost:5432    │
           └───────────────►│   foodie_check      │
                            └─────────────────────┘
```

---

## Integration Flow Options

### Option A: Frontend → Python → Go → Database (Recommended)

**Flow:**
1. Frontend uploads images to Python OCR service
2. Python performs OCR + rule evaluation
3. Python calls Go backend to save scan results
4. Go backend persists to PostgreSQL
5. Frontend fetches scan history from Go backend

**Benefits:**
- Clean separation of concerns
- OCR engine focuses on image processing
- Go backend handles all database operations
- Frontend has single source of truth for data

### Option B: Frontend → Python → Database (Current Setup)

**Flow:**
1. Frontend uploads images to Python OCR service
2. Python performs OCR + rule evaluation
3. Python directly saves to PostgreSQL
4. Frontend can also query Go backend for additional features

**Benefits:**
- Simpler for initial development
- Python service is self-contained
- Works with existing SETUP_GUIDE.md

---

## Setup Instructions

### Step 1: Start PostgreSQL

**Windows:**
```powershell
# If installed via installer, it should auto-start
# Check if running:
Get-Service -Name postgresql*

# Or connect directly:
psql -U postgres
```

**Mac:**
```bash
brew services start postgresql@14
```

**Linux:**
```bash
sudo systemctl start postgresql
```

**Create the database:**
```bash
psql -U postgres
CREATE DATABASE foodie_check;
\q
```

---

### Step 2: Run Go Backend Migrations

Navigate to the Go backend directory and run migrations:

```powershell
cd C:\Users\avira\Desktop\SIH\foodie_check-backend\foodie_check-backend

# Set DATABASE_URL environment variable
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/foodie_check"

# Run the Go backend (migrations run automatically on startup)
go run .
```

**Expected output:**
```
Connected to PostgreSQL successfully.
Server starting on port 8080
```

**Verify migrations:**
```sql
psql -U postgres -d foodie_check

\dt

-- Expected tables:
--  products
--  inspections
--  ocr_results
--  violations
--  product_images
--  scans              ← New table
--  compliance_rules   ← New table

SELECT * FROM compliance_rules;
-- Should show 8 rules (LM6_1_a through LM6_1_g + FSSAI)
```

---

### Step 3: Start Python OCR Engine

Open a **new terminal** and navigate to the OCR engine:

```powershell
cd C:\Users\avira\Desktop\SIH\foodie_check\services\ocr-engine

# Activate virtual environment
.\venv\Scripts\activate

# Set DATABASE_URL
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/foodie_check"

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
# Should return: {"message":"Foodie Check OCR Engine API"}
```

---

### Step 4: Start Next.js Frontend

Open a **third terminal**:

```powershell
cd C:\Users\avira\Desktop\SIH\foodie_check\apps\web

npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.5s
```

---

## Testing the Integration

### Test 1: Python OCR Service (Standalone)

```powershell
# Upload images to Python service and save to DB
curl -X POST "http://localhost:8000/scans?user_id=testuser" `
  -F "front=@path/to/front.jpg" `
  -F "back=@path/to/back.jpg"
```

**Expected response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "testuser",
  "overall_status": "non_compliant",
  "passed": 5,
  "needs_review": 2,
  "failed": 1,
  "created_at": "2026-09-06T..."
}
```

### Test 2: Go Backend Scan Retrieval

```powershell
# List all scans via Go backend
curl http://localhost:8080/api/scans
```

**Expected response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "testuser",
    "front_image_url": "...",
    "back_image_url": "...",
    "passed": 5,
    "needs_review": 2,
    "failed": 1,
    "overall_status": "non_compliant",
    "created_at": "2026-09-06T..."
  }
]
```

### Test 3: Go Backend Compliance Rules

```powershell
# Get all compliance rules
curl http://localhost:8080/api/compliance-rules
```

**Expected response:**
```json
[
  {
    "id": "LM6_1_b",
    "field_name": "common_name",
    "clause": "Rule 6(1)(b)",
    "check_type": "presence",
    "description": "Common or generic name must be declared",
    "is_active": true
  },
  ...
]
```

### Test 4: Frontend End-to-End

1. Open `http://localhost:3000` in your browser
2. Upload front and back packaging images
3. Click "Generate Compliance Report"
4. Verify the compliance table displays with pass/review/fail status
5. Check the database:

```sql
psql -U postgres -d foodie_check

SELECT id, user_id, overall_status, passed, failed, created_at 
FROM scans 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## Connecting Frontend to Go Backend (Optional)

If you want the frontend to also query the Go backend for scan history:

### Update `apps/web/lib/api.ts`:

```typescript
const API_BASE = "http://localhost:8000"; // Python OCR
const GO_API_BASE = "http://localhost:8080"; // Go Backend

// Add new function to fetch from Go backend
export async function fetchScanHistory(userId: string) {
  const response = await fetch(`${GO_API_BASE}/api/scans`);
  if (!response.ok) throw new Error("Failed to fetch scan history");
  return response.json();
}

export async function fetchComplianceRules() {
  const response = await fetch(`${GO_API_BASE}/api/compliance-rules`);
  if (!response.ok) throw new Error("Failed to fetch compliance rules");
  return response.json();
}
```

---

## Environment Variables Summary

### Python OCR Engine (`.env` in `services/ocr-engine/`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodie_check
```

### Go Backend (environment or `.env` in `foodie_check-backend/`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodie_check
PORT=8080
```

### Next.js Frontend (`.env.local` in `apps/web/`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GO_API_URL=http://localhost:8080
```

---

## Port Summary

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | `localhost:5432` |
| Python OCR Engine | 8000 | `http://localhost:8000` |
| Go Backend API | 8080 | `http://localhost:8080` |
| Next.js Frontend | 3000 | `http://localhost:3000` |

---

## Troubleshooting

### Issue: Go backend can't connect to database

**Solution:**
```powershell
# Check PostgreSQL is running
Get-Service -Name postgresql*

# Test connection manually
psql -U postgres -d foodie_check

# If connection refused, check pg_hba.conf authentication method
```

### Issue: Python service can't find modules

**Solution:**
```powershell
cd services/ocr-engine
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: Frontend CORS errors

**Solution:**
The Go backend now has CORS middleware that allows requests from any origin (`Access-Control-Allow-Origin: *`). If you still see CORS errors:

1. Check the backend is running on port 8080
2. Check browser console for the exact error
3. Verify the request URL in `apps/web/lib/api.ts`

### Issue: Migrations didn't create scans/compliance_rules tables

**Solution:**
```powershell
cd C:\Users\avira\Desktop\SIH\foodie_check-backend\foodie_check-backend

# Manually run the migration SQL
psql -U postgres -d foodie_check -f migrations/003_add_scans_and_compliance_rules.sql
```

---

## Database Schema Verification

Run this to verify all tables exist:

```sql
psql -U postgres -d foodie_check

-- Check tables
\dt

-- Check indexes
\di

-- Verify compliance rules are populated
SELECT COUNT(*) FROM compliance_rules;
-- Should return: 8

-- Check scan structure
\d scans

-- Check compliance rules structure
\d compliance_rules
```

---

## Next Steps

1. ✅ **All three services running** (PostgreSQL, Go, Python, Next.js)
2. ✅ **Test OCR evaluation** with real food packaging images
3. ✅ **Verify database persistence** by checking the `scans` table
4. ✅ **Test frontend flow** end-to-end
5. ⬜ **Add authentication** (optional - Firebase, Auth0, or custom)
6. ⬜ **Deploy to production**
   - Frontend: Vercel
   - Python: Railway, Render, or AWS Lambda
   - Go: Fly.io, Railway, or AWS ECS
   - Database: AWS RDS PostgreSQL or Supabase

---

## Quick Start Commands

```powershell
# Terminal 1: Go Backend
cd C:\Users\avira\Desktop\SIH\foodie_check-backend\foodie_check-backend
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/foodie_check"
go run .

# Terminal 2: Python OCR Engine
cd C:\Users\avira\Desktop\SIH\foodie_check\services\ocr-engine
.\venv\Scripts\activate
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/foodie_check"
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Next.js Frontend
cd C:\Users\avira\Desktop\SIH\foodie_check\apps\web
npm run dev

# Visit http://localhost:3000 🚀
```

---

## API Endpoint Reference

### Python OCR Engine (`localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ocr` | Raw OCR extraction only |
| POST | `/evaluate` | OCR + compliance check (no DB save) |
| POST | `/scans?user_id=X` | Full evaluation + save to DB |
| GET | `/scans?user_id=X` | List user's scan history |
| GET | `/scans/{id}` | Get single scan details |

### Go Backend (`localhost:8080`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/scans` | List all scans |
| POST | `/api/scans` | Create new scan |
| GET | `/api/scans/{id}` | Get scan by UUID |
| GET | `/api/compliance-rules` | List all compliance rules |
| POST | `/api/compliance-rules` | Create new compliance rule |

---

**Ready to scan! 🍔📸✅**
