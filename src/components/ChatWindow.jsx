import React, { useState, useEffect, useRef } from "react";

function ChatWindow({
  messages,
  currentUserId,
  currentMatchId,
  opponentName,
  opponentAvatar, // Ảnh lấy từ bảng photos (is_primary)
  typingUserId,   // ID của người đang gõ (nếu có)
  sendMessage,
  sendTyping,
  addOptimisticMessage
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Thông báo trạng thái "đang nhập" cho đối phương
  useEffect(() => {
    if (sendTyping) {
      sendTyping(input.length > 0);
    }
  }, [input, sendTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    addOptimisticMessage(input.trim());
    sendMessage(input.trim(), null);
    setInput("");
  };

  return (
    <div className="flex w-full flex-col h-full bg-white shadow-xl rounded-lg overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="p-4 border-b font-bold text-lg flex items-center gap-3 bg-white">
        <div className="relative w-12 h-12">
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 shadow-sm flex-shrink-0 bg-gray-200">
            {opponentAvatar ? (
              <img
                src={`http://localhost:8008${opponentAvatar}`}
                alt={opponentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://placehold.co/100x100?text=User";
                }}
              />
            ) : (
              /* Người dùng mới/Không có ảnh: Hiện chữ cái đầu + Màu Gradient */
              <div className="w-full h-full bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center text-white text-lg">
                {opponentName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          {/* Chấm xanh Online (Optional) */}
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-800 leading-tight">{opponentName || "Người dùng"}</span>
          {typingUserId && (
            <span className="text-xs text-green-500 font-medium animate-pulse">
              đang nhập...
            </span>
          )}
        </div>
      </div>

      {/* --- TIN NHẮN --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => {
          const isMe = msg.from_user_id == currentUserId;
          return (
            <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                }`}
              >
                {msg.content || "[ảnh]"}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Ô NHẬP TIN NHẮN --- */}
      <div className="p-4 border-t bg-white flex items-center gap-3">
        <input
          className="flex-1 px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-sm transition-all"
          placeholder="Viết tin nhắn..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { ChatWindow };