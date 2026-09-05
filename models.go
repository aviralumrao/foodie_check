package main

import (
	"encoding/json"
	"time"
)

// ---------- Product ----------

type Product struct {
	ID                  int       `json:"id"`
	Name                string    `json:"name"`
	Brand               string    `json:"brand"`
	Category            string    `json:"category"`
	Manufacturer        string    `json:"manufacturer"`
	ManufacturerAddress string    `json:"manufacturer_address"`
	CreatedAt           time.Time `json:"created_at"`
}

type CreateProductRequest struct {
	Name                string `json:"name"`
	Brand               string `json:"brand"`
	Category            string `json:"category"`
	Manufacturer        string `json:"manufacturer"`
	ManufacturerAddress string `json:"manufacturer_address"`
}

// ---------- Inspection ----------

type Inspection struct {
	ID                int       `json:"id"`
	ProductID         int       `json:"product_id"`
	Status            string    `json:"status"`
	OverallCompliance *string   `json:"overall_compliance"`
	CreatedAt         time.Time `json:"created_at"`
}

type CreateInspectionRequest struct {
	ProductID int `json:"product_id"`
}

// InspectionDetail is returned when fetching a single inspection.
// It includes the related product, OCR result (if any), images, and violations.
type InspectionDetail struct {
	Inspection Inspection     `json:"inspection"`
	Product    *Product       `json:"product"`
	OCRResult  *OCRResult     `json:"ocr_result"`
	Images     []ProductImage `json:"images"`
	Violations []Violation    `json:"violations"`
}

// ---------- OCR Result ----------

type OCRResult struct {
	ID                  int       `json:"id"`
	InspectionID        int       `json:"inspection_id"`
	ProductName         *string   `json:"product_name"`
	MRP                 *string   `json:"mrp"`
	NetQuantity         *string   `json:"net_quantity"`
	Manufacturer        *string   `json:"manufacturer"`
	ManufacturerAddress *string   `json:"manufacturer_address"`
	ManufacturingDate   *string   `json:"manufacturing_date"`
	ConsumerCare        *string   `json:"consumer_care"`
	ExtractedText       *string   `json:"extracted_text"`
	CreatedAt           time.Time `json:"created_at"`
}

type CreateOCRResultRequest struct {
	ProductName         *string `json:"product_name"`
	MRP                 *string `json:"mrp"`
	NetQuantity         *string `json:"net_quantity"`
	Manufacturer        *string `json:"manufacturer"`
	ManufacturerAddress *string `json:"manufacturer_address"`
	ManufacturingDate   *string `json:"manufacturing_date"`
	ConsumerCare        *string `json:"consumer_care"`
	ExtractedText       *string `json:"extracted_text"`
	// OverallCompliance updates the parent inspection as well.
	OverallCompliance string `json:"overall_compliance"`
}

// ---------- Violation ----------

type Violation struct {
	ID           int       `json:"id"`
	InspectionID int       `json:"inspection_id"`
	Type         string    `json:"type"`
	Field        string    `json:"field"`
	Description  string    `json:"description"`
	Severity     string    `json:"severity"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateViolationRequest struct {
	Type        string `json:"type"`
	Field       string `json:"field"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
}

// ---------- Product Image ----------

type ProductImage struct {
	ID           int       `json:"id"`
	InspectionID int       `json:"inspection_id"`
	ImagePath    string    `json:"image_path"`
	ImageType    string    `json:"image_type"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateProductImageRequest struct {
	ImagePath string `json:"image_path"`
	ImageType string `json:"image_type"`
}

// ---------- History ----------

// HistoryEntry is a flattened row used for GET /api/history.
type HistoryEntry struct {
	InspectionID      int       `json:"inspection_id"`
	InspectionStatus  string    `json:"inspection_status"`
	OverallCompliance *string   `json:"overall_compliance"`
	InspectionCreated time.Time `json:"inspection_created_at"`
	ProductID         int       `json:"product_id"`
	ProductName       string    `json:"product_name"`
	Brand             string    `json:"brand"`
	Category          string    `json:"category"`
}

// ---------- Scan ----------

// Scan represents a product label scan submitted for compliance checking.
// The rules_result field stores the full array of per-rule evaluation results as JSONB.
type Scan struct {
	ID              string          `json:"id"`
	UserID          string          `json:"user_id"`
	FrontImageURL   string          `json:"front_image_url"`
	BackImageURL    string          `json:"back_image_url"`
	RawOCR          json.RawMessage `json:"raw_ocr"`
	ExtractedFields json.RawMessage `json:"extracted_fields"`
	RulesResult     json.RawMessage `json:"rules_result"`
	Passed          int             `json:"passed"`
	NeedsReview     int             `json:"needs_review"`
	Failed          int             `json:"failed"`
	OverallStatus   string          `json:"overall_status"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

type CreateScanRequest struct {
	UserID          string          `json:"user_id"`
	FrontImageURL   string          `json:"front_image_url"`
	BackImageURL    string          `json:"back_image_url"`
	RawOCR          json.RawMessage `json:"raw_ocr"`
	ExtractedFields json.RawMessage `json:"extracted_fields"`
	RulesResult     json.RawMessage `json:"rules_result"`
	Passed          int             `json:"passed"`
	NeedsReview     int             `json:"needs_review"`
	Failed          int             `json:"failed"`
	OverallStatus   string          `json:"overall_status"`
}

// ---------- Compliance Rule ----------

// ComplianceRule defines a single regulatory field check.
type ComplianceRule struct {
	ID          string    `json:"id"`
	FieldName   string    `json:"field_name"`
	Clause      string    `json:"clause"`
	CheckType   string    `json:"check_type"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateComplianceRuleRequest struct {
	ID          string `json:"id"`
	FieldName   string `json:"field_name"`
	Clause      string `json:"clause"`
	CheckType   string `json:"check_type"`
	Description string `json:"description"`
	IsActive    *bool  `json:"is_active"`
}

// ---------- Generic responses ----------

type ErrorResponse struct {
	Error string `json:"error"`
}

type MessageResponse struct {
	Message string `json:"message"`
}
