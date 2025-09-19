import express from 'express';
import { registerUserCtrl } from '../controllers/user.controller.js';
import { loginUserCtrl } from '../controllers/user.controller.js';
import { verifyEmailCtrl } from '../controllers/verifyEmailCtrl.js';
import { protect } from '../middlewares/protect.js';
import { refreshTokenCtrl } from '../controllers/authRefresh.controller.js';

const router = express.Router();


// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUserCtrl);

// @route   POST /api/v1/auth/login
// @desc    Register a new user
// @access  Public
router.post("/login", loginUserCtrl);

router.post("/refresh", refreshTokenCtrl);

router.get("/me", protect, (req, res) => {
  res.json({user: req.user})
});

// @route   GET /api/v1/auth/verify-email?token=xxxxx
// @desc    Verify user email
// @access  Public
router.get("/verify-email", verifyEmailCtrl);

export default router;