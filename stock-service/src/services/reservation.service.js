const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function reserveStock(items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reservationId = uuidv4();

    await client.query(
      `
      INSERT INTO reservations(id, status)
      VALUES($1, 'reserved')
      `,
      [reservationId]
    );

    for (const item of items) {
      const stockResult = await client.query(
        `
        SELECT *
        FROM stocks
        WHERE product_id = $1
        AND store_id = $2
        FOR UPDATE
        `,
        [item.product_id, item.store_id]
      );

      if (stockResult.rows.length === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      const stock = stockResult.rows[0];

      const available =
        stock.quantity - stock.reserved;

      if (available < item.quantity) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      await client.query(
        `
        UPDATE stocks
        SET reserved = reserved + $1,
            updated_at = NOW()
        WHERE product_id = $2
        AND store_id = $3
        `,
        [
          item.quantity,
          item.product_id,
          item.store_id
        ]
      );

      await client.query(
        `
        INSERT INTO reservation_items(
          id,
          reservation_id,
          product_id,
          store_id,
          quantity
        )
        VALUES(
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4
        )
        `,
        [
          reservationId,
          item.product_id,
          item.store_id,
          item.quantity
        ]
      );
    }

    await client.query('COMMIT');

    return reservationId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function confirmReservation(reservationId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const items = await client.query(
      `
      SELECT *
      FROM reservation_items
      WHERE reservation_id = $1
      `,
      [reservationId]
    );

    for (const item of items.rows) {
      await client.query(
        `
        UPDATE stocks
        SET
          quantity = quantity - $1,
          reserved = reserved - $1,
          updated_at = NOW()
        WHERE product_id = $2
        AND store_id = $3
        `,
        [
          item.quantity,
          item.product_id,
          item.store_id
        ]
      );
    }

    await client.query(
      `
      UPDATE reservations
      SET status = 'confirmed'
      WHERE id = $1
      `,
      [reservationId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function releaseReservation(reservationId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const items = await client.query(
      `
      SELECT *
      FROM reservation_items
      WHERE reservation_id = $1
      `,
      [reservationId]
    );

    for (const item of items.rows) {
      await client.query(
        `
        UPDATE stocks
        SET
          reserved = reserved - $1,
          updated_at = NOW()
        WHERE product_id = $2
        AND store_id = $3
        `,
        [
          item.quantity,
          item.product_id,
          item.store_id
        ]
      );
    }

    await client.query(
      `
      UPDATE reservations
      SET status = 'released'
      WHERE id = $1
      `,
      [reservationId]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  reserveStock,
  confirmReservation,
  releaseReservation
};