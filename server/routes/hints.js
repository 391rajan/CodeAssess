const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const Problem = require("../models/Problem");
const HintUsage = require("../models/HintUsage");
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/hints
 *
 * Request a progressive AI hint for a problem.
 * Each problem allows max 3 hints, requested in order (1 → 2 → 3).
 *
 * Body: { problemId, hintLevel (1|2|3), currentCode? }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { problemId, hintLevel, currentCode } = req.body;
    const userId = req.user._id;

    // hintLevel: 1, 2, or 3
    if (![1, 2, 3].includes(hintLevel)) {
      return res.json({
        success: false,
        error: "Invalid hint level",
      });
    }

    // Check how many hints already used for this problem
    let hintUsage = await HintUsage.findOne({ userId, problemId });

    if (!hintUsage) {
      hintUsage = new HintUsage({
        userId,
        problemId,
        hintsUsed: 0,
        hintLevel: 0,
      });
    }

    // Max 3 hints per problem
    if (hintUsage.hintsUsed >= 3) {
      return res.json({
        success: false,
        error: "Maximum hints used for this problem",
        hintsUsed: 3,
        hintsRemaining: 0,
      });
    }

    // Can only request hints in order (1 then 2 then 3)
    if (hintLevel !== hintUsage.hintsUsed + 1) {
      return res.json({
        success: false,
        error: `You must request hint ${hintUsage.hintsUsed + 1} first`,
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.json({ success: false, error: "Problem not found" });
    }

    // Build prompt based on hint level
    const hintPrompts = {
      1: `You are helping a student solve "${problem.title}". 
Give a HIGH LEVEL hint about the general approach/strategy.
Do NOT mention specific data structures or algorithms.
Keep it to 2-3 sentences maximum.
Problem: ${problem.description}
Student's current code: ${currentCode || "No code written yet"}`,

      2: `You are helping a student solve "${problem.title}".
Give a MEDIUM hint mentioning which data structure or 
algorithm pattern to use (e.g. "Consider using a hash map").
Do NOT give code. Keep it to 3-4 sentences.
Problem: ${problem.description}
Student's current code: ${currentCode || "No code written yet"}`,

      3: `You are helping a student solve "${problem.title}".
Give a SPECIFIC hint describing the algorithm step by step
in plain English. This is their last hint so be detailed.
Do NOT write actual code. Maximum 6 sentences.
Problem: ${problem.description}
Student's current code: ${currentCode || "No code written yet"}`,
    };

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: hintPrompts[hintLevel],
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    });

    const hint = completion.choices[0].message.content.trim();

    // Record hint usage
    hintUsage.hintsUsed += 1;
    hintUsage.hintLevel = hintLevel;
    hintUsage.hints = hintUsage.hints || [];
    hintUsage.hints.push({ level: hintLevel, text: hint, usedAt: new Date() });
    await hintUsage.save();

    return res.json({
      success: true,
      data: {
        hint,
        hintLevel,
        hintsUsed: hintUsage.hintsUsed,
        hintsRemaining: 3 - hintUsage.hintsUsed,
      },
    });
  } catch (err) {
    console.error("Hint error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/hints/:problemId
 *
 * Get hint usage status and previously revealed hints for a problem.
 */
router.get("/:problemId", requireAuth, async (req, res) => {
  try {
    const hintUsage = await HintUsage.findOne({
      userId: req.user._id,
      problemId: req.params.problemId,
    });

    res.json({
      success: true,
      data: {
        hintsUsed: hintUsage?.hintsUsed || 0,
        hintsRemaining: 3 - (hintUsage?.hintsUsed || 0),
        hints: hintUsage?.hints || [],
      },
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
