import { useCallback } from "react";

import {
  getDioceses,
  getDioceseById,
  getArchdioceses,
  getDiocesesByParent,
  createDiocese,
  updateDiocese,
  deleteDiocese,
  toggleDioceseActive,
} from "../api/dioceseApi";

export const useDiocese = () => {
  /**
   * GET ALL
   */
  const fetchDioceses = useCallback(async (params = {}) => {
    return await getDioceses(params);
  }, []);

  /**
   * GET BY ID
   */
  const fetchDioceseById = useCallback(async (id) => {
    return await getDioceseById(id);
  }, []);

  /**
   * GET TỔNG GIÁO PHẬN
   */
  const fetchArchdioceses = useCallback(async () => {
    return await getArchdioceses();
  }, []);

  /**
   * GET GIÁO PHẬN THEO TỔNG GIÁO PHẬN
   */
  const fetchDiocesesByParent = useCallback(async (parentDioceseId) => {
    return await getDiocesesByParent(parentDioceseId);
  }, []);

  /**
   * CREATE
   */
  const addDiocese = useCallback(async (data) => {
    return await createDiocese(data);
  }, []);

  /**
   * UPDATE
   */
  const editDiocese = useCallback(async (id, data) => {
    return await updateDiocese(id, data);
  }, []);

  /**
   * DELETE
   */
  const removeDiocese = useCallback(async (id) => {
    return await deleteDiocese(id);
  }, []);

  /**
   * TOGGLE
   */
  const toggleActive = useCallback(async (id) => {
    return await toggleDioceseActive(id);
  }, []);

  return {
    fetchDioceses,
    fetchDioceseById,
    fetchArchdioceses,
    fetchDiocesesByParent,

    addDiocese,
    editDiocese,
    removeDiocese,
    toggleActive,
  };
};
