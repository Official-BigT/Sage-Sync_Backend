// verify Google token and retrieve JWT

import jwt from "jsonwebtoken";
import AsyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const verifyOAuthUser = AsyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith("Bearer") &&
    req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "OAuth route requires token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.authProvider === "local") {
      return res.status(403).json({ message: "Not an OAuth user" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("OAuth token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});
