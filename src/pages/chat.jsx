// src/pages/Chat.jsx  ← PHIÊN BẢN CHUẨN 2025
import React, { useState, useEffect } from "react";
import { ChatSidebar } from "../components/ChatSIdebar";
import { ChatWindow } from "../components/ChatWindow";
import { useChat } from "../hooks/useChat";
// lấy userId + token thật

function Chat() {
  // Lấy userId + token thật từ Auth (sau này bạn sẽ có)

  const currentUserId = 1; // Anna
  // const currentUserId = 3; // David

  const {
    matches, 
    loadMatches,
    messages, 
    loadMessages,
    sendMessage, 
    sendTyping, 
    joinMatch, 
    markAsRead,
    addOptimisticMessage,
    typing
  } = useChat(currentUserId);

  const [selectedMatchId, setSelectedMatchId] = useState(null);

  // Lấy tên đối phương từ matches
  const selectedMatch = matches.find(m => m.match_id === selectedMatchId);
  const opponentName = selectedMatch?.partner_name || "Đang tải...";
  const opponentAvatar = selectedMatch?.avatar || "/default-avatar.png";

  // Tự động load danh sách match khi vào trang
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Khi chọn một match → vào phòng + load tin cũ + đánh dấu đã đọc
  const handleSelectMatch = async (matchId) => {
    setSelectedMatchId(matchId);

    // 1. Load tin nhắn cũ (50 tin đầu tiên)
    await loadMessages(matchId);

    // 2. Đánh dấu đã đọc (tick xanh cho đối phương)
    markAsRead(matchId, currentUserId);
  };

  // Kiểm tra người đang gõ trong match hiện tại
  const typingInCurrentMatch = selectedMatchId
    ? typing[selectedMatchId]
    : null;

  if (!currentUserId) {
    return (
      <div className="flex h-[89vh] items-center justify-center text-xl text-gray-500">
        Đang tải người dùng...
      </div>
    );
  }

  return (
    <div className="flex w-full h-[89vh] bg-gray-100">
      {/* Sidebar: danh sách match */}
      <ChatSidebar
        matches={matches}
        selectedMatchId={selectedMatchId}
        onSelectMatch={handleSelectMatch}
        currentId={currentUserId}
      />
      {/* Window chat */}
      {selectedMatchId ? (
        <ChatWindow
          messages={messages[selectedMatchId] || []}
          currentUserId={currentUserId}
          currentMatchId={selectedMatchId}
          opponentName={opponentName}
          opponentAvatar={opponentAvatar}
          isTyping={!!typingInCurrentMatch}
          typingUserName={typingInCurrentMatch ? "Đang nhập..." : ""}
          sendMessage={(content, photoUrl) =>
            sendMessage(selectedMatchId, content, photoUrl)
          }
          addOptimisticMessage={(content) =>
            addOptimisticMessage(selectedMatchId, content)
          }
          sendTyping={(isTyping) =>
            sendTyping(selectedMatchId, isTyping)
          }
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}
    </div>
  );
}

export default Chat;