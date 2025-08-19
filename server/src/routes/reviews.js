const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const auth = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookingId, rating, comment, tags } = req.body;

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.customer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = new Review({
      booking: bookingId,
      customer: req.user.userId,
      provider: booking.provider,
      rating,
      comment,
      tags
    });

    await review.save();

    // Update provider rating
    await updateProviderRating(booking.provider);

    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for a provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    let sortQuery = {};
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortQuery = { 'rating.overall': -1 };
    } else if (sort === 'lowest') {
      sortQuery = { 'rating.overall': 1 };
    }

    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name')
      .populate('booking', 'service.category')
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ provider: req.params.providerId });

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { provider: mongoose.Types.ObjectId(req.params.providerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating.overall', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating.overall', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating.overall', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating.overall', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating.overall', 1] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      reviews,
      stats: ratingStats[0] || { averageRating: 0, totalReviews: 0 },
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

// Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const userId = req.user.userId;
    const hasVoted = review.helpful.users.includes(userId);

    if (hasVoted) {
      // Remove vote
      review.helpful.users = review.helpful.users.filter(id => id.toString() !== userId);
      review.helpful.count = Math.max(0, review.helpful.count - 1);
    } else {
      // Add vote
      review.helpful.users.push(userId);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({ 
      message: hasVoted ? 'Vote removed' : 'Vote added',
      helpfulCount: review.helpful.count,
      hasVoted: !hasVoted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update provider rating
async function updateProviderRating(providerId) {
  const mongoose = require('mongoose');
  
  const ratingStats = await Review.aggregate([
    { $match: { provider: mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (ratingStats.length > 0) {
    await Provider.findByIdAndUpdate(providerId, {
      'ratings.average': Math.round(ratingStats[0].averageRating * 10) / 10,
      'ratings.count': ratingStats[0].totalReviews
    });
  }
}

module.exports = router;