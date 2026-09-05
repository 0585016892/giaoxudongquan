import axiosClient from "./axios"; // Hoặc đường dẫn file axios config của bạn

// 1. Lấy thông báo hôm nay
export const getNotificationsToday = () => {
  return axiosClient.get("/notifications/today");
};

// 2. Lấy toàn bộ danh sách thông báo (có thể kèm query params nếu có)
export const getNotifications = (params) => {
  return axiosClient.get("/notifications", { params });
};

// 3. Lấy thống kê thông báo
export const getNotificationStats = () => {
  return axiosClient.get("/notifications/stats");
};

// 4. Lấy chi tiết 1 thông báo
export const getNotificationById = (id) => {
  return axiosClient.get(`/notifications/${id}`);
};

// 5. Tạo thông báo mới (Admin)
export const createNotification = (data) => {
  return axiosClient.post("/notifications", data);
};

// 6. Đánh dấu TẤT CẢ đã đọc (Cần auth header token)
export const markAllNotificationsAsRead = () => {
  return axiosClient.put("/notifications/read-all");
};

// 7. Đánh dấu 1 thông báo là ĐÃ ĐỌC
export const markNotificationAsRead = (id) => {
  return axiosClient.put(`/notifications/${id}/read`);
};

// 8. Xóa 1 thông báo
export const deleteNotification = (id) => {
  return axiosClient.delete(`/notifications/${id}`);
};

// XÓA TẤT CẢ THÔNG BÁO (HÀM MỚI THÊM)
export const deleteAllNotifications = () => {
  return axiosClient.delete("/notifications/delete-all");
};
