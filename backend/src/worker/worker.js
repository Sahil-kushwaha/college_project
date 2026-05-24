import { Worker } from "bullmq";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'node:url';
import Submission from "../models/Submission.js";
import Problem from "../models/Problem.js";
import { connectDB } from "../lib/db.js";
import { runAllTestCases, evaluateResults } from './utils/testRunner.js';
import { getFileExtension } from './utils/dockerCommands.js';
import { ENV } from "../lib/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = '/app/temp';

// Ensure temp directory exists
await fs.mkdir(TEMP_DIR, { recursive: true });

const worker = new Worker(
  "code-exec",
  async (job) => {
    const { submissionId, code, language, problemId } = job.data;

    // Step 1: Update submission status to "running"
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'running'
    });

    // Step 2: Fetch problem to get test cases
    const problem = await Problem.findById(problemId);

    if (!problem) {
      const error = 'Problem not found';
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'error',
        error
      });
      throw new Error(error);
    }

    const testCases = problem.testCases;
    if (!testCases || testCases.length === 0) {
      const error = 'No test cases defined for this problem';
      await Submission.findByIdAndUpdate(submissionId, {
        status: 'error',
        error
      });
      throw new Error(error);
    }

    // Step 3: Write code to temporary file
    const fileExtension = getFileExtension(language);
    const fileName = `${submissionId}_code.${fileExtension}`;
    const filePath = path.join(TEMP_DIR, fileName);
    console.log(`[Job ${job.id}] Writing code to temp file: ${filePath}`);
    await fs.writeFile(filePath, code);

    try {
      // Step 4: Run all test cases
      const results = await runAllTestCases(language, fileName, testCases, 5000);
     
      // Step 5: Evaluate results
      const evaluation = evaluateResults(results);
      // Step 6: Update submission with results
      await Submission.findByIdAndUpdate(submissionId, {
        status: evaluation.status,
        results,
        error: evaluation.error,
        executionTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0)
      });

      console.log(`[Job ${job.id}] Completed with status: ${evaluation.status}`);

      return {
        status: evaluation.status,
        totalTests: results.length,
        passedTests: results.filter(r => r.passed).length
      };

    } catch (error) {
      console.error(`[Job ${job.id}] Execution error:`, error);

      await Submission.findByIdAndUpdate(submissionId, {
        status: 'error',
        error: error.message
      });

      throw error;

    } finally {
      // Step 7: Clean up temp file
      try {
        await fs.unlink(filePath);
        console.log(`[Job ${job.id}] Cleaned up temp file: ${fileName}`);
      } catch (unlinkError) {
        console.error(`[Job ${job.id}] Failed to clean up temp file:`, unlinkError);
      }
    }
  },
  {
    connection: {
      host: ENV.REDIS_HOST,
      port: parseInt(ENV.REDIS_PORT)
    },
    concurrency: 2
  }
);

worker.on("completed", (job, result) => {
  console.log(`[Job ${job.id}] Completed successfully:`, result);
});

worker.on("failed", (job, err) => {
  console.error(`[Job ${job.id}] Failed:`, err);
});

worker.on("error", (err) => {
  console.error(`Worker error:`, err);
});

// Connect to DB and start worker
connectDB().then(() => {
  console.log("\n========================================");
  console.log("Connected to DB, worker is running...");
  console.log("========================================\n");
}).catch((err) => {
  console.error("Failed to connect to DB, worker not started", err);
  process.exit(1);
});
