import express from "express";
import { chatWithAgentControlller, getChatMessages } from "../controllers/chatController.js";

const chatRouter = express.Router();
chatRouter.post("/create", chatWithAgentControlller);
chatRouter.get("/:sessionId", getChatMessages);

export default chatRouter;