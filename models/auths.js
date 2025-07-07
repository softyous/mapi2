const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const user = sequelize.define('users', {
        user_id: {
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
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isEmail: true,
                len: [3, 200]
            }
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
            validate: {
                isNumeric: true,
                len: [7, 15]
            }
        },
        profile_image: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [2, 255]
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [4, 200]
            }
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'inactive'
        },
        loggin_status: {
            type: DataTypes.ENUM('active', 'inactive'),
            allowNull: false,
            defaultValue: 'inactive'
        },
        role: {
            type: DataTypes.ENUM('Parent', 'Administrator', 'Teacher'),
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [3, 200]
            }
        },
        NIN: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [10, 20]
            }
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: true,
        },
        specila_role: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [3, 100]
            }
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 7]
            }
        },
        access_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: true,
        },
        refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true,
            unique: true,
        },
        last_login: {
            type: DataTypes.DATEONLY,
            allowNull: true
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

    return user;
};
