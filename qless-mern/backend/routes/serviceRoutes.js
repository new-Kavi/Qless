const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  getMyServices,
} = require('../controllers/serviceController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.get('/', getServices);
router.get('/mine', protect, authorize('seller'), getMyServices);
router.get('/:id', getServiceById);
router.post('/', protect, authorize('seller', 'admin'), createService);
router.put('/:id', protect, authorize('seller', 'admin'), updateService);

module.exports = router;
