package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

// Helper to send JSON responses
func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// Helper to send error responses
func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, ErrorResponse{Error: message})
}

// Helper to parse ID from Go 1.22 PathValue
func getPathID(r *http.Request, key string) (int, bool) {
	val := r.PathValue(key)
	id, err := strconv.Atoi(val)
	return id, err == nil
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// ---------- Products ----------

func handleProducts(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		products, err := dbListProducts(r.Context())
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to list products")
			return
		}
		if products == nil {
			products = []Product{}
		}
		respondJSON(w, http.StatusOK, products)
		return
	}

	if r.Method == http.MethodPost {
		var p CreateProductRequest
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		newP, err := dbCreateProduct(r.Context(), p)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create product")
			return
		}
		respondJSON(w, http.StatusCreated, newP)
		return
	}
}

func handleProductByID(w http.ResponseWriter, r *http.Request) {
	id, ok := getPathID(r, "id")
	if !ok {
		respondError(w, http.StatusBadRequest, "Invalid product ID")
		return
	}

	if r.Method == http.MethodGet {
		p, err := dbGetProduct(r.Context(), id)
		if err != nil {
			respondError(w, http.StatusNotFound, "Product not found")
			return
		}
		respondJSON(w, http.StatusOK, p)
		return
	}

	if r.Method == http.MethodPut {
		var p CreateProductRequest
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		updatedP, err := dbUpdateProduct(r.Context(), id, p)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to update product")
			return
		}
		respondJSON(w, http.StatusOK, updatedP)
		return
	}

	if r.Method == http.MethodDelete {
		if err := dbDeleteProduct(r.Context(), id); err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to delete product")
			return
		}
		respondJSON(w, http.StatusOK, MessageResponse{Message: "Product deleted"})
		return
	}
}

// ---------- Inspections ----------

func handleInspections(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		list, err := dbListInspections(r.Context())
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to list inspections")
			return
		}
		if list == nil {
			list = []Inspection{}
		}
		respondJSON(w, http.StatusOK, list)
		return
	}

	if r.Method == http.MethodPost {
		var req CreateInspectionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		newIns, err := dbCreateInspection(r.Context(), req.ProductID)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create inspection")
			return
		}
		respondJSON(w, http.StatusCreated, newIns)
		return
	}
}

func handleInspectionByID(w http.ResponseWriter, r *http.Request) {
	id, ok := getPathID(r, "id")
	if !ok {
		respondError(w, http.StatusBadRequest, "Invalid inspection ID")
		return
	}

	ins, err := dbGetInspection(r.Context(), id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Inspection not found")
		return
	}

	product, _ := dbGetProduct(r.Context(), ins.ProductID)
	ocr, _ := dbGetOCRResult(r.Context(), id)
	violations, _ := dbListViolations(r.Context(), id)
	images, _ := dbListProductImages(r.Context(), id)

	if violations == nil {
		violations = []Violation{}
	}
	if images == nil {
		images = []ProductImage{}
	}

	result := InspectionDetail{
		Inspection: ins,
		Images:     images,
		Violations: violations,
	}
	if product.ID != 0 {
		result.Product = &product
	}
	if ocr.ID != 0 {
		result.OCRResult = &ocr
	}

	respondJSON(w, http.StatusOK, result)
}

// ---------- OCR Result ----------

func handleOCRResult(w http.ResponseWriter, r *http.Request) {
	id, ok := getPathID(r, "id")
	if !ok {
		respondError(w, http.StatusBadRequest, "Invalid inspection ID")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateOCRResultRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		newOCR, err := dbCreateOCRResult(r.Context(), id, req)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create OCR result")
			return
		}
		_ = dbUpdateInspectionCompliance(r.Context(), id, req.OverallCompliance)
		respondJSON(w, http.StatusCreated, newOCR)
		return
	}

	if r.Method == http.MethodGet {
		ocr, err := dbGetOCRResult(r.Context(), id)
		if err != nil {
			respondError(w, http.StatusNotFound, "OCR result not found")
			return
		}
		respondJSON(w, http.StatusOK, ocr)
		return
	}
}

// ---------- Violations ----------

func handleViolations(w http.ResponseWriter, r *http.Request) {
	id, ok := getPathID(r, "id")
	if !ok {
		respondError(w, http.StatusBadRequest, "Invalid inspection ID")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateViolationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		v, err := dbCreateViolation(r.Context(), id, req)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create violation")
			return
		}
		respondJSON(w, http.StatusCreated, v)
		return
	}

	if r.Method == http.MethodGet {
		list, err := dbListViolations(r.Context(), id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to list violations")
			return
		}
		if list == nil {
			list = []Violation{}
		}
		respondJSON(w, http.StatusOK, list)
		return
	}
}

// ---------- Product Images ----------

func handleProductImages(w http.ResponseWriter, r *http.Request) {
	id, ok := getPathID(r, "id")
	if !ok {
		respondError(w, http.StatusBadRequest, "Invalid inspection ID")
		return
	}

	if r.Method == http.MethodPost {
		var req CreateProductImageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}
		img, err := dbCreateProductImage(r.Context(), id, req)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create product image")
			return
		}
		respondJSON(w, http.StatusCreated, img)
		return
	}

	if r.Method == http.MethodGet {
		list, err := dbListProductImages(r.Context(), id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to list product images")
			return
		}
		if list == nil {
			list = []ProductImage{}
		}
		respondJSON(w, http.StatusOK, list)
		return
	}
}

// ---------- History ----------

func handleHistory(w http.ResponseWriter, r *http.Request) {
	history, err := dbListHistory(r.Context())
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to list history")
		return
	}
	if history == nil {
		history = []HistoryEntry{}
	}
	respondJSON(w, http.StatusOK, history)
}
