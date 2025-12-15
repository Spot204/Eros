import { pool } from "../config/db.js";

// Lấy user chưa swipe
export const fetchNextUsers = async (userId) => {
  const query = `
    SELECT *
    FROM (
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

        ROUND(
          (ST_Distance(
            p.location::geography,
            me.location::geography
          ) / 1000)::numeric,
          1
        ) AS distance_km,

        ARRAY_AGG(DISTINCT im.interest_tag)
          FILTER (WHERE im.interest_tag IS NOT NULL) AS interests

      FROM users u
      JOIN profiles p ON u.user_id = p.user_id
      JOIN profiles me ON me.user_id = $1

      LEFT JOIN photos ph
        ON u.user_id = ph.user_id AND ph.is_primary = true
      LEFT JOIN user_interests ui ON u.user_id = ui.user_id
      LEFT JOIN interest_map im ON ui.interest_id = im.interest_id

      WHERE u.user_id != $1
        AND p.is_active = true
        AND p.location IS NOT NULL
        AND me.location IS NOT NULL
        AND NOT EXISTS (
          SELECT 1
          FROM swipes s
          WHERE s.from_user_id = $1
            AND s.to_user_id = u.user_id
        )

      GROUP BY
        u.user_id,
        p.user_id,
        ph.url,
        p.location,
        me.location
    ) t
    ORDER BY t.distance_km ASC
    LIMIT 10;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};


export const recordSwipe = async (fromUser, toUser, action) => {
  // 1. Lưu swipe
  await pool.query(
    `
    INSERT INTO swipes (from_user_id, to_user_id, action)
    VALUES ($1, $2, $3)
    ON CONFLICT (from_user_id, to_user_id)
    DO UPDATE SET action = EXCLUDED.action;
    `,
    [fromUser, toUser, action]
  );

  // Nếu PASS → dừng
  if (action === "PASS") {
    return { match: false };
  }

  // 2. Check đối phương đã LIKE mình chưa
  const check = await pool.query(
    `
    SELECT 1
    FROM swipes
    WHERE from_user_id = $1
      AND to_user_id = $2
      AND action = 'LIKE'
    `,
    [toUser, fromUser]
  );

  if (check.rowCount === 0) {
    return { match: false };
  }

  // 3. Tạo match (chuẩn hóa thứ tự)
  const [u1, u2] =
    fromUser < toUser ? [fromUser, toUser] : [toUser, fromUser];

  const matchResult = await pool.query(
    `
    INSERT INTO matches (user1_id, user2_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING match_id;
    `,
    [u1, u2]
  );

  return {
    match: true,
    match_id: matchResult.rows[0]?.match_id
  };
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