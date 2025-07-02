const UserModel = require('../models/User.model');
const ImageUtils = require('../models/ImageUtils');

module.exports = async (req, res) => {
    try {
        // ดึง payload จาก middleware
        const payload = req.jwtPayload;
        if (!payload || !payload.id) {
            return res.status(401).json({
                message: 'Token ไม่ถูกต้อง',
                status: 'error'
            });
        }

        // ดึงข้อมูลผู้ใช้แบบเต็มรูปแบบ
        const profile = await UserModel.getFullProfile(payload.id);

        if (!profile) {
            return res.status(404).json({
                message: 'ไม่พบข้อมูลผู้ใช้',
                status: 'error'
            });
        }

        // แปลงรูปโปรไฟล์เป็น base64 ถ้ามี
        if (profile.profile_image) {
            profile.profile_image_data = ImageUtils.getImageAsBase64(profile.profile_image);
        } else {
            profile.profile_image_data = null;
        }

        res.status(200).json({
            message: 'ดึงข้อมูลโปรไฟล์สำเร็จ',
            profile: profile,
            status: 'success'
        });

    } catch (err) {
        console.error('Get user profile error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};