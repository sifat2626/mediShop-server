const express = require('express');
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware');

const router = express.Router();

// Product Routes
router.route('/')
    .get(getProducts) // Get all products
    .post(authenticateUser, authorizeRoles('admin'), upload.array('photos', 5), addProduct); // Add a new product

router.route('/:id')
    .get(getProductById) // Get a single product by ID
    .put(authenticateUser, authorizeRoles('admin'), upload.array('photos', 5), updateProduct) // Update a product
    .delete(authenticateUser, authorizeRoles('admin'), deleteProduct); // Delete a product

module.exports = router;
