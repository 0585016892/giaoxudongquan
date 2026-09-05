import axios from "./axios";

const classApi = {
  getAll: async () => {
    const res = await axios.get("/classes");
    return res.data;
  },
  getClassTeacher: async () => {
    const res = await axios.get(`/classes/teacher-class`);
    return res.data;
  },
  getById: async (id) => {
    const res = await axios.get(`/classes/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await axios.post("/classes", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await axios.put(`/classes/${id}`, data);
    return res.data;
  },

  remove: async (id) => {
    const res = await axios.delete(`/classes/${id}`);
    return res.data;
  },
};

export default classApi;
