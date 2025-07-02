const { publicKey } = require('../config/fskey');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const { publickey } = req.body;
    if (!publickey) {
        return res.status(400).json({
            message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            status: 'error'
        });
    }
    let decoded;
    try {
        // สำหรับ fake JWT format: RS256.base64payload.signature
        if (publickey.startsWith('RS256.')) {
            const parts = publickey.split('.');
            if (parts.length === 3) {
                const payloadBase64 = parts[1];
                const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
                decoded = JSON.parse(payloadJson);
            } else {
                throw new Error('Invalid fake JWT format');
            }
        } else {
            // ถ้าเป็น JWT จริง ให้ใช้ jwt.verify
            decoded = jwt.verify(publickey, publicKey, { algorithms: ['RS256'] });
        }
    } catch (err) {
        return res.status(400).json({
            message: 'publickey ไม่ถูกต้องหรือหมดอายุ',
            status: 'error'
        });
    }
    req.decoded = decoded;
    next();
};
