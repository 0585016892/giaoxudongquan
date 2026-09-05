import axiosClient from "./axios";

// 1. Lấy danh sách các CHỦ HỘ (có hỗ trợ phân trang, tìm kiếm, lọc trạng thái)
export const getParishioners = (params) =>
  axiosClient.get("/parishioners", { params });
export const getParishionersAll = (params) =>
  axiosClient.get("/parishioners/all", { params });

// 2. Lấy thông tin chi tiết của 1 giáo dân cụ thể theo ID
export const getParishioner = (id) => axiosClient.get(`/parishioners/${id}`);

// 3. THÊM MỚI: Lấy danh sách tất cả thành viên thuộc một Chủ Hộ cụ thể
export const getFamilyMembers = (headId) =>
  axiosClient.get(`/parishioners/${headId}/members`);

// 4. THÊM MỚI: Lấy nhanh danh sách tất cả chủ hộ (Dùng để hiển thị trong ô Select khi tạo Thành viên)
export const getAllHouseheads = () =>
  axiosClient.get("/parishioners/heads/all");

// 5. Tạo mới một giáo dân (Chủ hộ hoặc Thành viên)
export const createParishioner = (data) =>
  axiosClient.post("/parishioners", data);

// 6. Cập nhật thông tin giáo dân
export const updateParishioner = (id, data) =>
  axiosClient.put(`/parishioners/${id}`, data);

// 7. Xóa giáo dân khỏi hệ thống
export const deleteParishioner = (id) =>
  axiosClient.delete(`/parishioners/${id}`);
