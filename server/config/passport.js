require("dotenv").config();
const User = require("../models/user.model");
const Token = require("../models/token.model");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const opts = {};
const jwt = require("jsonwebtoken");
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findOne({ email: jwt_payload.email });

      if (user) {
        const refreshTokenFromDB = await Token.findOne({
          user: user._id,
        });

        if (!refreshTokenFromDB) {
          return done(null, false);
        }

        const refreshPayload = jwt.verify(
          refreshTokenFromDB.refreshToken,
          process.env.REFRESH_SECRET
        );

        if (refreshPayload.email !== jwt_payload.email) {
          return done(null, false);
        }

        const tokenExpiration = new Date(jwt_payload.exp * 1000);
        const now = new Date();
        const timeDifference = tokenExpiration.getTime() - now.getTime();

        if (timeDifference > 0 && timeDifference < 30 * 60 * 1000) {
          const payloadNew = {
            _id: user._id,
            email: user.email,
          };
          const newToken = jwt.sign(payloadNew, process.env.SECRET, {
            expiresIn: "6h",
          });

          return done(null, { user, newToken });
        }
        return done(null, { user });
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:4000/api/users/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { email, given_name, family_name, picture } = profile._json;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        
        if (!user) {
          // Create new user if doesn't exist
          const fullName = `${given_name || ""} ${family_name || ""}`.trim() || email.split("@")[0];
          
          user = new User({
            email,
            name: fullName,
            username: email.split("@")[0],
            avatar: picture || "",
            password: "", // No password for OAuth users
            isEmailVerified: true, // Google verified the email
            googleId: profile.id,
          });
          await user.save();
        } else {
          // Update googleId if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            user.isEmailVerified = true;
            if (!user.avatar && picture) {
              user.avatar = picture;
            }
            await user.save();
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
