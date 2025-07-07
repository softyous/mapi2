const express = require('express');
const { auths } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');
const uploads = require('../func/single-file');
require('dotenv').config();
const email_path = require('../email_with_template.config');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

const crypto = require('crypto');
const { Op } = require('sequelize');

// Password encryption helper (adjust algorithm as needed)
function generateEncryptedPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Date helper
const now = new Date();
const date_format = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

const auth_routes = express();

auth_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await auths.findAll({ attributes: { exclude: ["password", "access_token", "refresh_token", "token"] } });

        return res.status(200).json({ status: 200, message: 'All users fetched successfully', data: users });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
});

auth_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const user_id = req.params.id;
        if (!user_id) {
            return res.status(400).json({ status: 400, message: "Missing required parameter" });
        }

        const get_user = await auths.findByPk(user_id, { attributes: { exclude: ["password", "access_token", "refresh_token", "token"] } });
        if (!get_user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        return res.status(200).json({ status: 200, message: 'User fetched successfully', data: get_user });
    } catch (error) {
        return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
    }
})

// Register
auth_routes.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });

        const existingUser = await auths.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ status: "Duplication", message: "Email already exists" });

        const encryptedPassword = generateEncryptedPassword(password);
        const token = Math.floor(Math.random() * 1000000).toString();

        await auths.create({ name, email, phone, password: encryptedPassword, token, role, status: 'inactive', created_at: date_format, updated_at: date_format });

        const emailSubject = 'Password Reset';
        const emailMessage =
            `You have been registered to Valley Side Academy Masajja Kikajjo Primary School as ${role}. Use this token to activate your account:\n\n` +
            `<h3>${token}</h3>\n` +
            `<p>Remember not to share this token with anyone as it could compromise your account.</p>\n\n` +
            ``;

        // Send the email using your email configuration
        await email_path.sendEmail(email, emailSubject, emailMessage);
        return res.status(200).json({ message: "User registered successfully. Please verify your account using the token sent to your email." });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Login
auth_routes.post('/login', async (req, res) => {
    try {
        const { identity, password } = req.body;

        if (!identity) return res.status(400).json({ status: "Bad request", message: "Missing required email or phone" });
        if (!password) return res.status(400).json({ status: "Bad request", message: "Invalid password" });

        // Find user by email or phone
        const user = await auths.findOne({ where: { [Op.or]: [{ email: identity }, { phone: identity }] } });

        if (!user) {
            return res.status(404).json({ status: 'Not Found', message: "User not found" });
        }

        if (generateEncryptedPassword(password) !== user.password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (user.status !== 'active') {
            const token = Math.floor(Math.random() * 1000000).toString();

            user.token = token;
            user.save();

            const emailSubject = 'Account Activation';
            const emailMessage =
                `Welcome to Valley Side Academy Masajja Kikajjo Primary School! Use this token to activate your account:\n\n` +
                `<h3>${token}</h3>\n` +
                `<p>Remember not to share this token with anyone as it could compromise your account.</p>\n\n` +
                ``;

            // Send the email using your email configuration
            await email_path.sendEmail(email, emailSubject, emailMessage);
            return res.status(400).json({ message: "Account not activated", email: user.email });
        }

        const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name }, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
        const user_data = { user_id: user.user_id, role: user.role, name: user.name, email: user.email, phone: user.phone }

        return res.status(200).json({ message: "Login successful", token, user_data });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Activate Account
auth_routes.post('/activate', async (req, res) => {
    try {
        const { identity, token } = req.body;
        if (!identity) return res.status(400).json({ status: "Bad request", message: "Missing required identitifier" });
        if (!token) return res.status(400).json({ status: "Bad request", message: "Missing required token" });

        const user = await auths.findOne({ where: { [Op.or]: [{ email: identity, token }, { phone: identity, token }] } });
        if (!user) return res.status(400).json({ message: "Invalid token or email" });

        user.status = 'active';
        user.token = null;
        await user.save();
        return res.status(200).json({ message: "Account activated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Activate Account
auth_routes.post('/resend_token', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ status: "Bad request", message: "Missing required email" });

        const user = await auths.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "Invalid email" });

        const token = Math.floor(Math.random() * 1000000).toString();
        user.token = token;
        await user.save();

        const emailSubject = 'Account Activation';
        const emailMessage =
            `Welcome to Valley Side Academy Masajja Kikajjo Primary School! Use this token to activate your account:\n\n` +
            `<h3>${token}</h3>\n` +
            `<p>Remember not to share this token with anyone as it could compromise your account.</p>\n\n` +
            ``;

        // Send the email using your email configuration
        await email_path.sendEmail(email, emailSubject, emailMessage);
        return res.status(200).json({ message: "Token sent successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Forgot Password
auth_routes.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await auths.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = Math.floor(Math.random() * 1000000).toString();
        user.token = token;
        await user.save();

        const emailSubject = 'Forgot Password';
        const emailMessage =
            `Valley Side Academy Masajja Kikajjo Primary School support has sent this token:\n\n` +
            `<h3>${token}</h3>\n\n` +
            `Use it to create a new password.\n` +
            `<p>Remember not to share this token with anyone as it could compromise your account.</p>\n\n` +
            ``;

        // Send the email using your email configuration
        await email_path.sendEmail(email, emailSubject, emailMessage);
        return res.status(200).json({ message: "Reset token sent to email" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Reset Password
auth_routes.post('/reset-password', async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await auths.findOne({ where: { email, token } });
        if (!user) return res.status(400).json({ message: "Invalid token or email" });

        user.password = await generateEncryptedPassword(newPassword);
        user.token = null;
        await user.save();
        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Delete Account
auth_routes.delete('/delete-account', verifyToken, isAdmin, async (req, res) => {
    try {
        await auths.destroy({ where: { user_id: req.user.user_id } });
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Delete user
auth_routes.delete('/remove/:user_id', verifyToken, isAdmin, async (req, res) => {
    try {
        await auths.destroy({ where: { user_id: req.params.user_id } });
        return res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Update Profile
auth_routes.put('/update-profile', verifyToken, async (req, res) => {
    try {
        const { name, phone, email, location, NIN, gender, specila_role, role } = req.body;
        const user = await auths.findByPk(req.user.user_id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.location = location || user.location;
        user.NIN = NIN || user.NIN;
        user.gender = gender || user.gender;
        user.role = role || user.role;
        user.specila_role = specila_role || user.specila_role;
        await user.save();
        return res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// update profile image
auth_routes.post('/profile_image/:user_id', verifyToken, uploads.single('profile_image'), async (req, res) => {
    try {
        const user = await auths.findByPk(req.params.user_id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        user.profile_image = imageUrl;
        await user.save();
        return res.status(200).json({ message: "Profile image updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

module.exports = auth_routes;
