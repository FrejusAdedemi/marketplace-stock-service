require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3003,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  INTERNAL_SECRET: process.env.INTERNAL_SECRET,
  LOW_STOCK_THRESHOLD: parseInt(
    process.env.LOW_STOCK_THRESHOLD || '5'
  )
};