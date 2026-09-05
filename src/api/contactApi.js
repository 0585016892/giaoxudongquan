import axios from "./axios";

// ===============================
// API AUTO-RESPONDER CONFIG
// ===============================

/**
 * Lấy cấu hình tự động trả lời (ID = 1)
 * GET /api/contact/auto-responder
 */
export const getAutoResponderConfig = async () => {
  const response = await axios.get("/contact/auto-responder");
  return response.data;
};

/**
 * Lưu / Cập nhật cấu hình tự động trả lời
 * PUT /api/contact/auto-responder
 * @param {Object} data - { enabled: boolean, subject: string, template: string }
 */
export const updateAutoResponderConfig = async (data) => {
  const response = await axios.put("/contact/auto-responder", data);
  return response.data;
};

// ===============================
// API QUẢN LÝ LIÊN HỆ
// ===============================

/**
 * Lấy danh sách liên hệ (Có phân trang, lọc status, tìm kiếm)
 * GET /api/contact
 */
export const getContacts = async ({
  page = 1,
  limit = 10,
  status,
  search,
} = {}) => {
  const params = {
    page,
    limit,
    ...(status && { status }),
    ...(search?.trim() && { search: search.trim() }),
  };

  const response = await axios.get("/contact", { params });
  return response.data;
};

/**
 * Xem chi tiết liên hệ
 * GET /api/contact/:id
 * (Backend tự động chuyển status 'new' -> 'read')
 */
export const getContactById = async (id) => {
  const response = await axios.get(`/contact/${id}`);
  return response.data;
};

/**
 * Gửi liên hệ mới từ Website (Client Public)
 * POST /api/contact
 * @param {Object} data - { name, email, subject, message }
 */
export const createContact = async (data) => {
  const response = await axios.post("/contact", data);
  return response.data;
};

/**
 * Đổi trạng thái liên hệ (new | read | replied | archived)
 * PATCH /api/contact/:id/status
 */
export const updateContactStatus = async (id, status) => {
  const response = await axios.patch(`/contact/${id}/status`, { status });
  return response.data;
};

/**
 * Gửi email phản hồi trực tiếp cho người liên hệ
 * POST /api/contact/:id/reply
 * @param {Object} data - { contactId, to, subject, message }
 */
export const replyContactApi = async ({ contactId, to, subject, message }) => {
  const response = await axios.post(`/contact/${contactId}/reply`, {
    to,
    subject,
    message,
  });
  return response.data;
};

/**
 * Xóa liên hệ
 * DELETE /api/contact/:id
 */
export const deleteContact = async (id) => {
  const response = await axios.delete(`/contact/${id}`);
  return response.data;
};
