import React, { useEffect, useState, useCallback } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Row,
  Col,
  Card,
  Space,
  Upload,
  message,
  Tabs,
  InputNumber,
  Spin,
  Typography,
} from "antd";
import {
  HomeOutlined,
  SaveOutlined,
  UploadOutlined,
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import AppButton from "../../components/common/AppButton";
import { useUser } from "../../context/UserContext";
import { useChurch } from "../../hooks/useChurch";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ParishSettingsPage = () => {
  const { user } = useUser();
  const isCatechist = user?.role === "catechist";
  const { editChurch, getChurchId } = useChurch();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Lấy ID giáo xứ từ object user (tùy cấu trúc user: user?.church_id hoặc user?.church?.id)
  const churchId = user?.church_id || user?.church?.id;

  // 1. Tải thông tin giáo xứ thực tế từ API hook
  const fetchParishInfo = useCallback(async () => {
    if (!churchId) {
      message.warning(
        "Không tìm thấy thông tin Giáo xứ của tài khoản hiện tại!",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await getChurchId(churchId);
      // Giả định response trả về res.data hoặc trực tiếp res
      const churchData = res?.data || res;

      if (churchData) {
        form.setFieldsValue({
          code: churchData.code || "",
          name: churchData.name || "",
          type: churchData.type || "GIAO_XU",
          pastor_name: churchData.pastor_name || "",
          phone: churchData.phone || "",
          email: churchData.email || "",
          address: churchData.address || "",
          ward: churchData.ward || "",
          district: churchData.district || "",
          latitude: churchData.latitude ? Number(churchData.latitude) : null,
          longitude: churchData.longitude ? Number(churchData.longitude) : null,
          is_active:
            churchData.is_active === 1 || churchData.is_active === true,
          description: churchData.description || "",
        });

        setImageUrl(churchData.image || "");
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin giáo xứ:", error);
      message.error("Lỗi khi tải thông tin giáo xứ!");
    } finally {
      setLoading(false);
    }
  }, [churchId, getChurchId, form]);

  useEffect(() => {
    fetchParishInfo();
  }, [fetchParishInfo]);

  // 2. Xử lý lưu thông tin bằng editChurch
  const handleSave = async (values) => {
    if (!isCatechist) {
      message.warning("Bạn không có quyền chỉnh sửa thông tin giáo xứ!");
      return;
    }

    if (!churchId) {
      message.error("Không tìm thấy ID giáo xứ để cập nhật!");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...values,
        is_active: values.is_active ? 1 : 0,
      };

      if (selectedFile) {
        const formData = new FormData();

        Object.keys(payload).forEach((key) => {
          if (payload[key] !== null && payload[key] !== undefined) {
            formData.append(key, payload[key]);
          }
        });

        formData.append("image", selectedFile);

        await editChurch(churchId, formData);
      } else {
        payload.image = imageUrl;

        await editChurch(churchId, payload);
      }

      message.success("Cập nhật thông tin giáo xứ thành công! ✨");

      await fetchParishInfo();
    } catch (error) {
      console.error("Lỗi khi lưu thông tin:", error);

      message.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi lưu thông tin giáo xứ!",
      );
    } finally {
      setSaving(false);
    }
  };

  // 3. Xử lý chọn ảnh đại diện từ máy tính
  const handleBeforeUpload = (file) => {
    setSelectedFile(file);
    // Tạo link blob tạm thời để xem trước (preview)
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);
    message.success("Đã chọn ảnh mới (Bấm 'Lưu Thay Đổi' để hoàn tất)!");
    return false; // Chặn antd tự động gọi upload mặc định
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header dùng chung */}
      <PageHeroHeader
        icon={<BankOutlined />}
        badgeText="🌸 CẤU HÌNH HỆ THỐNG"
        title="Thông Tin Giáo Xứ / Giáo Họ"
        description={
          isCatechist
            ? "Chỉnh sửa chi tiết thông tin nhà thờ, linh mục phụ trách và địa chỉ"
            : "Xem thông tin nhà thờ, linh mục phụ trách và địa chỉ"
        }
        onRefresh={fetchParishInfo}
        refreshLoading={loading}
        primaryButtonText={
          isCatechist ? (saving ? "Đang lưu..." : "Lưu Thay Đổi") : undefined
        }
        primaryButtonIcon={isCatechist ? <SaveOutlined /> : undefined}
        onPrimaryClick={isCatechist ? () => form.submit() : undefined}
        primaryLoading={saving}
        primaryDisabled={loading || !isCatechist}
      />

      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!isCatechist}
          initialValues={{ is_active: true, type: "GIAO_XU" }}
        >
          <Row gutter={[20, 20]}>
            {/* CỘT TRÁI: Logo/Ảnh & Switch Trạng Thái */}
            <Col xs={24} lg={7}>
              <Card
                style={{
                  borderRadius: 24,
                  border: "2px solid #FFE4E6",
                  boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: "#334155", display: "block" }}>
                    Hình Ảnh Nhà Thờ / Logo
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Ảnh hiển thị trên báo cáo và ứng dụng
                  </Text>
                </div>

                {/* Khung Xem Trước Ảnh */}
                {/* Khung Xem Trước Ảnh */}
                <div
                  style={{
                    width: 150,
                    height: 150,
                    margin: "0 auto 16px",
                    borderRadius: 20,
                    border: "2px dashed #FF6B8B",
                    padding: 4,
                    overflow: "hidden",
                    background: "#FFF5F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={
                        // Nếu là blob preview hoặc URL tuyệt đối (http/https) thì dùng trực tiếp
                        // Ngược lại (đường dẫn tương đối từ backend) mới nối thêm REACT_APP_API_URL
                        imageUrl.startsWith("blob:") ||
                        imageUrl.startsWith("http")
                          ? imageUrl
                          : `${process.env.REACT_APP_API_URL}/${imageUrl.replace(/^\//, "")}`
                      }
                      alt="Church Logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 16,
                      }}
                    />
                  ) : (
                    <BankOutlined style={{ fontSize: 44, color: "#FF6B8B" }} />
                  )}
                </div>

                {isCatechist && (
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleBeforeUpload}
                    accept="image/*"
                  >
                    <AppButton
                      icon={<UploadOutlined />}
                      style={{ borderRadius: 12 }}
                    >
                      Chọn ảnh mới
                    </AppButton>
                  </Upload>
                )}
                {!isCatechist && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: "#64748B",
                      fontSize: 12,
                    }}
                  >
                    <InfoCircleOutlined style={{ marginRight: 6 }} />
                    Tài khoản của bạn chỉ có quyền xem thông tin.
                  </div>
                )}
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 16,
                    borderTop: "1px dashed #FFE4E6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={0}
                    style={{ textAlign: "left" }}
                  >
                    <Text strong style={{ fontSize: 13, color: "#334155" }}>
                      Trạng thái hoạt động
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Trạng thái hệ thống (Chỉ xem)
                    </Text>
                  </Space>

                  <Form.Item name="is_active" valuePropName="checked" noStyle>
                    <Switch disabled /> {/* 👈 Thêm disabled vào đây */}
                  </Form.Item>
                </div>
              </Card>
            </Col>

            {/* CỘT PHẢI: Form Các Tabs Nhập Liệu */}
            <Col xs={24} lg={17}>
              <Card
                style={{
                  borderRadius: 24,
                  border: "2px solid #FFE4E6",
                  boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
                }}
              >
                <Tabs
                  defaultActiveKey="1"
                  items={[
                    {
                      key: "1",
                      label: (
                        <span>
                          <HomeOutlined /> Thông Tin Cơ Bản
                        </span>
                      ),
                      children: (
                        <Row gutter={[16, 0]}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Mã Giáo Xứ / Họ"
                              name="code"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập mã!",
                                },
                              ]}
                            >
                              <Input
                                disabled
                                placeholder="VD: GX-THAIHA"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Phân Loại"
                              name="type"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn phân loại!",
                                },
                              ]}
                            >
                              <Select style={{ height: 42 }}>
                                <Option value="GIAO_XU">Giáo Xứ</Option>
                                <Option value="GIAO_HO">Giáo Họ</Option>
                              </Select>
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item
                              label="Tên Giáo Xứ / Họ"
                              name="name"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên!",
                                },
                              ]}
                            >
                              <Input
                                placeholder="VD: Giáo xứ Thái Hà"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item
                              label="Linh Mục Quản Xứ / Phụ Trách"
                              name="pastor_name"
                            >
                              <Input
                                prefix={
                                  <UserOutlined style={{ color: "#94A3B8" }} />
                                }
                                placeholder="VD: Lm. Giuse Nguyễn Văn A"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ),
                    },
                    {
                      key: "2",
                      label: (
                        <span>
                          <EnvironmentOutlined /> Liên Hệ & Địa Chỉ
                        </span>
                      ),
                      children: (
                        <Row gutter={[16, 0]}>
                          <Col xs={24} sm={12}>
                            <Form.Item label="Số Điện Thoại" name="phone">
                              <Input
                                prefix={
                                  <PhoneOutlined style={{ color: "#94A3B8" }} />
                                }
                                placeholder="0243 851xxxx"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Email Liên Hệ"
                              name="email"
                              rules={[
                                {
                                  type: "email",
                                  message: "Email không đúng định dạng!",
                                },
                              ]}
                            >
                              <Input
                                prefix={
                                  <MailOutlined style={{ color: "#94A3B8" }} />
                                }
                                placeholder="giaoxu@gmail.com"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item label="Địa Chỉ Chi Tiết" name="address">
                              <Input
                                placeholder="Số nhà, đường/thôn"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item label="Phường / Xã" name="ward">
                              <Input
                                placeholder="VD: Quang Trung"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Quận / Huyện / Thị Xã"
                              name="district"
                            >
                              <Input
                                placeholder="VD: Đống Đa"
                                style={{ borderRadius: 12, height: 42 }}
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item label="Vĩ Độ (Latitude)" name="latitude">
                              <InputNumber
                                style={{
                                  width: "100%",
                                  borderRadius: 12,
                                  height: 42,
                                }}
                                step={0.000001}
                                placeholder="VD: 21.012345"
                              />
                            </Form.Item>
                          </Col>

                          <Col xs={24} sm={12}>
                            <Form.Item
                              label="Kinh Độ (Longitude)"
                              name="longitude"
                            >
                              <InputNumber
                                style={{
                                  width: "100%",
                                  borderRadius: 12,
                                  height: 42,
                                }}
                                step={0.000001}
                                placeholder="VD: 105.823456"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ),
                    },
                    {
                      key: "3",
                      label: (
                        <span>
                          <InfoCircleOutlined /> Mô Tả Bổ Sung
                        </span>
                      ),
                      children: (
                        <Form.Item
                          label="Giới Thiệu / Ghi Chú"
                          name="description"
                        >
                          <TextArea
                            rows={6}
                            placeholder="Nhập lược sử, thông tin giờ Lễ hoặc thông báo chung..."
                            style={{ borderRadius: 12 }}
                          />
                        </Form.Item>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Form>
      </Spin>
    </div>
  );
};

export default ParishSettingsPage;
