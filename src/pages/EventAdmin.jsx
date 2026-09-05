import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Switch,
  Space,
  message,
  Tag,
  Row,
  Col,
  Card,
  Divider,
  Typography,
  Tooltip,
  Drawer,
  Badge,
  Image,
  Statistic,
  Select,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  SnippetsOutlined,
  YoutubeOutlined,
  CompassOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEvent,
} from "../api/eventApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { useUser } from "../context/UserContext";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const EventAdmin = () => {
  const { user } = useUser();
  const allowRoles = ["admin", "priest", "media_manager"];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [content, setContent] = useState("");

  // Bộ lọc tìm kiếm
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [form] = Form.useForm();
  const API_URL = process.env.REACT_APP_API_URL;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // FETCH DATA
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getEvents();
      const data = res.data?.data || res.data;
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      message.error("Lỗi kết nối máy chủ tin tức!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // BỘ LỌC TRUY VẤN
  const filteredData = useMemo(() => {
    return events.filter((item) => {
      const matchSearch = item.title
        ?.toLowerCase()
        .includes(searchText.toLowerCase());
      const matchCat =
        filterCategory === "all" || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [events, searchText, filterCategory]);

  const categories = useMemo(() => {
    return ["all", ...new Set(events.map((e) => e.category).filter(Boolean))];
  }, [events]);

  // FORM HANDLERS
  const openCreate = () => {
    setEditing(null);
    setOpen(true);
    form.resetFields();
    setFileList([]);
    setContent("");
  };

  const handleEdit = (record) => {
    setEditing(record);
    setOpen(true);
    form.setFieldsValue({
      ...record,
      event_date: record.event_date
        ? dayjs(record.event_date).format("YYYY-MM-DD")
        : "",
    });
    setContent(record.full_content || "");
    if (record.images) {
      setFileList(
        record.images.map((img, i) => ({
          uid: `old-${i}`,
          name: img.split("/").pop(),
          status: "done",
          url: img.startsWith("http") ? img : `${API_URL}${img}`,
        })),
      );
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) =>
        formData.append(key, values[key] || ""),
      );
      formData.append("full_content", content);
      fileList.forEach((file) => {
        const raw = file.originFileObj || file;
        if (raw instanceof File) formData.append("images", raw);
      });

      if (editing) {
        await updateEvent(editing.id, formData);
        message.success("Cập nhật bài viết thành công!");
      } else {
        await createEvent(formData);
        message.success("Thêm bài viết mới thành công!");
      }
      setOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);

      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj || file);
    }

    setPreviewImage(file.url || file.preview || file.thumbUrl);

    setPreviewOpen(true);

    setPreviewTitle(
      file.name || file.url?.substring(file.url.lastIndexOf("/") + 1),
    );
  };
  // TABLE COLUMNS
  const columns = [
    {
      title: "Thông tin bài viết / Sự kiện",
      key: "content",
      width: "50%",
      render: (_, r) => (
        <Space size="middle">
          <Badge
            dot
            status={r.is_active ? "success" : "default"}
            offset={[-4, 48]}
          >
            <Image
              width={64}
              height={64}
              src={
                r.images?.[0]?.startsWith("http")
                  ? r.images[0]
                  : `${API_URL}${r.images?.[0]}`
              }
              fallback="https://placehold.co/64x64?text=No+Image"
              style={{
                borderRadius: 10,
                objectFit: "cover",
                border: "1px solid rgba(212, 175, 55, 0.3)",
              }}
              preview={false}
            />
          </Badge>

          <div style={{ maxWidth: 450 }}>
            <Text
              strong
              className="event-title-link"
              style={{
                fontSize: 15,
                color: primaryNavy,
                display: "block",
                marginBottom: 4,
              }}
            >
              {r.title}
            </Text>

            <Space size={6} style={{ fontSize: 12, flexWrap: "wrap" }}>
              <Tag className="gold-category-tag">
                {r.category || "Tin chung"}
              </Tag>
              <span style={{ color: "#64748b" }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {r.location || "Giáo xứ Đồng Quan"}
              </span>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Ngày tổ chức",
      dataIndex: "event_date",
      width: "18%",
      render: (date) => (
        <div style={{ lineHeight: "1.3" }}>
          <div style={{ fontWeight: 600, color: primaryNavy, fontSize: 13 }}>
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <Text type="secondary" style={{ fontSize: 11, color: "#94a3b8" }}>
            {dayjs(date).fromNow()}
          </Text>
        </div>
      ),
    },
    {
      title: "Hiển thị",
      dataIndex: "is_active",
      align: "center",
      width: "14%",
      render: (active, r) => (
        <div onClick={(e) => e.stopPropagation()}>
          {allowRoles.includes(user?.role) && (
            <Switch
              checked={active === 1}
              size="small"
              onChange={async (val) => {
                await toggleEvent(r.id, val ? 1 : 0);
                fetchEvents();
              }}
            />
          )}
          <div
            style={{
              fontSize: 10,
              marginTop: 4,
              fontWeight: 700,
              color: active ? "#2e7d32" : "#94a3b8",
            }}
          >
            {active ? "CÔNG KHAI" : "BẢN NHÁP"}
          </div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      align: "center",
      width: "18%",
      render: (_, r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Space size={4}>
            {allowRoles.includes(user?.role) && (
              <Tooltip title="Xem giao diện hiển thị">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />
                  }
                  onClick={() => {
                    setViewingEvent(r);
                    setIsPreviewOpen(true);
                  }}
                  className="action-btn-view"
                />
              </Tooltip>
            )}
            {allowRoles.includes(user?.role) && (
              <Tooltip title="Chỉnh sửa bài viết">
                <Button
                  type="text"
                  shape="circle"
                  icon={
                    <EditOutlined
                      style={{ color: primaryNavy, fontSize: 16 }}
                    />
                  }
                  onClick={() => handleEdit(r)}
                  className="action-btn-edit"
                />
              </Tooltip>
            )}
            {allowRoles.includes(user?.role) && (
              <PopconfirmModal
                onDelete={() => deleteEvent(r.id).then(fetchEvents)}
              />
            )}
          </Space>
        </div>
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
      <div className="event-editorial-layout">
        <div className="event-editorial-container">
          {/* HEADER BAR */}
          <div className="event-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined /> HỆ THỐNG TRUYỀN THÔNG MỤC VỤ
              </span>
              <Title level={2} className="event-main-title">
                BẢN TIN & SỰ KIỆN MỤC VỤ
              </Title>
              <Paragraph className="event-sub-title">
                Soạn thảo, phân loại tin tức thông báo và thiết lập tối ưu hóa
                cấu trúc tìm kiếm SEO.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchEvents}
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
                  onClick={openCreate}
                  className="add-event-btn"
                >
                  Viết Bài Mới
                </Button>
              )}
            </div>
          </div>

          {/* SYSTEM STATS BENTO GRID */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              {
                label: "Bài viết lưu trữ",
                value: events.length,
                icon: <FileTextOutlined className="stat-icon navy" />,
                border: "4px solid " + primaryNavy,
              },
              {
                label: "Bài đang hiển thị",
                value: events.filter((e) => e.is_active).length,
                icon: <CheckCircleOutlined className="stat-icon green" />,
                border: "4px solid #2e7d32",
              },
              {
                label: "Sự kiện sắp tới",
                value: events.filter((e) =>
                  dayjs(e.event_date).isAfter(dayjs()),
                ).length,
                icon: <ClockCircleOutlined className="stat-icon gold" />,
                border: "4px solid " + accentGold,
              },
            ].map((s, i) => (
              <Col xs={24} sm={8} key={i}>
                <Card
                  bordered={false}
                  className="stat-card"
                  style={{ borderLeft: s.border }}
                >
                  <Statistic
                    title={
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {s.label}
                      </Text>
                    }
                    value={s.value}
                    prefix={s.icon}
                    valueStyle={{
                      fontWeight: 700,
                      color: primaryNavy,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* CONTROL INTERACTIVE CARD */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={14}>
                <Input
                  placeholder="Tìm kiếm nhanh theo tiêu đề bài viết..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} sm={10}>
                <Select
                  placeholder="Lọc theo phân mục bài viết"
                  style={{ width: "100%" }}
                  value={filterCategory}
                  onChange={setFilterCategory}
                  className="custom-filter-select"
                >
                  {categories.map((c) => (
                    <Option key={c} value={c}>
                      {c === "all" ? "Tất cả danh mục bài viết" : c}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>

          {/* TABLE LOGISTIC AREA */}
          <Card bordered={false} className="main-table-card">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Tổng số: ${total} bài viết`,
                style: { marginTop: 20 },
              }}
              onRow={(record) => ({
                onClick: () => {
                  setViewingEvent(record);
                  setIsPreviewOpen(true);
                },
                style: { cursor: "pointer" },
              })}
              scroll={{ x: 800 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* MODAL: SOẠN THẢO VÀ CHỈNH SỬA BÀI VIẾT */}
        <Modal
          title={
            <div className="modal-custom-title">
              <SnippetsOutlined style={{ color: accentGold }} />
              <span>
                {editing ? "Cập Nhật Bài Viết Mục Vụ" : "Khởi Tạo Bài Viết Mới"}
              </span>
            </div>
          }
          open={open}
          onCancel={() => setOpen(false)}
          onOk={handleSubmit}
          width={1150}
          confirmLoading={submitting}
          centered
          okText="Lưu bài viết"
          cancelText="Đóng"
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
          <Form layout="vertical" form={form} style={{ paddingTop: 12 }}>
            <Row gutter={[24, 0]}>
              {/* KHU VỰC SOẠN THẢO CHÍNH */}
              <Col span={15}>
                <Form.Item
                  name="title"
                  label={
                    <Text strong className="form-field-label">
                      Tiêu đề bài viết *
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Tiêu đề không được trống" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tiêu đề sự kiện / bài viết..."
                    className="custom-form-input"
                  />
                </Form.Item>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="category"
                      label={
                        <Text strong className="form-field-label">
                          Phân mục hành chính
                        </Text>
                      }
                    >
                      <Select
                        placeholder="Chọn phân mục..."
                        className="custom-form-input"
                      >
                        <Option value="Thông báo chung">Thông báo chung</Option>
                        <Option value="Sự kiện mục vụ">Sự kiện mục vụ</Option>
                        <Option value="Tin giáo lý">Tin giáo lý</Option>
                        <Option value="Hoạt động giáo xứ">
                          Hoạt động giáo xứ
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="event_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày ghi nhận sự kiện
                        </Text>
                      }
                    >
                      <Input type="date" className="custom-form-input" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="location"
                      label={
                        <Text strong className="form-field-label">
                          Địa điểm tổ chức
                        </Text>
                      }
                    >
                      <Select
                        placeholder="Chọn địa điểm..."
                        allowClear
                        className="custom-form-input"
                        options={[
                          {
                            value: "Giáo xứ Đồng Quan",
                            label: "Giáo xứ Đồng Quan",
                          },
                          {
                            value: "Giáo họ Kinh Nhuế",
                            label: "Giáo họ Kinh Nhuế",
                          },
                          {
                            value: "Giáo họ Phụng Thượng",
                            label: "Giáo họ Phụng Thượng",
                          },
                          {
                            value: "Giáo họ Việt Hưng",
                            label: "Giáo họ Việt Hưng",
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="youtube_url"
                      label={
                        <Text strong className="form-field-label">
                          Link video YouTube (nếu có)
                        </Text>
                      }
                      rules={[
                        {
                          type: "url",
                          message: "Vui lòng nhập đúng định dạng URL!",
                        },
                      ]}
                    >
                      <Input
                        prefix={
                          <YoutubeOutlined style={{ color: "#ff0000" }} />
                        }
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Nội dung chi tiết bài viết
                    </Text>
                  }
                >
                  <div className="custom-ckeditor-wrapper">
                    <CKEditor
                      editor={ClassicEditor}
                      data={content}
                      onChange={(_, editor) => setContent(editor.getData())}
                    />
                  </div>
                </Form.Item>
              </Col>

              {/* PHẦN PHẢI: ANH VÀ SEO */}
              <Col span={9}>
                <Card
                  title={
                    <span
                      style={{
                        color: primaryNavy,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      <GlobalOutlined
                        style={{ color: accentGold, marginRight: 6 }}
                      />
                      Hình ảnh & Tối ưu hóa SEO
                    </span>
                  }
                  size="small"
                  bordered={false}
                  className="seo-config-card"
                >
                  <Dragger
                    listType="picture-card"
                    fileList={fileList}
                    multiple
                    accept="image/*"
                    beforeUpload={(file) => {
                      setFileList((prev) => [
                        ...prev,
                        {
                          uid: file.uid,
                          name: file.name,
                          status: "done",
                          originFileObj: file,
                          url: URL.createObjectURL(file),
                        },
                      ]);

                      return false;
                    }}
                    onRemove={(file) =>
                      setFileList((prev) =>
                        prev.filter((f) => f.uid !== file.uid),
                      )
                    }
                    onPreview={handlePreview}
                    className="custom-dragger-uploader"
                  >
                    <p className="ant-upload-drag-icon">
                      <PictureOutlined
                        style={{
                          color: accentGold,
                          fontSize: 32,
                        }}
                      />
                    </p>

                    <p
                      style={{
                        fontSize: 12,
                        color: primaryNavy,
                        fontWeight: 600,
                        margin: "4px 0 2px",
                      }}
                    >
                      Kéo thả hoặc chọn nhiều ảnh bài viết
                    </p>
                  </Dragger>

                  <Divider style={{ margin: "16px 0" }} />

                  <Button
                    block
                    icon={<ThunderboltOutlined />}
                    className="auto-seo-btn"
                    onClick={() => {
                      const title = form.getFieldValue("title");
                      if (!title)
                        return message.warning(
                          "Vui lòng điền tiêu đề trước để AI tạo thẻ SEO!",
                        );
                      const plainText = stripHtml(content)
                        .replace(/\s+/g, " ")
                        .trim();
                      form.setFieldsValue({
                        meta_title: `${title} | Giáo xứ Đồng Quan`.substring(
                          0,
                          70,
                        ),
                        meta_desc: plainText.substring(0, 150),
                      });
                      message.success("Đã tự động khởi tạo cấu trúc thẻ SEO!");
                    }}
                  >
                    Tự động khởi tạo thẻ SEO
                  </Button>

                  <Form.Item
                    name="meta_title"
                    label={
                      <Text strong className="form-field-label">
                        SEO Title (Tiêu đề Google)
                      </Text>
                    }
                    style={{ marginTop: 14 }}
                  >
                    <Input
                      placeholder="Tối đa 70 ký tự..."
                      className="custom-form-input"
                    />
                  </Form.Item>

                  <Form.Item
                    name="meta_desc"
                    label={
                      <Text strong className="form-field-label">
                        SEO Description (Thẻ mô tả tóm tắt)
                      </Text>
                    }
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Tóm tắt ngắn gọn nội dung cốt lõi bài viết..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
          width={900}
        >
          <img
            alt={previewTitle}
            style={{
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
            }}
            src={previewImage}
          />
        </Modal>
        {/* DRAWER: XEM TRƯỚC BÀI VIẾT */}
        <Drawer
          title={
            <div className="drawer-title-box">
              <EyeOutlined style={{ color: accentGold }} />
              <span>Xem Trước Bản Tin Chi Tiết</span>
            </div>
          }
          width={760}
          onClose={() => setIsPreviewOpen(false)}
          open={isPreviewOpen}
          className="editorial-drawer"
        >
          {viewingEvent && (
            <div>
              {/* HERO COVER */}
              {viewingEvent.images && viewingEvent.images.length > 0 ? (
                <div className="preview-hero-container">
                  <Image
                    src={
                      viewingEvent.images[0].startsWith("http")
                        ? viewingEvent.images[0]
                        : `${API_URL}${viewingEvent.images[0]}`
                    }
                    alt="Hero Cover"
                    className="preview-hero-img"
                    preview={false}
                  />
                </div>
              ) : (
                <div className="preview-no-img-box">
                  <Text type="secondary" italic>
                    <PictureOutlined /> Sự kiện này không có ảnh đại diện
                  </Text>
                </div>
              )}

              {/* NỘI DUNG CHÍNH */}
              <div style={{ padding: "28px 32px" }}>
                <Tag className="gold-category-tag" style={{ marginBottom: 12 }}>
                  {viewingEvent.category || "TIN SỰ KIỆN"}
                </Tag>

                <Title level={3} className="preview-event-title">
                  {viewingEvent.title}
                </Title>

                <Space
                  split={<Divider type="vertical" />}
                  style={{
                    color: "#64748b",
                    fontSize: 13,
                    marginBottom: 20,
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    <CalendarOutlined
                      style={{ marginRight: 4, color: primaryNavy }}
                    />
                    {dayjs(viewingEvent.event_date).format(
                      "DD [Tháng] MM, YYYY",
                    )}
                  </span>
                  <span>
                    <EnvironmentOutlined
                      style={{ marginRight: 4, color: primaryNavy }}
                    />
                    {viewingEvent.location || "Giáo xứ Đồng Quan"}
                  </span>
                  {viewingEvent.is_active === 1 ? (
                    <Badge
                      status="success"
                      text={
                        <span style={{ color: "#2e7d32", fontWeight: 600 }}>
                          Đang phát hành
                        </span>
                      }
                    />
                  ) : (
                    <Badge status="default" text="Bản lưu nháp" />
                  )}
                </Space>

                <Divider style={{ margin: "16px 0 24px" }} />

                {/* HTML CONTENT RENDER */}
                <div
                  className="ck-content html-render-container"
                  dangerouslySetInnerHTML={{
                    __html: viewingEvent.full_content,
                  }}
                />

                {/* ALBUM ẢNH ĐÍNH KÈM */}
                {viewingEvent.images && viewingEvent.images.length > 1 && (
                  <div className="preview-album-box">
                    <Text
                      strong
                      style={{
                        display: "block",
                        marginBottom: 14,
                        color: primaryNavy,
                      }}
                    >
                      <PictureOutlined
                        style={{ marginRight: 6, color: accentGold }}
                      />
                      Thư viện ảnh đính kèm ({viewingEvent.images.length})
                    </Text>
                    <Image.PreviewGroup>
                      <Row gutter={[10, 10]}>
                        {viewingEvent.images.map((img, idx) => (
                          <Col span={6} key={idx}>
                            <Image
                              src={
                                img.startsWith("http")
                                  ? img
                                  : `${API_URL}${img}`
                              }
                              style={{
                                borderRadius: 8,
                                height: 90,
                                width: "100%",
                                objectFit: "cover",
                                border: "1px solid rgba(212, 175, 55, 0.3)",
                              }}
                            />
                          </Col>
                        ))}
                      </Row>
                    </Image.PreviewGroup>
                  </div>
                )}
              </div>
            </div>
          )}
        </Drawer>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .event-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .event-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .event-header-section {
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

            .event-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .event-sub-title {
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

            .add-event-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            /* Stats Bento Cards */
            .stat-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
            }

            .stat-icon {
              margin-right: 8px;
            }
            .stat-icon.navy { color: ${primaryNavy}; }
            .stat-icon.gold { color: ${accentGold}; }
            .stat-icon.green { color: #2e7d32; }

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

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-weight: 600;
              font-size: 11px;
            }

            .event-title-link:hover {
              color: ${accentGold} !important;
            }

            .action-btn-view:hover, .action-btn-edit:hover {
              background: rgba(27, 54, 93, 0.1) !important;
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

            .custom-ckeditor-wrapper .ck-editor__editable_inline {
              min-height: 240px;
              border-radius: 0 0 10px 10px !important;
            }

            .seo-config-card {
              border-radius: 12px !important;
              background: ${softBg} !important;
              border: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .custom-dragger-uploader {
              background: #ffffff !important;
              border: 1px dashed ${accentGold} !important;
              border-radius: 12px !important;
            }

            .auto-seo-btn {
              font-weight: 600;
              color: ${primaryNavy} !important;
              border-color: ${accentGold} !important;
              background: #fffdf5 !important;
              border-radius: 8px !important;
            }

            /* Drawer Preview Style */
            .preview-hero-container {
              width: 100%;
              height: 320px;
              overflow: hidden;
              background: ${softBg};
              border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            }

            .preview-hero-img {
              width: 100%;
              height: 320px;
              object-fit: cover;
            }

            .preview-no-img-box {
              width: 100%;
              height: 140px;
              background: ${softBg};
              display: flex;
              align-items: center;
              justify-content: center;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1);
            }

            .preview-event-title {
              color: ${primaryNavy} !important;
              font-family: 'Playfair Display', serif !important;
              font-weight: 700 !important;
              margin-top: 0 !important;
              line-height: 1.4 !important;
            }

            .html-render-container {
              font-size: 15px;
              line-height: 1.8;
              color: ${textDark};
            }

            .html-render-container img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
            }

            .preview-album-box {
              margin-top: 36px;
              padding: 20px;
              background: ${softBg};
              border-radius: 14px;
              border: 1px solid rgba(212, 175, 55, 0.3);
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

// Component con Popconfirm tinh gọn
const PopconfirmModal = ({ onDelete }) => {
  return (
    <Button
      type="text"
      danger
      shape="circle"
      icon={<DeleteOutlined style={{ fontSize: 16 }} />}
      onClick={() => {
        Modal.confirm({
          title: "Xác nhận xóa bài viết?",
          content:
            "Dữ liệu bài đăng sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống cơ sở dữ liệu.",
          okText: "Đồng ý xóa",
          okType: "danger",
          cancelText: "Hủy thao tác",
          onOk: onDelete,
          centered: true,
        });
      }}
    />
  );
};

export default EventAdmin;
