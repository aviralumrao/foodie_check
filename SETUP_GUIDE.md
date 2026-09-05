# 🍔 Foodie Check - Complete Setup Guide

**Full-stack food packaging compliance scanner with OCR + Rule Engine + Database**

---

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** (for Next.js frontend)
- **Python 3.10+** (for FastAPI backend)
- **PostgreSQL 14+** (or SQLite for testing)
- **Git** (for version control)

---

## Project Structure Overview

```
foodie_check/
├── apps/
│   └── web/                    # Next.js 16 Frontend
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── package.json
│
└── services/
    └── ocr-engine/             # FastAPI Backend
        ├── main.py
        ├── database.py
        ├── models.py
        ├── requirements.txt
        ├── mapping/
        │   ├── field_mapper.py
        │   └── patterns.py
        └── rules/
            ├── engine.py
            ├── checks.py
            └── ruleset.json
```

---

## Part 1: Backend Setup (FastAPI + OCR Engine)

### Step 1: Navigate to Backend Directory

```bash
cd services/ocr-engine
```

### Step 2: Create Python Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `paddleocr` - OCR engine
- `opencv-python` - Image processing
- `numpy` - Array operations
- `sqlalchemy` - Database ORM
- `psycopg2-binary` - PostgreSQL driver
- `python-multipart` - File upload support

**Note:** PaddleOCR will download ~200MB of models on first run.

### Step 4: Set Up PostgreSQL Database

#### Option A: Install PostgreSQL (Recommended for Production)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt:
CREATE DATABASE foodie_check;

# Optional: Create dedicated user
CREATE USER foodie_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE foodie_check TO foodie_user;

# Exit psql
\q
```

#### Option B: Use SQLite for Quick Testing

If you don't want to set up PostgreSQL immediately, use SQLite:

### Step 5: Configure Database Connection

Create `.env` file in `services/ocr-engine/`:

**For PostgreSQL:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodie_check
```

**For SQLite (testing):**
```env
DATABASE_URL=sqlite:///./foodie_check.db
```

**For custom PostgreSQL user:**
```env
DATABASE_URL=postgresql://foodie_user:your_secure_password@localhost:5432/foodie_check
```

### Step 6: Initialize Database Tables

The tables are created automatically on first server start. Verify by starting the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 7: Verify Backend is Running

Open another terminal and test:

```bash
curl http://localhost:8000
```

Or visit `http://localhost:8000/docs` in your browser to see the interactive API documentation (Swagger UI).

### Step 8: Create Required Directories

```bash
# From services/ocr-engine/
mkdir -p results
```

This folder stores debug JSON files (`latest_scan.json`, `latest_report.json`).

---

## Part 2: Frontend Setup (Next.js)

### Step 1: Navigate to Frontend Directory

Open a **new terminal** (keep the backend running in the first one):

```bash
cd apps/web
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

This installs:
- `next@16` - React framework
- `react@19` - UI library
- `tailwindcss` - CSS framework
- `typescript` - Type safety
- And other dependencies

### Step 3: Configure API Endpoint

The frontend is already configured to call `http://localhost:8000`. Verify in `apps/web/lib/api.ts`:

```typescript
const API_BASE = "http://localhost:8000";
```

**For production**, update this to your deployed backend URL.

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### Step 5: Open the Application

Visit **http://localhost:3000** in your browser.

You should see the Foodie Check upload interface!

---

## Part 3: Verify Full Stack Integration

### Test the Complete Flow

1. **Open Frontend**: http://localhost:3000
2. **Upload Images**:
   - Click "Upload Front Image" → Select a food packaging front photo
   - Click "Upload Back Image" → Select the back photo
3. **Generate Report**: Click "Generate Compliance Report"
4. **View Results**: See the Legal Metrology compliance table with pass/review/fail status

### Check Database Records

**PostgreSQL:**
```bash
psql -U postgres -d foodie_check

# Inside psql:
SELECT id, user_id, overall_status, passed, failed, created_at FROM scans;

# Exit:
\q
```

**SQLite:**
```bash
sqlite3 foodie_check.db

# Inside sqlite:
SELECT id, user_id, overall_status, passed, failed, created_at FROM scans;

# Exit:
.quit
```

---

## Part 4: Database Schema Verification

### Verify Tables Were Created

**PostgreSQL:**
```sql
-- Connect to database
psql -U postgres -d foodie_check

-- List all tables
\dt

-- Expected output:
--  Schema |       Name        | Type  |  Owner
-- --------+-------------------+-------+----------
--  public | compliance_rules  | table | postgres
--  public | scans             | table | postgres
```

**SQLite:**
```bash
sqlite3 foodie_check.db
.tables
# Expected: compliance_rules  scans
```

### Check Compliance Rules

These 8 Legal Metrology rules should be auto-inserted:

```sql
SELECT id, field_name, clause FROM compliance_rules;
```

**Expected output:**
```
   id    |      field_name       |     clause
---------+-----------------------+----------------
 LM6_1_b | common_name           | Rule 6(1)(b)
 LM6_1_c | net_quantity          | Rule 6(1)(c)
 LM6_1_d | mrp                   | Rule 6(1)(d)
 LM6_1_e | mfg_date              | Rule 6(1)(e)
 LM6_1_a | manufacturer_address  | Rule 6(1)(a)
 LM6_1_f | best_before           | Rule 6(1)(f)
 LM6_1_g | consumer_care         | Rule 6(1)(g)
 FSSAI   | fssai_license         | FSS Act 2006
```

If rules are missing, manually insert them:

```sql
INSERT INTO compliance_rules (id, field_name, clause, check_type, description) VALUES
('LM6_1_b', 'common_name', 'Rule 6(1)(b)', 'presence', 'Common or generic name must be declared'),
('LM6_1_c', 'net_quantity', 'Rule 6(1)(c)', 'presence', 'Net quantity must be declared'),
('LM6_1_d', 'mrp', 'Rule 6(1)(d)', 'presence_with_hedge', 'MRP inclusive of taxes must be declared'),
('LM6_1_e', 'mfg_date', 'Rule 6(1)(e)', 'presence_with_hedge', 'Month and year of manufacture/packing must be declared'),
('LM6_1_a', 'manufacturer_address', 'Rule 6(1)(a)', 'presence_multi', 'Name and address of manufacturer/packer must be declared'),
('LM6_1_f', 'best_before', 'Rule 6(1)(f)', 'presence_with_hedge', 'Best before / expiry date must be declared'),
('LM6_1_g', 'consumer_care', 'Rule 6(1)(g)', 'presence', 'Consumer care details must be declared'),
('FSSAI', 'fssai_license', 'FSS Act 2006', 'presence', 'FSSAI license number must be displayed');
```

---

## Part 5: API Endpoints Overview

Once both servers are running, these endpoints are available:

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ocr` | Raw OCR extraction only |
| POST | `/evaluate` | OCR + compliance check (no DB save) |
| POST | `/scans` | Full evaluation + save to database |
| GET | `/scans` | List scan history (paginated) |
| GET | `/scans/{scan_id}` | Get single scan details |
| DELETE | `/scans/{scan_id}` | Delete a scan |
| GET | `/scans/stats/summary` | Aggregate statistics |

### Test with cURL

```bash
# Test OCR endpoint
curl -X POST http://localhost:8000/ocr \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg"

# Test evaluation endpoint
curl -X POST http://localhost:8000/evaluate \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg"

# Test database endpoint
curl -X POST "http://localhost:8000/scans?user_id=testuser" \
  -F "front=@/path/to/front.jpg" \
  -F "back=@/path/to/back.jpg"

# Get scan history
curl "http://localhost:8000/scans?user_id=testuser"

# Get statistics
curl "http://localhost:8000/scans/stats/summary?user_id=testuser"
```

---

## Part 6: Troubleshooting

### Backend Issues

#### Error: `ModuleNotFoundError: No module named 'paddleocr'`
**Solution:**
```bash
cd services/ocr-engine
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

#### Error: `psycopg2.OperationalError: could not connect to server`
**Solution:**
- Ensure PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL in `.env`
- Or switch to SQLite: `DATABASE_URL=sqlite:///./foodie_check.db`

#### Error: `peer authentication failed for user "postgres"`
**Solution (Linux/Mac):**
Edit `/etc/postgresql/14/main/pg_hba.conf`, change `peer` to `md5`:
```
local   all   postgres   md5
```
Then restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

#### PaddleOCR is slow on first run
**Expected behavior:** PaddleOCR downloads ~200MB of models on first use. Subsequent runs are fast.

### Frontend Issues

#### Error: `ECONNREFUSED` when generating report
**Solution:**
- Verify backend is running: `curl http://localhost:8000`
- Check CORS settings in `services/ocr-engine/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must include frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Error: `Module not found: Can't resolve '@/components/...'`
**Solution:**
```bash
cd apps/web
npm install
```

---

## Part 7: Development Workflow

### Running Both Servers

**Terminal 1 - Backend:**
```bash
cd services/ocr-engine
venv\Scripts\activate  # or source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd apps/web
npm run dev
```

### Stopping Servers

- **Backend**: Press `Ctrl+C` in terminal 1
- **Frontend**: Press `Ctrl+C` in terminal 2

### Making Changes

**Backend (Python):**
- Edit files in `services/ocr-engine/`
- Server auto-reloads with `--reload` flag
- Check terminal 1 for errors

**Frontend (Next.js):**
- Edit files in `apps/web/`
- Browser auto-refreshes
- Check browser console for errors

---

## Part 8: Production Deployment

### Backend Deployment

1. **Set Production Database URL:**
```env
DATABASE_URL=postgresql://user:pass@your-db-host.com:5432/foodie_check?sslmode=require
```

2. **Use Production ASGI Server:**
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

3. **Update CORS Origins:**
```python
allow_origins=["https://your-frontend-domain.com"]
```

### Frontend Deployment

1. **Update API Base URL** in `apps/web/lib/api.ts`:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://your-backend-url.com";
```

2. **Build for Production:**
```bash
npm run build
npm start
```

3. **Deploy to Vercel/Netlify:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

### Environment Variables for Production

**Backend `.env`:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/foodie_check?sslmode=require
ALLOWED_ORIGINS=https://your-frontend.com
```

**Frontend `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

---

## Part 9: Project File Checklist

Ensure these files exist:

```
✅ services/ocr-engine/
   ✅ main.py
   ✅ database.py
   ✅ models.py
   ✅ requirements.txt
   ✅ .env (you create this)
   ✅ mapping/
      ✅ field_mapper.py
      ✅ patterns.py
   ✅ rules/
      ✅ engine.py
      ✅ checks.py
      ✅ ruleset.json

✅ apps/web/
   ✅ package.json
   ✅ next.config.ts
   ✅ tsconfig.json
   ✅ app/
      ✅ page.tsx
   ✅ components/
      ✅ scan/
         ✅ UploadSection.tsx
         ✅ ReportSection.tsx
         ✅ LegalMetrologyTable.tsx
   ✅ lib/
      ✅ api.ts
```

---

## Part 10: Quick Start Commands (Summary)

```bash
# Backend
cd services/ocr-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Create .env with DATABASE_URL
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (new terminal)
cd apps/web
npm install
npm run dev

# Visit http://localhost:3000
```

---

## Next Steps

1. ✅ **Test with real food packaging images**
2. ✅ **Verify all 8 rules are working correctly**
3. ✅ **Check database is storing scans**
4. ✅ **Customize frontend styling (Tailwind classes)**
5. ✅ **Add user authentication (optional)**
6. ✅ **Deploy to production**

---

## Support & Documentation

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Database Schema**: See `DATABASE_SCHEMA.md`
- **Project Architecture**: See `project-documentation.html`
- **Legal Metrology Rules**: See `services/ocr-engine/rules/ruleset.json`

---

## Contact

For Smart India Hackathon (SIH) team support, refer to your project repository README or team documentation.

**Happy Coding! 🚀**
