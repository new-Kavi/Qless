const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create a new time-slot booking
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const { serviceId, slotTime, slotTimeDisplay, price } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (service.systemSuspended) return res.status(400).json({ message: 'This service is currently unavailable.' });

    // Check if slot is already booked (same service, same time, not cancelled)
    const slotDateTime = new Date(slotTime);
    const existingBooking = await Booking.findOne({
      service: serviceId,
      slotTime: slotDateTime,
      status: { $ne: 'cancelled' },
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    const booking = await Booking.create({
      service: serviceId,
      user: req.user._id,
      slotTime: slotDateTime,
      slotTimeDisplay,
      price: price || service.slotPrice,
    });

    await booking.populate('service', 'name location');

    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/mine
// @access  Private (User)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('service', 'name location category')
      .sort({ slotTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings for a specific service (Seller view)
// @route   GET /api/bookings/service/:serviceId
// @access  Private (Seller)
const getServiceBookings = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookings = await Booking.find({
      service: req.params.serviceId,
      slotTime: { $gte: today, $lt: tomorrow },
    })
      .populate('user', 'name email')
      .sort({ slotTime: 1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seller marks a booking as completed
// @route   PUT /api/bookings/:id/complete
// @access  Private (Seller)
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    res.json({ message: 'Booking marked as completed.', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (User - own bookings only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully.', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getServiceBookings, completeBooking, cancelBooking };
