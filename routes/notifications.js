const express = require('express');
const { notifications } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');
const upload = require('../func/single-file')

const notification_route = express.Router();

// Helper function to generate an 8-character alphanumeric ticket number
const generateTicketNumber = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Create a new notification with file upload
notification_route.post('/share', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { name, email, phone, subject, message, notification_type } = req.body;

        const file_url = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

        const newNotification = await notifications.create({
            tick_number: generateTicketNumber(),
            name,
            email,
            phone,
            subject,
            message,
            file_url,
            notification_type: notification_type || 'contact'
        });

        res.status(201).json({ success: true, data: newNotification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating notification', error: error.message });
    }
});

// Get all notifications (Admin only)
notification_route.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const allNotifications = await notifications.findAll();
        res.status(200).json({ success: true, data: allNotifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
    }
});

// Get a single notification by ID
notification_route.get('/single/:id', verifyToken, async (req, res) => {
    try {
        const notification = await notifications.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching notification', error: error.message });
    }
});

// Update a notification
notification_route.put('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const notification = await notifications.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await notification.update(req.body);
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
    }
});

// Delete a notification
notification_route.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const notification = await notifications.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        await notification.destroy();
        res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting notification', error: error.message });
    }
});

module.exports = notification_route;
