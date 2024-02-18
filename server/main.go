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

	router.POST("/register", controllers.Register)

	router.Run()
}
