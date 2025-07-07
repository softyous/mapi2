const express = require('express');
const performance_routes = express();
const { performances, assessments, pupils, classes, streams, subjects, auths } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

// Create a new performance record
performance_routes.post('/add', verifyToken, async (req, res) => {
    try {
        const performance = await performances.create(req.body);
        res.status(201).json(performance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all performance records
performance_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const allPerformances = await performances.findAll();
        res.json(allPerformances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single performance record by ID
performance_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const performance = await performances.findByPk(req.params.id);
        if (!performance) {
            return res.status(404).json({ message: 'Performance not found' });
        }
        res.json(performance);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get the performances of an exam
performance_routes.get('/:exam_id/marks', verifyToken, async (req, res) => {
    try {
        const exam_id = req.params.exam_id;
        if (!exam_id) {
            return res.status(400).json({ message: 'Required parameter missing' });
        }

        const check_exam = await assessments.findByPk(exam_id);
        if (!check_exam) {
            return res.status(400).json({ message: 'Exam not found' });
        }

        const check_results = await performances.findAll({ where: { assessment_id: exam_id } })
        if (check_results.length > 0) {
            return res.status(200).json({ message: 'Results fetched successfully', results: check_results });
        } else {
            return res.status(404).json({ message: 'No results found' });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// Get performance record of a pupil by their ID, filtered by year and term
performance_routes.get('/pupil/:pupil_id', verifyToken, async (req, res) => {
    try {
        const { pupil_id } = req.params;
        const { year, term } = req.query;

        if (!pupil_id || !year || !term) {
            return res.status(400).json({ message: 'Required parameters missing' });
        }

        const check_pupil = await pupils.findByPk(pupil_id, {
            include: [
                {
                    model: classes,
                    as: 'class',
                },
                {
                    model: streams,
                    as: 'stream',
                }
            ]
        });
        if (!check_pupil) {
            return res.status(404).json({ message: 'Pupil not found' });
        }

        const check_results = await performances.findAll({
            where: { pupil_id },
            include: [
                {
                    model: assessments,
                    as: 'assessment',
                    where: {
                        year,
                        term
                    },
                    include: [
                        {
                            model: subjects,
                            as: 'subject'
                        },
                        {
                            model: auths,
                            as: 'user'
                        }
                    ]
                }
            ]
        });

        if (check_results.length > 0) {
            return res.status(200).json({
                message: 'Results fetched successfully',
                results: check_results,
                pupil: check_pupil
            });
        } else {
            return res.status(200).json({ message: 'No results found', results: check_results, pupil: check_pupil });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

performance_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const performance = await performances.findByPk(req.params.id);
        if (!performance) {
            return res.status(404).json({ message: 'Performance not found' });
        }
        res.json(performance);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update a performance record by ID
performance_routes.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const performance = await performances.findByPk(req.params.id);
        if (!performance) {
            return res.status(404).json({ message: 'Performance not found' });
        }
        await performance.update(req.body);
        res.json(performance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a performance record by ID
performance_routes.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const performance = await performances.findByPk(req.params.id);
        if (!performance) {
            return res.status(404).json({ message: 'Performance not found' });
        }
        await performance.destroy();
        res.json({ message: 'Performance deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = performance_routes;
