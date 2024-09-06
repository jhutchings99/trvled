package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/controllers"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/middleware"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDb()
	initializers.SyncDatabase()
	initializers.S3BucketUploader()
}

func main() {
	router := gin.Default()
	router.MaxMultipartMemory = 12 << 20 // 8 MiB

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://www.trveld.com", "https://www.trveld.bytebase.app", "https://trveld.bytebase.app"},
		AllowMethods:     []string{http.MethodGet, http.MethodPatch, http.MethodPost, http.MethodHead, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Content-Type", "X-XSRF-TOKEN", "Accept", "Origin", "X-Requested-With", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	users := router.Group("/users")
	{
		users.POST("/register", controllers.Register)
		users.POST("/login", controllers.Login)

		users.GET("/:userId", controllers.GetUser)
		users.PATCH("/:userId/:location/:locationId", middleware.RequireAuth, controllers.VisitNewLocation)
		users.PATCH("/:userId", middleware.RequireAuth, controllers.UpdateUser)

		users.GET("/:userId/posts/", controllers.GetUserPosts)
		users.GET("/:userId/posts/liked", controllers.GetUserLikedPosts)

		users.GET("/:userId/isFollowing", middleware.RequireAuth, controllers.IsFollowing)
		users.PATCH("/:userId/follow", middleware.RequireAuth, controllers.FollowUnfollowUser)

		users.GET("/:userId/followers", controllers.GetFollowers)
		users.GET("/:userId/following", controllers.GetFollowing)
		users.GET("/:userId/notFollowing", controllers.GetNotFollowing)

		users.GET("/:userId/following/posts", controllers.GetFollowingPosts)
	}

	posts := router.Group("/posts")
	{
		posts.GET("/", controllers.GetPosts)
		posts.GET("/:postId", middleware.RequireAuth, controllers.GetPost)
		posts.GET("/:postId/comments", controllers.GetPostComments)
		posts.POST("/", middleware.RequireAuth, controllers.CreatePost)
		posts.POST("/:postId/comment", middleware.RequireAuth, controllers.CreateCommentOnPost)
		posts.PATCH("/:postId/like", middleware.RequireAuth, controllers.LikeUnlikePost)
		posts.DELETE("/:postId", middleware.RequireAuth, controllers.DeletePost)
	}

	comments := router.Group("/comments")
	{
		comments.GET("/:commentId", middleware.RequireAuth, controllers.GetComment)
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
