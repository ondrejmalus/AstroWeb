import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import newsRouter from './routes/news.js'; // news router
import galleryRouter from './routes/gallery.js'; // gallery router
import authRouter from './routes/auth.js'; // auth router
import usersRoutes from './routes/users.js'; // users router
import factsRouter from './routes/facts.js'; // facts router

const app = express();
const PORT = 3000;

// Potřebné pro práci s __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// zpřístupnění složky "images" (statické soubory)
app.use('/images', express.static(path.join(__dirname, '../images')));

// ROUTES
app.use('/news', newsRouter); // news
app.use('/gallery', galleryRouter); // gallery
app.use('/auth', authRouter); // login + register
app.use('/users', usersRoutes); // users
app.use('/facts', factsRouter); // facts

// MySQL připojení
const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'astroweb'
});

// Start serveru
app.listen(PORT, () => console.log(`✅ Server běží na http://localhost:${PORT}`));

// Export DB pro routery
export { db };