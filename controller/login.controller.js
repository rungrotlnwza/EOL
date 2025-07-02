const UserModel = require('../models/User.model');

module.exports = async (req, res, next) => {
    try {
        // รับ username, password จาก req.decoded (middleware decodePublicKey.middleware.js)
        const { username, password } = req.decoded || {};

        // ตรวจสอบความถูกต้องของข้อมูล
        const validation = UserModel.validateLoginData({ username, password });
        if (!validation.isValid) {
            return res.status(400).json({
                message: validation.errors[0], // แสดง error แรก
                errors: validation.errors,
                status: 'error'
            });
        }

        // ยืนยันตัวตนผู้ใช้
        const authResult = await UserModel.authenticateUser(username, password);

        if (!authResult.success) {
            return res.status(401).json({
                message: authResult.message,
                status: 'error'
            });
        }

        // เตรียม payload สำหรับ sign JWT ใน middleware
        req.jwtPayload = {
            id: authResult.user.id,
            username: authResult.user.username,
            role: authResult.user.role
        };
        req.loginMessage = authResult.message;

        next();
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};

/*
ลำดับการทำงานของ login.controller.js (หลัง refactor)
1. รับข้อมูล username, password จาก req.decoded (middleware decodePublicKey.middleware.js)
2. ใช้ UserModel.validateLoginData() ตรวจสอบความถูกต้องของข้อมูล:
   - ข้อมูลครบถ้วน
   - รูปแบบและความยาวของข้อมูล
3. ใช้ UserModel.authenticateUser() ยืนยันตัวตนผู้ใช้:
   - ค้นหาผู้ใช้ใน tb_auth ด้วย username
   - ตรวจสอบรหัสผ่านด้วย bcrypt.compare
   - ส่งคืนข้อมูลผู้ใช้หากยืนยันตัวตนสำเร็จ
4. เตรียม JWT payload สำหรับ middleware ถัดไป
5. เรียก next() เพื่อส่งต่อไปยัง JWT signing middleware
6. หากเกิด error ใด ๆ ตอบกลับ error

ประโยชน์ของการแยก logic ไปยัง Model:
- Authentication logic แยกออกจาก HTTP handling
- สามารถ reuse authenticateUser() ในที่อื่นได้
- ง่ายต่อการทดสอบ authentication logic
- Controller มีหน้าที่เฉพาะ request/response handling
- Business logic มี structure ที่ชัดเจน
*/
