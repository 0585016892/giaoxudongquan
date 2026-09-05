import axiosClient from "./axios"; // Hoặc axios instance của bạn

const catechistApi = {
  // Lấy danh sách tất cả GLV
  getAll: () => {
    return axiosClient.get("/catechist");
  },

  // Lấy chi tiết 1 GLV
  getById: (id) => {
    return axiosClient.get(`/catechist/${id}`);
  },

  // Tạo mới GLV (Mã GLV tự sinh ở backend)
  create: (data) => {
    return axiosClient.post("/catechist", data);
  },

  // Cập nhật thông tin GLV
  update: (id, data) => {
    return axiosClient.put(`/catechist/${id}`, data);
  },

  // Xóa GLV
  delete: (id) => {
    return axiosClient.delete(`/catechist/${id}`);
  },

  // Phân lớp cho GLV
  assignClass: (data) => {
    return axiosClient.post("/catechist/assign-class", data);
  },
  removeClass: (data) =>
    axiosClient.delete("/catechist/remove-class", {
      data,
    }),
};

export default catechistApi;
