#!/bin/bash

# SocialEcho AWS Deployment Script
# This script helps automate the deployment process

echo "🚀 SocialEcho AWS Deployment Script"
echo "===================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Install with: brew install awscli"
    exit 1
fi

# Check if EB CLI is installed
if ! command -v eb &> /dev/null; then
    echo "❌ EB CLI not found. Install with: pip install awsebcli"
    exit 1
fi

# Get deployment step from argument
STEP=${1:-1}

case $STEP in
    1)
        echo "Step 1: Configure AWS CLI"
        echo "Run: aws configure"
        aws configure
        ;;
    2)
        echo "Step 2: Initialize Elastic Beanstalk"
        cd server
        eb init -p node.js-18 socialecho-api --region us-east-1
        ;;
    3)
        echo "Step 3: Create EB Environment"
        cd server
        eb create socialecho-api-env --instance-type t3.micro
        echo "Getting EB domain..."
        EB_DOMAIN=$(eb status | grep "CNAME" | awk '{print $2}')
        echo "EB Domain: $EB_DOMAIN"
        echo "Update GOOGLE_CALLBACK_URL to: https://$EB_DOMAIN/api/users/auth/google/callback"
        ;;
    4)
        echo "Step 4: Set Environment Variables"
        echo "Enter your MongoDB URI: "
        read MONGODB_URI
        echo "Enter your SECRET key: "
        read SECRET
        echo "Enter your REFRESH_SECRET: "
        read REFRESH_SECRET
        echo "Enter your SESSION_SECRET: "
        read SESSION_SECRET
        
        cd server
        echo "Enter your GOOGLE_CLIENT_ID: "
        read GOOGLE_CLIENT_ID
        echo "Enter your GOOGLE_CLIENT_SECRET: "
        read GOOGLE_CLIENT_SECRET
        
        eb setenv \
            NODE_ENV=production \
            MONGODB_URI="$MONGODB_URI" \
            SECRET="$SECRET" \
            REFRESH_SECRET="$REFRESH_SECRET" \
            SESSION_SECRET="$SESSION_SECRET" \
            GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
            GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET"
        ;;
    5)
        echo "Step 5: Deploy Backend"
        cd server
        eb deploy
        echo "Backend deployed! Check status with: eb status"
        ;;
    6)
        echo "Step 6: Build and Deploy Frontend"
        cd client
        npm run build
        echo "Build complete! Now:"
        echo "1. Create S3 bucket: aws s3 mb s3://socialecho-frontend-xxxx"
        echo "2. Upload: aws s3 sync build/ s3://socialecho-frontend-xxxx/"
        echo "3. Create CloudFront distribution in AWS Console"
        ;;
    *)
        echo "Usage: ./deploy.sh [1-6]"
        echo "  1 - Configure AWS CLI"
        echo "  2 - Initialize Elastic Beanstalk"
        echo "  3 - Create EB Environment"
        echo "  4 - Set Environment Variables"
        echo "  5 - Deploy Backend"
        echo "  6 - Build and Deploy Frontend"
        ;;
esac
