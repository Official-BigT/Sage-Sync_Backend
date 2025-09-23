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
const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS request from:", origin);
    const allowedOrigins = [
      "http://localhost:3000", // React dev server
      "http://localhost:5173", // Vite dev server
      "http://localhost:8080", // Vite preview
      process.env.FRONTEND_URL, // Production frontend URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed fro this origin:" + origin));
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
