const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let tripSchema = new Schema({
    from_name: {
        type: String,
        required: [true, 'From Place Name is required.']
    },
    to_name: {
        type: String,
        required: [true, 'To Place Name is required.']
    },
    price: {
        type: mongoose.Types.Decimal128,
        required: [true, 'Longitude is required.']
    },
    driver_name: {
        type: String,
        required: [true, 'Driver Name is required.']
    },
    type: {
        type: String,
        enum: ["Auto", "Bike", "Premium Sedan", "Sedan", "Small", "XL"],
        required: [true, 'Type is required.']
    },
}, {
    timestamps: true
});

var Trip = (module.exports = mongoose.model('Trip', tripSchema));

// Create Trip
module.exports.create = async (trip) => {
    trip = await trip.save();
    return trip;
}

// Get Trip
module.exports.getTrip = async (id) => {
    var trip = await Trip.findById(id);
    return trip;
}

// Get Trip
module.exports.getTripByTrip = async (trip) => {
    trip = await Trip.findOne(trip);
    return trip;
}

// Update Trip
module.exports.updateTrip = async (trip) => {
    trip = await Trip.findByIdAndUpdate(trip._id, {
        $set: trip
    }, {
        new: true
    });
    return trip;
}