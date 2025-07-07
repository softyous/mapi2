const crypto = require('crypto');

// Password encryption helper (adjust algorithm as needed)
function generateEncryptedPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.export = generateEncryptedPassword;