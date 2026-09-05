import axiosClient from "./axios";

const studentApi = {
  // Lấy danh sách học sinh
  // Có thể truyền:
  // studentApi.getAll()
  // studentApi.getAll({ class_id: 33 })
  getAll: (params = {}) =>
    axiosClient.get("/students", {
      params,
    }),

  getStudentClass: (id) => axiosClient.get(`/students/student-class`),

  getById: (id) => axiosClient.get(`/students/${id}`),

  create: (data) => axiosClient.post("/students", data),

  update: (id, data) => axiosClient.put(`/students/${id}`, data),

  delete: (id) => axiosClient.delete(`/students/${id}`),
};

export default studentApi;
