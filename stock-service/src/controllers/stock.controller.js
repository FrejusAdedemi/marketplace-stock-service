const stockService = require('../services/stock.service');
const pool = require('../config/db');

async function getStocks(req, res, next) {
  try {
    const { product_id, store_id } = req.query;

    const data = await stockService.getStocks(
      product_id,
      store_id
    );

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function getStoreStocks(req, res, next) {
  try {
    const { store_id } = req.params;

    if (req.user.role === 'store_manager') {
      const store = await pool.query(
        `
        SELECT *
        FROM stores
        WHERE id = $1
        AND manager_id = $2
        `,
        [store_id, req.user.sub]
      );

      if (store.rows.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé'
        });
      }
    }

    const data =
      await stockService.getStoreStocks(
        store_id
      );

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function updateStock(req, res, next) {
  try {
    const { store_id, product_id } = req.params;

    const { quantity } = req.body;

    if (req.user.role === 'store_manager') {
      const store = await pool.query(
        `
        SELECT *
        FROM stores
        WHERE id = $1
        AND manager_id = $2
        `,
        [store_id, req.user.sub]
      );

      if (store.rows.length === 0) {
        return res.status(403).json({
          error: 'Accès refusé'
        });
      }
    }

    const stock =
      await stockService.updateStock(
        store_id,
        product_id,
        quantity
      );

    res.json(stock);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({
        error: 'Ressource non trouvée'
      });
    }

    if (err.message === 'INVALID_QUANTITY') {
      return res.status(400).json({
        error: 'Données invalides'
      });
    }

    next(err);
  }
}

module.exports = {
  getStocks,
  getStoreStocks,
  updateStock
};