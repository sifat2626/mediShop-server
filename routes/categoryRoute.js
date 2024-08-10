const express = require('express');
const {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Primary, Secondary, and Tertiary Category Routes
router.route('/categories')
    .get(getCategories) // Get all categories
    .post(authenticateUser, authorizeRoles('admin'), addCategory); // Add a new category

router.route('/categories/:id')
    .put(authenticateUser, authorizeRoles('admin'), updateCategory) // Update a category
    .delete(authenticateUser, authorizeRoles('admin'), deleteCategory); // Delete a category

module.exports = router;
