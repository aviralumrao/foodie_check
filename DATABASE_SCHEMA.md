# PostgreSQL Database Schema for Foodie Check

## Overview
This document specifies the database tables and relationships needed for the Foodie Check food packaging compliance scanner.

---

## Table 1: `scans`
**Primary table storing scan results and compliance evaluations**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique scan identifier |
| `user_id` | VARCHAR(255) | NOT NULL, INDEX | User who performed the scan |
| `front_image_url` | VARCHAR(512) | NOT NULL | URL/path to front packaging image |
| `back_image_url` | VARCHAR(512) | NOT NULL | URL/path to back packaging image |
| `raw_ocr` | JSONB | NULL | Raw OCR text blocks from both images |
| `extracted_fields` | JSONB | NULL | Mapped fields (MRP, dates, addresses, etc.) |
| `rules_result` | JSONB | NULL | Array of 8 rule evaluation results |
| `passed` | INTEGER | DEFAULT 0 | Count of passed rules |
| `needs_review` | INTEGER | DEFAULT 0 | Count of rules needing manual review |
| `failed` | INTEGER | DEFAULT 0 | Count of failed rules |
| `overall_status` | VARCHAR(20) | NOT NULL | `compliant` or `non_compliant` |
| `created_at` | TIMESTAMP | DEFAULT NOW(), INDEX | Scan creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_scans_user_id` on `user_id`
- `idx_scans_created_at` on `created_at`
- `idx_scans_overall_status` on `overall_status`

---

## Table 2: `compliance_rules`
**Reference table storing Legal Metrology Act rules**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(50) | PRIMARY KEY | Rule ID (e.g., `LM6_1_b`, `FSSAI`) |
| `field_name` | VARCHAR(100) | NOT NULL | Field being validated (e.g., `common_name`, `mrp`) |
| `clause` | VARCHAR(100) | NOT NULL | Legal reference (e.g., `Rule 6(1)(b)`) |
| `check_type` | VARCHAR(50) | NOT NULL | Validation type (`presence`, `presence_with_hedge`, `presence_multi`) |
| `description` | TEXT | NOT NULL | Human-readable rule description |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether rule is currently enforced |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Rule creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last rule update |

**Initial Data (8 Legal Metrology Rules):**
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

## Table 3: `users` (Optional - if not using external auth)
**User account information**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| `name` | VARCHAR(255) | NULL | User display name |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation date |
| `last_login` | TIMESTAMP | NULL | Last login timestamp |

---

## JSON Field Structures

### `scans.raw_ocr` Structure
```json
{
  "front": [
    {
      "text": "MRP: Rs. 150",
      "confidence": 0.95,
      "bbox": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  ],
  "back": [
    {
      "text": "Mfg: Jan 2026",
      "confidence": 0.88,
      "bbox": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  ]
}
```

### `scans.extracted_fields` Structure
```json
{
  "common_name": {
    "value": "Mixed Fruit Jam",
    "confidence": 0.92,
    "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
  },
  "mrp": {
    "value": "Rs. 150",
    "confidence": 0.95,
    "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
  },
  "net_quantity": {
    "value": "500g",
    "confidence": 0.90,
    "source": "combined_text"
  },
  "mfg_date": {
    "value": "01/2026",
    "confidence": 0.88,
    "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
  },
  "best_before": {
    "value": "12 months from manufacturing",
    "confidence": 0.85,
    "source": "combined_text"
  },
  "manufacturer_address": [
    {
      "text": "ABC Foods Pvt Ltd, 123 Industrial Area, Mumbai 400001",
      "confidence": 0.92,
      "bbox": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  ],
  "fssai_license": {
    "value": "10012021000123",
    "confidence": 0.94,
    "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
  },
  "consumer_care": {
    "value": "For queries: 1800-XXX-XXXX",
    "confidence": 0.87,
    "source": "combined_text"
  }
}
```

### `scans.rules_result` Structure
```json
[
  {
    "rule_id": "LM6_1_b",
    "clause": "Rule 6(1)(b)",
    "field": "common_name",
    "description": "Common or generic name must be declared",
    "status": "passed",
    "evidence": {
      "value": "Mixed Fruit Jam",
      "confidence": 0.92,
      "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  },
  {
    "rule_id": "LM6_1_d",
    "clause": "Rule 6(1)(d)",
    "field": "mrp",
    "description": "MRP inclusive of taxes must be declared",
    "status": "passed",
    "evidence": {
      "value": "Rs. 150",
      "confidence": 0.95,
      "source": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
    }
  },
  {
    "rule_id": "LM6_1_g",
    "clause": "Rule 6(1)(g)",
    "field": "consumer_care",
    "description": "Consumer care details must be declared",
    "status": "needs_review",
    "evidence": null
  },
  {
    "rule_id": "FSSAI",
    "clause": "FSS Act 2006",
    "field": "fssai_license",
    "description": "FSSAI license number must be displayed",
    "status": "failed",
    "evidence": null
  }
]
```

---

## SQL Schema Creation

```sql
-- Create scans table
CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    front_image_url VARCHAR(512) NOT NULL,
    back_image_url VARCHAR(512) NOT NULL,
    raw_ocr JSONB,
    extracted_fields JSONB,
    rules_result JSONB,
    passed INTEGER DEFAULT 0,
    needs_review INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    overall_status VARCHAR(20) NOT NULL CHECK (overall_status IN ('compliant', 'non_compliant')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX idx_scans_overall_status ON scans(overall_status);

-- Create compliance_rules table
CREATE TABLE compliance_rules (
    id VARCHAR(50) PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL,
    clause VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert Legal Metrology rules
INSERT INTO compliance_rules (id, field_name, clause, check_type, description) VALUES
('LM6_1_b', 'common_name', 'Rule 6(1)(b)', 'presence', 'Common or generic name must be declared'),
('LM6_1_c', 'net_quantity', 'Rule 6(1)(c)', 'presence', 'Net quantity must be declared'),
('LM6_1_d', 'mrp', 'Rule 6(1)(d)', 'presence_with_hedge', 'MRP inclusive of taxes must be declared'),
('LM6_1_e', 'mfg_date', 'Rule 6(1)(e)', 'presence_with_hedge', 'Month and year of manufacture/packing must be declared'),
('LM6_1_a', 'manufacturer_address', 'Rule 6(1)(a)', 'presence_multi', 'Name and address of manufacturer/packer must be declared'),
('LM6_1_f', 'best_before', 'Rule 6(1)(f)', 'presence_with_hedge', 'Best before / expiry date must be declared'),
('LM6_1_g', 'consumer_care', 'Rule 6(1)(g)', 'presence', 'Consumer care details must be declared'),
('FSSAI', 'fssai_license', 'FSS Act 2006', 'presence', 'FSSAI license number must be displayed');

-- Create users table (optional)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Add foreign key if using users table
-- ALTER TABLE scans ADD CONSTRAINT fk_scans_user FOREIGN KEY (user_id) REFERENCES users(id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scans_updated_at BEFORE UPDATE ON scans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at BEFORE UPDATE ON compliance_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Key Points for Backend Developer

1. **JSONB vs JSON**: Use `JSONB` for better query performance on JSON fields
2. **UUID vs VARCHAR**: `scans.user_id` is VARCHAR to support external auth systems (Firebase, Auth0, etc.)
3. **Image Storage**: `front_image_url` and `back_image_url` should store cloud URLs (S3, Cloudflare R2, etc.), not local paths
4. **Timestamps**: All timestamps use UTC (`NOW()` in PostgreSQL returns UTC by default)
5. **Rule Status Values**: Must be one of: `"passed"`, `"needs_review"`, `"failed"`
6. **Overall Status Values**: Must be either `"compliant"` or `"non_compliant"`
7. **Indexing**: Indexes on `user_id`, `created_at`, and `overall_status` for efficient queries

---

## Common Queries

### Get user scan history
```sql
SELECT id, front_image_url, passed, needs_review, failed, overall_status, created_at
FROM scans
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Get compliance statistics
```sql
SELECT 
    COUNT(*) as total_scans,
    SUM(CASE WHEN overall_status = 'compliant' THEN 1 ELSE 0 END) as compliant_count,
    SUM(CASE WHEN overall_status = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant_count,
    ROUND(AVG(passed), 2) as avg_passed_rules
FROM scans
WHERE user_id = $1;
```

### Get detailed scan with rules
```sql
SELECT 
    s.*,
    json_agg(
        json_build_object(
            'rule_id', cr.id,
            'description', cr.description,
            'clause', cr.clause
        )
    ) as rule_details
FROM scans s
CROSS JOIN compliance_rules cr
WHERE s.id = $1
GROUP BY s.id;
```

---

## Connection String Format

```
postgresql://username:password@host:port/database_name
```

**Example:**
```
postgresql://postgres:postgres@localhost:5432/foodie_check
```

**Production (with SSL):**
```
postgresql://user:pass@host.aws.rds.com:5432/foodie_check?sslmode=require
```
