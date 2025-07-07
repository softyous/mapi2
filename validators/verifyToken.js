const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'Failure', message: 'No token provided' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ status: 'Failure', message: 'Unauthorized' });
        req.user = decoded;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Administrator') {
        return res.status(403).json({ status: 'Failure', message: 'Access denied' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };
