const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let mailverificationcodeSchema = new Schema({
    verification_link: {
        type: String,
        required: [true, 'Verification Link is required.']
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('MailVerificationCode', mailverificationcodeSchema);

// Create Phone Verification Code
module.exports.create = async (verification_code) => {
    verification_code = await verification_code.save();
    return verification_code;
}