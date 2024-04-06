package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
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

	fmt.Println("Created JWT: ", tokenString)

	// create user response with no sensitive data and the JWT
	c.JSON(http.StatusOK, gin.H{
		"id":            user.ID,
		"email":         user.Email,
		"username":      user.Username,
		"usaVisited":    user.USAVisited,
		"globalVisited": user.GlobalVisited,
		"accessToken":   tokenString,
	})
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
		index := -1
		for i, id := range user.USAVisited {
			if id == locationId {
				visited = true
				index = i
				break
			}
		}

		// add state to usa visited list
		if !visited {
			user.USAVisited = append(user.USAVisited, locationId)
		} else {
			user.USAVisited = append(user.USAVisited[:index], user.USAVisited[index+1:]...)
		}
	}

	if location == "global" {
		// check if country has been visited
		visited := false
		index := -1
		for i, id := range user.GlobalVisited {
			if id == locationId {
				visited = true
				index = i
				break
			}
		}

		// add country to global visited list
		if !visited {
			user.GlobalVisited = append(user.GlobalVisited, locationId)
		} else {
			user.GlobalVisited = append(user.GlobalVisited[:index], user.GlobalVisited[index+1:]...)
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
	result = initializers.DB.Preload("User").Where("user_id = ?", user.ID).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find posts",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, posts)
}

func GetUserLikedPosts(c *gin.Context) {
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

	// convert liked posts array of strings to array of uints for query
	var likedPosts []uint
	for _, id := range user.LikedPosts {
		// Convert id from string to uint
		convertedID, err := strconv.ParseUint(id, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "failed to convert id",
			})
			return
		}
		likedPosts = append(likedPosts, uint(convertedID))
	}

	// get posts
	var posts []models.Post
	result = initializers.DB.Preload("User").Where("id IN ?", likedPosts).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find posts",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, posts)
}

func IsFollowing(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	// get user to check if following
	userId := c.Param("userId")

	// get user
	var userToCheck models.User
	result := initializers.DB.First(&userToCheck, userId)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find user",
		})

		return
	}

	// check if user is following
	isFollowing := false
	for _, id := range user.(models.User).Following {
		if id == userId {
			isFollowing = true
			break
		}
	}

	// respond
	c.JSON(http.StatusOK, gin.H{
		"isFollowing": isFollowing,
	})
}

func FollowUnfollowUser(c *gin.Context) {
	// get logged in user from context
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "user not found",
		})

		return
	}

	var dbUser models.User
	result := initializers.DB.First(&dbUser, user.(models.User).ID)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find user",
		})

		return
	}

	// get user to follow/unfollow
	userId := c.Param("userId")

	// get user
	var userToFollow models.User
	result = initializers.DB.First(&userToFollow, userId)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to find user",
		})

		return
	}

	// check if user is already following
	isFollowing := false
	index := -1
	for i, id := range user.(models.User).Following {
		if id == userId {
			isFollowing = true
			index = i
			break
		}
	}

	// follow/unfollow user
	if !isFollowing {
		dbUser.Following = append(dbUser.Following, userId)
		userToFollow.Followers = append(userToFollow.Followers, strconv.Itoa(int(dbUser.ID)))
	} else {
		dbUser.Following = append(dbUser.Following[:index], dbUser.Following[index+1:]...)
		userToFollow.Followers = append(userToFollow.Followers[:index], userToFollow.Followers[index+1:]...)
	}

	// update users
	result = initializers.DB.Save(&dbUser)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to update user",
		})

		return
	}

	result = initializers.DB.Save(&userToFollow)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "failed to update user",
		})

		return
	}

	// respond
	c.JSON(http.StatusOK, user)
}
