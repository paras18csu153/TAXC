var express = require('express');
var router = express.Router();

const auth = require('../middlewares/auth.middleware');
const trip_controller = require('../controllers/trip.controller');

/* Create Trip. */
router.post('/', auth, trip_controller.createOrGet);

/* Get Trip. */
router.get('/:id', trip_controller.getById);

/* Update Trip. */
router.patch('/:id', auth, trip_controller.update);

module.exports = router;