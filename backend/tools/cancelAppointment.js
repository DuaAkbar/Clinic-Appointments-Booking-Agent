import { cancelBooking } from "../services/bookingService.js";

async function cancelAppointmentTool({providerId , startTime, patientPhoneNo}) {
    const checkingPatientDetails = await cancelBooking(providerId , startTime , patientPhoneNo);
   
   if(checkingPatientDetails.success){
    return{
        success :true,
        message : checkingPatientDetails.message,
        cancelledDetails:{
            providerId, 
            startTime,
            patientPhoneNo
        }
    }
   }else {
    return {
      success: false,
      message: checkingPatientDetails.message,
    };
  }    
}

export const cancelAppointmentToolDeclaration = {
  name: 'cancelAppointmentTool',
  description: 'Cancels an appointment for a patient given the provider ID, start time, and patient phone number.',
  parametersJsonSchema: {
    type:'object',
    properties: {
      providerId: {
        type: 'string',
        description: 'The unique identifier of the provider or doctor.'
      },
      startTime: {
        type: 'string',
        description: 'The scheduled start time of the appointment.'
      },
      patientPhoneNo: {
        type: 'string',
        description: 'The phone number of the patient.'
      }
    },
    required: ['providerId', 'startTime', 'patientPhoneNo']
  }
};



export default cancelAppointmentTool
