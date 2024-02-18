package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func Register(c *gin.Context) {
	// get email and password from body
	var body struct {
		Email    string
		Password string
		Username string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// store in database
	user := models.User{
		Email:         body.Email,
		Password:      body.Password,
		Username:      body.Username,
		USAVisited:    []int{},
		GlobalVisited: []int{},
	}
	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create user",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, user)
}
