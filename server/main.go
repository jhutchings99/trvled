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
		posts.POST("/", middleware.RequireAuth, controllers.CreatePost)
		posts.PATCH("/:postId/like", middleware.RequireAuth, controllers.LikeUnlikePost)
	}

	router.Run()
}
