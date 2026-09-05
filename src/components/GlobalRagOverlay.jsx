import React from "react";
import { Progress, Typography, Space, Tag, Card } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { useRag } from "../context/RagContext";

const { Text } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";

export default function GlobalRagOverlay() {
  const { loading, statusText, percent, currentStep } = useRag();

  if (!loading) return null;

  return (
    <div className="global-rag-floating-overlay">
      <Card bordered={false} className="rag-overlay-card">
        <Space
          align="center"
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Space>
            <RobotOutlined style={{ color: accentGold, fontSize: 18 }} />
            <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
              Huấn Luyện AI Giáo Xứ Ngầm
            </Text>
          </Space>

          <Tag
            color={currentStep === "sync" ? "blue" : "gold"}
            style={{ fontWeight: 700, borderRadius: 8, margin: 0 }}
          >
            {currentStep === "sync"
              ? "1. ĐỒNG BỘ DỮ LIỆU"
              : "2. VECTOR EMBEDDING"}
          </Tag>
        </Space>

        <Progress
          percent={percent}
          status="active"
          strokeColor={{
            "0%": primaryNavy,
            "100%": accentGold,
          }}
          size="small"
        />

        <div
          style={{
            marginTop: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
            {statusText || "Đang xử lý..."}
          </Text>
          <Text strong style={{ fontSize: 12, color: accentGold }}>
            {percent}%
          </Text>
        </div>
      </Card>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .global-rag-floating-overlay {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 380px;
          animation: slideUp 0.3s ease;
        }

        .rag-overlay-card {
          border-radius: 16px !important;
          background: #ffffff !important;
          border: 1px solid rgba(212, 175, 55, 0.4) !important;
          box-shadow: 0 10px 30px rgba(27, 54, 93, 0.2) !important;
          padding: 12px 16px !important;
        }

        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `,
        }}
      />
    </div>
  );
}
