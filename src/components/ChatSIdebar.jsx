import React, { useState, useEffect } from "react";
import io from "socket.io-client";

function ChatSidebar({ currentUserId, onSelectMatch, selectedMatchId }) {
  const [socket] = useState(() => io("http://localhost:8005"));
  const [matches, setMatches] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.emit("join", currentUserId);

    socket.on("my_matches", (data) => {
      setMatches(data); // [{match_id, user_id, user_name, avatar, last_message, unread}]
    });

    socket.on("online_users", (users) => setOnlineUsers(users));
    socket.on("user_online", (user) => {
      setOnlineUsers(prev => [...prev.filter(u => u.user_id !== user.user_id), user]);
    });
    socket.on("user_offline", (userId) => {
      setOnlineUsers(prev => prev.filter(u => u.user_id !== userId));
    });

    // Lấy danh sách matches ngay khi đăng nhập
    socket.emit("get_my_matches", currentUserId);

    return () => socket.close();
  }, [currentUserId, socket]);

  return (
    <div className="w-96 bg-gray-50 border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b font-bold text-xl">Tin nhắn</div>

      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có tin nhắn nào</div>
        ) : (
          matches.map((match) => {
            const isOnline = onlineUsers.some(u => u.user_id === match.user_id);
            const isActive = selectedMatchId === match.match_id;

            return (
              <div
                key={match.match_id}
                onClick={() => onSelectMatch(match.match_id, match.user_name)}
                className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer transition-all ${
                  isActive ? "bg-blue-50 border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="relative mr-3">
                  <img
                    src={match.avatar || "/default-avatar.png"}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{match.user_name}</div>
                  <div className="text-sm text-gray-600 truncate">
                    {match.last_message || "Bắt đầu trò chuyện"}
                  </div>
                </div>

                {match.unread > 0 && (
                  <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {match.unread}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { ChatSidebar };