const TypingIndicator = () => {
  return (
    <div className="flex max-w-[75%] items-center gap-1.5 self-start rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 shadow-sm">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-bounce rounded-full bg-violet-400"
          style={{ animationDelay: `${delay}ms` }}
        ></span>
      ))}
    </div>
  );
};

export default TypingIndicator;