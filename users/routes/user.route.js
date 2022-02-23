var express = require('express');
var router = express.Router();

const auth = require('../middlewares/auth.middleware');
const user_controller = require('../controllers/user.controller');

/* Create User. */
router.post('/register', user_controller.register);

/* User Login. */
router.post('/', user_controller.login);

/* Verify Phone. */
router.patch('/verifyPhone', auth, user_controller.verifyPhone);

/* Verify Mail. */
router.patch('/verifyMail/:verification_link', auth, user_controller.verifyMail);

/* User Logout. */
router.post('/logout', auth, user_controller.logout);

module.exports = router;