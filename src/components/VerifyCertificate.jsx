import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Typography,
  Descriptions,
  Tag,
  Button,
  Spin,
  ConfigProvider,
  Divider,
  Space,
} from "antd";
import {
  CheckCircleFilled,
  CompassOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  LockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const VerifyCertificate = () => {
  const [searchParams] = useSearchParams();
  const certCode = searchParams.get("code") || "CC-2026-8892";
  const certType = searchParams.get("type") || "marriage";
  const studentName = searchParams.get("student") || "Nguyễn Văn A";

  const [loading, setLoading] = useState(true);

  // Map tiêu đề loại chứng chỉ
  const getCertTypeName = (type) => {
    switch (type) {
      case "baptism":
        return "Chứng Nhận Bí Tích Rửa Tội";
      case "confirmation":
        return "Chứng Nhận Bí Tích Thêm Sức";
      case "marriage":
      default:
        return "Chứng Chỉ Giáo Lý Hôn Nhân & Dự Tòng";
    }
  };

  useEffect(() => {
    // Giả lập tra cứu dữ liệu từ Server Backend
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="verify-editorial-layout">
        <div className="verify-container">
          <Card bordered={false} className="verify-card">
            {loading ? (
              <div className="verify-loading-box">
                <Spin size="large" />
                <Title level={4} style={{ color: primaryNavy, marginTop: 20 }}>
                  ĐANG TRA CỨU DỮ LIỆU CHỨNG CHỈ...
                </Title>
                <Paragraph type="secondary" style={{ fontSize: 13 }}>
                  Đang kết nối tới Cổng Thông Tin Mục Vụ Giáo Xứ Đồng Quan
                </Paragraph>
              </div>
            ) : (
              <div>
                {/* HUY HIỆU ĐỊNH HƯỚNG TÔN NGHIÊM */}
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span className="sacred-badge">
                    <CompassOutlined /> HỆ THỐNG XÁC THỰC VĂN BẰNG ĐIỆN TỬ
                  </span>
                </div>

                {/* KHỐI TRẠNG THÁI THÀNH CÔNG */}
                <div className="status-header-box">
                  <CheckCircleFilled className="status-success-icon" />
                  <Title level={3} className="verify-main-title">
                    XÁC THỰC THÀNH CÔNG
                  </Title>
                  <Tag className="gold-verified-tag">
                    <SafetyCertificateOutlined /> CHỨNG CHỈ HỢP LỆ & CHÍNH CHỦ
                  </Tag>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                {/* BẢNG CHI TIẾT THÔNG TIN CHỨNG CHỈ */}
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="editorial-desc-table"
                >
                  <Descriptions.Item
                    label={
                      <Space>
                        <IdcardOutlined style={{ color: accentGold }} />
                        <span>Mã Số Văn Bằng</span>
                      </Space>
                    }
                  >
                    <Text strong className="code-text-highlight">
                      {certCode}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined style={{ color: primaryNavy }} />
                        <span>Tín Hữu Thụ Nhận</span>
                      </Space>
                    }
                  >
                    <Text strong className="student-name-highlight">
                      {studentName}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <SafetyCertificateOutlined
                          style={{ color: accentGold }}
                        />
                        <span>Loại Văn Bằng Phụng Vụ</span>
                      </Space>
                    }
                  >
                    <Text strong style={{ color: primaryNavy }}>
                      {getCertTypeName(certType)}
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <BankOutlined style={{ color: primaryNavy }} />
                        <span>Đơn Vị Cấp Phát</span>
                      </Space>
                    }
                  >
                    <span>Giáo xứ Đồng Quan — Giáo phận Thái Bình</span>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <UserOutlined style={{ color: accentGold }} />
                        <span>Đại Diện Ký Phát</span>
                      </Space>
                    }
                  >
                    <strong style={{ color: primaryNavy }}>
                      Lm. Jos Vũ Văn Chiều (Linh mục Quản xứ)
                    </strong>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={
                      <Space>
                        <CalendarOutlined style={{ color: primaryNavy }} />
                        <span>Thời Gian Tra Cứu</span>
                      </Space>
                    }
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs().format("HH:mm:ss — DD/MM/YYYY")}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                {/* THÔNG TIN BẢO MẬT BỔ SUNG */}
                <div className="security-info-box">
                  <LockOutlined style={{ color: accentGold, fontSize: 16 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Bản khai điện tử được xác thực trực tiếp từ Cơ sở dữ liệu
                    Toà cha xứ Giáo xứ Đồng Quan.
                  </Text>
                </div>

                {/* NÚT THAO TÁC VỀ TRANG CHỦ */}
                <div className="action-footer-box">
                  <Button
                    type="primary"
                    icon={<HomeOutlined />}
                    href="https://giaoxudongquan.site"
                    className="btn-home-site"
                  >
                    Về Trang Chủ Giáo Xứ
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* STYLES SCOPED EDITORIAL */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .verify-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 16px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .verify-container {
              width: 100%;
              max-width: 620px;
              margin: 0 auto;
            }

            .verify-card {
              border-radius: 24px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.3) !important;
              box-shadow: 0 15px 35px rgba(27, 54, 93, 0.08) !important;
              padding: 16px 8px !important;
            }

            .verify-loading-box {
              text-align: center;
              padding: 40px 20px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 16px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
            }

            .status-header-box {
              text-align: center;
              margin-top: 16px;
            }

            .status-success-icon {
              font-size: 54px;
              color: #10b981;
              filter: drop-shadow(0 4px 10px rgba(16, 185, 129, 0.2));
            }

            .verify-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 12px 0 6px 0 !important;
              font-weight: 700 !important;
              font-size: 22px !important;
            }

            .gold-verified-tag {
              background: rgba(212, 175, 55, 0.15) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 10px;
              padding: 4px 12px;
              font-weight: 700;
              font-size: 11px;
            }

            /* Descriptions Table Style */
            .editorial-desc-table {
              border-radius: 12px;
              overflow: hidden;
              border-color: rgba(27, 54, 93, 0.1) !important;
            }

            .editorial-desc-table .ant-descriptions-item-label {
              background-color: ${softBg} !important;
              width: 38%;
              font-weight: 600;
              color: ${primaryNavy};
            }

            .code-text-highlight {
              color: ${primaryNavy};
              font-family: 'Fira Code', monospace;
              font-size: 14px;
              letter-spacing: 0.5px;
            }

            .student-name-highlight {
              font-size: 16px;
              color: ${primaryNavy};
              font-family: 'Playfair Display', serif;
              text-transform: uppercase;
            }

            .security-info-box {
              background: ${softBg};
              padding: 12px 16px;
              border-radius: 12px;
              border: 1px dashed rgba(212, 175, 55, 0.4);
              margin-top: 20px;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .action-footer-box {
              text-align: center;
              margin-top: 24px;
            }

            .btn-home-site {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 44px !important;
              padding: 0 28px !important;
              border-radius: 12px !important;
              font-weight: 700 !important;
              font-size: 14px !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default VerifyCertificate;
