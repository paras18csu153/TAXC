const User = require('../models/user.model');

const capitalizeFirstLetter = require('../helpers/capitalizeFirstLetter');

// Create User
exports.register = async (req, res) => {
    // Convert request body to user
    var user = new User(req.body);

    // Check if user already exists
    try {
        var existingUser = await User.getByUsernamePhoneEmail(user);
        if (!!existingUser) {
            if (existingUser.username == user.username) {
                return res.status(409).send({
                    message: 'Username already exists'
                });
            } else if (existingUser.email == user.email) {
                return res.status(409).send({
                    message: 'Email already exists'
                });
            } else {
                return res.status(409).send({
                    message: 'Phone already exists'
                });
            }
        }
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error'
        });
    }

    // Save User
    try {
        user = await User.create(user);
    } catch (e) {
        if (!!e.errors) {
            var errors = Object.values(e.errors);
            return res.status(400).send({
                message: errors[errors.length - 1].properties.message
            });
        } else {
            return res.status(500).send({
                message: 'Internal Server Error'
            });
        }
    }

    return res.status(200).send(user);
}