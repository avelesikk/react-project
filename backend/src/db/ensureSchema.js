const pool = require('./pool');

async function columnExists(tableName, columnName) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );
  return Number(rows?.[0]?.cnt || 0) > 0;
}

async function indexExists(tableName, indexName) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS cnt
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND INDEX_NAME = ?
    `,
    [tableName, indexName]
  );
  return Number(rows?.[0]?.cnt || 0) > 0;
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  let rest = digits;
  if (rest.startsWith('8')) rest = `7${rest.slice(1)}`;
  if (rest.length === 10) rest = `7${rest}`;
  if (rest.length !== 11 || !rest.startsWith('7')) return '';
  return `+7 (${rest.slice(1, 4)}) ${rest.slice(4, 7)}-${rest.slice(7, 9)}-${rest.slice(9, 11)}`;
}

async function ensureSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id INT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      picture VARCHAR(255) NOT NULL,
      price INT NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  if (await columnExists('products', 'availability')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN availability`);
  }
  if (await columnExists('products', 'warranty')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN warranty`);
  }
  if (await columnExists('products', 'service_area')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN service_area`);
  }
  if (await columnExists('products', 'service_life')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN service_life`);
  }
  if (await columnExists('products', 'description')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN description`);
  }
  if (await columnExists('products', 'created_at')) {
    await pool.execute(`ALTER TABLE products DROP COLUMN created_at`);
  }
  if (!(await columnExists('products', 'color'))) {
    await pool.execute(`ALTER TABLE products ADD COLUMN color ENUM('black','white','gray') NOT NULL DEFAULT 'white'`);
  }
  if (!(await columnExists('products', 'brand'))) {
    await pool.execute(
      `ALTER TABLE products ADD COLUMN brand ENUM('LG','Haier','Samsung','ELECTROLUX','Toshiba') NOT NULL DEFAULT 'Haier'`
    );
  }
  if (!(await columnExists('products', 'power'))) {
    await pool.execute(`ALTER TABLE products ADD COLUMN power VARCHAR(60) NOT NULL DEFAULT '2.6 кВт'`);
  }
  if (!(await columnExists('products', 'cooling'))) {
    await pool.execute(`ALTER TABLE products ADD COLUMN cooling VARCHAR(60) NOT NULL DEFAULT '2.6 кВт'`);
  }
  await pool.execute(`UPDATE products SET color = 'white' WHERE color IS NULL OR color = ''`);
  await pool.execute(`UPDATE products SET power = '2.6 кВт' WHERE power IS NULL OR power = ''`);
  await pool.execute(`UPDATE products SET cooling = '2.6 кВт' WHERE cooling IS NULL OR cooling = ''`);
  await pool.execute(`
    UPDATE products
    SET cooling = CONCAT(ROUND(CAST(REPLACE(cooling, ' BTU', '') AS UNSIGNED) / 3412, 1), ' кВт')
    WHERE cooling LIKE '%BTU%'
  `);
  await pool.execute(`
    UPDATE products
    SET brand = CASE
      WHEN UPPER(name) LIKE 'LG%' THEN 'LG'
      WHEN UPPER(name) LIKE 'HAIER%' THEN 'Haier'
      WHEN UPPER(name) LIKE 'SAMSUNG%' THEN 'Samsung'
      WHEN UPPER(name) LIKE 'ELECTROLUX%' THEN 'ELECTROLUX'
      WHEN UPPER(name) LIKE 'TOSHIBA%' THEN 'Toshiba'
      ELSE brand
    END
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT NOT NULL AUTO_INCREMENT,
      product_id INT NOT NULL,
      author_name VARCHAR(120) NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      review_text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_reviews_product_id (product_id),
      INDEX idx_reviews_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  if (!(await columnExists('reviews', 'product_id'))) {
    await pool.execute(`ALTER TABLE reviews ADD COLUMN product_id INT NOT NULL DEFAULT 0`);
    await pool.execute(`UPDATE reviews SET product_id = 0 WHERE product_id IS NULL`);
  }
  if (await columnExists('reviews', 'updated_at')) {
    await pool.execute(`ALTER TABLE reviews DROP COLUMN updated_at`);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS klient (
      id INT NOT NULL AUTO_INCREMENT,
      first_name VARCHAR(120) NOT NULL,
      name VARCHAR(120) NULL,
      last_name VARCHAR(120) NOT NULL,
      age DATE NOT NULL,
      phone_number VARCHAR(40) NOT NULL,
      email VARCHAR(190) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_klient_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [usersRows] = await pool.execute(`SELECT id, phone_number FROM klient ORDER BY id ASC`);
  const keepByPhoneDigits = new Map();
  const duplicateIds = [];

  for (const row of usersRows) {
    const normalizedPhone = normalizePhone(row.phone_number);
    if (!normalizedPhone) continue;
    if (String(row.phone_number || '') !== normalizedPhone) {
      await pool.execute(`UPDATE klient SET phone_number = ? WHERE id = ?`, [normalizedPhone, row.id]);
    }
    const digits = normalizedPhone.replace(/\D/g, '');
    if (keepByPhoneDigits.has(digits)) {
      duplicateIds.push(row.id);
      continue;
    }
    keepByPhoneDigits.set(digits, row.id);
  }

  if (duplicateIds.length) {
    const placeholders = duplicateIds.map(() => '?').join(',');
    await pool.execute(`DELETE FROM klient WHERE id IN (${placeholders})`, duplicateIds);
  }
  if (!(await indexExists('klient', 'uq_klient_phone_number'))) {
    await pool.execute(`ALTER TABLE klient ADD UNIQUE KEY uq_klient_phone_number (phone_number)`);
  }

  await pool.execute(`DROP TABLE IF EXISTS klient_sessions`);
  await pool.execute(`DROP TABLE IF EXISTS user_sessions`);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      items_json LONGTEXT NOT NULL,
      total_price INT NOT NULL,
      status ENUM('new','processing','completed','cancelled') NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_orders_user_id (user_id),
      INDEX idx_orders_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  await pool.execute(`
    ALTER TABLE orders
    MODIFY COLUMN status ENUM('new','processing','completed','cancelled') NOT NULL DEFAULT 'new'
  `);
}

module.exports = ensureSchema;
