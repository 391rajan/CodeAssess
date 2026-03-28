/**
 * Seed script — populates the database with 6 classic DSA problems.
 * Run with: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Problem = require("./models/Problem");

const problems = [
  // ───────────────────────────────────────────────────────────────
  // 1. Two Sum (Easy)
  // ───────────────────────────────────────────────────────────────
  {
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
      // 2 + 7 = 9 → [0, 1] ✓
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1] },
      // 2 + 4 = 6 → [1, 2] ✓
      { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2] },
      // 3 + 3 = 6 → [0, 1] ✓
      { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1] },
      // 7 + 2 = 9 → [3, 4] ✓
      { input: { nums: [1, 5, 3, 7, 2], target: 9 }, expectedOutput: [3, 4] },
      // -3 + 3 = 0 → [0, 2] ✓
      { input: { nums: [-3, 4, 3, 90], target: 0 }, expectedOutput: [0, 2] },
      // 0 + 0 = 0 → [0, 3] ✓
      { input: { nums: [0, 4, 3, 0], target: 0 }, expectedOutput: [0, 3] },
    ],
    solutionTemplates: {
      python: "def twoSum(nums, target):\n    # Write your solution here\n    pass",
      java:
        'import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        int target = Integer.parseInt(sc.nextLine());\n        int[] res = twoSum(nums, target);\n        System.out.println(res[0] + " " + res[1]);\n    }\n}',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    int target;\n    cin >> target;\n    auto res = twoSum(nums, target);\n    cout << res[0] << " " << res[1] << endl;\n    return 0;\n}',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 2. Valid Parentheses (Easy)
  // ───────────────────────────────────────────────────────────────
  {
    title: "Valid Parentheses",
    description:
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    difficulty: "Easy",
    companyTags: ["Google", "Meta"],
    constraints:
      "1 <= s.length <= 10^4\ns consists of parentheses only: '()[]{}'\n",
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "Single pair of matching parentheses.",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "Three pairs of matching brackets in sequence.",
      },
    ],
    functionName: "isValid",
    hiddenTestCases: [
      // "()" → true ✓
      { input: { s: "()" }, expectedOutput: true },
      // "()[]{}" → true ✓
      { input: { s: "()[]{}" }, expectedOutput: true },
      // "(]" → mismatch → false ✓
      { input: { s: "(]" }, expectedOutput: false },
      // "({[]})" → nested, all match → true ✓
      { input: { s: "({[]})" }, expectedOutput: true },
    ],
    solutionTemplates: {
      python:
        "def isValid(s):\n    # Write your solution here\n    pass",
      java:
        'import java.util.*;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        System.out.println(isValid(s));\n    }\n}',
      cpp:
        '#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    string s;\n    getline(cin, s);\n    cout << (isValid(s) ? "true" : "false") << endl;\n    return 0;\n}',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 3. Best Time to Buy and Sell Stock (Easy)
  // ───────────────────────────────────────────────────────────────
  {
    title: "Best Time to Buy and Sell Stock",
    description:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    difficulty: "Easy",
    companyTags: ["Amazon", "Google"],
    constraints:
      "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation:
          "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation:
          "No profitable transaction is possible, so max profit = 0.",
      },
    ],
    functionName: "maxProfit",
    hiddenTestCases: [
      // min=1 at idx 1, max after=6 at idx 4 → 6-1 = 5 ✓
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5 },
      // prices only decrease → 0 ✓
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0 },
      // min=2 at idx 0, max after=4 at idx 1 → 4-2 = 2 ✓
      { input: { prices: [2, 4, 1] }, expectedOutput: 2 },
      // min=1 at idx 0, max after=2 at idx 1 → 2-1 = 1 ✓
      { input: { prices: [1, 2] }, expectedOutput: 1 },
    ],
    solutionTemplates: {
      python:
        "def maxProfit(prices):\n    # Write your solution here\n    pass",
      java:
        'import java.util.*;\n\npublic class Main {\n    public static int maxProfit(int[] prices) {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] prices = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) prices[i] = Integer.parseInt(parts[i]);\n        System.out.println(maxProfit(prices));\n    }\n}',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> prices;\n    int x;\n    while (iss >> x) prices.push_back(x);\n    cout << maxProfit(prices) << endl;\n    return 0;\n}',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 4. Contains Duplicate (Easy)
  // ───────────────────────────────────────────────────────────────
  {
    title: "Contains Duplicate",
    description:
      "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
    difficulty: "Easy",
    companyTags: ["Apple", "Netflix"],
    constraints:
      "1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "true",
        explanation: "1 appears at indices 0 and 3.",
      },
      {
        input: "nums = [1,2,3,4]",
        output: "false",
        explanation: "All elements are distinct.",
      },
    ],
    functionName: "containsDuplicate",
    hiddenTestCases: [
      // 1 appears twice → true ✓
      { input: { nums: [1, 2, 3, 1] }, expectedOutput: true },
      // all distinct → false ✓
      { input: { nums: [1, 2, 3, 4] }, expectedOutput: false },
      // multiple duplicates → true ✓
      { input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expectedOutput: true },
      // single element → false ✓
      { input: { nums: [1] }, expectedOutput: false },
    ],
    solutionTemplates: {
      python:
        "def containsDuplicate(nums):\n    # Write your solution here\n    pass",
      java:
        'import java.util.*;\n\npublic class Main {\n    public static boolean containsDuplicate(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        System.out.println(containsDuplicate(nums));\n    }\n}',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <unordered_set>\nusing namespace std;\n\nbool containsDuplicate(vector<int>& nums) {\n    // Write your solution here\n    return false;\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    cout << (containsDuplicate(nums) ? "true" : "false") << endl;\n    return 0;\n}',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 5. Maximum Subarray (Medium)
  // ───────────────────────────────────────────────────────────────
  {
    title: "Maximum Subarray",
    description:
      "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.",
    difficulty: "Medium",
    companyTags: ["Amazon", "Microsoft"],
    constraints:
      "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum = 6.",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum = 23.",
      },
    ],
    functionName: "maxSubArray",
    hiddenTestCases: [
      // [4,-1,2,1] = 6 ✓
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6 },
      // single element → 1 ✓
      { input: { nums: [1] }, expectedOutput: 1 },
      // entire array: 5+4-1+7+8 = 23 ✓
      { input: { nums: [5, 4, -1, 7, 8] }, expectedOutput: 23 },
      // single negative → -1 ✓
      { input: { nums: [-1] }, expectedOutput: -1 },
    ],
    solutionTemplates: {
      python:
        "def maxSubArray(nums):\n    # Write your solution here\n    pass",
      java:
        'import java.util.*;\n\npublic class Main {\n    public static int maxSubArray(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] parts = sc.nextLine().split(" ");\n        int[] nums = new int[parts.length];\n        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);\n        System.out.println(maxSubArray(nums));\n    }\n}',
      cpp:
        '#include <iostream>\n#include <vector>\n#include <sstream>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int x;\n    while (iss >> x) nums.push_back(x);\n    cout << maxSubArray(nums) << endl;\n    return 0;\n}',
    },
  },

  // ───────────────────────────────────────────────────────────────
  // 6. Climbing Stairs (Easy)
  // ───────────────────────────────────────────────────────────────
  {
    title: "Climbing Stairs",
    description:
      "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    difficulty: "Easy",
    companyTags: ["Google", "Amazon", "Adobe"],
    constraints: "1 <= n <= 45",
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "Two ways: (1+1) or (2).",
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "Three ways: (1+1+1), (1+2), or (2+1).",
      },
    ],
    functionName: "climbStairs",
    hiddenTestCases: [
      // f(2) = 2 ✓
      { input: { n: 2 }, expectedOutput: 2 },
      // f(3) = 3 ✓
      { input: { n: 3 }, expectedOutput: 3 },
      // f(5) = f(4)+f(3) = 5+3 = 8 ✓
      { input: { n: 5 }, expectedOutput: 8 },
      // f(10) = 89 (Fibonacci: 1,2,3,5,8,13,21,34,55,89) ✓
      { input: { n: 10 }, expectedOutput: 89 },
    ],
    solutionTemplates: {
      python:
        "def climbStairs(n):\n    # Write your solution here\n    pass",
      java:
        "import java.util.*;\n\npublic class Main {\n    public static int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = Integer.parseInt(sc.nextLine().trim());\n        System.out.println(climbStairs(n));\n    }\n}",
      cpp:
        '#include <iostream>\nusing namespace std;\n\nint climbStairs(int n) {\n    // Write your solution here\n    return 0;\n}\n\nint main() {\n    int n;\n    cin >> n;\n    cout << climbStairs(n) << endl;\n    return 0;\n}',
    },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Problem.deleteMany({});
    console.log("Cleared existing problems");

    for (const p of problems) {
      const created = await Problem.create(p);
      console.log(`  ✓ Seeded: "${created.title}" (${created.difficulty}) — ID: ${created._id}`);
    }

    console.log(`\nDone. Seeded ${problems.length} problems.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
