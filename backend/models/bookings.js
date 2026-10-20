import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    providerId: {
      type: String,
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhoneNo: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true },
);

bookingSchema.index(
  { providerId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["confirmed"],
      },
    },
  },
);

const Bookings = mongoose.model("Booking", bookingSchema);
export default Bookings;
