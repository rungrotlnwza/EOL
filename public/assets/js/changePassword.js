// Change Password Steps Logic
export function setupChangePassword() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const toStep2Btn = document.getElementById('toStep2Btn');
    const toStep3Btn = document.getElementById('toStep3Btn');
    const backToStep1Btn = document.getElementById('backToStep1Btn');
    const backToStep2Btn = document.getElementById('backToStep2Btn');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changeStatusDiv = document.getElementById('changePasswordStatus');
    const changeStatusAlert = changeStatusDiv ? changeStatusDiv.querySelector('.alert') : null;

    if (!changePasswordForm) {
        console.warn('Change password form not found');
        return;
    }

    function goToStep2() {
        if (!document.getElementById('old-password').value) {
            changeStatusAlert.className = 'alert alert-warning';
            changeStatusAlert.textContent = 'กรุณากรอกรหัสผ่านเดิม';
            changeStatusDiv.classList.remove('d-none');
            return;
        }
        step1.classList.add('d-none');
        step2.classList.remove('d-none');
        changeStatusDiv.classList.add('d-none');
        document.getElementById('otp').focus();
    }

    function goToStep3() {
        const otp = document.getElementById('otp').value;
        if (otp !== '123456') {
            changeStatusAlert.className = 'alert alert-danger';
            changeStatusAlert.textContent = 'OTP ไม่ถูกต้อง (กรุณากรอก 123456)';
            changeStatusDiv.classList.remove('d-none');
            return;
        }
        step2.classList.add('d-none');
        step3.classList.remove('d-none');
        changeStatusDiv.classList.add('d-none');
        document.getElementById('new-password').focus();
    }

    toStep2Btn.addEventListener('click', goToStep2);
    toStep3Btn.addEventListener('click', goToStep3);

    backToStep1Btn.addEventListener('click', function () {
        step2.classList.add('d-none');
        step1.classList.remove('d-none');
        changeStatusDiv.classList.add('d-none');
        document.getElementById('old-password').focus();
    });

    backToStep2Btn.addEventListener('click', function () {
        step3.classList.add('d-none');
        step2.classList.remove('d-none');
        changeStatusDiv.classList.add('d-none');
        document.getElementById('otp').focus();
    });

    document.getElementById('old-password').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToStep2();
        }
    });

    document.getElementById('otp').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            goToStep3();
        }
    });

    changePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const old_password = document.getElementById('old-password').value;
        const new_password = document.getElementById('new-password').value;
        const confirm_password = document.getElementById('confirm-password').value;

        if (new_password !== confirm_password) {
            changeStatusAlert.className = 'alert alert-warning';
            changeStatusAlert.textContent = 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน';
            changeStatusDiv.classList.remove('d-none');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            changeStatusAlert.className = 'alert alert-danger';
            changeStatusAlert.textContent = 'ไม่พบโทเคน กรุณาเข้าสู่ระบบใหม่';
            changeStatusDiv.classList.remove('d-none');
            return;
        }

        try {
            const response = await fetch('/api/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ old_password, new_password, confirm_password })
            });

            const result = await response.json();

            if (response.ok) {
                changeStatusAlert.className = 'alert alert-success';
                changeStatusAlert.textContent = result.message || 'เปลี่ยนรหัสผ่านสำเร็จ';
                changePasswordForm.reset();
                step3.classList.add('d-none');
                step1.classList.remove('d-none');
                document.getElementById('old-password').focus();
            } else {
                changeStatusAlert.className = 'alert alert-danger';
                changeStatusAlert.textContent = result.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
            }
            changeStatusDiv.classList.remove('d-none');
        } catch (err) {
            changeStatusAlert.className = 'alert alert-danger';
            changeStatusAlert.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
            changeStatusDiv.classList.remove('d-none');
        }
    });
}
