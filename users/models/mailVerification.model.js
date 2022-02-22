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

var MailVerification = (module.exports = mongoose.model('MailVerificationCode', mailverificationcodeSchema));

// Create Phone Verification Code
module.exports.create = async (verification_code) => {
    verification_code = await verification_code.save();
    return verification_code;
}

// Find Verfication Link
module.exportsfindByVerificationLink = async (verification_link) => {
    verification_code = await MailVerification.findOne({
        verification_link: verification_link
    });
    return verification_code;
}