import { pool } from "../config/db.js";

// Lấy user chưa swipe
export const fetchNextUsers = async (userId) => {
  const query = `
    SELECT
      u.user_id,
      u.username,
      p.bio,
      p.job_title,
      p.company,
      p.education,
      p.gender,
      p.birth_date,
      ph.url AS avatar,
      ARRAY_AGG(DISTINCT im.interest_tag)
        FILTER (WHERE im.interest_tag IS NOT NULL) AS interests
    FROM users u
    JOIN profiles p ON u.user_id = p.user_id
    LEFT JOIN photos ph
      ON u.user_id = ph.user_id AND ph.is_primary = true
    LEFT JOIN user_interests ui ON u.user_id = ui.user_id
    LEFT JOIN interest_map im ON ui.interest_id = im.interest_id
    WHERE u.user_id != $1
      AND p.is_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM swipes s
        WHERE s.from_user_id = $1
          AND s.to_user_id = u.user_id
      )
    GROUP BY u.user_id, p.user_id, ph.url
    LIMIT 10;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

// Swipe + match
export const recordSwipe = async (fromUser, toUser, liked) => {
  const action = liked ? "LIKE" : "PASS";

  await pool.query(
    `
    INSERT INTO swipes (from_user_id, to_user_id, action)
    VALUES ($1, $2, $3)
    ON CONFLICT (from_user_id, to_user_id)
    DO UPDATE SET action = EXCLUDED.action;
    `,
    [fromUser, toUser, action]
  );

  if (!liked) return { match: false };

  const check = await pool.query(
    `
    SELECT 1 FROM swipes
    WHERE from_user_id = $1
      AND to_user_id = $2
      AND action = 'LIKE'
    `,
    [toUser, fromUser]
  );

  if (check.rowCount === 0) return { match: false };

  const [u1, u2] =
    fromUser < toUser ? [fromUser, toUser] : [toUser, fromUser];

  await pool.query(
    `
    INSERT INTO matches (user1_id, user2_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
    `,
    [u1, u2]
  );

  return { match: true };
};

// Matches
export const fetchMatches = async (userId) => {
  const result = await pool.query(
    `
    SELECT * FROM matches
    WHERE user1_id = $1 OR user2_id = $1;
    `,
    [userId]
  );
  return result.rows;
};
