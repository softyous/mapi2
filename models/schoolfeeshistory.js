const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const schoolfeeshistory = sequelize.define('schoolfeeshistory', {
        history_id: {
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
        fees_amount: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                len: [0, 8]
            }
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'bank transfer', 'mobile money'),
            allowNull: false,
            defaultValue: 'cash'
        },
        fees_type: {
            type: DataTypes.ENUM('tution', 'uniform', 'other', 'discipline'),
            allowNull: true,
            defaultValue: 'tution'
        },
        payment_date: {
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

    schoolfeeshistory.belongsTo(sequelize.models.pupils, { foreignKey: 'pupil_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'pupil' });

    return schoolfeeshistory;
};