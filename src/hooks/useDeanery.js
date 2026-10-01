import { useCallback } from "react";

import {
  getDeaneries,
  getDeaneryById,
  getDeaneriesByDiocese,
  createDeanery,
  updateDeanery,
  deleteDeanery,
  toggleDeaneryActive,
} from "../api/deaneryApi";

export const useDeanery = () => {
  /**
   * GET ALL
   */
  const fetchDeaneries = useCallback(async (params = {}) => {
    return await getDeaneries(params);
  }, []);

  /**
   * GET BY ID
   */
  const fetchDeaneryById = useCallback(async (id) => {
    return await getDeaneryById(id);
  }, []);

  /**
   * GET THEO GIÁO PHẬN
   */
  const fetchDeaneriesByDiocese = useCallback(async (dioceseId) => {
    return await getDeaneriesByDiocese(dioceseId);
  }, []);

  /**
   * CREATE
   */
  const addDeanery = useCallback(async (data) => {
    return await createDeanery(data);
  }, []);

  /**
   * UPDATE
   */
  const editDeanery = useCallback(async (id, data) => {
    return await updateDeanery(id, data);
  }, []);

  /**
   * DELETE
   */
  const removeDeanery = useCallback(async (id) => {
    return await deleteDeanery(id);
  }, []);

  /**
   * TOGGLE
   */
  const toggleActive = useCallback(async (id) => {
    return await toggleDeaneryActive(id);
  }, []);

  return {
    fetchDeaneries,
    fetchDeaneryById,
    fetchDeaneriesByDiocese,

    addDeanery,
    editDeanery,
    removeDeanery,
    toggleActive,
  };
};
