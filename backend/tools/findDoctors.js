import { findProviderBySpecialty } from "../services/bookingService.js";

async function findDoctorBySpecialtyTool({specialty}) {
  const doctorDetails = await findProviderBySpecialty(specialty);
  return {
    doctors: doctorDetails,
  };
}
export const findDoctorBySpecialtyDeclaration= {
  name: "findDoctorBySpecialtyTool",
  description:
    "Finds doctors in the clinic by specialty. Use it once you know which type of doctor the patient needs, either because they named one or because you suggested one from their symptoms.",

  parametersJsonSchema: {
    type: 'object', 
    properties: {
      specialty: {
         type: 'string',
        description:
          "The medical specialty or department name normalized to a standard field " +
          "The specialty to search for, in lowercase, such as cardiologist, dentist, dermatologist, pediatrician or therapist."
      },
    },
    required: ["specialty"],
  },
};

export default findDoctorBySpecialtyTool;
