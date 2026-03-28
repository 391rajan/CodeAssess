const express = require("express");
const router = express.Router();
const Problem = require("../models/Problem");

// GET /api/admin/problems
// Returns all problems (including hiddenTestCases for admin use)
router.get("/problems", async (req, res) => {
  try {
    const problems = await Problem.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: problems });
  } catch (error) {
    console.error("Error fetching admin problems:", error);
    res.status(500).json({ success: false, error: "Failed to fetch problems" });
  }
});

// GET /api/admin/problems/:id
// Get a specific problem by ID
router.get("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id).lean();
    if (!problem) return res.status(404).json({ success: false, error: "Problem not found" });
    res.status(200).json({ success: true, data: problem });
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ success: false, error: "Failed to fetch problem" });
  }
});

// POST /api/admin/problems
// Create a new problem
router.post("/problems", async (req, res) => {
  try {
    const newProblem = new Problem(req.body);
    const savedProblem = await newProblem.save();
    res.status(201).json({ success: true, data: savedProblem });
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(400).json({ success: false, error: error.message || "Failed to create problem" });
  }
});

// PUT /api/admin/problems/:id
// Update an existing problem
router.put("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProblem = await Problem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProblem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    res.status(200).json({ success: true, data: updatedProblem });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(400).json({ success: false, error: error.message || "Failed to update problem" });
  }
});

// DELETE /api/admin/problems/:id
// Delete a problem
router.delete("/problems/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).json({ success: false, error: "Problem not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ success: false, error: "Failed to delete problem" });
  }
});

module.exports = router;
