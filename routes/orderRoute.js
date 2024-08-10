const express = require('express');
const {
    getOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder
} = require('../controllers/orderController');
const { authenticateUser, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Order Routes
router.route('/')
    .get(authenticateUser, authorizeRoles('admin', 'user'), getOrders) // Get all orders
    .post(authenticateUser, authorizeRoles('user'), addOrder); // Add a new order

router.route('/:id')
    .get(authenticateUser, authorizeRoles('admin', 'user'), getOrderById) // Get a single order by ID
    .put(authenticateUser, authorizeRoles('admin'), updateOrder) // Update an order
    .delete(authenticateUser, authorizeRoles('admin'), deleteOrder); // Delete an order

module.exports = router;
