import express from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../"))); // slouží statické soubory z AstroWeb kořene

app.use(session({
  secret: "tajneHesloProSession", // můžeš změnit
  resave: false,
  saveUninitialized: false
}));

// Databáze SQLite
const db = new sqlite3.Database(path.join(__dirname, "database.db"), err => {
  if (err) console.error(err);
  else console.log("✅ Připojeno k databázi SQLite");
});

// Inicializace tabulky uživatelů
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user'
  )
`);

// 🔹 Registrace
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Vyplňte všechna pole." });

  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], err => {
    if (err) {
      return res.status(400).json({ message: "Uživatel už existuje." });
    }
    res.json({ message: "Registrace proběhla úspěšně!" });
  });
});

// 🔹 Přihlášení
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err || !user)
      return res.status(400).json({ message: "Neplatné přihlašovací údaje." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Špatné heslo." });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ message: "Přihlášení úspěšné.", role: user.role });
  });
});

// 🔹 Odhlášení
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Odhlášen." });
});

// 🔹 Ověření přihlášení
app.get("/api/me", (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: "Nepřihlášen." });
  }
});

// Spuštění serveru
app.listen(PORT, () => console.log(`🚀 Server běží na http://localhost:${PORT}`));
