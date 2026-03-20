# AWS Deployment Guide for SocialEcho

## Prerequisites
- AWS Account (you have this ✓)
- AWS CLI installed: `brew install awscli` (macOS)
- EB CLI installed: `pip install awsebcli`
- AWS IAM user with Elastic Beanstalk, S3, and CloudFront permissions

## Step 1: Configure AWS CLI

```bash
aws configure
```

Enter:
- AWS Access Key ID: (from AWS IAM)
- AWS Secret Access Key: (from AWS IAM)
- Default region: `us-east-1` (or your preferred region)
- Default output format: `json`

## Step 2: Prepare Your Application

### Update server package.json
Make sure `server/package.json` has:
```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

### Create production .env for backend
The `.env` file in `/server/` will be set via Elastic Beanstalk environment variables (don't commit secrets)

## Step 3: Deploy Backend to Elastic Beanstalk

### Initialize EB Application

```bash
cd /Users/ponk6745/Desktop/SocialProj/server
eb init -p node.js-18 socialecho-api --region us-east-1
```

Options:
- Application name: `socialecho-api`
- Platform: `Node.js 18 running on 64bit Amazon Linux 2`
- Use CodeCommit: `n`
- Set up SSH: `y` (optional)

### Create EB Environment

```bash
eb create socialecho-api-env --instance-type t3.micro
```

This creates a free-tier eligible environment. It may take 5-10 minutes.

### Set Environment Variables

```bash
eb setenv \
  NODE_ENV=production \
  MONGODB_URI="your_mongodb_uri" \
  SECRET="your_secret_key" \
  REFRESH_SECRET="your_refresh_secret" \
  GOOGLE_CLIENT_ID="your_google_client_id" \
  GOOGLE_CLIENT_SECRET="your_google_client_secret" \
  EMAIL="your_email@gmail.com" \
  PASSWORD="your_app_password" \
  TEXTRAZOR_API_KEY="your_textrazor_key" \
  INTERFACE_API_KEY="your_huggingface_key" \
  SESSION_SECRET="generate_random_secret" \
  FRONTEND_URL="https://yourdomain.com"
```

Get your EB domain:
```bash
eb status
```

This shows your endpoint. Update:
```bash
eb setenv GOOGLE_CALLBACK_URL="https://your-eb-domain.us-east-1.elasticbeanstalk.com/api/users/auth/google/callback"
```

### Deploy Backend

```bash
cd /Users/ponk6745/Desktop/SocialProj/server
eb deploy
```

Monitor deployment:
```bash
eb logs
```

## Step 4: Update Google OAuth

1. Go to Google Cloud Console
2. Add authorized redirect URI:
   ```
   https://your-eb-domain.us-east-1.elasticbeanstalk.com/api/users/auth/google/callback
   ```

## Step 5: Deploy Frontend to S3 + CloudFront

### Build frontend

```bash
cd /Users/ponk6745/Desktop/SocialProj/client
npm run build
```

### Create S3 bucket

```bash
aws s3 mb s3://socialecho-frontend-$(date +%s) --region us-east-1
```

### Enable static website hosting

```bash
aws s3 website s3://socialecho-frontend-xxxx \
  --index-document index.html \
  --error-document index.html
```

### Upload build files

```bash
aws s3 sync build/ s3://socialecho-frontend-xxxx/ --delete
```

### Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create Distribution
3. Origin: Select your S3 bucket
4. Default Root Object: `index.html`
5. Error handling: Create custom error response
   - 403 errors → point to `/index.html`
   - 404 errors → point to `/index.html`
6. Create distribution (takes ~15 mins)

## Step 6: Update Frontend Configuration

In `client/src/pages/SignIn.jsx` and any API calls, update:

```javascript
const API_BASE = process.env.REACT_APP_API_URL || "https://your-eb-domain.us-east-1.elasticbeanstalk.com/api";
```

Update `.env.production`:
```
REACT_APP_API_URL=https://your-eb-domain.us-east-1.elasticbeanstalk.com/api
```

## Step 7: Set Up Custom Domain (Optional but Recommended)

### Using Route 53

1. Create hosted zone for your domain in Route 53
2. Point your domain registrar to Route 53 nameservers
3. Create A records:
   - Backend API: `api.yourdomain.com` → EB environment
   - Frontend: `yourdomain.com` → CloudFront distribution

### Update HTTPS

For Elastic Beanstalk:
1. Request SSL certificate in ACM
2. Attach to EB environment

For CloudFront:
1. Request SSL certificate in ACM
2. Attach to CloudFront distribution

## Step 8: Update URLs Everywhere

Once you have your domain/URLs, update:

### Google Cloud Console
```
https://yourdomain.com/api/users/auth/google/callback
```

### server/.env (via EB)
```
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/users/auth/google/callback
```

### client/.env.production
```
REACT_APP_API_URL=https://yourdomain.com/api
```

## Monitoring & Maintenance

### View logs
```bash
eb logs -f
```

### SSH into instance
```bash
eb ssh
```

### Scale up
```bash
eb scale 2  # Use 2 instances
```

### Redeploy after code changes
```bash
git push origin main  # or your branch
cd server && eb deploy
```

## Cost Estimates (Free Tier Eligible)
- **EB t3.micro**: Free (750 hours/month)
- **S3**: Free (first 5GB)
- **CloudFront**: Free (1TB/month)
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: ~$0/month (free tier) or $5-10/month (if upgraded)

## Troubleshooting

### EB deployment fails
```bash
eb logs
eb health
```

### Frontend not loading
- Check CloudFront distribution status
- Clear CloudFront cache
- Verify S3 bucket policy allows CloudFront access

### API calls failing from frontend
- Check CORS in backend (should be configured)
- Verify environment variables in EB
- Check security group allows inbound on port 443/80

### OAuth not working
- Verify callback URL matches exactly
- Check Google OAuth credentials are set in EB
- Check FRONTEND_URL environment variable

## Next Steps
1. Set up AWS account permissions & credentials
2. Run the EB initialization command
3. Set environment variables
4. Deploy and test
5. Set up custom domain (optional)
6. Enable HTTPS

Good luck! 🚀
