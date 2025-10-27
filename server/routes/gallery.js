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
    const { category, subcategory, name, common_name, constellation, distance, fact } = req.body;

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
      [category, subcategory, name, common_name, constellation, distance || null, fact, imagePath]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Chyba serveru při přidávání snímku.' });
  }
});

// ================================
// GET – získání všech snímků z galerie
// ================================
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId; // ID přihlášeného uživatele (volitelné)

    // Načteme všechny snímky a počet lajků
    const [rows] = await db.query(`
      SELECT 
        g.*, 
        (SELECT COUNT(*) FROM gallery_likes l WHERE l.gallery_id = g.id) AS likes
      FROM gallery g
      ORDER BY g.id DESC
    `);

    // Pokud máme userId, zjistíme, zda už uživatel lajknul každý snímek
    if (userId) {
      for (let row of rows) {
        const [likeCheck] = await db.query(
          'SELECT 1 FROM gallery_likes WHERE gallery_id = ? AND user_id = ?',
          [row.id, userId]
        );
        row.likedByUser = likeCheck.length > 0;
        row.likes = Number(row.likes);
      }
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Chyba serveru při načítání galerie.' });
  }
});

// ================================
// POST – lajkování snímku
// ================================
router.post('/:id/like', async (req, res) => {
  const galleryId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: 'Musíš být přihlášený.' });

  try {
    const [alreadyLiked] = await db.query('SELECT * FROM gallery_likes WHERE gallery_id = ? AND user_id = ?', [galleryId, userId]);
    if (alreadyLiked.length) return res.json({ success: false, message: 'Tento snímek jsi již lajknul.' });

    await db.query('INSERT INTO gallery_likes (gallery_id, user_id) VALUES (?, ?)', [galleryId, userId]);
    const [countRow] = await db.query('SELECT COUNT(*) AS count FROM gallery_likes WHERE gallery_id = ?', [galleryId]);
    res.json({ success: true, likes: countRow[0].count });
  } catch (err) {
    console.error('Chyba při lajkování:', err);
    res.status(500).json({ success: false, message: 'Chyba serveru při lajkování.' });
  }
});

export default router;