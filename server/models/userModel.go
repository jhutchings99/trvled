package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email         string         `gorm:"unique" json:"email"`
	Password      string         `json:"password"`
	Username      string         `json:"username"`
	USAVisited    pq.StringArray `gorm:"type:text[]" json:"usaVisited"`
	GlobalVisited pq.StringArray `gorm:"type:text[]" json:"globalVisited"`
	Posts         []Post         `json:"posts"`
}
