import { useState, useCallback } from "react";
import * as api from "../api/scheduleApi";
import { message } from "antd";

export const useSchedule = () => {
  const [loading, setLoading] = useState(false);

  const handle = useCallback(async (fn, ...args) => {
    setLoading(true);
    try {
      const res = await fn(...args);
      console.log(res);

      return res.data;
    } catch (err) {
      const msg = err?.response?.data?.message || "Lỗi hệ thống";
      message.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeek = useCallback(
    (params) => handle(api.getWeekSchedule, params),
    [handle],
  );

  const create = useCallback(
    (data) => handle(api.createSchedule, data),
    [handle],
  );

  const copyWeek = useCallback(
    (data) => handle(api.copyWeekSchedule, data),
    [handle],
  );

  const add = useCallback((data) => handle(api.addEvent, data), [handle]);

  const update = useCallback(
    (id, data) => handle(api.updateEvent, id, data),
    [handle],
  );

  const remove = useCallback((id) => handle(api.deleteEvent, id), [handle]);

  const togglePriority = useCallback(
    (id, data) => handle(api.toggleEventPriority, id, data),
    [handle],
  );

  return {
    loading,
    fetchWeek,
    create,
    copyWeek,
    add,
    update,
    remove,
    togglePriority,
  };
};
