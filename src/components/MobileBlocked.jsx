import React from "react";
import { Button, Typography, Space, ConfigProvider } from "antd";
import {
  DesktopOutlined,
  HomeOutlined,
  ReloadOutlined,
  MobileOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";

const MobileBlocked = () => {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="mobile-blocked-root">
        <div className="mobile-blocked-card">
          {/* VISUAL ILLUSTRATION ICON */}
          <div className="blocked-illustration">
            <div className="device-circle mobile-circle">
              <MobileOutlined className="mobile-icon" />
              <CloseCircleFilled className="badge-error" />
            </div>
            <div className="pulse-arrow">➔</div>
            <div className="device-circle desktop-circle">
              <DesktopOutlined className="desktop-icon" />
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div className="blocked-content">
            <span className="sacred-badge">HE THONG QUAN TRI MUC VU</span>
            <Title level={3} className="blocked-title">
              Cần Màn Hình Rộng Hơn
            </Title>
            <div className="gold-divider" />
            <Paragraph className="blocked-subtitle">
              Trang quản trị chứa nhiều biểu bảng mục vụ và công cụ tra cứu phức
              tạp. Vui lòng truy cập bằng <strong>Máy tính bàn (PC)</strong>,{" "}
              <strong>Laptop</strong> hoặc{" "}
              <strong>Máy tính bảng (Tablet)</strong> để có trải nghiệm tốt
              nhất.
            </Paragraph>
          </div>

          {/* ACTION BUTTONS */}
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Button
              type="primary"
              size="large"
              block
              icon={<HomeOutlined />}
              onClick={handleGoHome}
              className="action-btn primary-btn"
            >
              Về Trang Chủ
            </Button>

            <Button
              type="default"
              size="large"
              block
              icon={<ReloadOutlined />}
              onClick={handleReload}
              className="action-btn secondary-btn"
            >
              Tải Lại Trang
            </Button>
          </Space>

          {/* HELPER FOOTER */}
          <Text className="blocked-footer-note">
            💡 Mẹo: Bạn có thể bật chế độ <i>"Trang web cho máy tính"</i>{" "}
            (Desktop site) trên trình duyệt điện thoại để tiếp tục.
          </Text>
        </div>

        {/* SCOPED STYLES */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

          .mobile-blocked-root {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at 50% 30%, #2A4365 0%, #1B365D 60%, #0F172A 100%);
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Be Vietnam Pro', sans-serif;
            position: relative;
            overflow: hidden;
          }

          /* Ambient Glow Background */
          .mobile-blocked-root::before {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(212, 175, 55, 0.15);
            filter: blur(100px);
            border-radius: 50%;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
          }

          .mobile-blocked-card {
            position: relative;
            z-index: 10;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(12px);
            border-radius: 24px;
            padding: 36px 24px 28px 24px;
            max-width: 420px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3);
            animation: cardAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes cardAppear {
            from { opacity: 0; transform: translateY(20px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          /* Illustration */
          .blocked-illustration {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-bottom: 20px;
          }

          .device-circle {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            transition: transform 0.3s ease;
          }

          .mobile-circle {
            background: #F1F5F9;
            border: 1px solid #CBD5E1;
          }

          .mobile-icon {
            font-size: 28px;
            color: #64748B;
          }

          .badge-error {
            position: absolute;
            top: -4px;
            right: -4px;
            font-size: 18px;
            color: #EF4444;
            background: #FFF;
            border-radius: 50%;
          }

          .pulse-arrow {
            color: ${accentGold};
            font-weight: 700;
            font-size: 18px;
            opacity: 0.7;
          }

          .desktop-circle {
            background: linear-gradient(135deg, ${primaryNavy} 0%, #2B4C7E 100%);
            border: 1px solid ${accentGold};
            box-shadow: 0 6px 16px rgba(27, 54, 93, 0.25);
          }

          .desktop-icon {
            font-size: 30px;
            color: ${accentGold};
          }

          /* Content */
          .sacred-badge {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.5px;
            color: ${accentGold};
            background: rgba(212, 175, 55, 0.12);
            padding: 3px 10px;
            border-radius: 20px;
            border: 1px solid rgba(212, 175, 55, 0.3);
            display: inline-block;
            margin-bottom: 10px;
          }

          .blocked-title {
            color: ${primaryNavy} !important;
            font-family: 'Playfair Display', Georgia, serif !important;
            margin: 0 !important;
            font-size: 22px !important;
          }

          .gold-divider {
            width: 40px;
            height: 3px;
            background: ${accentGold};
            margin: 10px auto 14px auto;
            border-radius: 2px;
          }

          .blocked-subtitle {
            color: #475569 !important;
            font-size: 13.5px !important;
            line-height: 1.6 !important;
            margin-bottom: 24px !important;
          }

          /* Buttons */
          .action-btn {
            height: 44px !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            transition: all 0.25s ease !important;
          }

          .primary-btn {
            background: ${primaryNavy} !important;
            border-color: ${primaryNavy} !important;
            box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2) !important;
          }

          .primary-btn:hover {
            background: #254677 !important;
            transform: translateY(-1px);
          }

          .secondary-btn {
            border-color: #CBD5E1 !important;
            color: #334155 !important;
          }

          .secondary-btn:hover {
            border-color: ${accentGold} !important;
            color: ${primaryNavy} !important;
          }

          .blocked-footer-note {
            display: block;
            margin-top: 20px;
            font-size: 11.5px;
            color: #94A3B8;
            line-height: 1.4;
          }
        `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default MobileBlocked;
