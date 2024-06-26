package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string         `gorm:"unique" json:"email"`
	Password       string         `json:"password"`
	Username       string         `json:"username"`
	Bio            string         `json:"bio"`
	ProfilePicture string         `json:"profilePicture"`
	USAVisited     pq.StringArray `gorm:"type:text[]" json:"usaVisited"`
	GlobalVisited  pq.StringArray `gorm:"type:text[]" json:"globalVisited"`
	Following      pq.StringArray `gorm:"type:text[]" json:"following"`
	Followers      pq.StringArray `gorm:"type:text[]" json:"followers"`
	LikedPosts     pq.StringArray `gorm:"type:text[]" json:"likedPosts"`
}
