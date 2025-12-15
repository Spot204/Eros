import {
  fetchNextUsers,
  recordSwipe,
  fetchMatches
} from "../services/recommendationService.js";

export const getNextRecommendations = async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    if (!userId) {
      return res.status(400).json({ error: "Missing user_id" });
    }

    const users = await fetchNextUsers(userId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendSwipe = async (req, res) => {
  try {
    const { from_user_id, to_user_id, action } = req.body;

    const result = await recordSwipe(
      from_user_id,
      to_user_id,
      action
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api?user_id=1
export const getMatches = async (req, res) => {
  try {
    const userId = Number(req.query.user_id);
    const matches = await fetchMatches(userId);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};