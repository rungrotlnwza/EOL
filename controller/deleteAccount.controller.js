const UserModel = require('../models/User.model');

module.exports = async (req, res) => {
    try {
        // รับรหัสผ่านจาก body
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: 'กรุณากรอกรหัสผ่าน',
                status: 'error'
            });
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await UserModel.verifyCurrentPassword(req.jwtPayload.id, password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: 'รหัสผ่านไม่ถูกต้อง',
                status: 'error'
            });
        }

        // ลบบัญชีผู้ใช้
        const success = await UserModel.deleteUser(req.jwtPayload.id);
        if (!success) {
            return res.status(404).json({
                message: 'ไม่พบผู้ใช้',
                status: 'error'
            });
        }

        res.status(200).json({
            message: 'ลบบัญชีผู้ใช้สำเร็จ',
            status: 'success'
        });

    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};

/*
ตัวอย่างการใช้งาน (API Request):

POST /api/deleteAccount
Headers:
  Authorization: Bearer <jwt_token>
Body (JSON):
{
  "password": "รหัสผ่านของคุณ"
}

Response (สำเร็จ):
{
  "message": "ลบบัญชีผู้ใช้สำเร็จ",
  "status": "success"
}
*/
