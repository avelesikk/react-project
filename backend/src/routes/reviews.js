const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const productIdRaw = Number(req.query.productId);
    const hasProductId = Number.isInteger(productIdRaw) && productIdRaw >= 0;
    const limitRaw = Number(req.query.limit || 20);
    const limit = Number.isNaN(limitRaw) ? 20 : Math.min(Math.max(limitRaw, 1), 100);

    const [rows] = hasProductId
      ? await pool.execute(
          `
          SELECT id, product_id, author_name, rating, review_text, created_at
          FROM reviews
          WHERE product_id = ?
          ORDER BY created_at DESC
          LIMIT ${limit}
          `,
          [productIdRaw]
        )
      : await pool.query(`
          SELECT id, product_id, author_name, rating, review_text, created_at
          FROM reviews
          ORDER BY created_at DESC
          LIMIT ${limit}
        `);

    res.json({ reviews: rows });
  } catch (error) {
    console.error('GET /api/reviews failed:', error);
    res.status(500).json({ message: 'Не удалось получить отзывы.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const product_id = Number(req.body?.product_id);
    const author_name = String(req.body?.author_name || '').trim();
    const review_text = String(req.body?.review_text || '').trim();
    const rating = Number(req.body?.rating);

    if (!Number.isInteger(product_id) || product_id < 0) {
      return res.status(400).json({ message: 'Некорректный товар для отзыва.' });
    }

    if (!author_name || !review_text) {
      return res.status(400).json({ message: 'Имя и текст отзыва обязательны.' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Оценка должна быть от 1 до 5.' });
    }

    const [result] = await pool.execute(
      `
      INSERT INTO reviews (product_id, author_name, rating, review_text)
      VALUES (?, ?, ?, ?)
      `,
      [product_id, author_name, rating, review_text]
    );

    const [rows] = await pool.execute(
      `
      SELECT id, product_id, author_name, rating, review_text, created_at
      FROM reviews
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({ review: rows[0] || null });
  } catch (error) {
    console.error('POST /api/reviews failed:', error);
    return res.status(500).json({ message: 'Не удалось сохранить отзыв.' });
  }
});

module.exports = router;
