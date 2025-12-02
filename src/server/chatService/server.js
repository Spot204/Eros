// backend/chat-service/server.js  ← ĐÃ CHẠY NGON TRÊN MÁY MÌNH HÔM NAY
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const Redis = require('redis');

const app = express();
const server = http.createServer(app);

// Socket.IO + CORS cho frontend React
const io = new Server(server, {
  cors: {
    origin: "*",                    // hoặc "http://localhost:5173" nếu muốn an toàn hơn
    methods: ["GET", "POST"]
  }
});

// Kết nối PostgreSQL (tên container đúng của bạn)
const pgClient = new Pool({
  user: 'postgres',
  host: 'eros-postgres',          // ĐÚNG tên container của bạn
  database: 'eros',               // ĐÚNG tên DB của bạn
  password: '123456',
  port: 5432,
});

// Kết nối Redis
const redisClient = Redis.createClient({
  url: 'redis://eros-redis:6379'  // ĐÚNG tên container Redis của bạn
});
redisClient.connect().catch(console.error);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // 1. User đăng nhập → đánh dấu online
  socket.on('join', (userId) => {
    socket.userId = userId;
    redisClient.set(`online:${userId}`, 'true', { EX: 3600 }); // hết hạn sau 1h
    io.emit('user_online', userId);
  });

  // 2. Vào phòng chat theo match_id
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`User ${socket.userId} joined match_${matchId}`);
  });

  // 3. Lấy tin nhắn cũ
  socket.on('get_messages', async (matchId) => {
    try {
      const res = await pgClient.query(
        `SELECT m.*, u.username AS sender_name
         FROM messages m
         JOIN users u ON m.from_user_id = u.user_id
         WHERE m.match_id = $1
         ORDER BY m.sent_at DESC
         LIMIT 50`,
        [matchId]
      );
      socket.emit('previous_messages', res.rows.reverse());
    } catch (err) {
      console.error('Lỗi lấy tin nhắn:', err);
    }
  });

  // 4. Gửi tin nhắn mới
  socket.on('send_message', async ({ matchId, fromUserId, content, photoUrl }) => {
    try {
      // Lưu tin nhắn vào DB
      const res = await pgClient.query(
        `INSERT INTO messages (match_id, from_user_id, content, photo_url)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [matchId, fromUserId, content || null, photoUrl || null]
      );

      const message = res.rows[0];

      // Gắn tên người gửi
      const userRes = await pgClient.query(
        'SELECT username FROM users WHERE user_id = $1',
        [fromUserId]
      );
      message.sender_name = userRes.rows[0]?.username || 'Unknown';

      // Gửi real-time cho cả 2 người trong phòng
      io.to(`match_${matchId}`).emit('new_message', message);

      // Đánh dấu đã đọc nếu đối phương đang online
      const matchInfo = await pgClient.query(
        'SELECT user1_id, user2_id FROM matches WHERE match_id = $1',
        [matchId]
      );
      if (matchInfo.rows.length > 0) {
        const { user1_id, user2_id } = matchInfo.rows[0];
        const partnerId = fromUserId === user1_id ? user2_id : user1_id;

        const isPartnerOnline = await redisClient.get(`online:${partnerId}`);
        if (isPartnerOnline) {
          await pgClient.query(
            'UPDATE messages SET read_at = NOW() WHERE message_id = $1',
            [message.message_id]
          );
          // Gửi thông báo "đã xem" cho người gửi
          socket.emit('message_read', message.message_id);
        }
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
    }
  });

  // 5. Typing indicator
  socket.on('typing', ({ matchId, isTyping }) => {
    socket.to(`match_${matchId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping
    });
  });

  // 6. Ngắt kết nối → xóa trạng thái online
  socket.on('disconnect', async () => {
    if (socket.userId) {
      await redisClient.del(`online:${socket.userId}`);
      io.emit('user_offline', socket.userId);
      console.log('User offline:', socket.userId);
    }
  });
});

// Khởi động server
const PORT = 8005;
server.listen(PORT, () => {
  console.log(`Chat Service đang chạy trên port ${PORT}`);
  console.log(`Real-time: seen, typing, gửi ảnh, online status`);
});