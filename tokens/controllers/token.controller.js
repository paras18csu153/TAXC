const Token = require('../models/token.model');

const hashString = require('../helpers/hashString');
const tokenGenerator = require('../helpers/tokenGenerator');

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

    token = new Token(token);
    token.token = tokenGenerator(token.username, secret);

    // Validate Token
    try {
        tokenValidator = await Token.validate(token);
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
            existingToken = await Token.updateTokenByUserId(existingToken);
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