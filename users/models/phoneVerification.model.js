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
        required: [true, 'Phone Number is required.']
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
    }
}, {
    timestamps: true
});

var PhoneVerification = (module.exports = mongoose.model('PhoneVerificationCode', phoneverificationcodeSchema));

// Create Phone Verification Code
module.exports.create = async (verification_code) => {
    verification_code = await verification_code.save();
    return verification_code;
}

// Get By OTP
module.exports.getByOTP = async (otp) => {
    var verification_code = await PhoneVerification.findOne({
        otp: otp
    });
    return verification_code;
}

// Delete By Id
module.exports.deleteAllByPhone = async (phone) => {
    var verification_code = await PhoneVerification.deleteMany({
        phone: phone
    });
    return verification_code;
}