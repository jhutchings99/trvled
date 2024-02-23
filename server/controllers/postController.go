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

func GetPost(c *gin.Context) {
	// get post id from params
	postID := c.Param("postId")

	// get post from database
	var post models.Post
	result := initializers.DB.First(&post, "id = ?", postID)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, post)
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

func LikeUnlikePost(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get post id from params
	postID := c.Param("postId")

	// get post from database
	var post models.Post
	result := initializers.DB.First(&post, "id = ?", postID)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get post",
		})

		return
	}

	// check if user has already liked post
	liked := false
	index := -1
	for i, like := range post.Likes {
		if like == user.(models.User).Email {
			liked = true
			index = i
			break
		}
	}

	// if liked remove like using index
	if liked {
		post.Likes = append(post.Likes[:index], post.Likes[index+1:]...)
	} else {
		post.Likes = append(post.Likes, user.(models.User).Email)
	}

	// update post in database
	result = initializers.DB.Save(&post)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to like/unlike post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, post)
}

func DeletePost(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get post id from params
	postID := c.Param("postId")

	// get post from database
	var post models.Post
	result := initializers.DB.First(&post, "id = ?", postID)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get post",
		})

		return
	}

	// check if user is owner of post
	if post.UserID != user.(models.User).ID {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user is not owner of post",
		})

		return
	}

	// delete post from database
	result = initializers.DB.Delete(&post)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to delete post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, post)
}
