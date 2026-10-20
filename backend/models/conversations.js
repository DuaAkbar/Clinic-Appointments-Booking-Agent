import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [
      {
        role: {
          type: String,
          required: true,
          enum: ["user", "model"],
        },
        parts: {
          type: [mongoose.Schema.Types.Mixed],
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Conversation", ConversationSchema);
