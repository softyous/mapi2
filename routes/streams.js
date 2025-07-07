const express = require('express');
const { streams } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

const stream_routes = express.Router();

// Create a new stream
stream_routes.post('/add', verifyToken, isAdmin, async (req, res) => {
    try {
        const newStream = await streams.create(req.body);
        res.status(201).json(newStream);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all streams
stream_routes.get('/', verifyToken, async (req, res) => {
    try {
        const streamList = await streams.findAll();
        res.json(streamList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single stream by ID
stream_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const streamItem = await streams.findByPk(req.params.id);
        if (!streamItem) return res.status(404).json({ message: 'Stream not found' });
        res.json(streamItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a stream by ID
stream_routes.put('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const stream_id = req.params.id;
        const check_stream = await streams.findByPk(stream_id);
        if (!check_stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        const updated = await streams.update(req.body, {
            where: { stream_id: req.params.id }
        });
        res.status(200).json({ status: 'Updated successfully', message: "Stream updated well.", updated});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a stream by ID
stream_routes.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await streams.destroy({
            where: { stream_id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Stream not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = stream_routes;
