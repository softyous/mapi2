const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const pupil = sequelize.define('pupils', {
        pupil_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [3, 200]
            }
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
        profile_image: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2, 255]
            }
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: false,
        },
        special_role: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [3, 100]
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                len: [0, 7]
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
    }, {
        timestamps: false,
    });

    pupil.belongsTo(sequelize.models.classes, { foreignKey: 'class_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'class' });
    pupil.belongsTo(sequelize.models.streams, { foreignKey: 'stream_id', onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'stream' });

    return pupil;
};
