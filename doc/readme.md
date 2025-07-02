# Node.js MVC Example (No View & Model)

## สรุปงานที่ทำเสร็จแล้ว

### 🎯 **ระบบ Backend API ที่พัฒนาเสร็จสมบูรณ์**

- ✅ **ระบบสมัครสมาชิก** - รองรับการตรวจสอบ username/email ซ้ำ และเข้ารหัสข้อมูลด้วย JWT
- ✅ **ระบบเข้าสู่ระบบ** - รองรับการ login ด้วย JWT authentication และ RSA encryption
- ✅ **ระบบจัดการโปรไฟล์** - ดู/แก้ไขข้อมูลส่วนตัวผู้ใช้
- ✅ **ระบบเปลี่ยนรหัสผ่าน** - ตรวจสอบรหัสผ่านเดิมก่อนเปลี่ยน
- ✅ **ระบบลบบัญชีผู้ใช้** - ลบข้อมูลแบบ cascade
- ✅ **ระบบความปลอดภัย** - RSA key pair generation, JWT token, bcrypt password hashing

### 🎨 **ระบบ Frontend ที่พัฒนาเสร็จสมบูรณ์**

- ✅ **หน้าเว็บ Login** - ฟอร์มเข้าสู่ระบบพร้อม JWT encryption
- ✅ **หน้าเว็บ Register** - ฟอร์ม 2 ขั้นตอน (ข้อมูลพื้นฐาน + อีเมล)
- ✅ **หน้าเว็บหลัก** - Landing page พร้อม responsive design
- ✅ **หน้า Dashboard** - Template สำหรับผู้ใช้ที่ login แล้ว
- ✅ **ระบบนำทาง** - Navbar/Footer components แบบ modular
- ✅ **ระบบจัดการ CDN** - โหลด Bootstrap และ libraries อื่นๆ แบบ dynamic

### 🔧 **ระบบ Infrastructure ที่พัฒนาเสร็จสมบูรณ์**

- ✅ **ฐานข้อมูล MySQL** - ตาราง tb_auth และ tb_detail พร้อม foreign key
- ✅ **ระบบเชื่อมต่อฐานข้อมูล** - Connection pooling และ transaction support
- ✅ **ระบบ RSA Key Management** - Auto-generate private/public keys
- ✅ **ระบบ Module Loading** - Dynamic import สำหรับแต่ละหน้า
- ✅ **ระบบ Static Files** - Serve HTML, CSS, JS และ assets

## Project Structure (ตามที่ทำจริง)

```
project-root/
│
├── api/                  # API Routes
│   └── api.routes.js ✅
│
├── config/               # การตั้งค่าการเชื่อมต่อฐานข้อมูล
│   └── connect.js ✅
│
├── controller/           # จัดการคำขอและประสานงาน (Controllers)
│   ├── exmaple.controller.js ✅         # ตัวอย่าง controller
│   ├── login.controller.js ✅           # เข้าสู่ระบบ
│   ├── register.controller.js ✅        # สมัครสมาชิก
│   ├── getUserProfile.controller.js✅    # ดูโปรไฟล์
│   ├── updateUserProfile.controller.js✅ # แก้ไขโปรไฟล์
│   ├── changePassword.controller.js ✅   # เปลี่ยนรหัสผ่าน
│   ├── deleteAccount.controller.js✅     # ลบบัญชีผู้ใช้
│   ├── admin.getAllUsers.controller.js        # แอดมินดูรายชื่อผู้ใช้ทั้งหมด
│   ├── admin.getUser.controller.js           # แอดมินดูข้อมูลผู้ใช้รายคน
│   ├── admin.createUser.controller.js        # แอดมินเพิ่มผู้ใช้ใหม่
│   ├── admin.deleteUser.controller.js        # แอดมินลบบัญชีผู้ใช้
│   ├── admin.updateUserRole.controller.js    # แอดมินเปลี่ยนสิทธิ์ผู้ใช้
│   ├── admin.updateUserProfile.controller.js # แอดมินแก้ไขโปรไฟล์ผู้ใช้
│   ├── admin.resetUserPassword.controller.js # แอดมินรีเซ็ตรหัสผ่านผู้ใช้
│   ├── admin.banUser.controller.js           # แอดมินแบนผู้ใช้
│   ├── admin.unbanUser.controller.js         # แอดมินปลดแบนผู้ใช้
│   ├── admin.exportUsers.controller.js       # แอดมินส่งออกข้อมูลผู้ใช้
│   ├── admin.importUsers.controller.js       # แอดมินนำเข้าข้อมูลผู้ใช้
│   ├── admin.getUserLogs.controller.js       # แอดมินดูประวัติการใช้งานของผู้ใช้
│   └── ...
│
├── doc/                  # Documentation
│   └── รายงานประจำสัปดาห์.txt ✅
│
├── key/                  # RSA Keys (Auto-generated)
│   ├── privatekey.pem ✅
│   └── publickey.pem ✅
│
├── public/               # Frontend Files
│   ├── index.html ✅              # Landing page
│   ├── login.html ✅              # Login page
│   ├── register.html ✅           # Registration page
│   ├── dashboard.html ✅          # Dashboard page
│   ├── template.html ✅           # Template page
│   └── assets/
│       ├── components/
│       │   ├── navbar.html ✅     # Navigation component
│       │   └── footer.html ✅     # Footer component
│       └── js/
│           ├── script.js ✅       # Main script
│           ├── CDN.js ✅          # CDN loader
│           ├── register.js ✅     # Register logic
│           └── renderkit.js ✅    # Component loader
│
├── routes/               # Public Routes
│   └── public.routes.js ✅
│
├── .vscode/              # VS Code Settings
│   └── setings.json ✅
│
├── mydb.sql ✅           # Database schema
├── package.json ✅       # Dependencies
├── index.js ✅           # Main server file
├── .gitignore ✅         # Git ignore
└── readme.md ✅          # This file
```

## 🚀 **API Endpoints ที่ใช้งานได้**

### Authentication APIs

```bash
POST /api/register        # สมัครสมาชิก (รับ JWT payload)
POST /api/login          # เข้าสู่ระบบ (รับ JWT payload)
POST /api/getPublickey   # ดึง RSA public key
```

### User Management APIs (ต้องมี JWT token)

```bash
POST /api/getUserProfile    # ดูโปรไฟล์ผู้ใช้
POST /api/updateUserProfile # แก้ไขโปรไฟล์ผู้ใช้
POST /api/changePassword    # เปลี่ยนรหัสผ่าน
POST /api/deleteAccount     # ลบบัญชีผู้ใช้
```

### Public Routes

```bash
GET /                    # หน้าแรก
GET /register           # หน้าสมัครสมาชิก
GET /login              # หน้าเข้าสู่ระบบ
GET /dashboard          # หน้า Dashboard
```

## 🔐 **ระบบความปลอดภัยที่ใช้**

- **RSA 2048-bit** - การเข้ารหัสข้อมูลระหว่าง client-server
- **JWT (RS256)** - JSON Web Token สำหรับ authentication
- **bcrypt** - การเข้ารหัสรหัสผ่านด้วย salt rounds 10
- **MySQL Foreign Key** - ความสัมพันธ์ข้อมูลแบบ CASCADE
- **SQL Injection Protection** - ใช้ parameterized queries

## 💾 **โครงสร้างฐานข้อมูล**

```sql
-- ตาราง tb_auth (ข้อมูลการเข้าสู่ระบบ)
CREATE TABLE tb_auth (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

-- ตาราง tb_detail (ข้อมูลส่วนตัว)
CREATE TABLE tb_detail (
  id INT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  education VARCHAR(255),
  address TEXT,
  FOREIGN KEY (id) REFERENCES tb_auth(id) ON DELETE CASCADE
);
```

## Stack Technology (npm libraries)

- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcrypt** - Password hashing
- **jsonwebtoken** - JSON Web Token for authentication
- **nodemon** - Development tool for auto-restarting server

### ติดตั้ง dependencies

```bash
npm install express mysql2 bcrypt jsonwebtoken nodemon
```

## 🛠️ **วิธีการติดตั้งและใช้งาน**

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่าฐานข้อมูล MySQL

```bash
# สร้างฐานข้อมูล
CREATE DATABASE mydb;

# Import schema
mysql -u root -p mydb < mydb.sql
```

### 3. แก้ไขการเชื่อมต่อฐานข้อมูลใน `config/connect.js`

```javascript
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_password_here", // แก้ไขรหัสผ่าน
  database: "mydb",
  // ...
});
```

### 4. รันเซิร์ฟเวอร์

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. เข้าใช้งาน

```
http://localhost:80
```

## 📝 **วิธีการใช้งาน Frontend**

### การสมัครสมาชิก

1. ไปที่ `/register`
2. กรอก Username, Password, Confirm Password
3. กรอก Email ในขั้นตอนที่ 2
4. ระบบจะเข้ารหัสข้อมูลด้วย JWT และส่งไปยัง server

### การเข้าสู่ระบบ

1. ไปที่ `/login`
2. กรอก Username และ Password
3. ระบบจะสร้าง JWT token และเก็บใน localStorage
4. เปลี่ยนเส้นทางไปยัง Dashboard

### การจัดการโปรไฟล์

1. เข้าสู่ระบบแล้วไปที่ `/dashboard`
2. ใช้ API endpoints สำหรับจัดการข้อมูลผู้ใช้

## 🎯 **คุณสมบัติพิเศษ**

- **Auto RSA Key Generation** - สร้าง private/public key อัตโนมัติตอน server start
- **Dynamic Component Loading** - โหลด navbar/footer แบบ modular
- **Responsive Design** - รองรับทุกขนาดหน้าจอด้วย Bootstrap
- **2-Step Registration** - ฟอร์มสมัครสมาชิก 2 ขั้นตอน
- **JWT Encryption** - เข้ารหัสข้อมูลก่อนส่งไปยัง server
- **Database Transaction** - รองรับ rollback เมื่อเกิดข้อผิดพลาด

> 💡 **หมายเหตุ**: โปรเจ็คนี้เป็น MVC แบบ No View & Model โดยใช้ Controller จัดการ business logic และเชื่อมต่อฐานข้อมูลโดยตรง พร้อมระบบ Frontend ที่สมบูรณ์สำหรับการใช้งานจริง

---

**🚧 งานที่วางแผนจะทำต่อ (ยังไม่ได้เริ่มทำ)**

- Admin controllers สำหรับจัดการผู้ใช้
- Admin dashboard UI
- ระบบ ban/unban ผู้ใช้
- ระบบ export/import ข้อมูลผู้ใช้
- ระบบดูประวัติการใช้งาน (User logs)
- ระบบจัดการสิทธิ์ผู้ใช้ (Role management)
