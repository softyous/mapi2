const { DataTypes } = require('sequelize');

const current_year = new Date().getFullYear();

module.exports = (sequelize) => {
    const pupil_classes = sequelize.define('pupil_classes', {
        pupil_class_id: {
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
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
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
        stream_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'streams',
                key: 'stream_id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        },
        year: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: current_year
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

    pupil_classes.belongsTo(sequelize.models.classes, { foreignKey: 'class_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'class' });
    pupil_classes.belongsTo(sequelize.models.pupils, { foreignKey: 'pupil_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'pupil' });
    pupil_classes.belongsTo(sequelize.models.streams, { foreignKey: 'stream_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'stream' });

    return pupil_classes;
};
