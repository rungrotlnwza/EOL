// Profile Management Logic
export function setupProfileManager() {
    console.log('🔧 ProfileManager: Initializing...');
    // ====== ดึงข้อมูลโปรไฟล์จาก API และแสดงผล ======
    async function loadUserProfile(forceRefresh = false) {
        const token = localStorage.getItem('token');
        if (!token) return;

        // ตรวจสอบ cache ที่มีอยู่
        const cachedData = localStorage.getItem('profileData');
        const cacheTime = localStorage.getItem('profileCacheTime');
        const CACHE_DURATION = 5 * 60 * 1000; // 5 นาที

        if (!forceRefresh && cachedData && cacheTime) {
            const timeDiff = Date.now() - parseInt(cacheTime);
            if (timeDiff < CACHE_DURATION) {
                // ใช้ข้อมูลจาก cache
                console.log('Using cached profile data');
                try {
                    const data = JSON.parse(cachedData);
                    if (data.profile) {
                        renderProfile(data.profile);
                        return; // ออกจากฟังก์ชันเพราะใช้ cache แล้ว
                    }
                } catch (e) {
                    console.warn('Invalid cached data, will fetch from API');
                }
            }
        }

        // โหลดจาก API เฉพาะเมื่อไม่มี cache หรือ cache หมดอายุ
        console.log('Fetching profile data from API');

        // ดึงข้อมูลเก่าที่ cache ไว้สำหรับ merge (ถ้ามี)
        let cachedProfile = null;
        if (cachedData) {
            try {
                cachedProfile = JSON.parse(cachedData).profile;
            } catch (e) {
                console.warn('Invalid cached profile data for merge');
            }
        }

        try {
            const res = await fetch('/api/getUserProfile', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const data = await res.json();
            if (data.status === 'success' && data.profile) {
                // Merge ข้อมูลใหม่กับข้อมูลที่ cache ไว้ (ให้ความสำคัญกับข้อมูลใหม่)
                const mergedProfile = {
                    ...cachedProfile, // ข้อมูลเก่าที่ cache ไว้
                    ...data.profile,  // ข้อมูลใหม่จาก API (จะ override ข้อมูลเก่า)
                    // รักษาวันเกิดที่ cache ไว้ถ้าข้อมูลใหม่ไม่มีหรือเป็น null/empty
                    date_of_birth: data.profile.date_of_birth || cachedProfile?.date_of_birth || null
                };

                console.log('Cached date_of_birth:', cachedProfile?.date_of_birth);
                console.log('API date_of_birth:', data.profile.date_of_birth);
                console.log('Merged date_of_birth:', mergedProfile.date_of_birth);

                const mergedData = {
                    ...data,
                    profile: mergedProfile
                };

                // บันทึก cache พร้อมเวลา
                localStorage.setItem('profileData', JSON.stringify(mergedData));
                localStorage.setItem('profileCacheTime', Date.now().toString());

                renderProfile(mergedProfile);
            } else {
                alert('โหลดข้อมูลไม่สำเร็จ: ' + data.message);
                console.error('โหลดข้อมูลโปรไฟล์ล้มเหลว:', data);
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch (err) {
            console.error('โหลดข้อมูลโปรไฟล์ล้มเหลว:', err);
            alert('เกิดข้อผิดพลาดในการโหลดโปรไฟล์');
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }

    function renderProfile(p) {
        document.getElementById('profile-fullname').textContent = `${p.first_name || ''} ${p.last_name || ''}`;
        document.getElementById('profile-role-label').textContent = p.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้';
        document.getElementById('profile-role-badge').textContent = 'สถานะ: ' + (p.role === 'admin' ? 'Admin' : 'User');
        document.getElementById('profile-role-desc').textContent =
            p.role === 'admin'
                ? 'คุณเป็นผู้ดูแลระบบ มีสิทธิ์จัดการข้อมูลและผู้ใช้ทั้งหมด'
                : 'บัญชีผู้ใช้งานทั่วไป เข้าถึงฟีเจอร์พื้นฐาน';
        document.getElementById('profile-username').textContent = p.username || '-';
        document.getElementById('profile-fname').textContent = p.first_name || '-';
        document.getElementById('profile-lname').textContent = p.last_name || '-';
        document.getElementById('profile-gender').textContent = p.gender || '-';
        const profileDobElem = document.getElementById('profile-dob');
        if (profileDobElem) {
            profileDobElem.textContent = p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('en-CA') : '-';
        }
        document.getElementById('profile-education').textContent = p.education || '-';
        document.getElementById('profile-address').textContent = p.address || '-';
        document.getElementById('profile-email').textContent = p.email || '-';
        document.getElementById('profile-phone').textContent = p.phone || '-';

        // แสดงรูปโปรไฟล์ถ้ามี (ใช้ base64 data จาก API)
        const profileAvatar = document.getElementById('profile-avatar');
        if (p.profile_image_data) {
            // ใช้ base64 data URL ที่ได้จาก getUserProfile API
            profileAvatar.src = p.profile_image_data;

            // อัปเดตรูปใน update form ด้วย
            const currentImagePreview = document.getElementById('current-image-preview');
            const currentImageContainer = document.getElementById('current-profile-image');
            if (currentImagePreview && currentImageContainer) {
                currentImagePreview.src = p.profile_image_data;
                currentImageContainer.style.display = 'block';
            }
        } else {
            // ไม่มีรูปโปรไฟล์ ใช้รูป default
            profileAvatar.src = 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp';
        }
    }

    // ฟังก์ชันสำหรับจัดการฟอร์มอัปเดตโปรไฟล์
    function setupUpdateProfileForm() {
        console.log('📝 ProfileManager: Setting up update profile form...');
        // รอให้ DOM โหลดเสร็จก่อน
        setTimeout(() => {
            const updateForm = document.getElementById('updateProfileForm');
            const loadDataBtn = document.getElementById('loadCurrentDataBtn');
            const updateStatus = document.getElementById('updateStatus');
            const profileImageInput = document.getElementById('profile-image');
            const newImagePreview = document.getElementById('new-image-preview');
            const newImageContainer = document.getElementById('new-profile-image-preview');

            if (!updateForm) {
                console.warn('❌ ProfileManager: Update profile form not found');
                return;
            } else {
                console.log('✅ ProfileManager: Update profile form found');
            }

            // ตรวจสอบ required elements
            const requiredElements = [
                'update-fname', 'update-lname', 'update-email', 'update-phone',
                'update-gender', 'update-dob', 'update-education', 'update-address'
            ];

            const missingElements = requiredElements.filter(id => !document.getElementById(id));
            if (missingElements.length > 0) {
                console.warn('❌ ProfileManager: Missing form elements:', missingElements);
                return;
            } else {
                console.log('✅ ProfileManager: All form elements found');
            }

            // ฟังก์ชันโหลดข้อมูลลงในฟอร์ม
            function loadDataToForm() {
                const profileData = localStorage.getItem('profileData');
                if (profileData) {
                    const data = JSON.parse(profileData);
                    const profile = data.profile;

                    console.log('Loading data to form, date_of_birth:', profile.date_of_birth);

                    document.getElementById('update-fname').value = profile.first_name || '';
                    document.getElementById('update-lname').value = profile.last_name || '';
                    document.getElementById('update-email').value = profile.email || '';
                    document.getElementById('update-phone').value = profile.phone || '';
                    document.getElementById('update-gender').value = profile.gender || '';

                    // --- Date of Birth: format for <input type="date"> ---
                    let dobValue = '';
                    if (profile.date_of_birth) {
                        // Handle ISO string with time (e.g. 2002-06-25T17:00:00.000Z)
                        const d = new Date(profile.date_of_birth);
                        if (!isNaN(d)) {
                            dobValue = d.toISOString().slice(0, 10); // yyyy-MM-dd
                        }
                    }
                    document.getElementById('update-dob').value = dobValue;
                    console.log('Form date_of_birth field value before loading:', document.getElementById('update-dob').value);

                    document.getElementById('update-education').value = profile.education || '';
                    document.getElementById('update-address').value = profile.address || '';
                    // แสดงรูปโปรไฟล์ปัจจุบันถ้ามี (ใช้ base64 data)
                    if (profile.profile_image_data) {
                        const currentImagePreview = document.getElementById('current-image-preview');
                        const currentImageContainer = document.getElementById('current-profile-image');
                        if (currentImagePreview && currentImageContainer) {
                            currentImagePreview.src = profile.profile_image_data;
                            currentImageContainer.style.display = 'block';
                        }
                    }

                    return true;
                }
                return false;
            }

            // จัดการการแสดงตัวอย่างรูปใหม่
            if (profileImageInput) {
                profileImageInput.addEventListener('change', function (e) {
                    const file = e.target.files[0];
                    if (file) {
                        // ตรวจสอบประเภทไฟล์
                        if (!file.type.startsWith('image/')) {
                            alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
                            e.target.value = '';
                            if (newImageContainer) newImageContainer.style.display = 'none';
                            return;
                        }

                        // ตรวจสอบขนาดไฟล์ (5MB)
                        if (file.size > 5 * 1024 * 1024) {
                            alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
                            e.target.value = '';
                            if (newImageContainer) newImageContainer.style.display = 'none';
                            return;
                        }

                        // แสดงตัวอย่างรูป
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            if (newImagePreview) {
                                newImagePreview.src = e.target.result;
                                if (newImageContainer) newImageContainer.style.display = 'block';
                            }
                        };
                        reader.readAsDataURL(file);
                    } else {
                        if (newImageContainer) newImageContainer.style.display = 'none';
                    }
                });
            }

            // โหลดข้อมูลเริ่มต้นทันทีที่เข้า tab
            setTimeout(() => {
                loadDataToForm();
            }, 200);

            // โหลดข้อมูลปัจจุบันลงในฟอร์มเมื่อคลิกปุ่ม (force refresh จาก API)
            if (loadDataBtn) {
                loadDataBtn.addEventListener('click', async function () {
                    // ปิดใช้งานปุ่มชั่วคราว
                    loadDataBtn.disabled = true;
                    loadDataBtn.textContent = 'กำลังโหลด...';

                    try {
                        // โหลดข้อมูลใหม่จาก API (force refresh)
                        await loadUserProfile(true);

                        // รอสักครู่แล้วโหลดข้อมูลใหม่ลงฟอร์ม
                        setTimeout(() => {
                            if (loadDataToForm()) {
                                alert('โหลดข้อมูลล่าสุดเรียบร้อยแล้ว');
                            } else {
                                alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                            }
                        }, 500);

                    } catch (error) {
                        console.error('Error loading profile:', error);
                        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                    } finally {
                        // เปิดใช้งานปุ่มกลับ
                        loadDataBtn.disabled = false;
                        loadDataBtn.textContent = 'โหลดข้อมูลปัจจุบัน';
                    }
                });
            }

            // จัดการการส่งฟอร์ม
            updateForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const token = localStorage.getItem('token');
                if (!token) {
                    alert('กรุณาเข้าสู่ระบบใหม่');
                    window.location.href = '/login';
                    return;
                }

                // แสดงสถานะกำลังอัปเดต
                updateStatus.style.display = 'block';
                const alertDiv = updateStatus.querySelector('.alert') || updateStatus;
                alertDiv.className = 'alert alert-info';
                alertDiv.textContent = '⏳ กำลังอัปเดตข้อมูล...';

                // สร้าง FormData สำหรับส่งข้อมูลและไฟล์
                const formData = new FormData();
                formData.append('first_name', document.getElementById('update-fname').value.trim());
                formData.append('last_name', document.getElementById('update-lname').value.trim());
                formData.append('email', document.getElementById('update-email').value.trim());
                formData.append('phone', document.getElementById('update-phone').value.trim());
                formData.append('gender', document.getElementById('update-gender').value);
                formData.append('date_of_birth', document.getElementById('update-dob').value);
                formData.append('education', document.getElementById('update-education').value);
                formData.append('address', document.getElementById('update-address').value.trim());

                // เพิ่มไฟล์รูปถ้ามีการเลือก
                const profileImageFile = profileImageInput.files[0];
                if (profileImageFile) {
                    formData.append('profile_image', profileImageFile);
                }

                try {
                    const response = await fetch('/api/updateUserProfile', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + token
                            // ไม่ต้องใส่ Content-Type เพราะ FormData จะตั้งค่าให้เอง
                        },
                        body: formData
                    });

                    const result = await response.json();

                    if (response.ok && result.status === 'success') {
                        alertDiv.className = 'alert alert-success';
                        alertDiv.textContent = '✅ อัปเดตข้อมูลสำเร็จ! กำลังไปที่หน้าโปรไฟล์...';

                        // Cache วันเกิดและข้อมูลที่อัปเดตไว้ก่อนไปหน้าใหม่
                        const currentProfileData = localStorage.getItem('profileData');
                        let updatedProfileData = null;

                        if (currentProfileData) {
                            try {
                                const currentData = JSON.parse(currentProfileData);

                                // สร้างข้อมูลโปรไฟล์ที่อัปเดตใหม่
                                const formBirthDate = document.getElementById('update-dob').value;
                                console.log('Form date_of_birth before update:', formBirthDate);
                                console.log('Current cached date_of_birth:', currentData.profile?.date_of_birth);

                                updatedProfileData = {
                                    ...currentData,
                                    profile: {
                                        ...currentData.profile,
                                        first_name: document.getElementById('update-fname').value.trim() || currentData.profile?.first_name,
                                        last_name: document.getElementById('update-lname').value.trim() || currentData.profile?.last_name,
                                        email: document.getElementById('update-email').value.trim() || currentData.profile?.email,
                                        phone: document.getElementById('update-phone').value.trim() || currentData.profile?.phone,
                                        gender: document.getElementById('update-gender').value || currentData.profile?.gender,
                                        // ใช้วันเกิดจากฟอร์ม หรือถ้าไม่มีให้ใช้ของเก่าที่ cache ไว้
                                        date_of_birth: formBirthDate || currentData.profile?.date_of_birth || null,
                                        education: document.getElementById('update-education').value || currentData.profile?.education,
                                        address: document.getElementById('update-address').value.trim() || currentData.profile?.address
                                    }
                                };

                                console.log('Updated date_of_birth will be:', updatedProfileData.profile.date_of_birth);

                                // บันทึกข้อมูลที่อัปเดตแล้วกลับไป localStorage พร้อมอัปเดต cache time
                                localStorage.setItem('profileData', JSON.stringify(updatedProfileData));
                                localStorage.setItem('profileCacheTime', Date.now().toString());

                            } catch (e) {
                                console.error('Error processing profile data during update:', e);
                            }
                        }

                        // redirect ไปที่ dashboard#profile โดยไม่ลบ profileData ที่อัปเดตแล้ว
                        setTimeout(() => {
                            window.location.href = '/dashboard#profile';
                        }, 1500);

                    } else {
                        alertDiv.className = 'alert alert-danger';
                        alertDiv.textContent = `❌ เกิดข้อผิดพลาด: ${result.message || 'ไม่สามารถอัปเดตข้อมูลได้'}`;
                    }
                } catch (error) {
                    console.error('Update profile error:', error);
                    alertDiv.className = 'alert alert-danger';
                    alertDiv.textContent = '❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
                }
            });
        }, 100); // ปิด setTimeout
    }

    // เพิ่มฟังก์ชัน global สำหรับล้าง cache (สำหรับ debug)
    window.clearProfileCache = function () {
        localStorage.removeItem('profileData');
        localStorage.removeItem('profileCacheTime');
        console.log('Profile cache cleared');
    };

    // เพิ่มฟังก์ชัน global สำหรับดู cache info
    window.getCacheInfo = function () {
        const cacheTime = localStorage.getItem('profileCacheTime');
        const cacheData = localStorage.getItem('profileData');
        if (cacheTime && cacheData) {
            const age = Date.now() - parseInt(cacheTime);
            console.log('Cache age:', Math.round(age / 1000), 'seconds');
            console.log('Cache data:', JSON.parse(cacheData));
        } else {
            console.log('No cache found');
        }
    };

    // Initialize profile management
    console.log('🚀 ProfileManager: Loading user profile...');
    loadUserProfile();
    console.log('🚀 ProfileManager: Setting up update profile form...');
    setupUpdateProfileForm();
    console.log('✅ ProfileManager: Initialization complete');

    // Export loadUserProfile for use by other modules
    return {
        loadUserProfile
    };
}
