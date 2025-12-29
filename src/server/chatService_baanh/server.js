// backend/chat-service/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const Redis = require('redis');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// PHỤC VỤ FILE TĨNH: Để client có thể xem ảnh qua link http://localhost:8005/uploads/abc.jpg
app.use('/uploads', express.static('uploads'));

// KẾT NỐI DATABASE
const pg = new Pool({
  user: 'postgres', 
  host: 'eros-postgres', 
  database: 'eros',
  password: '123456', 
  port: 5432
});

// KẾT NỐI REDIS (Chỉ dùng để quản lý trạng thái Online)
const redis = Redis.createClient({ url: 'redis://eros-redis:6379' });
redis.connect().catch(err => console.log('Redis Connection Error', err));

// MIDDLEWARE XÁC THỰC USER
const requireUser = (req, res, next) => {
  const userId = req.query.userId || req.headers['x-user-id'];
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: "Thiếu hoặc sai userId" });
  }
  req.user = { id: parseInt(userId) };
  next();
};

// ==================== REST API ====================

// 1. Lấy danh sách bạn bè đã match và tin nhắn cuối
app.get('/api/matches', requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT 
        m.match_id,
        CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END AS partner_id,
        u.username AS partner_name,
        ph.url AS avatar,
        msg.content AS last_message,
        msg.sent_at AS last_time,
        COALESCE(unread.unread_count, 0) AS unread_count
      FROM matches m
      JOIN users u ON u.user_id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
      LEFT JOIN photos ph ON ph.user_id = u.user_id AND ph.is_primary = true
      LEFT JOIN LATERAL (
        SELECT content, sent_at FROM messages WHERE match_id = m.match_id ORDER BY sent_at DESC LIMIT 1
      ) msg ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS unread_count FROM messages 
        WHERE match_id = m.match_id AND read_at IS NULL AND from_user_id != $1
      ) unread ON true
      WHERE m.user1_id = $1 OR m.user2_id = $1
      ORDER BY last_time DESC NULLS LAST;
    `;
    const result = await pg.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy matches:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// 2. Lấy lịch sử tin nhắn của một cuộc trò chuyện
app.get('/api/matches/:matchId/messages', requireUser, async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const result = await pg.query(
      `SELECT m.*, u.username AS sender_name FROM messages m
       JOIN users u ON m.from_user_id = u.user_id
       WHERE m.match_id = $1 ORDER BY sent_at DESC LIMIT $2`,
      [matchId, limit]
    );
    res.json(result.rows.reverse());
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy tin nhắn" });
  }
});

// 3. API gửi tin nhắn (Dùng khi upload ảnh xong rồi gửi link qua đây)
app.post('/api/matches/:matchId/messages', requireUser, async (req, res) => {
  const { matchId } = req.params;
  const { content, photo_url } = req.body; // photo_url là đường dẫn file ảnh vật lý
  const fromUserId = req.user.id;

  try {
    const result = await pg.query(
      `INSERT INTO messages (match_id, from_user_id, content, photo_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [matchId, fromUserId, content || null, photo_url || null]
    );

    const message = result.rows[0];
    const userRes = await pg.query('SELECT username FROM users WHERE user_id = $1', [fromUserId]);
    message.sender_name = userRes.rows[0].username;

    io.to(`match_${matchId}`).emit('new_message', message);
    res.json(message);
  } catch (error) {
    console.error("Lỗi lưu tin nhắn:", error);
    res.status(500).json({ error: "Lỗi Server" });
  }
});

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    if (!userId || isNaN(userId)) return;
    socket.userId = parseInt(userId);
    // Lưu trạng thái online vào Redis (Cái này nên giữ vì nó rất nhanh)
    redis.set(`online:${socket.userId}`, 'true', { EX: 3600 });
    console.log(`User ${socket.userId} connected`);
  });

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  // Gửi tin nhắn qua Socket (Đã sửa để nhận photoUrl vật lý)
  socket.on('send_message', async (data) => {
    const fromUserId = socket.userId;
    if (!fromUserId) return;

    try {
      const msgResult = await pg.query(
        `INSERT INTO messages (match_id, from_user_id, content, photo_url) 
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [data.matchId, fromUserId, data.content, data.photoUrl]
      );

      const msg = msgResult.rows[0];
      const userRes = await pg.query('SELECT username FROM users WHERE user_id = $1', [fromUserId]);
      msg.sender_name = userRes.rows[0].username;

      io.to(`match_${data.matchId}`).emit('new_message', msg);
    } catch (err) {
      console.error("Socket send_message error:", err);
    }
  });
});

server.listen(8005, '0.0.0.0', () => {
  console.log('Chat Service running on port 8005');
});