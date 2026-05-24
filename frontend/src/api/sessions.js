import axiosInstance from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    console.log("🚀 Creating session with data:", data);
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    console.log("📋 Fetching active sessions...");
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    console.log("📋 Fetching recent sessions...");
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    console.log("📋 Fetching session:", id);
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    console.log("👥 Joining session:", id);
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    console.log("🛑 Ending session:", id);
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  getStreamToken: async () => {
    console.log("🎫 Getting stream token...");
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
