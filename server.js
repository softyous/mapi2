const express = require('express');
const cors = require('cors');
const bodyPaser = require('body-parser');
const path = require('path');
const db = require('./models/database_models');
const { sendEmail } = require('./email_with_template.config');
require('dotenv').config();

// PORT
const PORT = process.env.PORT || 4000;

const school = express();

school.use(cors());

school.use(bodyPaser.json());
school.use(bodyPaser.urlencoded({
    extended: true
}));

school.use(express.json());
school.use(express.urlencoded({ extended: true }));

// database syncs
db.sequelize.sync({ force: false }).then(() => {
    console.log('Database & tables created!');
});

// read the uploaded files in the uploads directory
school.use("/uploads/", express.static(path.join(__dirname, 'uploads')));

// routes
school.use('/welcome', (req, res) => {
    res.send(`School API`);
});

school.get('/send', async(req, res) => {
    try {
        await sendEmail('kiggundubrevin@gmail.com', "testing", "hi there")
        return res.status(200).json({ status: "Success", message: "Message sent" });
    } catch (e) {
        return res.status(200).json({ status: 'Error', error: 'Internal server error', message: e.message })
    }
})

school.use('/auths', require('./routes/auths'));
school.use('/subjects', require('./routes/subjects'));
school.use('/exams', require('./routes/exams'));
school.use('/classes', require('./routes/classes'));
school.use('/attendences', require('./routes/attendences'));
school.use('/streams', require('./routes/streams'));
school.use('/performances', require('./routes/performances'));
school.use('/pupils', require('./routes/pupils'));
school.use('/school_fees', require('./routes/schoolfees'));
school.use('/notifications', require('./routes/notifications'));
school.use('/stats', require('./routes/stats'));

school.listen(PORT, (err, res) => {
    if(err) return res.status(500).json({ status: 500, message: err });
    console.log(`Server is running on port ${PORT}`)
});
