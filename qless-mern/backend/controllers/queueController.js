const QueueEntry = require('../models/QueueEntry');
const Service = require('../models/Service');

// Helper: Generate next token number for a service
const getNextToken = async (serviceId, isEmergency) => {
  if (isEmergency) {
    const emergencyCount = await QueueEntry.countDocuments({ service: serviceId, isEmergency: true });
    return `EMG-${String(emergencyCount + 1).padStart(3, '0')}`;
  }
  const totalToday = await QueueEntry.countDocuments({ service: serviceId });
  return `T-${String(totalToday + 101).padStart(3, '0')}`;
};

// @desc    Join the live queue for a service
// @route   POST /api/queue/join/:serviceId
// @access  Private (User)
const joinQueue = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (!service.allowsInstantQueue) return res.status(400).json({ message: 'This service does not accept walk-ins.' });
    if (service.status === 'Closed' || service.systemSuspended) {
      return res.status(400).json({ message: 'This service is currently closed.' });
    }

    // Check if user is already in this queue
    const existing = await QueueEntry.findOne({
      service: service._id,
      user: req.user._id,
      status: 'waiting',
    });
    if (existing) {
      return res.status(400).json({ message: 'You are already in this queue.', entry: existing });
    }

    const tokenNumber = await getNextToken(service._id, false);

    const entry = await QueueEntry.create({
      service: service._id,
      user: req.user._id,
      tokenNumber,
      isEmergency: false,
    });

    const position = await QueueEntry.countDocuments({
      service: service._id,
      status: 'waiting',
      joinedAt: { $lte: entry.joinedAt },
    });

    res.status(201).json({
      ...entry.toObject(),
      position,
      estimatedWait: (position - 1) * service.averageWaitTimePerPerson,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join queue as emergency (priority)
// @route   POST /api/queue/emergency/:serviceId
// @access  Private (User)
const joinEmergencyQueue = async (req, res) => {
  try {
    const { emergencyReason } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) return res.status(404).json({ message: 'Service not found.' });
    if (!service.hasEmergencyAccess) return res.status(400).json({ message: 'This service does not support emergency access.' });

    const tokenNumber = await getNextToken(service._id, true);
    const emergencyFee = 150.00;

    const entry = await QueueEntry.create({
      service: service._id,
      user: req.user._id,
      tokenNumber,
      isEmergency: true,
      emergencyReason: emergencyReason || '',
      emergencyFee,
      status: 'waiting',
    });

    res.status(201).json({
      ...entry.toObject(),
      position: 1, // Emergency always goes to front
      estimatedWait: 0,
      message: 'PRIORITY ENTRY. Proceed immediately to the service desk.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's queue status for a service
// @route   GET /api/queue/status/:serviceId
// @access  Private
const getQueueStatus = async (req, res) => {
  try {
    const entry = await QueueEntry.findOne({
      service: req.params.serviceId,
      user: req.user._id,
      status: 'waiting',
    });

    if (!entry) {
      return res.status(404).json({ message: 'You are not in this queue.' });
    }

    const service = await Service.findById(req.params.serviceId);

    // Count how many people are ahead (earlier joinedAt, not emergency bumped)
    const peopleAhead = await QueueEntry.countDocuments({
      service: req.params.serviceId,
      status: 'waiting',
      isEmergency: false,
      joinedAt: { $lt: entry.joinedAt },
    });

    const estimatedWait = peopleAhead * (service?.averageWaitTimePerPerson || 5);

    res.json({
      entry,
      peopleAhead,
      estimatedWait,
      isEmergency: entry.isEmergency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seller calls the next token (removes from front of queue)
// @route   PUT /api/queue/next/:serviceId
// @access  Private (Seller)
const callNext = async (req, res) => {
  try {
    // Emergency entries come first, then normal sorted by joinedAt
    const nextEmergency = await QueueEntry.findOne({
      service: req.params.serviceId,
      status: 'waiting',
      isEmergency: true,
    }).sort({ joinedAt: 1 });

    const nextEntry = nextEmergency || await QueueEntry.findOne({
      service: req.params.serviceId,
      status: 'waiting',
      isEmergency: false,
    }).sort({ joinedAt: 1 });

    if (!nextEntry) {
      return res.status(404).json({ message: 'Queue is empty.' });
    }

    nextEntry.status = 'called';
    await nextEntry.save();

    res.json({ message: `Calling ${nextEntry.tokenNumber}`, entry: nextEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seller marks a queue entry as no-show
// @route   DELETE /api/queue/noshow/:tokenId
// @access  Private (Seller)
const markNoShow = async (req, res) => {
  try {
    const entry = await QueueEntry.findByIdAndUpdate(
      req.params.tokenId,
      { status: 'noshow' },
      { new: true }
    );

    if (!entry) return res.status(404).json({ message: 'Queue entry not found.' });

    res.json({ message: 'Marked as no-show.', entry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full queue list for a service (Seller view)
// @route   GET /api/queue/:serviceId
// @access  Private (Seller)
const getServiceQueue = async (req, res) => {
  try {
    // Emergency entries first, then FIFO
    const queue = await QueueEntry.find({
      service: req.params.serviceId,
      status: 'waiting',
    })
      .populate('user', 'name email')
      .sort({ isEmergency: -1, joinedAt: 1 });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { joinQueue, joinEmergencyQueue, getQueueStatus, callNext, markNoShow, getServiceQueue };
