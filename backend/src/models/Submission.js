import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  jobId: {
    type: String,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true
  },

  code: String,

  language: {
    type: String,
    enum: ["javascript", "python", "cpp"]
  },

  status: {
    type: String,
    enum: ["pending", "running", "accepted", "wrong", "error"],
    default: "pending"
  },

  results: [
    {
      input: String,
      expected: String,
      output: String,
      passed: Boolean
    }
  ],

  error: String

}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
