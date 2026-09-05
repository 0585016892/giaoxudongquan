import { useState, useCallback } from "react";
import { sacramentApi } from "../api/sacramentApi";
import { message } from "antd";

/**
 * Helper chuẩn hóa dữ liệu Payload trước khi gửi về API
 * Chuyển các giá trị chuỗi rỗng "" hoặc undefined thành null
 * để phù hợp chuẩn CSDL MySQL
 */
const sanitizePayload = (payload) => {
  const cleanData = {};
  Object.keys(payload).forEach((key) => {
    const val = payload[key];
    if (val === "" || val === undefined) {
      cleanData[key] = null;
    } else {
      cleanData[key] = val;
    }
  });
  return cleanData;
};

export const useSacrament = () => {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedSacrament, setSelectedSacrament] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // 1. Lấy danh sách hồ sơ Bí Tích (Tìm kiếm, Phân trang, Lọc loại bí tích)
  const fetchSacraments = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await sacramentApi.getAll(params);
      if (res?.success || Array.isArray(res?.data)) {
        setData(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
      return res;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Lỗi tải danh sách Bí Tích!";
      message.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Lấy danh sách lịch sử Bí Tích của 1 Giáo Dân (Dùng cho Timeline Giáo dân)
  const fetchByParishioner = useCallback(async (parishionerId) => {
    if (!parishionerId) return [];
    setLoading(true);
    try {
      const res = await sacramentApi.getByParishionerId(parishionerId);
      return res?.data || res || [];
    } catch (err) {
      message.error("Lỗi lấy lịch sử Bí Tích của giáo dân!");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Lấy chi tiết 1 bản ghi Bí Tích theo ID (Dùng cho Modal In Trích Lục)
  const getSacramentById = useCallback(async (id) => {
    if (!id) return null;
    setDetailLoading(true);
    try {
      const res = await sacramentApi.getById(id);
      const detail = res?.data || res || null;
      setSelectedSacrament(detail);
      return detail;
    } catch (err) {
      message.error("Không thể lấy thông tin chi tiết bí tích!");
      return null;
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // 4. Khai báo Bí Tích Mới (Xử lý đầy đủ 22+ trường CSDL)
  const addSacrament = useCallback(async (rawPayload) => {
    setLoading(true);
    try {
      const payload = sanitizePayload(rawPayload);
      const res = await sacramentApi.create(payload);

      message.success("Khai báo hồ sơ bí tích thành công!");
      return res;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Ghi nhận bí tích thất bại!";
      message.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 5. Cập nhật Hồ sơ Bí Tích (Xử lý đầy đủ 22+ trường CSDL)
  const editSacrament = useCallback(async (id, rawPayload) => {
    if (!id) return;
    setLoading(true);
    try {
      const payload = sanitizePayload(rawPayload);
      const res = await sacramentApi.update(id, payload);

      message.success("Cập nhật hồ sơ bí tích thành công!");
      return res;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Cập nhật bí tích thất bại!";
      message.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 6. Xóa Hồ sơ Bí Tích
  const deleteSacrament = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await sacramentApi.remove(id);
      message.success("Xóa hồ sơ bí tích thành công!");
      return res;
    } catch (err) {
      const errMsg =
        err.response?.data?.message || "Xóa hồ sơ bí tích thất bại!";
      message.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    loading,
    detailLoading,
    data,
    selectedSacrament,
    pagination,

    // Setters
    setSelectedSacrament,

    // Actions
    fetchSacraments,
    fetchByParishioner,
    getSacramentById,
    addSacrament,
    editSacrament,
    deleteSacrament,
  };
};

export default useSacrament;
