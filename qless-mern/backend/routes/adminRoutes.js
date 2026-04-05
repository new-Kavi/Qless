const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  toggleUserSuspension,
  getAllServices,
  toggleServiceSuspension,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', toggleUserSuspension);
router.get('/services', getAllServices);
router.put('/services/:id/suspend', toggleServiceSuspension);

module.exports = router;
