package controllers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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

	// now using formdata to get note and image
	note := c.PostForm("note")

	// store picture in s3 bucket and get url
	file, err := c.FormFile("image")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read file",
		})

		return
	}

	// save the file to s3
	f, err := file.Open()

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read file",
		})

		return
	}

	uploaderResult, err := initializers.Uploader.Upload(context.TODO(), &s3.PutObjectInput{
		Bucket: aws.String("trveld"),
		Key:    aws.String(file.Filename),
		Body:   f,
		ACL:    "public-read",
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to upload file",
		})

		return
	}

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
		ImageURL:  uploaderResult.Location,
		Note:      note,
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
