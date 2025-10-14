const express = require('express');
const temperatureRouter = express.Router();

temperatureRouter.get('/temperature', function(req, res, next) {
  res.send('La température est de 20 degrés');
});

module.exports = temperatureRouter;