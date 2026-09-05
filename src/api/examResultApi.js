import axios from "./axios";

// Gửi kết quả kiểm tra
export const submitExamResult = async (data) => {
  return await axios.post("/exam-results", data);
};

// Lấy danh sách kết quả
export const getExamResults = async () => {
  return await axios.get("/exam-results");
};

// Lấy một kết quả theo ID
export const getExamResultById = async (id) => {
  return await axios.get(`/exam-results/${id}`);
};

// Xóa kết quả
export const deleteExamResult = async (id) => {
  return await axios.delete(`/exam-results/${id}`);
};
