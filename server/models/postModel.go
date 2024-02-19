package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	UserID     uint           `gorm:"index" json:"userID"` // foreign key to user
	Content    string         `json:"content"`
	PictureURL string         `json:"pictureURL"`
	Location   string         `json:"location"`
	Likes      pq.StringArray `gorm:"type:text[]" json:"likes"`
}
