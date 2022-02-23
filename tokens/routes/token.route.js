var express = require('express');
var router = express.Router();

const token_controller = require('../controllers/token.controller');

/* Create Token. */
router.put('/', token_controller.create);

/* Authorize User. */
router.post('/', token_controller.authorize);

/* Delete User. */
router.delete('/', token_controller.delete);

module.exports = router;