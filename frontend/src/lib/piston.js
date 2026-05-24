import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/execution";

/**
 * Execute code using the integrated execution engine
 * @param {string} language - programming language
 * @param {string} code - source code to be executed
 * @param {string} problemId - the ID of the problem being solved
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code, problemId) {
  try {
    // 1. Submit code for execution
    const submitResponse = await fetch(`${API_BASE_URL}/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language,
        code,
        problemId,
      }),
    });

    if (!submitResponse.ok) {
      return {
        success: false,
        error: `Submission failed: ${submitResponse.statusText}`,
      };
    }

    const { submissionId, status } = await submitResponse.json();

    // 2. Poll for result
    return await pollForResult(submissionId);
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}

async function pollForResult(submissionId) {
  const pollInterval = 1000; // 1 second
  const maxAttempts = 10; // 10 seconds max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`${API_BASE_URL}/result/${submissionId}`);

    if (!response.ok) {
      throw new Error(`Polling failed: ${response.statusText}`);
    }

    const data = await response.json();

    // If status is terminal, return the result
    if (["accepted", "wrong", "error"].includes(data.status)) {
      return {
        success: data.status === "accepted",
        status: data.status,
        results: data.results || [], // Full array of test case results
        error: data.error,
        output: data.results?.map(r => r.output).join("\n") || ""
      };
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  return {
    success: false,
    error: "Execution timed out after 10 seconds",
    results: []
  };
}
