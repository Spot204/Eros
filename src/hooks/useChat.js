// frontend/src/hooks/useChat.js ← PHIÊN BẢN DEV – KHÔNG CẦN TOKEN, CHỈ CẦN userId
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const SOCKET_URL = "http://localhost:8005";
const API_URL = "http://localhost:8005/api";

export const useChat = (userId) => {
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState({}); // { matchId: [...] }
  const [typing, setTyping] = useState({}); // { matchId: { userId: true } }
  const socketRef = useRef(null);

  const addOptimisticMessage = (matchId, content) => {
  const tempId = Date.now();
  const tempMsg = {
    message_id: tempId,
    match_id: matchId,
    from_user_id: userId,
    content,
    sent_at: new Date().toISOString(),
    sender_name: "Bạn"
  };

  setMessages(prev => ({
    ...prev,
    [matchId]: [...(prev[matchId] || []), tempMsg]
  }));
};
  // Kết nối Socket.IO – chỉ cần userId, không cần token
  useEffect(() => {
    if (!userId) return;

    // Kết nối WebSocket + gửi userId ngay
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join", userId); // server bắt buộc phải có
    });
    
    // Nhận tin nhắn mới
    socket.on("new_message", (msg) => {
      setMessages((prev) => ({
        ...prev,
        [msg.match_id]: [...(prev[msg.match_id] || []), msg],
      }));

      // Cập nhật tin nhắn cuối trong danh sách match
      setMatches((prev) =>
        prev.map((m) =>
          m.match_id === msg.match_id
            ? { ...m, last_message: msg.content, last_time: msg.sent_at }
            : m
        )
      );
    });

    // Typing indicator
    socket.on("user_typing", ({ userId: typerId, isTyping, matchId }) => {
      setTyping((prev) => ({
        ...prev,
        [matchId]: isTyping ? typerId : null,
      }));
    });

    return () => socket.disconnect();
  }, [userId]);

  // Lấy danh sách match – thêm ?userId= vào URL
  const loadMatches = async () => {
    try {
      const res = await axios.get(`${API_URL}/matches`, {
        params: { userId }, // ← quan trọng nhất!
      });
      setMatches(res.data);
    } catch (err) {
      console.error("Lỗi load matches:", err.response?.data || err.message);
    }
  };

  // Lấy tin nhắn cũ
  const loadMessages = async (matchId, before = null) => {
    try {
      const res = await axios.get(`${API_URL}/matches/${matchId}/messages`, {
        params: { userId, limit: 50, before },
      });
      setMessages((prev) => ({
        ...prev,
        [matchId]: before ? [...res.data, ...(prev[matchId] || [])] : res.data,
      }));
    } catch (err) {
      console.error("Lỗi load messages:", err.response?.data);
    }
  };

  // Gửi tin nhắn
  const sendMessage = (matchId, content, photoUrl) => {
    if (!socketRef.current?.connected) {
      console.error("Socket chưa kết nối!");
      return;
    }
    socketRef.current.emit("send_message", {
      matchId,
      fromUserId: userId,
      content: content,
      photoUrl,
    });
  };

  // Typing
  const sendTyping = (matchId, isTyping) => {
    socketRef.current?.emit("typing", { matchId, isTyping });
  };

  // Vào phòng chat
  const joinMatch = (matchId) => {
    socketRef.current?.emit("join_match", matchId);
  };

  // Đánh dấu đã đọc
  const markAsRead = async (matchId, currentId) => {
    try {
    await axios.put(
      `${API_URL}/matches/${matchId}/read`,
      null, 
      {
        params: { userId: currentId }, 
      }
    );
  } catch (err) {
    console.error("Lỗi markAsRead:", err);
  }
  };

  return {
    matches,
    loadMatches,
    messages,
    addOptimisticMessage,
    loadMessages,
    sendMessage,
    sendTyping,
    joinMatch,
    markAsRead,
    typing, // typing[matchId] = userId đang gõ, hoặc null
  };
};
