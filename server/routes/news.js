import express from 'express';
import { db } from '../server.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// složka pro ukládání obrázků
const newsImagesPath = 'data/news_images/';

// zajistíme existenci složky
if (!fs.existsSync(newsImagesPath)) fs.mkdirSync(newsImagesPath, { recursive: true });

// konfigurace multer pro upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, newsImagesPath),
  filename: (req, file, cb) => {
    const filePath = path.join(newsImagesPath, file.originalname);
    if (fs.existsSync(filePath)) {
      return cb(new Error('Soubor se stejným názvem již existuje!'));
    }
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// GET /news
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM news ORDER BY created_at DESC");
    res.json({ success: true, articles: rows });
  } catch (error) {
    console.error("Chyba při načítání článků:", error);
    res.status(500).json({ success: false, error: "Chyba serveru při načítání článků" });
  }
});

// POST /news s uploadem obrázku
router.post("/", upload.single('image'), async (req, res) => {
  const { title, content } = req.body;
  const file = req.file;

  if (!title || !content || !file) {
    return res.status(400).json({ success: false, error: "Název, obsah a obrázek jsou povinné" });
  }

  const imagePath = `${newsImagesPath}${file.filename}`;

  try {
    const [result] = await db.query(
      "INSERT INTO news (title, image, content) VALUES (?, ?, ?)",
      [title, imagePath, content]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Článek přidán úspěšně" });
  } catch (error) {
    console.error("Chyba při přidávání článku:", error);
    res.status(500).json({ success: false, error: "Chyba serveru při ukládání článku" });
  }
});

export default router;
