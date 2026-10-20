import ReactMarkdown from "react-markdown"

const ChatBubble = ({ role, text }) => {
    const style = role === "user" ? "self-end bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-br-sm" : "self-start bg-purple-100 text-violet-950 rounded-bl-sm"
    return (
        <div className={`max-w-[75%] break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${style}`}>
            <ReactMarkdown
                components={{
                    a: ({ node, ...props }) => (
                        <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline break-all"
                        />
                    ),
                    ul: ({ node, ...props }) => <ul className="list-disc pl-5" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-5" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}
export default ChatBubble;
