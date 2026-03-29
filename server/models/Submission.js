const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for guest users
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: [true, "Problem ID is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      enum: {
        values: ["python", "java", "cpp"],
        message: "Language must be python, java, or cpp",
      },
    },
    code: {
      type: String,
      required: [true, "Code is required"],
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PASSED",
        "FAILED",
        "TIME_LIMIT_EXCEEDED",
        "COMPILE_ERROR",
        "RUNTIME_ERROR",
      ],
    },
    output: {
      type: String,
      default: "",
    },
    aiReport: {
      time_complexity: { type: String, default: null },
      space_complexity: { type: String, default: null },
      overall_rating: { type: String, default: null },
      bugs_or_code_smells: { type: [String], default: [] },
      optimization_tips: { type: [String], default: [] },
      style_feedback: { type: String, default: null },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for efficient user submission lookups
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
