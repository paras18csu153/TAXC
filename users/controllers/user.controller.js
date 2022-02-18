const User = require('../models/user.model');

const capitalizeFirstLetter = require('../helpers/capitalizeFirstLetter');

// Create User
exports.register = async (req, res) => {
    // Convert request body to user
    var user = new User(req.body);

    // Save User
    try {
        user = await User.create(user);
    } catch (e) {
        if (!!e.errors) {
            var errors = Object.values(e.errors);
            return res.status(400).send({
                message: errors[errors.length - 1].properties.message
            });
        } else if (!!e.keyPattern) {
            var error = Object.keys(e.keyPattern);
            return res.status(400).send({
                message: capitalizeFirstLetter(error[0]) + ' already exists'
            });
        } else {
            return res.status(500).send({
                message: 'Internal Server Error'
            });
        }
    }

    return res.status(200).send(user);
}