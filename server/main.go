package main

import (
	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/controllers"
	"github.com/jhutchings99/trvled/initializers"
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
		users.GET("/:userId", controllers.GetUser)
		users.POST("/register", controllers.Register)
		users.POST("/:userId/:location/:locationId", controllers.VisitNewLocation)
	}

	router.Run()
}
