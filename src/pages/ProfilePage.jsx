import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Tag,
  Divider,
  message,
  ConfigProvider,
  Spin,
  Descriptions,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  CameraOutlined,
  SaveOutlined,
  KeyOutlined,
  CompassOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useUser } from "../context/UserContext";
import { getAdminById, updateAdmin, changePassword } from "../api/adminApi";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function ProfilePage() {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar Upload State
  const [fileList, setFileList] = useState([]);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const API_URL = process.env.REACT_APP_API_URL || "";

  // 1. TẢI THÔNG TIN HỒ SƠ DỰA VÀO user.id
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getAdminById(user.id);
      const data = res.data?.data || res.data || {};

      setProfileData(data);

      // Set giá trị vào Form (chuyển đổi chuỗi ngày thành dayjs object cho DatePicker)
      profileForm.setFieldsValue({
        saint_name: data.saint_name || "",
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        position: data.position || "",
        birthday: data.birthday ? dayjs(data.birthday) : null,
        hometown: data.hometown || "",
        address: data.address || "",
        ordination_date: data.ordination_date
          ? dayjs(data.ordination_date)
          : null,
        motto: data.motto || "",
        bio: data.bio || "",
        role: data.role || "admin",
      });

      if (data.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: data.avatar.startsWith("http")
              ? data.avatar
              : `${API_URL}${data.avatar}`,
          },
        ]);
      } else {
        setFileList([]);
      }
    } catch (error) {
      console.error("Lỗi tải thông tin cá nhân:", error);
      message.error("Không thể tải thông tin hồ sơ cá nhân!");
    } finally {
      setLoading(false);
    }
  }, [user?.id, profileForm, API_URL]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 2. XỬ LÝ CẬP NHẬT HỒ SƠ CÁ NHÂN CHUẨN BACKEND API
  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSubmitLoading(true);

      const formData = new FormData();

      // Duyệt qua các trường nhập liệu và đưa vào FormData
      Object.keys(values).forEach((key) => {
        if (key === "avatar") return;

        const val = values[key];
        if (val !== undefined && val !== null) {
          // Format ngày tháng YYYY-MM-DD
          if (key === "birthday" || key === "ordination_date") {
            if (val && dayjs.isDayjs(val)) {
              formData.append(key, val.format("YYYY-MM-DD"));
            } else if (typeof val === "string") {
              formData.append(key, val);
            }
          } else {
            formData.append(key, val);
          }
        }
      });

      // Append file avatar mới nếu người dùng chọn
      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      const res = await updateAdmin(user.id, formData);

      message.success(
        res.data?.message || "Cập nhật thông tin cá nhân thành công!",
      );

      // Reload lại thông tin cá nhân từ server
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error?.response?.data?.message || "Cập nhật thông tin thất bại!",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // 3. XỬ LÝ ĐỔI MẬT KHẨU CÁ NHÂN
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);

      await changePassword(user.id, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <Space direction="vertical" align="center" size="middle">
          <Spin size="large" />
          <Text style={{ color: primaryNavy, fontWeight: 600 }}>
            Đang tải hồ sơ cá nhân...
          </Text>
        </Space>
      </div>
    );
  }

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
      <div className="profile-editorial-layout">
        <div className="profile-editorial-container">
          {/* HEADER BAR */}
          <div className="profile-header-section">
            <span className="sacred-badge">
              <CompassOutlined /> HỒ SƠ TÀI KHOẢN MỤC VỤ
            </span>
            <Title level={2} className="profile-main-title">
              THÔNG TIN CÁ NHÂN
            </Title>
            <Paragraph className="profile-sub-title">
              Quản lý thông tin lý lịch, chức danh và cấu hình mật khẩu truy cập
              hệ thống.
            </Paragraph>
          </div>

          <Row gutter={[24, 24]}>
            {/* CỘT TRÁI: AVATAR & THÔNG TIN TÓM TẮT */}
            <Col xs={24} lg={8}>
              <Card bordered={false} className="profile-card-left">
                <div className="avatar-upload-wrapper">
                  <Avatar
                    size={110}
                    src={
                      fileList.length > 0
                        ? fileList[0].url || fileList[0].thumbUrl
                        : null
                    }
                    icon={<UserOutlined />}
                    className="main-avatar"
                  />

                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = () => {
                        setFileList([
                          {
                            uid: "-1",
                            name: file.name,
                            status: "done",
                            url: reader.result,
                            originFileObj: file,
                          },
                        ]);
                      };
                      return false;
                    }}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      className="upload-avatar-btn"
                    />
                  </Upload>
                </div>

                <div className="user-identity-box">
                  <Title level={4} className="user-full-name">
                    {profileData?.saint_name ? (
                      <span className="saint-name">
                        {profileData.saint_name}{" "}
                      </span>
                    ) : null}
                    {profileData?.full_name || "Quản trị viên"}
                  </Title>

                  <Text type="secondary" className="username-text">
                    @{profileData?.username}
                  </Text>

                  <div className="role-tags-group">
                    <Tag
                      color={
                        profileData?.role === "priest"
                          ? "red"
                          : profileData?.role === "admin"
                            ? "blue"
                            : "gold"
                      }
                      className="role-pill-tag"
                    >
                      {profileData?.role === "priest"
                        ? "LINH MỤC CHÁNH XỨ"
                        : profileData?.role === "admin"
                          ? "QUẢN TRỊ VIÊN"
                          : "CỘNG TÁC VIÊN"}
                    </Tag>
                  </div>
                </div>

                <Divider style={{ margin: "20px 0" }} />

                <Descriptions
                  column={1}
                  size="small"
                  className="profile-quick-desc"
                >
                  <Descriptions.Item label="Username">
                    <strong
                      style={{ color: primaryNavy, fontFamily: "monospace" }}
                    >
                      @{profileData?.username}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chức danh">
                    <strong style={{ color: primaryNavy }}>
                      {profileData?.position || "Chưa cập nhật"}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {profileData?.email || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {profileData?.phone || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color="green"
                      style={{ fontWeight: 600, borderRadius: 6 }}
                    >
                      Đang hoạt động
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* CỘT PHẢI: FORM CẬP NHẬT & ĐỔI MẬT KHẨU */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={24} style={{ width: "100%" }}>
                {/* 1. FORM THÔNG TIN LÝ LỊCH */}
                <Card
                  bordered={false}
                  className="profile-section-card"
                  title={
                    <div className="section-card-header">
                      <IdcardOutlined style={{ color: accentGold }} />
                      <span>Cập Nhật Thông Tin Hồ Sơ</span>
                    </div>
                  }
                >
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                  >
                    {/* Role ẩn để giữ đúng role cũ khi gửi Form */}
                    <Form.Item name="role" hidden>
                      <Input />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Tên Thánh
                            </Text>
                          }
                          name="saint_name"
                        >
                          <Input
                            placeholder="Ví dụ: Giuse, Anrê..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={16}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Họ và tên khai sinh *
                            </Text>
                          }
                          name="full_name"
                          rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                          ]}
                        >
                          <Input
                            placeholder="Nhập họ tên đầy đủ..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Địa chỉ Email * (Username tự động lấy từ Email)
                            </Text>
                          }
                          name="email"
                          rules={[
                            {
                              required: true,
                              type: "email",
                              message: "Email không hợp lệ",
                            },
                          ]}
                        >
                          <Input
                            prefix={
                              <MailOutlined style={{ color: "#94a3b8" }} />
                            }
                            placeholder="nguyenvana@gmail.com"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Số điện thoại
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
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Chức danh đảm nhiệm
                            </Text>
                          }
                          name="position"
                        >
                          <Input
                            placeholder="Ví dụ: Linh mục Chánh xứ, Thư ký..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Ngày sinh
                            </Text>
                          }
                          name="birthday"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            placeholder="Chọn ngày sinh..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Quê quán nguyên quán
                        </Text>
                      }
                      name="hometown"
                    >
                      <Input
                        prefix={<HomeOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Địa chỉ quê hương..."
                        className="custom-form-input"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Địa chỉ cư trú hiện nay
                        </Text>
                      }
                      name="address"
                    >
                      <Input
                        prefix={<HomeOutlined style={{ color: "#94a3b8" }} />}
                        placeholder="Nơi ở hiện tại..."
                        className="custom-form-input"
                      />
                    </Form.Item>

                    {/* MỤC RIÊNG CHO LINH MỤC */}
                    {profileData?.role === "priest" && (
                      <div className="priest-extra-box">
                        <Divider
                          orientation="left"
                          style={{ borderColor: accentGold }}
                        >
                          <span
                            style={{
                              color: primaryNavy,
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            <SafetyCertificateOutlined
                              style={{ color: accentGold }}
                            />{" "}
                            Hồ Sơ Chức Thánh Mục Vụ
                          </span>
                        </Divider>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label={
                                <Text strong className="form-field-label">
                                  Ngày thụ phong Linh mục
                                </Text>
                              }
                              name="ordination_date"
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                placeholder="Chọn ngày thụ phong..."
                                className="custom-form-input"
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label={
                                <Text strong className="form-field-label">
                                  Khẩu hiệu Mục vụ
                                </Text>
                              }
                              name="motto"
                            >
                              <Input
                                prefix={
                                  <BookOutlined style={{ color: "#94a3b8" }} />
                                }
                                placeholder="Châm ngôn cuộc đời dâng hiến..."
                                className="custom-form-input"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Tóm tắt tiểu sử chặng đường phục vụ
                            </Text>
                          }
                          name="bio"
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Các nơi đã từng mục vụ, công tác..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </div>
                    )}

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={submitLoading}
                        onClick={handleUpdateProfile}
                        className="save-btn"
                      >
                        Lưu Thông Tin
                      </Button>
                    </div>
                  </Form>
                </Card>

                {/* 2. FORM ĐỔI MẬT KHẨU CÁ NHÂN */}
                <Card
                  bordered={false}
                  className="profile-section-card"
                  title={
                    <div className="section-card-header">
                      <KeyOutlined style={{ color: accentGold }} />
                      <span>Bảo Mật & Đổi Mật Khẩu</span>
                    </div>
                  }
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Mật khẩu hiện tại *
                            </Text>
                          }
                          name="oldPassword"
                          rules={[
                            {
                              required: true,
                              message: "Nhập mật khẩu hiện tại",
                            },
                          ]}
                        >
                          <Input.Password
                            prefix={
                              <LockOutlined style={{ color: "#94a3b8" }} />
                            }
                            placeholder="Mật khẩu cũ..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <Text strong className="form-field-label">
                              Mật khẩu mới *
                            </Text>
                          }
                          name="newPassword"
                          rules={[
                            { required: true, message: "Nhập mật khẩu mới" },
                            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                          ]}
                        >
                          <Input.Password
                            prefix={
                              <LockOutlined style={{ color: "#94a3b8" }} />
                            }
                            placeholder="Mật khẩu mới..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div style={{ textAlign: "right" }}>
                      <Button
                        type="primary"
                        icon={<KeyOutlined />}
                        loading={passwordLoading}
                        onClick={handleChangePassword}
                        className="save-btn"
                      >
                        Cập Nhật Mật Khẩu
                      </Button>
                    </div>
                  </Form>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>

        {/* CSS SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .profile-loading-screen {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 70vh;
              background: ${softBg};
              font-family: 'Be Vietnam Pro', sans-serif;
            }

            .profile-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .profile-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .profile-header-section {
              margin-bottom: 28px;
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

            .profile-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .profile-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            /* Profile Left Card */
            .profile-card-left {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.3) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 12px;
            }

            .avatar-upload-wrapper {
              position: relative;
              width: 110px;
              margin: 0 auto 16px auto;
            }

            .main-avatar {
              background: ${primaryNavy} !important;
              border: 2px solid ${accentGold};
              box-shadow: 0 6px 20px rgba(27, 54, 93, 0.15);
            }

            .upload-avatar-btn {
              position: absolute;
              bottom: 0;
              right: 0;
              background: ${primaryNavy} !important;
              border-color: ${accentGold} !important;
              color: #ffffff !important;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            }

            .user-identity-box {
              text-align: center;
            }

            .user-full-name {
              color: ${primaryNavy} !important;
              font-family: 'Playfair Display', serif !important;
              margin: 0 !important;
              font-weight: 700 !important;
            }

            .saint-name {
              color: ${accentGold};
            }

            .username-text {
              font-family: monospace;
              font-size: 13px;
            }

            .role-tags-group {
              margin-top: 10px;
            }

            .role-pill-tag {
              border-radius: 12px;
              font-weight: 700;
              padding: 2px 14px;
            }

            .profile-quick-desc .ant-descriptions-item-label {
              color: #64748b !important;
            }

            /* Right Section Cards */
            .profile-section-card {
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

            .priest-extra-box {
              background: ${softBg};
              padding: 16px;
              border-radius: 12px;
              border: 1px dashed ${accentGold};
              margin-bottom: 16px;
            }

            .save-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              padding: 0 28px !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
