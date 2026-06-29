const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const swaggerUi = require(
  'swagger-ui-express'
);

const swaggerSpec = require(
  './docs/swagger'
);

const stockRoutes = require(
  './routes/stock.routes'
);

const internalRoutes = require(
  './routes/internal.routes'
);

const errorMiddleware = require(
  './middlewares/error.middleware'
);

const app = express();

app.use(helmet());

app.use(cors());

app.use(morgan('dev'));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/stocks', stockRoutes);

app.use('/internal', internalRoutes);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use(errorMiddleware);

module.exports = app;