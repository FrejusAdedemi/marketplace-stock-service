const jwt = require('jsonwebtoken');
const env = require('../config/env');

module.exports = (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    const token = auth.split(' ')[1];

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }
};