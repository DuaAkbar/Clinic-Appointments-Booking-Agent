import conversations from "../models/conversations.js";
import { askGemini } from "../services/LLm_Service.js";

export const chatWithAgentControlller = async (req, res) => {
  const { sessionId, message } = req.body;
  try {
    if (!message) {
      res.status(400).json({
        success : false,
        message: "Message is required",
      });
      return;
    }
   const {sessionId:newSessionId , response : reply }= await askGemini(sessionId, message);
    res.status(200).json({
      sessionId: newSessionId,
      success: true,
      response: reply,
    });
  } catch (e) {
    console.log("Chat error:", e.message);
   if(e.message.includes("You exceeded your current quota")){
    res.status(429).json({
        success:false,
        message: "The AI service is temporarily busy, please try again in a bit",
      });
   }else if (e.status === 503){
    console.log("Chat error:", e.message);
    res.status(503).json({
        success:false,
        message: "The AI service is temporarily busy, please try again in a bit",
    })
   }else{
    console.log("Chat error:", e.message);
    res.status(500).json({
        success:false,
        message: "Something went wrong",
    })
   }
  }
};

export const getChatMessages = async (req, res)=>{
  let {sessionId} = req.params;
  
  try{
    let chatMsgs = await conversations.findOne({sessionId});
  if(!chatMsgs){
    res.status(404).json({
      success:false,
      message : `No message available on this sessionId ${sessionId}`
    })
  }else{
    const cleanMessage = chatMsgs.messages.map((msg)=>({
      role : msg.role,
      text: msg.parts.map((parts)=> parts.text || "").join(""),
    })).filter((msg)=> msg.text);
     res.status(200).json({
      success:true,
      messages : cleanMessage,
    })
  }
  }catch(e){
    res.status(500).json({
      success:false,
      message : "Something went wrong",
    })
  }
}
