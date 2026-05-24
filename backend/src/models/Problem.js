import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: String,
  description: {
    text: String,
    notes: [String]
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  examples: [
    {
      input: String,
      output: String,
      explanation: String
    }
  ],
  constraints: [String],
  testCases: [
    {
      input: String,
      expected: String,
      isHidden: { type: Boolean, default: true }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Problem = mongoose.model("Problem", problemSchema);

export default Problem;
