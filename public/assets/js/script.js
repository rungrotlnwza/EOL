import { loadComponent } from './renderkit.js';
import { loadCDN } from './CDN.js';

console.log('hello js');
document.addEventListener('DOMContentLoaded', async () => {
  // ใส่ bg-dark ให้ body ทุกหน้า
  document.body.classList.add('bg-dark');
  // โหลด Bootstrap CSS และ JS
  await loadCDN('css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
  await loadCDN('js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');
  await loadCDN('js', 'https://cdn.jsdelivr.net/npm/jsrsasign@10.8.0/lib/jsrsasign-all-min.js');
  await loadComponent('navbar', 'navbar.html');
  await loadComponent('footer', 'footer.html');

  // เพิ่ม event listener สำหรับ logout หลังจาก navbar โหลดเสร็จ
  setupLogoutHandler();

  // รอให้ navbar โหลดเสร็จแล้วค่อย query
  const unloginElement = document.getElementById('unlogin');
  const loginElement = document.getElementById('islogin');
  const token = localStorage.getItem('token');
  if (!token) {
    // ถ้าไม่เจอ token ให้แสดง unlogin และซ่อน login
    if (unloginElement) unloginElement.classList.remove('d-none');
    if (loginElement) loginElement.classList.add('d-none');
  } else {
    // ถ้าเจอ token ให้แสดง login และซ่อน unlogin
    if (loginElement) loginElement.classList.remove('d-none');
    if (unloginElement) unloginElement.classList.add('d-none');
  }

  // ตรวจสอบว่ามี publicKey ใน localStorage หรือไม่ ถ้าไม่มีให้ดึงจาก API
  if (!localStorage.getItem('publicKey')) {
    try {
      const res = await fetch('/api/getPublickey', { method: 'POST' });
      if (res.ok) {
        const publicKey = await res.text();
        localStorage.setItem('publicKey', publicKey);
      } else {
        console.error('ไม่สามารถดึง publicKey ได้');
      }
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการดึง publicKey', err);
    }
  }

  // โหลด module เฉพาะหน้าตาม body id
  const pageId = document.body.id;
  if (pageId) {
    console.log('Loading module for page:', pageId);
    switch (pageId) {
      case 'register':
        // โหลด jsrsasign library ก่อน
        console.log('jsrsasign loaded');
        // import register module และรอให้มันรันเสร็จ
        await import('./register.js');
        console.log('register.js imported');
        break;
      case 'login':
        // โหลด login.js เฉพาะหน้า login
        console.log('login page detected');
        const loginModule = await import('./login.js');
        loginModule.setupLoginForm();
        break;
      case 'dashboard':
        // logic สำหรับหน้า dashboard
        console.log('dashboard page detected');
        const dashboardModule = await import('./dashboard.js');
        dashboardModule.dashboard();
        break;
      default:
        console.log('No specific module for page:', pageId);
    }
  }
});

// ฟังก์ชันสำหรับจัดการ logout
function setupLogoutHandler() {
  // รอให้ navbar โหลดเสร็จก่อน
  setTimeout(() => {
    const logoutLink = document.querySelector('[data-logout="true"]');
    if (logoutLink) {
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();

        // แสดงข้อความยืนยัน
        if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
          // แสดง loading
          const originalText = this.textContent;
          this.textContent = 'กำลังออกจากระบบ...';
          this.style.pointerEvents = 'none';

          // ลบข้อมูลทั้งหมดใน localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('publicKey');
          localStorage.removeItem('profileData');

          // รอสักครู่แล้ว redirect
          setTimeout(() => {
            alert('ออกจากระบบเรียบร้อยแล้ว');
            window.location.href = '/';
          }, 1000);
        }
      });
    }
  }, 500); // รอ 500ms เพื่อให้ navbar โหลดเสร็จ
}

// Export ฟังก์ชัน CDN เพื่อให้ไฟล์อื่นเรียกใช้ได้
window.loadCDN = loadCDN;