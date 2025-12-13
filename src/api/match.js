import axios from "axios";

const BASE = "http://localhost:8006/api";

export const getRecommendations = (userId) =>
  axios.get(`${BASE}/next`, {
    params: { user_id: userId },
  });

export const swipe = (fromUserId, toUserId, action) =>
  axios.post(`${BASE}/swipe`, {
    fromUser: fromUserId,
    toUser: toUserId,
    action,
  });
