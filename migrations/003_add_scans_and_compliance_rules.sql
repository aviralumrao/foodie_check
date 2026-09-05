-- Create compliance_rules table
CREATE TABLE IF NOT EXISTS compliance_rules (
  id VARCHAR(50) PRIMARY KEY,
  field_name VARCHAR(100) NOT NULL,
  clause VARCHAR(100) NOT NULL,
  check_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create scans table with UUID primary key and JSONB fields
CREATE TABLE IF NOT EXISTS scans (
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
  overall_status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at);
CREATE INDEX IF NOT EXISTS idx_scans_overall_status ON scans(overall_status);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_is_active ON compliance_rules(is_active);
