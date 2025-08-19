const express = require('express');
const { body, validationResult } = require('express-validator');
const Provider = require('../models/Provider');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get providers by location and filters
router.get('/search', async (req, res) => {
  try {
    const { 
      pincode, 
      radius = 5, 
      category, 
      status = 'online',
      minRating = 0,
      maxPrice,
      aadhaarVerified,
      sortBy = 'smart' 
    } = req.query;

    let query = {};

    if (pincode) {
      query['serviceArea.pincode'] = pincode;
    }

    if (category) {
      query['services.category'] = category;
    }

    if (status) {
      query.status = status;
    }

    if (aadhaarVerified === 'true') {
      query['verification.aadhaarVerified'] = true;
    }

    if (minRating > 0) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxPrice) {
      query['services.hourlyRate'] = { $lte: parseFloat(maxPrice) };
    }

    let providers = await Provider.find(query)
      .populate('userId', 'name phone')
      .lean();

    // Smart ranking algorithm
    if (sortBy === 'smart') {
      providers = providers.map(provider => {
        const availabilityWeight = provider.status === 'online' ? 1 : 0;
        const ratingWeight = provider.ratings.average / 5;
        const verificationWeight = provider.verification.aadhaarVerified ? 1 : 0;
        const experienceWeight = Math.min(provider.profile.experience / 10, 1);

        const smartScore = 
          (availabilityWeight * 0.3) + 
          (ratingWeight * 0.3) + 
          (verificationWeight * 0.25) + 
          (experienceWeight * 0.15);

        return { ...provider, smartScore };
      }).sort((a, b) => b.smartScore - a.smartScore);
    } else if (sortBy === 'rating') {
      providers.sort((a, b) => b.ratings.average - a.ratings.average);
    } else if (sortBy === 'price') {
      providers.sort((a, b) => a.services[0]?.hourlyRate - b.services[0]?.hourlyRate);
    }

    res.json(providers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create provider profile (Quick Add)
router.post('/quick-add', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('serviceCategory').notEmpty().withMessage('Service category is required'),
  body('hourlyRate').isNumeric().withMessage('Hourly rate must be a number'),
  body('pincode').notEmpty().withMessage('Pincode is required'),
  body('serviceRadius').isNumeric().withMessage('Service radius must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, serviceCategory, hourlyRate, pincode, serviceRadius } = req.body;

    // Create user account
    const user = new User({
      name,
      phone,
      email: `${phone}@quickadd.temp`, // Temporary email
      password: Math.random().toString(36).substring(7), // Random password
      role: 'provider'
    });

    await user.save();

    // Create provider profile
    const provider = new Provider({
      userId: user._id,
      services: [{
        category: serviceCategory,
        hourlyRate: parseFloat(hourlyRate)
      }],
      serviceArea: {
        pincode,
        radius: parseFloat(serviceRadius)
      },
      isQuickAdd: true,
      badges: ['new']
    });

    await provider.save();

    res.status(201).json({
      message: 'Provider profile created successfully',
      providerId: provider._id,
      userId: user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get provider profile
router.get('/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate('userId', 'name phone email');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update provider status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({ message: 'Status updated successfully', status: provider.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;