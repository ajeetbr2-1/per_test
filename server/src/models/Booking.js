const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  service: {
    category: {
      type: String,
      required: true
    },
    subcategory: String,
    description: {
      type: String,
      required: true
    },
    estimatedDuration: Number, // in hours
    hourlyRate: {
      type: Number,
      required: true
    }
  },
  location: {
    address: {
      type: String,
      required: true
    },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  scheduling: {
    preferredDate: {
      type: Date,
      required: true
    },
    preferredTime: String,
    flexibility: {
      type: String,
      enum: ['strict', 'flexible'],
      default: 'flexible'
    }
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'ON_THE_WAY', 'IN_SERVICE', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'online', 'card'],
      default: 'cash'
    },
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    transactionId: String
  },
  otp: {
    startOTP: String,
    endOTP: String,
    startOTPVerified: {
      type: Boolean,
      default: false
    },
    endOTPVerified: {
      type: Boolean,
      default: false
    }
  },
  timeline: {
    requested: {
      type: Date,
      default: Date.now
    },
    accepted: Date,
    rejected: Date,
    onTheWay: Date,
    inService: Date,
    completed: Date,
    cancelled: Date
  },
  notes: {
    customer: String,
    provider: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'scheduling.preferredDate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);