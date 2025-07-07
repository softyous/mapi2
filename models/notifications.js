const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const Notifications = sequelize.define('notifications', {
        notification_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        tick_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: true
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true
        },
        notification_type: {
            type: DataTypes.ENUM('contact', 'admission'),
            allowNull: false,
            defaultValue: 'contact'
        },
        file_url: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Notifications
}