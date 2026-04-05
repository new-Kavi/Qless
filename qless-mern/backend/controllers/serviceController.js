const Service = require('../models/Service');
const QueueEntry = require('../models/QueueEntry');

// @desc    Get all active (non-suspended) services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const services = await Service.find({ systemSuspended: false })
      .populate('owner', 'name email')
      .lean();

    // Attach live queue count to each service
    const servicesWithQueue = await Promise.all(
      services.map(async (service) => {
        const queueSize = await QueueEntry.countDocuments({
          service: service._id,
          status: 'waiting',
        });
        return { ...service, queueSize };
      })
    );

    res.json(servicesWithQueue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('owner', 'name email')
      .lean();

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const queueSize = await QueueEntry.countDocuments({
      service: service._id,
      status: 'waiting',
    });

    res.json({ ...service, queueSize });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Seller only)
const createService = async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      owner: req.user._id,
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update service info (e.g. toggle status Open/Busy/Closed)
// @route   PUT /api/services/:id
// @access  Private (Seller - owner only)
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Ensure this seller owns the service
    if (service.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service.' });
    }

    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get services owned by the current seller
// @route   GET /api/services/mine
// @access  Private (Seller)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ owner: req.user._id }).lean();

    const servicesWithQueue = await Promise.all(
      services.map(async (service) => {
        const queueSize = await QueueEntry.countDocuments({
          service: service._id,
          status: 'waiting',
        });
        return { ...service, queueSize };
      })
    );

    res.json(servicesWithQueue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getServices, getServiceById, createService, updateService, getMyServices };
