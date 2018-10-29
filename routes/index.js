var express = require('express');
var router = express.Router();
var sql = require('../custom_modules/sqlCom')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
