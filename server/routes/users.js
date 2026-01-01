import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ msg: 'Uživatel nenalezen' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru' });
  }
});

// 📊 Statistiky uživatele
router.get('/:id/stats', async (req, res) => {
  const userId = req.params.id;

  try {
    // ❤️ počet udělených lajků
    const [[likesRow]] = await db.query(
      'SELECT COUNT(*) AS count FROM gallery_likes WHERE user_id = ?',
      [userId]
    );

    // 🌌 oblíbená kategorie
    const [[categoryRow]] = await db.query(
      `
      SELECT g.category, COUNT(*) AS count
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      WHERE l.user_id = ?
      GROUP BY g.category
      ORDER BY count DESC
      LIMIT 1
      `,
      [userId]
    );

    // ✨ oblíbené souhvězdí
    const [[constellationRow]] = await db.query(
      `
      SELECT g.constellation, COUNT(*) AS count
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      WHERE l.user_id = ?
        AND g.constellation IS NOT NULL
      GROUP BY g.constellation
      ORDER BY count DESC
      LIMIT 1
      `,
      [userId]
    );

    res.json({
      likes: likesRow.count || 0,
      favoriteCategory: categoryRow?.category || null,
      favoriteConstellation: constellationRow?.constellation || null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba při načítání statistik' });
  }
});

router.put('/:id/username', async (req, res) => {
  const { username } = req.body;

  const [exists] = await db.query(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );

  if (exists.length)
    return res.status(400).json({ msg: 'Uživatelské jméno už existuje' });

  await db.query(
    'UPDATE users SET username = ? WHERE id = ?',
    [username, req.params.id]
  );

  res.json({ success: true });
});

router.put('/:id/email', async (req, res) => {
  const { email } = req.body;

  const [exists] = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (exists.length)
    return res.status(400).json({ msg: 'Email už je použitý' });

  await db.query(
    'UPDATE users SET email = ? WHERE id = ?',
    [email, req.params.id]
  );

  res.json({ success: true });
});

router.put('/:id/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Neplatná data' });
  }

  try {
    const [[user]] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user)
      return res.status(404).json({ msg: 'Uživatel nenalezen' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match)
      return res.status(400).json({ msg: 'Aktuální heslo není správné' });

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hash, req.params.id]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru' });
  }
});

export default router;