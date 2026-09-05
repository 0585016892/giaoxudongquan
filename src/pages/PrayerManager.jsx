import React, { useEffect, useState, useCallback } from "react";
import {
  getPrayers,
  deletePrayer,
  createPrayer,
  updatePrayer,
  getPrayerById,
} from "../api/prayerApi";
import {
  Table,
  Button,
  Input,
  Space,
  message,
  Modal,
  Form,
  Tag,
  Typography,
  Select,
  Row,
  Col,
  Card,
  Popconfirm,
  Empty,
  Tooltip,
  ConfigProvider,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ReadOutlined,
  FlagOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function PrayerManager() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(null);
  const [examSession, setExamSession] = useState(null);
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPrayers({
        search,
        category,
        exam_session: examSession,
        page,
        limit: 10,
      });
      setData(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      message.error("Lỗi đồng bộ dữ liệu Lời Chúa từ máy chủ Phụng Vụ!");
    } finally {
      setLoading(false);
    }
  }, [search, category, examSession, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = async (record = null, isView = false) => {
    setViewMode(isView);
    form.resetFields();
    if (record) {
      setEditingId(record.id);
      try {
        const res = await getPrayerById(record.id);
        form.setFieldsValue(res.data);
      } catch (err) {
        message.error("Không thể tải nội dung chi tiết bài viết!");
      }
    } else {
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) await updatePrayer(editingId, values);
      else await createPrayer(values);

      message.success("Bảo lưu nội dung Phụng Vụ thành công!");
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.log("Validation Failed:", error);
    }
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
      title: "Đoạn Trích Phụng Vụ / Kinh Nguyện",
      dataIndex: "title",
      key: "title",
      width: "35%",
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <Text
            strong
            style={{
              color: primaryNavy,
              fontSize: "15px",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            {text}
          </Text>
          <Text type="secondary" style={{ fontSize: "12px", color: "#64748b" }}>
            <UserOutlined style={{ marginRight: 4, fontSize: "11px" }} />
            {record.author || "Khuyết danh / Truyền thống Giáo hội"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đợt Khảo Kinh",
      dataIndex: "exam_session",
      key: "exam_session",
      width: "15%",
      render: (session) =>
        session ? (
          <Tag className="gold-session-tag">
            <FlagOutlined style={{ marginRight: 4 }} />
            {session}
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Chưa phân đợt
          </Text>
        ),
    },
    {
      title: "Chuyên Mục",
      dataIndex: "category",
      key: "category",
      width: "18%",
      render: (cat) => {
        let tagColor = "blue";
        if (cat === "Tin Mừng") tagColor = "gold";
        if (cat === "Cựu Ước") tagColor = "green";
        if (cat === "Ý Cầu Nguyện") tagColor = "purple";

        return (
          <Tag color={tagColor} style={{ fontWeight: 600, borderRadius: 8 }}>
            {cat || "Khác"}
          </Tag>
        );
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      width: "15%",
      render: (date) => (
        <Text style={{ color: "#64748b", fontSize: "13px" }}>
          <CalendarOutlined style={{ marginRight: 6, color: primaryNavy }} />
          {date ? new Date(date).toLocaleDateString("vi-VN") : "---"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: "14%",
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Đọc chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => openModal(record, true)}
              className="action-btn-view"
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa văn bản">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => openModal(record, false)}
              className="action-btn-edit"
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận gỡ bỏ bài viết?"
            description="Nội dung thánh thư hoặc ý nguyện này sẽ bị xóa khỏi hệ thống."
            onConfirm={() => deletePrayer(record.id).then(fetchData)}
            okText="Xóa dữ liệu"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa nội dung">
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                className="action-btn-delete"
              />
            </Tooltip>
          </Popconfirm>
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
      <div className="prayer-editorial-layout">
        <div className="prayer-editorial-container">
          {/* HEADER SECTION */}
          <div className="prayer-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG PHỤNG VỤ LỜI CHÚA
              </span>
              <Title level={2} className="prayer-main-title">
                KHO KINH
              </Title>
              <Paragraph className="prayer-sub-title">
                Quản lý nội dung các Kinh Thánh
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                className="add-prayer-btn"
              >
                Soạn Nội Dung Mới
              </Button>
            </div>
          </div>

          {/* FILTER CARD */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={10} lg={10}>
                <Input
                  placeholder="Tìm tiêu đề / trích dẫn Lời Chúa..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  allowClear
                  onChange={(e) => setSearch(e.target.value)}
                  onPressEnter={fetchData}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={12} sm={7} lg={7}>
                <Select
                  placeholder="Lọc theo Đợt Khảo"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={setExamSession}
                  className="custom-filter-select"
                >
                  <Option value="Đợt 1">Đợt 1</Option>
                  <Option value="Đợt 2">Đợt 2</Option>
                  <Option value="Đợt 3">Đợt 3</Option>
                  <Option value="Đợt 4">Đợt 4</Option>
                  <Option value="Chưa có đợt">Chưa có đợt</Option>
                </Select>
              </Col>

              <Col xs={12} sm={7} lg={7}>
                <Select
                  placeholder="Chuyên mục"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={setCategory}
                  className="custom-filter-select"
                >
                  <Option value="Tin Mừng">Tin Mừng Hằng Ngày</Option>
                  <Option value="Cựu Ước">Sách Cựu Ước</Option>
                  <Option value="Ý Cầu Nguyện">Ý Cầu Nguyện Phụng Vụ</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* TABLE LOGISTIC PANEL */}
          <Card bordered={false} className="main-table-card">
            <Table
              columns={columns}
              dataSource={data}
              loading={loading}
              rowKey="id"
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có dữ liệu Lời Chúa được ghi nhận"
                  />
                ),
              }}
              pagination={{
                total,
                current: page,
                onChange: setPage,
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Tổng số: ${total} bài viết thánh thư`,
                style: { marginTop: 20 },
              }}
              scroll={{ x: 800 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* MODAL BIÊN TẬP / XEM CHI TIẾT SÁCH PHỤNG VỤ */}
        <Modal
          title={
            <div className="modal-custom-title">
              <BookOutlined style={{ color: accentGold }} />
              <span>
                {viewMode
                  ? "Bản Ghi Phụng Vụ Chi Tiết (Lời Chúa)"
                  : editingId
                    ? "Cập Nhật Nội Dung Thánh Thư"
                    : "Soạn Thảo Văn Bản Phụng Vụ Mới"}
              </span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSave}
          width={1000}
          centered
          okText="Lưu dữ liệu"
          cancelText="Đóng"
          footer={
            viewMode
              ? [
                  <Button
                    key="close"
                    type="primary"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      backgroundColor: primaryNavy,
                      borderRadius: 8,
                      height: 38,
                      fontWeight: 600,
                      padding: "0 24px",
                    }}
                  >
                    Đóng cửa sổ đọc
                  </Button>,
                ]
              : undefined
          }
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
          <Form
            form={form}
            layout="vertical"
            disabled={viewMode}
            style={{ paddingTop: 12 }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  name="title"
                  label={
                    <Text strong className="form-field-label">
                      Tiêu đề / Đoạn trích *
                    </Text>
                  }
                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                >
                  <Input
                    placeholder="Ví dụ: Kinh Truyền Tin, Kinh Lạy Cha..."
                    className="custom-form-input"
                  />
                </Form.Item>

                <Form.Item
                  name="exam_session"
                  label={
                    <Text strong className="form-field-label">
                      Đợt khảo kinh
                    </Text>
                  }
                >
                  <Select
                    placeholder="Chọn đợt khảo kinh"
                    allowClear
                    className="custom-form-input"
                  >
                    <Option value="Đợt 1">Đợt 1</Option>
                    <Option value="Đợt 2">Đợt 2</Option>
                    <Option value="Đợt 3">Đợt 3</Option>
                    <Option value="Đợt 4">Đợt 4</Option>
                    <Option value="Chưa có đợt">Chưa có đợt</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="category"
                  label={
                    <Text strong className="form-field-label">
                      Chuyên mục phân loại *
                    </Text>
                  }
                  rules={[{ required: true, message: "Chọn một chuyên mục" }]}
                >
                  <Select
                    placeholder="Chọn loại phụng vụ"
                    className="custom-form-input"
                  >
                    <Option value="Tin Mừng">Tin Mừng Hằng Ngày</Option>
                    <Option value="Cựu Ước">Sách Cựu Ước</Option>
                    <Option value="Ý Cầu Nguyện">Ý Cầu Nguyện Phụng Vụ</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="author"
                  label={
                    <Text strong className="form-field-label">
                      Tác giả / Nguồn kinh điển
                    </Text>
                  }
                >
                  <Input
                    placeholder="Tên tác giả, Thánh sử..."
                    className="custom-form-input"
                  />
                </Form.Item>

                <div className="serif-notice-box">
                  <ReadOutlined
                    style={{ color: accentGold, marginTop: 3, fontSize: 16 }}
                  />
                  <Text
                    style={{
                      color: primaryNavy,
                      fontSize: 12,
                      lineHeight: "1.5",
                    }}
                  >
                    Văn bản hiển thị sử dụng phông chữ{" "}
                    <strong>Serif (Georgia)</strong> tiêu chuẩn, tối ưu trải
                    nghiệm đọc Kinh Thánh trang trọng như Sách Phụng Vụ.
                  </Text>
                </div>
              </Col>

              <Col span={16}>
                <Form.Item
                  name="content"
                  label={
                    <Text strong className="form-field-label">
                      <FileTextOutlined
                        style={{ color: accentGold, marginRight: 4 }}
                      />{" "}
                      Toàn văn nội dung chi tiết *
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Nội dung không được để trống" },
                  ]}
                >
                  <Input.TextArea
                    rows={16}
                    placeholder="Nhập văn bản Lời Chúa hoặc lời nguyện cầu tại đây..."
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.8",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      backgroundColor: viewMode ? softBg : "#ffffff",
                      color: primaryNavy,
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .prayer-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .prayer-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .prayer-header-section {
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

            .prayer-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .prayer-sub-title {
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

            .add-prayer-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Filter Card */
            .filter-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              margin-bottom: 20px;
              padding: 4px;
            }

            .custom-filter-input {
              border-radius: 10px !important;
              height: 40px !important;
            }

            .custom-filter-select .ant-select-selector {
              border-radius: 10px !important;
              height: 40px !important;
              display: flex;
              align-items: center;
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

            .gold-session-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 8px;
              font-weight: 600;
              font-size: 11px;
            }

            .action-btn-view:hover, .action-btn-edit:hover {
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

            .serif-notice-box {
              margin-top: 16px;
              padding: 12px 14px;
              background: ${softBg};
              border: 1px solid rgba(212, 175, 55, 0.3);
              border-radius: 10px;
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
}
