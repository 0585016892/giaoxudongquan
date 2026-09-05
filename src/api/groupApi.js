import axios from "./axios";

export const getGroups = (params) => axios.get("/groups", { params });

export const getGroupDetail = (slug) => axios.get(`/groups/${slug}`);

export const createGroup = (data) => axios.post("/groups", data);

export const updateGroup = (id, data) =>
  axios.put(`/groups/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteGroup = (id) => axios.delete(`/groups/${id}`);
