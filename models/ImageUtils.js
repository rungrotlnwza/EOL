const fs = require('fs');
const path = require('path');

// Utility class สำหรับจัดการไฟล์รูปภาพ
class ImageUtils {
    // อ่านไฟล์รูปภาพและแปลงเป็น base64
    // รับค่า: imageName (string) - ชื่อไฟล์รูป
    //        uploadDir (string) - โฟลเดอร์ที่เก็บรูป (ค่าเริ่มต้น: uploads/profiles)
    // คืนค่า: string base64 หรือ null ถ้าไม่พบไฟล์
    static getImageAsBase64(imageName, uploadDir = 'uploads/profiles') {
        if (!imageName) return null;

        try {
            const imagePath = path.join(__dirname, '..', uploadDir, imageName);

            if (!fs.existsSync(imagePath)) {
                return null;
            }

            const imageBuffer = fs.readFileSync(imagePath);
            const ext = path.extname(imageName).toLowerCase();
            const mimeType = this.getMimeType(ext);

            return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
        } catch (error) {
            console.error('Error reading image file:', error);
            return null;
        }
    }

    // รับ MIME type จาก file extension
    // รับค่า: extension (string) - file extension (เช่น '.jpg', '.png')
    // คืนค่า: string MIME type
    static getMimeType(extension) {
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.svg': 'image/svg+xml'
        };

        return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
    }

    // ตรวจสอบว่าไฟล์เป็นรูปภาพหรือไม่
    // รับค่า: filename (string) - ชื่อไฟล์
    // คืนค่า: boolean - true ถ้าเป็นรูปภาพ
    static isImageFile(filename) {
        if (!filename) return false;

        const ext = path.extname(filename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

        return allowedExtensions.includes(ext);
    }

    // ลบไฟล์รูปภาพ
    // รับค่า: imageName (string) - ชื่อไฟล์รูป
    //        uploadDir (string) - โฟลเดอร์ที่เก็บรูป
    // คืนค่า: boolean - true ถ้าลบสำเร็จ
    static deleteImage(imageName, uploadDir = 'uploads/profiles') {
        if (!imageName) return false;

        try {
            const imagePath = path.join(__dirname, '..', uploadDir, imageName);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error deleting image file:', error);
            return false;
        }
    }

    // สร้างชื่อไฟล์ที่ไม่ซ้ำ
    // รับค่า: originalName (string) - ชื่อไฟล์เดิม
    //        prefix (string) - prefix สำหรับชื่อไฟล์ (ค่าเริ่มต้น: 'profile')
    // คืนค่า: string ชื่อไฟล์ใหม่
    static generateUniqueFilename(originalName, prefix = 'profile') {
        const ext = path.extname(originalName);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);

        return `${prefix}_${timestamp}_${random}${ext}`;
    }

    // ตรวจสอบขนาดไฟล์
    // รับค่า: fileSize (number) - ขนาดไฟล์ในหน่วย bytes
    //        maxSize (number) - ขนาดสูงสุดที่อนุญาต (ค่าเริ่มต้น: 5MB)
    // คืนค่า: boolean - true ถ้าขนาดไฟล์อยู่ในเกณฑ์
    static isFileSizeValid(fileSize, maxSize = 5 * 1024 * 1024) {
        return fileSize <= maxSize;
    }

    // สร้างโฟลเดอร์หากยังไม่มี
    // รับค่า: dirPath (string) - path ของโฟลเดอร์
    // คืนค่า: boolean - true ถ้าสร้างสำเร็จหรือมีอยู่แล้ว
    static ensureDirectoryExists(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
            return true;
        } catch (error) {
            console.error('Error creating directory:', error);
            return false;
        }
    }

    // จัดการการอัพโหลดรูปโปรไฟล์
    // รับค่า: uploadedFile (Object) - ไฟล์ที่อัพโหลด (จาก multer)
    //        oldImageName (string) - ชื่อไฟล์รูปเก่า
    //        uploadDir (string) - โฟลเดอร์เก็บรูป
    // คืนค่า: Object ผลลัพธ์การจัดการไฟล์
    static handleProfileImageUpload(uploadedFile, oldImageName = null, uploadDir = 'uploads/profiles') {
        try {
            if (!uploadedFile) {
                return { success: false, error: 'ไม่พบไฟล์ที่อัพโหลด' };
            }

            // ตรวจสอบว่าเป็นไฟล์รูปหรือไม่
            if (!this.isImageFile(uploadedFile.filename)) {
                // ลบไฟล์ที่อัพโหลดมา
                this.deleteUploadedFile(uploadedFile.path);
                return { success: false, error: 'ไฟล์ต้องเป็นรูปภาพเท่านั้น' };
            }

            // ตรวจสอบขนาดไฟล์ (5MB)
            if (!this.isFileSizeValid(uploadedFile.size)) {
                this.deleteUploadedFile(uploadedFile.path);
                return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' };
            }

            // ลบรูปเก่าถ้ามี
            if (oldImageName) {
                this.deleteImage(oldImageName, uploadDir);
            }

            return {
                success: true,
                filename: uploadedFile.filename,
                originalName: uploadedFile.originalname,
                size: uploadedFile.size
            };

        } catch (error) {
            console.error('Error handling profile image upload:', error);

            // ลบไฟล์ที่อัพโหลดมาถ้าเกิด error
            if (uploadedFile && uploadedFile.path) {
                this.deleteUploadedFile(uploadedFile.path);
            }

            return { success: false, error: 'เกิดข้อผิดพลาดในการจัดการไฟล์' };
        }
    }

    // ลบไฟล์ที่อัพโหลดมา (cleanup on error)
    // รับค่า: filePath (string) - path ของไฟล์
    // คืนค่า: boolean - true ถ้าลบสำเร็จ
    static deleteUploadedFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('Uploaded file deleted:', filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting uploaded file:', error);
            return false;
        }
    }

    // ตรวจสอบและสร้างโฟลเดอร์อัพโหลด
    // รับค่า: uploadDir (string) - path ของโฟลเดอร์
    // คืนค่า: boolean - true ถ้าโฟลเดอร์พร้อมใช้งาน
    static prepareUploadDirectory(uploadDir = 'uploads/profiles') {
        const fullPath = path.join(__dirname, '..', uploadDir);
        return this.ensureDirectoryExists(fullPath);
    }

    // ทำความสะอาดไฟล์ในโฟลเดอร์ที่ไม่ได้ใช้
    // รับค่า: usedFiles (Array) - array ของชื่อไฟล์ที่ใช้งานอยู่
    //        uploadDir (string) - โฟลเดอร์ที่ต้องการทำความสะอาด
    // คืนค่า: number จำนวนไฟล์ที่ลบ
    static cleanupUnusedFiles(usedFiles = [], uploadDir = 'uploads/profiles') {
        try {
            const dirPath = path.join(__dirname, '..', uploadDir);

            if (!fs.existsSync(dirPath)) {
                return 0;
            }

            const allFiles = fs.readdirSync(dirPath);
            let deletedCount = 0;

            allFiles.forEach(filename => {
                // ข้าม hidden files และ directories
                if (filename.startsWith('.') || !this.isImageFile(filename)) {
                    return;
                }

                // ถ้าไฟล์ไม่อยู่ใน usedFiles ให้ลบทิ้ง
                if (!usedFiles.includes(filename)) {
                    const deleted = this.deleteImage(filename, uploadDir);
                    if (deleted) {
                        deletedCount++;
                        console.log('Unused file deleted:', filename);
                    }
                }
            });

            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up unused files:', error);
            return 0;
        }
    }
}

module.exports = ImageUtils;
