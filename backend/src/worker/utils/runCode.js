import { spawn } from "child_process";

/**
 * Execute code inside Docker container with stdin input
 * @param {string} command - Docker command to execute
 * @param {string} input - Input to pass via stdin
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<{stdout: string, stderr: string, executionTime: number}>}
 */
export const runCode = async (command, input = "", timeout = 5000) => {
  const startTime = Date.now();
  return new Promise((resolve) => {
    const args = command.trim().split(/\s+/);
    const cmd = args.shift();
    const child = spawn(cmd, args, {
      timeout,
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => {
      stdoutData += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderrData += data.toString();
    });
    child.on("error", (error) => {
      resolve({
        stdout: stdoutData,
        stderr: error.message,
        executionTime: Date.now() - startTime,
        timedOut: false
      });
    });

    child.on("close", (code) => {
      const executionTime = Date.now() - startTime;

      if (code === 137 || executionTime >= timeout) {
        return resolve({
          stdout: stdoutData,
          stderr: "Time Limit Exceeded",
          executionTime: Math.min(executionTime, timeout),
          timedOut: true
        });
      }

      resolve({
        stdout: stdoutData,
        stderr: stderrData,
        executionTime,
        timedOut: false
      });
    });

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
  });
};

export default runCode;
