const validator = require('validator');
const mongoose = require('mongoose');
const PasswordHash = require('password-hash');

var Schema = mongoose.Schema;

const {
    ObjectId
} = Schema.Types;

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required.'],
        maxlength: [100, 'Name cannot be greater than 100 Characters']
    },
    username: {
        type: String,
        required: [true, 'Username is required.'],
        maxlength: [30, 'Username cannot be greater than 30 Characters'],
        unique: [true, 'Username must be unique']
    },
    email: {
        type: String,
        validate: {
            validator: function (v) {
                return validator.isEmail(v);
            },
            message: props => `${props.value} is not a valid email`
        },
        required: [true, 'Email is required.'],
        unique: [true, 'Email must be unique']
    },
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
    password: {
        type: String,
        validate: {
            validator: function (v) {
                return new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$').test(v);
            },
            message: props => `${props.value} is not a valid password`
        },
        required: [true, 'Password is required.']
    },
    type: {
        type: String,
        enum: ['DRIVER', 'USER'],
        required: [true, 'Type is required.']
    },
    phoneVerified: {
        type: Boolean,
        enum: ['false'],
        default: false
    },
    emailVerified: {
        type: Boolean,
        enum: ['false'],
        default: false
    },
    places: {
        type: Array
    },
    home: {
        type: ObjectId,
        ref: 'Place'
    },
    work: {
        type: ObjectId,
        ref: 'Place'
    }
});

userSchema.pre('save', function (next) {
    var user = this;

    // Hash Password
    user.password = PasswordHash.generate(user.password);
    next();
});

var User = (module.exports = mongoose.model('User', userSchema));

// Create User
module.exports.create = async (user) => {
    user = await user.save();
    return user;
}

// Find user by username, phone or email
module.exports.getByUsernamePhoneEmail = async (user) => {
    user = await User.findOne({
        $or: [{
            username: user.username
        }, {
            phone: user.phone
        }, {
            email: user.email
        }]
    });
    return user;
}

// Check User and Update
module.exports.verifyPhone = async (username) => {
    var user = await User.findOneAndUpdate({
        username: username
    }, {
        $set: {
            phoneVerified: true
        }
    }, {
        new: true
    });
    return user;
}