// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const Redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Kết nối PostgreSQL
const pgClient = new Pool({
  user: 'postgres',
  host: 'eors-postgres',        // tên container trong Docker
  database: 'eors',
  password: '123456',
  port: 5432,
});

// Kết nối Redis (lưu online status + typing)
const redisClient = Redis.createClient({
  url: 'redis://eors-redis:6379'
});
redisClient.connect();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User đăng nhập → lưu online
  socket.on('join', async (userId) => {
    socket.userId = userId;
    await redisClient.set(`online:${userId}`, '1', { EX: 3600 });
    io.emit('user_online', userId);
  });

  // Lấy tin nhắn cũ
  socket.on('get_messages', async (matchId) => {
    const res = await pgClient.query(
      `SELECT m.*, u.username as sender_name 
       FROM messages m 
       JOIN users u ON m.from_user_id = u.id 
       WHERE m.match_id = $1 
       ORDER BY m.sent_at DESC LIMIT 50`,
      [matchId]
    );
    socket.emit('previous_messages', res.rows.reverse());
  });

  // Gửi tin nhắn
  socket.on('send_message', async (data) => {
    const { matchId, fromUserId, content, photoUrl } = data;

    const res = await pgClient.query(
      `INSERT INTO messages (match_id, from_user_id, content, photo_url) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [matchId, fromUserId, content || null, photoUrl || null]
    );

    const message = res.rows[0];
    message.sender_name = (await pgClient.query('SELECT username FROM users WHERE id = $1', [fromUserId])).rows[0].username;

    // Gửi real-time cho cả 2 người
    io.to(`match_${matchId}`).emit('new_message', message);

    // Đánh dấu đã đọc nếu người kia đang online
    const partnerOnline = await redisClient.get(`online:${fromUserId === user1 ? user2 : user1}`);
    if (partnerOnline) {
      await pgClient.query('UPDATE messages SET read_at = NOW() WHERE id = $1', [message.id]);
    }
  });

  // Typing indicator
  socket.on('typing', ({ matchId, isTyping }) => {
    socket.to(`match_${matchId}`).emit('user_typing', { userId: socket.userId, isTyping });
  });

  // Join phòng chat theo match
  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  // Disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      await redisClient.del(`online:${socket.userId}`);
      io.emit('user_offline', socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(8005, () => {
  console.log('Chat Service chạy trên port 8005');
  console.log('Real-time chat + seen + typing + gửi ảnh');
});
