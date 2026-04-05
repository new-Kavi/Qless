const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokenNumber: {
    type: String,
    required: true,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  emergencyReason: {
    type: String,
    default: '',
  },
  emergencyFee: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'completed', 'noshow'],
    default: 'waiting',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
