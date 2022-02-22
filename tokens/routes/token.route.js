var express = require('express');
var router = express.Router();

const token_controller = require('../controllers/token.controller');

/* Create Token. */
router.put('/', token_controller.create);

/* Authorize User. */
router.post('/authorize', token_controller.authorize);

module.exports = router;