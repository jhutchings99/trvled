package models

import (
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email         string `gorm:"unique" json:"email"`
	Password      string `json:"password"`
	Username      string `json:"username"`
	USAVisited    []int  `gorm:"type:integer[]" json:"usaVisited"`
	GlobalVisited []int  `gorm:"type:integer[]" json:"globalVisited"`
}
