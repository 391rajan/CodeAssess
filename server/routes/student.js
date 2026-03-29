const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');
const { requireAuth } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// @route GET /api/student/profile
// @desc  Get student profile stats: difficulty breakout, streak, heatmap
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(req.user.userId);

    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // --- Difficulty breakout from unique PASSED submissions ---
    let easySolved = 0, mediumSolved = 0, hardSolved = 0;

    const passedSubmissions = await Submission.find({
      userId: userIdObj,
      status: 'PASSED',
    }).populate('problemId', 'difficulty title');

    const uniqueSolved = new Map();
    passedSubmissions.forEach(sub => {
      if (sub.problemId && !uniqueSolved.has(sub.problemId._id.toString())) {
        uniqueSolved.set(sub.problemId._id.toString(), sub.problemId.difficulty);
        if (sub.problemId.difficulty === 'Easy') easySolved++;
        else if (sub.problemId.difficulty === 'Medium') mediumSolved++;
        else if (sub.problemId.difficulty === 'Hard') hardSolved++;
      }
    });

    // --- 30-day heatmap ---
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const recentSubmissions = await Submission.find({
      userId: userIdObj,
      createdAt: { $gte: thirtyDaysAgo, $lte: today },
    }).select('createdAt').lean();

    const submissionsByDate = new Set(
      recentSubmissions.map(sub => {
        const d = new Date(sub.createdAt);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
      })
    );

    const recentActivity = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const dateStr = d.toISOString().split('T')[0];
      recentActivity.push({ date: dateStr, hasSubmission: submissionsByDate.has(dateStr) });
    }

    // --- Streak calculation ---
    const allSubmissions = await Submission.find({ userId: userIdObj })
      .select('createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const uniqueDates = [...new Set(
      allSubmissions.map(s => s.createdAt.toISOString().split('T')[0])
    )].sort().reverse();

    let streak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    let checkDate = todayStr;

    for (const date of uniqueDates) {
      if (date === checkDate) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        streakCount: streak,
        totalSolved: uniqueSolved.size,
        easySolved,
        mediumSolved,
        hardSolved,
        recentActivity,
      },
    });

  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch student profile' });
  }
});

// @route GET /api/student/submissions
// @desc  Get student submission history (last 50)
router.get('/submissions', requireAuth, async (req, res) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(req.user.userId);

    const submissions = await Submission.find({ userId: userIdObj })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('problemId', 'title difficulty')
      .lean();

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      problemId: sub.problemId ? sub.problemId._id : null,
      problemTitle: sub.problemId ? sub.problemId.title : 'Deleted Problem',
      language: sub.language,
      status: sub.status,
      createdAt: sub.createdAt,
      aiReport: sub.aiReport || null,
    }));

    res.status(200).json({
      success: true,
      data: { submissions: formattedSubmissions },
    });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// @route GET /api/student/debug
// @desc  Temporary: verify submission count for logged-in user
router.get('/debug', requireAuth, async (req, res) => {
  try {
    const userIdObj = new mongoose.Types.ObjectId(req.user.userId);
    const count = await Submission.countDocuments({ userId: userIdObj });
    res.json({ success: true, userId: req.user.userId, submissionCount: count });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
