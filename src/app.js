const express = require('express');
const fileRoutes = require('./routes/file.routes');
const cryptoRoutes = require('./routes/crypto.routes');

const app = express();

app.use(express.json());

app.use('/api', fileRoutes);
app.use('/api', cryptoRoutes);

module.exports = app;
