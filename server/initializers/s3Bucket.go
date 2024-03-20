package initializers

import (
	"context"
	"log"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/s3/manager"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var Uploader *manager.Uploader

func S3BucketUploader() {
	// Set up s3 uploader
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Printf("error: %v", err)
		return
	}

	client := s3.NewFromConfig(cfg)

	Uploader = manager.NewUploader(client)
}
