var express = require('express');
var router = express.Router();

const auth = require('../middlewares/auth.middleware');
const place_controller = require('../controllers/place.controller');

/* Create Place. */
router.post('/', auth, place_controller.createOrGet);

/* Get Place. */
router.get('/:id', place_controller.getById);

/* Update Place. */
router.patch('/:id', auth, place_controller.update);

module.exports = router;