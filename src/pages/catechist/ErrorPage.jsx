import React from "react";
import { Typography, Space } from "antd";
import {
  ReloadOutlined,
  HomeOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppButton from "../../components/common/AppButton";

const { Title, Text } = Typography;

const ErrorPage = ({
  title = "Không thể tải dữ liệu",
  message = "Đã xảy ra lỗi trong quá trình tải dữ liệu. Vui lòng thử lại hoặc quay về trang chủ.",
  onRetry,
  showHome = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-background-circle error-circle-1" />
      <div className="error-background-circle error-circle-2" />

      <div className="error-content">
        {/* ICON */}
        <div className="error-icon-wrapper">
          <div className="error-icon-inner">
            <ExclamationCircleOutlined />
          </div>
        </div>

        {/* CODE */}
        <div className="error-code">404</div>

        {/* TITLE */}
        <Title level={2} className="error-title">
          {title}
        </Title>

        {/* MESSAGE */}
        <Text className="error-message">{message}</Text>

        {/* ACTIONS */}
        <Space className="error-actions" size={12} wrap>
          {onRetry && (
            <AppButton
              type="primary"
              icon={<ReloadOutlined />}
              onClick={onRetry}
              className="error-primary-button"
            >
              Thử lại
            </AppButton>
          )}

          {showHome && (
            <AppButton
              icon={<HomeOutlined />}
              onClick={() => navigate("/catechist")}
              className="error-home-button"
            >
              Về trang chủ
            </AppButton>
          )}

          {!showHome && (
            <AppButton
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className="error-home-button"
            >
              Quay lại
            </AppButton>
          )}
        </Space>

        {/* FOOTER */}
        <div className="error-footer">
          <span className="error-footer-dot" />
          <span>Hệ thống quản lý giáo lý</span>
        </div>
      </div>

      <style>{`
        .error-page {
          position: relative;
          min-height: 75vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 5vw, 60px) 16px;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(212, 175, 55, 0.08),
              transparent 35%
            ),
            #FAFAFA;
          box-sizing: border-box;
        }

        /* =========================
           BACKGROUND
        ========================= */

        .error-background-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(1px);
        }

        .error-circle-1 {
          width: clamp(180px, 30vw, 360px);
          height: clamp(180px, 30vw, 360px);
          top: -120px;
          left: -120px;
          background: rgba(27, 54, 93, 0.035);
        }

        .error-circle-2 {
          width: clamp(200px, 35vw, 420px);
          height: clamp(200px, 35vw, 420px);
          right: -160px;
          bottom: -180px;
          background: rgba(212, 175, 55, 0.05);
        }

        /* =========================
           CONTENT
        ========================= */

        .error-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 620px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* =========================
           ICON
        ========================= */

        .error-icon-wrapper {
          width: clamp(82px, 18vw, 110px);
          height: clamp(82px, 18vw, 110px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          background: rgba(27, 54, 93, 0.06);
        }

        .error-icon-inner {
          width: 72%;
          height: 72%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          border: 1px solid rgba(27, 54, 93, 0.1);
          box-shadow:
            0 12px 30px rgba(27, 54, 93, 0.1);
        }

        .error-icon-inner .anticon {
          font-size: clamp(34px, 7vw, 48px);
          color: #1B365D;
        }

        /* =========================
           404
        ========================= */

        .error-code {
          font-size: clamp(58px, 13vw, 96px);
          line-height: 0.95;
          font-weight: 900;
          letter-spacing: -5px;
          color: #1B365D;
          opacity: 0.08;
          margin-bottom: -4px;
          user-select: none;
        }

        /* =========================
           TITLE
        ========================= */

        .error-title {
          margin: 0 !important;
          color: #1E293B !important;
          font-size: clamp(22px, 5vw, 32px) !important;
          line-height: 1.25 !important;
          font-weight: 800 !important;
          letter-spacing: -0.5px;
        }

        /* =========================
           MESSAGE
        ========================= */

        .error-message {
          display: block;
          max-width: 500px;
          margin-top: 12px;
          color: #64748B !important;
          font-size: clamp(13px, 2.5vw, 15px);
          line-height: 1.7;
        }

        /* =========================
           BUTTONS
        ========================= */

        .error-actions {
          justify-content: center;
          margin-top: 28px;
        }

        .error-primary-button,
        .error-home-button {
          min-width: 145px;
          height: 44px;
          padding: 0 20px;
          border-radius: 12px !important;
          font-weight: 700;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .error-primary-button {
          border-color: #1B365D !important;
          box-shadow: 0 8px 20px rgba(27, 54, 93, 0.18);
        }

        .error-home-button {
          color: #334155 !important;
          background: #FFFFFF !important;
          border: 1px solid #E2E8F0 !important;
        }

        .error-primary-button:hover,
        .error-home-button:hover {
          transform: translateY(-2px);
        }

        .error-primary-button:hover {
          box-shadow: 0 10px 24px rgba(27, 54, 93, 0.25);
        }

        /* =========================
           FOOTER
        ========================= */

        .error-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 42px;
          color: #94A3B8;
          font-size: 12px;
        }

        .error-footer-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D4AF37;
        }

        /* =========================
           TABLET
        ========================= */

        @media (max-width: 768px) {
          .error-page {
            min-height: 70vh;
            padding: 40px 20px;
          }

          .error-content {
            max-width: 540px;
          }

          .error-actions {
            width: 100%;
          }
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 480px) {
          .error-page {
            min-height: calc(100vh - 80px);
            padding: 32px 16px;
          }

          .error-icon-wrapper {
            margin-bottom: 14px;
          }

          .error-code {
            letter-spacing: -3px;
          }

          .error-message {
            max-width: 330px;
            margin-top: 10px;
            line-height: 1.6;
          }

          .error-actions {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px !important;
          }

          .error-primary-button,
          .error-home-button {
            width: 100%;
            min-width: 0;
            height: 46px;
          }

          .error-footer {
            margin-top: 32px;
          }
        }

        /* =========================
           VERY SMALL MOBILE
        ========================= */

        @media (max-width: 360px) {
          .error-page {
            padding-left: 12px;
            padding-right: 12px;
          }

          .error-title {
            font-size: 21px !important;
          }

          .error-message {
            font-size: 13px;
          }
        }

        /* =========================
           REDUCE MOTION
        ========================= */

        @media (prefers-reduced-motion: reduce) {
          .error-primary-button,
          .error-home-button {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorPage;
