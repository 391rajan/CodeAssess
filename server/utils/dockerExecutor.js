const Docker = require("dockerode");
const { PassThrough } = require("stream");

const docker = new Docker();

// Maps language to Docker image and execution commands
const LANGUAGE_CONFIG = {
  python: {
    image: "python:3.11-slim",
    ext: "py",
    compile: null,
    run: (file) => ["python", "-u", file], // -u for unbuffered output
  },
  java: {
    image: "eclipse-temurin:17",
    ext: "java",
    compile: (file) => ["javac", file],
    run: () => ["java", "-cp", ".", "Main"],
  },
  cpp: {
    image: "gcc:latest",
    ext: "cpp",
    compile: (file) => ["g++", "-o", "solution", file],
    run: () => ["./solution"],
  },
};

const TIMEOUT_MS = 5000;
const MEMORY_LIMIT = 256 * 1024 * 1024; // 256MB

// ──────────────────────────────────────────────────────────────────────
// Runner script generators — these inject test cases into the code
// and produce JSON output: { passed, total, results[] }
// ──────────────────────────────────────────────────────────────────────

/**
 * Builds a Python script that:
 *  1. Includes the user's function definition
 *  2. Embeds test cases as a JSON array
 *  3. Calls the function with **tc["input"] for each test case
 *  4. Compares the result (using sorted() for list outputs)
 *  5. Prints a single JSON line with { passed, total, results }
 */
function buildPythonRunner(userCode, testCases, functionName) {
  const tcJson = JSON.stringify(testCases);

  return `import json, sys, traceback

# ── User code ────────────────────────────────────────────────────────
${userCode}
# ── End user code ────────────────────────────────────────────────────

_test_cases = json.loads('${tcJson.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}')

_passed = 0
_results = []

def _normalize(v):
    """Normalize a value for comparison — handles list ordering."""
    if isinstance(v, list):
        try:
            return sorted(v)
        except TypeError:
            return v
    return v

for _i, _tc in enumerate(_test_cases):
    try:
        _result = ${functionName}(**_tc["input"])
        _expected = _tc["expectedOutput"]
        if _normalize(_result) == _normalize(_expected):
            _passed += 1
            _results.append(f"Test case {_i+1}: Passed")
        else:
            _results.append(f"Test case {_i+1}: Wrong Answer — got {_result}, expected {_expected}")
    except Exception as _e:
        _results.append(f"Test case {_i+1}: Runtime Error — {traceback.format_exc().splitlines()[-1]}")

print(json.dumps({"passed": _passed, "total": len(_test_cases), "results": _results}))
`;
}

/**
 * Builds a Java file (Main.java) that embeds test cases and calls
 * the user's solution method. Uses org.json for parsing.
 *
 * For Java, the user provides the full class body including the
 * solution method. The executor wraps it with a main() that reads
 * embedded test data.
 */
function buildJavaRunner(userCode) {
  // Java uses the stdin-based approach — the user provides the
  // full class with a main method that reads from stdin.
  return userCode;
}

/**
 * Builds a C++ file that embeds test input. Same approach as Java —
 * the user provides complete code with main() that reads from stdin.
 */
function buildCppRunner(userCode) {
  return userCode;
}

// ──────────────────────────────────────────────────────────────────────
// Docker execution engine
// ──────────────────────────────────────────────────────────────────────

/**
 * Execute a command inside a running container.
 * Returns { stdout, stderr, exitCode }.
 * Rejects with Error("TIME_LIMIT_EXCEEDED") if timeout exceeded.
 *
 * Properly handles cleanup: when timeout fires, we kill the exec
 * process so streams close and we don't hang.
 */
async function execInContainer(container, cmd, timeoutMs = TIMEOUT_MS) {
  const exec = await container.exec({
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: false,
    Tty: false,
  });

  return new Promise((resolve, reject) => {
    let settled = false;
    let timeoutId = null;

    exec.start({ hijack: false, stdin: false }, (err, stream) => {
      if (err) {
        settled = true;
        return reject(err);
      }

      let stdout = "";
      let stderr = "";

      const stdoutPipe = new PassThrough();
      const stderrPipe = new PassThrough();

      docker.modem.demuxStream(stream, stdoutPipe, stderrPipe);

      stdoutPipe.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      stderrPipe.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      // Set the timeout — if it fires, we force-kill the container's
      // processes to unblock the stream, then reject.
      timeoutId = setTimeout(async () => {
        if (settled) return;
        settled = true;

        // Kill all processes inside the container to force the exec
        // stream to close (this is key to fixing the timeout bug)
        try {
          await container.kill({ signal: "SIGKILL" });
        } catch {
          // Container may already be dead
        }

        reject(new Error("TIME_LIMIT_EXCEEDED"));
      }, timeoutMs);

      stream.on("end", async () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);

        try {
          const inspectData = await exec.inspect();
          resolve({ stdout, stderr, exitCode: inspectData.ExitCode });
        } catch {
          resolve({ stdout, stderr, exitCode: -1 });
        }
      });

      stream.on("error", (e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        reject(e);
      });
    });
  });
}

/**
 * Run user code against hidden test cases inside a Docker container.
 *
 * For Python:
 *   - Injects a runner that calls the user's function with each test
 *     case's input kwargs, compares results, and outputs JSON.
 *   - Single execution — all test cases run in one process.
 *
 * For Java/C++:
 *   - Runs the user's code once per test case via stdin.
 *   - Compiles first, then executes.
 *
 * @param {string} language       "python" | "java" | "cpp"
 * @param {string} code           User's submitted code
 * @param {Array}  testCases      Array of { input, expectedOutput }
 * @param {string} functionName   Name of the function to call (Python)
 * @returns {{ status, output, passedCount, totalCount }}
 */
async function executeCode(language, code, testCases, functionName = "solution") {
  const config = LANGUAGE_CONFIG[language];
  if (!config) {
    return {
      status: "COMPILE_ERROR",
      output: `Unsupported language: ${language}`,
      passedCount: 0,
      totalCount: testCases.length,
    };
  }

  let container = null;

  try {
    // ── Build the final source code ──────────────────────────────
    let sourceCode;
    let filename;

    if (language === "python") {
      sourceCode = buildPythonRunner(code, testCases, functionName);
      filename = "solution.py";
    } else if (language === "java") {
      sourceCode = buildJavaRunner(code);
      filename = "Main.java";
    } else {
      sourceCode = buildCppRunner(code);
      filename = "solution.cpp";
    }

    // ── Create & start container ─────────────────────────────────
    container = await docker.createContainer({
      Image: config.image,
      Cmd: ["tail", "-f", "/dev/null"], // Keep alive
      WorkingDir: "/app",
      HostConfig: {
        Memory: MEMORY_LIMIT,
        MemorySwap: MEMORY_LIMIT,
        NetworkMode: "none",
        PidsLimit: 64,
      },
      Tty: false,
    });

    await container.start();

    // ── Inject source file ───────────────────────────────────────
    const tar = createTarBuffer(filename, sourceCode);
    await container.putArchive(tar, { path: "/app" });

    // ── Compile (Java / C++) ─────────────────────────────────────
    if (config.compile) {
      const compileResult = await execInContainer(
        container,
        config.compile(filename),
        30000 // 30 s compile timeout
      );

      if (compileResult.exitCode !== 0) {
        return {
          status: "COMPILE_ERROR",
          output: (compileResult.stderr || compileResult.stdout || "Compilation failed").trim(),
          passedCount: 0,
          totalCount: testCases.length,
        };
      }
    }

    // ── Execute ──────────────────────────────────────────────────
    if (language === "python") {
      return await executePython(container, config, filename, testCases);
    } else {
      return await executeStdinBased(container, config, filename, testCases);
    }
  } catch (err) {
    if (err.message === "TIME_LIMIT_EXCEEDED") {
      return {
        status: "TIME_LIMIT_EXCEEDED",
        output: "Execution timed out (5 second limit)",
        passedCount: 0,
        totalCount: testCases.length,
      };
    }

    return {
      status: "COMPILE_ERROR",
      output: `Execution error: ${err.message}`,
      passedCount: 0,
      totalCount: testCases.length,
    };
  } finally {
    // ALWAYS destroy the container — rule from project requirements
    if (container) {
      try {
        await container.stop({ t: 0 }).catch(() => {});
        await container.remove({ force: true });
      } catch (cleanupErr) {
        console.error("Container cleanup error:", cleanupErr.message);
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────────
// Language-specific execution strategies
// ──────────────────────────────────────────────────────────────────────

/**
 * Python strategy: single execution, all test cases embedded in the
 * runner. Parse JSON output from stdout.
 */
async function executePython(container, config, filename, testCases) {
  const runResult = await execInContainer(
    container,
    config.run(filename),
    TIMEOUT_MS
  );

  // Non-zero exit → treat as compile/syntax error
  if (runResult.exitCode !== 0) {
    return {
      status: "COMPILE_ERROR",
      output: (runResult.stderr || runResult.stdout || "Process exited with an error").trim(),
      passedCount: 0,
      totalCount: testCases.length,
    };
  }

  // Parse the JSON output from the runner
  const rawOutput = runResult.stdout.trim();

  try {
    const parsed = JSON.parse(rawOutput);

    const passedCount = parsed.passed || 0;
    const totalCount = parsed.total || testCases.length;
    const results = parsed.results || [];

    if (passedCount === totalCount) {
      return {
        status: "PASSED",
        output: `All ${totalCount} test cases passed`,
        passedCount,
        totalCount,
      };
    }

    return {
      status: "FAILED",
      output: results.join("\n"),
      passedCount,
      totalCount,
    };
  } catch (_) {
    // If JSON parsing fails, the user's code likely printed extra
    // output or there was a runtime error.
    return {
      status: "FAILED",
      output: rawOutput || runResult.stderr || "Unknown error",
      passedCount: 0,
      totalCount: testCases.length,
    };
  }
}

/**
 * Stdin-based strategy for Java/C++:
 * Runs the compiled binary once per test case, piping input via a
 * temporary file and comparing stdout to expectedOutput.
 */
async function executeStdinBased(container, config, filename, testCases) {
  let passedCount = 0;
  const failedDetails = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    // For Java/C++, input is a plain string (stdin lines)
    const inputStr =
      typeof tc.input === "string" ? tc.input : JSON.stringify(tc.input);
    const expectedStr =
      typeof tc.expectedOutput === "string"
        ? tc.expectedOutput.trim()
        : JSON.stringify(tc.expectedOutput);

    // Write input to a file inside the container, then run with < redirect
    const inputFilename = `input_${i}.txt`;
    const inputTar = createTarBuffer(inputFilename, inputStr + "\n");
    await container.putArchive(inputTar, { path: "/app" });

    try {
      const runResult = await execInContainer(
        container,
        ["sh", "-c", `${config.run(filename).join(" ")} < /app/${inputFilename}`],
        TIMEOUT_MS
      );

      const actual = runResult.stdout.trim();

      if (runResult.exitCode !== 0) {
        failedDetails.push(
          `Test case ${i + 1}: Runtime Error — ${runResult.stderr.trim()}`
        );
      } else if (actual === expectedStr) {
        passedCount++;
      } else {
        failedDetails.push(
          `Test case ${i + 1}: Wrong Answer — got "${actual}", expected "${expectedStr}"`
        );
      }
    } catch (err) {
      if (err.message === "TIME_LIMIT_EXCEEDED") {
        return {
          status: "TIME_LIMIT_EXCEEDED",
          output: `Time limit exceeded on test case ${i + 1}`,
          passedCount,
          totalCount: testCases.length,
        };
      }
      failedDetails.push(`Test case ${i + 1}: Error — ${err.message}`);
    }
  }

  if (passedCount === testCases.length) {
    return {
      status: "PASSED",
      output: `All ${testCases.length} test cases passed`,
      passedCount,
      totalCount: testCases.length,
    };
  }

  return {
    status: "FAILED",
    output: failedDetails.join("\n"),
    passedCount,
    totalCount: testCases.length,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Tar archive helper
// ──────────────────────────────────────────────────────────────────────

/**
 * Create a tar archive buffer containing a single file.
 * Used to inject files into the Docker container via putArchive().
 */
function createTarBuffer(filename, content) {
  const contentBuffer = Buffer.from(content, "utf-8");
  const fileSize = contentBuffer.length;

  const header = Buffer.alloc(512, 0);

  // File name (0–99)
  header.write(filename, 0, Math.min(filename.length, 100), "utf-8");

  // File mode: 0644
  header.write("0000644\0", 100, 8, "utf-8");

  // Owner / Group IDs
  header.write("0000000\0", 108, 8, "utf-8");
  header.write("0000000\0", 116, 8, "utf-8");

  // File size in octal
  header.write(
    fileSize.toString(8).padStart(11, "0") + "\0",
    124,
    12,
    "utf-8"
  );

  // Modification time
  const mtime = Math.floor(Date.now() / 1000);
  header.write(
    mtime.toString(8).padStart(11, "0") + "\0",
    136,
    12,
    "utf-8"
  );

  // Type flag: regular file
  header.write("0", 156, 1, "utf-8");

  // Checksum placeholder (spaces)
  header.write("        ", 148, 8, "utf-8");

  // Calculate and write checksum
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  header.write(
    checksum.toString(8).padStart(6, "0") + "\0 ",
    148,
    8,
    "utf-8"
  );

  // Pad to 512-byte boundary
  const remainder = fileSize % 512;
  const padding =
    remainder > 0 ? Buffer.alloc(512 - remainder, 0) : Buffer.alloc(0);

  // End-of-archive marker
  const endMarker = Buffer.alloc(1024, 0);

  return Buffer.concat([header, contentBuffer, padding, endMarker]);
}

module.exports = { executeCode };
