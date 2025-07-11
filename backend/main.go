package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	InitDB()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	api.Use(AuthMiddleware())
	{
		api.POST("/urls", AddURLHandler)
		api.GET("/urls", ListURLsHandler)
		api.DELETE("/urls/:id", DeleteURLHandler)
		api.GET("/urls/:id", GetURLHandler)
		api.POST("/urls/:id/analyze", AnalyzeURLHandler)
		api.POST("/urls/:id/start", StartAnalysisHandler)
		api.POST("/urls/:id/stop", StopAnalysisHandler)
		api.PUT("/urls/:id", UpdateURLHandler)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.Run(":8080")
}

func AddURLHandler(c *gin.Context) {
	var req struct {
		Address string `json:"address" binding:"required,url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	url := URL{Address: req.Address, Status: "queued"}
	if err := DB.Create(&url).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, url)
}

func ListURLsHandler(c *gin.Context) {
	var urls []URL
	if err := DB.Preload("Results.Links").Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, urls)
}

func DeleteURLHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	tx := DB.Begin()

	tx.Where("result_id IN (SELECT id FROM analysis_results WHERE url_id = ?)", id).Delete(&Link{})
	tx.Where("url_id = ?", id).Delete(&AnalysisResult{})
	tx.Delete(&URL{}, id)

	if tx.Commit().Error != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": id})
}

func GetURLHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var url URL
	if err := DB.Preload("Results.Links").First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, url)
}

func AnalyzeURLHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var url URL
	if err := DB.First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	url.Status = "running"
	DB.Save(&url)

	if err := AnalyzeURL(&url); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": url.Status})
}

func StartAnalysisHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var url URL
	if err := DB.First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	if url.Status != "running" {
		url.Status = "running"
		DB.Save(&url)

		go func() {
			if err := AnalyzeURL(&url); err != nil {
				fmt.Printf("Analysis failed for URL %s: %v\n", url.Address, err)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{"status": url.Status})
}

func StopAnalysisHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	var url URL
	if err := DB.First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	if url.Status == "running" {
		url.Status = "stopped"
		DB.Save(&url)
	}

	c.JSON(http.StatusOK, gin.H{"status": url.Status})
}

func UpdateURLHandler(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var req struct {
		Address string `json:"address" binding:"required,url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var url URL
	if err := DB.First(&url, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	url.Address = req.Address

	url.Status = "queued"

	DB.Where("url_id = ?", id).Delete(&AnalysisResult{})

	if err := DB.Save(&url).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, url)
}
