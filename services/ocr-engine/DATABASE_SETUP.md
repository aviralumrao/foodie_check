# Database Setup Guide

## PostgreSQL Setup

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE foodie_check;

# Create user (optional)
CREATE USER foodie_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE foodie_check TO foodie_user;

# Exit
\q
```

### 3. Configure Connection

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodie_check
```

For custom user:
```env
DATABASE_URL=postgresql://foodie_user:your_password@localhost:5432/foodie_check
```

### 4. Install Python Dependencies

```bash
# Activate virtual environment
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# Install new dependencies
pip install -r requirements.txt
```

### 5. Initialize Database Tables

The tables are auto-created on first run. Start the server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Check logs for:
```
INFO:     Application startup complete.
```

The `scans` table is now created automatically.

---

## API Endpoints (with Database)

### **POST /scans** — Save scan to database
Upload images, run OCR + compliance, and save to DB.

**Request:**
```bash
curl -X POST http://localhost:8000/scans?user_id=user123 \
  -F "front=@front.jpg" \
  -F "back=@back.jpg"
```

**Response:**
```json
{
  "scan_id": "uuid",
  "fields": { ... },
  "rules": [ ... ],
  "summary": { "passed": 6, "needs_review": 1, "failed": 1 },
  "overall_status": "non_compliant",
  "created_at": "2026-09-05T05:50:00"
}
```

### **GET /scans** — List scan history
```bash
curl "http://localhost:8000/scans?user_id=user123&limit=20&offset=0"
```

**Response:**
```json
{
  "total": 50,
  "scans": [
    {
      "scan_id": "uuid",
      "front_image_url": "front.jpg",
      "back_image_url": "back.jpg",
      "passed": 6,
      "needs_review": 1,
      "failed": 1,
      "overall_status": "non_compliant",
      "created_at": "2026-09-05T05:50:00"
    }
  ]
}
```

### **GET /scans/{scan_id}** — Get single scan
```bash
curl http://localhost:8000/scans/uuid
```

**Response:** Full scan details including `raw_ocr` and `rules_result`.

### **DELETE /scans/{scan_id}** — Delete scan
```bash
curl -X DELETE http://localhost:8000/scans/uuid
```

### **GET /scans/stats/summary** — Aggregate stats
```bash
curl "http://localhost:8000/scans/stats/summary?user_id=user123"
```

**Response:**
```json
{
  "total_scans": 50,
  "compliant": 35,
  "non_compliant": 15,
  "compliance_rate": 70.0
}
```

---

## Database Schema

**Table: `scans`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | VARCHAR (PK) | UUID |
| `user_id` | VARCHAR (indexed) | User identifier |
| `front_image_url` | VARCHAR | Front image path/URL |
| `back_image_url` | VARCHAR | Back image path/URL |
| `raw_ocr` | JSON | OCR blocks from front + back |
| `rules_result` | JSON | Array of 8 rule evaluation results |
| `passed` | INTEGER | Count of passed rules |
| `needs_review` | INTEGER | Count of rules needing review |
| `failed` | INTEGER | Count of failed rules |
| `overall_status` | ENUM | `compliant` or `non_compliant` |
| `created_at` | TIMESTAMP (indexed) | Scan timestamp |

---

## Testing Without PostgreSQL

Use SQLite for local testing without installing PostgreSQL:

**.env:**
```env
DATABASE_URL=sqlite:///./foodie_check.db
```

The API works the same way, data stored in `foodie_check.db` file.

---

## Original Stateless Endpoints

These still work without database:

- **POST /ocr** — Raw OCR only
- **POST /evaluate** — OCR + compliance check (no save)

Use `/evaluate` if you just need the compliance report without persistence.

---

## Production Deployment

For cloud PostgreSQL (AWS RDS, Heroku, Supabase, etc.):

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
```

**Important:** Store image files in S3/Cloudflare R2/etc., save URLs in `front_image_url` and `back_image_url`.

---

## Troubleshooting

**Error: `peer authentication failed`**
- Edit `pg_hba.conf`, change `peer` to `md5` for local connections
- Restart PostgreSQL: `sudo systemctl restart postgresql`

**Error: `psycopg2 not found`**
- Install: `pip install psycopg2-binary`

**Error: `database "foodie_check" does not exist`**
- Create it: `psql -U postgres -c "CREATE DATABASE foodie_check;"`

**Tables not created:**
- Check logs on server startup
- Manually create: `python -c "from database import init_db; init_db()"`
