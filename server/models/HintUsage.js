const mongoose = require("mongoose");

const hintUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    hintsUsed: { type: Number, default: 0 },
    hintLevel: { type: Number, default: 0 },
    hints: [
      {
        level: Number,
        text: String,
        usedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

hintUsageSchema.index({ userId: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model("HintUsage", hintUsageSchema);
