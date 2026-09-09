// src/api/activityLogApi.js

import axios from "./axios";

// GET ALL LOGS
export const getActivityLogs = () => {
  return axios.get("/activity-logs");
};

// GET DETAIL LOG
export const getActivityLogDetail = (id) => {
  return axios.get(`/activity-logs/${id}`);
};

// DELETE SELECTED LOGS
export const deleteActivityLogs = (ids) => {
  return axios.delete("/activity-logs", {
    data: {
      ids,
    },
  });
};
