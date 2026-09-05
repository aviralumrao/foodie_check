package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// DB holds the connection pool shared across the application.
var DB *pgxpool.Pool

// InitDB connects to PostgreSQL using DATABASE_URL from the environment.
// It retries up to 5 times with a 2-second pause to handle slow starts.
func InitDB() error {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return fmt.Errorf("DATABASE_URL environment variable is not set")
	}

	var pool *pgxpool.Pool
	var err error

	for i := 0; i < 5; i++ {
		pool, err = pgxpool.New(context.Background(), dsn)
		if err == nil {
			// Verify the connection is actually alive.
			if pingErr := pool.Ping(context.Background()); pingErr == nil {
				break
			} else {
				err = pingErr
				pool.Close()
			}
		}
		log.Printf("Database not ready, retrying in 2s... (%d/5)", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("could not connect to database: %w", err)
	}

	DB = pool
	log.Println("Connected to PostgreSQL successfully.")
	return nil
}

// ==================== Product queries ====================

func dbCreateProduct(ctx context.Context, r CreateProductRequest) (Product, error) {
	var p Product
	err := DB.QueryRow(ctx,
		`INSERT INTO products (name, brand, category, manufacturer, manufacturer_address)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, name, brand, category, manufacturer, manufacturer_address, created_at`,
		r.Name, r.Brand, r.Category, r.Manufacturer, r.ManufacturerAddress,
	).Scan(&p.ID, &p.Name, &p.Brand, &p.Category, &p.Manufacturer, &p.ManufacturerAddress, &p.CreatedAt)
	return p, err
}

func dbListProducts(ctx context.Context) ([]Product, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, name, brand, category, manufacturer, manufacturer_address, created_at
		 FROM products ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Brand, &p.Category,
			&p.Manufacturer, &p.ManufacturerAddress, &p.CreatedAt); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

func dbGetProduct(ctx context.Context, id int) (Product, error) {
	var p Product
	err := DB.QueryRow(ctx,
		`SELECT id, name, brand, category, manufacturer, manufacturer_address, created_at
		 FROM products WHERE id = $1`, id,
	).Scan(&p.ID, &p.Name, &p.Brand, &p.Category, &p.Manufacturer, &p.ManufacturerAddress, &p.CreatedAt)
	return p, err
}

func dbUpdateProduct(ctx context.Context, id int, r CreateProductRequest) (Product, error) {
	var p Product
	err := DB.QueryRow(ctx,
		`UPDATE products
		 SET name = $1, brand = $2, category = $3, manufacturer = $4, manufacturer_address = $5
		 WHERE id = $6
		 RETURNING id, name, brand, category, manufacturer, manufacturer_address, created_at`,
		r.Name, r.Brand, r.Category, r.Manufacturer, r.ManufacturerAddress, id,
	).Scan(&p.ID, &p.Name, &p.Brand, &p.Category, &p.Manufacturer, &p.ManufacturerAddress, &p.CreatedAt)
	return p, err
}

func dbDeleteProduct(ctx context.Context, id int) error {
	_, err := DB.Exec(ctx, `DELETE FROM products WHERE id = $1`, id)
	return err
}

// ==================== Inspection queries ====================

func dbCreateInspection(ctx context.Context, productID int) (Inspection, error) {
	var ins Inspection
	err := DB.QueryRow(ctx,
		`INSERT INTO inspections (product_id, status)
		 VALUES ($1, 'PROCESSING')
		 RETURNING id, product_id, status, overall_compliance, created_at`,
		productID,
	).Scan(&ins.ID, &ins.ProductID, &ins.Status, &ins.OverallCompliance, &ins.CreatedAt)
	return ins, err
}

func dbListInspections(ctx context.Context) ([]Inspection, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, product_id, status, overall_compliance, created_at
		 FROM inspections ORDER BY id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Inspection
	for rows.Next() {
		var ins Inspection
		if err := rows.Scan(&ins.ID, &ins.ProductID, &ins.Status,
			&ins.OverallCompliance, &ins.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, ins)
	}
	return list, rows.Err()
}

func dbGetInspection(ctx context.Context, id int) (Inspection, error) {
	var ins Inspection
	err := DB.QueryRow(ctx,
		`SELECT id, product_id, status, overall_compliance, created_at
		 FROM inspections WHERE id = $1`, id,
	).Scan(&ins.ID, &ins.ProductID, &ins.Status, &ins.OverallCompliance, &ins.CreatedAt)
	return ins, err
}

// ==================== OCR Result queries ====================

func dbCreateOCRResult(ctx context.Context, inspectionID int, r CreateOCRResultRequest) (OCRResult, error) {
	var o OCRResult
	err := DB.QueryRow(ctx,
		`INSERT INTO ocr_results
		   (inspection_id, product_name, mrp, net_quantity, manufacturer,
		    manufacturer_address, manufacturing_date, consumer_care, extracted_text)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
		 RETURNING id, inspection_id, product_name, mrp, net_quantity, manufacturer,
		           manufacturer_address, manufacturing_date, consumer_care, extracted_text, created_at`,
		inspectionID, r.ProductName, r.MRP, r.NetQuantity, r.Manufacturer,
		r.ManufacturerAddress, r.ManufacturingDate, r.ConsumerCare, r.ExtractedText,
	).Scan(
		&o.ID, &o.InspectionID, &o.ProductName, &o.MRP, &o.NetQuantity, &o.Manufacturer,
		&o.ManufacturerAddress, &o.ManufacturingDate, &o.ConsumerCare, &o.ExtractedText, &o.CreatedAt,
	)
	return o, err
}

func dbGetOCRResult(ctx context.Context, inspectionID int) (OCRResult, error) {
	var o OCRResult
	err := DB.QueryRow(ctx,
		`SELECT id, inspection_id, product_name, mrp, net_quantity, manufacturer,
		        manufacturer_address, manufacturing_date, consumer_care, extracted_text, created_at
		 FROM ocr_results WHERE inspection_id = $1`, inspectionID,
	).Scan(
		&o.ID, &o.InspectionID, &o.ProductName, &o.MRP, &o.NetQuantity, &o.Manufacturer,
		&o.ManufacturerAddress, &o.ManufacturingDate, &o.ConsumerCare, &o.ExtractedText, &o.CreatedAt,
	)
	return o, err
}

func dbUpdateInspectionCompliance(ctx context.Context, inspectionID int, compliance string) error {
	_, err := DB.Exec(ctx,
		`UPDATE inspections SET status = $1, overall_compliance = $1 WHERE id = $2`,
		compliance, inspectionID,
	)
	return err
}

// ==================== Violation queries ====================

func dbCreateViolation(ctx context.Context, inspectionID int, r CreateViolationRequest) (Violation, error) {
	var v Violation
	err := DB.QueryRow(ctx,
		`INSERT INTO violations (inspection_id, type, field, description, severity)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, inspection_id, type, field, description, severity, created_at`,
		inspectionID, r.Type, r.Field, r.Description, r.Severity,
	).Scan(&v.ID, &v.InspectionID, &v.Type, &v.Field, &v.Description, &v.Severity, &v.CreatedAt)
	return v, err
}

func dbListViolations(ctx context.Context, inspectionID int) ([]Violation, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, inspection_id, type, field, description, severity, created_at
		 FROM violations WHERE inspection_id = $1 ORDER BY id`, inspectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Violation
	for rows.Next() {
		var v Violation
		if err := rows.Scan(&v.ID, &v.InspectionID, &v.Type, &v.Field,
			&v.Description, &v.Severity, &v.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, v)
	}
	return list, rows.Err()
}

// ==================== Product Image queries ====================

func dbCreateProductImage(ctx context.Context, inspectionID int, r CreateProductImageRequest) (ProductImage, error) {
	var img ProductImage
	err := DB.QueryRow(ctx,
		`INSERT INTO product_images (inspection_id, image_path, image_type)
		 VALUES ($1, $2, $3)
		 RETURNING id, inspection_id, image_path, image_type, created_at`,
		inspectionID, r.ImagePath, r.ImageType,
	).Scan(&img.ID, &img.InspectionID, &img.ImagePath, &img.ImageType, &img.CreatedAt)
	return img, err
}

func dbListProductImages(ctx context.Context, inspectionID int) ([]ProductImage, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, inspection_id, image_path, image_type, created_at
		 FROM product_images WHERE inspection_id = $1 ORDER BY id`, inspectionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ProductImage
	for rows.Next() {
		var img ProductImage
		if err := rows.Scan(&img.ID, &img.InspectionID, &img.ImagePath, &img.ImageType, &img.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, img)
	}
	return list, rows.Err()
}

// ==================== History query ====================

func dbListHistory(ctx context.Context) ([]HistoryEntry, error) {
	rows, err := DB.Query(ctx,
		`SELECT i.id, i.status, i.overall_compliance, i.created_at,
		        p.id, p.name, p.brand, p.category
		 FROM inspections i
		 JOIN products p ON p.id = i.product_id
		 ORDER BY i.id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []HistoryEntry
	for rows.Next() {
		var h HistoryEntry
		if err := rows.Scan(
			&h.InspectionID, &h.InspectionStatus, &h.OverallCompliance,
			&h.InspectionCreated, &h.ProductID, &h.ProductName, &h.Brand, &h.Category,
		); err != nil {
			return nil, err
		}
		list = append(list, h)
	}
	return list, rows.Err()
}

// ==================== Scan queries ====================

func dbCreateScan(ctx context.Context, r CreateScanRequest) (Scan, error) {
	var s Scan
	err := DB.QueryRow(ctx,
		`INSERT INTO scans (user_id, front_image_url, back_image_url, raw_ocr, extracted_fields,
		                    rules_result, passed, needs_review, failed, overall_status)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		 RETURNING id, user_id, front_image_url, back_image_url, raw_ocr, extracted_fields,
		           rules_result, passed, needs_review, failed, overall_status, created_at, updated_at`,
		r.UserID, r.FrontImageURL, r.BackImageURL, r.RawOCR, r.ExtractedFields,
		r.RulesResult, r.Passed, r.NeedsReview, r.Failed, r.OverallStatus,
	).Scan(&s.ID, &s.UserID, &s.FrontImageURL, &s.BackImageURL, &s.RawOCR, &s.ExtractedFields,
		&s.RulesResult, &s.Passed, &s.NeedsReview, &s.Failed, &s.OverallStatus, &s.CreatedAt, &s.UpdatedAt)
	return s, err
}

func dbListScans(ctx context.Context) ([]Scan, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, user_id, front_image_url, back_image_url, raw_ocr, extracted_fields,
		        rules_result, passed, needs_review, failed, overall_status, created_at, updated_at
		 FROM scans ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Scan
	for rows.Next() {
		var s Scan
		if err := rows.Scan(&s.ID, &s.UserID, &s.FrontImageURL, &s.BackImageURL, &s.RawOCR, &s.ExtractedFields,
			&s.RulesResult, &s.Passed, &s.NeedsReview, &s.Failed, &s.OverallStatus, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, rows.Err()
}

func dbGetScan(ctx context.Context, id string) (Scan, error) {
	var s Scan
	err := DB.QueryRow(ctx,
		`SELECT id, user_id, front_image_url, back_image_url, raw_ocr, extracted_fields,
		        rules_result, passed, needs_review, failed, overall_status, created_at, updated_at
		 FROM scans WHERE id = $1`, id,
	).Scan(&s.ID, &s.UserID, &s.FrontImageURL, &s.BackImageURL, &s.RawOCR, &s.ExtractedFields,
		&s.RulesResult, &s.Passed, &s.NeedsReview, &s.Failed, &s.OverallStatus, &s.CreatedAt, &s.UpdatedAt)
	return s, err
}

// ==================== Compliance Rule queries ====================

func dbCreateComplianceRule(ctx context.Context, r CreateComplianceRuleRequest) (ComplianceRule, error) {
	var cr ComplianceRule
	isActive := true
	if r.IsActive != nil {
		isActive = *r.IsActive
	}
	err := DB.QueryRow(ctx,
		`INSERT INTO compliance_rules (id, field_name, clause, check_type, description, is_active)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, field_name, clause, check_type, description, is_active, created_at, updated_at`,
		r.ID, r.FieldName, r.Clause, r.CheckType, r.Description, isActive,
	).Scan(&cr.ID, &cr.FieldName, &cr.Clause, &cr.CheckType, &cr.Description, &cr.IsActive, &cr.CreatedAt, &cr.UpdatedAt)
	return cr, err
}

func dbListComplianceRules(ctx context.Context) ([]ComplianceRule, error) {
	rows, err := DB.Query(ctx,
		`SELECT id, field_name, clause, check_type, description, is_active, created_at, updated_at
		 FROM compliance_rules ORDER BY id ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []ComplianceRule
	for rows.Next() {
		var cr ComplianceRule
		if err := rows.Scan(&cr.ID, &cr.FieldName, &cr.Clause, &cr.CheckType, &cr.Description,
			&cr.IsActive, &cr.CreatedAt, &cr.UpdatedAt); err != nil {
			return nil, err
		}
		list = append(list, cr)
	}
	return list, rows.Err()
}
