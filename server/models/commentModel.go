package models

import (
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Comment struct {
	gorm.Model
	UserID          uint           `gorm:"index" json:"userID"` // foreign key to user who made the comment
	User            User           `gorm:"foreignKey:UserID"`
	CommentableID   uint           `json:"commentableID"`
	CommentableType string         `json:"commentableType"`
	Content         string         `json:"content"`
	PictureURL      string         `json:"pictureURL"`
	Likes           pq.StringArray `gorm:"type:text[]" json:"likes"`
	NumComments     int            `json:"numComments"`
	UniqueViewers   pq.StringArray `gorm:"type:text[]" json:"uniqueViewers"`
}
