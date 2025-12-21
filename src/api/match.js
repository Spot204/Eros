import axios from "axios";

const BASE = "http://localhost:8006/api";

export const getRecommendations = (userId) =>
  axios.get(`${BASE}/next`, {
    params: { user_id: userId },
  });

export const swipe = (fromUserId, toUserId, action) =>
  axios.post(`${BASE}/swipe`, {
    from_user_id: fromUserId,
    to_user_id: toUserId,
    action
  });

export const getLikedMe = (userId) =>
  axios.get(`${BASE}/liked-me`, {
    params: { user_id: userId },
  });

export const getAllInterests = () =>
  axios.get(`${BASE}/interests`);
