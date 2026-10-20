import { randomUUID } from "crypto";
import conversations from "../models/conversations.js";

export const saveUserMessages = async (sessionId, message) => {
  if (!sessionId) {
    sessionId = randomUUID();
  }
  let conversation = await conversations.findOne({ sessionId });
  if (!conversation) {
    conversation = await conversations.create({
      sessionId,
      messages: [
        {
          role: "user",
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
    });
  } else {
    conversation.messages.push({
      role: "user",
      parts: [{ text: message }],
    });
    await conversation.save();
  }
  const messagesToObject = conversation.toObject();
    const cleanMsgList = messagesToObject.messages.map((msgs) => ({
      role: msgs.role,
      parts: msgs.parts,
    }));
    return {
        sessionId : sessionId,
        conversationMessages : cleanMsgList
    }
};

export const saveMessage = async (sessionId, role, parts) => {
  const conversationWithSessionId = await conversations.findOne({ sessionId });
  if (!conversationWithSessionId) {
    throw new Error(`Conversation with sessionId : ${sessionId} doesn't exist`);
  }
  conversationWithSessionId.messages.push({
    role,
    parts,
  });
  await conversationWithSessionId.save();
  return {
    success: true,
  };
};
