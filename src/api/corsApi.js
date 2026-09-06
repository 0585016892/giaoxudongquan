import axiosClient from "./axios";

const corsApi = {
  // Lấy toàn bộ domain
  getAll() {
    return axiosClient.get("/cors");
  },

  // Lấy domain đang active
  getActive() {
    return axiosClient.get("/cors/active");
  },

  // Thêm domain
  create(data) {
    return axiosClient.post("/cors", data);
  },

  // Sửa domain
  update(id, data) {
    return axiosClient.put(`/cors/${id}`, data);
  },

  // Bật / tắt domain
  toggle(id) {
    return axiosClient.patch(`/cors/${id}/toggle`);
  },

  // Xóa domain
  remove(id) {
    return axiosClient.delete(`/cors/${id}`);
  },
};

export default corsApi;
