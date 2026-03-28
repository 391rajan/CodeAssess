const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// GET /api/problems
// Returns all problems, omitting hiddenTestCases
router.get('/', async (req, res) => {
  try {
    // Project out the hiddenTestCases to ensure they never leak to the frontend
    const problems = await Problem.find({}, '-hiddenTestCases -__v -createdAt -updatedAt').lean();
    
    res.status(200).json({
      success: true,
      data: problems,
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems',
    });
  }
});

module.exports = router;
