const UserModel = require('../models/User.model');

module.exports = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: 'Bad Request: Missing request body',
                status: 'error'
            });
        }

        // รับ decoded จาก middleware
        const { username, password, confirm_password, email } = req.decoded || {};

        // ตรวจสอบความถูกต้องของข้อมูล
        const validation = UserModel.validateRegistrationData({
            username,
            password,
            confirm_password,
            email
        });

        if (!validation.isValid) {
            return res.status(400).json({
                message: validation.errors[0], // แสดง error แรก
                errors: validation.errors,
                status: 'error'
            });
        }

        // ตรวจสอบว่ามี username หรือ email ซ้ำหรือไม่
        const existingUsers = await UserModel.checkExistingUser(username, email);

        if (existingUsers.length > 0) {
            const conflictMessage = UserModel.generateConflictMessage(existingUsers);
            return res.status(400).json({
                message: conflictMessage,
                status: 'error'
            });
        }

        // สร้างผู้ใช้ใหม่
        const result = await UserModel.createUser({
            username,
            password,
            email
        });

        res.status(201).json({
            message: result.message,
            status: 'success',
            userId: result.userId
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};

/*
ลำดับการทำงานของ register.controller.js (หลัง refactor)
1. รับข้อมูล username, password, confirm_password, email จาก req.decoded
2. ใช้ UserModel.validateRegistrationData() ตรวจสอบความถูกต้องของข้อมูล:
   - ข้อมูลครบถ้วน
   - รหัสผ่านตรงกัน
   - ความยาวรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
   - รูปแบบ email
   - ความยาวและรูปแบบ username
3. ใช้ UserModel.checkExistingUser() ตรวจสอบ username และ email ซ้ำ
4. หากซ้ำ ใช้ UserModel.generateConflictMessage() สร้างข้อความ error
5. ใช้ UserModel.createUser() สร้างผู้ใช้ใหม่:
   - เริ่ม transaction
   - เข้ารหัส password ด้วย bcrypt
   - บันทึกข้อมูลลง tb_auth และ tb_detail
   - commit transaction
6. ตอบกลับ success พร้อม userId
7. หากเกิด error ใด ๆ จะ rollback transaction และตอบกลับ error

ประโยชน์ของการแยก logic ไปยัง Model:
- Code ใน Controller สั้นลงและอ่านง่าย
- Business logic แยกออกจาก HTTP handling
- สามารถ reuse Model methods ในที่อื่นได้
- ง่ายต่อการทดสอบ (unit testing)
- ปฏิบัติตาม MVC pattern ได้ดีขึ้น
*/
