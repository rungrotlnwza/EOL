const express = require('express');
const router = express.Router();
const uploadMiddleware = require('../middleware/upload.middleware');
const decodePublicKey = require('../middleware/decodePublicKey.middleware');
const signJwt = require('../middleware/signJwt.middleware');
const verifyJwt = require('../middleware/verifyJwt.middleware');

router.post('/example', require('../controller/exmaple.controller'));
router.post('/getPublickey', require('../controller/getPublickey.controller'));
router.post('/register', decodePublicKey, require('../controller/register.controller'));
router.post('/login', decodePublicKey, require('../controller/login.controller'), signJwt);
router.post('/getUserProfile', verifyJwt, require('../controller/getUserProfile.controller'));
router.post('/updateUserProfile', verifyJwt, uploadMiddleware.single('profile_image'), require('../controller/updateUserProfile.controller'));
router.post('/changePassword', verifyJwt, require('../controller/changePassword.controller'));
router.post('/deleteAccount', verifyJwt, require('../controller/deleteAccount.controller'));

module.exports = router;
