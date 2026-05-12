const pool = require('../config/db');

async function getStocks(productId, storeId) {
  const result = await pool.query(
    `
    SELECT
      product_id,
      store_id,
      quantity - reserved AS available
    FROM stocks
    WHERE
      ($1::uuid IS NULL OR product_id = $1)
      AND
      ($2::uuid IS NULL OR store_id = $2)
    `,
    [productId || null, storeId || null]
  );

  return result.rows;
}

async function getStoreStocks(storeId) {
  const result = await pool.query(
    `
    SELECT
      product_id,
      quantity,
      reserved,
      quantity - reserved AS available
    FROM stocks
    WHERE store_id = $1
    `,
    [storeId]
  );

  return result.rows;
}

async function updateStock(storeId, productId, quantity) {
  const existing = await pool.query(
    `
    SELECT *
    FROM stocks
    WHERE store_id = $1
    AND product_id = $2
    `,
    [storeId, productId]
  );

  if (existing.rows.length === 0) {
    throw new Error('NOT_FOUND');
  }

  const stock = existing.rows[0];

  if (quantity < stock.reserved) {
    throw new Error('INVALID_QUANTITY');
  }

  const result = await pool.query(
    `
    UPDATE stocks
    SET quantity = $1,
        updated_at = NOW()
    WHERE store_id = $2
    AND product_id = $3
    RETURNING *,
    quantity - reserved AS available
    `,
    [quantity, storeId, productId]
  );

  return result.rows[0];
}

module.exports = {
  getStocks,
  getStoreStocks,
  updateStock
};