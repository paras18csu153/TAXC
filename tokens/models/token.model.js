const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let tokenSchema = new Schema({
    token: {
        type: String,
        required: [true, 'Token is required.']
    }
});

var Token = (module.exports = mongoose.model('Token', tokenSchema));

// Create Token
module.exports.create = async (token) => {
    token = await token.save();
    return token;
}

// Find token by user_id
module.exports.getTokenByUserId = async (token) => {
    token = await Token.findOne({
        user_id: token.user_id
    });
    return token;
}

// Find token by token
module.exports.getTokenByToken = async (token) => {
    token = await Token.findOne({
        token: token
    });
    return token;
}

// Update token by user_id
module.exports.updateTokenByUserId = async (token) => {
    token = await Token.findByIdAndUpdate(token._id, {
        $set: token
    }, {
        new: true
    });
    return token;
}

// Delete token by Token
module.exports.deleteByToken = async (tokenName) => {
    token = await Token.findOneAndDelete({
        token: tokenName,
    });
    return token;
};