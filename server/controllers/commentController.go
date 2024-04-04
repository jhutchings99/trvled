package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func CreateCommentOnPost(c *gin.Context) {
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
	postIDUint, err := strconv.ParseUint(postID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid post ID",
		})
		return
	}

	// get content
	var body struct {
		Content string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// TODO: store picture in cloudinary/s3 bucket and get url

	// store in database
	commentOnPost := models.Comment{
		UserID:          user.(models.User).ID,
		CommentableID:   uint(postIDUint),
		CommentableType: "Post",
		Content:         body.Content,
	}

	result := initializers.DB.Create(&commentOnPost)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create comment on post",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, commentOnPost)
}

func CreateCommentOnComment(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get post id from params
	commentId := c.Param("commentId")
	commentIDUint, err := strconv.ParseUint(commentId, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid post ID",
		})
		return
	}

	// get content
	var body struct {
		Content string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// TODO: store picture in cloudinary/s3 bucket and get url

	// store in database
	commentOnComment := models.Comment{
		UserID:          user.(models.User).ID,
		CommentableID:   uint(commentIDUint),
		CommentableType: "Comment",
		Content:         body.Content,
	}

	result := initializers.DB.Create(&commentOnComment)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create comment on comment",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, commentOnComment)
}

func LikeUnlikeComment(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get comment id from params
	commentId := c.Param("commentId")

	// get comment from database
	var comment models.Comment
	result := initializers.DB.First(&comment, "id = ?", commentId)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get comment",
		})

		return
	}

	// check if user has already liked comment
	liked := false
	index := -1
	for i, like := range comment.Likes {
		if like == user.(models.User).Email {
			liked = true
			index = i
			break
		}
	}

	// if liked remove like using index
	if liked {
		comment.Likes = append(comment.Likes[:index], comment.Likes[index+1:]...)
	} else {
		comment.Likes = append(comment.Likes, user.(models.User).Email)
	}

	// update post in database
	result = initializers.DB.Save(&comment)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to like/unlike comment",
		})

		return
	}

	// get the updated comment and preload the user before responding
	initializers.DB.Preload("User").First(&comment, commentId)

	// respond
	c.JSON(http.StatusOK, comment)
}

func GetPostComments(c *gin.Context) {
	postID := c.Param("postId")

	var comments []models.Comment
	result := initializers.DB.Where("commentable_id = ? AND commentable_type = ?", postID, "Post").Find(&comments)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get comments",
		})
		return
	}

	for i := range comments {
		initializers.DB.Model(&comments[i]).Association("User").Find(&comments[i].User)
	}

	c.JSON(http.StatusOK, comments)
}

func GetCommentComments(c *gin.Context) {
	commentID := c.Param("commentId")

	var comments []models.Comment
	result := initializers.DB.Where("commentable_id = ? AND commentable_type = ?", commentID, "Comment").Preload("User").Find(&comments)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get comments",
		})

		return
	}

	c.JSON(http.StatusOK, comments)
}

func GetComment(c *gin.Context) {
	commentID := c.Param("commentId")

	var comment models.Comment
	result := initializers.DB.Preload("User").First(&comment, commentID)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to get comment",
		})
		return
	}

	c.JSON(http.StatusOK, comment)
}
