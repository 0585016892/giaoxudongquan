import axiosClient from "./axios";

// =========================================================
// LESSON
// =========================================================

export const getLessons = (params) => axiosClient.get("/lessons", { params });

export const getLessonById = (id) => axiosClient.get(`/lessons/${id}`);

export const createLesson = (data) => axiosClient.post("/lessons", data);

export const updateLesson = (id, data) =>
  axiosClient.put(`/lessons/${id}`, data);

export const deleteLesson = (id) => axiosClient.delete(`/lessons/${id}`);

// =========================================================
// QUESTION
// =========================================================

// Danh sách câu hỏi
// GET /questions?page=1&limit=10&lesson_id=1&search=...
export const getQuestions = (params) =>
  axiosClient.get("/questions", { params });

// Chi tiết câu hỏi
// GET /questions/:id
export const getQuestionById = (id) => axiosClient.get(`/questions/${id}`);

// Thêm câu hỏi
// POST /questions
export const createQuestion = (data) => axiosClient.post("/questions", data);

// Cập nhật câu hỏi
// PUT /questions/:id
export const updateQuestion = (id, data) =>
  axiosClient.put(`/questions/${id}`, data);

// Xóa câu hỏi
// DELETE /questions/:id
export const deleteQuestion = (id) => axiosClient.delete(`/questions/${id}`);

// =========================================================
// EXAM
// =========================================================

// Tạo đề thi ngẫu nhiên
// GET /questions/exam?batch=1&limit=30
export const generateExam = (params) =>
  axiosClient.get("/questions/exam", { params });

// Nộp bài thi
// POST /questions/submit-exam
export const submitExam = (data) =>
  axiosClient.post("/questions/submit-exam", data);
