import Provider from "../models/Provider.js";
import { DateTime } from "luxon";
import Bookings from "../models/bookings.js";

const clinic_zone = "Asia/Karachi";

//checks doctor's details through their id
async function getProvider(providerId) {
  try {
    let doctorById = await Provider.findOne({ providerId });
    if (!doctorById) {
      return null;
    }
    return doctorById;
  } catch (e) {
    console.log(`Error:${e.message}`);
    throw e;
  }
}

//checks whether this doctor is available on given date, booking slots etc
async function getFreeSlots(providerId, date) {
  //get the doctor
  let doctor = await getProvider(providerId);
  if (!doctor) {
    return [];
  }

  //check if the date is available
  const clinicDate = DateTime.fromISO(date, { zone: clinic_zone });
  if (!clinicDate.isValid) {
    return [];
  }

  //find the weekday
  const dayNumber = String(clinicDate.weekday % 7);

  //check the working hours
  const hoursToday = doctor.workingHours.get(dayNumber);

  if (!hoursToday) {
    return [];
  }

  //starting time
  let splitStartHour = hoursToday.start.split(":");
  let startHour = Number(splitStartHour[0]);
  let startMin = Number(splitStartHour[1]);

  //ending time
  let splitEndHour = hoursToday.end.split(":");
  let endHour = Number(splitEndHour[0]);
  let endMin = Number(splitEndHour[1]);

  //merging the Shifts
  //start Of Shift
  const startingHours = clinicDate.set({ hour: startHour, minute: startMin });

  //end of Shift
  const endingHours = clinicDate.set({ hour: endHour, minute: endMin });

  //build slots
  const slots = [];
  let current = startingHours;

  while (current.plus({ minutes: doctor.slotDurationMinutes }) <= endingHours) {
    slots.push(current);
    current = current.plus({ minutes: doctor.slotDurationMinutes });
  }

  //remove booked slots from the list
  let startOfDay = clinicDate.startOf("day");
  let endOfDay = clinicDate.endOf("day");

  const results = await Bookings.find({
    providerId: providerId,
    status: "confirmed",
    startTime: { $gte: startOfDay.toJSDate(), $lte: endOfDay.toJSDate() },
  });

  const timeInMilliseconds = results.map((r) => r.startTime.getTime());

  const freeSlots = slots.filter(
    (slot) => !timeInMilliseconds.includes(slot.toMillis()),
  );

  //remove already passed slots for the day
  let dateNow = DateTime.now().setZone(clinic_zone);

  const upcomingSlots = freeSlots.filter((slot) => slot > dateNow);

  return upcomingSlots;
}

//creates Bookings in available slots
async function createBooking(
  providerId,
  patientName,
  patientPhoneNo,
  startTime,
  reason,
) {
  const doctorAvailable = await getProvider(providerId);
  if (!doctorAvailable) {
    return {
      success: false,
      message: "Doctor not found",
    };
  }

  //checking whether the given time is a real free slot
  const TimeChecker = DateTime.fromISO(startTime, { zone: clinic_zone });
  if (!TimeChecker.isValid) {
    return {
      success: false,
      message: "Invalid Time",
    };
  }

  const requestedDate = TimeChecker.toISODate();

  const availableSlots = await getFreeSlots(providerId, requestedDate);

  //checking if the req time is on the slots
  const freeSlot = availableSlots.some(
    (slot) => slot.toMillis() === TimeChecker.toMillis(),
  );

  if (!freeSlot) {
    return {
      success: false,
      message: "That time is not available",
    };
  }

  //saving the booked document in db
 try{
 const newBooking = await Bookings.create({
    providerId,
    patientName,
    patientPhoneNo,
    startTime: TimeChecker.toJSDate(),
    reason,
  });
  return {
    success: true,
    message : "Booking has been Confirmed!",
    newBooking,
  };
 }catch(e){
 if(e.code === 11000){
   return {
    success: false,
    message : "This slot is taken, please choose another!",
  };
 }
 throw e;
 }
}


//cancel the booking
async function cancelBooking(providerId , startTime , patientPhoneNo) {
 
  //checking the time is valid
  const TimeChecker = DateTime.fromISO(startTime, { zone: clinic_zone });
  if (!TimeChecker.isValid) {
    return {
      success: false,
      message: "Invalid Time",
    };
  }

  let  findTheBooking = await Bookings.findOne({
    providerId , 
    patientPhoneNo,
    status : "confirmed",
    startTime : TimeChecker.toJSDate(),
  });

  console.log(findTheBooking);

  if(!findTheBooking){
    return {
      success : false,
      message  : "No matching booking found!"
    }
  }

findTheBooking.status = "cancelled"
  await findTheBooking.save();
  return {
    success : true,
    message: "Booking has been cancelled"
  }
  
}

//find the doctors by their specialty
async function findProviderBySpecialty(specialty) {
 const findTheDoctors = await Provider.find({
  specialty : specialty.toLowerCase(),
 });

const doctorsDetails = findTheDoctors.map((doctor)=> ({providerId : doctor.providerId , name : doctor.name , specialty : doctor.specialty}))

return doctorsDetails;
}

//creating calenderLink
const createCalendarLink=(doctorName, startTime, slotDurationMinutes, reason)=> {
    const start = DateTime.fromISO(startTime, { zone: clinic_zone });
    const end = start.plus({minutes : slotDurationMinutes});

    const startFormat = start.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
    const endFormat = end.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");

    const text = encodeURIComponent("Appointment with " + doctorName);
    const dates = `${startFormat}/${endFormat}`;
    const details = encodeURIComponent(reason || "Clinic appointment");

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
    return calendarUrl; 

}

export { getProvider, getFreeSlots, createBooking ,cancelBooking , findProviderBySpecialty, createCalendarLink };
