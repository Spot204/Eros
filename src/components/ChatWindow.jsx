import React, { useState, useEffect, useRef } from "react";

function ChatWindow({
  messages,
  currentUserId,
  currentMatchId,
  opponentName,
  typingUserId,
  sendMessage,
  sendTyping,
  addOptimisticMessage
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gửi typing khi gõ
  useEffect(() => {
    sendTyping(currentMatchId, input.length > 0);
  }, [input, currentMatchId, sendTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    addOptimisticMessage(input.trim());
    sendMessage( input.trim(), null);
    setInput("");
  };

  return (
    <div className="flex w-full flex-col h-full  bg-white">
      {/* Header */}
      <div className="p-4 border-b font-bold text-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-r from-pink-500 to-violet-500"></div>
        <div>{opponentName}</div>
        {typingUserId && (
          <span className="text-sm text-green-600 ml-auto">đang nhập...</span>
        )}
      </div>

      {/* Tin nhắn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from_user_id != currentUserId ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.from_user_id != currentUserId
                  ? "bg-gray-200 text-black"
                  : "bg-blue-500 text-white"
              }`}
            >
              {msg.content || "[ảnh]"}
              {msg.read_at && msg.partner_id != currentUserId && (
                <span className="block text-xs opacity-70 mt-1 text-right">đã xem</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 px-5 mx-10 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Aa..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export { ChatWindow };