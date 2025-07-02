const jwt = require('jsonwebtoken');
const { privateKey } = require('../config/fskey');

module.exports = (req, res) => {
    const payload = req.jwtPayload;
    if (!payload) {
        return res.status(500).json({
            message: 'ไม่พบข้อมูลสำหรับสร้าง token',
            status: 'error'
        });
    }
    try {
        const token = jwt.sign(payload, privateKey, { expiresIn: '1d', algorithm: 'RS256' });
        res.status(200).json({
            message: req.loginMessage || 'Success',
            token,
            status: 'success'
        });
    } catch (err) {
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในการสร้าง token',
            error: err.message,
            status: 'error'
        });
    }
};
