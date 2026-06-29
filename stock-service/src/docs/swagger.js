const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Service API',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3003'
      }
    ]
  },
  apis: []
};

module.exports = swaggerJsdoc(options);