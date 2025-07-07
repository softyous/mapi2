const express = require('express');
const { classes } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

const classes_routes = express.Router();

// Create a new class
classes_routes.post('/add', verifyToken, isAdmin, async (req, res) => {
    try {
        const newClass = await classes.create(req.body);
        res.status(201).json(newClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all classes
classes_routes.get('/', verifyToken, async (req, res) => {
    try {
        const classList = await classes.findAll();
        return res.json(classList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get a single class by ID
classes_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const classItem = await classes.findByPk(req.params.id);
        if (!classItem) return res.status(404).json({ message: 'Class not found' });
        res.json(classItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a class by ID
classes_routes.put('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const [updated] = await classes.update(req.body, {
            where: { class_id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Class not found' });
        const updatedClass = await classes.findByPk(req.params.id);
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a class by ID
classes_routes.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await classes.destroy({
            where: { class_id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Class not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = classes_routes;
