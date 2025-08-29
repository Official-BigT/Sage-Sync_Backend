import dotenv from "dotenv";
dotenv.config()
import express from "express";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import dbConnect from "../config/dbConnect.js";
import authRoutes from "../routes/auth.routes.js";


// * Database Connection.
dbConnect();


const app = express();
// parse incoming datas, meaning the datas coming in the {req}, will be converted as json.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use("/api/v1/auth", authRoutes);


// * Err Middleware
app.use(notFound);
app.use(globalErrHandler);

export default app;