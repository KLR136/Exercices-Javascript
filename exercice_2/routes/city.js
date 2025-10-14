const express = require('express');
const cityRouter = express.Router();

cityRouter.get('/city', function(req, res, next) {
  res.send('La ville est Paris');
});

module.exports = cityRouter;