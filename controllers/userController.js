const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { generateOTP } = require('../utils/otpUtils');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const photo = req.file;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if the photo was uploaded
        if (!photo) {
            return res.status(400).json({ message: 'Photo is required' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP(); // Generate OTP
        // const otp = '1234'; // Generate OTP
        const otpExpires = Date.now() + 1 * 60 * 1000; // 1 minute

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            photo: `/uploads/${photo.filename}`,
            isVerified: false,
            otp,
            otpExpires
        });

        // Save the user in the database
        await newUser.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 1 minute.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            return res.status(500).json({ message: 'Failed to send OTP email', error: emailError });
        }

        res.status(201).json({ message: 'User registered successfully. Please verify your email with the OTP sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.isOTPValid(otp)) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.clearOTP(); // Clear the OTP and its expiration
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in' });
        }

        // Generate JWT tokens
        const accessToken = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1d' });

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Send tokens as cookies
        res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 1000 }); // 1 hour
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }); // 1 day

        res.status(200).json({ message: 'Login successful', accessToken });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Refresh JWT token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' });
        }

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Generate new access token
            const accessToken = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Send the new access token as a cookie
            res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 1000 }); // 1 hour

            res.status(200).json({ message: 'Access token refreshed', accessToken });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Generate a new OTP and update expiration
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send new OTP via email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your New OTP Code',
            text: `Your new OTP code is ${otp}. It is valid for 10 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending new OTP email:', emailError);
            return res.status(500).json({ message: 'Failed to send new OTP email', error: emailError });
        }

        res.status(200).json({ message: 'A new OTP has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        // Remove refresh token from database
        await User.updateOne({ refreshToken }, { refreshToken: null });

        // Clear cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
