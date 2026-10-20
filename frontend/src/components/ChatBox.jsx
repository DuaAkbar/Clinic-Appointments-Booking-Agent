import { useState, useRef, useEffect } from "react";
import ChatBubble from "./ChatBubble";
import axios from "axios";
import TypingIndicator from "./TypingIndicator";

const ChatBox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const bottomRef = useRef(null);

    //handle on sending messages
    const handleOnSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) {
            return;
        }
        let newMessage = {
            role: "user",
            text: input
        };
        setMessages((messages) => [...messages, newMessage]);
        setInput("");

        try {
            setIsLoading(true);
            const response = await axios.post(import.meta.env.VITE_API_URL_POST, { sessionId, message: input });

            if (response.data.success) {
                localStorage.setItem("sessionId", response.data.sessionId);
                setSessionId(response.data.sessionId);
                setMessages((messages) => [
                    ...messages, { role: "model", text: response.data.response }
                ]);
            }
        } catch (e) {
            console.log(e.response?.data?.message);
            setMessages((messages) => [
                ...messages, { role: "model", text: e.response?.data?.message || "Could not reach the server, please try again." }
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    //handle on Message fetch
    const handleOnMsgFetch = async () => {
        try {
            setIsLoading(true);
            const savedSessionId = localStorage.getItem("sessionId");

            if (savedSessionId) {
                const response = await axios.get(`${import.meta.env.VITE_API_URL_GET}${savedSessionId}`);
                setMessages(response.data.messages);
                setSessionId(savedSessionId)
            }
        } catch (e) {
            console.log(e);

        } finally {
            setIsLoading(false);
        }
    }

    //handling on new starting new chat
    const handleNewChat = () => {
        localStorage.removeItem("sessionId");
        setMessages([]);
        setSessionId(null);
        setInput("");
    }

    useEffect(() => {
        handleOnMsgFetch();
    }, [])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-violet-50 to-fuchsia-100 p-4 font-['Poppins']">
            <div className="flex h-[85vh] max-h-[780px] w-full max-w-[480px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(124,58,237,0.18)]">
                {/* Header */}
                <header className="flex items-center gap-3 bg-gradient-to-br from-violet-500 to-violet-700 px-5 py-4 text-white">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-2xl">
                        🩺
                    </div>
                    <div>
                        <h1 className="text-[17px] font-semibold">Clinic Assistant</h1>
                        <span className="flex items-center gap-1.5 text-xs opacity-90">
                            <i className="h-2 w-2 rounded-full bg-green-400"></i> Online
                        </span>

                    </div>
                    <button
                        onClick={handleNewChat}
                        className="ml-auto rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-white/30 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        + New chat
                    </button>
                </header>

                {/* Messages */}
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden bg-violet-50/60 p-5">

                    {
                        messages.map((msgs, index) => (
                            <ChatBubble key={index} role={msgs.role} text={msgs.text} />
                        ))
                    }
                    {isLoading && <TypingIndicator />}
                    <div ref={bottomRef} />
                </div>


                {/* Input bar */}
                <form
                    onSubmit={(e) => handleOnSend(e)}>
                    <div className="flex items-center gap-2.5 border-t border-violet-100 bg-white px-4 py-3.5">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 rounded-full border-2 border-transparent bg-violet-50 px-[18px] py-3 text-[15px] text-violet-950 outline-none transition focus:border-violet-500 focus:bg-white"
                        />
                        <button
                            type="submit"
                            aria-label="Send"
                            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-700 transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(109,40,217,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M5 12h14M13 6l6 6-6 6"
                                    stroke="white"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
};

export default ChatBox;