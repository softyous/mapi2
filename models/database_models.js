const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        define: {
            timestamps: true,
        },
        logging: false,
    }
);

const db_models = {};

db_models.Sequelize = Sequelize;
db_models.sequelize = sequelize;

// Import models
db_models.auths = require('./auths')(sequelize, Sequelize);
db_models.classes = require('./classes')(sequelize, Sequelize);
db_models.streams = require('./streams')(sequelize, Sequelize);
db_models.subjects = require('./subject')(sequelize, Sequelize);
db_models.pupils = require('./pupils')(sequelize, Sequelize);
db_models.attendences = require('./attendences')(sequelize, Sequelize);
db_models.pupil_attendees = require('./pupil_attendences')(sequelize, Sequelize);
db_models.pupil_classes = require('./pupil_class')(sequelize, Sequelize);
db_models.assessments = require('./exams')(sequelize, Sequelize);
db_models.performances = require('./performances')(sequelize, Sequelize);
db_models.pupil_parents = require('./pupil_parent')(sequelize, Sequelize);
db_models.subject_teacher = require('./subject_teacher')(sequelize, Sequelize);
db_models.school_fees = require('./schoolFees')(sequelize, Sequelize);
db_models.school_fees_history = require('./schoolfeeshistory')(sequelize, Sequelize);
db_models.notifications = require('./notifications')(sequelize, Sequelize);

module.exports = db_models;
