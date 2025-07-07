const express = require('express');
const { attendences, pupil_attendees, streams, pupils } = require('../models/database_models');
const attendence_routes = express.Router();
const { verifyToken, isAdmin } = require('../validators/verifyToken');

// Create Attendance Record
attendence_routes.post('/add', verifyToken, async (req, res) => {
    const { class_id, stream_id, presence, area, attendees } = req.body;

    if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        return res.status(400).json({ error: 'Attendees array is required' });
    }

    if (req.user.role === 'Parent') {
        return res.status(403).json({ error: 'Access denied, Not allowed to make attendance schedules' });
    }

    const user_id = req.user.user_id;

    try {
        const date_form = new Date();
        const date = `${date_form.getFullYear()}-${date_form.getMonth() + 1}-${date_form.getDate()}`;
        const attendence = await attendences.create({
            class_id,
            stream_id,
            user_id,
            date,
            presence,
            area
        });

        const attendence_id = attendence.attendence_id;

        // Step 2: Create attendee records in bulk
        const attendeeRecords = attendees.map(({ pupil_id, presence, reason }) => ({
            pupil_id,
            attendence_id,
            presence,
            reason
        }));

        await pupil_attendees.bulkCreate(attendeeRecords);

        return res.status(201).json({ message: 'Attendance recorded successfully', attendence, attendees: attendeeRecords });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// Get All Attendance Records
attendence_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const all_attendences = await attendences.findAll();
        res.json(all_attendences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Attendance Record by ID
attendence_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const attendence = await attendences.findByPk(req.params.id);
        if (!attendence) return res.status(404).json({ error: 'Attendance record not found' });
        res.json(attendence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Attendance Record by Class ID
attendence_routes.get('/class/:id', verifyToken, async (req, res) => {
    try {
        const all_attendence = await attendences.findAll({
            where: { class_id: req.params.id }, include: [
                {
                    model: streams,
                    as: 'stream',
                },
            ]
        });
        if (all_attendence.length === 0) return res.status(404).json({ error: 'Attendance record not found' });
        res.json(all_attendence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Attendance Record of pupils by ID
attendence_routes.get('/details/:id', verifyToken, async (req, res) => {
    try {
        const attendence = await pupil_attendees.findAll({
            where: { attendence_id: req.params.id }, include: [
                {
                    model: pupils,
                    as: 'pupil',
                },
            ]
        });
        if (!attendence) return res.status(404).json({ error: 'Attendance record not found' });
        res.json(attendence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Attendance Record
attendence_routes.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const updated = await attendences.update(req.body, {
            where: { attendence_id: req.params.id }
        });
        if (updated[0] === 0) return res.status(404).json({ error: 'Attendance record not found' });
        res.json({ message: 'Attendance record updated successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete Attendance Record
attendence_routes.delete('/remove/:id', verifyToken, async (req, res) => {
    try {
        const deleted = await attendences.destroy({ where: { attendence_id: req.params.id } });
        if (!deleted) return res.status(404).json({ error: 'Attendance record not found' });
        res.json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = attendence_routes;
