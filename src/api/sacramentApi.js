import axiosInstance from "./axios";

const BASE_URL = "/sacraments";

export const sacramentApi = {
  // 1. Lấy danh sách bí tích (tìm kiếm, lọc, phân trang)
  getAll: (params) =>
    axiosInstance.get(BASE_URL, { params }).then((res) => res.data),

  // 2. Lấy lịch sử tất cả bí tích của 1 giáo dân
  getByParishionerId: (parishionerId) =>
    axiosInstance
      .get(`${BASE_URL}/parishioner/${encodeURIComponent(parishionerId)}`)
      .then((res) => res.data),

  // 3. Lấy chi tiết 1 bản ghi (Dùng để in trích lục)
  getById: (id) =>
    axiosInstance
      .get(`${BASE_URL}/${encodeURIComponent(id)}`)
      .then((res) => res.data),

  // 4. Tạo mới hồ sơ bí tích
  create: (data) => axiosInstance.post(BASE_URL, data).then((res) => res.data),

  // 5. Cập nhật hồ sơ bí tích
  update: (id, data) =>
    axiosInstance
      .put(`${BASE_URL}/${encodeURIComponent(id)}`, data)
      .then((res) => res.data),

  // 6. Xóa hồ sơ bí tích
  remove: (id) =>
    axiosInstance
      .delete(`${BASE_URL}/${encodeURIComponent(id)}`)
      .then((res) => res.data),
};

export default sacramentApi;
