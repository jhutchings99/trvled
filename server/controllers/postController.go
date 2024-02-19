package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func GetPosts(c *gin.Context) {
	// get all posts from database
	var posts []models.Post
	result := initializers.DB.Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get posts",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, posts)
}

func CreatePost(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get content, and location from body
	var body struct {
		Content  string
		Location string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// TODO: store picture in cloudinary/s3 bucket and get url

	// store in database
	post := models.Post{
		UserID:   user.(models.User).ID,
		Content:  body.Content,
		Location: body.Location,
	}

	result := initializers.DB.Create(&post)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, post)
}
