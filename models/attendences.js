const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attendences = sequelize.define('attendences', {
        attendence_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
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
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        period: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2, 100]
            }
        },
        area: {
            type: DataTypes.STRING,
            allowNull: false,
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

    attendences.belongsTo(sequelize.models.users, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'user' });
    attendences.belongsTo(sequelize.models.classes, { foreignKey: 'class_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'class' });
    attendences.belongsTo(sequelize.models.streams, { foreignKey: 'stream_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'stream' });

    return attendences;
};
