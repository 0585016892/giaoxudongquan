// src/api/slideApi.js
import axios from "./axios";

// ================= GET ALL =================
export const getSlides = async () => {
  const res = await axios.get("/slides");
  return res.data;
};

// ================= GET ACTIVE =================
export const getActiveSlides = async () => {
  const res = await axios.get(`/slides/active`);
  return res.data;
};

// ================= CREATE =================
export const createSlide = async (formData) => {
  const res = await axios.post("/slides", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ================= UPDATE =================
export const updateSlide = async (id, data) => {
  const res = await axios.put(`/slides/${id}`, data);
  return res.data;
};
export const updateSlideStatus = async (id, data) => {
  const res = await axios.put(`/slides/${id}/status`, data);
  return res.data;
};
// ================= DELETE =================
export const deleteSlide = async (id) => {
  const res = await axios.delete(`/slides/${id}`);
  return res.data;
};
