import React from "react";
import {
  Card,
  Typography,
  Divider,
  Row,
  Col,
  Button,
  Tag,
  ConfigProvider,
  Alert,
  Progress,
} from "antd";

import {
  SyncOutlined,
  DatabaseOutlined,
  CompassOutlined,
  ThunderboltOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { useRag } from "../context/RagContext";

const { Title, Text, Paragraph } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const RagTrainingPage = () => {
  const {
    loading,
    statusText,
    percent,
    currentStep,
    startTrainRAG,
    startEmbedding,
  } = useRag();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 14,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="rag-editorial-layout">
        <div className="rag-editorial-container">
          {/* HEADER BAR */}
          <div className="rag-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG TRÍ TUỆ NHÂN TẠO MỤC VỤ
              </span>
              <Title level={2} className="rag-main-title">
                HUẤN LUYỆN AI GIÁO XỨ (RAG)
              </Title>
              <Paragraph className="rag-sub-title">
                Đồng bộ kho văn bản Lời Chúa, Lịch phụng vụ & Thông tin Giáo xứ
                để Chatbot thông minh tự động trả lời Giáo dân.
              </Paragraph>
            </div>
          </div>

          {/* CẢNH BÁO TIẾN TRÌNH */}
          {loading && (
            <Alert
              type="info"
              showIcon
              icon={<SyncOutlined spin style={{ color: primaryNavy }} />}
              message={
                <Text strong style={{ color: primaryNavy }}>
                  Hệ thống đang tiến hành huấn luyện AI... ({percent}%)
                </Text>
              }
              description={statusText}
              style={{
                marginBottom: 24,
                borderRadius: 14,
                border: `1px solid ${accentGold}`,
                background: "#fffdf5",
              }}
            />
          )}

          {/* BENTO CARDS THAO TÁC */}
          <Row gutter={[24, 24]}>
            {/* BƯỚC 1: ĐỒNG BỘ DỮ LIỆU */}
            <Col xs={24} md={12}>
              <Card bordered={false} className="rag-step-card">
                <div>
                  <div className="step-card-header">
                    <div className="step-number-badge">01</div>
                    <Tag className="gold-step-tag">GIAI ĐOẠN 1</Tag>
                  </div>

                  <Title level={4} className="step-card-title">
                    <CloudUploadOutlined
                      style={{ color: primaryNavy, marginRight: 8 }}
                    />
                    Đồng Bộ Dữ Liệu Giáo Xứ
                  </Title>

                  <Paragraph className="step-card-desc">
                    Trích xuất toàn bộ sổ sách giáo dân, lịch phụng vụ, bài viết
                    tin tức và kinh nguyện mới nhất từ cơ sở dữ liệu để đưa vào
                    bộ nhớ AI.
                  </Paragraph>
                </div>

                <div>
                  <Divider style={{ margin: "16px 0 20px" }} />
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={
                      <SyncOutlined spin={loading && currentStep === "sync"} />
                    }
                    loading={loading && currentStep === "sync"}
                    disabled={loading}
                    onClick={startTrainRAG}
                    className="step-action-btn navy"
                  >
                    1. Đồng Bộ Dữ Liệu Ngay
                  </Button>
                </div>
              </Card>
            </Col>

            {/* BƯỚC 2: TẠO EMBEDDING VECTOR */}
            <Col xs={24} md={12}>
              <Card bordered={false} className="rag-step-card">
                <div>
                  <div className="step-card-header">
                    <div className="step-number-badge gold">02</div>
                    <Tag className="gold-step-tag">GIAI ĐOẠN 2</Tag>
                  </div>

                  <Title level={4} className="step-card-title">
                    <DatabaseOutlined
                      style={{ color: accentGold, marginRight: 8 }}
                    />
                    Khởi Tạo Vector Embeddings
                  </Title>

                  <Paragraph className="step-card-desc">
                    Chuyển đổi toàn bộ văn bản đã đồng bộ thành các dạng tọa độ
                    Vector ngữ nghĩa (AI Knowledge Base) giúp Chatbot tra cứu
                    thông tin chính xác.
                  </Paragraph>
                </div>

                <div>
                  <Divider style={{ margin: "16px 0 20px" }} />
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<ThunderboltOutlined />}
                    loading={loading && currentStep === "embedding"}
                    disabled={loading}
                    onClick={startEmbedding}
                    className="step-action-btn gold"
                  >
                    2. Tạo Vector Embedding
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

          {/* KHỐI TIẾN TRÌNH CHI TIẾT TRONG TRANG */}
          {loading && (
            <Card
              bordered={false}
              className="progress-details-card"
              style={{ marginTop: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text strong style={{ color: primaryNavy, fontSize: 15 }}>
                  Tiến Trình Huấn Luyện AI Thời Gian Thực
                </Text>

                <Text strong style={{ color: accentGold, fontSize: 16 }}>
                  {percent}%
                </Text>
              </div>

              <Progress
                percent={percent}
                status="active"
                strokeColor={{
                  "0%": primaryNavy,
                  "100%": accentGold,
                }}
                style={{ marginBottom: 12 }}
              />

              <div className="status-display-box">
                <InfoCircleOutlined
                  style={{ color: accentGold, marginTop: 3 }}
                />
                <Text style={{ color: primaryNavy, fontWeight: 600 }}>
                  {statusText}
                </Text>
              </div>
            </Card>
          )}
        </div>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .rag-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .rag-editorial-container {
              max-width: 1000px;
              margin: 0 auto;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .rag-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .rag-sub-title {
              color: #64748b;
              margin: 6px 0 0 0 !important;
              font-size: 14px;
            }

            .rag-step-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 12px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }

            .step-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
            }

            .step-number-badge {
              width: 38px;
              height: 38px;
              border-radius: 12px;
              background: ${primaryNavy};
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 16px;
              font-family: 'Playfair Display', serif;
            }

            .step-number-badge.gold {
              background: ${accentGold};
            }

            .gold-step-tag {
              background: rgba(212, 175, 55, 0.15) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 8px;
              font-weight: 700;
              font-size: 11px;
            }

            .step-card-title {
              font-family: 'Playfair Display', serif !important;
              color: ${primaryNavy} !important;
              margin: 0 0 8px 0 !important;
              font-weight: 700 !important;
            }

            .step-card-desc {
              color: #64748b;
              font-size: 13px;
              line-height: 1.6;
              min-height: 60px;
            }

            .step-action-btn {
              height: 46px !important;
              border-radius: 12px !important;
              font-weight: 700 !important;
              font-size: 14px !important;
            }

            .step-action-btn.navy {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .step-action-btn.gold {
              background: ${accentGold} !important;
              border-color: ${accentGold} !important;
              color: ${primaryNavy} !important;
              box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
            }

            .progress-details-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.3) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.06) !important;
              padding: 12px;
            }

            .status-display-box {
              background: ${softBg};
              padding: 12px 16px;
              border-radius: 10px;
              border: 1px solid rgba(212, 175, 55, 0.3);
              display: flex;
              align-items: flex-start;
              gap: 8px;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default RagTrainingPage;
