const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed, // Structured JSON — e.g. { nums: [2,7,11,15], target: 9 }
      required: true,
    },
    expectedOutput: {
      type: mongoose.Schema.Types.Mixed, // Structured JSON — e.g. [0, 1]
      required: true,
    },
  },
  { _id: false }
);

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Problem title is required"],
      trim: true,
      unique: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Problem description is required"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ["Easy", "Medium", "Hard"],
        message: "Difficulty must be Easy, Medium, or Hard",
      },
    },
    companyTags: {
      type: [String],
      default: [],
    },
    constraints: {
      type: String,
      default: "",
    },
    examples: {
      type: [exampleSchema],
      validate: {
        validator: (v) => v.length >= 1,
        message: "At least one example is required",
      },
    },
    hiddenTestCases: {
      type: [testCaseSchema],
      required: true,
      validate: {
        validator: (v) => v.length >= 1,
        message: "At least one hidden test case is required",
      },
    },
    functionName: {
      type: String,
      required: [true, "Function name is required for test runner injection"],
      trim: true,
    },
    solutionTemplates: {
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Problem", problemSchema);
