const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    trim: true
  },
  services: [{
    category: {
      type: String,
      required: true,
      enum: ['plumbing', 'electrical', 'cleaning', 'gardening', 'painting', 'carpentry', 'appliance_repair', 'other']
    },
    subcategory: String,
    hourlyRate: {
      type: Number,
      required: true
    },
    description: String
  }],
  serviceArea: {
    pincode: {
      type: String,
      required: true
    },
    radius: {
      type: Number,
      default: 5 // in kilometers
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  verification: {
    aadhaarVerified: {
      type: Boolean,
      default: false
    },
    aadhaarNumber: String,
    aadhaarDocument: String,
    policeVerification: {
      type: Boolean,
      default: false
    },
    backgroundCheck: {
      type: Boolean,
      default: false
    }
  },
  profile: {
    experience: Number, // in years
    portfolio: [String], // image URLs
    certifications: [String],
    languages: [String],
    availability: {
      monday: { start: String, end: String, available: Boolean },
      tuesday: { start: String, end: String, available: Boolean },
      wednesday: { start: String, end: String, available: Boolean },
      thursday: { start: String, end: String, available: Boolean },
      friday: { start: String, end: String, available: Boolean },
      saturday: { start: String, end: String, available: Boolean },
      sunday: { start: String, end: String, available: Boolean }
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline'
  },
  isQuickAdd: {
    type: Boolean,
    default: false
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  stats: {
    totalJobs: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    acceptanceRate: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  badges: [{
    type: String,
    enum: ['aadhaar_verified', 'top_rated', 'quick_response', 'new', 'experienced']
  }],
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better performance
providerSchema.index({ 'serviceArea.pincode': 1 });
providerSchema.index({ 'services.category': 1 });
providerSchema.index({ 'ratings.average': -1 });
providerSchema.index({ status: 1 });

module.exports = mongoose.model('Provider', providerSchema);