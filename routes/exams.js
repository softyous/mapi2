const express = require('express');
const { assessments, classes, subjects } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

const exam_routes = express.Router();

// Create a new assessment
exam_routes.post('/add', verifyToken, async (req, res) => {
    try {
        const assessment = await assessments.create(req.body);
        res.status(201).json(assessment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all assessments
exam_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const assessmentList = await assessments.findAll();
        res.json(assessmentList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single assessment by ID
exam_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const assessment = await assessments.findByPk(req.params.id, {
            include: [
                {
                    model: classes,
                    as: 'class',
                },
                {
                    model: subjects,
                    as: 'subject',
                }
            ]
        });
        if (!assessment) return res.status(404).json({ message: 'Exam not found' });
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get assessments of a class by ID
exam_routes.get('/class/:id', verifyToken, async (req, res) => {
    try {
        const class_id = req.params.id;
        const check_classes = await classes.findByPk(class_id);
        if (!check_classes) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const exams = await assessments.findAll({ where: { class_id: class_id } });
        if (exams.length === 0) {
            return res.status(404).json({ message: 'Exams not found' });
        }
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an assessment by ID
exam_routes.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const updated = await assessments.update(req.body, {
            where: { assessment_id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Assessment not found' });
        const updatedAssessment = await assessments.findByPk(req.params.id);
        res.json(updatedAssessment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an assessment by ID
exam_routes.delete('/remove/:id', verifyToken, async (req, res) => {
    try {
        const deleted = await assessments.destroy({
            where: { assessment_id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Assessment not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = exam_routes;