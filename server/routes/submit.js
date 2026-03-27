const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { executeCode } = require("../utils/dockerExecutor");

/**
 * POST /api/submit
 *
 * Receives user code, runs it against hidden test cases in a Docker container,
 * and returns the execution result.
 *
 * Body: { userId, problemId, language, code }
 * Response: { success, data: { status, output, passedCount, totalCount, submissionId? }, error }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, problemId, language, code } = req.body;

    // --- Validation ---
    if (!problemId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "problemId is required",
      });
    }

    if (!language || !["python", "java", "cpp"].includes(language)) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "language must be one of: python, java, cpp",
      });
    }

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "code is required and must be a non-empty string",
      });
    }

    // --- Fetch problem and hidden test cases from MongoDB ---
    const problem = await Problem.findById(problemId).select("hiddenTestCases title functionName");

    if (!problem) {
      return res.status(404).json({
        success: false,
        data: null,
        error: "Problem not found",
      });
    }

    if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
      return res.status(500).json({
        success: false,
        data: null,
        error: "No test cases found for this problem",
      });
    }

    // --- Execute code in Docker container ---
    const result = await executeCode(
      language,
      code,
      problem.hiddenTestCases,
      problem.functionName || "solution"
    );

    // --- Save submission to database (only for authenticated users) ---
    let submissionId = null;

    if (userId) {
      const submission = await Submission.create({
        userId,
        problemId,
        language,
        code,
        status: result.status,
        output: result.output,
        aiReport: {}, // AI report will be populated later
      });

      submissionId = submission._id;

      // If all tests passed, add to user's solvedProblems (if not already there)
      if (result.status === "PASSED") {
        await User.findByIdAndUpdate(
          userId,
          {
            $addToSet: { solvedProblems: problemId },
            $set: { lastActiveDate: new Date() },
          }
        );
      }
    }

    // --- Return standardized response ---
    return res.status(200).json({
      success: true,
      data: {
        status: result.status,
        output: result.output,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        ...(submissionId && { submissionId }),
      },
      error: null,
    });
  } catch (err) {
    console.error("Submit route error:", err);
    return res.status(500).json({
      success: false,
      data: null,
      error: "Internal server error",
    });
  }
});

module.exports = router;
