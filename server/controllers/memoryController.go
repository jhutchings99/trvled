package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func GetCountryMemories(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})
		return
	}

	// get country id from params
	countryID := c.Param("countryID")

	// convert countryID to uint
	countryIDUint, err := strconv.ParseUint(countryID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid country ID",
		})
		return
	}

	// get post from database
	var countryMemories []models.Memory
	result := initializers.DB.Where(&models.Memory{
		UserID:    user.(models.User).ID, // Extract the UserID
		CountryId: uint(countryIDUint),
	}).Find(&countryMemories)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get memories", // Updated error message
		})
		return
	}

	// respond
	c.JSON(http.StatusOK, countryMemories)
}

func CreateMemory(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	countryID := c.Param("countryID")

	// get content, and location from body
	var body struct {
		Note string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// TODO: store picture in cloudinary/s3 bucket and get url

	// store in database
	countryIDUint, err := strconv.ParseUint(countryID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid country ID",
		})
		return
	}

	memory := models.Memory{
		UserID:    user.(models.User).ID,
		CountryId: uint(countryIDUint),
		Note:      body.Note,
	}

	result := initializers.DB.Create(&memory)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, memory)
}
