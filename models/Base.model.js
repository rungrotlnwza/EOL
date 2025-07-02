const { pool } = require('../config/connect');

// Base Model Class สำหรับการทำงานกับฐานข้อมูล
// ให้ Model อื่นๆ สามารถ extend และใช้ method พื้นฐานได้
class BaseModel {
    // รับ connection จาก pool
    // คืนค่า: Promise ที่มี Connection
    static async getConnection() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) return reject(err);
                resolve(connection);
            });
        });
    }

    // Execute query แบบ Promise
    // รับค่า: conn (Connection) - Database connection
    //        sql (string) - SQL query
    //        params (Array) - Query parameters
    // คืนค่า: Promise ที่มี Query result
    static async executeQuery(conn, sql, params = []) {
        return new Promise((resolve, reject) => {
            conn.query(sql, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    // Execute query พร้อมจัดการ connection อัตโนมัติ
    // รับค่า: sql (string) - SQL query
    //        params (Array) - Query parameters
    // คืนค่า: Promise ที่มี Query result
    static async query(sql, params = []) {
        const conn = await this.getConnection();

        try {
            const result = await this.executeQuery(conn, sql, params);
            conn.release();
            return result;
        } catch (error) {
            conn.release();
            throw error;
        }
    }

    // Begin transaction
    // รับค่า: conn (Connection) - Database connection
    // คืนค่า: Promise void
    static async beginTransaction(conn) {
        return new Promise((resolve, reject) => {
            conn.beginTransaction(err => err ? reject(err) : resolve());
        });
    }

    // Commit transaction
    // รับค่า: conn (Connection) - Database connection
    // คืนค่า: Promise void
    static async commit(conn) {
        return new Promise((resolve, reject) => {
            conn.commit(err => err ? reject(err) : resolve());
        });
    }

    // Rollback transaction
    // รับค่า: conn (Connection) - Database connection
    // คืนค่า: Promise void
    static async rollback(conn) {
        return new Promise(resolve => {
            conn.rollback(() => resolve());
        });
    }

    // Execute transaction พร้อมจัดการ error handling อัตโนมัติ
    // รับค่า: callback (Function) - Function ที่จะรันใน transaction รับ parameter เป็น connection
    // คืนค่า: Promise ที่มี ผลลัพธ์จาก callback
    static async transaction(callback) {
        const conn = await this.getConnection();

        try {
            await this.beginTransaction(conn);
            const result = await callback(conn);
            await this.commit(conn);
            conn.release();
            return result;
        } catch (error) {
            await this.rollback(conn);
            conn.release();
            throw error;
        }
    }

    // สร้าง WHERE clause สำหรับการค้นหา
    // รับค่า: conditions (Object) - เงื่อนไขการค้นหา
    // คืนค่า: Object { whereClause, params }
    static buildWhereClause(conditions) {
        const keys = Object.keys(conditions).filter(key => conditions[key] !== undefined);

        if (keys.length === 0) {
            return { whereClause: '', params: [] };
        }

        const whereClause = 'WHERE ' + keys.map(key => `${key} = ?`).join(' AND ');
        const params = keys.map(key => conditions[key]);

        return { whereClause, params };
    }

    // ตรวจสอบว่าข้อมูลมีอยู่ในตารางหรือไม่
    // รับค่า: table (string) - ชื่อตาราง
    //        conditions (Object) - เงื่อนไขการค้นหา
    // คืนค่า: Promise ที่มี boolean - true ถ้ามีข้อมูล, false ถ้าไม่มี
    static async exists(table, conditions) {
        const { whereClause, params } = this.buildWhereClause(conditions);
        const sql = `SELECT 1 FROM ${table} ${whereClause} LIMIT 1`;

        const result = await this.query(sql, params);
        return result.length > 0;
    }

    // นับจำนวนแถวในตาราง
    // รับค่า: table (string) - ชื่อตาราง
    //        conditions (Object) - เงื่อนไขการค้นหา (ค่าเริ่มต้น: {})
    // คืนค่า: Promise ที่มี number จำนวนแถว
    static async count(table, conditions = {}) {
        const { whereClause, params } = this.buildWhereClause(conditions);
        const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;

        const result = await this.query(sql, params);
        return result[0].count;
    }
}

module.exports = BaseModel;
