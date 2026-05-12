const express = require('express');

const router = express.Router();

const internal = require(
  '../middlewares/internal.middleware'
);

const controller = require(
  '../controllers/internalStock.controller'
);

router.post(
  '/stocks/reserve',
  internal,
  controller.reserve
);

router.post(
  '/stocks/confirm',
  internal,
  controller.confirm
);

router.post(
  '/stocks/release',
  internal,
  controller.release
);

module.exports = router;