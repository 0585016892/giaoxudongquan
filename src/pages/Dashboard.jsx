import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Spin,
  Empty,
  List,
  Avatar,
  Space,
  Badge,
  Drawer,
  Descriptions,
  Button,
  ConfigProvider,
  Timeline,
  Tooltip,
  Alert,
} from "antd";

import {
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  HomeOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  RightOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  NotificationOutlined,
  PieChartOutlined,
  GlobalOutlined,
  CarryOutOutlined,
  CompassOutlined,
  EyeOutlined,
  ReloadOutlined,
  CloseOutlined,
  HeartOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { getDashboard } from "../api/dashboardApi";
import { getVisitorStats } from "../api/statApi";
import socket from "../socket/socket";

import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;

// =====================================================
// THEME
// =====================================================

const NAVY = "#1B365D";
const SOFT_BG = "#F4F6FA";

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const safeDate = (value, format = "DD/MM/YYYY") => {
  if (!value) return "--";

  const date = dayjs(value);

  return date.isValid() ? date.format(format) : "--";
};

const safeText = (value, fallback = "Chưa cập nhật") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
};

const formatEventTime = (value) => {
  if (!value) return "--:--";

  return String(value).substring(0, 5);
};

const isPriority = (value) => {
  return value === 1 || value === "1" || value === true;
};

// =====================================================
// STATISTIC CARD
// =====================================================

const StatisticCard = ({ item }) => (
  <Card bordered={false} className="dashboard-stat-card">
    <div className="dashboard-stat-top">
      <div
        className="dashboard-stat-icon"
        style={{
          background: item.bg,
          color: item.color,
        }}
      >
        {item.icon}
      </div>

      {item.extra && <span className="dashboard-stat-extra">{item.extra}</span>}
    </div>

    <div className="dashboard-stat-info">
      <Text className="dashboard-stat-label">{item.title}</Text>

      <div className="dashboard-stat-value">{item.value}</div>
    </div>
  </Card>
);

// =====================================================
// SECTION TITLE
// =====================================================

const SectionTitle = ({ icon, children, extra }) => (
  <div className="dashboard-section-heading">
    <div className="dashboard-section-heading-left">
      <span className="dashboard-section-icon">{icon}</span>

      <span className="dashboard-section-text">{children}</span>
    </div>

    {extra}
  </div>
);

// =====================================================
// EMPTY STATE
// =====================================================

const EmptyState = ({ description }) => (
  <div className="dashboard-empty-wrapper">
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<Text type="secondary">{description}</Text>}
    />
  </div>
);

// =====================================================
// DASHBOARD
// =====================================================

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  const [currentTime, setCurrentTime] = useState(() => dayjs());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [onlineUsers, setOnlineUsers] = useState(0);

  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    todayVisits: 0,
    uniqueVisitors: 0,
    totalVisitors: 0,
    todayVisitors: 0,
  });

  const [visitorError, setVisitorError] = useState("");

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setDashboardError("");

      try {
        const response = await getDashboard();

        // Hỗ trợ cả dữ liệu trả về trực tiếp và Axios response.
        const payload =
          response?.success !== undefined
            ? response
            : response?.data?.success !== undefined
              ? response.data
              : response?.data || response;

        if (!payload || payload.success === false) {
          throw new Error(
            payload?.message || "Máy chủ không trả về dữ liệu hợp lệ.",
          );
        }

        const result =
          payload?.data && typeof payload.data === "object"
            ? payload.data
            : payload;

        setData({
          ...result,

          stats:
            result.stats &&
            typeof result.stats === "object" &&
            !Array.isArray(result.stats)
              ? result.stats
              : {},

          recentEvents: safeArray(result.recentEvents),
          recentGroups: safeArray(result.recentGroups),
          upcomingEvents: safeArray(result.upcomingEvents),
          monthlyEvents: safeArray(result.monthlyEvents),

          currentWeekSchedule: result.currentWeekSchedule || null,
        });
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);

        setDashboardError(
          error?.response?.data?.message ||
            error?.message ||
            "Không thể kết nối đến máy chủ.",
        );

        if (!isRefresh || !data) {
          setData(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [data],
  );

  // =====================================================
  // FETCH VISITOR STATISTICS
  // =====================================================

  const fetchVisitorStats = useCallback(async () => {
    setVisitorError("");

    try {
      const response = await getVisitorStats();

      const payload =
        response?.data?.success !== undefined ? response.data : response;

      const result = payload?.data;

      if (payload?.success && result) {
        setVisitorStats((prev) => ({
          ...prev,
          ...result,
        }));
      } else {
        setVisitorError(payload?.message || "Chưa thể tải thống kê truy cập.");
      }
    } catch (error) {
      console.error("VISITOR STATS ERROR:", error);

      setVisitorError(
        error?.response?.data?.message || "Không thể tải thống kê truy cập.",
      );
    }
  }, []);

  // =====================================================
  // INITIALIZATION
  // =====================================================

  useEffect(() => {
    fetchDashboard();
    fetchVisitorStats();

    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    const handleOnlineCount = (count) => {
      setOnlineUsers(safeNumber(count));
    };

    socket.on("onlineCount", handleOnlineCount);

    return () => {
      clearInterval(timer);
      socket.off("onlineCount", handleOnlineCount);
    };
  }, [fetchDashboard, fetchVisitorStats]);

  // =====================================================
  // NORMALIZE DATA
  // =====================================================

  const stats = useMemo(() => {
    return data?.stats &&
      typeof data.stats === "object" &&
      !Array.isArray(data.stats)
      ? data.stats
      : {};
  }, [data?.stats]);

  const recentEvents = useMemo(
    () => safeArray(data?.recentEvents),
    [data?.recentEvents],
  );

  const recentGroups = useMemo(
    () => safeArray(data?.recentGroups),
    [data?.recentGroups],
  );

  const upcomingEvents = useMemo(
    () => safeArray(data?.upcomingEvents),
    [data?.upcomingEvents],
  );

  const monthlyEvents = useMemo(
    () => safeArray(data?.monthlyEvents),
    [data?.monthlyEvents],
  );

  const currentWeekSchedule = data?.currentWeekSchedule || null;

  // =====================================================
  // STATISTIC CARDS
  // =====================================================

  const statisticCards = useMemo(
    () => [
      {
        title: "Cơ sở Giáo xứ / Họ",
        value: safeNumber(stats.totalChurches),
        icon: <HomeOutlined />,
        color: NAVY,
        bg: "#EAF0F8",
      },
      {
        title: "Đoàn thể & Hội nhóm",
        value: safeNumber(stats.totalGroups),
        icon: <TeamOutlined />,
        color: "#8B5CF6",
        bg: "#F3EEFF",
      },
      {
        title: "Sự kiện & Ngày lễ",
        value: safeNumber(stats.totalEvents),
        icon: <CalendarOutlined />,
        color: "#D97706",
        bg: "#FFF5E5",
      },
      {
        title: "Ý nguyện & Kinh cầu",
        value: safeNumber(stats.totalPrayers),
        icon: <FileTextOutlined />,
        color: "#DC2626",
        bg: "#FEF0F0",
      },
      {
        title: "Khách ghé thăm",
        value: safeNumber(stats.totalVisitors),
        icon: <GlobalOutlined />,
        color: "#0284C7",
        bg: "#EAF7FF",
      },
      {
        title: "Ban quản trị",
        value: `${safeNumber(stats.activeAdmins)}/${safeNumber(
          stats.totalAdmins,
        )}`,
        icon: <UserOutlined />,
        color: "#475569",
        bg: "#F1F5F9",
      },
      {
        title: "Tổng lượt truy cập",
        value: safeNumber(
          visitorStats.totalVisitors ?? visitorStats.totalVisits,
        ),
        icon: <EyeOutlined />,
        color: "#0284C7",
        bg: "#EAF7FF",
      },
      {
        title: "Lượt truy cập hôm nay",
        value: safeNumber(
          visitorStats.todayVisitors ?? visitorStats.todayVisits,
        ),
        icon: <GlobalOutlined />,
        color: "#7C3AED",
        bg: "#F3EEFF",
      },
      {
        title: "Đang trực tuyến",
        value: onlineUsers,
        icon: <UserOutlined />,
        color: "#16A34A",
        bg: "#EAF8EF",
        extra: (
          <span className="online-indicator">
            <span />
            Online
          </span>
        ),
      },
    ],
    [stats, visitorStats, onlineUsers],
  );

  // =====================================================
  // EVENT DETAIL
  // =====================================================

  const showDetail = useCallback((event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = useCallback(() => {
    fetchDashboard(true);
    fetchVisitorStats();
  }, [fetchDashboard, fetchVisitorStats]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && !data) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: NAVY,
            borderRadius: 14,
            fontFamily: "'Be Vietnam Pro', sans-serif",
          },
        }}
      >
        <div className="dashboard-state-screen">
          <style>{dashboardStyles}</style>

          <div className="dashboard-loading-card">
            <div className="loading-logo">
              <HeartOutlined />
            </div>

            <Spin size="large" />

            <Title level={4}>Đang tải dữ liệu giáo xứ</Title>

            <Text type="secondary">Vui lòng chờ trong giây lát...</Text>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  // =====================================================
  // DASHBOARD ERROR
  // =====================================================

  if (!data) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: NAVY,
            borderRadius: 14,
            fontFamily: "'Be Vietnam Pro', sans-serif",
          },
        }}
      >
        <div className="dashboard-state-screen">
          <style>{dashboardStyles}</style>

          <Card bordered={false} className="dashboard-error-card">
            <div className="error-icon">
              <InfoCircleOutlined />
            </div>

            <Title level={4}>Không thể tải bảng điều hành</Title>

            <Paragraph type="secondary">
              {dashboardError ||
                "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại."}
            </Paragraph>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => fetchDashboard()}
              loading={loading}
              size="large"
            >
              Thử tải lại
            </Button>
          </Card>
        </div>
      </ConfigProvider>
    );
  }

  // =====================================================
  // MAIN RENDER
  // =====================================================

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 14,
          colorPrimary: NAVY,
          colorBgLayout: SOFT_BG,
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <style>{dashboardStyles}</style>

      <div className="dashboard-editorial">
        <div className="dashboard-container">
          {/* HEADER */}

          <div className="dashboard-top-header">
            <div className="dashboard-heading">
              <div className="sacred-badge">
                <CompassOutlined />
                TRUNG TÂM ĐIỀU HÀNH MỤC VỤ
              </div>

              <Title level={2} className="dashboard-main-title">
                Bảng điều hành giáo xứ
              </Title>

              <Text className="dashboard-sub-title">
                Xin chào quản trị viên, chúc bạn một ngày tràn đầy hồng ân và
                bình an!
              </Text>
            </div>

            <div className="dashboard-header-actions">
              <Card bordered={false} className="clock-card">
                <div className="clock-card-inner">
                  <Avatar
                    className="clock-avatar"
                    icon={<ClockCircleOutlined />}
                  />

                  <div className="clock-info">
                    <Text strong className="clock-time">
                      {currentTime.format("HH:mm:ss")}
                    </Text>

                    <Text className="clock-date">
                      {currentTime.format("dddd, DD/MM/YYYY")}
                    </Text>
                  </div>
                </div>
              </Card>

              <Tooltip title="Tải lại dữ liệu">
                <Button
                  className="dashboard-refresh-button"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={refreshing}
                >
                  Làm mới
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* REFRESH ERROR */}

          {dashboardError && data && (
            <Alert
              className="dashboard-refresh-warning"
              type="warning"
              showIcon
              message="Không thể cập nhật dữ liệu mới"
              description={dashboardError}
              closable
            />
          )}

          {/* VISITOR WARNING */}

          {visitorError && (
            <Alert
              className="visitor-warning"
              type="warning"
              showIcon
              message="Một phần thống kê truy cập chưa thể tải"
              description={visitorError}
              closable
              onClose={() => setVisitorError("")}
            />
          )}

          {/* CURRENT WEEK SCHEDULE */}

          {currentWeekSchedule && (
            <Card bordered={false} className="liturgical-banner">
              <div className="banner-decoration">
                <CarryOutOutlined />
              </div>

              <Row gutter={[24, 20]} align="middle">
                <Col xs={24} lg={15}>
                  <Space direction="vertical" size={12}>
                    <Space wrap align="center">
                      <div className="banner-label">
                        <CarryOutOutlined />
                        LỊCH PHỤNG VỤ TUẦN HIỆN TẠI
                      </div>

                      <Tag
                        color={
                          currentWeekSchedule.status === "DRAFT"
                            ? "warning"
                            : "success"
                        }
                      >
                        {currentWeekSchedule.status === "DRAFT"
                          ? "BẢN NHÁP"
                          : "ĐÃ XUẤT BẢN"}
                      </Tag>
                    </Space>

                    <Title level={3} className="banner-title">
                      {safeText(currentWeekSchedule.title)}
                    </Title>

                    <Text className="banner-date">
                      Thời gian áp dụng:{" "}
                      <strong>
                        {safeDate(currentWeekSchedule.week_start)}
                      </strong>
                      {" — "}
                      <strong>{safeDate(currentWeekSchedule.week_end)}</strong>
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} lg={9}>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="banner-stat">
                        <Text> LỊCH ĐÃ ĐĂNG </Text>
                        <div>{safeNumber(stats.publishedSchedules)}</div>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div className="banner-stat">
                        <Text> LƯỢT TRUY CẬP </Text>
                        <div>{safeNumber(stats.totalVisits)}</div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}

          {/* SECTION LABEL */}

          <div className="dashboard-overview-heading">
            <div>
              <Text className="dashboard-eyebrow">TỔNG QUAN HỆ THỐNG</Text>

              <Title level={4} className="dashboard-overview-title">
                Các chỉ số hoạt động
              </Title>
            </div>

            <Tag className="dashboard-date-tag">
              <CalendarOutlined />
              {currentTime.format("DD/MM/YYYY")}
            </Tag>
          </div>

          {/* STATISTICS */}

          <Row gutter={[16, 16]} className="dashboard-stat-section">
            <Col xs={24} xl={7}>
              <div className="dashboard-hero-card">
                <div className="hero-top">
                  <div className="hero-icon">
                    <ProjectOutlined />
                  </div>

                  <Tag className="hero-tag">TRỌNG TÂM HỆ THỐNG</Tag>
                </div>

                <div className="hero-content">
                  <Title level={3} className="hero-title">
                    Dữ liệu lịch phụng vụ
                  </Title>

                  <Text className="hero-description">
                    Tổng số chương trình phụng vụ đang được quản lý trên hệ
                    thống giáo xứ.
                  </Text>
                </div>

                <div className="hero-bottom">
                  <div className="hero-number">
                    {safeNumber(stats.totalLiturgicalSchedules)}
                  </div>

                  <div className="hero-number-label">Danh mục chương trình</div>
                </div>

                <div className="hero-background-icon">
                  <ProjectOutlined />
                </div>
              </div>
            </Col>

            <Col xs={24} xl={17}>
              <Row gutter={[12, 12]}>
                {statisticCards.map((item) => (
                  <Col xs={12} sm={8} md={8} key={item.title}>
                    <StatisticCard item={item} />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {/* MAIN CONTENT */}

          <div className="dashboard-content-heading">
            <div>
              <Text className="dashboard-eyebrow">HOẠT ĐỘNG MỤC VỤ</Text>

              <Title level={4} className="dashboard-overview-title">
                Thông tin điều hành
              </Title>
            </div>
          </div>

          <Row gutter={[16, 16]} className="dashboard-main-grid">
            {/* UPCOMING EVENTS */}

            <Col xs={24} xl={15}>
              <Card
                title={
                  <SectionTitle icon={<CalendarOutlined />}>
                    Chương trình phụng vụ sắp tới
                  </SectionTitle>
                }
                bordered={false}
                className="dashboard-panel"
                extra={
                  <Tag className="sacred-status-tag">
                    {upcomingEvents.length} chương trình
                  </Tag>
                }
              >
                <div className="event-list">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event, index) => (
                      <div
                        key={event.id ?? `event-${index}`}
                        className="event-item"
                        onClick={() => showDetail(event)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            showDetail(event);
                          }
                        }}
                      >
                        <div className="event-time-box">
                          <div className="event-time">
                            {formatEventTime(event.event_time)}
                          </div>

                          <div className="event-date">
                            {safeDate(event.event_date)}
                          </div>
                        </div>

                        <div className="event-info">
                          <div className="event-title-row">
                            <Text strong className="event-title">
                              {safeText(event.title, "Sự kiện chưa có tên")}
                            </Text>

                            {isPriority(event.is_priority) && (
                              <Tag color="error">Ưu tiên</Tag>
                            )}
                          </div>

                          <Tag className="event-type-tag">
                            {event.type === "THUONG"
                              ? "Lễ thường"
                              : safeText(event.type, "Chưa phân loại")}
                          </Tag>

                          <div className="event-meta">
                            {event.church_name && (
                              <span>
                                <EnvironmentOutlined />
                                {event.church_name}
                              </span>
                            )}

                            {event.priest && (
                              <span>
                                <UserOutlined />
                                {event.priest}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="event-arrow">
                          <RightOutlined />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState description="Không có chương trình phụng vụ sắp tới" />
                  )}
                </div>
              </Card>
            </Col>

            {/* RIGHT COLUMN */}

            <Col xs={24} xl={9}>
              <Space
                direction="vertical"
                size={16}
                className="dashboard-right-column"
              >
                {/* MONTHLY EVENTS */}

                <Card
                  title={
                    <SectionTitle icon={<PieChartOutlined />}>
                      Thống kê sự kiện theo tháng
                    </SectionTitle>
                  }
                  bordered={false}
                  className="dashboard-panel"
                >
                  {monthlyEvents.length > 0 ? (
                    <Row gutter={[10, 12]}>
                      {monthlyEvents.map((item, index) => (
                        <Col
                          xs={12}
                          sm={8}
                          xl={12}
                          key={`${item.month ?? index}-${index}`}
                        >
                          <div className="monthly-stat">
                            <div className="monthly-stat-top">
                              <span className="month-dot" />
                              <Text className="month-label">
                                Tháng {safeText(item.month, index + 1)}
                              </Text>
                            </div>

                            <Text strong className="month-value">
                              {safeNumber(item.total)}
                            </Text>

                            <Text className="month-unit">Sự kiện phụng vụ</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <EmptyState description="Chưa có thống kê theo tháng" />
                  )}
                </Card>

                {/* RECENT GROUPS */}

                <Card
                  title={
                    <SectionTitle icon={<TeamOutlined />}>
                      Hội đoàn mới thành lập
                    </SectionTitle>
                  }
                  bordered={false}
                  className="dashboard-panel"
                >
                  {recentGroups.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={recentGroups}
                      renderItem={(group, index) => (
                        <List.Item
                          key={group.id ?? index}
                          className="group-item"
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                className="group-avatar"
                                icon={<TeamOutlined />}
                              />
                            }
                            title={
                              <Text strong className="group-name">
                                {safeText(group.name, "Hội đoàn chưa có tên")}
                              </Text>
                            }
                            description={
                              <span className="group-date">
                                <CalendarOutlined />
                                Khởi tạo: {safeDate(group.created_at)}
                              </span>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <EmptyState description="Chưa có hội đoàn mới" />
                  )}
                </Card>

                {/* RECENT ACTIVITIES */}

                <Card
                  title={
                    <SectionTitle icon={<NotificationOutlined />}>
                      Hoạt động gần đây
                    </SectionTitle>
                  }
                  bordered={false}
                  className="dashboard-panel"
                >
                  {recentEvents.length > 0 ? (
                    <Timeline
                      className="dashboard-timeline"
                      items={recentEvents.map((item, index) => ({
                        color: NAVY,
                        children: (
                          <div className="timeline-row" key={item.id ?? index}>
                            <div className="timeline-content">
                              <Text strong className="timeline-title">
                                {safeText(item.title, "Hoạt động")}
                              </Text>

                              <Text className="timeline-date">
                                Diễn ra: {safeDate(item.event_date)}
                              </Text>
                            </div>

                            <Tag className="timeline-tag">
                              {safeDate(item.created_at, "DD/MM")}
                            </Tag>
                          </div>
                        ),
                      }))}
                    />
                  ) : (
                    <EmptyState description="Chưa có hoạt động gần đây" />
                  )}
                </Card>
              </Space>
            </Col>
          </Row>

          {/* FOOTER */}

          <div className="dashboard-footer">
            <div className="dashboard-footer-left">
              <SafetyCertificateOutlined />
              <span>Hệ thống quản lý giáo xứ</span>
            </div>

            <div className="dashboard-footer-right">
              <HeartOutlined />
              Phục vụ bằng đức tin và tình yêu
            </div>
          </div>

          {/* EVENT DETAIL DRAWER */}

          <Drawer
            title={
              <div className="drawer-heading">
                <InfoCircleOutlined />
                <span>Chi tiết lịch phụng vụ</span>
              </div>
            }
            open={isDrawerOpen}
            onClose={closeDetail}
            width={480}
            placement="right"
            destroyOnClose
            className="event-detail-drawer"
            extra={
              <Tooltip title="Đóng">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={closeDetail}
                />
              </Tooltip>
            }
          >
            {selectedEvent && (
              <Space
                direction="vertical"
                size="middle"
                className="drawer-content"
              >
                <div className="drawer-hero">
                  <div className="drawer-hero-icon">
                    <CalendarOutlined />
                  </div>

                  <Text className="drawer-label">
                    TÊN CHƯƠNG TRÌNH / THÁNH LỄ
                  </Text>

                  <Title level={4} className="drawer-event-title">
                    {safeText(selectedEvent.title)}
                  </Title>
                </div>

                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="drawer-descriptions"
                >
                  <Descriptions.Item label="Mã ID">
                    #{safeText(selectedEvent.id, "--")}
                  </Descriptions.Item>

                  <Descriptions.Item label="Thời gian">
                    <Text strong className="drawer-time">
                      {formatEventTime(selectedEvent.event_time)}
                    </Text>

                    <div className="drawer-date">
                      {safeDate(
                        selectedEvent.event_date,
                        "dddd, [ngày] DD/MM/YYYY",
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa điểm">
                    {safeText(
                      selectedEvent.church_name,
                      "Chưa cập nhật địa điểm",
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Chủ tế">
                    {safeText(selectedEvent.priest, "Chưa cập nhật linh mục")}
                  </Descriptions.Item>

                  <Descriptions.Item label="Ưu tiên">
                    <Badge
                      status={
                        isPriority(selectedEvent.is_priority)
                          ? "error"
                          : "default"
                      }
                      text={
                        isPriority(selectedEvent.is_priority)
                          ? "Lễ trọng / Ưu tiên"
                          : "Thông thường"
                      }
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Phân loại">
                    <Tag
                      color={selectedEvent.type === "THUONG" ? "blue" : "gold"}
                    >
                      {selectedEvent.type === "THUONG"
                        ? "Lễ thường nhật"
                        : safeText(selectedEvent.type, "Chưa phân loại")}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Card bordered={false} className="drawer-notice">
                  <Space align="start">
                    <InfoCircleOutlined className="drawer-notice-icon" />

                    <Paragraph className="drawer-notice-text">
                      Thông tin lịch phụng vụ được sử dụng để hiển thị trên hệ
                      thống của giáo dân. Vui lòng kiểm tra thông tin trước khi
                      cập nhật.
                    </Paragraph>
                  </Space>
                </Card>

                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={closeDetail}
                  className="drawer-close-button"
                >
                  Đóng thông tin
                </Button>
              </Space>
            )}
          </Drawer>
        </div>
      </div>
    </ConfigProvider>
  );
};

// =====================================================
// ALL CSS - SAME FILE
// =====================================================

const dashboardStyles = `
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

.dashboard-editorial {
  min-height: 100vh;
  padding: 26px 28px 18px;
  background:
    radial-gradient(circle at 90% 0%, rgba(212,175,55,.07), transparent 25%),
    #F4F6FA;
  color: #1E293B;
  font-family: 'Be Vietnam Pro', sans-serif;
  overflow-x: hidden;
}

.dashboard-container {
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.dashboard-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.dashboard-heading {
  min-width: 0;
}

.sacred-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(212,175,55,.28);
  border-radius: 30px;
  background: rgba(212,175,55,.09);
  color: #9A771C;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.sacred-badge .anticon {
  font-size: 13px;
}

.dashboard-main-title {
  margin: 0 0 7px !important;
  color: #1B365D !important;
  font-size: clamp(23px, 2.2vw, 32px) !important;
  font-weight: 800 !important;
  letter-spacing: -.8px;
}

.dashboard-sub-title {
  display: block;
  color: #7B8798;
  font-size: 13px;
  line-height: 1.7;
}

.dashboard-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.clock-card {
  min-width: 205px;
  border: 1px solid #E9EDF3 !important;
  border-radius: 16px !important;
  box-shadow: 0 5px 18px rgba(27,54,93,.045);
}

.clock-card .ant-card-body {
  padding: 13px 16px !important;
}

.clock-card-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clock-avatar {
  width: 42px !important;
  height: 42px !important;
  display: flex !important;
  align-items: center;
  justify-content: center;
  background: #EAF0F8 !important;
  color: #1B365D !important;
  font-size: 17px !important;
}

.clock-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.clock-time {
  color: #1B365D;
  font-size: 20px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.clock-date {
  color: #8A94A5;
  font-size: 10px;
  text-transform: capitalize;
}

.dashboard-refresh-button {
  height: 44px !important;
  border: 1px solid #DDE4ED !important;
  border-radius: 12px !important;
  color: #1B365D !important;
  font-weight: 600;
}

.dashboard-refresh-button:hover {
  border-color: #D4AF37 !important;
  color: #9A771C !important;
}

.dashboard-refresh-warning,
.visitor-warning {
  margin-bottom: 18px;
  border-radius: 12px;
}

.liturgical-banner {
  position: relative;
  overflow: hidden;
  margin-bottom: 26px;
  border: none !important;
  border-radius: 19px !important;
  background: linear-gradient(115deg, #1B365D 0%, #244A76 65%, #315C88 100%) !important;
  box-shadow: 0 12px 30px rgba(27,54,93,.13);
}

.liturgical-banner .ant-card-body {
  position: relative;
  z-index: 1;
  padding: 25px 28px !important;
}

.banner-decoration {
  position: absolute;
  right: 10%;
  top: -55px;
  color: rgba(255,255,255,.055);
  font-size: 220px;
  pointer-events: none;
}

.banner-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #F1D783;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
}

.banner-title {
  margin: 0 !important;
  color: #FFFFFF !important;
  font-size: 22px !important;
  font-weight: 700 !important;
}

.banner-date {
  color: rgba(255,255,255,.7) !important;
  font-size: 12px;
}

.banner-date strong {
  color: #FFFFFF;
}

.banner-stat {
  padding: 12px 15px;
  border: 1px solid rgba(255,255,255,.13);
  border-radius: 12px;
  background: rgba(255,255,255,.075);
}

.banner-stat .ant-typography {
  color: rgba(255,255,255,.65);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .7px;
}

.banner-stat div {
  margin-top: 5px;
  color: #F1D783;
  font-size: 26px;
  font-weight: 800;
}

.dashboard-overview-heading,
.dashboard-content-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0 15px;
}

.dashboard-eyebrow {
  color: #A18435;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.dashboard-overview-title {
  margin: 4px 0 0 !important;
  color: #1B365D !important;
  font-size: 19px !important;
  font-weight: 800 !important;
}

.dashboard-date-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid #E5EAF0 !important;
  border-radius: 30px !important;
  background: #FFFFFF !important;
  color: #64748B !important;
  font-size: 11px;
}

.dashboard-stat-section {
  margin-bottom: 28px;
}

.dashboard-hero-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  min-height: 285px;
  padding: 23px;
  overflow: hidden;
  border-radius: 18px;
  background: linear-gradient(145deg, #1B365D, #102944);
  box-shadow: 0 10px 25px rgba(27,54,93,.14);
}

.hero-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  border: 1px solid rgba(212,175,55,.3);
  border-radius: 12px;
  background: rgba(212,175,55,.12);
  color: #E9CC75;
  font-size: 18px;
}

.hero-tag {
  margin: 0 !important;
  padding: 5px 9px !important;
  border: 1px solid rgba(212,175,55,.35) !important;
  border-radius: 30px !important;
  background: rgba(212,175,55,.1) !important;
  color: #F0D98C !important;
  font-size: 9px !important;
  font-weight: 700;
}

.hero-content {
  position: relative;
  z-index: 1;
  margin: 25px 0 18px;
}

.hero-title {
  margin: 0 0 10px !important;
  color: #FFFFFF !important;
  font-size: 20px !important;
  font-weight: 700 !important;
}

.hero-description {
  display: block;
  max-width: 290px;
  color: rgba(255,255,255,.64) !important;
  font-size: 11px;
  line-height: 1.8;
}

.hero-bottom {
  position: relative;
  z-index: 1;
}

.hero-number {
  color: #F1D783;
  font-size: 40px;
  font-weight: 800;
  line-height: 1.1;
}

.hero-number-label {
  margin-top: 5px;
  color: rgba(255,255,255,.55);
  font-size: 10px;
}

.hero-background-icon {
  position: absolute;
  right: -18px;
  bottom: -35px;
  color: rgba(255,255,255,.045);
  font-size: 180px;
  pointer-events: none;
}

.dashboard-stat-card {
  height: 100%;
  min-height: 130px;
  border: 1px solid #EAEFF4 !important;
  border-radius: 15px !important;
  background: #FFFFFF;
  box-shadow: 0 4px 15px rgba(27,54,93,.035);
  transition: all .25s ease;
}

.dashboard-stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212,175,55,.45) !important;
  box-shadow: 0 10px 24px rgba(27,54,93,.09);
}

.dashboard-stat-card .ant-card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 15px !important;
}

.dashboard-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dashboard-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 37px;
  height: 37px;
  flex-shrink: 0;
  border-radius: 11px;
  font-size: 17px;
}

.dashboard-stat-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 13px;
}

.dashboard-stat-label {
  color: #8490A0 !important;
  font-size: 10px;
  font-weight: 600;
  line-height: 1.5;
}

.dashboard-stat-value {
  color: #1B365D;
  font-size: clamp(20px, 2vw, 26px);
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
  font-variant-numeric: tabular-nums;
}

.dashboard-stat-extra {
  font-size: 9px;
}

.online-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #16A34A;
  font-size: 9px;
  font-weight: 700;
}

.online-indicator span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16A34A;
  box-shadow: 0 0 0 3px rgba(22,163,74,.12);
}

.dashboard-content-heading {
  margin-top: 30px;
  margin-bottom: 15px;
}

.dashboard-main-grid {
  align-items: stretch;
}

.dashboard-panel {
  height: 100%;
  border: 1px solid #E9EDF3 !important;
  border-radius: 17px !important;
  background: #FFFFFF;
  box-shadow: 0 4px 18px rgba(27,54,93,.035);
}

.dashboard-panel > .ant-card-head {
  min-height: 61px;
  padding: 0 19px;
  border-bottom: 1px solid #F0F2F6;
}

.dashboard-panel > .ant-card-head .ant-card-head-title {
  padding: 16px 0;
  overflow: visible;
  white-space: normal;
}

.dashboard-panel > .ant-card-head .ant-card-extra {
  padding: 12px 0;
}

.dashboard-panel > .ant-card-body {
  padding: 18px !important;
}

.dashboard-section-heading,
.dashboard-section-heading-left {
  display: flex;
  align-items: center;
}

.dashboard-section-heading {
  justify-content: space-between;
  gap: 10px;
}

.dashboard-section-heading-left {
  gap: 10px;
  min-width: 0;
}

.dashboard-section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #EAF0F8;
  color: #1B365D;
  font-size: 15px;
}

.dashboard-section-text {
  color: #1B365D;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.5;
}

.sacred-status-tag {
  margin: 0 !important;
  padding: 5px 9px !important;
  border: none !important;
  border-radius: 30px !important;
  background: #F5F1E4 !important;
  color: #927325 !important;
  font-size: 9px !important;
  font-weight: 700;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px;
  border: 1px solid #EEF1F5;
  border-radius: 13px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all .2s ease;
}

.event-item:hover {
  border-color: rgba(212,175,55,.55);
  background: #FFFEFA;
  transform: translateX(3px);
  box-shadow: 0 5px 15px rgba(27,54,93,.045);
}

.event-item:focus-visible {
  outline: 2px solid #D4AF37;
  outline-offset: 2px;
}

.event-time-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 75px;
  min-width: 75px;
  min-height: 68px;
  padding: 8px;
  border-radius: 11px;
  background: #F0F4F9;
}

.event-time {
  color: #1B365D;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
}

.event-date {
  color: #8793A3;
  font-size: 9px;
  font-weight: 600;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.event-title {
  color: #273D5A !important;
  font-size: 12px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.event-type-tag {
  margin: 0 0 7px 0 !important;
  padding: 2px 8px !important;
  border: none !important;
  border-radius: 5px !important;
  background: #EEF3F8 !important;
  color: #55708F !important;
  font-size: 9px !important;
}

.event-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 13px;
  color: #929CAB;
  font-size: 10px;
}

.event-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.event-meta .anticon {
  color: #B18D36;
}

.event-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #F5F7FA;
  color: #8995A5;
  font-size: 11px;
  transition: all .2s ease;
}

.event-item:hover .event-arrow {
  background: #1B365D;
  color: #FFFFFF;
}

.dashboard-right-column {
  width: 100%;
}

.dashboard-right-column .dashboard-panel {
  width: 100%;
}

.monthly-stat {
  display: flex;
  flex-direction: column;
  min-height: 105px;
  padding: 12px;
  border: 1px solid #EEF1F5;
  border-radius: 11px;
  background: #FAFBFD;
  transition: all .2s ease;
}

.monthly-stat:hover {
  border-color: rgba(212,175,55,.5);
  background: #FFFEFA;
}

.monthly-stat-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.month-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #D4AF37;
}

.month-label {
  color: #7E8A9A !important;
  font-size: 10px;
  font-weight: 600;
}

.month-value {
  margin-top: 7px;
  color: #1B365D;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.month-unit {
  margin-top: 4px;
  color: #A0A9B5 !important;
  font-size: 9px;
}

.group-item {
  padding: 11px 0 !important;
  border-bottom: 1px solid #F0F2F5 !important;
}

.group-item:last-child {
  border-bottom: none !important;
}

.group-avatar {
  display: flex !important;
  align-items: center;
  justify-content: center;
  background: #F0EBFA !important;
  color: #8061B5 !important;
}

.group-name {
  color: #34465E !important;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.group-date {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #929CAB;
  font-size: 10px;
}

.group-date .anticon {
  color: #B18D36;
}

.dashboard-timeline {
  margin-top: 5px;
}

.dashboard-timeline .ant-timeline-item-tail {
  border-inline-start: 1px dashed #DCE3EC;
}

.dashboard-timeline .ant-timeline-item-head {
  width: 9px;
  height: 9px;
  border-width: 2px;
}

.dashboard-timeline .ant-timeline-item-content {
  margin-inline-start: 20px;
  min-height: 48px;
}

.timeline-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 5px;
}

.timeline-title {
  color: #34465E !important;
  font-size: 11px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.timeline-date {
  color: #929CAB !important;
  font-size: 9px;
}

.timeline-tag {
  flex-shrink: 0;
  margin: 0 !important;
  border: none !important;
  border-radius: 5px !important;
  background: #F3F5F8 !important;
  color: #8793A3 !important;
  font-size: 9px !important;
}

.dashboard-empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 145px;
  padding: 15px 0;
}

.dashboard-empty-wrapper .ant-empty-image {
  height: 65px;
}

.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 4px 8px;
  margin-top: 18px;
  border-top: 1px solid #E7EBF1;
  color: #929CAB;
  font-size: 10px;
}

.dashboard-footer-left,
.dashboard-footer-right {
  display: flex;
  align-items: center;
  gap: 7px;
}

.dashboard-footer-left .anticon {
  color: #1B365D;
}

.dashboard-footer-right .anticon {
  color: #C5A342;
}

.drawer-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1B365D;
  font-weight: 800;
  font-size: 14px;
}

.drawer-heading .anticon {
  color: #B18D36;
}

.drawer-content {
  width: 100%;
}

.drawer-hero {
  padding: 22px;
  border-radius: 15px;
  background: linear-gradient(140deg, #1B365D, #284D76);
}

.drawer-hero-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 39px;
  height: 39px;
  margin-bottom: 15px;
  border: 1px solid rgba(212,175,55,.3);
  border-radius: 11px;
  background: rgba(212,175,55,.13);
  color: #E8CB76;
  font-size: 17px;
}

.drawer-label {
  display: block;
  margin-bottom: 7px;
  color: #E8CB76;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: .8px;
}

.drawer-event-title {
  margin: 0 !important;
  color: #FFFFFF !important;
  font-size: 19px !important;
  line-height: 1.6 !important;
}

.drawer-descriptions .ant-descriptions-item-label {
  width: 110px;
  color: #7F8B9B;
  font-size: 11px;
}

.drawer-descriptions .ant-descriptions-item-content {
  color: #34465E;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.drawer-time {
  color: #1B365D;
  font-size: 17px;
}

.drawer-date {
  margin-top: 3px;
  color: #8B95A3;
  font-size: 10px;
}

.drawer-notice {
  border-radius: 12px !important;
  background: #F2F6FA !important;
}

.drawer-notice .ant-card-body {
  padding: 14px !important;
}

.drawer-notice-icon {
  margin-top: 3px;
  color: #B18D36;
}

.drawer-notice-text {
  margin: 0 !important;
  color: #738196;
  font-size: 10px;
  line-height: 1.8;
}

.drawer-close-button {
  height: 44px !important;
  border-radius: 11px !important;
  font-weight: 700;
}

.dashboard-state-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 65vh;
  padding: 24px;
  background: #F4F6FA;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.dashboard-loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 40px;
  text-align: center;
}

.dashboard-loading-card h5 {
  margin: 7px 0 0 !important;
  color: #1B365D;
}

.loading-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  margin-bottom: 8px;
  border-radius: 17px;
  background: #1B365D;
  color: #E8CB76;
  font-size: 25px;
  box-shadow: 0 8px 20px rgba(27,54,93,.17);
}

.dashboard-error-card {
  width: 100%;
  max-width: 440px;
  padding: 25px;
  border-radius: 18px !important;
  text-align: center;
  box-shadow: 0 8px 30px rgba(27,54,93,.07);
}

.dashboard-error-card .ant-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.dashboard-error-card h4 {
  margin: 5px 0 !important;
  color: #1B365D;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  border-radius: 16px;
  background: #FEF0F0;
  color: #DC2626;
  font-size: 24px;
}

.dashboard-error-card .ant-btn {
  height: 43px;
  padding: 0 25px;
  border-radius: 10px;
  font-weight: 700;
}

/* TABLET */

@media (max-width: 1199px) {
  .dashboard-editorial {
    padding: 22px 20px;
  }

  .dashboard-hero-card {
    min-height: 230px;
  }

  .dashboard-stat-card {
    min-height: 125px;
  }

  .dashboard-right-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 16px;
  }

  .dashboard-right-column > .ant-space-item:last-child {
    grid-column: 1 / -1;
  }
}

/* MOBILE */

@media (max-width: 767px) {
  .dashboard-editorial {
    padding: 16px 12px;
  }

  .dashboard-top-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
  }

  .dashboard-heading {
    width: 100%;
  }

  .dashboard-main-title {
    font-size: 23px !important;
    line-height: 1.35 !important;
  }

  .dashboard-sub-title {
    font-size: 11px;
  }

  .dashboard-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .clock-card {
    flex: 1;
    min-width: 0;
  }

  .clock-card .ant-card-body {
    padding: 10px 12px !important;
  }

  .clock-avatar {
    width: 36px !important;
    height: 36px !important;
  }

  .clock-time {
    font-size: 17px;
  }

  .clock-date {
    font-size: 9px;
  }

  .dashboard-refresh-button {
    height: 42px !important;
    padding: 0 12px !important;
    font-size: 11px;
  }

  .liturgical-banner {
    margin-bottom: 22px;
    border-radius: 15px !important;
  }

  .liturgical-banner .ant-card-body {
    padding: 19px !important;
  }

  .banner-title {
    font-size: 19px !important;
  }

  .banner-stat {
    padding: 10px;
  }

  .banner-stat div {
    font-size: 22px;
  }

  .dashboard-overview-title {
    font-size: 17px !important;
  }

  .dashboard-stat-section {
    margin-bottom: 23px;
  }

  .dashboard-hero-card {
    min-height: 215px;
    padding: 20px;
  }

  .hero-content {
    margin: 18px 0;
  }

  .hero-title {
    font-size: 18px !important;
  }

  .hero-number {
    font-size: 34px;
  }

  .dashboard-stat-card {
    min-height: 118px;
    border-radius: 13px !important;
  }

  .dashboard-stat-card .ant-card-body {
    padding: 12px !important;
  }

  .dashboard-stat-icon {
    width: 33px;
    height: 33px;
    font-size: 15px;
  }

  .dashboard-stat-label {
    font-size: 9px;
  }

  .dashboard-stat-value {
    font-size: 22px;
  }

  .dashboard-content-heading {
    margin-top: 23px;
  }

  .dashboard-panel {
    border-radius: 14px !important;
  }

  .dashboard-panel > .ant-card-head {
    padding: 0 13px;
  }

  .dashboard-panel > .ant-card-head .ant-card-head-title {
    padding: 13px 0;
  }

  .dashboard-panel > .ant-card-body {
    padding: 13px !important;
  }

  .dashboard-section-text {
    font-size: 11px;
  }

  .sacred-status-tag {
    font-size: 8px !important;
  }

  .event-item {
    gap: 9px;
    padding: 10px;
  }

  .event-time-box {
    width: 61px;
    min-width: 61px;
    min-height: 62px;
  }

  .event-time {
    font-size: 15px;
  }

  .event-date {
    font-size: 8px;
  }

  .event-title {
    font-size: 10px;
  }

  .event-meta {
    font-size: 9px;
    gap: 5px 8px;
  }

  .event-arrow {
    width: 23px;
    height: 23px;
    font-size: 9px;
  }

  .dashboard-right-column {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .dashboard-right-column > .ant-space-item:last-child {
    grid-column: auto;
  }

  .monthly-stat {
    min-height: 100px;
  }

  .month-value {
    font-size: 21px;
  }

  .dashboard-footer {
    align-items: flex-start;
    flex-direction: column;
    padding-top: 17px;
  }
}

/* SMALL MOBILE */

@media (max-width: 420px) {
  .dashboard-editorial {
    padding: 12px 9px;
  }

  .sacred-badge {
    padding: 6px 9px;
    font-size: 8px;
  }

  .dashboard-main-title {
    font-size: 20px !important;
  }

  .dashboard-sub-title {
    font-size: 10px;
  }

  .dashboard-stat-card {
    min-height: 110px;
  }

  .dashboard-stat-card .ant-card-body {
    padding: 10px !important;
  }

  .dashboard-stat-value {
    font-size: 20px;
  }

  .dashboard-stat-label {
    font-size: 8px;
  }

  .dashboard-stat-icon {
    width: 30px;
    height: 30px;
    font-size: 14px;
  }

  .event-item {
    gap: 7px;
    padding: 8px;
  }

  .event-time-box {
    width: 53px;
    min-width: 53px;
    min-height: 57px;
    padding: 5px;
  }

  .event-time {
    font-size: 13px;
  }

  .event-title {
    font-size: 9px;
  }

  .event-meta {
    font-size: 8px;
  }

  .event-arrow {
    width: 20px;
    height: 20px;
  }

  .dashboard-panel > .ant-card-head {
    padding: 0 10px;
  }

  .dashboard-panel > .ant-card-body {
    padding: 10px !important;
  }

  .dashboard-section-icon {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .dashboard-section-text {
    font-size: 10px;
  }

  .sacred-status-tag {
    padding: 3px 6px !important;
    font-size: 7px !important;
  }

  .dashboard-date-tag {
    font-size: 9px;
    padding: 5px 8px;
  }

  .drawer-descriptions .ant-descriptions-item-label {
    width: 90px;
  }
}

/* DRAWER MOBILE */

@media (max-width: 576px) {
  .event-detail-drawer {
    max-width: 100vw;
  }

  .event-detail-drawer .ant-drawer-content-wrapper {
    width: 100% !important;
  }

  .event-detail-drawer .ant-drawer-body {
    padding: 15px !important;
  }

  .drawer-hero {
    padding: 17px;
  }

  .drawer-event-title {
    font-size: 17px !important;
  }
}

/* MOTION ACCESSIBILITY */

@media (prefers-reduced-motion: reduce) {
  .dashboard-stat-card,
  .event-item,
  .monthly-stat,
  .event-arrow {
    transition: none !important;
  }
}
`;

export default Dashboard;
