import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import socket from "../socket/socket"; // Import instance socket.io-client của bạn
import { trainRAG, trainEmbedding } from "../api/ragApi";

const RagContext = createContext(null);

export const RagProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [percent, setPercent] = useState(0);
  const [currentStep, setCurrentStep] = useState(null); // 'sync' | 'embedding' | null

  // LẮNG NGHE SỰ KIỆN SOCKET THỜI GIAN THỰC
  useEffect(() => {
    if (!socket) return;

    // 1. Tiến trình Đồng bộ RAG
    const handleSyncProgress = (data) => {
      setLoading(true);
      setCurrentStep("sync");
      setPercent(data.percent || 0);
      setStatusText(data.step || "Đang đồng bộ dữ liệu...");

      if (data.status === "completed") {
        setTimeout(() => {
          setLoading(false);
          setCurrentStep(null);
        }, 1500);
      }
    };

    // 2. Tiến trình Tạo Vector Embedding (xử lý dòng chuỗi: Embedding 18/268 (7%))
    const handleEmbeddingProgress = (data) => {
      setLoading(true);
      setCurrentStep("embedding");
      setPercent(data.percent || 0);
      setStatusText(
        data.message ||
          `Embedding ${data.current}/${data.total} (${data.percent}%)`,
      );

      if (data.status === "completed") {
        setTimeout(() => {
          setLoading(false);
          setCurrentStep(null);
        }, 2000);
      }
    };

    socket.on("rag_train_progress", handleSyncProgress);
    socket.on("rag_embedding_progress", handleEmbeddingProgress);

    return () => {
      socket.off("rag_train_progress", handleSyncProgress);
      socket.off("rag_embedding_progress", handleEmbeddingProgress);
    };
  }, []);

  // Gọi API Bắt đầu Đồng bộ dữ liệu
  const startTrainRAG = async () => {
    if (loading) {
      message.warning("Hệ thống đang thực hiện huấn luyện AI...");
      return;
    }
    try {
      setLoading(true);
      setCurrentStep("sync");
      setPercent(5);
      setStatusText("Đang khởi động đồng bộ...");
      await trainRAG();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setCurrentStep(null);
      message.error(error.response?.data?.message || "Lỗi đồng bộ dữ liệu");
    }
  };

  // Gọi API Bắt đầu Tạo Embedding
  const startEmbedding = async () => {
    if (loading) {
      message.warning("Hệ thống đang thực hiện huấn luyện AI...");
      return;
    }
    try {
      setLoading(true);
      setCurrentStep("embedding");
      setPercent(5);
      setStatusText("Đang khởi tạo Vector Embeddings...");
      await trainEmbedding();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setCurrentStep(null);
      message.error(error.response?.data?.message || "Lỗi tạo embedding");
    }
  };

  return (
    <RagContext.Provider
      value={{
        loading,
        statusText,
        percent,
        currentStep,
        startTrainRAG,
        startEmbedding,
      }}
    >
      {children}
    </RagContext.Provider>
  );
};

export const useRag = () => {
  const context = useContext(RagContext);
  if (!context) {
    throw new Error("useRag() phải được bọc trong <RagProvider>");
  }
  return context;
};
