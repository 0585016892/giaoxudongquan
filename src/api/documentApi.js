import axiosClient from "./axios";

export const getDocuments = () => {
  return axiosClient.get("/documents");
};

export const getDocumentById = (id) => {
  return axiosClient.get(`/documents/${id}`);
};
// 🆕 API Cập nhật tài liệu
export const updateDocument = (id, data) => {
  return axiosClient.put(`/documents/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const createDocument = (data) => {
  return axiosClient.post("/documents", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteDocument = (id) => {
  return axiosClient.delete(`/documents/${id}`);
};

export const downloadDocument = (id) => {
  return axiosClient.post(`/documents/${id}/download`);
};
