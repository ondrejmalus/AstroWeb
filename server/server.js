import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import newsRouter from './routes/news.js'; // news router
import galleryRouter from './routes/gallery.js'; // gallery router
import authRouter from './routes/auth.js'; // auth router
import usersRoutes from './routes/users.js'; // users router
import factsRouter from './routes/facts.js'; // facts router
import badgesRouter from './routes/badges.js'; // badges router
import statsRoutes from "./routes/stats.js"; // stats router

const app = express();
const PORT = process.env.PORT || 8080;

if (!PORT) {
  console.error("PORT není nastaven!");
  process.exit(1);
}

// Potřebné pro práci s __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// zpřístupnění složky pro obrázky
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/data', express.static(path.join(__dirname, '../frontend/data')));

// ROUTES
app.use('/news', newsRouter); // news
app.use('/gallery', galleryRouter); // gallery
app.use('/auth', authRouter); // login + register
app.use('/users', usersRoutes); // users
app.use('/facts', factsRouter); // facts
app.use('/badges', badgesRouter); // badges
app.use("/stats", statsRoutes); // stats

// FRONTEND ROUTES (clean URL)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/about.html"));
});
app.get("/astro", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/astro.html"));
});
app.get("/astrostatistics", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/astrostatistics.html"));
});
app.get("/edit", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/edit.html"));
});
app.get("/facts-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/facts.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/profile.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/register.html"));
});
app.get("/thefact", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/thefact.html"));
});
app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/upload.html"));
});

// Načtení frontendu
app.use(express.static(path.join(__dirname, '../frontend')));

// Start serveru
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server běží na portu ${PORT}`);
});