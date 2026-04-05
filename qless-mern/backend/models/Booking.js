const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  slotTime: {
    type: Date,
    required: [true, 'Slot time is required'],
  },
  slotTimeDisplay: {
    type: String, // Human-readable e.g. "10:00 AM"
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
  bookingId: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

// Auto-generate a booking ID before save
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = `BKG-${Math.floor(Math.random() * 90000) + 10000}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
