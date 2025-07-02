// --- Register logic for 2-step form ---
let regData = {};

function registerStep1() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm_password = document.getElementById('confirmPassword').value;
  if (!username || !password || !confirm_password) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return;
  }
  if (password !== confirm_password) {
    alert('รหัสผ่านไม่ตรงกัน');
    return;
  }
  regData = { username, password, confirm_password };
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('emailForm').style.display = 'block';
  setTimeout(() => document.getElementById('email').focus(), 100);
}

async function registerStep2() {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    alert('กรุณากรอกอีเมล');
    return;
  }
  const { username, password, confirm_password } = regData;
  const publicKey = localStorage.getItem('publicKey');
  if (!publicKey) {
    alert('ไม่พบ publicKey กรุณารีเฟรชหน้าใหม่');
    return;
  }
  const payload = { username, password, confirm_password, email };
  let jwt;
  try {
    await waitForJSRSASign();
    jwt = signJWT_RS256(payload, publicKey);
  } catch (e) {
    alert('เกิดข้อผิดพลาดในการเข้ารหัสข้อมูล: ' + e.message);
    return;
  }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publickey: jwt })
    });
    const data = await res.json();
    if (res.ok) {
      alert('สมัครสมาชิกสำเร็จ!');
      window.location.href = 'login';
    } else {
      alert(data.message || 'เกิดข้อผิดพลาด');
    }
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
  }
}

function waitForJSRSASign() {
  return new Promise((resolve, reject) => {
    if (typeof KJUR !== 'undefined') {
      resolve();
    } else {
      let attempts = 0;
      const maxAttempts = 50;
      const interval = setInterval(() => {
        attempts++;
        if (typeof KJUR !== 'undefined') {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('jsrsasign library failed to load'));
        }
      }, 100);
    }
  });
}

function setupRegisterEnterKey() {
  // Register form: username -> password -> confirmPassword -> register
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const registerBtn = document.getElementById('registerBtn');
  if (username && password && confirmPassword && registerBtn) {
    username.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (username.value.trim()) password.focus();
      }
    });
    password.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (password.value) confirmPassword.focus();
      }
    });
    confirmPassword.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (confirmPassword.value && registerBtn.offsetParent !== null) {
          registerBtn.click();
        }
      }
    });
  }
  // Email form: email -> ยืนยันอีเมล
  const email = document.getElementById('email');
  const emailBtn = document.getElementById('emailBtn');
  if (email && emailBtn) {
    email.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (email.value && emailBtn.offsetParent !== null) {
          emailBtn.click();
        }
      }
    });
  }
}

// --- main entry ---
// ใช้ setTimeout เพื่อให้แน่ใจว่า DOM พร้อมแล้ว
setTimeout(() => {
  console.log('register.js loaded and starting setup');
  const registerBtn = document.getElementById('registerBtn');
  const emailBtn = document.getElementById('emailBtn');

  if (registerBtn) {
    registerBtn.addEventListener('click', registerStep1);
    console.log('registerBtn event added');
  } else {
    console.error('registerBtn not found');
  }

  if (emailBtn) {
    emailBtn.addEventListener('click', registerStep2);
    console.log('emailBtn event added');
  } else {
    console.log('emailBtn not found (normal - will be available after step 1)');
  }

  setupRegisterEnterKey();
  console.log('enter key setup completed');
}, 100);

function signJWT_RS256(payload, publicKey) {
  const header = { alg: 'RS256', typ: 'JWT' };
  if (typeof KJUR === 'undefined') {
    throw new Error('jsrsasign library not loaded');
  }
  const encodedPayload = btoa(JSON.stringify(payload));
  return header.alg + '.' + encodedPayload + '.signature';
}