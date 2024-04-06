package controllers

import (
	"context"
	"fmt"
	"mime/multipart"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func GetPosts(c *gin.Context) {
	// get all posts from database
	var posts []models.Post
	result := initializers.DB.Preload("User").Find(&posts)

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
	initializers.DB.Preload("User").First(&post, "id = ?", postID)

	// check if user has viewed post
	var userViewed bool
	for _, viewer := range post.UniqueViewers {
		if viewer == user.(models.User).Email {
			userViewed = true
			break
		}
	}

	// if user has not viewed post, add user to unique viewers
	if !userViewed {
		post.UniqueViewers = append(post.UniqueViewers, user.(models.User).Email)
	}

	// update post in database
	result := initializers.DB.Save(&post)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to update post",
		})

		return
	}

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

	// get data from form
	content := c.PostForm("content")
	location := c.PostForm("location")

	// store picture in s3 bucket and get url
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to parse form",
		})
		return
	}

	files := form.File["image"] // Get []FileHeader
	var file *multipart.FileHeader

	if len(files) > 0 {
		file = files[0] // Take the first file if provided
	}

	if file != nil {

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

		fmt.Printf("Data for post: %v, %v, %v\n", content, location, uploaderResult.Location)

		// store in database
		post := models.Post{
			UserID:     user.(models.User).ID,
			Content:    content,
			Location:   location,
			PictureURL: uploaderResult.Location,
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
	} else {

		post := models.Post{
			UserID:   user.(models.User).ID,
			Content:  content,
			Location: location,
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
