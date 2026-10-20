import mongoose from "mongoose";

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const providerSchema = new mongoose.Schema({
  providerId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  slotDurationMinutes: {
    type: Number,
    default: 30,
  },
  workingHours: {
    type: Map,
    of: new mongoose.Schema(
      {
        start: {
          type: String,
          required: true,
          match:[
            timeRegex,
            "Start time must be in 24 hours format",
          ]
        },
        end: {
          type: String,
          required: true,
          match:[
            timeRegex,
            "End time must be in 24 hours format",
          ]
        },
      },
      { _id: false },
    ),
  },
});

const Provider = mongoose.model("Provider", providerSchema);
export default Provider;
