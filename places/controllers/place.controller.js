const Place = require('../models/place.model');

// Create Place
exports.create = async (req, res) => {
    // Convert request body to place
    var place = req.body;

    // Check if place already exists
    try {
        var existing_place = await Place.getPlaceByPlace(place);
        if (!!existing_place) {
            return res.status(200).send(existing_place);
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    place = new Place(place);

    // Save Place
    try {
        place = await Place.create(place);
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

    return res.status(200).send(place);
}

// Get Place By Id
exports.getById = async (req, res) => {
    // Convert request body to place
    var place_id = req.params['id'];

    if (!!!place_id) {
        return res.status(400).send({
            message: 'Place ID is required'
        });
    }

    // Check if place doesn't exist
    try {
        var existing_place = await Place.getPlace(place_id);
        if (!!!existing_place) {
            return res.status(404).send({
                message: 'Place not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_place);
}

// Update Place By Id
exports.update = async (req, res) => {
    // Convert request body to place
    var place_id = req.params['id'];

    if (!!!place_id) {
        return res.status(400).send({
            message: 'Place ID is required'
        });
    }

    // Check if place doesn't exist
    try {
        var existing_place = await Place.getPlace(place_id);
        if (!!!existing_place) {
            return res.status(404).send({
                message: 'Place not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    if (!!!req.body.name && !!!req.body.latitude && !!!req.body.longitude) {
        return res.status(409).send({
            message: 'Already Up to Date.'
        });
    }

    if (!!req.body.name) {
        existing_place.name = req.body.name;
    }

    if (!!req.body.latitude) {
        existing_place.latitude = req.body.latitude;
    }

    if (!!req.body.longitude) {
        existing_place.longitude = req.body.longitude;
    }

    // Update Place
    try {
        existing_place = await Place.updatePlace(existing_place);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_place);
}