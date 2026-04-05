const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const QueueEntry = require('../models/QueueEntry');

// @desc    Get platform-wide analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const activeProviders = await Service.countDocuments({ systemSuspended: false });
    const totalProviders = await Service.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow },
    });
    const emergencyRevenue = await QueueEntry.aggregate([
      { $match: { isEmergency: true, createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$emergencyFee' } } },
    ]);
    const bookingRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);

    const totalRevenue =
      (emergencyRevenue[0]?.total || 0) + (bookingRevenue[0]?.total || 0);

    res.json({
      totalUsers,
      totalSellers,
      activeProviders,
      totalProviders,
      todayBookings,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user suspension
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
const toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot suspend an admin account.' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.json({ message: `User ${user.status === 'active' ? 'reactivated' : 'suspended'}.`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all service providers
// @route   GET /api/admin/services
// @access  Private (Admin)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const servicesWithQueue = await Promise.all(
      services.map(async (s) => {
        const queueSize = await QueueEntry.countDocuments({ service: s._id, status: 'waiting' });
        return { ...s.toObject(), queueSize };
      })
    );

    res.json(servicesWithQueue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle service suspension
// @route   PUT /api/admin/services/:id/suspend
// @access  Private (Admin)
const toggleServiceSuspension = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    service.systemSuspended = !service.systemSuspended;
    await service.save();

    res.json({
      message: `Service ${service.systemSuspended ? 'suspended' : 'reactivated'}.`,
      service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics, getAllUsers, toggleUserSuspension, getAllServices, toggleServiceSuspension };
