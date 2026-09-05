import axiosClient from "./axios";

// 1. Lấy thông tin cấu hình hệ thống hiện tại
export const getSettings = () => {
  return axiosClient.get("/settings");
};

// 2. Cập nhật các trường cấu hình hệ thống
export const updateSettings = (data) => {
  return axiosClient.put("/settings", data);
};

// 3. Gọi API tải file sao lưu cơ sở dữ liệu dạng .sql
export const downloadBackupApi = () => {
  return axiosClient.get("/settings/backup/download", {
    responseType: "blob", // RẤT QUAN TRỌNG: Để Axios hiểu và xử lý file nhị phân thô gửi từ server
  });
};
