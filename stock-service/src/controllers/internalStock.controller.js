const reservationService = require('../services/reservation.service');

async function reserve(req, res, next) {
  try {
    const { items } = req.body;

    const reservationId = await reservationService.reserveStock(items);

    res.json({
      reservation_id: reservationId,
      status: 'reserved'
    });
  } catch (err) {
    if (err.message === 'INSUFFICIENT_STOCK') {
      return res.status(409).json({
        error: 'Stock insuffisant'
      });
    }

    next(err);
  }
}

async function confirm(req, res, next) {
  try {
    const { reservation_id } = req.body;

    await reservationService.confirmReservation(reservation_id);

    res.json({
      status: 'confirmed'
    });
  } catch (err) {
    next(err);
  }
}

async function release(req, res, next) {
  try {
    const { reservation_id } = req.body;

    await reservationService.releaseReservation(reservation_id);

    res.json({
      status: 'released'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  reserve,
  confirm,
  release
};