import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db.js';
import fs from 'fs';

const router = express.Router();

// Multer – ukládání obrázků
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'frontend/images'); // složka pro ukládání obrázků
  },
  filename: function (req, file, cb) {
    // unikátní název souboru: timestamp + originální jméno
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}_${name}${ext}`);
  }
});

// Filtr pro povolené typy souborů
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Pouze obrázky jpg, jpeg, png, gif, webp jsou povoleny.'));
    }
  }
});

// POST – přidání snímku do galerie
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

// GET – získání všech snímků z galerie
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId; // ID přihlášeného uživatele

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

// POST – lajkování snímku
router.post('/:id/like', async (req, res) => {
  const galleryId = req.params.id;
  const { userId } = req.body;

  if (!userId) return res.status(401).json({ success: false, message: 'Musíš být přihlášený.' });

  try {
    
    const [alreadyLiked] = await db.query(
      'SELECT * FROM gallery_likes WHERE gallery_id = ? AND user_id = ?', [galleryId, userId]);
    if (alreadyLiked.length) return res.json(
      { success: false, message: 'Tento snímek jsi již lajknul.' });

    await db.query('INSERT INTO gallery_likes (gallery_id, user_id) VALUES (?, ?)', [galleryId, userId]);
    const [countRow] = await db.query('SELECT COUNT(*) AS count FROM gallery_likes WHERE gallery_id = ?', [galleryId]);
    res.json({ success: true, likes: countRow[0].count });
  } catch (err) {
    console.error('Chyba při lajkování:', err);
    res.status(500).json({ success: false, message: 'Chyba serveru při lajkování.' });
  }
});

// PUT – úprava snímku v galerii

router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { name, common_name, constellation, fact } = req.body;

  try {
    // najdeme původní záznam
    const [[old]] = await db.query(
      'SELECT image FROM gallery WHERE id = ?',
      [id]
    );

    if (!old) {
      return res.status(404).json({ success: false, msg: 'Snímek nenalezen' });
    }

    let imageName = old.image;

    // pokud přišel nový obrázek
    if (req.file) {
      imageName = req.file.filename;

      // smažeme starý obrázek ze složky
      const oldImagePath = path.join('frontend/images', old.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // update databáze
    await db.query(
      `
      UPDATE gallery SET
        name = ?,
        common_name = ?,
        constellation = ?,
        fact = ?,
        image = ?
      WHERE id = ?
      `,
      [
        name,
        common_name || null,
        constellation || null,
        fact || null,
        imageName,
        id
      ]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('Chyba při editaci snímku:', err);
    res.status(500).json({ success: false, msg: 'Chyba serveru při editaci snímku' });
  }
});

// POST – přidání další fotky k objektu
router.post('/:id/images', upload.single('image'), async (req, res) => {
  const galleryId = req.params.id;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nebyl nahrán žádný obrázek'
      });
    }

    await db.query(
      'INSERT INTO gallery_images (gallery_id, image) VALUES (?, ?)',
      [galleryId, req.file.filename]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('Chyba při ukládání další fotky:', err);
    res.status(500).json({ success: false });
  }
});

// GET – všechny dodatečné fotky objektu
router.get('/:id/images', async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id, image, created_at
      FROM gallery_images
      WHERE gallery_id = ?
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    res.json(rows);

  } catch (err) {
    console.error('Chyba při načítání dalších fotek:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE – smazání jedné dodatečné fotky
router.delete('/images/:imageId', async (req, res) => {
  const imageId = req.params.imageId;

  try {
    const [[img]] = await db.query(
      'SELECT image FROM gallery_images WHERE id = ?',
      [imageId]
    );

    if (!img) {
      return res.status(404).json({ success: false });
    }

    // smazání souboru
    const imagePath = path.join('frontend/images', img.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // smazání z DB
    await db.query(
      'DELETE FROM gallery_images WHERE id = ?',
      [imageId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error('Chyba při mazání fotky:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE – smazání snímku z galerie
router.delete('/:id', async (req, res) => {

  const id = req.params.id;

  try {

    // najdeme snímek
    const [[item]] = await db.query(
      'SELECT image FROM gallery WHERE id = ?',
      [id]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Snímek nenalezen'
      });
    }

    // smažeme hlavní obrázek ze složky
    const imagePath = path.join('frontend/images', item.image);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // smažeme dodatečné obrázky
    const [extraImages] = await db.query(
      'SELECT image FROM gallery_images WHERE gallery_id = ?',
      [id]
    );

    for (const img of extraImages) {
      const extraPath = path.join('frontend/images', img.image);
      if (fs.existsSync(extraPath)) {
        fs.unlinkSync(extraPath);
      }
    }

    // smažeme z DB
    await db.query(
      'DELETE FROM gallery_images WHERE gallery_id = ?',
      [id]
    );

    await db.query(
      'DELETE FROM gallery_likes WHERE gallery_id = ?',
      [id]
    );

    await db.query(
      'DELETE FROM gallery WHERE id = ?',
      [id]
    );

    res.json({ success: true });

  } catch (err) {

    console.error('Chyba při mazání snímku:', err);
    res.status(500).json({
      success: false,
      error: 'Chyba serveru při mazání'
    });

  }

});
export default router;