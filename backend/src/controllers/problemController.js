import Problem from '../models/Problem.js';
import mongoose from 'mongoose';

/**
 * Create a new problem
 * POST /api/problems
 */
export const createProblem = async (req, res) => {
  try {
    const { title, slug, description, difficulty, testCases, category, constraints, examples } = req.body;

    // Validate required fields
    if (!title || !slug || !description || !difficulty) {
      return res.status(400).json({
        error: 'Missing required fields: title, slug, description, difficulty'
      });
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
      });
    }

    // Validate test cases
    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({
        error: 'At least one test case is required'
      });
    }

    // Validate each test case structure
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (typeof tc.input !== 'string' || typeof tc.expected !== 'string') {
        return res.status(400).json({
          error: `Test case ${i + 1} must have 'input' and 'expected' as strings`
        });
      }
    }

    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty: difficulty.toLowerCase(),
      testCases,
      category,
      constraints,
      examples
    });

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Problem with this slug already exists' });
    }
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all problems
 * GET /api/problems
 */
export const getAllProblems = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const query = {};
    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }

    const problems = await Problem.find(query)
      .select('title slug difficulty category createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: problems.length,
      problems
    });

  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single problem by ID or Slug
 * GET /api/problems/:identifier
 */
export const getProblem = async (req, res) => {
  try {
    const { identifier } = req.params;

    let problem;
    if (mongoose.isValidObjectId(identifier)) {
      problem = await Problem.findById(identifier);
    } else {
      problem = await Problem.findOne({ slug: identifier });
    }

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // SECURITY: Return problem without revealing hidden test cases
    const publicProblem = {
      ...problem.toObject(),
      testCases: problem.testCases.filter(tc => !tc.isHidden)
    };

    res.status(200).json(publicProblem);

  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update a problem
 * PUT /api/problems/:id
 */
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, testCases, category, constraints, examples } = req.body;

    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (title) problem.title = title;
    if (description) problem.description = description;
    if (category) problem.category = category;
    if (constraints) problem.constraints = constraints;
    if (examples) problem.examples = examples;

    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty.toLowerCase())) {
        return res.status(400).json({
          error: `Invalid difficulty. Must be one of: ${validDifficulties.join(', ')}`
        });
      }
      problem.difficulty = difficulty.toLowerCase();
    }

    if (testCases && Array.isArray(testCases)) {
      if (testCases.length === 0) {
        return res.status(400).json({ error: 'At least one test case is required' });
      }
      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        if (typeof tc.input !== 'string' || typeof tc.expected !== 'string') {
          return res.status(400).json({
            error: `Test case ${i + 1} must have 'input' and 'expected' as strings`
          });
        }
      }
      problem.testCases = testCases;
    }

    await problem.save();

    res.status(200).json({
      message: 'Problem updated successfully',
      problem
    });

  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a problem
 * DELETE /api/problems/:id
 */
export const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;

    const problem = await Problem.findByIdAndDelete(id);

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    res.status(200).json({
      message: 'Problem deleted successfully',
      problem
    });

  } catch (error) {
    console.error('Error deleting problem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  deleteProblem
};
