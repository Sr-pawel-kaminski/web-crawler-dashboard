package main

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dsn := "myuser:mypassword@tcp(localhost:3306)/webcrawler?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	DB = db

	// Auto-migrate models
	db.AutoMigrate(&URL{}, &AnalysisResult{}, &Link{})
}
