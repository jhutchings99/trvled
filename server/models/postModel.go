package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Post struct {
	gorm.Model
	UserID        uint           `json:"userID"`
	User          User           `gorm:"foreignKey:UserID"`
	Content       string         `json:"content"`
	PictureURL    string         `json:"pictureURL"`
	Location      string         `json:"location"`
	Likes         pq.StringArray `gorm:"type:text[]" json:"likes"`
	NumComments   int            `json:"numComments"`
	UniqueViewers pq.StringArray `gorm:"type:text[]" json:"uniqueViewers"`
}
