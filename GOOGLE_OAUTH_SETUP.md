# Google OAuth Setup Guide

## 1. Setting up Google OAuth Credentials

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select **"New Project"**
3. Enter project name (e.g., "SocialEcho") and click **Create**

### Step 2: Enable Google+ API
1. Go to the **API Library**
2. Search for **"Google+ API"** and enable it
3. Search for **"OAuth 2.0"** related APIs and enable them

### Step 3: Create OAuth 2.0 Credentials
1. Go to **Credentials** in the left sidebar
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in required information (app name, user support email, etc.)
   - Add scopes: `email`, `profile`
   - Add test users (your email)

### Step 4: Configure OAuth Client
1. After OAuth consent screen is set up, go back to **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Add Authorized redirect URIs:
   ```
   http://localhost:4000/api/users/auth/google/callback  (for local development)
   https://yourdomain.com/api/users/auth/google/callback  (for production)
   ```
4. Copy the **Client ID** and **Client Secret**

## 2. Server Environment Variables

Add the following to your `.env` file in the `server` directory:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/users/auth/google/callback

# Frontend URL (for redirects after OAuth)
FRONTEND_URL=http://localhost:3000
```

## 3. Client Environment Variables

Add the following to your `.env.local` file in the `client` directory:

```bash
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
```

## 4. Testing Google OAuth Locally

1. **Make sure both servers are running:**
   ```bash
   # Terminal 1 - Server
   cd server && npm start

   # Terminal 2 - Client
   cd client && npm start
   ```

2. **Click "Google" button on login page**

3. **Complete Google authentication flow**

4. **You should be redirected back to your app and logged in**

## 5. Production Deployment

### Update Environment Variables for Production:

**Server `.env`:**
```bash
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/users/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

**Client `.env.production`:**
```bash
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
```

### Update Google Console:

1. Add your production domain to **Authorized redirect URIs**:
   ```
   https://yourdomain.com/api/users/auth/google/callback
   ```

2. Move from **External** to **Internal** user type in OAuth consent screen (if applicable)

## 6. Troubleshooting

### "redirect_uri_mismatch" Error
- Make sure the redirect URI in Google Console exactly matches `GOOGLE_CALLBACK_URL` in `.env`
- Check for trailing slashes and exact URL format

### "Client ID not found" Error
- Verify `GOOGLE_CLIENT_ID` is correctly set in `.env`
- Restart the server after updating `.env`

### Users not being created
- Check that the User model has `googleId` field added
- Verify MongoDB is running and connected
- Check server logs for specific errors

### Tokens not being saved
- Verify `Token` model exists in the database
- Check that refresh token is being generated correctly
- Ensure JWT secrets are set: `SECRET` and `REFRESH_SECRET`

## 7. API Endpoints

**Google OAuth Login Flow:**
- `GET /api/users/auth/google` - Initiates Google OAuth
- `GET /api/users/auth/google/callback` - OAuth callback endpoint

After successful authentication, the callback will redirect to:
```
http://localhost:3000/auth/google-callback?accessToken=...&refreshToken=...&email=...
```

## 8. User Data from Google

The integration automatically creates/updates users with:
- Email
- First Name
- Last Name  
- Profile Picture (Avatar)
- Google ID (stored for linking)
- Email verification status (automatically verified)

## Notes

- Google OAuth users won't have a password set (password field remains empty)
- Email is automatically verified for Google OAuth users
- Users can link their Google account by using the same email
- Each successful login creates activity logs (if logger middleware is configured)
