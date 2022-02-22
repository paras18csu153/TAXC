const axios = require('axios');

const token_service_url = process.env.TOKEN_SERVICE_URL;

module.exports = async function (req, res, next) {
    // Get Username from body
    var username = req.body.username;

    // Data Validation
    if (!username) {
        return res.status(400).send({
            message: 'Username cannot be empty.'
        });
    }

    // Get Token From Header
    var token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({
            message: 'Unauthorized Access.'
        });
    }

    var req_body = {
        username: username
    };

    // Set Header
    axios.defaults.headers.common['authorization'] = token;

    // Token Genration
    var token_service = await axios.post(token_service_url + '/authorize', req_body).catch((err) => {
        return res.status(500).send({
            message: 'Internal Server Error.'
        });
    });

    if (token_service != undefined && token_service.status == 200) {
        req.body.user_id = token_service.data.user_id;
        next();
    } else {
        res.status(401).send({
            'message': 'Unauthorized Access.'
        });
    }
};