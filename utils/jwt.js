import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";

// Access Token
export const generateAccessToken = (userId, provider = "local") => {
  return jwt.sign({ id: userId, provider }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  }); //This way, you can access req.user.provider after decoding.
};

//  Refresh Token

export const createRefreshToken = async (userId) => {
  // Generate raw token
  const refreshToken = crypto.randomBytes(64).toString("hex");

  // Hash before saving
  const hashed = crypto.createHash("sha256").update(refreshToken).digest("hex");

  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; //30 days

  // Save hashed refresh token in DB
  await RefreshToken.create({ token: hashed, user: userId, expiresAt });

  return refreshToken; // send plain token to cookie
};

// Unified generator (Access + Refresh)
export const generateTokens = async (userId, provider = "local") => {
  const accessToken = generateAccessToken(userId, provider);
  const refreshToken = await createRefreshToken(userId);
  return { accessToken, refreshToken };
};

// Verify helper
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};
