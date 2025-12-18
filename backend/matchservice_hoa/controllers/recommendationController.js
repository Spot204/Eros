import {
  fetchNextUsers,
  recordSwipe,
  fetchMatches,
  fetchAllInterests,
  fetchLikedMeUsers
} from "../services/recommendationService.js";

export const getNextRecommendations = async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const filters = {
      maxDistanceKm: req.query.max_distance
        ? Number(req.query.max_distance)
        : null,

      interestIds: req.query.interests
        ? req.query.interests.split(",").map(Number)
        : null
    };

    const users = await fetchNextUsers(userId, filters);
    res.json(users);
  } catch (err) {
    console.error("❌ getNextRecommendations", err);
    res.status(500).json({ error: err.message });
  }
};

export const sendSwipe = async (req, res) => {
  try {
    const { from_user_id, to_user_id, action } = req.body;
    const result = await recordSwipe(from_user_id, to_user_id, action);
    res.json(result);
  } catch (err) {
    console.error("❌ sendSwipe", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    const matches = await fetchMatches(userId);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLikedMe = async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const users = await fetchLikedMeUsers(userId);
    res.json(users);
  } catch (err) {
    console.error("❌ getLikedMe", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllInterests = async (req, res) => {
  try {
    const interests = await fetchAllInterests();
    res.json(interests);
  } catch (err) {
    console.error("❌ getAllInterests", err);
    res.status(500).json({ error: err.message });
  }
};
