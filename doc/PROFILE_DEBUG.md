# Profile Manager Debug Guide

## 🔧 การแก้ปัญหา Update Profile

### ตรวจสอบการทำงานของ Profile Manager:

1. **เปิด Developer Tools (F12)** และดู Console tab

2. **ค้นหา log messages เหล่านี้:**
   ```
   🔧 ProfileManager: Initializing...
   🚀 ProfileManager: Loading user profile...
   🚀 ProfileManager: Setting up update profile form...
   📝 ProfileManager: Setting up update profile form...
   ✅ ProfileManager: Update profile form found
   ✅ ProfileManager: All form elements found
   ✅ ProfileManager: Initialization complete
   ```

3. **ถ้าเห็น error messages:**
   - `❌ ProfileManager: Update profile form not found` = ไม่พบฟอร์ม updateProfileForm
   - `❌ ProfileManager: Missing form elements: [...]` = ไม่พบ input fields บางตัว

### ตรวจสอบ Elements ที่จำเป็น:

ใน dashboard.html ต้องมี elements เหล่านี้:
- `updateProfileForm` (form)
- `update-fname` (input)
- `update-lname` (input)
- `update-email` (input)
- `update-phone` (input)
- `update-gender` (select)
- `update-dob` (input type="date")
- `update-education` (input)
- `update-address` (textarea)
- `loadCurrentDataBtn` (button)
- `updateStatus` (div)
- `profile-image` (input type="file")
- `new-image-preview` (img)
- `new-profile-image-preview` (div)

### ทดสอบ Functions ใน Console:

```javascript
// ดู cache ข้อมูล profile
getCacheInfo()

// ล้าง cache
clearProfileCache()

// ตรวจสอบว่า form elements มีอยู่หรือไม่
console.log('updateProfileForm:', document.getElementById('updateProfileForm'))
console.log('update-fname:', document.getElementById('update-fname'))
console.log('loadCurrentDataBtn:', document.getElementById('loadCurrentDataBtn'))
```

### การทำงานที่ถูกต้อง:

1. **Profile Loading**: โหลดข้อมูลจาก API หรือ cache
2. **Form Population**: กรอกข้อมูลลงในฟอร์มอัตโนมัติ
3. **Image Preview**: แสดงรูปปัจจุบันและรูปใหม่ที่เลือก
4. **Form Submission**: ส่งข้อมูลไปยัง API พร้อมรูปภาพ
5. **Cache Update**: อัปเดต cache ด้วยข้อมูลใหม่

### ถ้ายังมีปัญหา:

1. ตรวจสอบว่า tab "Update Profile" เปิดอยู่หรือไม่
2. รีเฟรชหน้าใหม่
3. ตรวจสอบ Network tab ว่า API calls ทำงานถูกต้องหรือไม่
4. ดู Console errors ว่ามี JavaScript errors หรือไม่
