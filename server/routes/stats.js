import express from "express";
import { db } from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {

  try {

    // počet uživatelů
    const [[users]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM users
    `);

    // počet lajků
    const [[likes]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM gallery_likes
    `);

    // počet extra snímků
    const [[extraImages]] = await db.query(`
      SELECT COUNT(*) AS count
      FROM gallery_images
    `);

    // nejoblíbenější kategorie
    const [[favCategory]] = await db.query(`
      SELECT g.category, COUNT(*) AS count
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      GROUP BY g.category
      ORDER BY count DESC
      LIMIT 1
    `);

    // nejoblíbenější podkategorie
    const [[favSubcategory]] = await db.query(`
      SELECT g.subcategory, COUNT(*) AS count
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      GROUP BY g.subcategory
      ORDER BY count DESC
      LIMIT 1
    `);

    // nejoblíbenější souhvězdí
    const [[favConstellation]] = await db.query(`
      SELECT g.constellation, COUNT(*) AS count
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      WHERE g.constellation IS NOT NULL
      GROUP BY g.constellation
      ORDER BY count DESC
      LIMIT 1
    `);

    // Nejoblíbenější objekt
    const [[mostLikedObject]] = await db.query(`
      SELECT g.common_name, COUNT(*) AS likes
      FROM gallery_likes l
      JOIN gallery g ON g.id = l.gallery_id
      GROUP BY g.id
      ORDER BY likes DESC
      LIMIT 1
    `);

    // Nejfotografovanější objekt
    const [[mostPhotographedObject]] = await db.query(`
      SELECT g.common_name, COUNT(*) AS images
      FROM gallery_images gi
      JOIN gallery g ON g.id = gi.gallery_id
      GROUP BY g.id
      ORDER BY images DESC
      LIMIT 1
    `);

    res.json({
      users: users.count,
      likes: likes.count,
      extraImages: extraImages.count,
      favCategory,
      favSubcategory,
      favConstellation,
      mostLikedObject,
      mostPhotographedObject
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });

  }

});

export default router;