const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');

const router = express.Router();

const uploadDir = path.resolve(__dirname, '../../uploads/products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
});

function normalizeCoolingToKw(value) {
  const raw = String(value || '').trim();
  if (!raw) return '2.6 кВт';
  if (raw.toLowerCase().includes('квт')) return raw;
  if (raw.toLowerCase().includes('btu')) {
    const btu = Number.parseInt(raw.replace(/[^\d]/g, ''), 10);
    if (Number.isFinite(btu) && btu > 0) {
      return `${(btu / 3412).toFixed(1)} кВт`;
    }
  }
  const parsed = Number.parseFloat(raw.replace(',', '.'));
  if (Number.isFinite(parsed) && parsed > 0) return `${parsed.toFixed(1)} кВт`;
  return '2.6 кВт';
}

function mapProduct(row, req) {
  const host = `${req.protocol}://${req.get('host')}`;
  return {
    id: row.id,
    name: row.name,
    picture: row.picture,
    image_url: `${host}/uploads/products/${row.picture}`,
    price: Number(row.price),
    brand: row.brand || 'Haier',
    color: row.color || 'white',
    power: row.power || '2.6 кВт',
    cooling: normalizeCoolingToKw(row.cooling),
  };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, picture, price, brand, color, power, cooling
      FROM products
      ORDER BY id DESC
    `);
    res.json({ products: rows.map((row) => mapProduct(row, req)) });
  } catch (error) {
    console.error('GET /api/products failed:', error);
    res.status(500).json({ message: 'Не удалось получить товары.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный ID товара.' });
    }

    const [rows] = await pool.execute(
      `
      SELECT id, name, picture, price, brand, color, power, cooling
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Товар не найден.' });
    return res.json({ product: mapProduct(rows[0], req) });
  } catch (error) {
    console.error('GET /api/products/:id failed:', error);
    return res.status(500).json({ message: 'Не удалось получить товар.' });
  }
});

router.post('/', upload.single('product_picture'), async (req, res) => {
  try {
    const name = String(req.body?.product_name || '').trim();
    const price = Number(req.body?.product_price);

    if (!name) return res.status(400).json({ message: 'Не указано название товара.' });
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: 'Неверно указана цена.' });
    }
    if (!req.file?.filename) return res.status(400).json({ message: 'Ошибка загрузки файла.' });
    const color = String(req.body?.product_color || 'white').toLowerCase();
    const safeColor = ['black', 'white', 'gray'].includes(color) ? color : 'white';
    const brand = String(req.body?.product_brand || 'Haier');
    const safeBrand = ['LG', 'Haier', 'Samsung', 'ELECTROLUX', 'Toshiba'].includes(brand)
      ? brand
      : 'Haier';
    const power = String(req.body?.product_power || '').trim() || '2.6 кВт';
    const cooling = normalizeCoolingToKw(req.body?.product_cooling);

    const [result] = await pool.execute(
      `
      INSERT INTO products (name, picture, price, brand, color, power, cooling)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [name, req.file.filename, Math.round(price), safeBrand, safeColor, power, cooling]
    );

    const [rows] = await pool.execute(
      `
      SELECT id, name, picture, price, brand, color, power, cooling
      FROM products
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({ product: mapProduct(rows[0], req) });
  } catch (error) {
    console.error('POST /api/products failed:', error);
    return res.status(500).json({ message: 'Не удалось добавить товар.' });
  }
});

router.put('/:id', upload.single('product_picture'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = String(req.body?.product_name || '').trim();
    const price = Number(req.body?.product_price);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный ID товара.' });
    }
    if (!name) return res.status(400).json({ message: 'Не указано название товара.' });
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: 'Неверно указана цена.' });
    }

    const color = String(req.body?.product_color || 'white').toLowerCase();
    const safeColor = ['black', 'white', 'gray'].includes(color) ? color : 'white';
    const brand = String(req.body?.product_brand || 'Haier');
    const safeBrand = ['LG', 'Haier', 'Samsung', 'ELECTROLUX', 'Toshiba'].includes(brand)
      ? brand
      : 'Haier';
    const power = String(req.body?.product_power || '').trim() || '2.6 кВт';
    const cooling = normalizeCoolingToKw(req.body?.product_cooling);

    const [existsRows] = await pool.execute(`SELECT id, picture FROM products WHERE id = ? LIMIT 1`, [id]);
    const existing = existsRows[0];
    if (!existing) return res.status(404).json({ message: 'Товар не найден.' });

    let pictureName = existing.picture;
    if (req.file?.filename) {
      pictureName = req.file.filename;
      const oldPath = path.resolve(uploadDir, existing.picture);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.execute(
      `
      UPDATE products
      SET name = ?, picture = ?, price = ?, brand = ?, color = ?, power = ?, cooling = ?
      WHERE id = ?
      `,
      [name, pictureName, Math.round(price), safeBrand, safeColor, power, cooling, id]
    );

    const [rows] = await pool.execute(
      `SELECT id, name, picture, price, brand, color, power, cooling FROM products WHERE id = ? LIMIT 1`,
      [id]
    );
    return res.json({ product: mapProduct(rows[0], req) });
  } catch (error) {
    console.error('PUT /api/products/:id failed:', error);
    return res.status(500).json({ message: 'Не удалось обновить товар.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Некорректный ID товара.' });
    }

    const [rows] = await pool.execute(`SELECT picture FROM products WHERE id = ? LIMIT 1`, [id]);
    const product = rows[0];
    if (!product) return res.status(404).json({ message: 'Товар не найден.' });

    await pool.execute(`DELETE FROM products WHERE id = ?`, [id]);

    const imagePath = path.resolve(uploadDir, product.picture);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    return res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/products/:id failed:', error);
    return res.status(500).json({ message: 'Не удалось удалить товар.' });
  }
});

module.exports = router;
