var express = require('express');
var router = express.Router();

const token_controller = require('../controllers/token.controller');

/* Create Token. */
router.post('/', token_controller.create);

module.exports = router;