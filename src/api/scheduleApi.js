import axios from "./axios";

// ===== WEEK =====
export const getWeekSchedule = (params) =>
  axios.get(`/schedules/week`, { params });

// ===== SCHEDULE =====
export const createSchedule = (data) => axios.post(`/schedules/`, data);

export const copyWeekSchedule = (data) => axios.post(`/schedules/copy`, data);

// ===== EVENT =====
export const addEvent = (data) => axios.post(`/schedules/event`, data);

export const updateEvent = (id, data) =>
  axios.put(`/schedules/event/${id}`, data);

export const deleteEvent = (id) => axios.delete(`/schedules/event/${id}`);

export const toggleEventPriority = (id, data) =>
  axios.patch(`/schedules/event/${id}/priority`, data);
