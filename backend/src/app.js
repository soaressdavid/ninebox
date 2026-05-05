const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.use('/api', routes);

app.use(errorHandler);

module.exports = app;