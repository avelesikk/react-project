const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');

const router = express.Router();

const ADMIN_USER = process.env.ADMIN_USER || 'milka';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  'cf23dc33d6aba13592a72190564ed18b2c0dae295f681ee0fddc4862f01225cf';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

router.post('/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    return res.status(400).json({ message: 'Введите логин и пароль.' });
  }

  if (username !== ADMIN_USER || sha256(password) !== ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ message: 'Неверные учетные данные!' });
  }

  return res.json({ ok: true });
});

router.get('/orders', async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          o.id,
          o.total_price,
          o.status,
          o.created_at,
          k.first_name,
          k.name,
          k.last_name,
          k.email,
          k.phone_number
        FROM orders o
        INNER JOIN klient k ON k.id = o.user_id
        ORDER BY o.id DESC
      `
    );

    const orders = rows.map((row) => ({
      id: row.id,
      total_price: Number(row.total_price || 0),
      status: row.status,
      created_at: row.created_at,
      customer_name: [row.last_name, row.first_name, row.name].filter(Boolean).join(' '),
      customer_email: row.email,
      customer_phone: row.phone_number,
    }));

    return res.json({ orders });
  } catch (error) {
    console.error('GET /api/admin/orders failed:', error);
    return res.status(500).json({ message: 'Не удалось загрузить заказы.' });
  }
});

router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const orderId = Number(req.params.orderId || 0);
    const status = String(req.body?.status || '').trim();
    const allowed = new Set(['new', 'processing', 'completed', 'cancelled']);
    if (!orderId || !allowed.has(status)) {
      return res.status(400).json({ message: 'Некорректные данные для обновления статуса.' });
    }

    const [result] = await pool.execute(`UPDATE orders SET status = ? WHERE id = ? LIMIT 1`, [status, orderId]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Заказ не найден.' });
    }
    return res.json({ ok: true });
  } catch (error) {
    console.error('PATCH /api/admin/orders/:orderId/status failed:', error);
    return res.status(500).json({ message: 'Не удалось обновить статус заказа.' });
  }
});

module.exports = router;
