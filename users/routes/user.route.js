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
router.post('/verifyMail/:verification_link', auth, user_controller.verifyMail);

/* Get My Profile. */
router.get('/:username', user_controller.getMyprofile);

/* Change Password. */
router.patch('/changePassword', auth, user_controller.changePassword);

/* User Logout. */
router.post('/logout', auth, user_controller.logout);

module.exports = router;