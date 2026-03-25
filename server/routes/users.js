import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcrypt';
import { evaluateBadges } from '../utils/badgesEvaluator.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    await evaluateBadges(userId);

    const [rows] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);

    if (!rows.length) {
      return res.status(404).json({ msg: 'Uživatel nenalezen' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru' });
  }
});

router.get('/:id/stats', async (req, res) => {
  const userId = req.params.id;

  try {
    const [[likesRow]] = await db.query(
      'SELECT COUNT(*) AS count FROM gallery_likes WHERE user_id = ?',
      [userId]
    );

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
    'SELECT id FROM users WHERE username = ? AND id != ?',
    [username, req.params.id]
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
    'SELECT id FROM users WHERE email = ? AND id != ?',
    [email, req.params.id]
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

  if (newPassword.length < 8) {
  return res.status(400).json({ msg: 'Heslo musí mít alespoň 8 znaků' });
}

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Neplatná data' });
  }

  try {
    const [[user]] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user)
      return res.status(404).json({ msg: 'Špatné přihlašovací údaje' });

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

router.get('/:id/badges', async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query(`
      SELECT 
        b.id,
        b.badge_key,
        b.name,
        b.description,
        b.icon,
        ub.awarded_at
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badge_id
      WHERE ub.user_id = ?
      ORDER BY ub.awarded_at ASC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba při načítání badges' });
  }
});

export default router;