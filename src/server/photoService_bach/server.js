import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// ================= DB =================
const pgClient = new Pool({
  user: "postgres",
  host: "eros-postgres",
  database: "eros",
  password: "123456",
  port: 5432,
});

// ================= Upload config =================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images allowed"));
    }
    cb(null, true);
  },
});

// ================= Serve images =================
app.use("/uploads", express.static("uploads"));

// ================= APIs =================

// Upload photos
app.post("/api/photos/upload", upload.array("photos", 5), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "No userId provided" });
    }

    const { rows } = await pgClient.query(
      "SELECT COUNT(*) FROM photos WHERE user_id = $1",
      [userId]
    );

    const hasPrimary = Number(rows[0].count) > 0;
    const savedPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const url = `/uploads/${files[i].filename}`;

      const result = await pgClient.query(
        `
        INSERT INTO photos (user_id, url, is_primary, order_index)
        VALUES ($1, $2, $3, $4)
        RETURNING photo_id AS id, url, is_primary
        `,
        [userId, url, !hasPrimary && i === 0, i]
      );

      savedPhotos.push(result.rows[0]);
    }

    res.json({ photos: savedPhotos });
  } catch (error) {
    console.error("Error uploading photos:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get my photos
app.get("/api/photos/me", async (req, res) => {
  // Lấy userId từ URL query thay vì middleware
  const userId = req.query.userId; 

  // Kiểm tra xem có userId gửi lên không để tránh lỗi DB
  if (!userId) {
    return res.status(400).json({ error: "Thiếu userId trong request" });
  }

  try {
    const result = await pgClient.query(
      `
      SELECT photo_id AS id, url, is_primary
      FROM photos
      WHERE user_id = $1
      ORDER BY is_primary DESC, order_index ASC
      `,
      [userId]
    );

    res.json({ photos: result.rows });
  } catch (error) {
    console.error("Lỗi lấy ảnh:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Set primary
app.post("/api/photos/:id/primary", async (req, res) => {
const photoId = req.params.id;
  const { userId } = req.body; // Lấy từ body mà Frontend gửi lên

  if (!userId) {
    return res.status(400).json({ message: "Thiếu userId" });
  }

  try {
    await pgClient.query("BEGIN");

    // 1. Đưa tất cả ảnh của user này về trạng thái bình thường
    await pgClient.query(
      "UPDATE photos SET is_primary = false WHERE user_id = $1",
      [userId]
    );

    // 2. Đặt ảnh được chọn thành ảnh đại diện (Primary)
    const result = await pgClient.query(
      "UPDATE photos SET is_primary = true WHERE photo_id = $1 AND user_id = $2",
      [photoId, userId]
    );

    if (result.rowCount === 0) {
      await pgClient.query("ROLLBACK");
      return res.status(404).json({ message: "Không tìm thấy ảnh hoặc sai người dùng" });
    }

    await pgClient.query("COMMIT");
    res.json({ message: "Đã cập nhật ảnh đại diện thành công" });
    
  } catch (error) {
    await pgClient.query("ROLLBACK");
    console.error("Lỗi cập nhật Primary:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

// Delete photo
app.delete("/api/photos/:id", async (req, res) => {
try {
    const photoId = req.params.id;
    // Lấy userId từ query: /api/photos/123?userId=2
    const userId = req.query.userId; 

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // 1. Kiểm tra ảnh có tồn tại và có phải là Primary không
    const check = await pgClient.query(
      "SELECT is_primary FROM photos WHERE photo_id = $1 AND user_id = $2",
      [photoId, userId]
    );

    if (check.rowCount === 0) {
      return res.status(404).json({ message: "Không tìm thấy ảnh hoặc bạn không có quyền xóa" });
    }

    if (check.rows[0].is_primary) {
      return res.status(400).json({ message: "Không thể xóa ảnh đại diện (Primary)" });
    }

    // 2. Thực hiện xóa trong Database
    await pgClient.query(
      "DELETE FROM photos WHERE photo_id = $1 AND user_id = $2",
      [photoId, userId]
    );

    res.json({ success: true, message: "Đã xóa ảnh thành công" });
  } catch (error) {
    console.error("Lỗi xóa ảnh:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa ảnh" });
  }
});

// ================= Start =================
const PORT = 8008;
server.listen(PORT, () => {
  console.log(`Photo Service running on port ${PORT}`);
});
