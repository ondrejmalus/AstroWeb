import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Registrace
router.post('/register', async (req, res) => {
  const { username, email, password, confirm } = req.body;
  if (!username || !email || !password || !confirm)
    return res.status(400).json({ msg: 'Vyplňte všechna pole' });
  if (password !== confirm)
    return res.status(400).json({ msg: 'Hesla se neshodují' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Chyba serveru / uživatel již existuje' });
  }
});

// Přihlášení
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, msg: 'Vyplňte všechna pole' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ success: false, msg: 'Uživatel nenalezen' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, msg: 'Špatné heslo' });

    // Odeslání kompletních dat na frontend
    res.json({
      success: true,
      id: user.id,
      username: user.username,
      role: user.role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Chyba serveru' });
  }
});

export default router;
