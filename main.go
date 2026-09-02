package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	// Initialize DB
	if err := InitDB(); err != nil {
		log.Fatalf("Could not initialize DB: %v", err)
	}
	defer DB.Close()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router := NewRouter()

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
