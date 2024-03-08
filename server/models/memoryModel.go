package models

import (
	"gorm.io/gorm"
)

type Memory struct {
	gorm.Model
	UserID    uint   `gorm:"index" json:"userID"` // foreign key to user who made the memory
	CountryId uint   `json:"countryId"`
	ImageURL  string `json:"imageUrl"`
	Note      string `json:"note"`
}
