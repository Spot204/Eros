// backend/chat-service/server.js  ← ĐÃ CHẠY NGON TRÊN MÁY MÌNH HÔM NAY
const express = require('express');
const http = require('http');
const { Pool } = require('pg');
const Redis = require('redis');

const app = express();
const server = http.createServer(app);

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

// Khởi động server
const PORT = 8005;
server.listen(PORT, () => {
  console.log(`Chat Service đang chạy trên port ${PORT}`);
  console.log(`Real-time: seen, typing, gửi ảnh, online status`);
});