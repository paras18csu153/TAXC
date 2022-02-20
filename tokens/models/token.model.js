const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const {
    ObjectId
} = Schema.Types;

let tokenSchema = new Schema({
    token: {
        type: String,
        required: [true, 'Token is required.']
    },
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: [true, 'User Id is required.']
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

// Update token by user_id
module.exports.updateTokenByUserId = async (token) => {
    token = await Token.findByIdAndUpdate(token._id, {
        $set: token
    }, {
        new: true
    });
    return token;
}