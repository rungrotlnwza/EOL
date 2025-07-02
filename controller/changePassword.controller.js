const UserModel = require('../models/User.model');

// ใช้ verifyJwt middleware แล้วใช้ req.jwtPayload
module.exports = async (req, res) => {
    try {
        // รับข้อมูลรหัสผ่านเดิมและใหม่
        const { old_password, new_password, confirm_password } = req.body;

        // ตรวจสอบข้อมูลครบถ้วน
        if (!old_password || !new_password || !confirm_password) {
            return res.status(400).json({
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                status: 'error'
            });
        }

        // ตรวจสอบรหัสผ่านใหม่ตรงกัน
        if (new_password !== confirm_password) {
            return res.status(400).json({
                message: 'รหัสผ่านใหม่ไม่ตรงกัน',
                status: 'error'
            });
        }

        // ตรวจสอบความยาวรหัสผ่านใหม่
        if (new_password.length < 6) {
            return res.status(400).json({
                message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
                status: 'error'
            });
        }

        // ตรวจสอบรหัสผ่านเดิม
        const isOldPasswordValid = await UserModel.verifyCurrentPassword(req.jwtPayload.id, old_password);
        if (!isOldPasswordValid) {
            return res.status(400).json({
                message: 'รหัสผ่านเดิมไม่ถูกต้อง',
                status: 'error'
            });
        }

        // เปลี่ยนรหัสผ่าน
        const success = await UserModel.changePassword(req.jwtPayload.id, new_password);
        if (!success) {
            return res.status(404).json({
                message: 'ไม่พบผู้ใช้',
                status: 'error'
            });
        }

        res.status(200).json({
            message: 'เปลี่ยนรหัสผ่านสำเร็จ',
            status: 'success'
        });

    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};
