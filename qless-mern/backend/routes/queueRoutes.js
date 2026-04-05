const express = require('express');
const router = express.Router();
const {
  joinQueue,
  joinEmergencyQueue,
  getQueueStatus,
  callNext,
  markNoShow,
  getServiceQueue,
} = require('../controllers/queueController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

// User actions
router.post('/join/:serviceId', protect, authorize('user'), joinQueue);
router.post('/emergency/:serviceId', protect, authorize('user'), joinEmergencyQueue);
router.get('/status/:serviceId', protect, getQueueStatus);

// Seller actions
router.get('/:serviceId', protect, authorize('seller', 'admin'), getServiceQueue);
router.put('/next/:serviceId', protect, authorize('seller', 'admin'), callNext);
router.delete('/noshow/:tokenId', protect, authorize('seller', 'admin'), markNoShow);

module.exports = router;
