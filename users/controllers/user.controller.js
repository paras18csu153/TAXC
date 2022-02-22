const axios = require('axios');
const PasswordHash = require('password-hash');

const User = require('../models/user.model');

const hashString = require('../helpers/hashString');
const sendOtpToPhone = require('../helpers/sendOTPToPhone');
const sendVerificationMail = require('../helpers/sendVerificationMail');

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

    // Send Verification Message
    try {
        sendOtpToPhone(user);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.',
        });
    }

    // Send Verification Mail
    try {
        var host_url = req.protocol + '://' + req.get('host') + '/users';
        sendVerificationMail(host_url, user);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.',
        });
    }

    // Request for Token Service
    var req_body = {
        'secret': secret,
        'username': user.username
    };

    // Hash Secret
    req_body.secret = hashString(req_body.secret);

    // Token Genration
    var token_service = await axios.post(token_service_url, req_body).catch((err) => {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    });

    var token = token_service.data.token;

    res.header('authorization', token);
    return res.status(200).send(user);
}

// User Login
exports.login = async (req, res) => {
    // Convert request body to user
    var user = req.body;

    // Data Validation
    if (!user.username) {
        return res.status(400).send({
            message: 'Username is required.'
        });
    }

    if (!user.password) {
        return res.status(400).send({
            message: 'Password is required.'
        });
    }

    // Check if user already exists
    try {
        var existingUser = await User.getByUsernamePhoneEmail(user);
        if (!!!existingUser) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Check Login Credentials
    if (!PasswordHash.verify(user.password, existingUser.password)) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    if (!existingUser.phoneVerified) {
        // Send Verification Message
        try {
            sendOtpToPhone(existingUser);
        } catch (err) {
            return res.status(500).send({
                message: 'Internal Server Error.',
            });
        }
    }

    if (!existingUser.emailVerified) {
        // Send Verification Mail
        try {
            var host_url = req.protocol + '://' + req.get('host') + '/users';
            sendVerificationMail(host_url, existingUser);
        } catch (err) {
            return res.status(500).send({
                message: 'Internal Server Error.',
            });
        }
    }

    // Request for Token Service
    var req_body = {
        'secret': secret,
        'username': existingUser.username
    }

    // Hash Secret
    req_body.secret = hashString(req_body.secret);

    // Token Genration
    var token_service = await axios.post(token_service_url, req_body).catch((err) => {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    });

    var token = token_service.data.token;

    res.header('authorization', token);
    return res.status(200).send(existingUser);
}

// Verify Phone Number
exports.verifyPhone = async (req, res) => {

}