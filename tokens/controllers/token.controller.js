const Token = require('../models/token.model');

const hashString = require('../helpers/hashString');
const tokenGenerator = require('../helpers/tokenGenerator');
const tokenValidator = require('../helpers/tokenValidator');

const secret = process.env.SECRET;

// Create Token
exports.create = async (req, res) => {
    // Convert request body to token
    var token = req.body;

    if (!token.secret || hashString(secret) != token.secret) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    if (!token.username) {
        return res.status(400).send({
            message: 'Username is required.'
        });
    }

    var tokenBody = token;
    token = new Token(tokenBody);
    token.token = tokenGenerator(tokenBody.username, secret);

    // Validate Token
    try {
        validatedToken = await Token.validate(token);
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

    // Check if token already exists
    try {
        var existingToken = await Token.getTokenByUserId(token);
        if (!!existingToken) {
            existingToken.token = token.token;
            try {
                existingToken = await Token.updateTokenByUserId(existingToken);
            } catch (e) {
                return res.status(500).send({
                    message: 'Internal Server Error.'
                });
            }
            return res.status(200).send(existingToken);
        }
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    // Save Token
    try {
        token = await Token.create(token);
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

    return res.status(200).send(token);
}

// Authorize
exports.authorize = async (req, res) => {
    // Get Username from body
    var username = req.body.username;

    // Data Validation
    if (!username) {
        return res.status(400).send({
            message: 'Username cannot be empty.'
        });
    }

    var token = req.body;
    if (!token.secret || hashString(secret) != token.secret) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    // Get Token From Header
    token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    // Find Token By token
    try {
        var existingToken = await Token.getTokenByToken(token);
        if (!!!existingToken) {
            return res.status(401).send({
                message: 'Unauthorized Access.'
            });
        }
    } catch (e) {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    }

    var validatedToken = tokenValidator(existingToken.token, secret);

    if (!validatedToken) {
        return res.status(401).send({
            message: 'Unauthorized Access!!'
        });
    }

    if (validatedToken != username) {
        return res.status(401).send({
            message: 'Unauthorized Access!!'
        });
    }

    return res.status(200).send(existingToken);
}