import axios from "./axios";

/**
 * =========================================================
 * GET ALL
 * GET /api/dioceses
 * =========================================================
 */
export const getDioceses = async (params = {}) => {
  const res = await axios.get("/dioceses", {
    params,
  });

  return res.data;
};

/**
 * =========================================================
 * GET BY ID
 * GET /api/dioceses/:id
 * =========================================================
 */
export const getDioceseById = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo phận");
  }

  const res = await axios.get(`/dioceses/${id}`);

  return res.data;
};

/**
 * =========================================================
 * GET TỔNG GIÁO PHẬN
 *
 * GET /api/dioceses/archdioceses
 * =========================================================
 */
export const getArchdioceses = async () => {
  const res = await axios.get("/dioceses/archdioceses");

  return res.data;
};

/**
 * =========================================================
 * GET GIÁO PHẬN THEO TỔNG GIÁO PHẬN
 *
 * GET /api/dioceses/by-parent/:parentDioceseId
 * =========================================================
 */
export const getDiocesesByParent = async (parentDioceseId) => {
  if (!parentDioceseId) {
    return {
      success: true,
      data: [],
      total: 0,
    };
  }

  const res = await axios.get(`/dioceses/by-parent/${parentDioceseId}`);

  return res.data;
};

/**
 * =========================================================
 * CREATE
 *
 * POST /api/dioceses
 * =========================================================
 */
export const createDiocese = async (data) => {
  if (!data) {
    throw new Error("Thiếu dữ liệu Giáo phận");
  }

  const res = await axios.post("/dioceses", data);

  return res.data;
};

/**
 * =========================================================
 * UPDATE
 *
 * PUT /api/dioceses/:id
 * =========================================================
 */
export const updateDiocese = async (id, data) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo phận");
  }

  if (!data) {
    throw new Error("Thiếu dữ liệu cập nhật Giáo phận");
  }

  const res = await axios.put(`/dioceses/${id}`, data);

  return res.data;
};

/**
 * =========================================================
 * DELETE
 *
 * DELETE /api/dioceses/:id
 * =========================================================
 */
export const deleteDiocese = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo phận");
  }

  const res = await axios.delete(`/dioceses/${id}`);

  return res.data;
};

/**
 * =========================================================
 * TOGGLE ACTIVE
 *
 * PATCH /api/dioceses/:id/toggle
 * =========================================================
 */
export const toggleDioceseActive = async (id) => {
  if (!id) {
    throw new Error("Thiếu ID Giáo phận");
  }

  const res = await axios.patch(`/dioceses/${id}/toggle`);

  return res.data;
};
