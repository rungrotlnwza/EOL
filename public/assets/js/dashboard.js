import { setupChangePassword } from './changePassword.js';
import { setupDeleteAccount } from './deleteAccount.js';
import { setupProfileManager } from './profileManager.js';

export function dashboard() {
    //  Clone vertical tab links to offcanvas every time offcanvas is shown
    // ไม่ต้องใช้ DOMContentLoaded เพราะถูกเรียกจาก script.js ที่อยู่ใน DOMContentLoaded แล้ว
    function initDashboard() {
        var offcanvas = document.getElementById('offcanvasTabs');
        var sidebar = document.getElementById('v-pills-tab');

        // ฟังก์ชันเปลี่ยน hash เมื่อคลิกแท็บ
        function addTabHashHandler(container) {
            container.querySelectorAll('a.nav-link').forEach(function (link) {
                link.addEventListener('click', function (e) {
                    var href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        window.location.hash = href;
                    }
                });
            });
        }
        // เรียกใช้กับ sidebar แรก
        addTabHashHandler(sidebar);

        offcanvas.addEventListener('show.bs.offcanvas', function () {
            var src = sidebar;
            var dest = document.querySelector('#offcanvas-v-pills-tab');
            dest.innerHTML = '';
            src.querySelectorAll('a.nav-link').forEach(function (link) {
                var clone = link.cloneNode(true);
                // เปลี่ยน id ให้ไม่ซ้ำ
                if (clone.id) clone.id = 'offcanvas-' + clone.id;
                dest.appendChild(clone);
            });
            // เพิ่ม event ให้ลิงก์ใน offcanvas ปิด offcanvas และเปลี่ยน hash เมื่อคลิก
            setTimeout(function () {
                addTabHashHandler(dest);
                dest.querySelectorAll('a.nav-link').forEach(function (link) {
                    link.addEventListener('click', function () {
                        var bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvas);
                        bsOffcanvas.hide();
                    });
                });
            }, 0);
        });

        // ฟังก์ชันเลือก tab ตาม hash
        function selectTabFromHash() {
            var hash = window.location.hash.replace('#', '');
            if (!hash) return;
            var tabLink = document.getElementById(hash + '-tab');
            if (tabLink) {
                var tab = new bootstrap.Tab(tabLink);
                tab.show();
            }
        }
        // เรียกเมื่อโหลดหน้าและเมื่อ hashchange
        window.addEventListener('hashchange', selectTabFromHash);
        selectTabFromHash();
    }

    // Initialize Change Password, Delete Account, and Profile Management functionality
    // ไม่ต้องใช้ DOMContentLoaded เพราะถูกเรียกจาก script.js ที่อยู่ใน DOMContentLoaded แล้ว
    setupChangePassword();
    setupDeleteAccount();
    setupProfileManager();

    // ====== Frontend Middleware: Auth Guard (No public key needed) ======
    (function authGuard() {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToIndex();
            return;
        }
        // ตรวจสอบ token แบบเบื้องต้น (JWT: header.payload.signature)
        if (!/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) {
            localStorage.removeItem('token');
            redirectToIndex();
            return;
        }
        // (Optional) ตรวจสอบวันหมดอายุ JWT ฝั่ง client (decode payload)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && Date.now() / 1000 > payload.exp) {
                localStorage.removeItem('token');
                redirectToIndex();
                return;
            }
        } catch (e) {
            localStorage.removeItem('token');
            redirectToIndex();
            return;
        }
        function redirectToIndex() {
            window.location.replace('/');
        }
    })();

    // เรียกใช้ฟังก์ชัน initDashboard ทันที
    initDashboard();
}
