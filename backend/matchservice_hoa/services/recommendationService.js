import { pool } from "../config/db.js";

// Lấy danh sách user để hiển thị lên UI
export const fetchNextUsers = async (userId) => {
  const query = `
    SELECT u.user_id AS id, u.username,
           p.bio, p.job_title, p.gender,
           ph.url AS photo
    FROM users u
    JOIN profiles p ON u.user_id = p.user_id
    LEFT JOIN photos ph ON u.user_id = ph.user_id AND ph.is_primary = true
    WHERE u.user_id != $1
      AND p.is_active = true
    LIMIT 10;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Ghi lại swipe
export const recordSwipe = async (fromUser, toUser, action) => {
  const query = `
    INSERT INTO swipes (from_user_id, to_user_id, action)
    VALUES ($1, $2, $3)
    ON CONFLICT (from_user_id, to_user_id)
    DO UPDATE SET action = EXCLUDED.action
    RETURNING *;
  `;
  await pool.query(query, [fromUser, toUser, action]);

  // Kiểm tra match
  const check = await pool.query(
    `SELECT * FROM swipes WHERE from_user_id=$1 AND to_user_id=$2 AND action='LIKE'`,
    [toUser, fromUser]
  );

  if (check.rowCount > 0) {
    await pool.query(
      `INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [fromUser, toUser]
    );
    return { match: true };
  }

  return { match: false };
};

// Lấy danh sách match
export const fetchMatches = async (userId) => {
  const query = `
    SELECT * FROM matches
    WHERE user1_id = $1 OR user2_id = $1;
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};
