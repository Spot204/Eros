// backend/chat-service/server.js ← CHỈ DÙNG KHI DEV/TEST – BẮT BUỘC TRUYỀN USERID
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

// DB + Redis
const pg = new Pool({
  user: 'postgres', host: 'eros-postgres', database: 'eros',
  password: '123456', port: 5432
});
const redis = Redis.createClient({ url: 'redis://eros-redis:6379' });
redis.connect();

// TRUNG TÂM: BẮT BUỘC PHẢI CÓ userId – KHÔNG TRUYỀN = LỖI 400
const requireUser = (req, res, next) => {
  const userId = req.query.userId || req.headers['x-user-id'];

  if (!userId || isNaN(userId)) {
    return res.status(400).json({
      error: "Thiếu hoặc sai userId",
      hint: "Thêm ?userId=2 hoặc Header x-user-id: 2"
    });
  }

  req.user = { id: parseInt(userId) };
  next();
};

// ==================== REST API ====================
app.get('/api/matches', requireUser, async (req, res) => {
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

});

app.get('/api/matches/:matchId/messages', requireUser, async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before ? parseInt(req.query.before) : null;

  const check = await pg.query(
    'SELECT 1 FROM matches WHERE match_id = $1 AND (user1_id = $2 OR user2_id = $2)',
    [matchId, userId]
  );
  if (check.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });

  const query = before
    ? `SELECT m.*, u.username AS sender_name FROM messages m
       JOIN users u ON m.from_user_id = u.user_id
       WHERE m.match_id = $1 AND m.message_id < $2 ORDER BY sent_at DESC LIMIT $3`
    : `SELECT m.*, u.username AS sender_name FROM messages m
       JOIN users u ON m.from_user_id = u.user_id
       WHERE m.match_id = $1 ORDER BY sent_at DESC LIMIT $2`;

  const params = before ? [matchId, before, limit] : [matchId, limit];
  const result = await pg.query(query, params);
  res.json(result.rows.reverse());
});

app.post('/api/matches/:matchId/messages', requireUser, async (req, res) => {
  const { matchId } = req.params;
  const { content, photo_url } = req.body;
  const fromUserId = req.user.id;

  const check = await pg.query(
    'SELECT 1 FROM matches WHERE match_id = $1 AND (user1_id = $2 OR user2_id = $2)',
    [matchId, fromUserId]
  );
  if (check.rowCount === 0) return res.status(403).json({ error: 'Forbidden' });

  const result = await pg.query(
    `INSERT INTO messages (match_id, from_user_id, content, photo_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [matchId, fromUserId, content || null, photo_url || null]
  );

  const message = result.rows[0];
  message.sender_name = (await pg.query('SELECT username FROM users WHERE user_id = $1', [fromUserId])).rows[0].username;

  io.to(`match_${matchId}`).emit('new_message', message);
  res.json(message);
});

app.put('/api/matches/:matchId/read', requireUser, async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  await pg.query(
    `UPDATE messages SET read_at = NOW()
     WHERE match_id = $1 AND from_user_id != $1 AND read_at IS NULL`,
    [matchId, userId]
  );
  io.to(`match_${matchId}`).emit('messages_read', { matchId });
  res.json({ success: true });
});

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  // BẮT BUỘC PHẢI join với userId
  socket.on('join', (userId) => {
    if (!userId || isNaN(userId)) {
      socket.emit('error', 'Thiếu userId khi join');
      socket.disconnect();
      return;
    }
    socket.userId = parseInt(userId);
    redis.set(`online:${socket.userId}`, 'true', { EX: 3600 });
    console.log(`User ${socket.userId} connected via Socket`);
  });

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on('send_message', async (data) => {
    const fromUserId = socket.userId;
    if (!fromUserId) return;

    const msg = (await pg.query(
      `INSERT INTO messages (match_id, from_user_id, content, photo_url) VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.matchId, fromUserId, data.content, data.photoUrl]
    )).rows[0];

    msg.sender_name = (await pg.query('SELECT username FROM users WHERE user_id = $1', [fromUserId])).rows[0].username;
    io.to(`match_${data.matchId}`).emit('new_message', msg);
  });

  socket.on('typing', ({ matchId, isTyping }) => {
    socket.to(`match_${matchId}`).emit('user_typing', { userId: socket.userId, isTyping });
  });
});

server.listen(8005, '0.0.0.0', () => {
  console.log('Chat Service DEV MODE – BẮT BUỘC TRUYỀN userId');
  console.log('Ví dụ: http://localhost:8005/api/matches?userId=2');
});