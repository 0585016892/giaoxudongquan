import React, { useEffect, useState, useMemo } from "react";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  ConfigProvider,
  Spin,
  Empty,
  Badge,
  Popconfirm,
  List,
  Avatar,
  Tooltip,
  Segmented,
  message,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
} from "antd";

import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  NotificationOutlined,
  PlusOutlined,
  CalendarOutlined,
  PieChartOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarFilled,
  RobotOutlined,
  UserOutlined,
  PictureOutlined,
  BookOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import {
  getNotifications,
  getNotificationsToday,
  getNotificationStats,
  getNotificationById,
  createNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications, // <-- Nhớ khai báo/export hàm này trong file notificationApi.js
} from "../api/notificationApi";

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 1. ÁNH XẠ TOÀN BỘ 22 LOẠI TYPE THỰC TẾ SANG TIẾNG VIỆT
const TYPE_MAP = {
  CREATE_EVENT: "Sự kiện mới",
  UPDATE_EVENT: "Cập nhật sự kiện",
  EVENT_STATUS: "Trạng thái sự kiện",

  TODAY_MASS: "Thánh lễ hôm nay",

  AI_TRAINING: "Huấn luyện AI (RAG)",

  SLIDE_CREATE: "Tạo Slide mới",
  SLIDE_UPDATE: "Cập nhật Slide",
  SLIDE_DELETE: "Xóa Slide",
  SLIDE_STATUS: "Trạng thái Slide",

  NEW_ADMIN: "Quản trị viên mới",
  CREATE_ADMIN: "Tạo Quản trị viên",
  UPDATE_ADMIN: "Cập nhật Quản trị viên",
  DELETE_ADMIN: "Xóa Quản trị viên",
  RESET_PASSWORD: "Đặt lại mật khẩu",

  TOGGLE_ACTIVE: "Chuyển trạng thái",
  CHURCH_STATUS: "Trạng thái Giáo xứ/Họ",

  CREATE_PRAYER: "Tạo Kinh nguyện",
  DELETE_PRAYER: "Xóa Kinh nguyện",

  CREATE_GROUP: "Tạo Hội đoàn",
  UPDATE_GROUP: "Cập nhật Hội đoàn",
  DELETE_GROUP: "Xóa Hội đoàn",

  PARISHIONER_UPDATE: "Cập nhật Giáo dân",
};

const getTranslatedType = (type) => {
  if (!type) return "Thông báo Mục Vụ";
  return TYPE_MAP[type.toUpperCase()] || type;
};

const NotificationPage = () => {
  // Bảng màu Truyền Thống & Tôn Nghiêm (Sacred Editorial)
  const primaryNavy = "#1B365D"; // Xanh Đêm Navy
  const accentGold = "#D4AF37"; // Vàng Đồng Ánh Kim
  const textDark = "#1E293B";
  const softBg = "#FAFAFA";

  // Data States
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, today: 0 });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Bộ lọc States
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'today' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState("all");

  // State Modal Chi tiết & Modal Tạo mới
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Trung Tâm Thông Báo | Giáo xứ Đồng Quan";
    fetchAllData();
  }, []);

  // 1. LẤY DỮ LIỆU BAN ĐẦU (ALL & STATS)
  const fetchAllData = async () => {
    try {
      setLoading(true);

      const [resAll, resStats] = await Promise.allSettled([
        getNotifications(),
        getNotificationStats(),
      ]);

      const allData =
        resAll.status === "fulfilled"
          ? resAll.value?.data?.data || resAll.value?.data || []
          : [];

      const statsData =
        resStats.status === "fulfilled"
          ? resStats.value?.data?.data || resStats.value?.data || {}
          : {};

      setNotifications(Array.isArray(allData) ? allData : []);
      setStats({
        total: statsData.total || allData.length,
        unread:
          statsData.unread ||
          allData.filter((n) => Number(n.is_read) === 0).length,
        today: statsData.today || 0,
      });
    } catch (err) {
      console.error("Lỗi lấy danh sách thông báo:", err);
      message.error("Không thể tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách Thông báo Hôm nay từ API
  const fetchTodayOnly = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsToday();
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi tải thông báo hôm nay:", err);
      message.error("Lỗi tải thông báo hôm nay!");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chuyển tab trạng thái
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    if (value === "today") {
      fetchTodayOnly();
    } else if (statusFilter === "today") {
      fetchAllData();
    }
  };

  // 2. XEM CHI TIẾT THÔNG BÁO & TỰ ĐỘNG ĐÁNH DẤU ĐÃ ĐỌC
  const handleViewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const res = await getNotificationById(id);
      const detail = res?.data?.data || res?.data || null;
      setSelectedNoti(detail);

      if (detail && Number(detail.is_read) === 0) {
        handleMarkAsRead(id, false);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết thông báo:", err);
      message.error("Không thể tải nội dung chi tiết!");
    } finally {
      setDetailLoading(false);
    }
  };

  // 3. ĐÁNH DẤU 1 THÔNG BÁO ĐÃ ĐỌC
  const handleMarkAsRead = async (id, showMsg = true) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
      setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));

      if (showMsg) message.success("Đã đánh dấu đã đọc!");
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  // 4. ĐÁNH DẤU TẤT CẢ ĐÃ ĐỌC
  const handleMarkAllRead = async () => {
    try {
      setActionLoading(true);
      await markAllNotificationsAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setStats((prev) => ({ ...prev, unread: 0 }));
      message.success("Đã đánh dấu tất cả thông báo là đã đọc!");
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", err);
      message.error(err?.response?.data?.message || "Lỗi thao tác!");
    } finally {
      setActionLoading(false);
    }
  };

  // 5. XÓA 1 THÔNG BÁO
  const handleDeleteNoti = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      message.success("Đã xóa thông báo!");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      if (selectedNoti?.id === id) setSelectedNoti(null);
    } catch (err) {
      console.error("Lỗi xóa thông báo:", err);
      message.error("Không thể xóa thông báo này!");
    }
  };

  // 6. XÓA TẤT CẢ THÔNG BÁO
  const handleDeleteAll = () => {
    Modal.confirm({
      title: "Xác nhận xóa toàn bộ thông báo?",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content:
        "Thao tác này sẽ xóa vĩnh viễn tất cả thông báo hiện có và không thể khôi phục.",
      okText: "Xóa toàn bộ",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setActionLoading(true);
          await deleteAllNotifications();
          setNotifications([]);
          setStats({ total: 0, unread: 0, today: 0 });
          setSelectedNoti(null);
          message.success("Đã xóa toàn bộ thông báo thành công!");
        } catch (err) {
          console.error("Lỗi xóa tất cả thông báo:", err);
          message.error(
            err?.response?.data?.message || "Không thể xóa tất cả thông báo!",
          );
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // 7. TẠO THÔNG BÁO MỚI (ADMIN)
  const handleCreateNotification = async (values) => {
    try {
      setSubmitting(true);
      await createNotification({
        title: values.title,
        content: values.content,
        type: values.type || "CREATE_EVENT",
        related_type: values.related_type || "events",
        related_id: values.related_id ? Number(values.related_id) : null,
        target_role: values.target_role || null,
      });

      message.success("Đã tạo và gửi thông báo thành công!");
      setIsCreateModalOpen(false);
      form.resetFields();
      fetchAllData();
    } catch (err) {
      console.error("Lỗi tạo thông báo:", err);
      message.error(err?.response?.data?.message || "Không thể gửi thông báo!");
    } finally {
      setSubmitting(false);
    }
  };

  // Danh sách các loại type duy nhất để hiện ở Select lọc
  const typeOptions = useMemo(() => {
    const types = [
      ...new Set(notifications.map((n) => n.type).filter(Boolean)),
    ];
    return [
      { label: "Tất cả loại thông báo", value: "all" },
      ...types.map((t) => ({
        label: getTranslatedType(t),
        value: t,
      })),
    ];
  }, [notifications]);

  // BỘ LỌC ĐA CHIỀU (TỪ KHÓA + TRẠNG THÁI + LOẠI THÔNG BÁO)
  const filteredList = useMemo(() => {
    return notifications.filter((item) => {
      const kw = keyword.toLowerCase();
      const matchKeyword =
        !keyword ||
        item.title?.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw);

      const isRead = Number(item.is_read) === 1;
      let matchStatus = true;
      if (statusFilter === "unread") matchStatus = !isRead;
      if (statusFilter === "read") matchStatus = isRead;

      let matchType = true;
      if (typeFilter !== "all") matchType = item.type === typeFilter;

      return matchKeyword && matchStatus && matchType;
    });
  }, [notifications, keyword, statusFilter, typeFilter]);

  // HELPER RENDER ICON TỰ ĐỘNG CHO TOÀN BỘ TYPES
  const renderIcon = (type, relatedType) => {
    const t = (type || relatedType || "").toUpperCase();

    if (t.includes("EVENT")) {
      return (
        <Avatar
          style={{ backgroundColor: primaryNavy }}
          icon={<CalendarFilled />}
        />
      );
    }
    if (t.includes("MASS") || t.includes("LỄ")) {
      return (
        <Avatar
          style={{ backgroundColor: "#8b5cf6" }}
          icon={<CalendarOutlined />}
        />
      );
    }
    if (t.includes("AI_TRAINING") || t.includes("RAG")) {
      return (
        <Avatar
          style={{ backgroundColor: "#10b981" }}
          icon={<RobotOutlined />}
        />
      );
    }
    if (t.includes("SLIDE")) {
      return (
        <Avatar
          style={{ backgroundColor: "#0284c7" }}
          icon={<PictureOutlined />}
        />
      );
    }
    if (t.includes("ADMIN") || t.includes("PASSWORD")) {
      return (
        <Avatar
          style={{ backgroundColor: "#e11d48" }}
          icon={<SafetyCertificateOutlined />}
        />
      );
    }
    if (t.includes("PRAYER")) {
      return (
        <Avatar
          style={{ backgroundColor: accentGold }}
          icon={<BookOutlined />}
        />
      );
    }
    if (t.includes("GROUP")) {
      return (
        <Avatar
          style={{ backgroundColor: "#d97706" }}
          icon={<TeamOutlined />}
        />
      );
    }
    if (t.includes("PARISHIONER")) {
      return (
        <Avatar
          style={{ backgroundColor: "#2563eb" }}
          icon={<UserOutlined />}
        />
      );
    }
    return (
      <Avatar style={{ backgroundColor: accentGold }} icon={<BellOutlined />} />
    );
  };

  // Helper Format Ngày Tháng
  const formatDate = (dateStr) => {
    if (!dateStr) return "Vừa xong";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

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
      <Layout className="noti-page-root">
        <Content className="noti-page-wrapper">
          <div className="noti-page-container">
            {/* HEADER TRANG */}
            <div className="noti-header">
              <div>
                <span className="noti-tag-sacred">
                  <NotificationOutlined /> TRUNG TÂM THÔNG BÁO MỤC VỤ
                </span>
                <Title level={2} className="noti-title">
                  Quản Lý & Tin Tức Giáo Xứ
                </Title>
                <div className="gold-accent-divider" />
                <Paragraph className="noti-subtitle">
                  Theo dõi tin tức sự kiện, lịch phụng vụ và các thông báo chính
                  thức từ Giáo xứ Đồng Quan.
                </Paragraph>
              </div>

              <Space wrap size="middle" style={{ marginTop: 12 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="create-btn"
                >
                  Tạo Thông Báo Mới
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchAllData}
                  loading={loading}
                  className="reload-btn"
                >
                  Làm mới
                </Button>
              </Space>
            </div>

            {/* DASHBOARD THỐNG KÊ NHANH */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={8}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={<span className="stat-label">TỔNG THÔNG BÁO</span>}
                    value={stats.total}
                    prefix={
                      <PieChartOutlined
                        style={{ color: primaryNavy, marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={<span className="stat-label">CHƯA ĐỌC</span>}
                    value={stats.unread}
                    prefix={
                      <BellOutlined
                        style={{ color: "#e74c3c", marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: "#e74c3c", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={
                      <span className="stat-label">THÔNG BÁO HÔM NAY</span>
                    }
                    value={stats.today}
                    prefix={
                      <CalendarOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* CARD BỘ LỌC ĐA NĂNG */}
            <Card bordered={false} className="noti-action-card">
              <Row gutter={[16, 16]} align="middle">
                {/* 1. Tìm kiếm theo từ khóa */}
                <Col xs={24} md={7}>
                  <Search
                    placeholder="Tìm theo tiêu đề, nội dung..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </Col>

                {/* 2. Lọc loại thông báo (Type) */}
                <Col xs={24} sm={12} md={5}>
                  <Select
                    style={{ width: "100%" }}
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={typeOptions}
                  />
                </Col>

                {/* 3. Phân loại trạng thái đọc & Nút Thao tác hàng loạt */}
                <Col xs={24} sm={12} md={12} style={{ textAlign: "right" }}>
                  <Space wrap justify="end">
                    <Segmented
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      options={[
                        { label: `Tất cả`, value: "all" },
                        { label: `Hôm nay`, value: "today" },
                        {
                          label: `Chưa đọc (${stats.unread})`,
                          value: "unread",
                        },
                      ]}
                    />

                    <Button
                      type="link"
                      icon={<CheckOutlined />}
                      onClick={handleMarkAllRead}
                      loading={actionLoading}
                      disabled={stats.unread === 0}
                      style={{ color: primaryNavy, fontWeight: 600 }}
                    >
                      Đã đọc tất cả
                    </Button>

                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={handleDeleteAll}
                      loading={actionLoading}
                      disabled={notifications.length === 0}
                      style={{ fontWeight: 600 }}
                    >
                      Xóa tất cả
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* DANH SÁCH THÔNG BÁO */}
            <Card bordered={false} className="noti-list-card">
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <Spin size="large" tip="Đang tải danh sách thông báo..." />
                </div>
              ) : filteredList.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không tìm thấy thông báo nào phù hợp với bộ lọc."
                  style={{ padding: "40px 0" }}
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={filteredList}
                  renderItem={(item) => {
                    const isRead = Number(item.is_read) === 1;

                    return (
                      <List.Item
                        className={`noti-item ${isRead ? "read" : "unread"}`}
                        onClick={() => handleViewDetail(item.id)}
                        actions={[
                          <Tooltip title="Xem chi tiết" key="view">
                            <Button
                              type="text"
                              icon={
                                <EyeOutlined style={{ color: primaryNavy }} />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(item.id);
                              }}
                            />
                          </Tooltip>,
                          !isRead && (
                            <Tooltip title="Đánh dấu đã đọc" key="mark-read">
                              <Button
                                type="text"
                                icon={
                                  <CheckCircleOutlined
                                    style={{ color: "#52c41a" }}
                                  />
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(item.id);
                                }}
                              />
                            </Tooltip>
                          ),
                          <Popconfirm
                            title="Xóa thông báo này?"
                            onConfirm={(e) => handleDeleteNoti(item.id, e)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                            key="delete"
                          >
                            <Tooltip title="Xóa thông báo">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Tooltip>
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Badge
                              dot={!isRead}
                              color={accentGold}
                              offset={[-2, 2]}
                            >
                              {renderIcon(item.type, item.related_type)}
                            </Badge>
                          }
                          title={
                            <Space
                              align="center"
                              style={{
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <Text
                                strong
                                className={`noti-item-title ${
                                  !isRead ? "unread-text" : ""
                                }`}
                              >
                                {item.title || "Thông báo Mục Vụ"}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                <ClockCircleOutlined
                                  style={{ marginRight: 4 }}
                                />
                                {formatDate(item.created_at)}
                              </Text>
                            </Space>
                          }
                          description={
                            <div className="noti-item-content">
                              <Paragraph
                                type="secondary"
                                style={{ margin: 0 }}
                                ellipsis={{ rows: 2 }}
                              >
                                {item.content ||
                                  "Nhấn để xem chi tiết thông báo."}
                              </Paragraph>

                              <Space style={{ marginTop: 8 }}>
                                <Tag className="noti-type-tag">
                                  {getTranslatedType(item.type)}
                                </Tag>
                                {item.related_type && (
                                  <Tag color="blue">
                                    {item.related_type} #{item.related_id}
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>

            {/* MODAL 1: XEM CHI TIẾT THÔNG BÁO */}
            <Modal
              open={!!selectedNoti}
              footer={null}
              onCancel={() => setSelectedNoti(null)}
              centered
              width={600}
            >
              {detailLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin size="large" />
                </div>
              ) : (
                selectedNoti && (
                  <div style={{ padding: "8px 0" }}>
                    <Space size={8} style={{ marginBottom: 12 }}>
                      <Tag className="noti-type-tag">
                        {getTranslatedType(selectedNoti.type)}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <ClockCircleOutlined />{" "}
                        {formatDate(selectedNoti.created_at)}
                      </Text>
                    </Space>

                    <Title
                      level={4}
                      style={{ color: primaryNavy, marginTop: 0 }}
                    >
                      {selectedNoti.title}
                    </Title>

                    <div className="modal-noti-body">
                      <Paragraph
                        style={{
                          fontSize: 15,
                          lineHeight: 1.7,
                          color: textDark,
                        }}
                      >
                        {selectedNoti.content}
                      </Paragraph>
                    </div>

                    <div style={{ textAlign: "right", marginTop: 24 }}>
                      <Button
                        type="primary"
                        onClick={() => setSelectedNoti(null)}
                      >
                        Đóng
                      </Button>
                    </div>
                  </div>
                )
              )}
            </Modal>

            {/* MODAL 2: TẠO THÔNG BÁO MỚI */}
            <Modal
              title={
                <span style={{ color: primaryNavy, fontWeight: 700 }}>
                  Tạo Thông Báo / Sự Kiện Mới
                </span>
              }
              open={isCreateModalOpen}
              footer={null}
              onCancel={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
              centered
              width={560}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateNotification}
                style={{ marginTop: 16 }}
              >
                <Form.Item
                  label={
                    <strong style={{ color: primaryNavy }}>
                      Tiêu đề thông báo *
                    </strong>
                  }
                  name="title"
                  rules={[
                    { required: true, message: "Vui lòng nhập tiêu đề!" },
                  ]}
                >
                  <Input placeholder="Ví dụ: Sự kiện mới" />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <strong style={{ color: primaryNavy }}>
                          Loại thông báo (Type)
                        </strong>
                      }
                      name="type"
                      initialValue="CREATE_EVENT"
                    >
                      <Select
                        options={Object.keys(TYPE_MAP).map((key) => ({
                          value: key,
                          label: TYPE_MAP[key],
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <strong style={{ color: primaryNavy }}>
                          Liên quan (Related)
                        </strong>
                      }
                      name="related_type"
                      initialValue="events"
                    >
                      <Select
                        options={[
                          { value: "events", label: "Sự kiện (events)" },
                          { value: "documents", label: "Tài liệu (documents)" },
                          { value: "lessons", label: "Bài học (lessons)" },
                          {
                            value: "parishioners",
                            label: "Giáo dân (parishioners)",
                          },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <strong style={{ color: primaryNavy }}>
                      Nội dung thông báo *
                    </strong>
                  }
                  name="content"
                  rules={[
                    { required: true, message: "Vui lòng nhập nội dung!" },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Ví dụ: Cùng nhau trang hoàng sân khấu của Giáo xứ Đồng Quan vừa được tạo"
                  />
                </Form.Item>

                <div style={{ textAlign: "right", marginTop: 20 }}>
                  <Space>
                    <Button onClick={() => setIsCreateModalOpen(false)}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      className="create-btn"
                    >
                      Tạo & Gửi Thông Báo
                    </Button>
                  </Space>
                </div>
              </Form>
            </Modal>
          </div>
        </Content>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

          .noti-page-root { 
            background: ${softBg}; 
            min-height: 100vh; 
            font-family: 'Be Vietnam Pro', sans-serif;
            color: ${textDark};
          }

          .noti-page-wrapper { 
            padding: 60px 20px 80px 20px; 
          }

          .noti-page-container { 
            margin: 0 auto; 
          }

          /* Header Styling */
          .noti-header { 
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
          }

          .noti-tag-sacred {
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid ${accentGold};
            color: ${primaryNavy};
            padding: 6px 18px;
            border-radius: 30px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .noti-title { 
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: clamp(28px, 4.5vw, 38px) !important; 
            font-weight: 700 !important; 
            color: ${primaryNavy} !important; 
            margin: 0 !important;
          }

          .gold-accent-divider {
            width: 60px;
            height: 3px;
            background: ${accentGold};
            margin: 12px 0;
            border-radius: 2px;
          }

          .noti-subtitle { 
            font-size: 15px; 
            color: #64748b; 
            max-width: 620px;
            margin: 0 !important;
            line-height: 1.6;
          }

          .create-btn {
            background: ${primaryNavy} !important;
            border-color: ${primaryNavy} !important;
            font-weight: 700 !important;
            border-radius: 10px !important;
            height: 40px !important;
            box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2);
          }

          .reload-btn {
            border-radius: 10px !important;
            height: 40px !important;
            font-weight: 600;
          }

          /* Stat Cards */
          .stat-card {
            border-radius: 16px !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            background: #ffffff !important;
            box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04) !important;
          }

          .stat-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            color: #64748b;
          }
        `,
          }}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default NotificationPage;
