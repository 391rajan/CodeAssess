/**
 * Seed script — populates the database with a sample problem for testing.
 * Run with: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./models/Problem");

const sampleProblem = {
  title: "Two Sum",
  description:
    "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nReturn the answer as a list of two indices.",
  difficulty: "Easy",
  companyTags: ["Google", "Amazon", "Meta"],
  constraints:
    "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0, 1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1, 2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
  ],
  functionName: "twoSum",
  hiddenTestCases: [
    {
      input: { nums: [2, 7, 11, 15], target: 9 },
      expectedOutput: [0, 1],
    },
    {
      input: { nums: [3, 2, 4], target: 6 },
      expectedOutput: [1, 2],
    },
    {
      input: { nums: [3, 3], target: 6 },
      expectedOutput: [0, 1],
    },
    {
      input: { nums: [1, 5, 3, 7, 2], target: 9 },
      expectedOutput: [1, 4],
    },
  ],
  solutionTemplates: {
    python:
      "def twoSum(nums, target):\n    # Write your solution here\n    pass",
    java:
      'import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = Integer.parseInt(sc.nextLine());\n        int[] res = twoSum(nums, target);\n        System.out.println(res[0] + " " + res[1]);\n    }\n}',
    cpp:
      '#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    int target;\n    cin >> target;\n    auto res = twoSum(nums, target);\n    cout << res[0] << " " << res[1] << endl;\n    return 0;\n}',
  },
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing problems
    await Problem.deleteMany({});
    console.log("Cleared existing problems");

    const problem = await Problem.create(sampleProblem);
    console.log(`Seeded problem: "${problem.title}" (ID: ${problem._id})`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
