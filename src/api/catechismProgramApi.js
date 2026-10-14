import axiosClient from "./axios";

const BASE_URL = "/catechism-programs";

const catechismProgramApi = {
  getAll(params = {}) {
    return axiosClient.get(BASE_URL, { params });
  },

  getById(id) {
    return axiosClient.get(`${BASE_URL}/${id}`);
  },

  create(data) {
    return axiosClient.post(BASE_URL, data);
  },

  update(id, data) {
    return axiosClient.put(`${BASE_URL}/${id}`, data);
  },

  updateStatus(id, status) {
    return axiosClient.patch(`${BASE_URL}/${id}/status`, { status });
  },

  delete(id) {
    return axiosClient.delete(`${BASE_URL}/${id}`);
  },
};

export default catechismProgramApi;
