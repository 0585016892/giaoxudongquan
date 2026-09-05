import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Switch,
  Row,
  Col,
  Card,
  Select,
  Typography,
  message,
  ConfigProvider,
  Divider,
} from "antd";

import {
  SaveOutlined,
  BankOutlined,
  GlobalOutlined,
  NotificationOutlined,
  SafetyOutlined,
  CompassOutlined,
  ReloadOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

import { getSettings, updateSettings } from "../api/settings.api";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setFetchLoading(true);
      const res = await getSettings();
      const data = res.data?.data || res.data || {};

      form.setFieldsValue({
        ...data,
        notification_enabled: Number(data.notification_enabled) === 1,
        is_backup: Number(data.is_backup) === 1,
        require_baptism_before_marriage:
          Number(data.require_baptism_before_marriage) === 1,
        sub_churches_tags: data.sub_churches_tags
          ? data.sub_churches_tags.split(",")
          : [],
      });
    } catch (error) {
      message.error("Không tải được dữ liệu cài đặt hệ thống!");
    } finally {
      setFetchLoading(false);
    }
  }, [form]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      await updateSettings({
        ...values,
        notification_enabled: values.notification_enabled ? 1 : 0,
        is_backup: values.is_backup ? 1 : 0,
        require_baptism_before_marriage: values.require_baptism_before_marriage
          ? 1
          : 0,
        sub_churches_tags: values.sub_churches_tags?.join(",") || "",
      });

      message.success("Bảo lưu cấu hình hệ thống thành công!");
    } catch {
      message.error("Không thể cập nhật cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="settings-editorial-layout">
        <div className="settings-editorial-container">
          {/* HEADER SECTION */}
          <div className="settings-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG CẤU HÌNH QUẢN TRỊ
              </span>
              <Title level={2} className="settings-main-title">
                CÀI ĐẶT HỆ THỐNG GIÁO XỨ
              </Title>
              <Paragraph className="settings-sub-title">
                Quản lý thông tin hành chính, quy định bí tích, thông báo trực
                tuyến và sao lưu dữ liệu.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadSettings}
                loading={fetchLoading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                className="save-settings-btn"
              >
                Lưu Cài Đặt
              </Button>
            </div>
          </div>

          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Row gutter={[24, 24]}>
              {/* THÔNG TIN GIÁO XỨ */}
              <Col span={24}>
                <Card
                  bordered={false}
                  className="main-section-card"
                  title={
                    <div className="section-card-header">
                      <BankOutlined style={{ color: accentGold }} />
                      <span>Thông Tin Hành Chính Giáo Xứ</span>
                    </div>
                  }
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Tên Giáo xứ *
                          </Text>
                        }
                        name="parish_name"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên giáo xứ",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Ví dụ: Giáo xứ Đồng Quan..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Mã Giáo phận / Mã định danh
                          </Text>
                        }
                        name="diocese_code"
                      >
                        <Input
                          placeholder="Ví dụ: GP_THAIBINH"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Hòm thư Email Văn phòng
                          </Text>
                        }
                        name="email"
                        rules={[
                          { type: "email", message: "Email không hợp lệ!" },
                        ]}
                      >
                        <Input
                          prefix={<MailOutlined style={{ color: "#94a3b8" }} />}
                          placeholder="vanphong@giaoxudongquan.com"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Số điện thoại liên hệ
                          </Text>
                        }
                        name="phone"
                      >
                        <Input
                          prefix={
                            <PhoneOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="09xxxx..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Địa chỉ Tòa cha xứ / Nhà xứ
                          </Text>
                        }
                        name="address"
                      >
                        <TextArea
                          rows={2}
                          placeholder="Số nhà, đường, xóm, xã/phường..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* QUY ĐỊNH BÍ TÍCH */}
              <Col xs={24} lg={12}>
                <Card
                  bordered={false}
                  className="main-section-card"
                  title={
                    <div className="section-card-header">
                      <SafetyOutlined style={{ color: accentGold }} />
                      <span>Quy Định Bí Tích Mục Vụ</span>
                    </div>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Độ tuổi tối thiểu Rước Lễ
                          </Text>
                        }
                        name="min_age_communion"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          placeholder="7"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Độ tuổi tối thiểu Thêm Sức
                          </Text>
                        }
                        name="min_age_confirmation"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          min={1}
                          placeholder="12"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider style={{ margin: "12px 0 20px" }} />

                  <div className="toggle-rule-box">
                    <div>
                      <Text
                        strong
                        style={{
                          color: primaryNavy,
                          display: "block",
                          fontSize: 14,
                        }}
                      >
                        Yêu cầu Bí tích Rửa Tội trước khi kết hôn
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Bắt buộc học viên có chứng nhận Rửa Tội mới được đăng ký
                        Hôn Phối.
                      </Text>
                    </div>

                    <Form.Item
                      name="require_baptism_before_marriage"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                </Card>
              </Col>

              {/* WEBSITE & KÊNH MẠNG XÃ HỘI */}
              <Col xs={24} lg={12}>
                <Card
                  bordered={false}
                  className="main-section-card"
                  title={
                    <div className="section-card-header">
                      <GlobalOutlined style={{ color: accentGold }} />
                      <span>Website & Kênh Truyền Thông</span>
                    </div>
                  }
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Trang Facebook Giáo xứ
                          </Text>
                        }
                        name="facebook_url"
                      >
                        <Input
                          prefix={
                            <FacebookOutlined style={{ color: "#1877f2" }} />
                          }
                          placeholder="https://facebook.com/..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Kênh Youtube Truyền Thông
                          </Text>
                        }
                        name="youtube_url"
                      >
                        <Input
                          prefix={
                            <YoutubeOutlined style={{ color: "#ff0000" }} />
                          }
                          placeholder="https://youtube.com/..."
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Đường dẫn Website chính thức
                          </Text>
                        }
                        name="website_url"
                      >
                        <Input
                          prefix={
                            <GlobalOutlined style={{ color: primaryNavy }} />
                          }
                          placeholder="https://giaoxudongquan.com"
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label={
                          <Text strong className="form-field-label">
                            Danh sách Giáo họ trực thuộc (Tags)
                          </Text>
                        }
                        name="sub_churches_tags"
                      >
                        <Select
                          mode="tags"
                          placeholder="Gõ tên giáo họ và nhấn Enter..."
                          tokenSeparators={[","]}
                          className="custom-form-input"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </Col>

              {/* HỆ THỐNG & SAO LƯU */}
              <Col span={24}>
                <Card
                  bordered={false}
                  className="main-section-card"
                  title={
                    <div className="section-card-header">
                      <NotificationOutlined style={{ color: accentGold }} />
                      <span>Cấu Hình Hạ Tầng Máy Chủ & Hệ Thống</span>
                    </div>
                  }
                >
                  <Row gutter={[20, 20]}>
                    <Col xs={24} md={12}>
                      <div className="system-config-block">
                        <div className="config-text-group">
                          <Title
                            level={5}
                            style={{
                              margin: 0,
                              color: primaryNavy,
                              fontWeight: 700,
                            }}
                          >
                            Thông Báo Trực Tuyến (Realtime Socket)
                          </Title>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Kích hoạt hệ thống đẩy thông báo chuông tức thì đến
                            quản trị viên và giáo dân.
                          </Text>
                        </div>

                        <Form.Item
                          name="notification_enabled"
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div className="system-config-block">
                        <div className="config-text-group">
                          <Title
                            level={5}
                            style={{
                              margin: 0,
                              color: primaryNavy,
                              fontWeight: 700,
                            }}
                          >
                            Tự Động Sao Lưu Cơ Sở Dữ Liệu (Backup)
                          </Title>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            Tạo bản sao lưu định kỳ cho sổ sách giáo dân, lịch
                            phụng vụ và điểm thi.
                          </Text>
                        </div>

                        <Form.Item
                          name="is_backup"
                          valuePropName="checked"
                          noStyle
                        >
                          <Switch />
                        </Form.Item>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* BOT BAR SAVE ACTION */}
            <div className="bottom-save-bar">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                className="save-settings-btn large"
              >
                Lưu Cấu Hình Hệ Thống
              </Button>
            </div>
          </Form>
        </div>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .settings-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .settings-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .settings-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 28px;
              flex-wrap: wrap;
              gap: 16px;
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

            .settings-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .settings-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 42px;
            }

            .save-settings-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .save-settings-btn.large {
              height: 48px !important;
              padding: 0 32px !important;
              font-size: 15px !important;
              border-radius: 12px !important;
            }

            /* Section Cards */
            .main-section-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .section-card-header {
              display: flex;
              align-items: center;
              gap: 8px;
              color: ${primaryNavy};
              font-family: 'Playfair Display', serif;
              font-size: 16px;
              font-weight: 700;
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            /* Toggles & Rule Box */
            .toggle-rule-box {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 18px;
              background: ${softBg};
              border-radius: 12px;
              border: 1px solid rgba(27, 54, 93, 0.08);
            }

            .system-config-block {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
              background: ${softBg};
              border-radius: 14px;
              border: 1px solid rgba(27, 54, 93, 0.08);
              height: 100%;
            }

            .config-text-group {
              padding-right: 16px;
            }

            .bottom-save-bar {
              margin-top: 32px;
              text-align: right;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
