const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const classes = sequelize.define('classes', {
        class_id: {
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

    return classes;
};
