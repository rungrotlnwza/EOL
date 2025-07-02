const UserModel = require('../models/User.model');
const ImageUtils = require('../models/ImageUtils');

module.exports = async (req, res) => {
    try {
        // ดึง payload จาก middleware
        const payload = req.jwtPayload;
        if (!payload || !payload.id) {
            return res.status(401).json({
                message: 'Token ไม่ถูกต้อง: ไม่พบ user ID',
                status: 'error'
            });
        }

        console.log('[updateUserProfile] User ID:', payload.id, 'updating profile...');

        // รับข้อมูลที่ต้องการอัปเดต
        const { first_name, last_name, email, phone, gender, date_of_birth, education, address } = req.body;

        const profileData = {
            first_name, last_name, email, phone, gender, date_of_birth, education, address
        };

        // ตรวจสอบความถูกต้องของข้อมูล
        const validation = UserModel.validateProfileData(profileData);
        if (!validation.isValid) {
            // ลบไฟล์ที่อัพโหลดมาถ้ามี error
            if (req.file) {
                ImageUtils.deleteUploadedFile(req.file.path);
            }

            return res.status(400).json({
                message: validation.errors[0], // แสดง error แรก
                errors: validation.errors,
                status: 'error'
            });
        }

        // จัดการรูปโปรไฟล์ถ้ามีการอัพโหลด
        let profileImageFilename = null;
        let oldImageName = null;

        if (req.file) {
            console.log('[updateUserProfile] Profile image uploaded:', req.file.filename);

            // ดึงชื่อรูปเก่า
            oldImageName = await UserModel.getCurrentProfileImage(payload.id);

            // จัดการไฟล์ที่อัพโหลด
            const uploadResult = ImageUtils.handleProfileImageUpload(req.file, oldImageName);

            if (!uploadResult.success) {
                return res.status(400).json({
                    message: uploadResult.error,
                    status: 'error'
                });
            }

            profileImageFilename = uploadResult.filename;
            console.log('[updateUserProfile] Image processing successful:', profileImageFilename);
        }

        // อัพเดตข้อมูลโปรไฟล์
        const updateResult = await UserModel.updateProfileWithImage(
            payload.id,
            profileData,
            profileImageFilename
        );

        if (!updateResult.success) {
            // ถ้าอัพเดตไม่สำเร็จ ลบรูปใหม่ที่อัพโหลดมา
            if (profileImageFilename) {
                ImageUtils.deleteImage(profileImageFilename);
            }

            return res.status(404).json({
                message: 'ไม่พบผู้ใช้หรือไม่สามารถอัพเดตได้',
                status: 'error'
            });
        }

        console.log('[updateUserProfile] Update successful, affected rows:', updateResult.affectedRows);

        res.status(200).json({
            message: 'อัปเดตโปรไฟล์สำเร็จ',
            status: 'success',
            profile_image: profileImageFilename
        });

    } catch (err) {
        console.error('[updateUserProfile] Error:', err);

        // ถ้าเกิดข้อผิดพลาด ลบไฟล์ที่อัปโหลดมา
        if (req.file) {
            ImageUtils.deleteUploadedFile(req.file.path);
        }

        res.status(500).json({
            message: 'เกิดข้อผิดพลาดในระบบ',
            error: err.message,
            status: 'error'
        });
    }
};
