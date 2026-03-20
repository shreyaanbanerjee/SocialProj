# AWS Deployment Quick Start

## TL;DR - Quick Setup (10 minutes)

### 1. Install AWS Tools
```bash
# macOS
brew install awscli
pip install awsebcli

# Linux/Windows - see AWS_DEPLOYMENT_GUIDE.md
```

### 2. Configure AWS
```bash
aws configure
# Enter your AWS Access Key ID and Secret when prompted
```

### 3. Deploy Backend
```bash
cd /Users/ponk6745/Desktop/SocialProj/server

# Initialize (one-time)
eb init -p node.js-18 socialecho-api --region us-east-1

# Create environment (one-time, takes ~10 mins)
eb create socialecho-api-env --instance-type t3.micro

# Set environment variables
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://shre6745_db_user:wrV8Vdc0CeoOe1Sx@cluster0.8wiksz4.mongodb.net/?appName=Cluster0" \
  SECRET="supersecretkey" \
  REFRESH_SECRET="supersecretrefreshkey" \
  SESSION_SECRET="random-secret-string-here" \
  GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" \
  GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET" \
  EMAIL="your_email@gmail.com" \
  PASSWORD="ngmw mbpx dekh aywm" \
  TEXTRAZOR_API_KEY="0ec4a5c5606380a3a3e19d5fd466bae49698cf75303048d7b3eef167" \
  INTERFACE_API_KEY="YOUR_HUGGINGFACE_TOKEN"

# Get your EB domain
eb status
# Look for CNAME: xxxxx.us-east-1.elasticbeanstalk.com

# Set Google callback URL
eb setenv GOOGLE_CALLBACK_URL="https://xxxxx.us-east-1.elasticbeanstalk.com/api/users/auth/google/callback"

# Deploy
eb deploy
```

### 4. Update Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to Credentials → OAuth client
3. Add to "Authorized redirect URIs":
   ```
   https://xxxxx.us-east-1.elasticbeanstalk.com/api/users/auth/google/callback
   ```

### 5. Deploy Frontend
```bash
cd /Users/ponk6745/Desktop/SocialProj/client

# Build
npm run build

# Create S3 bucket (replace timestamp with something unique)
aws s3 mb s3://socialecho-app-$(date +%s) --region us-east-1

# Upload
aws s3 sync build/ s3://socialecho-app-xxxxx/ --delete

# Configure for static website (replace bucket name)
aws s3 website s3://socialecho-app-xxxxx \
  --index-document index.html \
  --error-document index.html
```

### 6. Create CloudFront Distribution
1. Go to AWS CloudFront Console
2. Create Distribution
3. Origin: Select your S3 bucket
4. Default Root Object: `index.html`
5. Error Responses: 
   - Error code 403 → `/index.html`
   - Error code 404 → `/index.html`
6. Create and wait ~15 mins

## Useful EB Commands

```bash
# View status
eb status

# View logs
eb logs -f

# SSH into instance
eb ssh

# Redeploy code
eb deploy

# Scale to 2 instances
eb scale 2

# Terminate (delete) environment
eb terminate socialecho-api-env
```

## Cost
- **Free Tier** (first 12 months): $0
- **After free tier**: ~$5-10/month if using t3.micro

## Detailed Guide
See `AWS_DEPLOYMENT_GUIDE.md` for complete step-by-step instructions with troubleshooting.

## Next Steps After Deployment
1. ✅ Deploy backend
2. ✅ Deploy frontend  
3. → Set up custom domain (optional)
4. → Set up HTTPS with ACM (AWS Certificate Manager)
5. → Monitor logs and errors

Good luck! 🚀
