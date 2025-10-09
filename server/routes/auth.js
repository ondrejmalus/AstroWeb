import express from 'express';
import { db } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Registrace
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
                   [username, email, hashedPassword]);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Přihlášení
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) return res.json({ success: false, message: 'Uživatel nenalezen' });
  
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: 'Špatné heslo' });
  
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ success: true, role: user.role });
});

export default router;
