const express = require('express');
const userController = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware'); // Import the multer middleware

const router = express.Router();

// Public Routes
router.post('/register', upload.single('photo'), userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);
router.post('/login', userController.login);
router.post('/refresh-token', userController.refreshToken);

// Protected Routes (Requires Authentication)
router.post('/logout', authenticateUser, userController.logout);

// Role-based Authorization Example
// Only "admin" or "super admin" can access this route
router.get('/admin-dashboard', authenticateUser, authorizeRoles('admin', 'super admin'), (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;
