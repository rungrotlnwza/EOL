# Models Documentation

## ภาพรวม
โฟลเดอร์ `models` ประกอบด้วย Model classes สำหรับการจัดการข้อมูลในฐานข้อมูล โดยแยก business logic ออกจาก controllers ตาม MVC pattern

## โครงสร้าง

### Base.model.js
Base class ที่ให้ method พื้นฐานสำหรับการทำงานกับฐานข้อมูล

#### Methods
- `getConnection()` - รับ database connection จาก pool
- `executeQuery(conn, sql, params)` - Execute SQL query
- `query(sql, params)` - Execute query พร้อมจัดการ connection อัตโนมัติ
- `beginTransaction(conn)` - เริ่ม transaction
- `commit(conn)` - Commit transaction
- `rollback(conn)` - Rollback transaction
- `transaction(callback)` - Execute transaction พร้อม error handling อัตโนมัติ
- `buildWhereClause(conditions)` - สร้าง WHERE clause
- `exists(table, conditions)` - ตรวจสอบว่าข้อมูลมีอยู่หรือไม่
- `count(table, conditions)` - นับจำนวนแถว

### User.model.js
Model สำหรับการจัดการข้อมูลผู้ใช้ (extend จาก BaseModel)

#### Methods
- `validateRegistrationData(userData)` - ตรวจสอบความถูกต้องของข้อมูลการสมัครสมาชิก
- `checkExistingUser(username, email)` - ตรวจสอบ username/email ซ้ำ
- `createUser(userData)` - สร้างผู้ใช้ใหม่
- `generateConflictMessage(conflicts)` - สร้างข้อความ error สำหรับข้อมูลซ้ำ
- `findByUsername(username)` - ค้นหาผู้ใช้ด้วย username
- `findById(id)` - ค้นหาผู้ใช้ด้วย ID
- `updateUser(id, userData)` - อัพเดตข้อมูลผู้ใช้
- `changePassword(id, newPassword)` - เปลี่ยนรหัสผ่าน
- `deleteUser(id)` - ลบผู้ใช้

## การใช้งาน

### ตัวอย่างการใช้ UserModel ใน Controller

```javascript
const UserModel = require('../models/User.model');

// การสมัครสมาชิก
const userData = { username, password, confirm_password, email };

// ตรวจสอบข้อมูล
const validation = UserModel.validateRegistrationData(userData);
if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
}

// ตรวจสอบข้อมูลซ้ำ
const existingUsers = await UserModel.checkExistingUser(username, email);
if (existingUsers.length > 0) {
    const message = UserModel.generateConflictMessage(existingUsers);
    return res.status(400).json({ message });
}

// สร้างผู้ใช้
const result = await UserModel.createUser({ username, password, email });
```

### ตัวอย่างการใช้ BaseModel methods

```javascript
// ใช้ query แบบง่าย
const users = await BaseModel.query('SELECT * FROM tb_auth WHERE username = ?', [username]);

// ใช้ transaction
const result = await BaseModel.transaction(async (conn) => {
    await BaseModel.executeQuery(conn, 'INSERT INTO table1 ...', params1);
    await BaseModel.executeQuery(conn, 'INSERT INTO table2 ...', params2);
    return { success: true };
});

// ตรวจสอบข้อมูลมีอยู่หรือไม่
const userExists = await BaseModel.exists('tb_auth', { username: 'testuser' });

// นับจำนวนผู้ใช้
const userCount = await BaseModel.count('tb_auth', { active: 1 });
```

## ประโยชน์ของการใช้ Model Pattern

1. **Separation of Concerns**: แยก business logic ออกจาก HTTP handling
2. **Code Reusability**: สามารถใช้ method เดียวกันใน controller หลายตัว
3. **Maintainability**: แก้ไข logic ที่เดียวได้หลายที่
4. **Testability**: ง่ายต่อการเขียน unit test
5. **Consistency**: การทำงานกับ database มีรูปแบบเดียวกัน

## Best Practices

1. **ใช้ static methods**: เนื่องจากไม่ต้องการ instance ของ model
2. **Error Handling**: ใช้ try-catch และ rollback transaction เมื่อเกิด error
3. **Validation**: ตรวจสอบข้อมูลใน model ก่อนบันทึกลงฐานข้อมูล
4. **Documentation**: เขียน JSDoc comment สำหรับทุก method
5. **Naming Convention**: ใช้ชื่อ method ที่สื่อความหมายชัดเจน

## การขยายโครงสร้าง

หากต้องการเพิ่ม Model ใหม่:

1. สร้างไฟล์ใหม่ในโฟลเดอร์ models
2. Extend จาก BaseModel
3. เพิ่ม methods เฉพาะสำหรับ business logic ของ model นั้น
4. อัพเดต documentation นี้

```javascript
const BaseModel = require('./Base.model');

class NewModel extends BaseModel {
    static async customMethod() {
        // business logic here
    }
}

module.exports = NewModel;
```
