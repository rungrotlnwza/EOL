const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

module.exports = function generateKeys() {
  // สร้างโฟลเดอร์ key ถ้ายังไม่มี
  const keyDir = path.join(__dirname, '../key');
  const privateKeyPath = path.join(keyDir, 'privatekey.pem');
  const publicKeyPath = path.join(keyDir, 'publickey.pem');

  if (!fs.existsSync(keyDir)) {
    fs.mkdirSync(keyDir);
  }

  // สร้าง key ถ้ายังไม่มี
  if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
    console.log('🔧 กำลังสร้าง RSA key pair...');

    // สร้าง RSA key pair 2048 bits
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // บันทึกไฟล์
    fs.writeFileSync(privateKeyPath, privateKey);
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log('✅ สร้าง RSA key pair สำเร็จ!');
    console.log('📁 ไฟล์ถูกบันทึกที่:');
    console.log('   - privatekey.pem');
    console.log('   - publickey.pem');
  }
};
