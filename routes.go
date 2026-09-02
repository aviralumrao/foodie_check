package main

import (
	"net/http"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /api/health", handleHealth)

	// Products
	mux.HandleFunc("GET /api/products", handleProducts)
	mux.HandleFunc("POST /api/products", handleProducts)
	mux.HandleFunc("GET /api/products/{id}", handleProductByID)
	mux.HandleFunc("PUT /api/products/{id}", handleProductByID)
	mux.HandleFunc("DELETE /api/products/{id}", handleProductByID)

	// Inspections
	mux.HandleFunc("GET /api/inspections", handleInspections)
	mux.HandleFunc("POST /api/inspections", handleInspections)
	mux.HandleFunc("GET /api/inspections/{id}", handleInspectionByID)

	// OCR Results
	mux.HandleFunc("GET /api/inspections/{id}/ocr-result", handleOCRResult)
	mux.HandleFunc("POST /api/inspections/{id}/ocr-result", handleOCRResult)

	// Product Images
	mux.HandleFunc("GET /api/inspections/{id}/images", handleProductImages)
	mux.HandleFunc("POST /api/inspections/{id}/images", handleProductImages)

	// Violations
	mux.HandleFunc("GET /api/inspections/{id}/violations", handleViolations)
	mux.HandleFunc("POST /api/inspections/{id}/violations", handleViolations)

	// History
	mux.HandleFunc("GET /api/history", handleHistory)

	return mux
}
