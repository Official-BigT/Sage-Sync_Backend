import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import dbConnect from "../config/dbConnect.js";
import authRoutes from "../routes/auth.routes.js";

// * Database Connection.
dbConnect();

const app = express();
// CORS configuration (CRITICAL FOR FRONTEND)
// Log incoming requests (very useful for render logs)
app.use((req, res, next) => {
  console.log(
    `[REQ] ${req.method} ${req.originalUrl} - Origin: ${
      req.headers.origin
    } - Host:${req.headers.host} - UA: ${req.headers["user-agent"]?.slice(
      0,
      80
    )}`
  );
  next();
});
const allowedOrigins = [
  "http://localhost:3000", // React dev server
  "http://localhost:5173", // Vite dev server
  "http://localhost:8080", // Vite preview
  "https://sage-sync.vercel.app", // Site preview
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Note: origin may be undefined for server-to-server calls, or curl, or same-origin requests
    console.log("CORS request from:", origin);
    // allow if no origin (non-browser request), or if origin is in whitelist

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // do NOT call callback with an error -  just reject  by returning false
      // callback(null, false);
      callback(new Error("CORS not allowed for this origin:" + origin));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// parse incoming datas, meaning the datas coming in the {req}, will be converted as json.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use("/api/v1/auth", authRoutes);

// * Err Middleware
app.use(notFound);
app.use(globalErrHandler);

export default app;
