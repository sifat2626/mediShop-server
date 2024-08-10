const express = require('express');
const {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/shippingAddressController');
const { authenticateUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// Shipping Address Routes
router.route('/')
    .get(authenticateUser, getAddresses) // Get all addresses (for authenticated users)
    .post(authenticateUser, addAddress); // Add a new address

router.route('/:id')
    .put(authenticateUser, updateAddress) // Update an address
    .delete(authenticateUser, deleteAddress); // Delete an address

module.exports = router;
