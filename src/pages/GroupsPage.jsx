import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  ColorPicker,
  Upload,
  Space,
  Row,
  Col,
  Typography,
  Popconfirm,
  message,
  Card,
  Tag,
  Divider,
  Badge,
  Avatar,
  ConfigProvider,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  BgColorsOutlined,
  FileTextOutlined,
  RocketOutlined,
  HistoryOutlined,
  CompassOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getGroups,
  getGroupDetail,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../api/groupApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const GroupPage = () => {
  const [form] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const API_URL = process.env.REACT_APP_API_URL || "";

  /* FETCH DATA */
  const fetchData = useCallback(
    async (page = 1, searchText = search) => {
      setLoading(true);
      try {
        const res = await getGroups({ page, search: searchText });
        setGroups(res.data?.data || []);
        setPagination({
          current: page,
          pageSize: res.data?.pagination?.perPage || 10,
          total: res.data?.pagination?.total || 0,
        });
      } catch (error) {
        message.error("Lỗi đồng bộ dữ liệu từ máy chủ Giáo phận!");
      } finally {
        setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* SUBMIT HANDLER */
  const onFinish = async (values) => {
    const formData = new FormData();

    Object.keys(values).forEach((key) => {
      if (key === "image") {
        const fileObj = values.image?.[0]?.originFileObj;
        if (fileObj) formData.append("image", fileObj);
        return;
      }

      if (key === "color") {
        if (!values.color) return;
        const colorValue =
          typeof values.color === "string"
            ? values.color
            : values.color.toHexString();
        formData.append("color", colorValue);
        return;
      }

      if (key === "missions" || key === "timeline") {
        formData.append(key, JSON.stringify(values[key] || []));
        return;
      }

      if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    });

    try {
      if (editingId) {
        await updateGroup(editingId, formData);
        message.success("Cập nhật thông tin hội đoàn thành công!");
      } else {
        await createGroup(formData);
        message.success("Khởi tạo hội đoàn mới thành công!");
      }

      setShowModal(false);
      form.resetFields();
      setEditingId(null);
      fetchData(pagination.current);
    } catch (error) {
      console.error(error);
      message.error("Thao tác xử lý hồ sơ thất bại!");
    }
  };

  /* EDIT HANDLER */
  const handleEdit = async (slug) => {
    setLoading(true);
    try {
      const res = await getGroupDetail(slug);
      const data = res.data?.data;
      setEditingId(data.id);

      form.setFieldsValue({
        ...data,
        color: data.color || accentGold,
        image: data.image
          ? [
              {
                uid: "-1",
                name: "avatar_group.png",
                status: "done",
                url: `${API_URL}${data.image}`,
              },
            ]
          : [],
        missions:
          typeof data.missions === "string"
            ? JSON.parse(data.missions)
            : data.missions || [],
        timeline:
          typeof data.timeline === "string"
            ? JSON.parse(data.timeline)
            : data.timeline || [],
      });

      setShowModal(true);
    } catch (error) {
      message.error("Không thể tải chi tiết hồ sơ hội đoàn!");
    } finally {
      setLoading(false);
    }
  };

  /* DELETE HANDLER */
  const handleDelete = async (id) => {
    try {
      await deleteGroup(id);
      message.success("Đã xóa hội đoàn ra khỏi danh mục.");
      fetchData(pagination.current);
    } catch {
      message.error("Gỡ bỏ thông tin thất bại!");
    }
  };

  /* TABLE COLUMNS */
  const columns = [
    {
      title: "Thông tin Hội đoàn",
      key: "group_identity",
      width: "35%",
      render: (_, r) => (
        <Space size="middle">
          <Badge
            count={r.founding_year || "N/A"}
            overflowCount={3000}
            style={{
              backgroundColor: primaryNavy,
              color: "#fff",
              fontSize: "10px",
              fontWeight: 700,
              boxShadow: "none",
            }}
          >
            <Avatar
              shape="square"
              size={54}
              src={r.image ? `${API_URL}${r.image}` : null}
              icon={!r.image && <TeamOutlined />}
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.12)",
                color: primaryNavy,
                borderRadius: "10px",
                border: "1px solid " + accentGold,
              }}
            />
          </Badge>

          <div>
            <Text strong style={{ fontSize: "15px", color: primaryNavy }}>
              {r.name}
            </Text>

            <div style={{ marginTop: 2 }}>
              <Tag className="gold-slug-tag">/{r.slug}</Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Đấng Thánh Bảo Trợ",
      dataIndex: "patron",
      width: "20%",
      render: (text) => (
        <span style={{ fontWeight: 600, color: textDark }}>
          {text ? `Thánh ${text.replace(/Thánh /i, "")}` : "---"}
        </span>
      ),
    },
    {
      title: "Nhân số (Đoàn viên)",
      dataIndex: "members_count",
      width: "20%",
      align: "center",
      render: (count) => (
        <Tag className="members-count-pill">
          <TeamOutlined style={{ marginRight: 4 }} /> {count || 0} đoàn viên
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: "15%",
      render: (_, record) => (
        <Space size="small" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Chỉnh sửa hồ sơ">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => handleEdit(record.slug)}
              className="action-btn-edit"
            />
          </Tooltip>

          <Popconfirm
            title="Xác nhận xóa hội đoàn?"
            description="Dữ liệu về lịch sử hành trình và sứ mệnh hội đoàn này sẽ bị xóa."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa dữ liệu"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa hội đoàn">
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
      <div className="group-editorial-layout">
        <div className="group-editorial-container">
          {/* CONTROL DASHBOARD HEADER */}
          <div className="group-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG PHONG TRÀO MỤC VỤ
              </span>
              <Title level={2} className="group-main-title">
                QUẢN LÝ HỘI ĐOÀN GIÁO XỨ
              </Title>
              <Paragraph className="group-sub-title">
                Lưu trữ hồ sơ các phong trào, hội đoàn, danh sách nhân số đoàn
                viên và ban trị sự.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchData(pagination.current)}
                loading={loading}
                className="refresh-btn"
                style={{ marginRight: 10 }}
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  form.resetFields();
                  setEditingId(null);
                  setShowModal(true);
                }}
                className="add-group-btn"
              >
                Thêm Hội Đoàn Mới
              </Button>
            </div>
          </div>

          {/* TABLE LOGISTIC WRAPPER */}
          <Card bordered={false} className="main-table-card">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                marginBottom: 20,
              }}
            >
              <Input
                placeholder="Tìm nhanh theo tên hội đoàn hoặc thánh bảo trợ..."
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                style={{ width: 380 }}
                allowClear
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={() => fetchData(1)}
                className="custom-search-input"
              />
            </div>

            <Table
              columns={columns}
              dataSource={groups}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                onChange: (page) => fetchData(page),
                showTotal: (total) => `Tổng số: ${total} đoàn thể`,
                style: { marginTop: 20 },
              }}
              scroll={{ x: 800 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* MODAL: SOẠN THẢO VÀ CẬP NHẬT DỮ LIỆU HỘI ĐOÀN */}
        <Modal
          title={
            <div className="modal-custom-title">
              <TeamOutlined style={{ color: accentGold }} />
              <span>
                {editingId
                  ? "Cập Nhật Hồ Sơ Hội Đoàn"
                  : "Khai Báo Thành Lập Hội Đoàn Mới"}
              </span>
            </div>
          }
          open={showModal}
          onCancel={() => {
            setShowModal(false);
            form.resetFields();
            setEditingId(null);
          }}
          onOk={() => form.submit()}
          width={880}
          centered
          okText="Lưu hồ sơ"
          cancelText="Hủy bỏ"
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
            onFinish={onFinish}
            style={{ paddingTop: 12 }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label={
                    <Text strong className="form-field-label">
                      Tên hội đoàn danh xưng *
                    </Text>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng ghi danh xưng đoàn thể",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Ban Thanh Niên Thánh Martino..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="patron"
                  label={
                    <Text strong className="form-field-label">
                      Thánh Quan Thầy Bảo Trợ
                    </Text>
                  }
                >
                  <Input
                    placeholder="Ví dụ: Thánh Matino..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16} align="middle">
              <Col span={6}>
                <Form.Item
                  name="members_count"
                  label={
                    <Text strong className="form-field-label">
                      Nhân số hiện tại
                    </Text>
                  }
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="50"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="founding_year"
                  label={
                    <Text strong className="form-field-label">
                      Năm thành lập
                    </Text>
                  }
                >
                  <InputNumber
                    min={1000}
                    max={2100}
                    style={{ width: "100%" }}
                    placeholder="2020"
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="color"
                  label={
                    <Text strong className="form-field-label">
                      Màu cờ sắc phục
                    </Text>
                  }
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <ColorPicker defaultValue={accentGold} />
                    <BgColorsOutlined
                      style={{ color: primaryNavy, fontSize: 18 }}
                    />
                  </div>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  name="image"
                  label={
                    <Text strong className="form-field-label">
                      Logo / Ảnh biểu trưng
                    </Text>
                  }
                  valuePropName="fileList"
                  getValueFromEvent={(e) =>
                    Array.isArray(e) ? e : e?.fileList
                  }
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={() => false}
                    listType="picture"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      style={{ width: "100%", borderRadius: 8 }}
                    >
                      Chọn file ảnh
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label={
                <Text strong className="form-field-label">
                  <FileTextOutlined
                    style={{ marginRight: 4, color: accentGold }}
                  />{" "}
                  Mô tả tôn chỉ hoạt động
                </Text>
              }
            >
              <TextArea
                rows={4}
                placeholder="Nhập tóm tắt lịch sử hình thành, nhiệm vụ và các giờ sinh hoạt định kỳ..."
                className="custom-form-input"
              />
            </Form.Item>

            {/* SỨ MỆNH HOẠT ĐỘNG */}
            <Divider orientation="left" plain>
              <span
                style={{ color: primaryNavy, fontWeight: 700, fontSize: 13 }}
              >
                <RocketOutlined style={{ marginRight: 6, color: accentGold }} />{" "}
                Sứ Mệnh & Tôn Chỉ Cốt Lõi
              </span>
            </Divider>

            <Form.List name="missions">
              {(fields, { add, remove }) => (
                <div style={{ padding: "0 4px" }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{ display: "flex", marginBottom: 8 }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name]}
                        rules={[
                          {
                            required: true,
                            message: "Không để trống mục tôn chỉ",
                          },
                        ]}
                        style={{ margin: 0 }}
                      >
                        <Input
                          placeholder="Ví dụ: Đào sâu đời sống thiêng liêng qua cầu nguyện và Lời Chúa..."
                          style={{ width: 780 }}
                          className="custom-form-input"
                        />
                      </Form.Item>

                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        style={{ color: "#ef4444", fontSize: 16 }}
                      />
                    </Space>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{
                      marginTop: 8,
                      color: primaryNavy,
                      borderColor: accentGold,
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Thêm dòng Sứ mệnh mục vụ
                  </Button>
                </div>
              )}
            </Form.List>

            {/* DÒNG THỜI GIAN LỊCH SỬ */}
            <Divider orientation="left" plain>
              <span
                style={{ color: primaryNavy, fontWeight: 700, fontSize: 13 }}
              >
                <HistoryOutlined
                  style={{ marginRight: 6, color: accentGold }}
                />{" "}
                Các Mốc Lịch Sử Phát Triển (Timeline)
              </span>
            </Divider>

            <Form.List name="timeline">
              {(fields, { add, remove }) => (
                <div style={{ padding: "0 4px" }}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row
                      key={key}
                      gutter={12}
                      align="middle"
                      style={{ marginBottom: 8 }}
                    >
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, "year"]}
                          rules={[{ required: true, message: "Nhập năm" }]}
                          style={{ margin: 0 }}
                        >
                          <Input
                            prefix={
                              <CalendarOutlined style={{ color: accentGold }} />
                            }
                            placeholder="Năm"
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={17}>
                        <Form.Item
                          {...restField}
                          name={[name, "event"]}
                          rules={[
                            {
                              required: true,
                              message: "Ghi nhận sự kiện chính",
                            },
                          ]}
                          style={{ margin: 0 }}
                        >
                          <Input
                            placeholder="Sự kiện: Tổ chức lễ ra mắt hội đoàn..."
                            className="custom-form-input"
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2} style={{ textAlign: "center" }}>
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ color: "#ef4444", fontSize: "16px" }}
                        />
                      </Col>
                    </Row>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{
                      marginTop: 8,
                      color: primaryNavy,
                      borderColor: accentGold,
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    Thêm cột mốc lịch sử biến cố
                  </Button>
                </div>
              )}
            </Form.List>
          </Form>
        </Modal>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .group-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .group-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .group-header-section {
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

            .group-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .group-sub-title {
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

            .add-group-btn {
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

            .custom-search-input {
              border-radius: 10px !important;
              height: 40px !important;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-slug-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
            }

            .members-count-pill {
              background: rgba(27, 54, 93, 0.06) !important;
              color: ${primaryNavy} !important;
              border: none !important;
              font-weight: 700;
              border-radius: 12px;
              padding: 2px 12px;
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
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default GroupPage;
