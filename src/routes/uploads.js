import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Router } from "express";
import multer from "multer";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeExtension = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".mp4",
      ".webm",
      ".mov",
      ".m4v",
    ].includes(extension)
      ? extension
      : ".jpg";
    callback(null, `${randomUUID()}${safeExtension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Only JPEG, PNG, WebP, GIF images and MP4, WebM, MOV videos are allowed"
      )
    );
  },
});

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No media file provided" });
  }

  return res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

router.post("/batch", upload.array("files", 20), (req, res) => {
  const files = req.files ?? [];

  if (files.length === 0) {
    return res.status(400).json({ error: "No media files provided" });
  }

  return res.status(201).json({
    urls: files.map((file) => `/uploads/${file.filename}`),
  });
});

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File must be 100 MB or smaller" });
    }

    return res.status(400).json({ error: error.message });
  }

  if (error instanceof Error) {
    return res.status(400).json({ error: error.message });
  }

  return next(error);
});

export default router;
