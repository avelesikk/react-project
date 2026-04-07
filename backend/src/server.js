const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  override: true,
});

const ensureSchema = require('./db/ensureSchema');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use((error, _req, res, next) => {
  if (error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некорректный JSON в запросе.' });
  }
  return next(error);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'reviews-api' });
});

app.use('/api/reviews', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Неверный email или пароль!' });
});

ensureSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend started on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database init failed:', error.message);
    process.exit(1);
  });
