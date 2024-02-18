package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
)

func Register(c *gin.Context) {
	// get email and password from body
	var body struct {
		Email    string
		Password string
		Username string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// store in database
	user := models.User{
		Email:         body.Email,
		Password:      body.Password,
		Username:      body.Username,
		USAVisited:    []string{},
		GlobalVisited: []string{},
	}
	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to create user",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, user)
}

func GetUser(c *gin.Context) {
	userId := c.Param("userId")

	// get user
	var user models.User
	result := initializers.DB.First(&user, userId)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find user",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, user)
}

func VisitNewLocation(c *gin.Context) {
	userId := c.Param("userId")
	location := c.Param("location")
	locationId := c.Param("locationId")

	// get user
	var user models.User
	result := initializers.DB.First(&user, userId)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find user",
		})

		return
	}

	if location != "usa" && location != "global" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid location",
		})

		return
	}

	// check which location to add to "global" or "usa"
	if location == "usa" {
		// check if state has been visited
		visited := false
		for _, id := range user.USAVisited {
			if id == locationId {
				visited = true
				break
			}
		}

		// add state to usa visited list
		if !visited {
			user.USAVisited = append(user.USAVisited, locationId)
		}
	}

	if location == "global" {
		// check if country has been visited
		visited := false
		for _, id := range user.GlobalVisited {
			if id == locationId {
				visited = true
				break
			}
		}

		// add country to global visited list
		if !visited {
			user.GlobalVisited = append(user.GlobalVisited, locationId)
		}
	}

	// update user
	result = initializers.DB.Save(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to update user",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, user)
}
