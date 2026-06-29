const env = require('../config/env');

module.exports = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];

  if (!secret || secret !== env.INTERNAL_SECRET) {
    return res.status(403).json({
      error: 'Accès refusé'
    });
  }

  next();
};