import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protect = AsyncHandler(async (req, res, next) => {

  // Debug: log cookies + headers
  console.log("Incoming cookies:", req.cookies);
  console.log("Incoming auth header:", req.headers.authorization);

  let token =
    req.headers.authorization?.startsWith("Bearer") &&
    req.headers.authorization.split(" ")[1];

    // If nno Bearer token, check cookie

  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
    console.log("Using cookie jwt token");
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    if (user.changePasswordAfter && user.changePasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: "Password changed, login again" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log("JWT verification failed:", err.message);
    return res. status(401).json({message: "Not authorized, token failed"})
  }
});

