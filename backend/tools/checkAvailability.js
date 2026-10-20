import { getFreeSlots } from "../services/bookingService.js";
import { DateTime } from "luxon";

async function checkAvailabilityTool({providerId, date}) {

  const clinicDate = DateTime.fromISO(date, { zone: "Asia/Karachi" });
  const dateLabel = clinicDate.toFormat("cccc, d LLLL yyyy");

  if(!clinicDate.isValid){
    return {
      success : false,
      message : "Invalid Date"
    }
  }
  const doctorAvailability = await getFreeSlots(providerId, date);

  const doctorsSlotsArray = doctorAvailability.map((slots) =>
    slots.toFormat("HH:mm"),
  );

  return {
    date,
    dateLabel,
    slots: doctorsSlotsArray,
  };
}


export const checkAvailabilityDeclaration = {
  name: "checkAvailabilityTool",
description:
  "Get available time slots for a specific healthcare provider on a given date. Use it only after you know the doctor's providerId, usually from the find-doctors result. " +
  "An empty list means no free times that day, so suggest another date. " +
  "The result includes dateLabel, the correct weekday and date to show the patient.",
  
  parametersJsonSchema: {
    type: "object",
    properties: {
      providerId: {
        type: "string",
        description: "The unique identifier of the provider or doctor. It looks like prov_001 and comes from the find-doctors result. It is not the doctor’s name."
      },
      date: {
        type: "string",
        description: "The date to check, in the clinic’s local time, exactly in the format YYYY-MM-DD."
      }
    },
    required: ["providerId", "date"]
  }
};

export default checkAvailabilityTool;
