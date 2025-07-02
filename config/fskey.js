const fs = require('fs');
const path = require('path');

module.exports = {
  privateKey: fs.readFileSync(path.join(__dirname, '../key/privatekey.pem'), 'utf8'),
  publicKey: fs.readFileSync(path.join(__dirname, '../key/publickey.pem'), 'utf8')
};
