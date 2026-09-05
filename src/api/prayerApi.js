import axiosClient from "./axios";

// GET (search + pagination)
export const getPrayers = (params) => {
  return axiosClient.get("/prayers", { params });
};

// GET by ID
export const getPrayerById = (id) => {
  return axiosClient.get(`/prayers/${id}`);
};

// CREATE
export const createPrayer = (data) => {
  return axiosClient.post("/prayers", data);
};

// UPDATE
export const updatePrayer = (id, data) => {
  return axiosClient.put(`/prayers/${id}`, data);
};

// DELETE
export const deletePrayer = (id) => {
  return axiosClient.delete(`/prayers/${id}`);
};
