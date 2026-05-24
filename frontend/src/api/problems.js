import axios from "../lib/axios";

/**
 * Fetch all problems for the listing page
 * @returns {Promise<{count: number, problems: Array}>}
 */
export async function fetchProblems() {
  try {
    const response = await axios.get("/problems");
    return response.data;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw error;
  }
}

/**
 * Fetch a single problem by its slug
 * @param {string} slug - The unique slug of the problem
 * @returns {Promise<Object>}
 */
export async function fetchProblemBySlug(slug) {
  try {
    const response = await axios.get(`/problems/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching problem details:", error);
    throw error;
  }
}

/**
 * Create a new problem
 * @param {Object} problemData - The problem details
 * @returns {Promise<Object>}
 */
export async function createProblem(problemData) {
  try {
    const response = await axios.post("/problems", problemData);
    return response.data;
  } catch (error) {
    console.error("Error creating problem:", error);
    throw error;
  }
}
