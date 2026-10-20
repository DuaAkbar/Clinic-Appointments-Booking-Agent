# 🩺 Clinic Appointment Agent

A chat-based AI agent that helps patients find the right doctor, check availability, book and cancel appointments, and add the booking to their calendar. Built from scratch with **Node.js and the Gemini API**, with no agent framework.

> **Status:** first AI agent project / working prototype.

## 🎥 Demo

**[Watch the full demo video on LinkedIn](https://lnkd.in/p/dSRHjgSQ)**: finding a doctor, checking availability, booking, adding the event to Google Calendar, and cancelling.

## ✨ What it does

- **Finds a doctor** by specialty, routing the patient's problem to a doctor type (never a diagnosis)
- **Checks availability** for a given date, using each doctor's working hours and existing bookings
- **Books appointments** only after the patient confirms the details
- **Cancels appointments** only after the patient confirms
- **Creates an "Add to Calendar" link** (Google Calendar) after every successful booking
- **Handles emergencies first**: symptoms like severe chest pain get emergency advice, not a booking
- **Never invents information**: if no doctor matches, it says so honestly
- **Remembers the conversation** per session, and restores it after a page refresh

## 🧠 How the agent works

The core is a tool-calling loop written by hand:

1. The patient's message is saved and the full history is loaded from MongoDB.
2. The history, the system prompt (with today's date in `Asia/Karachi`), and the list of tools are sent to Gemini.
3. Gemini either answers in text or asks to use a tool.
4. The backend runs the requested tool, sends the result back, and Gemini decides the next step.
5. This repeats (maximum 6 rounds) until Gemini answers in text.
6. Everything is saved, and the reply goes back to the chat UI.

```
Patient message
      │
      ▼
 Save + load history ──► Gemini ──► text? ──► reply to patient
                           ▲   │
                           │   └─► tool request
                           │            │
                           └── result ◄─┘  (run tool, send result back)
```

### Tools

| Tool | Purpose |
|------|---------|
| `findDoctorBySpecialtyTool` | Finds doctors for a specialty |
| `checkAvailabilityTool` | Returns free slots for a doctor on a date |
| `bookAppointmentTool` | Books a slot and returns a calendar link |
| `cancelAppointmentTool` | Cancels a confirmed booking |

### Reliability

- Automatic **retry with waiting** when Gemini returns 503 or 429
- Each tool call is wrapped in `try/catch`, so one failing tool never freezes the chat
- A friendly fallback message if the model returns empty text
- A round limit so the loop can never run forever
- The calendar link is **built in code**, not written by the model, so dates are always correct

## 🛠 Tech stack

| Layer | Tools |
|-------|-------|
| Backend | Node.js, Express, MongoDB Atlas (Mongoose), `@google/genai`, Luxon |
| Frontend | React (Vite), Tailwind CSS, axios, react-markdown |
| AI | Gemini API (function calling) |

## 📁 Project structure

```
BookingAgent/
├── backend/
│   ├── controllers/     chat controller
│   ├── models/          Booking, Provider, Conversation
│   ├── prompts/         system prompt
│   ├── routes/          chat routes
│   ├── services/        agent loop, bookings, conversations
│   ├── tools/           the four agent tools
│   └── server.js
└── frontend/
    └── src/             ChatBox, ChatBubble, TypingIndicator
```

## 🚀 Run it locally

### 1. Clone

```bash
git clone https://github.com/DuaAkbar/Clinic-Appointments-Booking-Agent.git
cd https://github.com/DuaAkbar/Clinic-Appointments-Booking-Agent.git
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```
GEMINI_API_KEY=your_gemini_api_key
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Add some doctors to the `providers` collection (see the example below), then:

```bash
npm start      # or: node server.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Example provider document

```json
{
  "providerId": "prov_001",
  "name": "Dr. Example Name",
  "specialty": "dermatologist",
  "slotDurationMinutes": 30,
  "workingHours": {
    "3": { "start": "16:00", "end": "21:00" },
    "6": { "start": "12:00", "end": "17:00" }
  }
}
```

`workingHours` keys are weekday numbers: `0` = Sunday, `1` = Monday ... `6` = Saturday.
Supported specialties: `orthopedic`, `gynecologist`, `general physician`, `dentist`, `dermatologist`, `cardiologist`, `therapist`, `pediatrician`.

## 🔌 API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/chat/create` | Send `{ sessionId, message }`. Leave `sessionId` empty for a new chat. Returns `{ success, sessionId, response }`. |
| `GET` | `/api/v1/chat/:sessionId` | Returns the saved chat messages for a session. |

## 🔮 What I'd improve next

This is a prototype, not production-ready. Next steps I would take:

- **Security and privacy:** user login, protection of patient data, input validation
- **Abuse protection:** rate limiting and session limits
- **Real clinic needs:** rescheduling, reminders (WhatsApp/SMS), waitlists, a staff view of bookings
- **Quality:** automated tests, structured logging, deployment
- **Convenience:** the search tool returning each doctor's working days

## 📚 What I learned

- How a tool-calling agent loop really works, before using any framework
- Designing tool declarations so the model sends exact values
- Prompt design for safety: emergencies, no invented data, confirmation before actions
- Handling real-world API failures (overload, rate limits) gracefully

---

Built by **Dua Akbar**: [LinkedIn](https://lnkd.in/p/dSRHjgSQ) · [GitHub](https://github.com/DuaAkbar/Clinic-Appointments-Booking-Agent.git)
