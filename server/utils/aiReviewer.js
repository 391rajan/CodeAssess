const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Generate an AI code review for a passed submission using Groq (Llama 3.3 70B).
 *
 * The prompt instructs the model to return JSON only — no extra prose,
 * no markdown (per project rule). The expected JSON shape:
 * {
 *   time_complexity, space_complexity, overall_rating,
 *   bugs_or_code_smells[], optimization_tips[], style_feedback
 * }
 *
 * @param {string} problemTitle
 * @param {string} problemDescription
 * @param {string} language  "python" | "java" | "cpp"
 * @param {string} code      The user's submitted code
 * @returns {Object}         Parsed AI report
 */
async function generateAIReview(
  problemTitle,
  problemDescription,
  language,
  code
) {
  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a strict but fair senior software engineer conducting a technical interview. A candidate has just solved "${problemTitle}".

Problem: ${problemDescription}

Their ${language} solution:
\`\`\`${language}
${code}
\`\`\`

Return ONLY a valid JSON object, no extra text, no markdown, no backticks:

{
  "time_complexity": "O(??) with explanation",
  "space_complexity": "O(??) with explanation",
  "overall_rating": "Excellent" | "Good" | "Average" | "Poor",
  "bugs_or_code_smells": ["issue 1"],
  "optimization_tips": ["tip 1", "tip 2", "tip 3"],
  "style_feedback": "one paragraph about code quality"
}`,
      },
    ],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content.trim();

  // Strip any accidental markdown fences the model may have added
  const clean = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(clean);
}

module.exports = { generateAIReview };
