import axiosClient from "./axios";

export const getResultStatistics = async () => {
  const response = await axiosClient.get("/results/statistics");

  return response.data;
};

export const getLeaderboard = async () => {
  const response = await axiosClient.get("/results/leaderboard");

  return response.data;
};

export const getResultsLeaderBoard = getLeaderboard;

export const getResultsByClass = async (classId) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/class/${classId}`);
  console.log("getResultsByClass:::", getResultsByClass);

  return response.data;
};

export const getClassLeaderboard = async (classId) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/class/${classId}/leaderboard`,
  );

  return response.data;
};

export const getClassStatistics = async (classId) => {
  if (!classId) {
    throw new Error("classId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/class/${classId}/statistics`,
  );

  return response.data;
};

export const getResultsByStudent = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId là bắt buộc");
  }

  const response = await axiosClient.get(`/results/student/${studentId}`);

  return response.data;
};

export const getStudentStatistics = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId là bắt buộc");
  }

  const response = await axiosClient.get(
    `/results/student/${studentId}/statistics`,
  );

  return response.data;
};

export const getResults = async () => {
  const response = await axiosClient.get("/results");

  return response.data;
};

/**
 * Lấy chi tiết một kết quả
 *
 * GET /api/results/:id
 *
 * @param {number|string} id
 */
export const getResultById = async (id) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  const response = await axiosClient.get(`/results/${id}`);

  return response.data;
};

/**
 * Tạo kết quả mới
 *
 * POST /api/results
 *
 * @param {object} data
 */
export const createResult = async (data) => {
  if (!data) {
    throw new Error("Dữ liệu kết quả là bắt buộc");
  }

  const response = await axiosClient.post("/results", data);

  return response.data;
};

/**
 * Cập nhật kết quả
 *
 * PUT /api/results/:id
 *
 * @param {number|string} id
 * @param {object} data
 */
export const updateResult = async (id, data) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  if (!data) {
    throw new Error("Dữ liệu cập nhật là bắt buộc");
  }

  const response = await axiosClient.put(`/results/${id}`, data);

  return response.data;
};

/**
 * Xóa kết quả
 *
 * DELETE /api/results/:id
 *
 * @param {number|string} id
 */
export const deleteResult = async (id) => {
  if (!id) {
    throw new Error("result id là bắt buộc");
  }

  const response = await axiosClient.delete(`/results/${id}`);

  return response.data;
};
