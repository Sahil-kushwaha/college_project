import express from 'express';
import {
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  deleteProblem
} from '../controllers/problemController.js';

const router = express.Router();

// Create a new problem
router.post('/', createProblem);

// Get all problems (with optional difficulty filter)
router.get('/', getAllProblems);

// Get a single problem by ID or Slug
router.get('/:identifier', getProblem);

// Update a problem
router.put('/:id', updateProblem);

// Delete a problem
router.delete('/:id', deleteProblem);

export default router;
