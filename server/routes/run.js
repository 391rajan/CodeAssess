const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");
const Problem = require("../models/Problem");
const { executeCode } = require("../utils/dockerExecutor");

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { problemId, language, code, customTestCases } = req.body;
    
    // If student provides custom test cases, use those
    // Otherwise use the problem's visible examples
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.json({ success: false, error: "Problem not found" });
    }
    
    // Build test cases by pulling the exact structured variants corresponding to the visible examples
    let testCases = problem.hiddenTestCases.slice(0, problem.examples.length);
    
    // Append any custom typed cases
    if (customTestCases && customTestCases.length > 0) {
      testCases = [...testCases, ...customTestCases];
    }
    
    // executeCode signature: language, code, testCases, functionName
    const result = await executeCode(
      language,
      code,
      testCases,
      problem.functionName
    );
    
    // Never save to DB, never call AI
    return res.json({
      success: true,
      data: {
        status: result.status,
        output: result.output,
        passedCount: result.passedCount,
        totalCount: result.totalCount,
        results: result.results
      }
    });
    
  } catch (err) {
    console.error("Run error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
