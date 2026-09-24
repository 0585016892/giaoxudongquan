import axios from "./axios";

const BASE_URL = "/churches";

// ======================================================
// GET CHURCHES
// ======================================================

export const getChurches = async (params = {}) => {
  const response = await axios.get(BASE_URL, {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,

      ...(params.search
        ? {
            search: params.search,
          }
        : {}),

      ...(params.type
        ? {
            type: params.type,
          }
        : {}),
    },
  });

  return response.data;
};

// ======================================================
// GET CHURCH BY ID
// ======================================================

export const getChurchById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);

  return response.data;
};

// ======================================================
// CREATE
// ======================================================

export const createChurch = async (data) => {
  const response = await axios.post(BASE_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ======================================================
// UPDATE
// ======================================================

export const updateChurch = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// ======================================================
// DELETE
// ======================================================

export const deleteChurch = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);

  return response.data;
};

// ======================================================
// TOGGLE ACTIVE
// ======================================================

export const toggleChurchActive = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/toggle-active`);

  return response.data;
};

// ======================================================
// ACTIVATE LICENSE
// ======================================================

export const activateChurchLicense = async (churchId) => {
  const response = await axios.post(`${BASE_URL}/${churchId}/activate-license`);

  return response.data;
};
