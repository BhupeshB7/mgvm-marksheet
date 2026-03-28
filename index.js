const express = require("express");
const cors = require("cors");
const { generateMarksheet, generateSampleMarksheet } = require("./controller");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Marksheet PDF Generator" });
});

app.post("/marksheet/generate", generateMarksheet);

app.get("/marksheet/sample", generateSampleMarksheet);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Marksheet PDF server running on http://localhost:${PORT}`);
});
