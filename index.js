const express = require('express');
const path = require('path');

// สร้าง RSA key pair ถ้ายังไม่มี (ตอน server start)
const generateKeys = require('./config/generate-keys');
generateKeys();

const app = express();
const PORT = 80;

// Middleware
app.use(express.json());

// API routes - มาก่อนเสมอ
app.use('/api', require('./api/api.routes'));

// Static files สำหรับทุกอย่าง (แบบง่าย)
app.use(express.static(path.join(__dirname, 'public')));

// Web routes สำหรับ HTML pages (จัดการ routing เฉพาะที่ต้องการ)
app.use('/', require('./routes/public.routes'));

// Error handlers
app.use((req, res, next) => {
    // 404 handler
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        status: 'error'
    });
});

app.listen(PORT, () => {
    console.log(`เซิร์ฟเวอร์กำลังทำงานที่ http://localhost:${PORT}`);
});