const mysql = require('mysql2');

// สร้าง connection pool เพื่อประสิทธิภาพที่ดีขึ้น
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'iflovethenus', // ใส่รหัสผ่านของคุณ
    database: 'mydb', // ใส่ชื่อฐานข้อมูลของคุณ
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// สร้าง object ที่ชื่อ mysqli และมีเมธอด query
const mysqli = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
};

module.exports = {
    pool,
    query: mysqli.query
};
