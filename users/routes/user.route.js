var express = require('express');
var router = express.Router();

const user_controller = require('../controllers/user.controller');

/* Create User. */
router.post('/register', user_controller.register);

module.exports = router;