package controllers

import (
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/jhutchings99/trvled/initializers"
	"github.com/jhutchings99/trvled/models"
	"golang.org/x/crypto/bcrypt"
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

	// hash password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to hash password",
		})

		return
	}

	// store in database
	user := models.User{
		Email:         body.Email,
		Password:      string(hashedPassword),
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

func Login(c *gin.Context) {
	// get email and password
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to read body",
		})

		return
	}

	// get user from database with email
	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to login",
		})

		return
	}

	// compare given password with hashed
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to login",
		})

		return
	}

	// create JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		// set subject to user id
		"sub": user.ID,
		// set expiration date for 30 days
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	// Sign and get the complete encoded token as a string using the secret
	jwtSecret := os.Getenv("JWT_SECRET")
	tokenString, err := token.SignedString([]byte(jwtSecret))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to login",
		})

		return
	}

	// return JWT with cookie
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("Authorization", tokenString, 3600*24*30, "", "", false, true)

	c.JSON(http.StatusOK, gin.H{})
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

func GetUserPosts(c *gin.Context) {
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

	// get posts
	var posts []models.Post
	result = initializers.DB.Where("user_id = ?", user.ID).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find posts",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, posts)
}
