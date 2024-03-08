package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/controllers"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/middleware"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDb()
	initializers.SyncDatabase()
}

func main() {
	router := gin.Default()

	users := router.Group("/users")
	{
		users.POST("/register", controllers.Register)
		users.POST("/login", controllers.Login)

		users.GET("/:userId", controllers.GetUser)
		users.PATCH("/:userId/:location/:locationId", middleware.RequireAuth, controllers.VisitNewLocation)

		users.GET("/:userId/posts/", controllers.GetUserPosts)
	}

	posts := router.Group("/posts")
	{
		posts.GET("/", controllers.GetPosts)
		posts.GET("/:postId", controllers.GetPost)
		posts.GET("/:postId/comments", controllers.GetPostComments)
		posts.POST("/", middleware.RequireAuth, controllers.CreatePost)
		posts.POST("/:postId/comment", middleware.RequireAuth, controllers.CreateCommentOnPost)
		posts.PATCH("/:postId/like", middleware.RequireAuth, controllers.LikeUnlikePost)
		posts.DELETE("/:postId", middleware.RequireAuth, controllers.DeletePost)
	}

	comments := router.Group("/comments")
	{
		comments.GET("/:commentId", controllers.GetComment)
		comments.GET("/:commentId/comments", controllers.GetCommentComments)
		comments.POST("/:commentId/comment", middleware.RequireAuth, controllers.CreateCommentOnComment)
		comments.PATCH("/:commentId/like", middleware.RequireAuth, controllers.LikeUnlikeComment)
	}

	memories := router.Group("/memories")
	{
		memories.GET("/:countryID", middleware.RequireAuth, controllers.GetCountryMemories)
		memories.POST("/:countryID", middleware.RequireAuth, controllers.CreateMemory)
	}

	router.Run()
}
