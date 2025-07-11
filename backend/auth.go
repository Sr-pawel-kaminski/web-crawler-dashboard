package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const AuthToken = "sykell-secret-token" // In production, use env/config

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token != "Bearer "+AuthToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Next()
	}
}
