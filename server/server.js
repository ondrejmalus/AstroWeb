import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import newsRouter from './routes/news.js'; // news router
import galleryRouter from './routes/gallery.js'; // gallery router
import authRouter from './routes/auth.js'; // auth router
import usersRoutes from './routes/users.js'; // users router

const app = express();
const PORT = 3000;

// Potřebné pro práci s __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🖼️ zpřístupnění složky "images" (statické soubory)
app.use('/images', express.static(path.join(__dirname, '../images')));

// ROUTES
app.use('/news', newsRouter); // news
app.use('/gallery', galleryRouter); // gallery
app.use('/auth', authRouter); // login + register
app.use('/users', usersRoutes); // users

// MySQL připojení
const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'astroweb'
});

// 🟢 Registrace
app.post('/register', async (req, res) => {
  const { username, email, password, confirm } = req.body;
  if (!username || !email || !password || !confirm)
    return res.status(400).json({ msg: 'Vyplňte všechna pole' });
  if (password !== confirm)
    return res.status(400).json({ msg: 'Hesla se neshodují' });

  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash]
    );
    res.json({ msg: 'Uživatel zaregistrován' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru / uživatel již existuje' });
  }
});

// 🟢 Přihlášení
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: 'Vyplňte všechna pole' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0)
      return res.status(400).json({ msg: 'Uživatel nenalezen' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Špatné heslo' });

    res.json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru' });
  }
});

// 🟢 GET – všechny objekty
app.get('/objects', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM objects ORDER BY id DESC');
    res.json({ success: true, objects: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// 🟢 POST – přidání objektu (jen admin)
app.post('/objects', async (req, res) => {
  const { name, category, role } = req.body;
  if (role !== 'admin')
    return res.status(403).json({ success: false, msg: 'Přístup zakázán' });
  if (!name || !category)
    return res.status(400).json({ success: false, msg: 'Chybí údaje' });

  try {
    await db.query('INSERT INTO objects (name, category) VALUES (?, ?)', [name, category]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: 'Chyba při ukládání' });
  }
});

// Start serveru
app.listen(PORT, () => console.log(`✅ Server běží na http://localhost:${PORT}`));

// Export DB pro routery
export { db };
