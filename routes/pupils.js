const express = require('express');
const { pupils, classes, streams, auths, subject_teacher, pupil_parents, pupil_classes, school_fees_history, pupil_attendees, attendences } = require('../models/database_models');
const { verifyToken, isAdmin } = require('../validators/verifyToken');

const pupil_routes = express.Router();

// Create a new pupil
pupil_routes.post('/add', verifyToken, isAdmin, async (req, res) => {
    try {
        const pupil = await pupils.create(req.body);
        res.status(201).json(pupil);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all pupils
pupil_routes.get('/', verifyToken, async (req, res) => {
    try {
        const pupilList = await pupils.findAll({
            include: [
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        });
        return res.json(pupilList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get a single pupil by ID
pupil_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        const pupil = await pupils.findByPk(req.params.id, {
            include: [
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        });
        if (!pupil) return res.status(404).json({ message: 'Pupil not found' });
        return res.json(pupil);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Get pupils a teacher teachers
pupil_routes.get('/teacher/:teacher_id', verifyToken, async (req, res) => {
    try {
        if (!req.params.teacher_id) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        const teacher = await auths.findByPk(req.params.teacher_id);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const getTeacherClasses = await subject_teacher.findAll({ where: { user_id: req.params.teacher_id } });
        if (!getTeacherClasses) {
            return res.status(404).json({ message: 'No classes found for the teacher' });
        }

        const pupilList = await pupils.findAll({
            where: {
                class_id: getTeacherClasses.map(tc => tc.class_id)
            },
            include: [
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        });

        return res.json(pupilList);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// get pupils in a class based on class id
pupil_routes.get('/class/:class_id', verifyToken, async (req, res) => {
    try {
        if (!req.params.class_id) {
            return res.status(400).json({ message: 'Class ID is required' });
        }

        const pupilList = await pupils.findAll({
            where: {
                class_id: req.params.class_id
            },
            include: [
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        });

        return res.json({ pupilList, numbe_of_students: pupilList.length });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update a pupil by ID
pupil_routes.put('/edit/:id', verifyToken, async (req, res) => {
    try {
        const updated = await pupils.update(req.body, {
            where: { pupil_id: req.params.id }
        });
        if (!updated) return res.status(404).json({ message: 'Pupil not found' });
        const updatedPupil = await pupils.findByPk(req.params.id);
        return res.json(updatedPupil);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

// Delete a pupil by ID
pupil_routes.delete('/remove/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deleted = await pupils.destroy({
            where: { pupil_id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ message: 'Pupil not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// match pupil with parent
pupil_routes.post('/match/', async (req, res) => {
    try {
        const { user_id, pupil_id } = req.body;
        if (!pupil_id) {
            return res.status(400).json({ message: 'Pupil id missing' })
        }
        if (!user_id) {
            return res.status(400).json({ message: 'Parent id missing' })
        }

        const check_parent = await auths.findByPk(user_id);
        if (!check_parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const check_pupil = await pupils.findByPk(pupil_id);
        if (!check_pupil) {
            return res.status(404).json({ message: 'Pupil not found' });
        }

        const check_existence = await pupil_parents.findOne({ where: { pupil_id: pupil_id, user_id: user_id } });
        if (check_existence) {
            return res.status(400).json({ message: "Pupil already match with this parent" })
        }

        const match_the_two = await pupil_parents.create({ user_id, pupil_id });
        if (match_the_two) {
            return res.status(200).json({ message: 'Pupil given matched with their parent' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// get pupils of a parent
pupil_routes.get('/my_pupils/:parent_id', async (req, res) => {
    try {
        const user_id = req.params.parent_id;
        if (!user_id) {
            return res.status(400).json({ message: 'Parent id missing' })
        }

        const check_parent = await auths.findByPk(user_id);
        if (!check_parent) {
            return res.status(404).json({ message: 'Parent not found' });
        }

        const get_pupils = await pupil_parents.findAll({
            where: { user_id: user_id },
            include: [
                {
                    model: pupils,
                    as: 'pupil',
                    include: [{
                        model: streams,
                        as: 'stream'
                    },
                    {
                        model: classes,
                        as: 'class'
                    }]
                },
                {
                    model: auths,
                    as: 'parent'
                }
            ]
        });

        if (get_pupils.length > 0) {
            return res.status(200).json({ status: 200, message: "Your pupils fetched successfully", pupils: get_pupils })
        } else {
            return res.status(200).json({ status: 200, message: "Parent has not pupils yet", pupils: [] });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// remove pupil from their current parent
pupil_routes.delete('/remove_pupil/:connection_id', async (req, res) => {
    try {
        const connection_id = req.params.connection_id;
        if (!connection_id) {
            return res.status(400).json({ message: "Connection not provided" });
        }

        const check_connection = await pupil_parents.findByPk(connection_id);
        if (!check_connection) {
            return res.status(404).json({ message: "Pupil in this parent's children not found" });
        }

        await check_connection.destroy();
        return res.status(200).json({ message: "Pupil removed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// PUT /change_class/:pupil_id
pupil_routes.put('/change_class/:pupil_id', verifyToken, async (req, res) => {
    try {
        const { class_id, stream_id } = req.body;
        const { pupil_id } = req.params;

        if (!pupil_id || !class_id || !stream_id) {
            return res.status(400).json({ message: "Missing pupil_id, class_id or stream_id" });
        }

        const check_pupil = await pupils.findByPk(pupil_id);
        if (!check_pupil) {
            return res.status(404).json({ message: "Pupil not found" });
        }

        await pupils.update({ class_id, stream_id }, { where: { pupil_id } });

        await pupil_classes.create({ pupil_id, class_id, stream_id });

        return res.status(200).json({ message: "Class changed successfully" });
    } catch (error) {
        console.error("Error changing class:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

// GET /pupil_stats/:pupil_id
pupil_routes.get('/pupil_stats/:pupil_id', verifyToken, async (req, res) => {
    try {
        const { pupil_id } = req.params;
        if (!pupil_id) {
            return res.status(400).json({ message: "Missing pupil_id, please provide it" });
        }

        const check_pupil = await pupils.findByPk(pupil_id);
        if (!check_pupil) {
            return res.status(404).json({ message: "Pupil not found" });
        }

        // previous classes
        const previous_class = await pupil_classes.findAll({
            where: { pupil_id }, include: [
                {
                    model: classes,
                    as: 'class'
                },
                {
                    model: streams,
                    as: 'stream'
                }
            ]
        });

        // school fees history
        const schoolfeeshistory = await school_fees_history.findAll({
            where: { pupil_id }
        })

        // pupil's attendances
        const previous_attendances = await pupil_attendees.findAll({
            where: { pupil_id }, include: [
                {
                    model: attendences,
                    as: 'attendence',
                    include: [
                        {
                            model: classes,
                            as: 'class'
                        },
                        {
                            model: streams,
                            as: 'stream'
                        },
                        {
                            model: auths,
                            as: 'user'
                        }
                    ]
                }
            ]
        });

        // pupil's parent
        const all_parents = await pupil_parents.findAll({
            where: { pupil_id }, include: [
                {
                    model: auths,
                    as: 'parent'
                }
            ]
        });

        return res.status(200).json({ status: 'Success', message: 'Fetched successfully', data: { all_parents, previous_class,previous_attendances, schoolfeeshistory } })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
})

module.exports = pupil_routes;
