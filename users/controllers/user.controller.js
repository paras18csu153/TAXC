const axios = require('axios');

const User = require('../models/user.model');

const capitalizeFirstLetter = require('../helpers/capitalizeFirstLetter');

const secret = process.env.SECRET;
const token_service_url = process.env.TOKEN_SERVICE_URL;

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
                    message: 'Username already exists.'
                });
            } else if (existingUser.email == user.email) {
                return res.status(409).send({
                    message: 'Email already exists.'
                });
            } else {
                return res.status(409).send({
                    message: 'Phone already exists.'
                });
            }
        }
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error.'
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
                message: 'Internal Server Error.'
            });
        }
    }

    var req_body = {
        'secret': secret,
        'username': user.username,
        'user_id': user._id
    }

    // Token Genration
    var token_service = await axios.post(token_service_url, req_body).catch((err) => {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    });

    var token = token_service.data.token;

    res.header('Authorization', token);
    return res.status(200).send(user);
}