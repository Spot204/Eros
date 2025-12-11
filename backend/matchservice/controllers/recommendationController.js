import { pool } from "../config/db.js";
import { redis } from "../config/redis.js";


// GET next recommendations
export const getNextRecommendations = async (req, res) => {
try {
const userId = req.query.user_id;


const result = await pool.query(
`SELECT * FROM users
WHERE user_id != $1
ORDER BY RANDOM()
LIMIT 20;`,
[userId]
);


res.json(result.rows);
} catch (err) {
res.status(500).json({ error: err.message });
}
};


// POST swipe
export const sendSwipe = async (req, res) => {
try {
const { user_id, target_id, liked } = req.body;


await pool.query(
`INSERT INTO swipes (user_id, target_id, liked)
VALUES ($1, $2, $3);`,
[user_id, target_id, liked]
);


// Check if target liked back
const matchCheck = await pool.query(
`SELECT * FROM swipes
WHERE user_id = $1 AND target_id = $2 AND liked = true;`,
[target_id, user_id]
);


if (liked && matchCheck.rowCount > 0) {
await pool.query(
`INSERT INTO matches (user1_id, user2_id)
VALUES ($1, $2);`,
[user_id, target_id]
);
return res.json({ match: true });
}


res.json({ match: false });
} catch (err) {
res.status(500).json({ error: err.message });
}
};


// GET matches
export const getMatches = async (req, res) => {
try {
const userId = req.query.user_id;


const result = await pool.query(
`SELECT * FROM matches
WHERE user1_id = $1 OR user2_id = $1;`,
[userId]
);


res.json(result.rows);
} catch (err) {
res.status(500).json({ error: err.message });
}
};