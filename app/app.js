import dotenv from "dotenv"
dotenv.config()
import express from "express"


const app = express();
app.use(express.json());


export default app;