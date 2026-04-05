const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getServiceBookings,
  completeBooking,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('user'), createBooking);
router.get('/mine', protect, authorize('user'), getMyBookings);
router.get('/service/:serviceId', protect, authorize('seller', 'admin'), getServiceBookings);
router.put('/:id/complete', protect, authorize('seller', 'admin'), completeBooking);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);

module.exports = router;
