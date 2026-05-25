import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { problemApi } from "../api/problems";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon, SaveIcon } from "lucide-react";

function AdminProblemPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    difficulty: "easy",
    description: {
      text: "",
      notes: [""],
    },
    examples: [{ input: "", output: "", explanation: "" }],
    constraints: [""],
    testCases: [{ input: "", expected: "", isHidden: false }],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [name]: value },
    }));
  };

  const handleNoteChange = (index, value) => {
    const newNotes = [...formData.description.notes];
    newNotes[index] = value;
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, notes: newNotes },
    }));
  };

  const addNote = () => {
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, notes: [...prev.description.notes, ""] },
    }));
  };

  const removeNote = (index) => {
    const newNotes = formData.description.notes.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, notes: newNotes },
    }));
  };

  const handleExampleChange = (index, field, value) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData((prev) => ({ ...prev, examples: newExamples }));
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...prev.examples, { input: "", output: "", explanation: "" }],
    }));
  };

  const removeExample = (index) => {
    setFormData((prev) => ({
      ...prev,
      examples: formData.examples.filter((_, i) => i !== index),
    }));
  };

  const handleConstraintChange = (index, value) => {
    const newConstraints = [...formData.constraints];
    newConstraints[index] = value;
    setFormData((prev) => ({ ...prev, constraints: newConstraints }));
  };

  const addConstraint = () => {
    setFormData((prev) => ({
      ...prev,
      constraints: [...prev.constraints, ""],
    }));
  };

  const removeConstraint = (index) => {
    setFormData((prev) => ({
      ...prev,
      constraints: formData.constraints.filter((_, i) => i !== index),
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData((prev) => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setFormData((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", expected: "", isHidden: false }],
    }));
  };

  const removeTestCase = (index) => {
    setFormData((prev) => ({
      ...prev,
      testCases: formData.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await problemApi.createProblem(formData);
      toast.success("Problem created successfully!");
      navigate("/problems");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create problem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Problem</h1>
          <button onClick={() => navigate("/problems")} className="btn btn-ghost">
            Back to Problems
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="card bg-base-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Problem Title</span>
                </label>
                <input
                  name="title"
                  className="input input-bordered w-full"
                  placeholder="e.g. Two Sum"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">URL Slug</span>
                </label>
                <input
                  name="slug"
                  className="input input-bordered w-full"
                  placeholder="e.g. two-sum"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Category</span>
                </label>
                <input
                  name="category"
                  className="input input-bordered w-full"
                  placeholder="e.g. Array • Hash Table"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Difficulty</span>
                </label>
                <select
                  name="difficulty"
                  className="select select-bordered w-full"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card bg-base-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Problem Description</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Main Description</span>
              </label>
              <textarea
                name="text"
                className="textarea textarea-bordered h-32"
                placeholder="Describe the problem..."
                value={formData.description.text}
                onChange={handleDescriptionChange}
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="label-text font-medium">Additional Notes</label>
                <button
                  type="button"
                  onClick={addNote}
                  className="btn btn-sm btn-primary"
                >
                  <PlusIcon className="size-4" /> Add Note
                </button>
              </div>
              {formData.description.notes.map((note, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="input input-bordered flex-1"
                    value={note}
                    onChange={(e) => handleNoteChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeNote(index)}
                    className="btn btn-square btn-sm btn-outline btn-error"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className="card bg-base-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Examples</h2>
              <button
                type="button"
                onClick={addExample}
                className="btn btn-sm btn-primary"
              >
                <PlusIcon className="size-4" /> Add Example
              </button>
            </div>
            <div className="space-y-6">
              {formData.examples.map((example, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-base-200/50">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Example {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="btn btn-square btn-sm btn-outline btn-error"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label-text mb-1">Input</label>
                      <input
                        className="input input-bordered w-full"
                        value={example.input}
                        onChange={(e) => handleExampleChange(index, "input", e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label-text mb-1">Output</label>
                      <input
                        className="input input-bordered w-full"
                        value={example.output}
                        onChange={(e) => handleExampleChange(index, "output", e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label-text mb-1">Explanation</label>
                      <input
                        className="input input-bordered w-full"
                        value={example.explanation}
                        onChange={(e) => handleExampleChange(index, "explanation", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="card bg-base-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Constraints</h2>
              <button
                type="button"
                onClick={addConstraint}
                className="btn btn-sm btn-primary"
              >
                <PlusIcon className="size-4" /> Add Constraint
              </button>
            </div>
            <div className="space-y-3">
              {formData.constraints.map((constraint, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="input input-bordered flex-1"
                    value={constraint}
                    onChange={(e) => handleConstraintChange(index, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    className="btn btn-square btn-sm btn-outline btn-error"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Test Cases */}
          <div className="card bg-base-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Test Cases</h2>
              <button
                type="button"
                onClick={addTestCase}
                className="btn btn-sm btn-primary"
              >
                <PlusIcon className="size-4" /> Add Test Case
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Input</th>
                    <th>Expected Output</th>
                    <th>Hidden?</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.testCases.map((tc, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          className="input input-bordered w-full"
                          value={tc.input}
                          onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="input input-bordered w-full"
                          value={tc.expected}
                          onChange={(e) => handleTestCaseChange(index, "expected", e.target.value)}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={tc.isHidden}
                          onChange={(e) => handleTestCaseChange(index, "isHidden", e.target.checked)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="btn btn-square btn-sm btn-outline btn-error"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg px-12"
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <SaveIcon className="size-5 mr-2" /> Save Problem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminProblemPage;
