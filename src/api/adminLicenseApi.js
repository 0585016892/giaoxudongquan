import axios from "./axios";

const adminLicenseApi = {
  /**
   * Lấy danh sách tất cả đăng ký
   */
  getRegistrations: async () => {
    const response = await axios.get("/license-regis/registrations");

    return response?.data ?? response;
  },

  /**
   * Lấy chi tiết một đăng ký
   */
  getRegistrationById: async (id) => {
    const response = await axios.get(`/license-regis/registrations/${id}`);

    return response?.data ?? response;
  },

  /**
   * Duyệt đăng ký
   */
  approveRegistration: async (id) => {
    const response = await axios.put(
      `/license-regis/registrations/${id}/approve`,
    );

    return response?.data ?? response;
  },

  /**
   * Từ chối đăng ký
   */
  rejectRegistration: async (id, reason) => {
    const response = await axios.put(
      `/license-regis/registrations/${id}/reject`,
      {
        reason,
      },
    );

    return response?.data ?? response;
  },
};

export default adminLicenseApi;
