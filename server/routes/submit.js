const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { executeCode } = require("../utils/dockerExecutor");
const { generateAIReview } = require("../utils/aiReviewer");
const { optionalAuth } = require("../middleware/authMiddleware");

/**
 * POST /api/submit
 *
 * Receives user code, runs it against hidden test cases in a Docker container,
 * and if all tests pass, generates an AI code review.
 *
 * Body: { problemId, language, code }
 * Response: { success, data: { status, output, passedCount, totalCount, aiReport?, submissionId? }, error }
 */
router.post("/", optionalAuth, async (req, res) => {
  try {
    console.log("=== SUBMIT ROUTE HIT ===");
    console.log("req.user:", req.user);
    console.log("req.body keys:", Object.keys(req.body));
    console.log("req.cookies:", req.cookies);

    const { problemId, language, code } = req.body;
    // optionalAuth sets req.user = { userId, role } from JWT, or null for guests
    const userId = req.user ? req.user.userId : null;
    console.log("userId resolved:", userId);

    // --- Validation ---
    if (!problemId) {
      return res.status(400).json({ success: false, data: null, error: "problemId is required" });
    }
    if (!language || !["python", "java", "cpp"].includes(language)) {
      return res.status(400).json({ success: false, data: null, error: "language must be one of: python, java, cpp" });
    }
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({ success: false, data: null, error: "code is required and must be a non-empty string" });
    }

    // --- Fetch problem ---
    const problem = await Problem.findById(problemId)
      .select("title description functionName hiddenTestCases");

    if (!problem) {
      return res.status(404).json({ success: false, data: null, error: "Problem not found" });
    }

    if (!problem.functionName || !problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      console.error("Problem config incomplete — functionName:", problem.functionName, "testCases:", problem.hiddenTestCases?.length);
      return res.status(400).json({
        success: false,
        data: null,
        error: "Problem configuration incomplete. Please re-seed the database.",
      });
    }

    console.log("Problem found:", problem.title);
    console.log("functionName:", problem.functionName);
    console.log("hiddenTestCases count:", problem.hiddenTestCases.length);

    // --- Execute code in Docker container ---
    const result = await executeCode(
      language,
      code,
      problem.hiddenTestCases,
      problem.functionName || "solution"
    );

    console.log("Execution result status:", result.status);

    // --- AI Review (only for PASSED submissions) ---
    let aiReport = null;
    if (result.status === "PASSED") {
      try {
        aiReport = await generateAIReview(
          problem.title,
          problem.description,
          language,
          code
        );
        console.log("AI review generated successfully");
      } catch (err) {
        console.error("AI review failed:", err.message);
        aiReport = null;
      }
    }

    // --- Save submission (only for authenticated users) ---
    let submissionId = null;
    if (userId) {
      try {
        const HintUsage = require("../models/HintUsage");
        const hintUsage = await HintUsage.findOne({ userId, problemId });
        const usedHints = hintUsage ? hintUsage.hintsUsed : 0;

        const submission = new Submission({
          userId: userId,
          problemId: problemId,
          language: language,
          code: code,
          status: result.status,
          output: result.output || "",
          aiReport: aiReport || {},
          hintsUsed: usedHints,
        });
        await submission.save();
        submissionId = submission._id;
        console.log("✅ Submission saved:", submissionId);

        // If passed, add to user's solvedProblems
        if (result.status === "PASSED") {
          await User.findByIdAndUpdate(userId, {
            $addToSet: { solvedProblems: problemId },
            $set: { lastActiveDate: new Date() },
          });
          console.log("✅ User solvedProblems updated");
        }
      } catch (saveErr) {
        console.error("❌ Submission save failed:", saveErr.message);
        // Don't fail the whole request — just log it
      }
    } else {
      console.log("Guest submission — not saved to DB");
    }

    // --- Return standardized response ---
    return res.status(200).json({
      success: true,
      data: {
        status: result.status,
        output: result.output,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        ...(aiReport && { aiReport }),
        ...(submissionId && { submissionId }),
      },
      error: null,
    });

  } catch (err) {
    console.error("=== SUBMIT ERROR ===");
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);
    return res.status(500).json({
      success: false,
      data: null,
      error: err.message,
    });
  }
});

module.exports = router;
