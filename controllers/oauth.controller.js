import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { generateTokens } from "../utils/jwt.js";

// 🎯 Goal

// Add controller logic that:

// Receives a token from Google (client-side sign-in).

// Verifies it with Google’s servers.

// Finds or creates the corresponding user in MongoDB.

// Issues your own JWT + refresh token for continued access.

// Returns user + tokens to the frontend.

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Sign in or register with Google
// @route   POST /api//v1/auth/google

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; // front-end sends Google credentials token
    if (!credential)
      return res.status(400).json({ message: "No credential provided" });

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const { sub, email, given_name, family_name, picture, email_verified } =
      payload;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create partial record for new Google user
      user = await User.create({
        googleId: sub,
        email,
        firstName: given_name || "New",
        lastName: family_name || "User",
        avatar: picture,
        emailVerified: email_verified,
        authProvider: "google",
        isProfileComplete: false,
      });
    }
    // Generate your own tokens
    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      "google"
    );

    // Send response
    res.status(200).json({
      message: user.isProfileComplete
        ? "Login successful"
        : "Account created, Please complete your profile",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Google Auth error:", err.message);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

// @desc Complete profile for Google-registered users
// @route PUT /api/v1/auth/complete-profile/:id

export const completeGoogleProfile = async (req, res) => {
  try {
    // use userID token, not params
    // const userId = req.params.id;

    const userId = req.user?._id || req.user?.id;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    const {
      phone,
      businessName,
      businessType,
      agreeToTerms,
      subscribeToNewsletter,
    } = req.body;

    const user = await User.fineByID(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // // Update fields for profile completion
    user.phone = phone || user.phone;
    user.businessName = businessName || user.businessName;
    user.businessType = businessType || user.businessType;
    user.agreeToTerms = agreeToTerms;
    user.subscribeToNewsletter = subscribeToNewsletter;
    user.isActive = true;
    user.isProfileComplete = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      user,
    });
  } catch (error) {
    console.error("Profile completion error:", error.message);
    res.status(500).json({ message: "Failed to complete profile." });
  }
};
