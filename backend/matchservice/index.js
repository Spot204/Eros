import express from "express";
import dotenv from "dotenv";
import matchRoutes from "./routes/matchRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Sử dụng route đúng
app.use("/api", matchRoutes);

const PORT = process.env.PORT || 8006;

app.listen(PORT, () => {
  console.log(`Match Service running on port ${PORT}`);
});
