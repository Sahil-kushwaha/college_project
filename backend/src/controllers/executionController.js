import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import { codeQueue } from '../lib/queue.js';
import mongoose from 'mongoose';

/**
 * Submit code for execution
 * POST /api/run
 */
export const submitCode = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.auth?.userId; // Use Clerk user ID

    // Validate required fields
    if (!code || !language || !problemId) {
      return res.status(400).json({
        error: 'Missing required fields: code, language, problemId'
      });
    }

    // Validate language
    const validLanguages = ['javascript', 'python', 'cpp'];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({
        error: `Invalid language. Must be one of: ${validLanguages.join(', ')}`
      });
    }

    // Verify problem exists
    const problem = mongoose.isValidObjectId(problemId)
      ? await Problem.findById(problemId)
      : await Problem.findOne({ slug: problemId });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Create submission document FIRST (status: pending)
    const submission = await Submission.create({
      code,
      language,
      problemId,
      userId: userId || null,
      status: 'pending',
      results: [],
      error: null
    });

    console.log(`Created submission ${submission._id} for problem ${problemId}`);

    // Add job to queue with submissionId
    const job = await codeQueue.add("execute", {
      submissionId: submission._id.toString(),
      code,
      language,
      problemId
    }, {
      removeOnComplete: {
        age: 3600, // 1 hour
        count: 100 // keep last 100 results
      },
      removeOnFail: {
        age: 24 * 3600 // remove after 24 hours
      }
    });

    // Store jobId in submission for reference
    submission.jobId = job.id;
    await submission.save();

    res.status(200).json({
      jobId: job.id,
      submissionId: submission._id,
      status: 'pending',
      message: 'Code execution started'
    });

  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get submission result by submissionId
 * GET /api/result/:submissionId
 */
export const getSubmissionResult = async (req, res) => {
  try {
    const { submissionId } = req.params;
    if(!submissionId) {
      return res.status(400).json({ error: "Missing submissionId parameter" });
    }
    if(!mongoose.isValidObjectId(submissionId)) {
                 return res.status(400).json({ error: "Invalid submissionId format" });
     }
    const submission = await Submission.findById(submissionId)
      .populate('problemId', 'title difficulty')
      .lean();

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // If still pending/running, check job status
    if (submission.status === 'pending' || submission.status === 'running') {
      try {
        const job = await codeQueue.getJob(submission.jobId);
        if (job) {
          const state = await job.getState();

          if (state === 'failed') {
            await Submission.findByIdAndUpdate(submissionId, {
              status: 'error',
              error: job.failedReason
            });
            submission.status = 'error';
            submission.error = job.failedReason;
          }
        }
      } catch (jobError) {
        // Job not found in Redis, rely on MongoDB status
      }
    }

    res.status(200).json({
      submissionId: submission._id,
      jobId: submission.jobId,
      status: submission.status,
      results: submission.results,
      error: submission.error,
      executionTime: submission.executionTime,
      problem: submission.problemId,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt
    });

  } catch (error) {
    console.error('Error fetching submission result:', error);
    res.status(500).json({ error: error.message ||  'Internal server error' });
  }
};

/**
 * Get submission by jobId (legacy support)
 * GET /api/job/:jobId
 */
export const getJobByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;

    const submission = await Submission.findOne({ jobId })
      .lean();

    if (!submission) {
      return res.status(0, { error: "Job not found" });
    }

    res.status(200).json({
      submissionId: submission._id,
      jobId: submission.jobId,
      status: submission.status,
      results: submission.results,
      error: submission.error,
      executionTime: submission.executionTime
    });

  } catch (error) {
    console.error('Error fetching job result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
