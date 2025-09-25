import AsyncHandler from "express-async-handler";
import path from "path";
import ejs from "ejs";
import User from "../models/user.model.js";
import emailManager from "../utils/emailManager.js";
import { hashPassword } from "../utils/helpers.js";
import { createRefreshToken, generateAccessToken } from "../utils/jwt.js";

// ===============================
// REGISTER USER
// ===============================
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUserCtrl = AsyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    businessName,
    businessType,
    password,
    agreeToTerms,
    subscribeToNewsletter,
  } = req.body;

  // 1. Check if user already exists
  const userFound = await User.findOne({ email: email.toLowerCase() });
  if (userFound) {
    throw new Error("A user with this email already exists.");
  }

  // 2. Create a verification token (needed for the email template)
  // We create a temporary user object to generate the token, but don't save it yet.
  const tempUser = new User({ email });
  const verificationToken = tempUser.createVerificationToken();

  console.log("RAW VERIFICATION TOKEN (send this in URL:", verificationToken);

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  // 3. Create user object with hashed password but DO NOT SAVE YET
  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    businessName,
    businessType,
    password,
    agreeToTerms,
    subscribeToNewsletter,
    // Add the generated token fields to the user object
    verificationToken: tempUser.verificationToken,
    verificationTokenExpires: tempUser.verificationTokenExpires,
  });

  try {
    // 4. Render the email template
    const emailTemplate = await ejs.renderFile(
      path.join(process.cwd(), "template", "welcomeEmail.ejs"),
      {
        name: `${user.firstName} ${user.lastName}`,
        verificationUrl: verificationUrl,
      }
    );
    await emailManager(
      user.email,
      "Verify Your Email Address for Your New Account",
      emailTemplate
    );

    await user.save();

    // 7. Respond to the client
    res.status(201).json({
      status: "success ✅",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          businessName: user.businessName,
        },
      },
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    // This catch block handles errors from email rendering, sending, or saving.
    console.error("Registration Process Error:", error);

    // If we get here, the user has NOT been saved, which is the intended behavior.
    res.status(500).json({
      status: "error ❌",
      message: "Failed to complete registration. Please try again later.",
      // Avoid sending full error details in production
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// ===============================
// LOGIN USER
// ===============================
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const loginUserCtrl = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user and check for password
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.correctPassword(password))) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  // 2. Check password
  const isMatch = await user.correctPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      status: "error ❌",
      message: "Invalid email or password",
    });
  }

  // 3. Check if email is verified
  if (!user.emailVerified) {
    return res.status(403).json({
      message: "Please verify your email first before logging in.",
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshTokenPlain = await createRefreshToken(user._id);
  // 4. Set httpOnly cookies
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 1 * 60 * 60 * 1000, //1 hour
  });
  res.cookie("refreshToken", refreshTokenPlain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // 5. Respond with JWT
  res.json({
    status: "success ✅",
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      businessName: user.businessName,
    },
  });
});
