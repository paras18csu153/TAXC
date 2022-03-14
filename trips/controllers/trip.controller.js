const Trip = require('../models/trip.model');

// Create Trip
exports.createOrGet = async (req, res) => {
    // Convert request body to trip
    var trip = req.body;

    // Check if trip already exists
    try {
        var existing_trip = await Trip.getTripByTrip(trip);
        if (!!existing_trip) {
            return res.status(200).send(existing_trip);
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    trip = new Trip(trip);

    // Save Trip
    try {
        trip = await Trip.create(trip);
    } catch (err) {
        if (!!err.errors) {
            var errors = Object.values(err.errors);
            return res.status(400).send({
                message: errors[errors.length - 1].properties.message
            });
        } else {
            return res.status(500).send({
                message: 'Internal Server Error.'
            });
        }
    }

    return res.status(200).send(trip);
}

// Get Trip By Id
exports.getById = async (req, res) => {
    // Convert request body to trip
    var trip_id = req.params['id'];

    if (!!!trip_id) {
        return res.status(400).send({
            message: 'Trip ID is required'
        });
    }

    // Check if trip doesn't exist
    try {
        var existing_trip = await Trip.getTrip(trip_id);
        if (!!!existing_trip) {
            return res.status(404).send({
                message: 'Trip not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_trip);
}

// Update Trip By Id
exports.update = async (req, res) => {
    // Convert request body to trip
    var trip_id = req.params['id'];

    if (!!!trip_id) {
        return res.status(400).send({
            message: 'Trip ID is required'
        });
    }

    // Check if trip doesn't exist
    try {
        var existing_trip = await Trip.getTrip(trip_id);
        if (!!!existing_trip) {
            return res.status(404).send({
                message: 'Trip not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    if (!!!req.body.from_name && !!!req.body.to_name && !!!req.body.price && !!!req.body.driver_name) {
        return res.status(409).send({
            message: 'Already Up to Date.'
        });
    }

    if (!!req.body.from_name) {
        existing_trip.from_name = req.body.from_name;
    }

    if (!!req.body.to_name) {
        existing_trip.to_name = req.body.to_name;
    }

    if (!!req.body.price) {
        existing_trip.price = req.body.price;
    }

    if (!!req.body.driver_name) {
        existing_trip.driver_name = req.body.driver_name;
    }

    // Update Trip
    try {
        existing_trip = await Trip.updateTrip(existing_trip);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_trip);
}