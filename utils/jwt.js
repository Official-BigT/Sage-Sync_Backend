import jwt from "jsonwebtoken";
import crypto from "crypto";
import  RefreshToken  from "../models/refreshToken.model.js";

// Access Token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
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


