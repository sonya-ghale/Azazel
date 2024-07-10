const express = require('express');
const authController = require('../controllers/auth');
// const submissionsController = require('../controllers/submissions');
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get('/personal_info', authController.personal_info);
router.post('/update', authController.update);

// //can't work with out this code
module.exports = router;
