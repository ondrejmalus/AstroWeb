import express from 'express';
import multer from 'multer';
import path from 'path';
import { db } from '../db.js';

const router = express.Router();

// upload ikon
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'frontend/data/badges');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// ADMIN – přidání badge
router.post('/', upload.single('icon'), async (req, res) => {
  try {
    const {
      badge_key,
      name,
      description,
      trigger_type,
      trigger_value
    } = req.body;

    if (!badge_key || !name || !trigger_type || !trigger_value) {
      return res.json({ success: false, msg: 'Chybí povinná pole' });
    }

    const iconPath = req.file
    ? `/data/badges/${req.file.filename}`
    : null;


    await db.query(
      `INSERT INTO badges 
      (badge_key, name, description, icon, trigger_type, trigger_value)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        badge_key,
        name,
        description,
        iconPath,
        trigger_type,
        trigger_value
      ]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false, msg: 'Chyba při ukládání badge' });
  }
});

export default router;
