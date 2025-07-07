const multer = require('multer');
const path = require('path');

const fileNameMany  = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})

const destinationmoreimages = multer({storage: fileNameMany})

module.exports = destinationmoreimages;
