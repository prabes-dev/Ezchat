import { useState, useRef, useEffect } from "react";
import { Send, Menu, Copy } from "lucide-react";

export const Chat = ({
  username,
  messages,
  onNewMessage,
  currentServer,
  onToggleSidebar,
}) => {
  const [message, setMessage] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!onNewMessage) {
      setErrorMessage("Unable to send message: handler not available");
      return;
    }

    if (!currentServer) {
      setErrorMessage("Unable to send message: no server selected");
      return;
    }

    try {
      onNewMessage(message);
      setMessage("");
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      setErrorMessage("Failed to send message. Please try again.");
    }
  };

  const handleCopy = (text, messageId) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setErrorMessage("Failed to copy message.");
      });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Error";
    }
  };

  // Debug: Check if messages array is valid
  const validMessages = Array.isArray(messages) ? messages : [];

  return (
    <div className="flex flex-1 h-screen flex-col bg-gray-900 text-white overflow-hidden">
      {/* Chat Header */}
      <div className="h-[45px] sm:h-[55px] px-3 sm:px-5 bg-gray-900 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <h1 className="text-base sm:text-lg font-semibold truncate">Chat</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-gray-400">
          <span className="text-sm sm:text-base hidden sm:block">
            Server: {currentServer}
          </span>
          <Menu
            className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:text-white transition-colors sm:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-800 flex flex-col gap-3 sm:gap-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
        {/* Debug info */}
        {validMessages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet for server: {currentServer}</p>
            <p className="text-sm mt-2">
              Send a message to start the conversation!
            </p>
          </div>
        )}

        {validMessages.map((msg, index) => {
          // Debug: Log each message
          console.log("Rendering message:", msg);

          // Generate a unique key
          const messageKey =
            msg._id || msg.id || `${msg.timestamp}-${index}` || `msg-${index}`;

          return (
            <div
              key={messageKey}
              className={`relative flex p-1 sm:p-2 rounded group ${
                msg.user === username ? "justify-end" : "justify-start"
              }`}
            >
              {/* Message Bubble */}
              <div
                className={`min-w-[10%]  flex flex-col max-w-[80%] sm:max-w-[70%] rounded-lg px-3 py-2 ${
                  msg.user === username
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-gray-700 text-gray-200 mr-auto"
                }`}
              >
                {/* Message Header (Username & Time) */}
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                  {msg.user !== username && (
                    <span className="font-medium text-sm sm:text-base text-gray-300">
                      {msg.user || "Unknown User"}
                    </span>
                  )}
                  <span
                    className={` text-[10px] sm:text-xs ${
                      msg.user === username ? "text-blue-200" : "text-green-500"
                    }`}
                  >
                    {formatTime(msg.createdAt || msg.timestamp)}
                  </span>
                  <div className=" top-1 right-1 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        handleCopy(msg.text || msg.message, messageKey)
                      }
                      title="Copy message"
                      className={`p-1 rounded-full transition-all hover:bg-black/20 ${
                        copiedMessageId === messageKey
                          ? "text-green-400"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Text */}
                <div className="leading-relaxed break-words text-sm sm:text-base">
                  {msg.text || msg.message || "No message content"}
                </div>

                {/* Message Actions (Copy) */}
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message Area */}
      {errorMessage && (
        <div className="bg-red-900/50 p-2 sm:p-3 text-red-300 text-center text-sm sm:text-base flex-shrink-0">
          {errorMessage}
          <button
            onClick={() => setErrorMessage("")}
            className="ml-2 text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Message Input Form */}
      <form
        className="p-3 sm:p-4 bg-gray-900 flex gap-2 sm:gap-3 items-center border-t border-gray-700 flex-shrink-0"
        onSubmit={handleSubmit}
      >
        <div className="flex-1 bg-gray-700 rounded-lg px-3 sm:px-4">
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${currentServer}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            className="w-full h-10 sm:h-11 bg-transparent border-none outline-none text-gray-100 text-sm sm:text-base placeholder-gray-400"
            aria-label="Chat message input"
          />
        </div>
        <button
          type="submit"
          className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </button>
      </form>
    </div>
  );
};

export default Chat;
