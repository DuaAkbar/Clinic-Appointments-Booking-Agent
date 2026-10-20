import { configDotenv } from "dotenv";
import express from 'express';
import ConnectToDb from "./config/db_connection.js";
import chatRouter from "./routes/chatRoutes.js";
import cors from "cors";

const port = process.env.PORT || 4500;
ConnectToDb();

const server = express();
server.use(cors({
  origin: "http://localhost:5173"
}));
server.use(express.json());

server.use('/api/v1/chat', chatRouter);


server.listen(port , ()=>{
    console.log(`The server is running on port: ${port}`);
    
})