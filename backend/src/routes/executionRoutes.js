import express from 'express';
import {
  submitCode,
  getSubmissionResult,
  getJobByJobId
} from '../controllers/executionController.js';

const router = express.Router();

// Submit code for execution
router.post('/run', submitCode);

// Get result by submission ID (primary method)
router.get('/result/:submissionId', getSubmissionResult);

// Get result by job ID (legacy support)
router.get('/job/:jobId', getJobByJobId);

export default router;
