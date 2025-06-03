package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func SupabaseAuth() gin.HandlerFunc {
	secret := os.Getenv("SUPABASE_JWT_SECRET")
	if secret == "" {
		panic("SUPABASE_JWT_SECRET is required")
	}
  
	return func(c *gin.Context) {
	  auth := c.GetHeader("Authorization")
	  if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid Authorization header"})
		return
	  }
  
	  tokenStr := strings.TrimPrefix(auth, "Bearer ")
	  token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		// Ensure HS256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		  return nil, jwt.ErrTokenMalformed
		}
		return []byte(secret), nil
	  })
	  if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	  }
  
	  // Extract claims (map claims)
	  claims, ok := token.Claims.(jwt.MapClaims)
	  if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
		return
	  }
  
	  // Optional: Check the "aud" claim matches your Supabase project's API URL
	  // Optional: Check exp, iat are valid (jwt.Parse does this by default)
  
	  // Grab the user UUID from "sub"
	  userID, ok := claims["sub"].(string)
	  if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid sub claim"})
		return
	  }
  
	  // Grab the user email from "email" claim
	  userEmail, _ := claims["email"].(string) // Optional, might not always be present
  
	  // Set in context for handlers to use
	  c.Set("userID", userID)
	  c.Set("userEmail", userEmail)
	  c.Next()
	}
  }