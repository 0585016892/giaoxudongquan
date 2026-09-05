import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Switch,
  message,
  Image,
  Space,
  Popconfirm,
  Card,
  Typography,
  InputNumber,
  Tag,
  Tooltip,
  ConfigProvider,
  Badge,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  PictureOutlined,
  LinkOutlined,
  OrderedListOutlined,
  CloudUploadOutlined,
  CompassOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getSlides,
  createSlide,
  deleteSlide,
  updateSlide,
  updateSlideStatus,
} from "../api/slideApi";
import { useUser } from "../context/UserContext";

const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const SlideManager = () => {
  const { user } = useUser();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [form] = Form.useForm();

  const IMG_URL = process.env.REACT_APP_API_URL;

  const allowRoles = ["admin", "priest", "media_manager"];

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSlides();
      setSlides(data || []);
    } catch (err) {
      message.error("Không thể tải danh sách slide");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        title: record.title,
        subtitle: record.subtitle,
        link: record.link,
        sort_order: record.sort_order,
      });
      setPreviewImage(`${IMG_URL}${record.image}`);
    } else {
      setEditingId(null);
      form.resetFields();
      setPreviewImage(null);
      setFile(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingId && !file)
        return message.warning("Vui lòng chọn ảnh minh họa cho slide");

      const formData = new FormData();
      Object.keys(values).forEach((key) =>
        formData.append(key, values[key] || ""),
      );
      if (file) formData.append("image", file);

      setLoading(true);
      if (editingId) {
        await updateSlide(editingId, formData);
        message.success("Cập nhật slide thành công");
      } else {
        await createSlide(formData);
        message.success("Thêm mới slide thành công");
      }
      setIsModalOpen(false);
      fetchSlides();
    } catch (err) {
      message.error("Gặp lỗi khi lưu dữ liệu slide");
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file) => {
    const isValid = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    );
    if (!isValid) {
      message.error("Định dạng ảnh không hợp lệ (Chỉ nhận JPG, PNG, WebP)!");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
    return false;
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Hình ảnh Slide",
      dataIndex: "image",
      width: 200,
      render: (img) => (
        <div style={{ position: "relative", width: 170, height: 90 }}>
          <Image
            width={170}
            height={90}
            src={img.startsWith("data") ? img : `${IMG_URL}${img}`}
            style={{
              borderRadius: 10,
              objectFit: "cover",
              boxShadow: "0 4px 12px rgba(27, 54, 93, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.3)",
            }}
            fallback="https://via.placeholder.com/170x90?text=No+Image"
          />
        </div>
      ),
    },
    {
      title: "Thông tin hiển thị",
      key: "content",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 15, color: primaryNavy }}>
            {record.title || "---"}
          </Text>
          {record.subtitle && (
            <Text type="secondary" style={{ fontSize: 13, color: "#64748b" }}>
              {record.subtitle}
            </Text>
          )}
          {record.link && (
            <Tag
              icon={<LinkOutlined style={{ color: primaryNavy }} />}
              className="gold-link-tag"
            >
              {record.link.length > 40
                ? record.link.substring(0, 40) + "..."
                : record.link}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Thứ tự",
      dataIndex: "sort_order",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.sort_order || 0) - (b.sort_order || 0),
      render: (val) => (
        <Tag className="sort-order-tag">
          <OrderedListOutlined style={{ marginRight: 4 }} />
          {val ?? 0}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 130,
      align: "center",
      render: (active, record) => (
        <Space direction="vertical" align="center" size={4}>
          {allowRoles.includes(user?.role) && (
            <Switch
              size="small"
              checked={active === 1}
              onChange={async (checked) => {
                try {
                  await updateSlideStatus(record.id, {
                    is_active: checked ? 1 : 0,
                  });
                  fetchSlides();
                } catch {
                  message.error("Không thể cập nhật trạng thái");
                }
              }}
            />
          )}
          <Badge
            status={active ? "success" : "default"}
            text={
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: active ? "#2e7d32" : "#94a3b8",
                }}
              >
                {active ? "HIỂN THỊ" : "ĐANG ẨN"}
              </span>
            }
          />
        </Space>
      ),
    },
    {
      title: "Thao tác",
      width: 110,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          {allowRoles.includes(user?.role) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
                }
                onClick={() => openModal(record)}
                className="action-btn-edit"
              />
            </Tooltip>
          )}
          {allowRoles.includes(user?.role) && (
            <Popconfirm
              title="Xóa slide này?"
              description="Dữ liệu hình ảnh sẽ bị gỡ bỏ khỏi trang chủ vĩnh viễn."
              onConfirm={() => deleteSlide(record.id).then(fetchSlides)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

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
      <div className="slide-editorial-layout">
        <div className="slide-editorial-container">
          {/* HEADER SECTION */}
          <div className="slide-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG TRUYỀN THÔNG MỤC VỤ
              </span>
              <Title level={2} className="slide-main-title">
                QUẢN LÝ BANNER & SLIDERS
              </Title>

              <Paragraph className="slide-sub-title">
                Thiết lập hệ thống ảnh trình chiếu (Slideshow) banner lớn ngoài
                trang chủ Giáo xứ.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchSlides}
                loading={loading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              {allowRoles.includes(user?.role) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openModal()}
                  className="add-slide-btn"
                >
                  Thêm Slide Mới
                </Button>
              )}
            </div>
          </div>

          {/* MAIN DATA CARD */}
          <Card bordered={false} className="main-table-card">
            <Table
              columns={columns}
              dataSource={slides}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 6,
                showTotal: (total) => `Tổng số: ${total} slide`,
                style: { marginTop: 20 },
              }}
              scroll={{ x: 800 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* MODAL EDIT/CREATE */}
        <Modal
          title={
            <div className="modal-custom-title">
              <PictureOutlined style={{ color: accentGold }} />
              <span>
                {editingId
                  ? "Cập Nhật Slide Trình Chiếu"
                  : "Tạo Khối Slide Mới"}
              </span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSubmit}
          confirmLoading={loading}
          width={680}
          okText="Lưu dữ liệu"
          cancelText="Đóng"
          centered
          okButtonProps={{
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: { borderRadius: 8, height: 38 },
          }}
        >
          <Form form={form} layout="vertical" style={{ paddingTop: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Tiêu đề chính *
                  </Text>
                }
                name="title"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input
                  placeholder="Ví dụ: Lịch Phụng Vụ Tuần Thánh..."
                  className="custom-form-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Phụ đề (Không bắt buộc)
                  </Text>
                }
                name="subtitle"
              >
                <Input
                  placeholder="Ví dụ: Giáo họ biệt lập Đồng Quan..."
                  className="custom-form-input"
                />
              </Form.Item>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Đường dẫn liên kết (Link URL)
                  </Text>
                }
                name="link"
              >
                <Input
                  prefix={<LinkOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="https://giaoxudongquan.com/bai-viet/..."
                  className="custom-form-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Thứ tự hiển thị
                  </Text>
                }
                name="sort_order"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  placeholder="0"
                  className="custom-form-input"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Tệp hình ảnh trình chiếu *
                </Text>
              }
            >
              <Upload.Dragger
                accept="image/*"
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                className="slide-dragger-area"
              >
                {previewImage ? (
                  <div style={{ padding: "12px" }}>
                    <img
                      src={previewImage}
                      alt="Xem trước slide"
                      style={{
                        maxHeight: 180,
                        borderRadius: 10,
                        boxShadow: "0 6px 16px rgba(27, 54, 93, 0.12)",
                        border: "1px solid rgba(212, 175, 55, 0.3)",
                      }}
                    />
                    <div style={{ marginTop: 10 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Kéo thả hoặc bấm vào đây để đổi ảnh khác
                      </Text>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: "20px 0" }}>
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined
                        style={{ fontSize: 40, color: accentGold }}
                      />
                    </p>
                    <p
                      style={{
                        fontWeight: 600,
                        color: primaryNavy,
                        margin: "8px 0 2px",
                      }}
                    >
                      Bấm hoặc kéo thả ảnh vào khu vực này
                    </p>
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, color: "#94a3b8" }}
                    >
                      Hỗ trợ JPG, PNG, WebP (Khuyến nghị kích thước tỷ lệ rộng:
                      1920x600px)
                    </Text>
                  </div>
                )}
              </Upload.Dragger>
            </Form.Item>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .slide-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .slide-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Styling */
            .slide-header-section {
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

            .slide-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .slide-sub-title {
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

            .add-slide-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Main Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-link-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-size: 12px;
              margin-top: 4px;
            }

            .sort-order-tag {
              background: rgba(27, 54, 93, 0.06) !important;
              color: ${primaryNavy} !important;
              border-radius: 8px;
              font-weight: 600;
              border: none !important;
            }

            .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            .action-btn-delete:hover {
              background: #fff5f5 !important;
            }

            /* Modal Style */
            .modal-custom-title {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .form-field-label {
              font-size: 13px;
              color: ${primaryNavy};
            }

            .custom-form-input {
              border-radius: 8px !important;
            }

            .slide-dragger-area {
              background: ${softBg} !important;
              border: 1px dashed ${accentGold} !important;
              border-radius: 12px !important;
              transition: border-color 0.3s ease;
            }

            .slide-dragger-area:hover {
              border-color: ${primaryNavy} !important;
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default SlideManager;
