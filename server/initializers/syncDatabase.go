package initializers

import "github.com/jhutchings99/trvled/models"

func SyncDatabase() {
	DB.AutoMigrate(&models.User{}, &models.Post{})
}
