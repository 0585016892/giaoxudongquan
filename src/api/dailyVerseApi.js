import axiosClient from "./axios";

// =====================================================
// DAILY VERSE API
// =====================================================

const dailyVerseApi = {
  getRandom: () => axiosClient.get("/daily-verses/random"),

  getAll() {
    return axiosClient.get("/daily-verses");
  },

  getById(id) {
    return axiosClient.get(`/daily-verses/${id}`);
  },

  create(data) {
    return axiosClient.post("/daily-verses", data);
  },

  update(id, data) {
    return axiosClient.put(`/daily-verses/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/daily-verses/${id}`);
  },
};

export default dailyVerseApi;
