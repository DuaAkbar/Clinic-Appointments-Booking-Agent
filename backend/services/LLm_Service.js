import { GoogleGenAI } from "@google/genai";
import findDoctorBySpecialtyTool from "../tools/findDoctors.js";
import checkAvailabilityTool from "../tools/checkAvailability.js";
import bookAppointmentTool from "../tools/bookAppointment.js";
import cancelAppointmentTool from "../tools/cancelAppointment.js";
import { systemPrompts } from "../prompts/systemPrompts.js";
import { saveMessage, saveUserMessages } from "./conversationService.js";
import dotenv from "dotenv";
dotenv.config();

import { findDoctorBySpecialtyDeclaration } from "../tools/findDoctors.js";
import { checkAvailabilityDeclaration } from "../tools/checkAvailability.js";
import { bookAppointmentDeclaration } from "../tools/bookAppointment.js";
import { cancelAppointmentToolDeclaration } from "../tools/cancelAppointment.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const toolRunner = {
  findDoctorBySpecialtyTool: findDoctorBySpecialtyTool,
  checkAvailabilityTool: checkAvailabilityTool,
  bookAppointmentTool: bookAppointmentTool,
  cancelAppointmentTool: cancelAppointmentTool,
};

const toolsDescriptions = [
  {
    functionDeclarations: [
      findDoctorBySpecialtyDeclaration,
      checkAvailabilityDeclaration,
      bookAppointmentDeclaration,
      cancelAppointmentToolDeclaration,
    ],
  },
];

const model = "gemini-3.1-flash-lite";

export const askGemini = async (sessionId, userMessage) => {
  try {
    const conversationMessagesResult = await saveUserMessages(
      sessionId,
      userMessage,
    );

    let history = conversationMessagesResult.conversationMessages;

    let callGeminiWithRetry = async (history) => {
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (let attempt = 0; attempt <= 3; attempt++) {
        try {
          return await ai.models.generateContent({
            model: model,
            contents: history,
            config: {
              systemInstruction: systemPrompts(),
              tools: toolsDescriptions,
            },
          });
        } catch (e) {
          if ((e.status !== 503 && e.status !== 429) || attempt === 3) throw e;
          console.log("attempt", attempt, "status:", e.status, e.code);
        }
        await wait(16000);
      }
    };
    let response = await callGeminiWithRetry(history);

    await saveMessage(
      conversationMessagesResult.sessionId,
      "model",
      response.candidates[0].content.parts,
    );

    let round = 0;
    while (
      response.functionCalls &&
      response.functionCalls.length > 0 &&
      round < 6
    ) {
      round++;

      const functionResult = [];
      for (const fncall of response.functionCalls) {
        let result;
        try {
          if (!toolRunner[fncall.name]) {
            result = { success: false, message: "Unknown tool" };
          }else{
              result = await toolRunner[fncall.name](fncall.args);
              console.log(fncall.name, fncall.args, result);
          }
        } catch (e) {
          console.log(fncall.name, e.message);
          result = { success: false, message: "The tool failed" };
        }
        functionResult.push({
          functionResponse: { name: fncall.name, response: result },
        });
      }
      await saveMessage(
        conversationMessagesResult.sessionId,
        "user",
        functionResult,
      );

      history.push(response.candidates[0].content);
      history.push({ role: "user", parts: functionResult });

      response = await callGeminiWithRetry(history);

      await saveMessage(
        conversationMessagesResult.sessionId,
        "model",
        response.candidates[0].content.parts,
      );
    }
    let finalText = response.text;
    if (!finalText || !finalText.trim()) {
     finalText = "Sorry, I could not process that. Please try again.";
    }
    return {
      sessionId: conversationMessagesResult.sessionId,
      response: finalText,
    };
  } catch (e) {
    console.log(`Error : ${e.message}`);
    throw e;
  }
};
