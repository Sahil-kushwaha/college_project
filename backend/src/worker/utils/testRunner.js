import { runCode } from './runCode.js';
import { getDockerCommand } from './dockerCommands.js';

/**
 * Run a single test case
 * @param {string} language - Programming language
 * @param {string} fileName - Code file name
 * @param {string} input - Test input
 * @param {string} expected - Expected output
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<{input: string, expected: string, output: string, passed: boolean, executionTime: number}>}
 */
export const runTestCase = async (language, fileName, input, expected, timeout = 5000) => {
  try {
    const dockerCommand = getDockerCommand(language, fileName);

    const result = await runCode(dockerCommand, input, timeout);
     for(const key in result){
          console.log(key + ": " + result[key]);
      }
    const normalize = str =>str.trim().replace(/\r\n/g, '\n');
    const actualOutput = normalize(result.stdout);
    const expectedOutput = normalize(expected);

    return {
      input,
      expected,
      output: actualOutput,
      passed: actualOutput === expectedOutput,
      executionTime: result.executionTime,
      stderr: result.stderr || null,
      timedOut: result.timedOut || false
    };
  } catch (error) {
    return {
      input,
      expected,
      output: '',
      passed: false,
      executionTime: 0,
      stderr: error.message,
      error: error.message
    };
  }
};

/**
 * Run all test cases for a submission
 * @param {string} language - Programming language
 * @param {string} fileName - Code file name
 * @param {Array} testCases - Array of {input, expected, isHidden}
 * @param {number} timeout - Timeout per test case in ms
 * @returns {Promise<Array<{input, expected, output, passed}>>}
 */
export const runAllTestCases = async (language, fileName, testCases, timeout = 5000) => {
  const results = [];

  for (const testCase of testCases) {
    const result = await runTestCase(
      language,
      fileName,
      testCase.input,
      testCase.expected,
      timeout
    );

    results.push({
      input: result.input,
      expected: result.expected,
      output: result.output,
      passed: result.passed,
      executionTime: result.executionTime
    });

    if (result.timedOut || (result.error && !result.stderr)) {
      break;
    }
  }

  return results;
};

/**
 * Evaluate test results
 * @param {Array} results - Array of test results
 * @returns {{status: string, error: string|null}}
 */
export const evaluateResults = (results) => {
  if (results.length === 0) {
    return {
      status: 'error',
      error: 'No test cases were executed'
    };
  }

  const hasError = results.some(r => r.error && !r.stderr);
  if (hasError) {
    return {
      status: 'error',
      error: 'Runtime error during execution'
    };
  }

  const hasTimeout = results.some(r => r.timedOut);
  if (hasTimeout) {
    return {
      status: 'error',
      error: 'Time limit exceeded'
    };
  }

  const allPassed = results.every(r => r.passed);

  return {
    status: allPassed ? 'accepted' : 'wrong',
    error: allPassed ? null : 'Some test cases failed'
  };
};

export default {
  runTestCase,
  runAllTestCases,
  evaluateResults
};
