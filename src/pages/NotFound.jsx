import React from "react";
import {
  Button,
  ConfigProvider,
  Typography,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CompassOutlined,
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import viVN from "antd/lib/locale/vi_VN";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="notfound-horizontal-layout">
        <div className="notfound-horizontal-container">
          <Card bordered={false} className="notfound-horizontal-card">
            <Row align="middle" gutter={[32, 24]}>
              {/* CỘT BÊN TRÁI: MÃ LỖI 404 & HUY HIỆU */}
              <Col xs={24} md={8} className="left-code-col">
                <div className="code-badge-wrapper">
                  <span className="sacred-badge">
                    <CompassOutlined /> LỖI ĐỊNH HƯỚNG
                  </span>
                  <div className="notfound-big-code">404</div>
                  <Text className="code-sub-label">PAGE NOT FOUND</Text>
                </div>
              </Col>

              {/* CỘT BÊN PHẢI: NỘI DUNG VĂN BẢN & ĐIỀU HƯỚNG BẰNG NÚT NGANG */}
              <Col xs={24} md={16}>
                <div className="right-content-col">
                  <Title level={2} className="notfound-horizontal-title">
                    Trang Không Tồn Tại Hoặc Đã Thay Đổi
                  </Title>

                  <Paragraph className="notfound-horizontal-desc">
                    Đường dẫn bạn truy cập hiện không khả dụng, đã được di
                    chuyển sang địa chỉ mới hoặc chưa từng được khởi tạo trong
                    hệ thống Giáo xứ Đồng Quan.
                  </Paragraph>

                  {/* NÚT THAO TÁC HÀNG NGANG */}
                  <div className="horizontal-actions-group">
                    <Button
                      type="primary"
                      size="large"
                      icon={<HomeOutlined />}
                      onClick={() => navigate("/")}
                      className="btn-home-primary"
                    >
                      Bảng Điều Khiển
                    </Button>

                    <Button
                      size="large"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => navigate(-1)}
                      className="btn-back-secondary"
                    >
                      Quay Lại
                    </Button>
                  </div>

                  {/* LỐI TẮT NHANH HÀNG NGANG */}
                  <div className="quick-links-horizontal">
                    <Text strong className="quick-links-label">
                      Lối tắt nhanh:
                    </Text>
                    <Space size="small" wrap>
                      <Button
                        type="text"
                        icon={
                          <CalendarOutlined style={{ color: accentGold }} />
                        }
                        onClick={() => navigate("/lich-phung-vu")}
                        className="quick-link-btn"
                      >
                        Lịch Phụng Vụ
                      </Button>
                      <span className="dot-divider">•</span>
                      <Button
                        type="text"
                        icon={<BookOutlined style={{ color: accentGold }} />}
                        onClick={() => navigate("/news")}
                        className="quick-link-btn"
                      >
                        Bản Tin Mục Vụ
                      </Button>
                    </Space>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .notfound-horizontal-layout {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: ${softBg};
              padding: 40px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .notfound-horizontal-container {
              width: 100%;
              max-width: 920px;
              margin: 0 auto;
            }

            .notfound-horizontal-card {
              border-radius: 24px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.3) !important;
              box-shadow: 0 15px 35px rgba(27, 54, 93, 0.08) !important;
              padding: 24px 12px !important;
            }

            /* Cột trái */
            .left-code-col {
              text-align: center;
              border-right: 1px solid rgba(27, 54, 93, 0.08);
            }

            @media (max-width: 767px) {
              .left-code-col {
                border-right: none;
                border-bottom: 1px solid rgba(27, 54, 93, 0.08);
                padding-bottom: 24px;
              }
            }

            .code-badge-wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
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
              margin-bottom: 12px;
            }

            .notfound-big-code {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: clamp(80px, 10vw, 110px);
              font-weight: 700;
              color: ${primaryNavy};
              line-height: 0.9;
              letter-spacing: -2px;
              text-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
            }

            .code-sub-label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 2px;
              color: ${accentGold};
              margin-top: 8px;
            }

            /* Cột phải */
            .right-content-col {
              padding: 0 8px;
            }

            .notfound-horizontal-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 0 12px 0 !important;
              font-weight: 700 !important;
              font-size: clamp(22px, 3vw, 28px) !important;
            }

            .notfound-horizontal-desc {
              color: #64748b;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 24px !important;
            }

            /* Nhóm nút ngang */
            .horizontal-actions-group {
              display: flex;
              gap: 12px;
              align-items: center;
              margin-bottom: 24px;
              flex-wrap: wrap;
            }

            .btn-home-primary {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 44px !important;
              padding: 0 24px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .btn-back-secondary {
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              height: 44px !important;
              padding: 0 20px !important;
              border-radius: 10px !important;
              font-weight: 600 !important;
            }

            /* Lối tắt ngang */
            .quick-links-horizontal {
              display: flex;
              align-items: center;
              gap: 12px;
              padding-top: 16px;
              border-top: 1px dashed rgba(212, 175, 55, 0.3);
              flex-wrap: wrap;
            }

            .quick-links-label {
              font-size: 12px;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .quick-link-btn {
              color: ${primaryNavy} !important;
              font-weight: 600;
              font-size: 13px;
              padding: 0 8px !important;
            }

            .quick-link-btn:hover {
              color: ${accentGold} !important;
            }

            .dot-divider {
              color: #cbd5e1;
              font-size: 12px;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default NotFound;
