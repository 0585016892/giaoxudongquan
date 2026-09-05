import axiosClient from "./axios";

// 1. Thống kê Giáo xứ / Giáo họ (Hỗ trợ lọc theo district, type, status, startDate, endDate)
export const getChurchReport = (params) => {
  return axiosClient.get("/report/church", { params });
};

// 2. Thống kê Kho Tài liệu & Biểu mẫu (Hỗ trợ lọc theo category, status, file_type, startDate, endDate)
export const getDocumentReport = (params) => {
  return axiosClient.get("/report/document", { params });
};

// 3. Thống kê Sự kiện Mục vụ (Hỗ trợ lọc theo category, location, is_active, startDate, endDate)
export const getEventReport = (params) => {
  return axiosClient.get("/report/event", { params });
};

// 4. Thống kê Kết quả Thi Giáo lý (Hỗ trợ lọc theo class_name, parish, minScore, maxScore, startDate, endDate)
export const getExamReport = (params) => {
  return axiosClient.get("/report/exam", { params });
};

// 5. Thống kê Hội đoàn & Đoàn thể
export const getGroupReport = (params) => {
  return axiosClient.get("/report/group", { params });
};

// 6. Thống kê Lịch Phụng vụ & Thánh lễ (Hỗ trợ lọc theo church_name, priest, type, year, month)
export const getLiturgicalReport = (params) => {
  return axiosClient.get("/report/liturgical", { params });
};

// 7. Thống kê Danh sách Giáo dân (Hỗ trợ lọc theo church_id, gender, marital_status, occupation, status)
export const getParishionerReport = (params) => {
  return axiosClient.get("/report/parishioners", { params });
};

// 8. Thống kê Banner & Slides
export const getSlideReport = (params) => {
  return axiosClient.get("/report/slides", { params });
};

// 9. Thống kê Lượt truy cập Website (Hỗ trợ lọc theo device_type, browser, startDate, endDate)
export const getVisitorReport = (params) => {
  return axiosClient.get("/report/visitors", { params });
};

/**
 * 10. TẢI / XUẤT FILE BÁO CÁO (CSV / Excel)
 * @param {string} type - Loại báo cáo: 'church' | 'document' | 'event' | 'exam' | 'parishioner' | 'liturgical' | 'visitor'
 */
export const exportReportFile = (type) => {
  return axiosClient.get(`/report/export/${type}`, {
    responseType: "blob", // Nhận dữ liệu dưới dạng File Stream
  });
};
