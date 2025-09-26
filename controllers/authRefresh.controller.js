import AsyncHandler from "express-async-handler";
import crypto from "crypto";
import RefreshToken from "../models/refreshToken.model.js";
import { generateAccessToken, createRefreshToken } from "../utils/jwt.js";

export const refreshTokenCtrl = AsyncHandler(async (req, res) => {

  console.log("Incoming cookies (refresh):", req.cookies);

  const rawToken = req.cookies?.refreshToken;

  if (!rawToken) {
    return res.status(401).json({ message: "No refresh token in cookies" });
  }

  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

  const stored = await RefreshToken.findOne({
    token: hashed,
    expiresAt: { $gt: Date.now() },
    revoked: false,
  });

  if (!stored) {
    return res
      .status(401)
      .json({ message: "Invalid or expired refresh token" });
  }

  // Rotate: delete old one and create new one
  await RefreshToken.deleteOne({ _id: stored._id });
  const newRefreshToken = await createRefreshToken(stored.user);
  const accessToken = generateAccessToken(stored.user);

  // Debug what we're setting 
  console.log("Setting new cookies (refresh + jwt)");
  
  //   Set new cookies
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  res.json({ status:"success ✅", accessToken })
});

