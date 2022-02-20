var express = require('express');
var router = express.Router();

const user_controller = require('../controllers/user.controller');

/* Create User. */
router.post('/register', user_controller.register);

/* User Login. */
router.post('/', user_controller.login);

module.exports = router;