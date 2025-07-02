const bcrypt = require('bcrypt');
const BaseModel = require('./Base.model');

class UserModel extends BaseModel {
    // ตรวจสอบว่า username หรือ email มีอยู่ในระบบแล้วหรือไม่
    // รับค่า: username (string), email (string)
    // คืนค่า: Promise ที่มี array ของ conflicts ที่พบ
    static async checkExistingUser(username, email) {
        const sql = `SELECT 'username' as type FROM tb_auth WHERE username = ?
                     UNION
                     SELECT 'email' as type FROM tb_detail WHERE email = ?`;

        return await this.query(sql, [username, email]);
    }

    // สร้างผู้ใช้ใหม่ในระบบ
    // รับค่า: userData (Object) - ข้อมูลผู้ใช้
    //   - userData.username (string)
    //   - userData.password (string) 
    //   - userData.email (string)
    // คืนค่า: Promise ที่มี Object ผลลัพธ์การสร้างผู้ใช้
    static async createUser({ username, password, email }) {
        return await this.transaction(async (conn) => {
            // เข้ารหัสรหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);

            // insert tb_auth
            const authResult = await this.executeQuery(conn,
                'INSERT INTO tb_auth (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );

            const userId = authResult.insertId;

            // insert tb_detail
            await this.executeQuery(conn,
                'INSERT INTO tb_detail (id, email) VALUES (?, ?)',
                [userId, email]
            );

            return {
                success: true,
                userId: userId,
                message: 'สมัครสมาชิกสำเร็จ'
            };
        });
    }

    // ตรวจสอบความถูกต้องของข้อมูลการสมัครสมาชิก
    // รับค่า: userData (Object) - ข้อมูลผู้ใช้
    //   - userData.username (string)
    //   - userData.password (string)
    //   - userData.confirm_password (string)
    //   - userData.email (string)
    // คืนค่า: Object ผลลัพธ์การตรวจสอบ
    static validateRegistrationData({ username, password, confirm_password, email }) {
        const errors = [];

        // ตรวจสอบข้อมูลครบถ้วน
        if (!username || !password || !confirm_password || !email) {
            errors.push('กรุณากรอกข้อมูลให้ครบถ้วน');
        }

        // ตรวจสอบรหัสผ่านตรงกัน
        if (password !== confirm_password) {
            errors.push('รหัสผ่านไม่ตรงกัน');
        }

        // ตรวจสอบความยาวรหัสผ่าน
        if (password && password.length < 6) {
            errors.push('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }

        // ตรวจสอบรูปแบบ email (อย่างง่าย)
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('รูปแบบ email ไม่ถูกต้อง');
        }

        // ตรวจสอบความยาว username
        if (username && (username.length < 3 || username.length > 20)) {
            errors.push('Username ต้องมีความยาว 3-20 ตัวอักษร');
        }

        // ตรวจสอบรูปแบบ username (อนุญาตเฉพาะ a-z, A-Z, 0-9, _, -)
        if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
            errors.push('Username สามารถใช้ได้เฉพาะตัวอักษรภาษาอังกฤษ ตัวเลข _ และ - เท่านั้น');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // สร้างข้อความ error สำหรับข้อมูลที่ซ้ำ
    // รับค่า: conflicts (Array) - array ของ conflicts ที่พบ
    // คืนค่า: string ข้อความ error
    static generateConflictMessage(conflicts) {
        if (conflicts.length === 0) {
            return 'ข้อมูลนี้ถูกใช้ไปแล้ว';
        }

        if (conflicts[0].type === 'username') {
            return 'Username นี้ถูกใช้ไปแล้ว';
        }

        if (conflicts[0].type === 'email') {
            return 'Email นี้ถูกใช้ไปแล้ว';
        }

        return 'ข้อมูลนี้ถูกใช้ไปแล้ว';
    }

    // ค้นหาผู้ใช้ด้วย username
    // รับค่า: username (string)
    // คืนค่า: Promise ที่มี Object ข้อมูลผู้ใช้ หรือ null ถ้าไม่พบ
    static async findByUsername(username) {
        const sql = `SELECT a.id, a.username, d.email, d.fname, d.lname, d.phone, d.image 
                     FROM tb_auth a 
                     LEFT JOIN tb_detail d ON a.id = d.id 
                     WHERE a.username = ?`;

        const result = await this.query(sql, [username]);
        return result.length > 0 ? result[0] : null;
    }

    // ค้นหาผู้ใช้ด้วย ID
    // รับค่า: id (number)
    // คืนค่า: Promise ที่มี Object ข้อมูลผู้ใช้ หรือ null ถ้าไม่พบ
    static async findById(id) {
        const sql = `SELECT a.id, a.username, d.email, d.fname, d.lname, d.phone, d.image 
                     FROM tb_auth a 
                     LEFT JOIN tb_detail d ON a.id = d.id 
                     WHERE a.id = ?`;

        const result = await this.query(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // อัพเดตข้อมูลผู้ใช้
    // รับค่า: id (number) - ID ผู้ใช้, userData (Object) - ข้อมูลที่จะอัพเดต
    // คืนค่า: Promise ที่มี boolean - true ถ้าสำเร็จ
    static async updateUser(id, userData) {
        const { email, fname, lname, phone, image } = userData;

        const sql = `UPDATE tb_detail 
                     SET email = ?, fname = ?, lname = ?, phone = ?, image = ? 
                     WHERE id = ?`;

        const result = await this.query(sql, [email, fname, lname, phone, image, id]);
        return result.affectedRows > 0;
    }

    // เปลี่ยนรหัสผ่าน
    // รับค่า: id (number) - ID ผู้ใช้, newPassword (string) - รหัสผ่านใหม่
    // คืนค่า: Promise ที่มี boolean - true ถ้าสำเร็จ
    static async changePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE tb_auth SET password = ? WHERE id = ?';

        const result = await this.query(sql, [hashedPassword, id]);
        return result.affectedRows > 0;
    }

    // ลบผู้ใช้
    // รับค่า: id (number) - ID ผู้ใช้
    // คืนค่า: Promise ที่มี boolean - true ถ้าสำเร็จ
    static async deleteUser(id) {
        return await this.transaction(async (conn) => {
            // ลบข้อมูลจาก tb_detail ก่อน
            await this.executeQuery(conn, 'DELETE FROM tb_detail WHERE id = ?', [id]);

            // ลบข้อมูลจาก tb_auth
            const result = await this.executeQuery(conn, 'DELETE FROM tb_auth WHERE id = ?', [id]);

            return result.affectedRows > 0;
        });
    }

    // ยืนยันตัวตนผู้ใช้ด้วย username และ password
    // รับค่า: username (string), password (string)
    // คืนค่า: Promise ที่มี Object ผลลัพธ์การยืนยันตัวตน
    static async authenticateUser(username, password) {
        if (!username || !password) {
            return {
                success: false,
                message: 'ข้อมูลไม่ครบถ้วน'
            };
        }

        // ค้นหาผู้ใช้ใน tb_auth
        const sql = 'SELECT id, username, password, role FROM tb_auth WHERE username = ?';
        const users = await this.query(sql, [username]);

        if (users.length === 0) {
            return {
                success: false,
                message: 'ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            };
        }

        const user = users[0];

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return {
                success: false,
                message: 'ไม่พบผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            };
        }

        return {
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            message: 'เข้าสู่ระบบสำเร็จ'
        };
    }

    // ตรวจสอบรหัสผ่านปัจจุบันของผู้ใช้
    // รับค่า: userId (number), currentPassword (string)
    // คืนค่า: Promise ที่มี boolean - true ถ้ารหัสผ่านถูกต้อง
    static async verifyCurrentPassword(userId, currentPassword) {
        const sql = 'SELECT password FROM tb_auth WHERE id = ?';
        const result = await this.query(sql, [userId]);

        if (result.length === 0) {
            return false;
        }

        return await bcrypt.compare(currentPassword, result[0].password);
    }

    // ตรวจสอบข้อมูลการเข้าสู่ระบบ
    // รับค่า: loginData (Object)
    //   - loginData.username (string)
    //   - loginData.password (string)
    // คืนค่า: Object ผลลัพธ์การตรวจสอบ
    static validateLoginData({ username, password }) {
        const errors = [];

        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            errors.push('กรุณากรอก Username');
        }

        if (!password || typeof password !== 'string' || password.length === 0) {
            errors.push('กรุณากรอกรหัสผ่าน');
        }

        // ตรวจสอบความยาว username
        if (username && username.trim().length > 20) {
            errors.push('Username ยาวเกินไป');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ดึงข้อมูลผู้ใช้แบบเต็มรูปแบบพร้อมรูปโปรไฟล์
    // รับค่า: id (number) - ID ผู้ใช้
    // คืนค่า: Promise ที่มี Object ข้อมูลผู้ใช้พร้อมรูปโปรไฟล์ หรือ null ถ้าไม่พบ
    static async getFullProfile(id) {
        const sql = `SELECT a.id, a.username, a.role, 
                            d.email, d.first_name, d.last_name, d.phone, 
                            d.gender, d.date_of_birth, d.education, d.address, d.profile_image
                     FROM tb_auth a
                     LEFT JOIN tb_detail d ON a.id = d.id
                     WHERE a.id = ?`;

        const result = await this.query(sql, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // อัพเดตรูปโปรไฟล์
    // รับค่า: id (number) - ID ผู้ใช้, imageName (string) - ชื่อไฟล์รูป
    // คืนค่า: Promise ที่มี boolean - true ถ้าสำเร็จ
    static async updateProfileImage(id, imageName) {
        const sql = 'UPDATE tb_detail SET profile_image = ? WHERE id = ?';
        const result = await this.query(sql, [imageName, id]);
        return result.affectedRows > 0;
    }

    // ลบรูปโปรไฟล์
    // รับค่า: id (number) - ID ผู้ใช้
    // คืนค่า: Promise ที่มี boolean - true ถ้าสำเร็จ
    static async removeProfileImage(id) {
        const sql = 'UPDATE tb_detail SET profile_image = NULL WHERE id = ?';
        const result = await this.query(sql, [id]);
        return result.affectedRows > 0;
    }

    // ตรวจสอบความถูกต้องของข้อมูลโปรไฟล์
    // รับค่า: profileData (Object) - ข้อมูลโปรไฟล์
    // คืนค่า: Object ผลลัพธ์การตรวจสอบ
    static validateProfileData(profileData) {
        const { first_name, last_name, email, phone, gender, date_of_birth, education, address } = profileData;
        const errors = [];

        // ตรวจสอบ email format
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('รูปแบบ email ไม่ถูกต้อง');
        }

        // ตรวจสอบ phone number (อนุญาตเฉพาะตัวเลขและ -, (, ), +, space)
        if (phone && !/^[\d\s\-\(\)\+]+$/.test(phone)) {
            errors.push('หมายเลขโทรศัพท์ไม่ถูกต้อง');
        }

        // ตรวจสอบ gender
        if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
            errors.push('เพศไม่ถูกต้อง');
        }

        // ตรวจสอบ date format (YYYY-MM-DD)
        if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
            errors.push('รูปแบบวันเกิดไม่ถูกต้อง (ต้องเป็น YYYY-MM-DD)');
        }

        // ตรวจสอบความยาวของข้อมูล
        if (first_name && first_name.length > 50) {
            errors.push('ชื่อจริงยาวเกินไป (สูงสุด 50 ตัวอักษร)');
        }

        if (last_name && last_name.length > 50) {
            errors.push('นามสกุลยาวเกินไป (สูงสุด 50 ตัวอักษร)');
        }

        if (education && education.length > 100) {
            errors.push('ข้อมูลการศึกษายาวเกินไป (สูงสุด 100 ตัวอักษร)');
        }

        if (address && address.length > 255) {
            errors.push('ที่อยู่ยาวเกินไป (สูงสุด 255 ตัวอักษร)');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ล้างข้อมูลโปรไฟล์ (แปลง empty string เป็น null)
    // รับค่า: profileData (Object) - ข้อมูลโปรไฟล์
    // คืนค่า: Object ข้อมูลที่ล้างแล้ว
    static cleanProfileData(profileData) {
        const { first_name, last_name, email, phone, gender, date_of_birth, education, address } = profileData;

        return {
            first_name: first_name && first_name.trim() !== '' ? first_name.trim() : null,
            last_name: last_name && last_name.trim() !== '' ? last_name.trim() : null,
            email: email && email.trim() !== '' ? email.trim() : null,
            phone: phone && phone.trim() !== '' ? phone.trim() : null,
            gender: gender && gender.trim() !== '' ? gender.trim() : null,
            date_of_birth: date_of_birth && date_of_birth.trim() !== '' ? date_of_birth.trim() : null,
            education: education && education.trim() !== '' ? education.trim() : null,
            address: address && address.trim() !== '' ? address.trim() : null
        };
    }

    // ดึงชื่อไฟล์รูปโปรไฟล์ปัจจุบัน
    // รับค่า: userId (number) - ID ผู้ใช้
    // คืนค่า: Promise ที่มี string ชื่อไฟล์รูป หรือ null ถ้าไม่มี
    static async getCurrentProfileImage(userId) {
        const sql = 'SELECT profile_image FROM tb_detail WHERE id = ?';
        const result = await this.query(sql, [userId]);

        return result.length > 0 ? result[0].profile_image : null;
    }

    // อัพเดตโปรไฟล์ผู้ใช้พร้อมรูปภาพ
    // รับค่า: userId (number) - ID ผู้ใช้
    //        profileData (Object) - ข้อมูลโปรไฟล์
    //        profileImageFilename (string หรือ null) - ชื่อไฟล์รูปใหม่ (ค่าเริ่มต้น = null)
    // คืนค่า: Promise ที่มี Object ผลลัพธ์การอัพเดต
    static async updateProfileWithImage(userId, profileData, profileImageFilename = null) {
        return await this.transaction(async (conn) => {
            // ล้างข้อมูลก่อน
            const cleanedData = this.cleanProfileData(profileData);

            // สร้าง SQL query ตามว่ามีรูปใหม่หรือไม่
            let sql, params;

            if (profileImageFilename) {
                sql = `UPDATE tb_detail 
                       SET first_name = ?, last_name = ?, email = ?, phone = ?, 
                           gender = ?, date_of_birth = ?, education = ?, address = ?, 
                           profile_image = ? 
                       WHERE id = ?`;
                params = [
                    cleanedData.first_name, cleanedData.last_name, cleanedData.email,
                    cleanedData.phone, cleanedData.gender, cleanedData.date_of_birth,
                    cleanedData.education, cleanedData.address, profileImageFilename, userId
                ];
            } else {
                sql = `UPDATE tb_detail 
                       SET first_name = ?, last_name = ?, email = ?, phone = ?, 
                           gender = ?, date_of_birth = ?, education = ?, address = ? 
                       WHERE id = ?`;
                params = [
                    cleanedData.first_name, cleanedData.last_name, cleanedData.email,
                    cleanedData.phone, cleanedData.gender, cleanedData.date_of_birth,
                    cleanedData.education, cleanedData.address, userId
                ];
            }

            const result = await this.executeQuery(conn, sql, params);

            return {
                success: result.affectedRows > 0,
                affectedRows: result.affectedRows,
                profileImageFilename: profileImageFilename
            };
        });
    }
}

module.exports = UserModel;
