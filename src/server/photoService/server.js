import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import authMiddleware from "./auth.middleware.js";

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
app.post(
  "/api/photos/upload",
  authMiddleware,
  upload.array("photos", 5),
  async (req, res) => {
    const userId = req.user.userId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
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
  }
);

// Get my photos
app.get("/api/photos/me", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

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
});

// Set primary
app.post("/api/photos/:id/primary", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const photoId = req.params.id;

  await pgClient.query("BEGIN");
  await pgClient.query(
    "UPDATE photos SET is_primary = false WHERE user_id = $1",
    [userId]
  );
  await pgClient.query(
    "UPDATE photos SET is_primary = true WHERE photo_id = $1 AND user_id = $2",
    [photoId, userId]
  );
  await pgClient.query("COMMIT");

  res.json({ message: "Primary updated" });
});

// Delete photo
app.delete("/api/photos/:id", authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const photoId = req.params.id;

  const check = await pgClient.query(
    "SELECT is_primary FROM photos WHERE photo_id = $1 AND user_id = $2",
    [photoId, userId]
  );

  if (check.rows[0]?.is_primary) {
    return res.status(400).json({ message: "Cannot delete primary photo" });
  }

  await pgClient.query(
    "DELETE FROM photos WHERE photo_id = $1 AND user_id = $2",
    [photoId, userId]
  );

  res.json({ message: "Photo deleted" });
});

// ================= Start =================
const PORT = 8008;
server.listen(PORT, () => {
  console.log(`Photo Service running on port ${PORT}`);
});