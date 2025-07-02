# DELETE ACCOUNT FORM DEBUG GUIDE

## ปัญหาที่พบ
ฟอร์มลบบัญชีไม่สามารถไปยัง step ถัดไปได้เมื่อกดปุ่ม "ถัดไป" ใน step 1

## วิธีการ Debug

### 1. เปิด Browser Developer Tools
- กด F12 หรือ Right-click → Inspect
- ไปที่แท็บ Console

### 2. ตรวจสอบ Console Logs
ค้นหา logs เหล่านี้:
```
🗑️ DeleteAccount: Initializing...
✅ DeleteAccount: All form elements found
✅ DeleteAccount: Binding Step 2 button event
🔁 DeleteAccount: Initializing form...
```

### 3. ทดสอบการคลิกปุ่ม
เมื่อคลิกปุ่ม "ถัดไป" ใน step 1 ควรเห็น:
```
🖱️ DeleteAccount: Step 2 button clicked
🚀 DeleteAccount: Attempting to go to Step 2
Password field found: true
Password length: [จำนวนตัวอักษร]
✅ DeleteAccount: Password validated, moving to step 2
🔄 DeleteAccount: Changing step from delete-step1 to delete-step2
✅ Step changed successfully
```

### 4. ทดสอบใน Test File
1. เปิด `test_delete_form.html` ในเบราว์เซอร์
2. กรอกรหัสผ่านใดๆ ใน step 1
3. กดปุ่ม "ถัดไป"
4. ตรวจสอบ console logs

### 5. ปัญหาที่อาจพบ

#### ปัญหา: ไม่มี console logs
**แก้ไข**: ตรวจสอบว่า deleteAccount.js ถูก import และเรียกใช้ถูกต้อง

#### ปัญหา: Elements not found
**แก้ไข**: ตรวจสอบ HTML structure และ id ของ elements

#### ปัญหา: Button not responding
**แก้ไข**: ตรวจสอบว่า event listener ถูก bind ถูกต้อง

#### ปัญหา: Form validation errors
**แก้ไข**: ตรวจสอบ fixRequiredOnVisibleFields function

### 6. Manual Testing Commands
เปิด Console และรันคำสั่งเหล่านี้:

```javascript
// ตรวจสอบ elements
console.log('Form:', document.getElementById('deleteAccountForm'));
console.log('Step 1:', document.getElementById('delete-step1'));
console.log('Step 2:', document.getElementById('delete-step2'));
console.log('Button:', document.getElementById('deleteToStep2Btn'));

// ทดสอบการคลิกปุ่มแบบ manual
document.getElementById('deleteToStep2Btn').click();

// ตรวจสอบ required fields
document.querySelectorAll('#deleteAccountForm input').forEach(input => {
    console.log(input.id, 'required:', input.required, 'visible:', !input.closest('.d-none'));
});
```

### 7. Known Issues และการแก้ไข

1. **DOM not ready**: ใช้ setTimeout และ retry mechanism
2. **Double DOMContentLoaded**: ลบ DOMContentLoaded ซ้ำออกจาก dashboard.js
3. **Required field conflicts**: ใช้ fixRequiredOnVisibleFields
4. **Event binding issues**: ใช้ event.preventDefault() และ event.stopPropagation()

## การทดสอบขั้นสุดท้าย
1. กรอกรหัสผ่าน → กดถัดไป → ควรไปยัง step 2
2. กรอก OTP: 123456 → กดถัดไป → ควรไปยัง step 3  
3. เลือก checkbox → กดลบบัญชี → ควรแสดงข้อความสำเร็จ

## หมายเหตุ
- ใช้ mock token สำหรับการทดสอบ
- API endpoint `/api/deleteAccount` ต้องทำงานได้ถูกต้อง
- Bootstrap 5 ต้องถูกโหลดก่อน JavaScript
