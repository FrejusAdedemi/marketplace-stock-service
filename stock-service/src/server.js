const app = require('./app');

const env = require('./config/env');

app.listen(env.PORT, () => {
  console.log(
    `Stock service running on port ${env.PORT}`
  );
});