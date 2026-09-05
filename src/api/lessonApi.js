import axiosClient from "./axios";

// ======================
// LESSON
// ======================

export const getLessons = (params) => axiosClient.get("/lessons", { params });

export const getLessonById = (id) => axiosClient.get(`/lessons/${id}`);

export const createLesson = (data) => axiosClient.post("/lessons", data);

export const updateLesson = (id, data) =>
  axiosClient.put(`/lessons/${id}`, data);

export const deleteLesson = (id) => axiosClient.delete(`/lessons/${id}`);

// ======================
// QUESTION
// ======================

export const getQuestions = (params) =>
  axiosClient.get("/questions", { params });

export const getQuestionById = (id) => axiosClient.get(`/questions/${id}`);

export const createQuestion = (data) => axiosClient.post("/questions", data);

export const updateQuestion = (id, data) =>
  axiosClient.put(`/questions/${id}`, data);

export const deleteQuestion = (id) => axiosClient.delete(`/questions/${id}`);
