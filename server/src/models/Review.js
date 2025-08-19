const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  tags: [{
    type: String,
    enum: ['excellent_work', 'on_time', 'professional', 'courteous', 'clean_work', 'fair_pricing', 'knowledgeable', 'quick_service']
  }],
  images: [String], // URLs to uploaded images
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    text: String,
    date: Date,
    isProviderResponse: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ 'rating.overall': -1 });

module.exports = mongoose.model('Review', reviewSchema);