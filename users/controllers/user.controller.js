const axios = require('axios');
const PasswordHash = require('password-hash');

const MailVerification = require('../models/mailVerification.model');
const PhoneVerification = require('../models/phoneVerification.model');
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
        var existing_user = await User.getByUsernamePhoneEmail(user);
        if (!!existing_user) {
            if (existing_user.username == user.username) {
                return res.status(409).send({
                    message: 'Username already exists.'
                });
            } else if (existing_user.email == user.email) {
                return res.status(409).send({
                    message: 'Email already exists.'
                });
            } else {
                return res.status(409).send({
                    message: 'Phone already exists.'
                });
            }
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Save User
    try {
        user = await User.create(user);
    } catch (err) {
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
    var token_service = await axios.put(token_service_url, req_body).catch((err) => {
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

    // Check if user doesn't exist
    try {
        var existing_user = await User.getByUsernamePhoneEmail(user);
        if (!!!existing_user) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Check Login Credentials
    if (!PasswordHash.verify(user.password, existing_user.password)) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    if (!existing_user.phoneVerified) {
        // Send Verification Message
        try {
            sendOtpToPhone(existing_user);
        } catch (err) {
            return res.status(500).send({
                message: 'Internal Server Error.',
            });
        }
    }

    if (!existing_user.emailVerified) {
        // Send Verification Mail
        try {
            var host_url = req.protocol + '://' + req.get('host') + '/users';
            sendVerificationMail(host_url, existing_user);
        } catch (err) {
            return res.status(500).send({
                message: 'Internal Server Error.',
            });
        }
    }

    // Request for Token Service
    var req_body = {
        'secret': secret,
        'username': existing_user.username
    }

    // Hash Secret
    req_body.secret = hashString(req_body.secret);

    // Token Genration
    var token_service = await axios.put(token_service_url, req_body).catch((err) => {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    });

    var token = token_service.data.token;

    res.header('authorization', token);
    return res.status(200).send(existing_user);
}

// Verify Phone Number
exports.verifyPhone = async (req, res) => {
    var phone_verification_code = req.body;

    if (!phone_verification_code.otp) {
        return res.status(400).send({
            message: 'Username is required.'
        });
    }

    try {
        var existing_phone_verification_code = await PhoneVerification.getByOTP(phone_verification_code.otp);
        if (!!!existing_phone_verification_code) {
            return res.status(404).send({
                message: 'Invalid OTP.'
            });
        }

        if (Date.now() - existing_phone_verification_code.createdAt >= 600000) {
            return res.status(400).send({
                message: 'Invalid OTP.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.',
        });
    }

    var user = {
        username: phone_verification_code.username
    };

    // Check if user doesn't exist
    try {
        var existing_user = await User.getByUsernamePhoneEmail(user);
        if (!!!existing_user) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    if (existing_user.phoneVerified) {
        return res.status(409).send({
            message: 'User phone already verified.'
        });
    }

    if (existing_phone_verification_code.phone != existing_user.phone) {
        return res.status(400).send({
            message: 'Invalid OTP.'
        });
    }

    // Check User and Update
    try {
        var existing_user = await User.verifyPhone(phone_verification_code.username);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Delete Verification Code
    try {
        existing_phone_verification_code = await PhoneVerification.deleteAllByPhone(existing_phone_verification_code.phone);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_user);
}

// Verify Mail
exports.verifyMail = async (req, res) => {
    var mail_verification_code = req.params["verification_link"];

    try {
        var existing_mail_verification_code = await MailVerification.getByVerificationLink(mail_verification_code);
        if (!!!existing_mail_verification_code) {
            return res.status(404).send({
                message: 'Invalid Verification Link.'
            });
        }

        if (Date.now() - existing_mail_verification_code.createdAt >= 86400000) {
            return res.status(400).send({
                message: 'Invalid Verification Link.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.',
        });
    }

    var user = {
        username: req.body.username
    };

    // Check if user doesn't exist
    try {
        var existing_user = await User.getByUsernamePhoneEmail(user);
        if (!!!existing_user) {
            return res.status(404).send({
                message: 'User not found.'
            });
        }
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    if (existing_user.emailVerified) {
        return res.status(409).send({
            message: 'User email already verified.'
        });
    }

    if (existing_mail_verification_code.verification_link != hashString(req.body.username)) {
        return res.status(400).send({
            message: 'Invalid Verification Link.'
        });
    }

    // Check User and Update
    try {
        var existing_user = await User.verifyMail(req.body.username);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Delete Verification Code
    try {
        existing_mail_verification_code = await MailVerification.deleteAllByVerificationLink(existing_mail_verification_code);
    } catch (err) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    return res.status(200).send(existing_user);
}