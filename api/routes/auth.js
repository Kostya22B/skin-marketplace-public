const express = require('express');
const { login, callback, logout, checkAuth} = require('../controllers/authController');
const router = express.Router();

router.get('/login', login);
router.get('/callback', callback);  // Make sure this matches the Google redirect URI
router.post('/logout', logout);
router.get('/check', checkAuth);

module.exports = router;
