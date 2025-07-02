const jwt = require('jsonwebtoken');
const { publicKey } = require('../config/fskey');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'ไม่ได้รับ token', status: 'error' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token ไม่ถูกต้อง', status: 'error' });
    }
    try {
        const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        req.jwtPayload = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ', status: 'error' });
    }
};
