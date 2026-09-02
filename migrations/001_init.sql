-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(255) NOT NULL,
  manufacturer_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'PROCESSING',
  overall_compliance VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ocr_results table
CREATE TABLE IF NOT EXISTS ocr_results (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL UNIQUE REFERENCES inspections(id) ON DELETE CASCADE,
  product_name VARCHAR(255),
  mrp VARCHAR(100),
  net_quantity VARCHAR(100),
  manufacturer VARCHAR(255),
  manufacturer_address TEXT,
  manufacturing_date VARCHAR(50),
  consumer_care VARCHAR(100),
  extracted_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create violations table
CREATE TABLE IF NOT EXISTS violations (
  id SERIAL PRIMARY KEY,
  inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  field VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
