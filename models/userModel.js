const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false, // Initially false until the user verifies their email
    },
    otp: {
        type: String,
        required: false, // OTP is only required during the verification process
    },
    otpExpires: {
        type: Date,
        required: false, // The expiry time of the OTP
    },
    roles: {
        type: [String],
        default: ['user'], // Default role is 'user'; can also be 'admin' or 'super admin'
    },
    refreshToken: {
        type: String,
        required: false, // Store the refresh token if you are implementing JWT refresh tokens
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Only hash the password if it's new or modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Instance method to validate OTP
userSchema.methods.isOTPValid = function (otp) {
    return this.otp === otp && this.otpExpires > Date.now();
};

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Clear OTP and its expiration after verification
userSchema.methods.clearOTP = function () {
    this.otp = undefined;
    this.otpExpires = undefined;
};

// Role checking method
userSchema.methods.hasRole = function (role) {
    return this.roles.includes(role);
};

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;
