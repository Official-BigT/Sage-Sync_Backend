import AsyncHandler from 'express-async-handler';
import crypto from 'crypto';
import User from '../models/user.model.js';

export const verifyEmailCtrl = AsyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      status: 'error ❌',
      message: 'Verification token is required',
    });
  }

  // Hash the token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      status: 'error ❌',
      message: 'Invalid or expired verification token',
    });
  }

  user.emailVerified = true;
  user.isActive = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success ✅',
    message: 'Email verified successfully! You can now log in.',
  });
});
