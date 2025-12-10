// src/server/ProfileService/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 4000;

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. KẾT NỐI DATABASE ---
// src/server/ProfileService/server.js
// ... (các phần import giữ nguyên)

// --- KẾT NỐI DATABASE (Đã chỉnh theo eros-postgres) ---
const pool = new Pool({
    // Ưu tiên lấy từ biến môi trường Docker, nếu không có thì dùng giá trị mặc định của hệ thống cũ
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'postgres', // Quan trọng: trỏ vào service name 'postgres'
    database: process.env.DB_NAME || 'eros', // Database tên là 'eros'
    password: process.env.DB_PASS || '123456',
    port: 5432,
  });
  
  pool.on('connect', () => console.log('✅ ProfileService Connected to DB (Eros)'));
  pool.on('error', (err) => console.error('❌ DB Error', err));
  
  // ... (Phần còn lại của code API giữ nguyên không đổi)
// ==========================================
//                 API ROUTES
// ==========================================

// 🟢 API 1: Lấy Menu Sở thích (Metadata)
// Dùng để hiển thị danh sách icon giống Tinder
app.get('/api/metadata/interests', async (req, res) => {
  try {
    // Query gom nhóm Category và Interest Items bằng JSON
    const query = `
      SELECT 
        c.category_id, c.category_name, c.icon,
        json_agg(
          json_build_object(
            'interest_id', m.interest_id,
            'interest_tag', m.interest_tag,
            'icon', m.icon
          ) ORDER BY m.interest_id
        ) AS items
      FROM interest_categories c
      LEFT JOIN interest_map m ON c.category_id = m.category_id
      GROUP BY c.category_id, c.category_name, c.icon
      ORDER BY c.category_id;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy danh sách sở thích' });
  }
});

// 🟢 API 2: Lấy Full Profile của User (Để hiển thị lên form Edit)
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Lấy thông tin cơ bản + cài đặt tìm kiếm
    const profileRes = await pool.query(`
      SELECT p.*, pref.interested_in, pref.age_min, pref.age_max, pref.max_distance_km
      FROM profiles p
      LEFT JOIN preferences pref ON p.user_id = pref.user_id
      WHERE p.user_id = $1
    `, [userId]);

    // Lấy danh sách ID sở thích đã chọn
    const interestRes = await pool.query(`
      SELECT interest_id FROM user_interests WHERE user_id = $1
    `, [userId]);

    res.json({
      profile: profileRes.rows[0] || {}, // Nếu chưa có profile trả về rỗng
      selectedInterestIds: interestRes.rows.map(row => row.interest_id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lấy profile' });
  }
});

// 🔵 API 3: Lưu/Cập nhật thông tin cá nhân (Bio, Job, Location...)
app.post('/api/profile/update', async (req, res) => {
  const { userId = 1, bio, jobTitle, company, education, birthDate, gender, location } = req.body;

  try {
    // Dùng ON CONFLICT để: Chưa có thì Thêm, Có rồi thì Sửa (Upsert)
    const query = `
      INSERT INTO profiles (user_id, bio, job_title, company, education, birth_date, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        bio = EXCLUDED.bio,
        job_title = EXCLUDED.job_title,
        company = EXCLUDED.company,
        education = EXCLUDED.education,
        birth_date = EXCLUDED.birth_date,
        gender = EXCLUDED.gender,
        updated_at = NOW()
      RETURNING *;
    `;
    // Lưu ý: Phần Location (GPS) cần xử lý riêng nếu có, ở đây tạm thời bỏ qua trường location text
    const result = await pool.query(query, [userId, bio, jobTitle, company, education, birthDate, gender]);
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lưu profile' });
  }
});

// 🔵 API 4: Lưu/Cập nhật Cài đặt tìm kiếm (Preferences)
app.post('/api/profile/preferences', async (req, res) => {
  const { userId = 1, interested_in, age_min, age_max, max_distance_km } = req.body;

  try {
    const query = `
      INSERT INTO preferences (user_id, interested_in, age_min, age_max, max_distance_km)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        interested_in = EXCLUDED.interested_in,
        age_min = EXCLUDED.age_min,
        age_max = EXCLUDED.age_max,
        max_distance_km = EXCLUDED.max_distance_km,
        updated_at = NOW();
    `;
    await pool.query(query, [userId, interested_in, age_min, age_max, max_distance_km]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi lưu preferences' });
  }
});

// 🔵 API 5: Lưu Sở thích người dùng (Interests)
// Logic: Xóa hết cái cũ -> Thêm lại cái mới
app.post('/api/profile/interests', async (req, res) => {
  const { userId = 1, interest_ids } = req.body; // Mảng ID: [1, 5, 10]

  const client = await pool.connect(); // Dùng client để chạy Transaction
  try {
    await client.query('BEGIN'); // Bắt đầu giao dịch

    // B1: Xóa sạch sở thích cũ
    await client.query('DELETE FROM user_interests WHERE user_id = $1', [userId]);

    // B2: Thêm mới (nếu mảng không rỗng)
    if (interest_ids && interest_ids.length > 0) {
      // Tạo query insert nhiều dòng: VALUES ($1, $2), ($1, $3)...
      const values = interest_ids.map((id, index) => `($1, $${index + 2})`).join(',');
      const query = `INSERT INTO user_interests (user_id, interest_id) VALUES ${values}`;
      
      await client.query(query, [userId, ...interest_ids]);
    }

    await client.query('COMMIT'); // Lưu giao dịch
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK'); // Nếu lỗi thì hoàn tác
    console.error(err);
    res.status(500).json({ error: 'Lỗi lưu interests' });
  } finally {
    client.release();
  }
});

// --- KHỞI CHẠY SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Profile Service (Single File) running on port ${PORT}`);
});