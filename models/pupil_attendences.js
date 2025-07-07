const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attendences = sequelize.define('attendees', {
        attendee_id: {
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
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        attendence_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'attendences',
                key: 'attendence_id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        presence: {
            type: DataTypes.ENUM('present', 'absent with reason', 'absent'),
            allowNull: false,
            validate: {
                len: [4, 100]
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 200]
            }
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

    attendences.belongsTo(sequelize.models.pupils, { foreignKey: 'pupil_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'pupil' });
    attendences.belongsTo(sequelize.models.attendences, { foreignKey: 'attendence_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'attendence' });

    return attendences;
};
