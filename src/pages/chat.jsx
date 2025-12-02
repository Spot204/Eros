import React, { useState } from "react";
import { ChatSidebar } from "../components/ChatSIdebar";
import { ChatWindow } from "../components/ChatWindow";

function Chat({ }) {
  const currentUserId = 4
  const [selectedMatchId, setSelectedMatchId] = useState(null);   // match đang chat
  const [selectedUserName, setSelectedUserName] = useState("");   // tên đối phương

  return (
    <div className="flex h-[89vh]">
      {/* Sidebar: chỉ danh sách người dùng / matches */}
      <ChatSidebar 
        currentUserId={currentUserId}
        onSelectMatch={(matchId, userName) => {
          setSelectedMatchId(matchId);
          setSelectedUserName(userName);
        }}
        selectedMatchId={selectedMatchId}
      />

      {/* Main chat: chỉ hiển thị khi đã chọn 1 match */}
      {selectedMatchId ? (
        <ChatWindow 
          currentUserId={currentUserId}
          currentMatchId={selectedMatchId}
          opponentName={selectedUserName}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Chọn một cuộc trò chuyện để bắt đầu
        </div>
      )}
    </div>
  );
}

export default Chat;