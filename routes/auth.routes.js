import express from 'express';
import { registerUserCtrl } from '../controllers/user.controller.js';
import { verifyEmailCtrl } from '../controllers/verifyEmailCtrl.js';

const router = express.Router();


// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", registerUserCtrl);


// @route   GET /api/v1/auth/verify-email?token=xxxxx
// @desc    Verify user email
// @access  Public
router.get("/verify-email", verifyEmailCtrl);

export default router;