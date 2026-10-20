import { createBooking, getProvider, createCalendarLink } from "../services/bookingService.js";

async function bookAppointmentTool({
  providerId,
  patientName,
  patientPhoneNo,
  startTime,
  reason,
}) {
  const getPatientDetails = await createBooking(
    providerId,
    patientName,
    patientPhoneNo,
    startTime,
    reason,
  );

  if (getPatientDetails.success) {
    const doctor = await getProvider(providerId);
    let calendarLink = null;
    if(doctor){
      calendarLink = createCalendarLink(doctor.name , startTime, doctor.slotDurationMinutes, reason);
    }
    return {
      success: true,
      message: getPatientDetails.message,
      calendarLink,
      booking: {
        providerId,
        patientName,
        startTime,
      },
    };
  } else {
    return {
      success: false,
      message: getPatientDetails.message,
    };
  }
}

export const bookAppointmentDeclaration = {
  name: "bookAppointmentTool",
  description:
    "Books a new appointment for a patient with a specific doctor. Use it only after the patient has chosen a doctor and a free time, and you have their name, phone number and reason for the visit. If any of these details is missing, ask the patient for it first and do not guess. Read success in the result: if it is false, tell the patient the message and do not say the booking worked.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      providerId: {
        type: "string",
        description:
          "The unique ID of the doctor, for example prov_001. It comes from the find-doctors result.",
      },
      patientName: {
        type: "string",
        description: "The full name of the patient.",
      },
      patientPhoneNo: {
        type: "string",
        description: "The phone number of the patient.",
      },
      startTime: {
        type: "string",
        description:
          "The start time of the appointment as an ISO date-time with the clinic offset, in the exact format 2026-10-15T11:00:00+05:00. It must be one of the free slots returned by the check-availability tool: combine that slot's date and its 'HH:mm' time, and always end with +05:00.",
      },
      reason: {
        type: "string",
        description: "A short reason for the visit, such as a checkup or the patient's main symptom.",
      },
    },
    required: [
      "providerId",
      "patientName",
      "patientPhoneNo",
      "startTime",
      "reason",
    ],
  },
};

export default bookAppointmentTool;
