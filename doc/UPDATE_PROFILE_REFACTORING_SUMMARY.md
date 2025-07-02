# UPDATE USER PROFILE CONTROLLER REFACTORING SUMMARY

## การเปลี่ยนแปลงที่ทำ

### 1. ขยาย UserModel เพิ่มเติม
เพิ่ม methods ใหม่ใน `User.model.js` สำหรับการจัดการโปรไฟล์:

#### Profile Validation & Management:
- `validateProfileData(profileData)` - ตรวจสอบความถูกต้องของข้อมูลโปรไฟล์
- `cleanProfileData(profileData)` - ล้างข้อมูล (แปลง empty string เป็น null)
- `getCurrentProfileImage(userId)` - ดึงชื่อไฟล์รูปโปรไฟล์ปัจจุบัน
- `updateProfileWithImage(userId, profileData, profileImageFilename)` - อัพเดตโปรไฟล์พร้อมรูป

### 2. ขยาย ImageUtils เพิ่มเติม
เพิ่ม methods ใหม่ใน `ImageUtils.js` สำหรับการจัดการไฟล์อัพโหลด:

#### File Upload Management:
- `handleProfileImageUpload(uploadedFile, oldImageName, uploadDir)` - จัดการการอัพโหลดรูปโปรไฟล์
- `deleteUploadedFile(filePath)` - ลบไฟล์ที่อัพโหลดมา (cleanup on error)
- `prepareUploadDirectory(uploadDir)` - ตรวจสอบและสร้างโฟลเดอร์อัพโหลด
- `cleanupUnusedFiles(usedFiles, uploadDir)` - ทำความสะอาดไฟล์ที่ไม่ได้ใช้

### 3. updateUserProfile.controller.js Refactoring

#### ก่อนการแก้ไข (84 บรรทัด):
```javascript
// Manual data cleaning
const cleanedData = {
    first_name: first_name || null,
    last_name: last_name || null,
    email: email || null,
    phone: phone || null,
    gender: gender && gender.trim() !== '' ? gender : null,
    // ...
};

// Manual file handling
if (req.file) {
    profileImageFilename = req.file.filename;
    // Manual old file deletion
    const oldProfileResult = await query('SELECT profile_image FROM tb_detail WHERE id = ?', [payload.id]);
    if (oldProfileResult.length > 0 && oldProfileResult[0].profile_image) {
        const oldImagePath = path.join(__dirname, '../uploads/profiles', oldProfileResult[0].profile_image);
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }
}

// Manual SQL query building
if (profileImageFilename) {
    updateQuery = `UPDATE tb_detail SET first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?, date_of_birth = ?, education = ?, address = ?, profile_image = ? WHERE id = ?`;
    updateParams = [cleanedData.first_name, cleanedData.last_name, cleanedData.email, cleanedData.phone, cleanedData.gender, cleanedData.date_of_birth, cleanedData.education, cleanedData.address, profileImageFilename, payload.id];
} else {
    updateQuery = `UPDATE tb_detail SET first_name = ?, last_name = ?, email = ?, phone = ?, gender = ?, date_of_birth = ?, education = ?, address = ? WHERE id = ?`;
    updateParams = [cleanedData.first_name, cleanedData.last_name, cleanedData.email, cleanedData.phone, cleanedData.gender, cleanedData.date_of_birth, cleanedData.education, cleanedData.address, payload.id];
}

const result = await query(updateQuery, updateParams);
```

#### หลังการแก้ไข (78 บรรทัด):
```javascript
// ใช้ Model validation
const validation = UserModel.validateProfileData(profileData);
if (!validation.isValid) {
    // Error handling with automatic file cleanup
}

// ใช้ ImageUtils สำหรับจัดการไฟล์
if (req.file) {
    oldImageName = await UserModel.getCurrentProfileImage(payload.id);
    const uploadResult = ImageUtils.handleProfileImageUpload(req.file, oldImageName);
    
    if (!uploadResult.success) {
        return res.status(400).json({ message: uploadResult.error });
    }
    
    profileImageFilename = uploadResult.filename;
}

// ใช้ Model method สำหรับอัพเดต
const updateResult = await UserModel.updateProfileWithImage(
    payload.id, 
    profileData, 
    profileImageFilename
);
```

## ตัวอย่างการเปรียบเทียบ Features

### 1. Data Validation

#### ก่อน:
- ไม่มี validation ครอบคลุม
- แค่ล้างข้อมูลพื้นฐาน

#### หลัง:
```javascript
static validateProfileData(profileData) {
    const errors = [];
    
    // ตรวจสอบ email format
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('รูปแบบ email ไม่ถูกต้อง');
    }
    
    // ตรวจสอบ phone number
    if (phone && !/^[\d\s\-\(\)\+]+$/.test(phone)) {
        errors.push('หมายเลขโทรศัพท์ไม่ถูกต้อง');
    }
    
    // ตรวจสอบ date format
    if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
        errors.push('รูปแบบวันเกิดไม่ถูกต้อง');
    }
    
    // และอื่นๆ...
}
```

### 2. File Upload Handling

#### ก่อน:
- Manual file operations
- Limited error handling
- ไม่มี file validation

#### หลัง:
```javascript
static handleProfileImageUpload(uploadedFile, oldImageName, uploadDir) {
    // ตรวจสอบว่าเป็นไฟล์รูปหรือไม่
    if (!this.isImageFile(uploadedFile.filename)) {
        this.deleteUploadedFile(uploadedFile.path);
        return { success: false, error: 'ไฟล์ต้องเป็นรูปภาพเท่านั้น' };
    }

    // ตรวจสอบขนาดไฟล์
    if (!this.isFileSizeValid(uploadedFile.size)) {
        this.deleteUploadedFile(uploadedFile.path);
        return { success: false, error: 'ขนาดไฟล์ต้องไม่เกิน 5MB' };
    }

    // ลบรูปเก่าถ้ามี
    if (oldImageName) {
        this.deleteImage(oldImageName, uploadDir);
    }
    
    return { success: true, filename: uploadedFile.filename };
}
```

### 3. Database Operations

#### ก่อน:
- Manual SQL building
- ไม่มี transaction
- Duplicate code สำหรับ with/without image

#### หลัง:
```javascript
static async updateProfileWithImage(userId, profileData, profileImageFilename = null) {
    return await this.transaction(async (conn) => {
        const cleanedData = this.cleanProfileData(profileData);
        
        // Dynamic SQL building
        let sql, params;
        if (profileImageFilename) {
            sql = `UPDATE tb_detail SET ... profile_image = ? WHERE id = ?`;
            params = [...cleanedData, profileImageFilename, userId];
        } else {
            sql = `UPDATE tb_detail SET ... WHERE id = ?`;
            params = [...cleanedData, userId];
        }
        
        const result = await this.executeQuery(conn, sql, params);
        return { success: result.affectedRows > 0 };
    });
}
```

## ประโยชน์ที่ได้รับ

### 1. Better Validation 🛡️
- **Comprehensive validation**: ตรวจสอบ email format, phone number, date format
- **File validation**: ตรวจสอบประเภทไฟล์และขนาด
- **Data cleaning**: แปลง empty strings เป็น null อย่างสม่ำเสมอ

### 2. Improved File Handling 📁
- **Automatic cleanup**: ลบไฟล์เก่าและไฟล์ error อัตโนมัติ
- **File validation**: ตรวจสอบประเภทและขนาดไฟล์
- **Error recovery**: ลบไฟล์ที่อัพโหลดมาเมื่อเกิด error

### 3. Better Error Handling ⚠️
- **Graceful error handling**: จัดการ error แต่ละประเภทแยกกัน
- **Resource cleanup**: ลบไฟล์ที่ไม่จำเป็นเมื่อเกิด error
- **Clear error messages**: ข้อความ error ที่ชัดเจน

### 4. Code Reusability ♻️
```javascript
// Profile validation ใช้ได้ในที่อื่น
const validation = UserModel.validateProfileData(profileData);

// File upload handling ใช้ได้กับ controller อื่น
const uploadResult = ImageUtils.handleProfileImageUpload(file, oldFile);

// Profile update ใช้ได้ในหลายสถานการณ์
const result = await UserModel.updateProfileWithImage(id, data, image);
```

### 5. Transaction Safety 🔒
- **Database consistency**: ใช้ transaction สำหรับ database operations
- **Rollback on error**: ยกเลิกการเปลี่ยนแปลงถ้าเกิด error
- **File consistency**: ลบไฟล์ที่เกี่ยวข้องถ้า database operation ล้มเหลว

## Utility Methods ที่เป็นประโยชน์

### UserModel utilities:
```javascript
// ล้างข้อมูลโปรไฟล์
const cleaned = UserModel.cleanProfileData(rawData);

// ดึงรูปโปรไฟล์ปัจจุบัน
const currentImage = await UserModel.getCurrentProfileImage(userId);

// ตรวจสอบข้อมูลโปรไฟล์
const validation = UserModel.validateProfileData(data);
```

### ImageUtils utilities:
```javascript
// จัดการ file upload
const uploadResult = ImageUtils.handleProfileImageUpload(file, oldFile);

// ทำความสะอาดไฟล์ที่ไม่ใช้
const deletedCount = ImageUtils.cleanupUnusedFiles(usedFiles);

// ตรวจสอบไฟล์
const isValid = ImageUtils.isImageFile(filename) && ImageUtils.isFileSizeValid(size);
```

## Code Size Comparison

- **ก่อน**: 84 บรรทัด (ใน controller)
- **หลัง**: 78 บรรทัด (ใน controller) + reusable methods ใน Models
- **Code reduction**: 7% ใน controller + เพิ่ม reusability อย่างมาก

## การทดสอบที่ง่ายขึ้น 🧪

```javascript
// ทดสอบ validation แยกจาก HTTP
const validation = UserModel.validateProfileData(testData);
expect(validation.isValid).toBe(false);

// ทดสอบ file handling แยกจาก upload
const result = ImageUtils.handleProfileImageUpload(mockFile);
expect(result.success).toBe(true);

// ทดสอบ database operation แยกจาก controller
const updateResult = await UserModel.updateProfileWithImage(1, data, 'image.jpg');
expect(updateResult.success).toBe(true);
```

## สรุป
การ refactor `updateUserProfile.controller.js` ทำให้:
- ✅ **Validation ครอบคลุมมากขึ้น** - ตรวจสอบ email, phone, date format
- ✅ **File handling ที่ปลอดภัย** - validation, cleanup, error recovery
- ✅ **Code ที่ clean และ maintainable** - แยก concerns ชัดเจน
- ✅ **Error handling ที่ดีขึ้น** - graceful error handling
- ✅ **Reusable components** - สามารถใช้ใน controller อื่นได้
- ✅ **Transaction safety** - database consistency และ rollback
- ✅ **Easy testing** - แยก business logic ออกจาก HTTP layer

**Controller นี้ตอนนี้มีความปลอดภัย robust และ maintainable มากขึ้น! 🎉**
