import { db } from '../db.js';

export async function evaluateBadges(userId) {

  // user (kvůli registraci + stáří účtu)
  const [users] = await db.query(
    'SELECT created_at FROM users WHERE id = ?',
    [userId]
  );
  if (users.length === 0) return;

  const createdAt = new Date(users[0].created_at);
  const accountDays = Math.floor(
    (Date.now() - createdAt) / (1000 * 60 * 60 * 24)
  );

  // počet lajků (z gallery_likes)
  const [[likesRow]] = await db.query(
    'SELECT COUNT(*) AS count FROM gallery_likes WHERE user_id = ?',
    [userId]
  );

  const likes = likesRow.count || 0;

  // všechny badges
  const [badges] = await db.query('SELECT * FROM badges');

  for (const badge of badges) {
    let qualifies = false;

    if (badge.trigger_type === 'register') {
      qualifies = true;
    }

    if (badge.trigger_type === 'likes') {
      qualifies = likes >= badge.trigger_value;
    }

    if (badge.trigger_type === 'account_days') {
      qualifies = accountDays >= badge.trigger_value;
    }

    if (!qualifies) continue;

    // už ji nemá?
    const [exists] = await db.query(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badge.id]
    );

    if (exists.length === 0) {
      await db.query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badge.id]
      );
    }
  }
}
