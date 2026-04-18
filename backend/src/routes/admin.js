const express = require('express');
const pool = require('../db/pool');

const router = express.Router();
const crypto = require('crypto');
const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || 'change-me-dev-auth-secret';

function fromBase64Url(value) {
  return Buffer.from(String(value || ''), 'base64url').toString('utf8');
}

function signTokenPayload(payload) {
  return crypto.createHmac('sha256', AUTH_TOKEN_SECRET).update(payload).digest('hex');
}

function readUserIdFromToken(token) {
  const [payload, signature] = String(token || '').split('.');
  if (!payload || !signature) return null;
  const expected = signTokenPayload(payload);
  if (expected.length !== signature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(payload));
    const userId = Number(parsed?.uid || 0);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

function readBearerToken(req) {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

async function requireAdmin(req, res, next) {
  try {
    const userId = readUserIdFromToken(readBearerToken(req));
    if (!userId) return res.status(401).json({ message: 'Требуется авторизация.' });
    const [rows] = await pool.execute(`SELECT id, role FROM klient WHERE id = ? LIMIT 1`, [userId]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Требуется авторизация.' });
    if (String(user.role || 'user') !== 'admin') return res.status(403).json({ message: 'Недостаточно прав.' });
    req.adminUserId = user.id;
    return next();
  } catch (error) {
    console.error('Admin auth middleware failed:', error);
    return res.status(500).json({ message: 'Ошибка проверки прав администратора.' });
  }
}

router.get('/orders', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `
        SELECT
          o.id,
          o.total_price,
          o.status,
          o.delivery_type,
          o.delivery_address,
          o.pickup_point,
          o.delivery_city,
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
      delivery_type: row.delivery_type,
      address: row.delivery_address || '',
      pickup_point: row.pickup_point || '',
      city: row.delivery_city || '',
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

router.patch('/orders/:orderId/status', requireAdmin, async (req, res) => {
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
