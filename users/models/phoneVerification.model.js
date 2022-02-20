const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let phoneverificationcodeSchema = new Schema({
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return new RegExp('^(?:(?:\\+|0{0,2})91(\\s*[\\-]\\s*)?|[0]?)?[789]\\d{9}$').test(v);
            },
            message: props => `${props.value} is not a valid phone number`
        },
        required: [true, 'Phone Number is required.'],
        unique: [true, 'Phone Number must be unique']
    },
    otp: {
        type: String,
        validate: {
            validator: function (v) {
                return new RegExp('^[0-9]{6}$').test(v);
            },
            message: props => `${props.value} is not a valid OTP`
        },
        required: [true, 'OTP is required.'],
        unique: [true, 'OTP must be unique']
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('PhoneVerificationCode', phoneverificationcodeSchema);

// Create Phone Verification Code
module.exports.create = async (verification_code) => {
    verification_code = await verification_code.save();
    return verification_code;
}