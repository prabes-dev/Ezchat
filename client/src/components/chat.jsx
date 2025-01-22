
import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, Menu, Copy, Pin } from 'lucide-react';

export const Chat = ({ username, messages, onNewMessage, currentServer, currentGroup, onPinMessage,isSidebarOpen,onToggleSidebar }) => {
  const [message, setMessage] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus the input field when typing starts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return; // Prevent submitting empty messages

    try {
      onNewMessage(message);
      setMessage('');
      setErrorMessage(''); // Clear any previous error
    } catch (error) {
      setErrorMessage('Failed to send message');
    }
  };

  const handleCopy = (text, messageId) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 1000);
    });
  };

  const handlePin = (messageId) => {
    try {
      onPinMessage(messageId);
    } catch (error) {
      setErrorMessage('Failed to pin/unpin message');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-1 h-screen  bg-gray-900 flex-col w-full sm:w-4/5">
    <div className="h-[45px] sm:h-[55px] px-3 sm:px-5 bg-gray-900 border-b border-[#202225] flex items-center justify-between text-white">
      <div className="flex items-center gap-1 sm:gap-2">
        <Hash className="w-5 h-5 sm:w-6 sm:h-6 text-[#72767d]" />
        <h1 className="text-base sm:text-lg font-semibold truncate max-w-[120px] sm:max-w-none">{currentGroup}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 text-[#72767d]">
        <span className="text-sm sm:text-base cursor-pointer"  onClick={onToggleSidebar} >{currentServer}</span>       
        <Menu 
            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-white transition-colors sm:hidden" 
            onClick={onToggleSidebar}
        />
      </div>
    </div>
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-gray-900 flex flex-col gap-3 sm:gap-4 [&::-webkit-scrollbar]:w-2
     [&::-webkit-scrollbar-track]:bg-[#2f3136] [&::-webkit-scrollbar-thumb]:bg-[#202225]
     [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#18191c]">
      {messages.map((msg) => (
        <div 
          key={msg._id}                         
          className={`relative bg-gray-900 flex m-[2px] p-1 sm:p-2 rounded group ${
            msg.isPinned ? 'border-l-2 border-[#32e0e6] hover:bg-[#25878b]' : ''       
          } ${msg.user === username ? 'justify-end' : ''}`}
        >
          <div className={`flex-1 bg-gray-800 rounded p-2 text-[#dcddde] ${
            msg.user === username ? 'p-2 rounded-lg bg-gray-800 max-w-[95%] sm:max-w-[80%]' : ''
          }`}>
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="font-medium text-white text-sm sm:text-base">{msg.user}</span>
              <span className="text-[10px] sm:text-xs text-[#4caf50]">{formatTime(msg.createdAt)}</span>
            </div>
            <div className="leading-relaxed break-words text-sm sm:text-base">{msg.text}</div>
            <div className="flex gap-1 sm:gap-2 absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Copy 
                className={`w-3 h-3 sm:w-4 sm:h-4 text-[#72767d] cursor-pointer transition-all hover:text-white hover:scale-110 ${
                  copiedMessageId === msg._id ? 'text-[#4caf50] animate-scale' : ''
                }`}
                onClick={() => handleCopy(msg.text, msg._id)}
                title="Copy message"
              />
              <Pin 
                className={`w-3 h-3 sm:w-4 sm:h-4 text-[#72767d] cursor-pointer transition-all hover:text-white hover:scale-110 ${
                  msg.isPinned ? 'text-[#4b8bfa] rotate-45' : ''
                }`}
                onClick={() => onPinMessage(msg._id)}
                title={msg.isPinned ? 'Unpin message' : 'Pin message'}
              />
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {errorMessage && <div className="bg-red-500/10 p-3 sm:p-4 text-red-400 text-center text-sm sm:text-base">{errorMessage}</div>}

    <form className="p-3 sm:p-5 bg-gray-900 flex gap-2 sm:gap-4 items-center" onSubmit={handleSubmit}>
      <div className="flex-1 bg-gray-800 rounded-lg px-3 sm:px-4">
        <input
          ref={inputRef}
          type="text"
          placeholder={`Message #${currentGroup}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={10000}
          className="w-full h-10 sm:h-11 bg-transparent border-none outline-none text-[#dcddde] text-sm sm:text-base placeholder-[#72767d]"
        />
      </div>
      <button type="submit" className="w-10 h-10 sm:w-11 sm:h-11 bg-[#5865f2] hover:bg-[#4752c4] rounded-lg flex items-center justify-center cursor-pointer transition-colors">
        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </button>
    </form>
  </div>
  );
};

export default Chat;