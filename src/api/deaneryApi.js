import axios from "./axios";

/**
 * =========================================================
 * GET ALL GIÁO HẠT
 *
 * GET /api/deaneries
 *
 * params:
 * {
 *   diocese_id,
 *   is_active,
 *   keyword
 * }
 * =========================================================
 */
export const getDeaneries = async (params = {}) => {
  const res = await axios.get("/deaneries", {
    params,
  });

  return res.data;
};

/**
 * =========================================================
 * GET GIÁO HẠT BY ID
 *
 * GET /api/deaneries/:id
 * =========================================================
 */
export const getDeaneryById = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo hạt");
  }

  const res = await axios.get(`/deaneries/${id}`);

  return res.data;
};

/**
 * =========================================================
 * GET GIÁO HẠT THEO GIÁO PHẬN
 *
 * GET /api/deaneries/diocese/:dioceseId
 *
 * Dùng cho cascading:
 *
 * Tổng GP
 *     ↓
 * Giáo phận
 *     ↓
 * Giáo hạt
 * =========================================================
 */
export const getDeaneriesByDiocese = async (dioceseId) => {
  if (!dioceseId) {
    return {
      success: true,
      data: [],
      total: 0,
    };
  }

  const res = await axios.get(`/deaneries/diocese/${dioceseId}`);

  return res.data;
};

/**
 * =========================================================
 * CREATE GIÁO HẠT
 *
 * POST /api/deaneries
 * =========================================================
 */
export const createDeanery = async (data) => {
  if (!data) {
    throw new Error("Thiếu dữ liệu Giáo hạt");
  }

  const res = await axios.post("/deaneries", data);

  return res.data;
};

/**
 * =========================================================
 * UPDATE GIÁO HẠT
 *
 * PUT /api/deaneries/:id
 * =========================================================
 */
export const updateDeanery = async (id, data) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo hạt");
  }

  if (!data) {
    throw new Error("Thiếu dữ liệu cập nhật Giáo hạt");
  }

  const res = await axios.put(`/deaneries/${id}`, data);

  return res.data;
};

/**
 * =========================================================
 * DELETE GIÁO HẠT
 *
 * DELETE /api/deaneries/:id
 * =========================================================
 */
export const deleteDeanery = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo hạt");
  }

  const res = await axios.delete(`/deaneries/${id}`);

  return res.data;
};

/**
 * =========================================================
 * TOGGLE ACTIVE
 *
 * PATCH /api/deaneries/:id/toggle
 * =========================================================
 */
export const toggleDeaneryActive = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo hạt");
  }

  const res = await axios.patch(`/deaneries/${id}/toggle`);

  return res.data;
};
