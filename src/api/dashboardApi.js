// src/api/dashboardApi.js
import axios from "./axios";

// ===============================
// 📊 LẤY DỮ LIỆU DASHBOARD
// ===============================
export const getDashboard = async () => {
  try {
    const response = await axios.get("/dashboard");
    return response.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};
export const getDashboardCate = async () => {
  try {
    const response = await axios.get("/dashboard/dashboard-cate");
    return response.data;
  } catch (error) {
    console.error("Dashboard API error:", error);
    throw error;
  }
};
