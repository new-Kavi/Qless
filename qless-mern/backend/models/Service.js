const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Hospital', 'Bank', 'Government', 'Salon', 'Other'],
  },
  location: {
    type: String,
    required: true,
  },
  timings: {
    type: String,
    default: '09:00 AM - 05:00 PM',
  },
  closedDays: {
    type: [Number], // 0=Sun, 1=Mon, ..., 6=Sat
    default: [],
  },
  status: {
    type: String,
    enum: ['Open', 'Busy', 'Closed'],
    default: 'Open',
  },
  description: {
    type: String,
    default: '',
  },
  allowsInstantQueue: {
    type: Boolean,
    default: true,
  },
  hasEmergencyAccess: {
    type: Boolean,
    default: false,
  },
  slotDurationMins: {
    type: Number,
    default: 30,
  },
  slotPrice: {
    type: Number,
    default: 0,
  },
  averageWaitTimePerPerson: {
    type: Number,
    default: 5, // minutes
  },
  systemSuspended: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
