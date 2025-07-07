const express = require('express');
const { classes, auths, attendences, performances, pupils, subjects, school_fees, subject_teacher, pupil_classes, assessments, pupil_parents, pupil_attendees } = require('../models/database_models');
const { verifyToken } = require('../validators/verifyToken');

const stat_routes = express.Router();

stat_routes.get('/fetch', verifyToken, async (req, res) => {
    try {
        const { user_id, role } = req.user;

        // Validate user exists
        const check_user = await auths.findByPk(user_id, {
            attributes: ['user_id'],
            raw: true
        });

        if (!check_user) {
            return res.status(404).json({
                status: "Not Found",
                message: "User not found"
            });
        }

        let final_stat = {};

        switch (role.toLowerCase()) {
            case 'administrator':
                const [admin_pupils, admin_teachers, admin_parents, admin_users, admin_subjects] = await Promise.all([
                    pupils.findAll({ 
                        attributes: ['pupil_id', 'name', 'gender']
                    }),
                    auths.findAll({
                        where: { role: 'teacher' },
                        attributes: ['user_id', 'name', 'email', 'phone']
                    }),
                    auths.findAll({
                        where: { role: 'parent' },
                        attributes: ['user_id', 'name', 'email', 'phone']
                    }),
                    auths.findAll({
                        attributes: ['user_id', 'name', 'email', 'role', 'created_at']
                    }),
                    subjects.findAll({
                        attributes: ['subject_id', 'name', 'created_at']
                    })
                ]);

                final_stat = {
                    pupils: admin_pupils,
                    teachers: admin_teachers,
                    parents: admin_parents,
                    users: admin_users,
                    subjects: admin_subjects
                };
                break;

            case 'teacher':
                const [teacher_classes, teacher_attendances, teacher_exams] = await Promise.all([
                    subject_teacher.findAll({
                        where: { user_id },
                        attributes: ['connection_id', 'class_id', 'subject_id']
                    }),
                    attendences.findAll({
                        where: { user_id },
                        attributes: ['attendence_id', 'date', 'class_id']
                    }),
                    assessments.findAll({
                        where: { user_id },
                        attributes: ['assessment_id', 'title', 'assesssment_type', 'created_at', 'class_id']
                    })
                ]);

                const filter_class_ids = teacher_classes.map(x => x.class_id);
                const teacher_pupils = await pupil_classes.findAll({
                    where: { class_id: filter_class_ids },
                    attributes: ['pupil_class_id', 'pupil_id', 'class_id'],
                    include: [{
                        model: pupils,
                        as: 'pupil',
                        attributes: ['pupil_id', 'name', 'gender']
                    }]
                });

                final_stat = {
                    pupils: teacher_pupils,
                    classes: teacher_classes,
                    attendences: teacher_attendances,
                    exams: teacher_exams
                };
                break;

            case 'parent':
                const parentPupils = await pupil_parents.findAll({
                    where: { user_id },
                    attributes: ['parent_id', 'pupil_id'],
                    include: [{
                        model: pupils,
                        as: 'pupil',
                        attributes: ['pupil_id', 'name', 'gender']
                    }]
                });

                const all_pupil_parent = parentPupils.map(x => x.pupil_id);

                const [parent_attendances, parent_classes, parent_exams] = await Promise.all([
                    pupil_attendees.findAll({
                        where: { pupil_id: all_pupil_parent },
                        attributes: ['attendence_id', 'created_at']
                    }),
                    pupil_classes.findAll({
                        where: { pupil_id: all_pupil_parent },
                        attributes: ['pupil_class_id', 'pupil_id', 'class_id']
                    }),
                    performances.findAll({
                        where: { pupil_id: all_pupil_parent },
                        attributes: ['performance_id', 'assessment_id', 'marks']
                    })
                ]);

                final_stat = {
                    pupils: parentPupils,
                    classes: parent_classes,
                    attendences: parent_attendances,
                    exams: parent_exams
                };
                break;

            default:
                return res.status(403).json({
                    status: "Forbidden",
                    message: "Unauthorized role"
                });
        }

        return res.status(200).json({
            status: "Success",
            message: "Stats fetched successfully",
            data: final_stat
        });

    } catch (error) {
        console.error('Error in /fetch endpoint:', error);
        return res.status(500).json({
            status: "Error",
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = stat_routes;