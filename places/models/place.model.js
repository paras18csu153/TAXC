const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let placeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Place is required.']
    },
    latitude: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Latitude is required.']
    },
    longitude: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Longitude is required.']
    }
});

var Place = (module.exports = mongoose.model('Place', placeSchema));

// Create Place
module.exports.create = async (place) => {
    place = await place.save();
    return place;
}

// Get Place
module.exports.getPlace = async (id) => {
    var place = await Place.findById(id);
    return place;
}

// Update Place
module.exports.updatePlace = async (place) => {
    place = await Place.findByIdAndUpdate(place._id, {
        $set: place
    }, {
        new: true
    });
    return place;
}