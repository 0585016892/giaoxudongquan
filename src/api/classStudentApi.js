import axiosClient from "./axios";

const classStudentApi = {
  // Học sinh trong lớp
  getByClass: (classId) => axiosClient.get(`/class-students/class/${classId}`),

  // Các lớp của học sinh
  getByStudent: (studentId) =>
    axiosClient.get(`/class-students/student/${studentId}`),

  // Thêm học sinh vào lớp
  add: (data) => axiosClient.post("/class-students", data),

  // Cập nhật
  update: (classId, studentId, data) =>
    axiosClient.put(`/class-students/update/${classId}/${studentId}`, data),

  // Xóa khỏi lớp
  remove: (classId, studentId) =>
    axiosClient.delete(`/class-students/${classId}/${studentId}`),

  changeClass: (classId, studentId, newClassId) =>
    axiosClient.put(`/class-students/${classId}/${studentId}/change-class`, {
      newClassId,
    }),
};

export default classStudentApi;
