const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mon Application', subtitle: 'my super site' });
});

module.exports = router;