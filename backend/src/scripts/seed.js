import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import { connectDB } from '../lib/db.js';
import { PROBLEMS } from '../../../frontend/src/data/problems.js';

async function seed() {
  try {
    await connectDB();

    console.log('\n========================================');
    console.log('Starting database seed from frontend data...');
    console.log('==========================================\n');

    // Clear existing problems
    await Problem.deleteMany({});
    console.log('Cleared existing problems');

    const sampleProblems = Object.entries(PROBLEMS).map(([slug, data]) => ({
      slug,
      title: data.title,
      description: typeof data.description === 'object'
        ? `${data.description.text}\n\n${data.description.notes.join('\n')}`
        : data.description,
      difficulty: data.difficulty.toLowerCase(),
      testCases: [], // The current PROBLEMS data doesn't have testCases in the format expected by the worker
      createdAt: new Date()
    }));

    // Since the frontend PROBLEMS data has "expectedOutput" instead of "testCases",
    // we will generate a basic test case from it.
    for (const p of sampleProblems) {
      const originalData = PROBLEMS[p.slug];
      if (originalData.expectedOutput) {
        // We'll just create one public test case for now based on the expectedOutput.
        // In a real scenario, we'd need a proper test case array.
        p.testCases.push({
          input: "Example Input", // Placeholder as frontend data lacks specific inputs
          expected: Object.values(originalData.expectedOutput)[0], // use javascript version as default
          isHidden: false
        });
      }
    }

    const inserted = await Problem.insertMany(sampleProblems);
    console.log(`\nInserted ${inserted.length} problems:\n`);

    for (const problem of inserted) {
      console.log(`  - ${problem.title} (${problem.slug})`);
    }

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================\n');

    process.exit(0);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
