const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', [
  body('providerId').notEmpty().withMessage('Provider ID is required'),
  body('serviceCategory').notEmpty().withMessage('Service category is required'),
  body('description').notEmpty().withMessage('Service description is required'),
  body('location.address').notEmpty().withMessage('Service address is required'),
  body('scheduling.preferredDate').isISO8601().withMessage('Valid preferred date is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { providerId, serviceCategory, description, location, scheduling, estimatedDuration } = req.body;

    // Get provider details
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Find matching service
    const service = provider.services.find(s => s.category === serviceCategory);
    if (!service) {
      return res.status(400).json({ message: 'Provider does not offer this service' });
    }

    // Generate OTPs
    const startOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const endOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = new Booking({
      customer: req.user.userId,
      provider: providerId,
      service: {
        category: serviceCategory,
        description,
        estimatedDuration,
        hourlyRate: service.hourlyRate
      },
      location,
      scheduling,
      otp: {
        startOTP,
        endOTP
      }
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      startOTP,
      endOTP
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { customer: req.user.userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('provider', 'userId services ratings')
      .populate({
        path: 'provider',
        populate: {
          path: 'userId',
          select: 'name phone'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider bookings
router.get('/provider-bookings', auth, async (req, res) => {
  try {
    const Provider = require('../models/Provider');
    
    // Find provider profile for current user
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { provider: provider._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name phone address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    booking.timeline[status.toLowerCase()] = new Date();

    await booking.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/:id/verify-otp', auth, async (req, res) => {
  try {
    const { otp, type } = req.body; // type: 'start' or 'end'
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (type === 'start' && booking.otp.startOTP === otp) {
      booking.otp.startOTPVerified = true;
      booking.status = 'IN_SERVICE';
      booking.timeline.inService = new Date();
    } else if (type === 'end' && booking.otp.endOTP === otp) {
      booking.otp.endOTPVerified = true;
      booking.status = 'COMPLETED';
      booking.timeline.completed = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await booking.save();

    res.json({ message: 'OTP verified successfully', booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;