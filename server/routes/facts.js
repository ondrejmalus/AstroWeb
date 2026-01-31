import express from 'express';
import { db } from '../server.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Složka pro obrázky zajímavostí

const factsImagesPath = 'frontend/data/facts_images/';

if (!fs.existsSync(factsImagesPath)) {
  fs.mkdirSync(factsImagesPath, { recursive: true });
}

// Multer – upload obrázku

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, factsImagesPath),
  filename: (req, file, cb) => {
    const filename = Date.now() + '_' + file.originalname;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Povoleny jsou pouze obrázky.'));
  }
});

// GET /facts – načtení zajímavostí

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM facts ORDER BY created_at DESC'
    );

    res.json({ success: true, facts: rows });
  } catch (err) {
    console.error('Chyba při načítání facts:', err);
    res.status(500).json({ success: false });
  }
});

// POST /facts – přidání zajímavosti

router.post('/', upload.single('image'), async (req, res) => {
  const { category, title, text } = req.body;
  const file = req.file;

  if (!category || !title || !text) {
    return res.status(400).json({
      success: false,
      msg: 'Kategorie, název a text jsou povinné'
    });
  }

  const imagePath = file ? `data/facts_images/${file.filename}` : null;

  try {
    await db.query(
      `INSERT INTO facts (category, title, text, image)
       VALUES (?, ?, ?, ?)`,
      [category, title, text, imagePath]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Chyba při ukládání fact:', err);
    res.status(500).json({ success: false });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  const { category, title, text } = req.body;
  const id = req.params.id;

  try {
    let sql = `
      UPDATE facts
      SET category = ?, title = ?, text = ?
    `;
    const params = [category, title, text];

    if (req.file) {
      sql += ', image = ?';
      params.push(`data/facts_images/${req.file.filename}`);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await db.query(sql, params);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM facts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

export default router;
