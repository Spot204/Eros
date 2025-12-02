import React, { useEffect, useState } from "react";
import io from "socket.io-client";
function ChatWindow({ currentUserId, currentMatchId, opponentName, socket: propSocket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState("");

  // Dùng socket từ parent hoặc tạo mới (tùy cách bạn truyền)
  const socket = propSocket || io("http://localhost:8005");

  useEffect(() => {
    socket.emit("join_match", currentMatchId);
    socket.emit("get_messages", currentMatchId);

    const handlers = {
      previous_messages: (msgs) => {
        setMessages(msgs.map(m => ({
          text: m.content || "[ảnh]",
          type: m.from_user_id === currentUserId ? "sent" : "received",
          name: m.from_user_id === currentUserId ? "Bạn" : opponentName
        })));
      },
      new_message: (msg) => {
        if (msg.match_id === currentMatchId) {
          setMessages(prev => [...prev, {
            text: msg.content || "[ảnh]",
            type: msg.from_user_id === currentUserId ? "sent" : "received",
            name: msg.from_user_id === currentUserId ? "Bạn" : opponentName
          }]);
        }
      },
      user_typing: ({ userId, isTyping }) => {
        if (userId !== currentUserId) {
          setTyping(isTyping ? `${opponentName} đang nhập...` : "");
        }
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach(event => socket.off(event, handlers[event]));
      socket.emit("leave_match", currentMatchId);
    };
  }, [currentMatchId, currentUserId, opponentName, socket]);

  // Gửi typing
  useEffect(() => {
    socket.emit("typing", {
      matchId: currentMatchId,
      isTyping: input.length > 0
    });
  }, [input, socket, currentMatchId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      matchId: currentMatchId,
      fromUserId: currentUserId,
      content: input.trim()
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b font-bold flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
        <div>{opponentName}</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${
              msg.type === "sent" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && <div className="text-sm text-gray-500 italic">{typing}</div>}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-3">
        <input
          className="flex-1 px-4 py-3 border rounded-full focus:outline-none"
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export {ChatWindow}