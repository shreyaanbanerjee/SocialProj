const jwt = require("jsonwebtoken");
const Token = require("../models/token.model");

/**
 * Handle Google OAuth callback
 * Creates or updates user and returns JWT tokens
 */
const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        error: "Authentication failed",
      });
    }

    // Create JWT tokens
    const payload = {
      _id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.SECRET, {
      expiresIn: "6h",
    });

    const refreshTokenPayload = {
      email: user.email,
    };

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Save or update refresh token in database
    const tokenData = await Token.findOne({ user: user._id });
    
    if (tokenData) {
      tokenData.accessToken = accessToken;
      tokenData.refreshToken = refreshToken;
      await tokenData.save();
    } else {
      const newToken = new Token({
        user: user._id,
        accessToken,
        refreshToken,
      });
      await newToken.save();
    }

    // Return tokens as URL parameters or redirect with tokens
    // You can redirect to frontend with tokens in the query params/hash
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const redirectUrl = `${frontendUrl}/auth/google-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&email=${user.email}`;
    
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(
      `${frontendUrl}/signin?error=Authentication failed. Please try again.`
    );
  }
};

/**
 * Handle logout
 */
const logout = async (req, res) => {
  try {
    if (req.user) {
      await Token.deleteOne({ user: req.user._id });
    }
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Logout failed",
    });
  }
};

module.exports = {
  googleAuthCallback,
  logout,
};
