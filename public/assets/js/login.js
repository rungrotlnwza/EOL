// login.js
// Logic สำหรับหน้า login

// รอให้ window.loadCDN โหลด jsrsasign ก่อน

function signJWT_RS256(payload, publicKey) {
    const header = { alg: 'RS256', typ: 'JWT' };
    if (typeof KJUR === 'undefined') {
        throw new Error('jsrsasign library not loaded');
    }
    const encodedPayload = btoa(JSON.stringify(payload));
    return header.alg + '.' + encodedPayload + '.signature';
}

export function setupLoginForm() {
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        if (!username || !password) {
            alert('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        // ดึง publicKey จาก localStorage
        const publicKey = localStorage.getItem('publicKey');
        if (!publicKey) {
            alert('ไม่พบ publicKey กรุณารีเฟรชหน้าใหม่');
            return;
        }
        // เข้ารหัสข้อมูลด้วย JWT (base64 demo)
        let jwt;
        try {
            jwt = signJWT_RS256({ username, password }, publicKey);
        } catch (e) {
            alert('เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล: ' + e.message);
            return;
        }
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ publickey: jwt })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    alert('เข้าสู่ระบบสำเร็จ!');
                    window.location.href = 'dashboard';
                } else {
                    alert('เข้าสู่ระบบสำเร็จ แต่ไม่พบ token');
                }
            } else {
                alert(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
    });
}
