import axios from "./axios";

export const trainRAG = async () => {
  const res = await axios.post(`/rag/train`);

  return res.data;
};

export const trainEmbedding = async () => {
  const res = await axios.post(`/rag/train-embedding`);

  return res.data;
};
