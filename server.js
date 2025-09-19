import http from "http";
import app from "./app/app.js"

const PORT = process.env.PORT || 5680;

const server = http.createServer(app);
server.listen(PORT, ()=> {console.log(`Server is up and running on port ${PORT}`);});