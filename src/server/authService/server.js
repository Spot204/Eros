import express from "express";
import http from "http";
import { Pool } from "pg";
import Redis from "redis";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import { body, validationResult } from "express-validator";
import authMiddleware from "./auth.middleware.js";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const pgClient = new Pool({
  user: "postgres",
  host: "eros-postgres",
  database: "eros",
  password: "123456",
  port: 5432,
});

// Kết nối Redis
const redisClient = Redis.createClient({
  url: "redis://eros-redis:6379",
});
redisClient.connect().catch(console.error);

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
  });
});

app.post(
  "/api/auth/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // Kiểm tra user tồn tại
      const userExist = await pgClient.query(
        "SELECT user_id FROM users WHERE email = $1",
        [email]
      );

      if (userExist.rowCount > 0) {
        return res.status(409).json({ message: "Email đã tồn tại" });
      }

      // Băm mật khẩu
      const passwordHash = await bcrypt.hash(password, 10);

      // Lưu DB
      const result = await pgClient.query(
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id",
        [username, email, passwordHash]
      );

      return res.status(201).json({
        message: "Đăng ký thành công",
        userId: result.rows[0].user_id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.post(
  "/api/auth/login",
  body("email").isEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await pgClient.query(
        "SELECT user_id, password_hash FROM users WHERE email = $1",
        [email]
      );

      if (result.rowCount === 0) {
        return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
      }

      // Tạo JWT
      const token = jwt.sign({ userId: user.userid }, JWT_SECRET, {
        expiresIn: "7d",
      });

      // Có thể lưu session vào Redis
      await redisClient.set(`auth:${user.id}`, token, { EX: 60 * 60 * 24 * 7 });

      return res.json({
        message: "Đăng nhập thành công",
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);
app.get("/api/auth/check", async (req, res) => {
  const userId = req.body.userId;
  const query = `SELECT * FROM profiles WHERE user_id = $1`;

  const result = await pgClient.query(query, [userId]);
  if (result.rowCount > 0) {
    res.status(200).json({
      message: "have profile",
    });
  } else {
    res.status(200).json({
      message: "have not profile",
    });
  }
});

// Khởi động server
const PORT = 8007;
server.listen(PORT, () => {
  console.log(`Chat Service đang chạy trên port ${PORT}`);
  console.log(`Real-time: seen, typing, gửi ảnh, online status`);
});
