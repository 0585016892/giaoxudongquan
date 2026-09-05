import axios from "./axios";

export const getVisitorStats = () => {
  return axios.get("/stats");
};

export const getVisitorChart = () => {
  return axios.get("/stats/chart");
};
export const getVisitorHistory = (ip) => {
  return axios.get(`/stats/history/${encodeURIComponent(ip)}`);
};
