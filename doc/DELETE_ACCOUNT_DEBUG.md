# Delete Account Debug Guide

## 🔧 การแก้ปัญหา Delete Account Multi-Step Form

### ตรวจสอบการทำงานใน Console:

เปิด Developer Tools (F12) และดู Console tab เมื่อพยายามไป next step

**ควรเห็น messages เหล่านี้:**
```
🗑️ DeleteAccount: Initializing...
✅ DeleteAccount: All form elements found
🔁 DeleteAccount: Initializing form...
🔧 DeleteAccount: Fixing required fields...
```

**เมื่อคลิกปุ่ม "ถัดไป" ใน Step 1:**
```
🖱️ DeleteAccount: Step 2 button clicked
🚀 DeleteAccount: Attempting to go to Step 2
Password length: [จำนวนตัวอักษร]
✅ DeleteAccount: Password validated, moving to step 2
🔄 DeleteAccount: Changing step from delete-step1 to delete-step2
🔧 DeleteAccount: Fixing required fields...
```

**เมื่อคลิกปุ่ม "ถัดไป" ใน Step 2:**
```
🖱️ DeleteAccount: Step 3 button clicked
🚀 DeleteAccount: Attempting to go to Step 3
OTP entered: [OTP ที่กรอก]
✅ DeleteAccount: OTP validated, moving to step 3
🔄 DeleteAccount: Changing step from delete-step2 to delete-step3
🔧 DeleteAccount: Fixing required fields...
```

### การแก้ปัญหาเมื่อไม่สามารถไป Next Step:

#### 1. **ตรวจสอบ Console Errors**
หากเห็น:
- `❌ DeleteAccount: Form elements not found` = ไม่พบ form elements
- `❌ DeleteAccount: Password is empty` = ไม่ได้กรอกรหัสผ่าน
- `❌ DeleteAccount: Invalid OTP` = OTP ไม่ถูกต้อง (ต้องเป็น 123456)

#### 2. **ตรวจสอบ Required Fields**
ดู Console ว่า required fields ถูกจัดการถูกต้องหรือไม่:
```
✅ Setting required: delete-password (visible: true)
⚪ Removing required: delete-otp (visible: false)
⚪ Removing required: delete-confirm (visible: false)
```

#### 3. **ตรวจสอบ HTML Elements**
ใน Console ให้พิมพ์:
```javascript
// ตรวจสอบ form elements
console.log('Form:', document.getElementById('deleteAccountForm'))
console.log('Step1:', document.getElementById('delete-step1'))
console.log('Step2:', document.getElementById('delete-step2'))
console.log('Step3:', document.getElementById('delete-step3'))

// ตรวจสอบ buttons
console.log('ToStep2Btn:', document.getElementById('deleteToStep2Btn'))
console.log('ToStep3Btn:', document.getElementById('deleteToStep3Btn'))

// ตรวจสอบ input fields
console.log('Password:', document.getElementById('delete-password'))
console.log('OTP:', document.getElementById('delete-otp'))
console.log('Confirm:', document.getElementById('delete-confirm'))
```

### วิธีทดสอบ:

1. **เปิดหน้า Dashboard และไปที่ tab "Delete Account"**
2. **เปิด Console (F12)**
3. **กรอกรหัสผ่านใน Step 1**
4. **คลิกปุ่ม "ถัดไป"**
5. **ดู Console messages**

### หากยังไม่ทำงาน:

1. **รีเฟรชหน้า** และลองใหม่
2. **ตรวจสอบ network errors** ใน Network tab
3. **ตรวจสอบ JavaScript errors** ใน Console
4. **ตรวจสอบ HTML structure** ใน Elements tab

### OTP สำหรับทดสอบ:
```
123456
```

### ข้อมูลที่ต้องการ:
- **Step 1**: รหัสผ่านปัจจุบัน
- **Step 2**: OTP = 123456  
- **Step 3**: ✅ ยืนยันการลบบัญชี
