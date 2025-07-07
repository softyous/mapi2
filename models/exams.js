const { DataTypes } = require('sequelize');

const date = new Date()
const year = date.getFullYear();

module.exports = (sequelize) => {
    const assessments = sequelize.define('assessments', {
        assessment_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 200]
            }
        },
        year: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: year
        },
        term: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 20]
            }
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
        assesssment_type: {
            type: DataTypes.ENUM('Mid-term', 'End-term'),
            allowNull: false,
            defaultValue: 'Mid-term'
        },
        subject_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'subjects',
                key: 'subject_id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        class_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'classes',
                key: 'class_id',
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
    }, {
        timestamps: false,
    });

    assessments.belongsTo(sequelize.models.users, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'user' })
    assessments.belongsTo(sequelize.models.subjects, { foreignKey: 'subject_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'subject' })
    assessments.belongsTo(sequelize.models.classes, { foreignKey: 'class_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'class' })

    return assessments;
};
