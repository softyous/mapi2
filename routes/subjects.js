const express = require('express');
const { subjects, subject_teacher, auths, classes, streams } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

const subject_routes = express.Router();

// Create a new subject
subject_routes.post('/add', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        if(!name) {
            return res.status(400).json({ message: 'Subject name is required' });
        }

        const check_subject = await subjects.findOne({ where: { name: name } });
        if(check_subject) {
            return res.status(400).json({ message: 'Subject with the same name already exists' });
        }

        const subject = await subjects.create(req.body);
        res.status(201).json(subject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all subjects
subject_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const subjectList = await subjects.findAll();
        res.json(subjectList);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get subjects and teacher connections
subject_routes.get('/assignments', verifyToken, async (req, res) => {
    try {
        const subject_teachers = await subject_teacher.findAll({
            include: [
                {
                    model: subjects,
                    as: 'subject'
                },
                {
                    model: auths,
                    as: 'user'
                },
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        })

        return res.status(200).json(subject_teachers);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

// Get a single subject by ID
subject_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const subject = await subjects.findByPk(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found' });
        
        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a subject by ID
subject_routes.put('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const check_subject = await subjects.findByPk(id);
        if (!check_subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const updated = await subjects.update(req.body, {
            where: { subject_id: id }
        });
        
        res.status(200).json({ status: "Edited", message: "Subject edited successfully", updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a subject by ID
subject_routes.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await subjects.destroy({
            where: { subject_id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Subject not found' });
        res.status(204).json({ message: 'Subject deleted' });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// assign teachers to subjects
subject_routes.post('/assign_teacher', verifyToken, async (req, res) => {
    try {
        const { subject_id, user_id, stream_id, class_id } = req.body;
        if(!user_id || !stream_id || !class_id || !subject_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const subject_check = await subjects.findByPk(subject_id);
        if(!subject_check) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        const subject_class = await classes.findByPk(class_id);
        if(!subject_class) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const subject_stream = await streams.findByPk(stream_id);
        if(!subject_stream) {
            return res.status(404).json({ message: 'Stream not found' });
        }

        const subject_user = await auths.findByPk(user_id);
        if(!subject_user) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const check_assignment = await subject_teacher.findOne({ where: { user_id, subject_id, class_id, stream_id } });
        if(check_assignment) {
            return res.status(400).json({ message: 'Teacher already assigned' });
        }

        await subject_teacher.create({ subject_id, user_id, stream_id, class_id });
        return res.status(200).json({ message: 'Successfully assigned' });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// get teacher's subjects
subject_routes.get('/teacher/:teacher_id', async (req, res) => {
    try {
        const user_id = req.params.teacher_id;
        const getUser = await auths.findByPk(user_id);
        if(!getUser) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const getTeacherSubject = await subject_teacher.findAll({ where: { user_id }, include: [
            {
                model: subjects,
                as: 'subject'
            },
            {
                model: classes,
                as: 'class'
            },
            {
                model: streams,
                as: 'stream'
            }
        ] });

        res.json(getTeacherSubject);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
})

// delete assignments of teacher and subject
subject_routes.delete('/unassign_teacher/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await subject_teacher.findByPk(id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        await assignment.destroy();
        return res.status(204).json({ message: 'Assignment deleted' });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// remove assignment
subject_routes.delete('/remove_assignment/:connection_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { connection_id } = req.params;
        if(!connection_id) {
            return res.status(400).json({ message: "Missing required field" });
        }

        const assignment = await subject_teacher.findByPk(connection_id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        await assignment.destroy();
        return res.status(204).json({ message: 'Assignment deleted' });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// update assignment
subject_routes.put('/edit_assignment/:connection_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { connection_id } = req.params;
        if(!connection_id) {
            return res.status(400).json({ message: "Missing required field" });
        }

        const assignment = await subject_teacher.findByPk(connection_id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        const updated = await subject_teacher.update(req.body, {
            where: { connection_id }
        });
        
        res.status(200).json({ status: "Edited", message: "Assignment edited successfully", updated });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

module.exports = subject_routes;
