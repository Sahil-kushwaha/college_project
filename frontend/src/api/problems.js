import axiosInstance from "../lib/axios";

export const problemApi = {
  getProblems: async () => {
    const response = await axiosInstance.get("/problems");
    return response.data;
  },
  getProblem: async (identifier) => {
    const response = await axiosInstance.get(`/problems/${identifier}`);
    return response.data;
  },
  createProblem: async (problemData) => {
    const response = await axiosInstance.post("/problems", problemData);
    return response.data;
  },
};
