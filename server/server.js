import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL připojení
const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',       // tvůj MySQL uživatel
  password: '',       // heslo
  database: 'astroweb'
});

// 🟢 Registrace
app.post('/register', async (req, res) => {
  const { username, email, password, confirm } = req.body;
  if (!username || !email || !password || !confirm) {
    return res.status(400).json({ msg: 'Vyplňte všechna pole' });
  }
  if (password !== confirm) {
    return res.status(400).json({ msg: 'Hesla se neshodují' });
  }

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
  if (!username || !password) return res.status(400).json({ msg: 'Vyplňte všechna pole' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(400).json({ msg: 'Uživatel nenalezen' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Špatné heslo' });

    // vracíme roli, aby se dala uložit do localStorage
    res.json({ role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Chyba serveru' });
  }
});

// Start serveru
app.listen(PORT, () => console.log(`Server běží na http://localhost:${PORT}`));
