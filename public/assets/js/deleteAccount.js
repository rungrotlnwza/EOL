// Delete Account Steps Logic
export function setupDeleteAccount() {
    console.log('🗑️ DeleteAccount: Initializing...');

    // รอให้ DOM และ Bootstrap โหลดเสร็จสมบูรณ์
    const initializeDeleteAccount = () => {
        const deleteStep1 = document.getElementById('delete-step1');
        const deleteStep2 = document.getElementById('delete-step2');
        const deleteStep3 = document.getElementById('delete-step3');
        const deleteToStep2Btn = document.getElementById('deleteToStep2Btn');
        const deleteToStep3Btn = document.getElementById('deleteToStep3Btn');
        const deleteBackToStep1Btn = document.getElementById('deleteBackToStep1Btn');
        const deleteBackToStep2Btn = document.getElementById('deleteBackToStep2Btn');
        const deleteAccountForm = document.getElementById('deleteAccountForm');
        const deleteStatusDiv = document.getElementById('deleteAccountStatus');
        const deleteStatusAlert = deleteStatusDiv ? deleteStatusDiv.querySelector('.alert') : null;

        // ตรวจสอบว่า elements ถูกพบหรือไม่
        if (!deleteAccountForm || !deleteStep1 || !deleteStep2 || !deleteStep3) {
            console.warn('❌ DeleteAccount: Form elements not found, retrying...');
            console.log('Elements check:', {
                deleteAccountForm: !!deleteAccountForm,
                deleteStep1: !!deleteStep1,
                deleteStep2: !!deleteStep2,
                deleteStep3: !!deleteStep3
            });
            // ลองอีกครั้งหลังจาก 200ms
            setTimeout(initializeDeleteAccount, 200);
            return;
        } else {
            console.log('✅ DeleteAccount: All form elements found');
        }

        // 🧠 Utility: Set required only on visible fields
        function fixRequiredOnVisibleFields(form) {
            console.log('🔧 DeleteAccount: Fixing required fields...');
            const allFields = form.querySelectorAll('input, select, textarea');
            console.log('Found fields:', allFields.length);

            allFields.forEach(field => {
                let el = field;
                let hidden = false;
                while (el && el !== form) {
                    if (el.classList.contains('d-none')) {
                        hidden = true;
                        break;
                    }
                    el = el.parentElement;
                }

                // ลบ required ออกจากทุกฟิลด์ก่อน
                field.required = false;

                // เพิ่ม required เฉพาะฟิลด์ที่ปรากฏและจำเป็น
                if (!hidden && (field.id === 'delete-password' || field.id === 'delete-otp' || field.id === 'delete-confirm')) {
                    field.required = true;
                    console.log(`✅ Setting required: ${field.id} (visible: ${!hidden})`);
                } else {
                    console.log(`⚪ Removing required: ${field.id} (visible: ${!hidden})`);
                }
            });
        }

        function showStep(currentStep, nextStep) {
            console.log(`🔄 DeleteAccount: Changing step from ${currentStep.id} to ${nextStep.id}`);

            // ซ่อน step ปัจจุบัน
            currentStep.classList.add('d-none');

            // แสดง step ถัดไป
            nextStep.classList.remove('d-none');

            // ซ่อนข้อความ status
            if (deleteStatusDiv) {
                deleteStatusDiv.classList.add('d-none');
            }

            // อัพเดต required fields
            fixRequiredOnVisibleFields(deleteAccountForm);

            console.log(`✅ Step changed successfully`);
        }

        function goToDeleteStep2() {
            console.log('🚀 DeleteAccount: Attempting to go to Step 2');

            // ตรวจสอบว่าฟิลด์รหัสผ่านมีค่าหรือไม่
            const passwordField = document.getElementById('delete-password');
            const password = passwordField ? passwordField.value.trim() : '';

            console.log('Password field found:', !!passwordField);
            console.log('Password length:', password.length);

            if (!password) {
                console.warn('❌ DeleteAccount: Password is empty');
                if (deleteStatusAlert) {
                    deleteStatusAlert.className = 'alert alert-warning';
                    deleteStatusAlert.textContent = 'กรุณากรอกรหัสผ่าน';
                    deleteStatusDiv.classList.remove('d-none');
                }
                return;
            }

            console.log('✅ DeleteAccount: Password validated, moving to step 2');
            showStep(deleteStep1, deleteStep2);

            const otpField = document.getElementById('delete-otp');
            if (otpField) {
                otpField.focus();
            }
        }

        function goToDeleteStep3() {
            console.log('🚀 DeleteAccount: Attempting to go to Step 3');
            fixRequiredOnVisibleFields(deleteAccountForm);
            const otp = document.getElementById('delete-otp').value.trim();
            console.log('OTP entered:', otp);
            if (otp !== '123456') {
                console.warn('❌ DeleteAccount: Invalid OTP');
                deleteStatusAlert.className = 'alert alert-danger';
                deleteStatusAlert.textContent = 'OTP ไม่ถูกต้อง (กรุณากรอก 123456)';
                deleteStatusDiv.classList.remove('d-none');
                return;
            }
            console.log('✅ DeleteAccount: OTP validated, moving to step 3');
            showStep(deleteStep2, deleteStep3);
            const confirmField = document.getElementById('delete-confirm');
            if (confirmField) {
                confirmField.focus();
            }
        }

        function backToStep1() {
            showStep(deleteStep2, deleteStep1);
            document.getElementById('delete-password').focus();
        }

        function backToStep2() {
            showStep(deleteStep3, deleteStep2);
            document.getElementById('delete-otp').focus();
        }

        // 🎯 Event bindings
        if (deleteToStep2Btn) {
            console.log('✅ DeleteAccount: Binding Step 2 button event');
            deleteToStep2Btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🖱️ DeleteAccount: Step 2 button clicked');
                goToDeleteStep2();
            });
        } else {
            console.warn('❌ DeleteAccount: Step 2 button not found');
        }

        if (deleteToStep3Btn) {
            deleteToStep3Btn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('🖱️ DeleteAccount: Step 3 button clicked');
                goToDeleteStep3();
            });
        }

        if (deleteBackToStep1Btn) {
            deleteBackToStep1Btn.addEventListener('click', function (e) {
                e.preventDefault();
                backToStep1();
            });
        }

        if (deleteBackToStep2Btn) {
            deleteBackToStep2Btn.addEventListener('click', function (e) {
                e.preventDefault();
                backToStep2();
            });
        }

        // Enter key navigation
        const passwordField = document.getElementById('delete-password');
        const otpField = document.getElementById('delete-otp');

        if (passwordField) {
            passwordField.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('⌨️ DeleteAccount: Enter pressed in password field');
                    goToDeleteStep2();
                }
            });
        }

        if (otpField) {
            otpField.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('⌨️ DeleteAccount: Enter pressed in OTP field');
                    goToDeleteStep3();
                }
            });
        }

        // ป้องกันการ submit อัตโนมัติของฟอร์มเฉพาะเมื่ออยู่ในขั้นตอนสุดท้าย
        deleteAccountForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('📋 DeleteAccount: Form submit intercepted');

            // ตรวจสอบว่าอยู่ในขั้นตอนสุดท้ายหรือไม่
            if (deleteStep3.classList.contains('d-none')) {
                console.log('⚠️ DeleteAccount: Not in final step, ignoring submit');
                return;
            }

            console.log('🚨 DeleteAccount: Final submit triggered');
            fixRequiredOnVisibleFields(deleteAccountForm);

            const password = document.getElementById('delete-password').value.trim();
            const confirm = document.getElementById('delete-confirm').checked;

            if (!confirm) {
                deleteStatusAlert.className = 'alert alert-warning';
                deleteStatusAlert.textContent = 'กรุณายืนยันการลบบัญชี';
                deleteStatusDiv.classList.remove('d-none');
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                deleteStatusAlert.className = 'alert alert-danger';
                deleteStatusAlert.textContent = 'ไม่พบโทเคน กรุณาเข้าสู่ระบบใหม่';
                deleteStatusDiv.classList.remove('d-none');
                return;
            }

            try {
                const response = await fetch('/api/deleteAccount', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ password })
                });

                const result = await response.json();

                if (response.ok) {
                    deleteStatusAlert.className = 'alert alert-success';
                    deleteStatusAlert.textContent = result.message || 'ลบบัญชีสำเร็จ';
                    localStorage.removeItem('token');
                    setTimeout(() => window.location.href = '/public/login', 2000);
                } else {
                    deleteStatusAlert.className = 'alert alert-danger';
                    deleteStatusAlert.textContent = result.message || 'เกิดข้อผิดพลาดในการลบบัญชี';
                }

                deleteStatusDiv.classList.remove('d-none');
            } catch (err) {
                deleteStatusAlert.className = 'alert alert-danger';
                deleteStatusAlert.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
                deleteStatusDiv.classList.remove('d-none');
            }
        });

        // 🔁 Initialize
        console.log('🔁 DeleteAccount: Initializing form...');
        fixRequiredOnVisibleFields(deleteAccountForm);
    };

    // เริ่มต้นการทำงาน
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDeleteAccount);
    } else {
        // DOM พร้อมแล้ว รอเล็กน้อยแล้วเริ่ม
        setTimeout(initializeDeleteAccount, 100);
    }
}
