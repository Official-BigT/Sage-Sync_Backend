import AsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const protect = AsyncHandler(async (req, res, next) => {
  let token =
    req.headers.authorization?.startsWith("Bearer") &&
    req.headers.authorization.split(" ")[1];

  if (!token && req.cookies?.jwt) {
    token = req.cookies.jwt;
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
    if (user.changePasswordAfter(decoded.iat)) {
      return res.status(401).json({ message: "Password changed, login again" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res. status(401).json({message: "Not authorized, token failed"})
  }
});

