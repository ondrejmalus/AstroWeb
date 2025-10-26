// routes/gallery.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

// ================================
// Multer – ukládání obrázků
// ================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images'); // složka v kořeni projektu
  },
  filename: function (req, file, cb) {
    // unikátní název souboru: timestamp + originální jméno
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Pouze obrázky jpg, jpeg, png, gif jsou povoleny.'));
    }
  }
});

// ================================
// POST – přidání snímku do galerie
// ================================
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { category, subcategory, name, common_Name, constellation, distance, fact } = req.body;

    // Kontrola povinných polí
    if (!category || !subcategory || !name || !req.file) {
      return res.status(400).json({ success: false, error: 'Chybí povinná pole nebo obrázek!' });
    }

    const imagePath = req.file.filename; // uložený název souboru

    // Vložení do databáze
    await db.query(
      `INSERT INTO gallery
      (category, subcategory, name, common_name, constellation, distance, fact, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [category, subcategory, name, common_Name, constellation, distance || null, fact, imagePath]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Chyba serveru při přidávání snímku.' });
  }
});

export default router;
