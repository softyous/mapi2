const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const teacher_subject = sequelize.define('teacher_subjects', {
        connection_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'user_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        class_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'classes',
                key: 'class_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        stream_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'streams',
                key: 'stream_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'subjects',
                key: 'subject_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        created_at: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        }
    },{
        timestamps: false,
    });

    teacher_subject.belongsTo(sequelize.models.users, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'user' });
    teacher_subject.belongsTo(sequelize.models.classes, { foreignKey: 'class_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'class' });
    teacher_subject.belongsTo(sequelize.models.streams, { foreignKey: 'stream_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'stream' });
    teacher_subject.belongsTo(sequelize.models.subjects, { foreignKey: 'subject_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'subject' });

    return teacher_subject;
};
