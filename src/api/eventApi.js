import axios from "./axios";

export const getEvents = (params) => axios.get("/events", { params });

export const createEvent = (data) =>
  axios.post("/events", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateEvent = (id, data) =>
  axios.put(`/events/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteEvent = (id) => axios.delete(`/events/${id}`);

export const toggleEvent = (id, is_active) =>
  axios.patch(`/events/${id}/status`, { is_active });
