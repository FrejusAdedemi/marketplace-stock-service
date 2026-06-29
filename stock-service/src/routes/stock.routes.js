const express = require('express');

const router = express.Router();

const auth = require(
  '../middlewares/auth.middleware'
);

const role = require(
  '../middlewares/role.middleware'
);

const controller = require(
  '../controllers/stock.controller'
);

router.get(
  '/',
  auth,
  controller.getStocks
);

router.get(
  '/:store_id',
  auth,
  role('store_manager', 'admin'),
  controller.getStoreStocks
);

router.put(
  '/:store_id/products/:product_id',
  auth,
  role('store_manager', 'admin'),
  controller.updateStock
);

module.exports = router;