const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const performances = sequelize.define('performances', {
        performance_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        pupil_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'pupils',
                key: 'pupil_id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        assessment_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'assessments',
                key:'assessment_id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        marks: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        timestamps: false
    })

    performances.belongsTo(sequelize.models.pupils, { foreignKey: 'pupil_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'pupil' });
    performances.belongsTo(sequelize.models.assessments, { foreignKey: 'assessment_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'assessment' });

    return performances;
}