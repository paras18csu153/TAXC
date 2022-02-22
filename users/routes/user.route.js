var express = require('express');
var router = express.Router();

const auth = require('../middlewares/auth.middleware');
const user_controller = require('../controllers/user.controller');

/* Create User. */
router.post('/register', user_controller.register);

/* User Login. */
router.post('/', user_controller.login);

/* Verify Phone. */
router.post('/verifyPhone', auth, user_controller.verifyPhone);

module.exports = router;