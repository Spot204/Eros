import axios from "axios";

const BASE = "http://localhost:8010/match";

export const getRecommendations = (userId) =>
  axios.get(`${BASE}/recommend/${userId}`);

export const swipe = (fromUserId, toUserId, action) =>
  axios.post(`${BASE}/swipe`, null, {
    params: { fromUserId, toUserId, action },
  });
