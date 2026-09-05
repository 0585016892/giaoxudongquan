import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  StarFilled,
  CrownFilled,
  BookOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";
import { useUser } from "../../context/UserContext";
import { getAdminById, updateAdmin, changePassword } from "../../api/adminApi";

const { Title, Text } = Typography;

export default function ProfilePageCate() {
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar Upload State
  const [fileList, setFileList] = useState([]);

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  /* =========================================================
     ROLE HELPER
  ========================================================= */
  const translateRole = (role) => {
    switch (role) {
      case "priest":
        return "Linh mục Chánh xứ ✝️";
      case "admin":
        return "Ban Quản Trị ✨";
      case "teacher":
      case "catechist":
        return "Huynh Trưởng / GLV 💖";
      case "liturgy_manager":
        return "Ban Phụng Vụ ⛪";
      case "media_manager":
        return "Ban Truyền Thông 📸";
      default:
        return "Hội đồng Mục vụ 🌿";
    }
  };

  /* =========================================================
     ACCOUNT TYPE CONFIG (VIP / MEMBER)
  ========================================================= */
  const accountType = useMemo(() => {
    const type = String(profileData?.account_type || user?.account_type || "")
      .trim()
      .toLowerCase();
    if (type === "vip") {
      return {
        key: "vip",
        label: "Tài Khoản Thành viên VIP",
        icon: <CrownFilled />,
        color: "#D97706",
        bg: "#FEF3C7",
        border: "#FDE68A",
      };
    }
    return {
      key: "member",
      label: "Tài Khoản Thành viên",
      icon: <StarFilled />,
      color: "#64748B",
      bg: "#F1F5F9",
      border: "#CBD5E1",
    };
  }, [profileData?.account_type, user?.account_type]);

  /* =========================================================
     1. TẢI THÔNG TIN HỒ SƠ DỰA VÀO user.id
  ========================================================= */
  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await getAdminById(user.id);
      const data = res.data?.data || res.data || {};

      setProfileData(data);

      // Set giá trị vào Form (chuyển đổi chuỗi ngày ISO sang dayjs)
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
        role: data.role || "catechist",
      });

      // Xử lý URL Avatar chuẩn
      if (data.avatar) {
        const fullAvatarUrl =
          data.avatar.startsWith("http://") ||
          data.avatar.startsWith("https://") ||
          data.avatar.startsWith("blob:")
            ? data.avatar
            : `${API_URL}${data.avatar.startsWith("/") ? "" : "/"}${data.avatar}`;

        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: fullAvatarUrl,
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

  /* =========================================================
     2. XỬ LÝ CẬP NHẬT HỒ SƠ CÁ NHÂN
  ========================================================= */
  const handleUpdateProfile = async () => {
    try {
      const values = await profileForm.validateFields();
      setSubmitLoading(true);

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === "avatar") return;

        const val = values[key];
        if (val !== undefined && val !== null) {
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

      if (fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      const res = await updateAdmin(user.id, formData);
      message.success(
        res.data?.message || "Cập nhật thông tin cá nhân thành công! ✨",
      );
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

  /* =========================================================
     3. XỬ LÝ ĐỔI MẬT KHẨU
  ========================================================= */
  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setPasswordLoading(true);

      await changePassword(user.id, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success("Đổi mật khẩu thành công! 🔐");
      passwordForm.resetFields();
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại!",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="chibi-loading-screen"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Space direction="vertical" align="center" size="middle">
          <Spin size="large" />
          <Text className="chibi-loading-text">
            Đang tải hồ sơ của bạn... 💕
          </Text>
        </Space>
      </div>
    );
  }

  const userName =
    profileData?.full_name || profileData?.username || "Huynh Trưởng";

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 16,
          colorBgLayout: "#FFF5F7",
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="chibi-profile-layout">
        <div className="chibi-profile-container">
          {/* HEADER BAR */}
          <div className="chibi-header-banner">
            <PageHeroHeader
              icon={<UserOutlined />}
              badgeText="🌸 THÔNG TIN HỒ SƠ CÁ NHÂN"
              title="Hồ Sơ Của Bạn "
              description=" Quản lý thông tin lý lịch, chức vụ giáo lý và bảo mật mật khẩu tài
              khoản."
            />
          </div>

          <Row gutter={[20, 20]}>
            {/* CỘT TRÁI: AVATAR & TÓM TẮT TÀI KHOẢN */}
            <Col xs={24} lg={8}>
              <Card bordered={false} className="chibi-card chibi-card-left">
                <div className="chibi-avatar-upload-box">
                  <div className="chibi-avatar-ring">
                    <Avatar
                      size={116}
                      src={
                        fileList.length > 0
                          ? fileList[0].url || fileList[0].thumbUrl
                          : null
                      }
                      icon={<UserOutlined />}
                      className="chibi-main-avatar"
                    />
                    <span className={`chibi-star-badge ${accountType.key}`}>
                      {accountType.key === "vip" ? (
                        <CrownFilled />
                      ) : (
                        <StarFilled />
                      )}
                    </span>
                  </div>

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
                      className="chibi-upload-btn"
                    />
                  </Upload>
                </div>

                <div className="chibi-user-id-box">
                  <Title level={4} className="chibi-full-name">
                    {profileData?.saint_name && (
                      <span className="chibi-saint">
                        {profileData.saint_name}{" "}
                      </span>
                    )}
                    {userName}
                  </Title>

                  <Text type="secondary" className="chibi-username-text">
                    @{profileData?.username || "username"}
                  </Text>

                  <div className="chibi-tags-group">
                    <Tag className="chibi-tag-role">
                      {translateRole(profileData?.role)}
                    </Tag>
                    <Tag
                      icon={accountType.icon}
                      style={{
                        color: accountType.color,
                        background: accountType.bg,
                        borderColor: accountType.border,
                      }}
                      className="chibi-tag-account"
                    >
                      {accountType.label}
                    </Tag>
                  </div>
                </div>

                <Divider style={{ margin: "16px 0", borderColor: "#FFE4E6" }} />

                <Descriptions
                  column={1}
                  size="small"
                  className="chibi-quick-desc"
                >
                  <Descriptions.Item label="ID Hệ thống">
                    <strong style={{ color: "#FF6B8B" }}>
                      #{profileData?.id}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Chức danh">
                    <span style={{ color: "#475569", fontWeight: 700 }}>
                      {profileData?.position || "Chưa cập nhật"}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {profileData?.email || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại">
                    {profileData?.phone || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color="green" className="chibi-status-tag">
                      ● Đang hoạt động
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            {/* CỘT PHẢI: FORM CHỈNH SỬA & ĐỔI MẬT KHẨU */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={20} style={{ width: "100%" }}>
                {/* 1. FORM CẬP NHẬT THÔNG TIN */}
                <Card
                  bordered={false}
                  className="chibi-card"
                  title={
                    <div className="chibi-card-header">
                      <IdcardOutlined style={{ color: "#FF6B8B" }} />
                      <span>Cập Nhật Thông Tin Hồ Sơ</span>
                    </div>
                  }
                >
                  <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleUpdateProfile}
                    className="chibi-form"
                  >
                    <Form.Item name="role" hidden>
                      <Input />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          label={<span className="chibi-label">Tên Thánh</span>}
                          name="saint_name"
                        >
                          <Input
                            placeholder="Ví dụ: Giuse, Maria..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={16}>
                        <Form.Item
                          label={
                            <span className="chibi-label">Họ và tên *</span>
                          }
                          name="full_name"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập họ tên đầy đủ",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Nhập họ và tên..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">Email liên hệ *</span>
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
                              <MailOutlined style={{ color: "#FF85A1" }} />
                            }
                            placeholder="email@example.com"
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">Số điện thoại</span>
                          }
                          name="phone"
                        >
                          <Input
                            prefix={
                              <PhoneOutlined style={{ color: "#FF85A1" }} />
                            }
                            placeholder="09xxxx..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">
                              Chức danh / Nhiệm vụ
                            </span>
                          }
                          name="position"
                        >
                          <Input
                            placeholder="Ví dụ: Huynh trưởng, GLV Lớp Chiên..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={<span className="chibi-label">Ngày sinh</span>}
                          name="birthday"
                        >
                          <DatePicker
                            style={{ width: "100%" }}
                            format="YYYY-MM-DD"
                            placeholder="Chọn ngày sinh..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={<span className="chibi-label">Quê quán</span>}
                          name="hometown"
                        >
                          <Input
                            prefix={
                              <HomeOutlined style={{ color: "#FF85A1" }} />
                            }
                            placeholder="Quê hương..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">
                              Địa chỉ hiện tại
                            </span>
                          }
                          name="address"
                        >
                          <Input
                            prefix={
                              <HomeOutlined style={{ color: "#FF85A1" }} />
                            }
                            placeholder="Nơi cư trú..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* DÀNH RIÊNG CHO LINH MỤC */}
                    {profileData?.role === "priest" && (
                      <div className="chibi-priest-box">
                        <Divider
                          orientation="left"
                          style={{ borderColor: "#FDE68A" }}
                        >
                          <span
                            style={{
                              color: "#D97706",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            <SafetyCertificateOutlined /> Chức Thánh Mục Vụ
                          </span>
                        </Divider>

                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label={
                                <span className="chibi-label">
                                  Ngày thụ phong
                                </span>
                              }
                              name="ordination_date"
                            >
                              <DatePicker
                                style={{ width: "100%" }}
                                format="YYYY-MM-DD"
                                placeholder="Ngày thụ phong..."
                                className="chibi-input"
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label={
                                <span className="chibi-label">
                                  Khẩu hiệu Mục vụ
                                </span>
                              }
                              name="motto"
                            >
                              <Input
                                prefix={
                                  <BookOutlined style={{ color: "#F59E0B" }} />
                                }
                                placeholder="Châm ngôn dâng hiến..."
                                className="chibi-input"
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Form.Item
                          label={
                            <span className="chibi-label">Tiểu sử tóm tắt</span>
                          }
                          name="bio"
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Đoạn giới thiệu ngắn..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </div>
                    )}

                    <div style={{ textAlign: "right", marginTop: 12 }}>
                      <AppButton
                        key="submit"
                        icon={<SaveOutlined />}
                        type="primary"
                        loading={submitLoading}
                        onClick={handleUpdateProfile}
                        size="middle"
                      >
                        Lưu Thay Đổi ✨
                      </AppButton>
                      ,
                    </div>
                  </Form>
                </Card>

                {/* 2. FORM ĐỔI MẬT KHẨU */}
                <Card
                  bordered={false}
                  className="chibi-card"
                  title={
                    <div className="chibi-card-header">
                      <KeyOutlined style={{ color: "#A855F7" }} />
                      <span>Đổi Mật Khẩu Bảo Mật</span>
                    </div>
                  }
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                    className="chibi-form"
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">
                              Mật khẩu hiện tại *
                            </span>
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
                              <LockOutlined style={{ color: "#C084FC" }} />
                            }
                            placeholder="Mật khẩu cũ..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} sm={12}>
                        <Form.Item
                          label={
                            <span className="chibi-label">Mật khẩu mới *</span>
                          }
                          name="newPassword"
                          rules={[
                            { required: true, message: "Nhập mật khẩu mới" },
                            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                          ]}
                        >
                          <Input.Password
                            prefix={
                              <LockOutlined style={{ color: "#C084FC" }} />
                            }
                            placeholder="Mật khẩu mới..."
                            className="chibi-input"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div style={{ textAlign: "right" }}>
                      <AppButton
                        key="submit"
                        icon={<KeyOutlined />}
                        type="primary"
                        loading={passwordLoading}
                        onClick={handleChangePassword}
                        size="middle"
                      >
                        Cập Nhật Mật Khẩu 🔐
                      </AppButton>
                    </div>
                  </Form>
                </Card>
              </Space>
            </Col>
          </Row>
        </div>

        {/* STYLES SCSS/CSS IN JS */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

          .chibi-loading-screen {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 75vh;
            background: #FFF5F7;
          }
          .chibi-loading-text {
            color: #FF6B8B;
            font-weight: 700;
            font-size: 15px;
          }

          .chibi-profile-layout {
            min-height: 100vh;
            padding: 24px 16px 60px;
            font-family: 'Quicksand', 'Be Vietnam Pro', sans-serif;
          }

          .chibi-profile-container {
            max-width: 1080px;
            margin: 0 auto;
          }

          /* HEADER BANNER */
          .chibi-header-banner {
            margin-bottom: 20px;
          }

          .chibi-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 14px;
            background: #FFE4E6;
            color: #E11D48;
            border: 1px solid #FECDD3;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }

          .chibi-main-title {
            color: #334155 !important;
            font-weight: 800 !important;
            margin: 0 !important;
            font-size: clamp(22px, 3vw, 28px) !important;
          }

          .chibi-sub-title {
            color: #64748B;
            margin: 4px 0 0 0 !important;
            font-size: 13px;
            font-weight: 600;
          }

          /* CARD SYSTEM */
          .chibi-card {
            background: rgba(255, 255, 255, 0.95) !important;
            border-radius: 20px !important;
            border: 1.5px solid #FFE4E6 !important;
            box-shadow: 0 10px 25px -5px rgba(255, 182, 193, 0.3) !important;
            padding: 12px;
          }

          .chibi-card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #334155;
            font-size: 15px;
            font-weight: 800;
          }

          /* AVATAR UPLOAD */
          .chibi-avatar-upload-box {
            position: relative;
            width: 120px;
            margin: 8px auto 16px;
          }

          .chibi-avatar-ring {
            position: relative;
            display: inline-block;
          }

          .chibi-main-avatar {
            border: 3px solid #FFF;
            box-shadow: 0 6px 18px rgba(255, 107, 139, 0.25);
            background: #FF85A1;
          }

          .chibi-star-badge {
            position: absolute;
            bottom: 2px;
            right: 2px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #FFF;
            border: 2px solid #FFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
          .chibi-star-badge.vip { background: #F59E0B; }
          .chibi-star-badge.member { background: #94A3B8; }

          .chibi-upload-btn {
            position: absolute;
            bottom: -2px;
            left: 2px;
            background: #FF6B8B !important;
            border-color: #FFF !important;
            color: #FFF !important;
            box-shadow: 0 4px 10px rgba(255, 107, 139, 0.3);
          }

          /* USER ID BOX */
          .chibi-user-id-box {
            text-align: center;
          }

          .chibi-full-name {
            color: #1E293B !important;
            font-weight: 800 !important;
            margin: 0 !important;
            font-size: 18px !important;
          }

          .chibi-saint {
            color: #FF6B8B;
          }

          .chibi-username-text {
            font-size: 12px;
            font-weight: 700;
            color: #94A3B8;
          }

          .chibi-tags-group {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: 10px;
            flex-wrap: wrap;
          }

          .chibi-tag-role {
            margin: 0;
            border-radius: 10px;
            border: 1px solid #E9D5FF;
            background: #FAF5FF;
            color: #9333EA;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 10px;
          }

          .chibi-tag-account {
            margin: 0;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 800;
            padding: 2px 10px;
          }

          .chibi-quick-desc .ant-descriptions-item-label {
            color: #64748B !important;
            font-weight: 600;
          }

          .chibi-status-tag {
            border-radius: 8px;
            font-weight: 700;
            font-size: 10px;
          }

          /* FORM ELEMENTS */
          .chibi-label {
            font-weight: 700;
            color: #475569;
            font-size: 12.5px;
          }

          .chibi-input {
            border-radius: 12px !important;
            border-color: #F1F5F9 !important;
            background: #FAF5F7 !important;
            transition: all 0.2s ease;
          }
          .chibi-input:hover, .chibi-input:focus {
            background: #FFF !important;
            border-color: #FF6B8B !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 139, 0.1) !important;
          }

          .chibi-priest-box {
            background: #FFFBEB;
            border: 1.5px dashed #FDE68A;
            padding: 14px;
            border-radius: 16px;
            margin-bottom: 16px;
          }

          /* BUTTONS */
          .chibi-btn-submit {
            background: linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%) !important;
            border: none !important;
            height: 40px !important;
            border-radius: 12px !important;
            font-weight: 800 !important;
            padding: 0 24px !important;
            box-shadow: 0 4px 12px rgba(255, 107, 139, 0.3) !important;
          }
          .chibi-btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 107, 139, 0.4) !important;
          }

          .chibi-btn-purple {
            background: linear-gradient(135deg, #A855F7 0%, #C084FC 100%) !important;
            border: none !important;
            height: 40px !important;
            border-radius: 12px !important;
            font-weight: 800 !important;
            padding: 0 24px !important;
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3) !important;
          }
          .chibi-btn-purple:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4) !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
