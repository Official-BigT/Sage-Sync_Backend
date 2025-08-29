import AsyncHandler from 'express-async-handler'; 
import path from 'path';
import ejs from 'ejs';
import User from '../models/user.model.js';
import emailManager from '../utils/emailManager.js';
import { hashPassword } from '../utils/helpers.js'; 

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
    subscribeToNewsLetter,
  } = req.body;

  // 1. Check if user already exists
  const userFound = await User.findOne({ email: email.toLowerCase() });
  if (userFound) {
    throw new Error('A user with this email already exists.');
  }

  // 2. Create a verification token (needed for the email template)
  // We create a temporary user object to generate the token, but don't save it yet.
  const tempUser = new User({ email }); 
  const verificationToken = tempUser.createVerificationToken();
   const verificationUrl = `${process.env.BACKEND_URL || 'http://localhost:5680'}/api/v1/auth/verify-email?token=${verificationToken}`;

  // 3. Create user object with hashed password but DO NOT SAVE YET
  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    businessName,
    businessType,
    password: await hashPassword(password), // Hash manually before saving
    agreeToTerms,
    subscribeToNewsLetter,
    // Add the generated token fields to the user object
    verificationToken: tempUser.verificationToken,
    verificationTokenExpires: tempUser.verificationTokenExpires,
  });

  try {
    // 4. Render the email template
    const emailTemplate = await ejs.renderFile(
      path.join(process.cwd(), 'template', 'welcomeEmail.ejs'),
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
      status: 'success ✅',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          businessName: user.businessName,
        },
      },
      message: 'User registered successfully. Please check your email to verify your account.',
    });

  } catch (error) {
    // This catch block handles errors from email rendering, sending, or saving.
    console.error('Registration Process Error:', error);

    // If we get here, the user has NOT been saved, which is the intended behavior.
    res.status(500).json({
      status: 'error ❌',
      message: 'Failed to complete registration. Please try again later.',
      // Avoid sending full error details in production
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});