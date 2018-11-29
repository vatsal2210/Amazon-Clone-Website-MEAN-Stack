const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    name: String,
    password: String,
    picture: String,
    isManager: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function (size) {
    console.log('Checking gravatar');
    if (!this.size) size = 200;
    if (!this.email) {
        return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
    } else {
        var md5 = crypto.createHash('md5').update(this.email).digest('hex');
        return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro';
    }
};

module.exports = mongoose.model('User', UserSchema);