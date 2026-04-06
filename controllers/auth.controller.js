// 1. controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const otpStore = {};
const verifiedEmails = {};


exports.register = async (req, res) => {
    try {
        const { name, email, password, role = 'both' } = req.body;

        if (!verifiedEmails[email]) {
            return res.status(403).json({ error: 'Email not verified' });
        }

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash, role });

        delete verifiedEmails[email];
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if email environment variables are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('Email service not configured: EMAIL_USER or EMAIL_PASS missing');
            return res.status(500).json({
                error: 'Email service temporarily unavailable',
                details: 'Server configuration incomplete'
            });
        }

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false });
        otpStore[email] = otp;

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'StudyBuddy Email Verification',
            text: `Your OTP is: ${otp}. This OTP will expire in 10 minutes.`
        };

        console.log("Sending OTP to:", email);
        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully to:", email);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error("Error sending OTP:", err.message);
        res.status(500).json({
            error: 'Failed to send OTP',
            details: process.env.NODE_ENV === 'development' ? err.message : 'Please try again later'
        });
    }

};

exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;
    console.log(email, otp);
    console.log(otpStore[email]);
    if (otpStore[email] == otp) {
        delete otpStore[email];
        verifiedEmails[email] = true;
        res.status(200).json({ message: 'Email verified' });
    } else {
        res.status(400).json({ error: 'Invalid OTP' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        console.log(user);
        console.log("password", password);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false });
        otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Password Reset',
            html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetVerifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ error: 'No OTP sent to this email' });
    if (record.expires < Date.now()) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    res.status(200).json({ message: 'OTP verified successfully' });
};

exports.resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        delete otpStore[email];

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

