import React, { useCallback, useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Tag,
  Typography,
  Spin,
  Empty,
  List,
  Avatar,
  Space,
  Divider,
  Badge,
  Drawer,
  Descriptions,
  Button,
  ConfigProvider,
  Timeline,
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
} from "@ant-design/icons";

import { getDashboard } from "../api/dashboardApi";
import { getVisitorStats } from "../api/statApi";
import socket from "../socket/socket";

import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(dayjs());

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

  // ==============================
  // FETCH DASHBOARD
  // ==============================
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (error) {
      console.error("Dashboard error:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================
  // FETCH VISITOR STATS
  // ==============================
  const fetchVisitorStats = useCallback(async () => {
    try {
      const res = await getVisitorStats();

      console.log("VISITOR:", res?.data);

      if (res?.data?.success) {
        setVisitorStats((prev) => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (error) {
      console.error("Visitor stats error:", error);
    }
  }, []);

  // ==============================
  // INIT
  // ==============================
  useEffect(() => {
    fetchDashboard();
    fetchVisitorStats();

    const handleOnlineCount = (count) => {
      console.log("ONLINE:", count);
      setOnlineUsers(Number(count) || 0);
    };

    socket.on("onlineCount", handleOnlineCount);

    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.off("onlineCount", handleOnlineCount);
    };
  }, [fetchDashboard, fetchVisitorStats]);

  // ==============================
  // EVENT DETAIL
  // ==============================
  const showDetail = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const closeDetail = () => {
    setIsDrawerOpen(false);
  };

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="dashboard-loading-screen">
        <Space direction="vertical" align="center" size="middle">
          <Spin size="large" />
          <Text className="loading-text">
            Đang khởi tạo Trung tâm Điều hành Giáo xứ...
          </Text>
        </Space>
      </div>
    );
  }

  // ==============================
  // ERROR / EMPTY
  // ==============================
  if (!data || !data.success) {
    return (
      <div className="dashboard-loading-screen">
        <Empty description="Không thể tải dữ liệu hệ thống hoặc dữ liệu trống" />
        <Button
          type="primary"
          onClick={() => {
            setLoading(true);
            fetchDashboard();
          }}
          style={{ marginTop: 16, background: primaryNavy }}
        >
          Thử tải lại
        </Button>
      </div>
    );
  }

  const {
    stats = {},
    recentEvents = [],
    recentGroups = [],
    upcomingEvents = [],
    currentWeekSchedule,
    monthlyEvents = [],
  } = data;

  const statisticCards = [
    {
      title: "Cơ sở Giáo xứ/Họ",
      value: stats.totalChurches || 0,
      icon: <HomeOutlined />,
      color: primaryNavy,
      bg: "rgba(27, 54, 93, 0.08)",
    },
    {
      title: "Đoàn thể & Hội nhóm",
      value: stats.totalGroups || 0,
      icon: <TeamOutlined />,
      color: "#8b5cf6",
      bg: "#f5f3ff",
    },
    {
      title: "Sự kiện & Ngày lễ",
      value: stats.totalEvents || 0,
      icon: <CalendarOutlined />,
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      title: "Ý nguyện & Kinh cầu",
      value: stats.totalPrayers || 0,
      icon: <FileTextOutlined />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      title: "Khách ghé thăm",
      value: stats.totalVisitors || 0,
      icon: <GlobalOutlined />,
      color: "#0284c7",
      bg: "#f0f9ff",
    },
    {
      title: "Ban quản trị",
      value: `${stats.activeAdmins || 0}/${stats.totalAdmins || 0}`,
      icon: <UserOutlined />,
      color: "#475569",
      bg: "#f8fafc",
    },
    {
      title: "Tổng lượt truy cập",
      value: visitorStats.totalVisitors ?? visitorStats.totalVisits ?? 0,
      icon: <EyeOutlined />,
      color: "#0284c7",
      bg: "#f0f9ff",
    },
    {
      title: "Hôm nay",
      value: visitorStats.todayVisitors ?? visitorStats.todayVisits ?? 0,
      icon: <GlobalOutlined />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Đang online",
      value: onlineUsers,
      icon: <UserOutlined />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 16,
          colorPrimary: primaryNavy,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="dashboard-editorial-layout">
        <div className="dashboard-container">
          {/* ==============================
              1. TOP HEADER
          ============================== */}
          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
            className="dashboard-top-header"
          >
            <Col xs={24} md={16}>
              <span className="sacred-badge">
                <CompassOutlined />
                TRUNG TÂM ĐIỀU HÀNH MỤC VỤ
              </span>

              <Title level={2} className="dashboard-main-title">
                BẢNG ĐIỀU HÀNH GIÁO XỨ
              </Title>

              <Text className="dashboard-sub-title">
                Xin chào quản trị viên, chúc bạn một ngày tràn đầy hồng ân và an
                lành!
              </Text>
            </Col>

            <Col xs={24} md={8} className="clock-column">
              <Card bordered={false} className="clock-editorial-card">
                <Space size="middle" align="center">
                  <Avatar
                    className="clock-avatar"
                    icon={<ClockCircleOutlined />}
                  />

                  <div className="clock-content">
                    <Text strong className="clock-time-display">
                      {currentTime.format("HH:mm:ss")}
                    </Text>

                    <Text type="secondary" className="clock-date-display">
                      {currentTime.format("dddd, [Ngày] DD/MM/YYYY")}
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* ==============================
              2. CURRENT WEEK SCHEDULE
          ============================== */}
          {currentWeekSchedule && (
            <Card bordered={false} className="liturgical-banner-card">
              <Row align="middle" justify="space-between" gutter={[20, 20]}>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={8}>
                    <Space align="center" wrap>
                      <CarryOutOutlined className="banner-icon" />

                      <Text className="banner-tag-label">
                        LỊCH PHỤNG VỤ TUẦN HIỆN TẠI
                      </Text>

                      <Tag
                        className={`status-pill-tag ${
                          currentWeekSchedule.status === "DRAFT"
                            ? "tag-draft"
                            : "tag-published"
                        }`}
                      >
                        {currentWeekSchedule.status === "DRAFT"
                          ? "BẢN NHÁP"
                          : "ĐÃ XUẤT BẢN"}
                      </Tag>
                    </Space>

                    <Title level={3} className="banner-schedule-title">
                      {currentWeekSchedule.title}
                    </Title>

                    <Text className="banner-date-range">
                      Thời gian áp dụng:{" "}
                      <strong>
                        {dayjs(currentWeekSchedule.week_start).format(
                          "DD/MM/YYYY",
                        )}
                      </strong>{" "}
                      — Đến:{" "}
                      <strong>
                        {dayjs(currentWeekSchedule.week_end).format(
                          "DD/MM/YYYY",
                        )}
                      </strong>
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <Row
                    gutter={[16, 12]}
                    justify="start"
                    align="middle"
                    className="banner-statistics"
                  >
                    <Col flex="1">
                      <Statistic
                        title={
                          <Text className="banner-stat-title">
                            LỊCH ĐÃ ĐĂNG
                          </Text>
                        }
                        value={stats.publishedSchedules || 0}
                        valueStyle={{
                          color: accentGold,
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 28,
                        }}
                      />
                    </Col>

                    <Divider type="vertical" className="banner-stat-divider" />

                    <Col flex="1">
                      <Statistic
                        title={
                          <Text className="banner-stat-title">
                            LƯỢT TRUY CẬP
                          </Text>
                        }
                        value={stats.totalVisits || 0}
                        valueStyle={{
                          color: "#ffffff",
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 28,
                        }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          )}

          {/* ==============================
              3. BENTO STATISTICS
          ============================== */}
          <Row gutter={[20, 20]} className="dashboard-bento-section">
            <Col xs={24} lg={8}>
              <div className="bento-hero-card">
                <div className="bento-hero-bg-icon">
                  <ProjectOutlined />
                </div>

                <div className="bento-hero-content">
                  <Tag className="bento-hero-tag">Trọng tâm hệ thống</Tag>

                  <Title level={3} className="bento-hero-title">
                    Dữ liệu Lịch Phụng Vụ
                  </Title>

                  <Text className="bento-hero-desc">
                    Tổng số chương trình phân phối hoạt động tôn giáo của các cơ
                    sở trực thuộc.
                  </Text>
                </div>

                <div className="bento-hero-stat">
                  <span className="bento-hero-stat-value">
                    {stats.totalLiturgicalSchedules || 0}
                  </span>

                  <span className="bento-hero-stat-label">
                    Danh mục chương trình
                  </span>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={16}>
              <Row gutter={[12, 12]}>
                {statisticCards.map((item, index) => (
                  <Col xs={12} sm={8} lg={8} key={`${item.title}-${index}`}>
                    <Card
                      bordered={false}
                      className="bento-small-card"
                      bodyStyle={{ padding: "16px" }}
                    >
                      <div className="bento-small-card-content">
                        <div
                          className="bento-small-icon-box"
                          style={{
                            background: item.bg,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </div>

                        <div className="bento-small-info">
                          <Text type="secondary" className="bento-small-title">
                            {item.title}
                          </Text>

                          <Text strong className="bento-small-value">
                            {item.value}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {/* ==============================
              4. MAIN CONTENT
          ============================== */}
          <Row gutter={[20, 20]} className="dashboard-main-content">
            {/* UPCOMING EVENTS */}
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div className="section-card-header">
                    <CalendarOutlined />
                    <span>Chương trình Phụng vụ sắp tới</span>
                  </div>
                }
                bordered={false}
                extra={
                  <Tag className="sacred-status-pill">
                    Hôm nay & Sắp diễn ra
                  </Tag>
                }
                className="editorial-main-card"
              >
                <div className="event-list custom-scroll">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Card
                        key={event.id}
                        size="small"
                        bordered={false}
                        onClick={() => showDetail(event)}
                        className="event-item-card"
                        bodyStyle={{ padding: "14px 16px" }}
                      >
                        <Row align="middle" gutter={[12, 12]}>
                          <Col xs={5} sm={4} className="event-time-column">
                            <Title level={3} className="event-time-display">
                              {event.event_time
                                ? event.event_time.substring(0, 5)
                                : "--:--"}
                            </Title>

                            <Text
                              type="secondary"
                              className="event-date-display"
                            >
                              {dayjs(event.event_date).format("DD/MM/YYYY")}
                            </Text>
                          </Col>

                          <Col xs={17} sm={18}>
                            <Space
                              direction="vertical"
                              size={6}
                              className="event-info"
                            >
                              <Space wrap align="center">
                                <Text strong className="event-item-title">
                                  {event.title}
                                </Text>

                                {event.is_priority === 1 && (
                                  <Tag color="error" className="priority-pill">
                                    Ưu Tiên / Lễ Trọng
                                  </Tag>
                                )}

                                <Tag className="type-pill">
                                  {event.type === "THUONG"
                                    ? "Lễ Thường"
                                    : event.type}
                                </Tag>
                              </Space>

                              <Space
                                wrap
                                size={[12, 6]}
                                className="event-extra-info"
                              >
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
                              </Space>
                            </Space>
                          </Col>

                          <Col xs={2} sm={2} className="event-arrow-column">
                            <RightOutlined />
                          </Col>
                        </Row>
                      </Card>
                    ))
                  ) : (
                    <Empty
                      description="Không có sự kiện phụng vụ sắp tới"
                      className="event-empty"
                    />
                  )}
                </div>
              </Card>
            </Col>

            {/* RIGHT CONTENT */}
            <Col xs={24} lg={9}>
              <Space
                direction="vertical"
                className="dashboard-right-column"
                size={20}
              >
                {/* MONTHLY EVENTS */}
                {monthlyEvents && (
                  <Card
                    title={
                      <div className="section-card-header">
                        <PieChartOutlined />
                        <span>Thống kê sự kiện theo tháng</span>
                      </div>
                    }
                    bordered={false}
                    className="editorial-main-card"
                  >
                    <Row gutter={[12, 12]}>
                      {monthlyEvents.map((item, index) => (
                        <Col
                          xs={12}
                          key={`${item.month}-${index}`}
                          className="monthly-column"
                        >
                          <div className="monthly-stat-box">
                            <Text type="secondary" className="month-label">
                              Tháng {item.month}
                            </Text>

                            <Text strong className="month-value">
                              {item.total}
                            </Text>

                            <Text type="secondary" className="month-unit">
                              Sự kiện phụng vụ
                            </Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}

                {/* RECENT GROUPS */}
                <Card
                  title={
                    <div className="section-card-header">
                      <TeamOutlined />
                      <span>Hội đoàn mới lập gần đây</span>
                    </div>
                  }
                  bordered={false}
                  className="editorial-main-card"
                >
                  <div className="group-list custom-scroll">
                    {recentGroups.length > 0 ? (
                      <List
                        itemLayout="horizontal"
                        dataSource={recentGroups}
                        renderItem={(group) => (
                          <List.Item className="group-list-item">
                            <List.Item.Meta
                              avatar={
                                <Avatar
                                  className="group-avatar"
                                  icon={<TeamOutlined />}
                                />
                              }
                              title={
                                <Text strong className="group-name">
                                  {group.name}
                                </Text>
                              }
                              description={`Khởi tạo: ${dayjs(
                                group.created_at,
                              ).format("DD/MM/YYYY")}`}
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có hội đoàn"
                      />
                    )}
                  </div>
                </Card>

                {/* RECENT ACTIVITIES */}
                <Card
                  title={
                    <div className="section-card-header">
                      <NotificationOutlined />
                      <span>Nhật ký hoạt động hệ thống</span>
                    </div>
                  }
                  bordered={false}
                  className="editorial-main-card"
                >
                  <div className="activity-list custom-scroll">
                    {recentEvents.length > 0 ? (
                      <Timeline
                        className="dashboard-editorial-timeline"
                        items={recentEvents.map((item) => ({
                          color: primaryNavy,
                          children: (
                            <div className="timeline-item-row">
                              <div className="timeline-item-content">
                                <Text strong className="timeline-item-title">
                                  {item.title}
                                </Text>

                                <Text
                                  type="secondary"
                                  className="timeline-item-date"
                                >
                                  Diễn ra:{" "}
                                  {dayjs(item.event_date).format("DD/MM/YYYY")}
                                </Text>
                              </div>

                              <Tag className="timeline-date-tag">
                                {dayjs(item.created_at).format("DD/MM")}
                              </Tag>
                            </div>
                          ),
                        }))}
                      />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có hoạt động"
                      />
                    )}
                  </div>
                </Card>
              </Space>
            </Col>
          </Row>

          {/* ==============================
              5. EVENT DETAIL DRAWER
          ============================== */}
          <Drawer
            title={
              <div className="drawer-title-box">
                <InfoCircleOutlined />
                <span>Chi Tiết Lịch Phụng Vụ</span>
              </div>
            }
            onClose={closeDetail}
            open={isDrawerOpen}
            width={460}
            className="event-detail-drawer"
            placement="right"
            destroyOnClose
          >
            {selectedEvent && (
              <Space
                direction="vertical"
                size="large"
                className="drawer-content"
              >
                <div className="drawer-hero-box">
                  <Text type="secondary" className="drawer-hero-label">
                    Tên chương trình / Thánh lễ
                  </Text>

                  <Title level={4} className="drawer-hero-title">
                    {selectedEvent.title}
                  </Title>
                </div>

                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="drawer-descriptions-box"
                >
                  <Descriptions.Item label="Mã ID">
                    #{selectedEvent.id}
                  </Descriptions.Item>

                  <Descriptions.Item label="Thời gian">
                    <Text strong className="drawer-event-time">
                      {selectedEvent.event_time
                        ? selectedEvent.event_time.substring(0, 5)
                        : "--:--"}
                    </Text>

                    <div className="drawer-event-date">
                      {dayjs(selectedEvent.event_date).format(
                        "dddd, [Ngày] DD/MM/YYYY",
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa điểm">
                    {selectedEvent.church_name || "Nơi chốn chưa cập nhật"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Chủ tế">
                    {selectedEvent.priest || "Đang cập nhật linh mục"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Ưu tiên">
                    <Badge
                      status={
                        selectedEvent.is_priority === 1 ? "error" : "default"
                      }
                      text={
                        selectedEvent.is_priority === 1
                          ? "Lễ Trọng / Khẩn cấp"
                          : "Thông thường"
                      }
                    />
                  </Descriptions.Item>

                  <Descriptions.Item label="Phân loại">
                    <Tag
                      color={selectedEvent.type === "THUONG" ? "blue" : "gold"}
                    >
                      {selectedEvent.type === "THUONG"
                        ? "Lễ Thường nhật"
                        : "Lễ Đặc biệt"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>

                <Card bordered={false} className="drawer-notice-card">
                  <Space align="start">
                    <InfoCircleOutlined className="drawer-notice-icon" />

                    <Paragraph
                      type="secondary"
                      className="drawer-notice-text"
                      italic
                    >
                      Mọi thông tin sửa đổi tại bảng điều khiển sẽ ảnh hưởng
                      trực tiếp đến dữ liệu hiển thị trên ứng dụng của Giáo dân.
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

      {/* ==============================
          6. RESPONSIVE STYLES
      ============================== */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        * {
          box-sizing: border-box;
        }

        .dashboard-loading-screen {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 24px;
          background: ${softBg};
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .loading-text {
          color: ${primaryNavy};
          font-weight: 600;
          text-align: center;
        }

        .dashboard-editorial-layout {
          width: 100%;
          min-height: 100vh;
          padding: 32px 20px 64px;
          background: ${softBg};
          font-family: 'Be Vietnam Pro', sans-serif;
          color: ${textDark};
          overflow-x: hidden;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
        }

        /* HEADER */

        .dashboard-top-header {
          margin-bottom: 28px;
        }

        .sacred-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          margin-bottom: 10px;
          border: 1px solid ${accentGold};
          border-radius: 20px;
          background: rgba(212, 175, 55, 0.15);
          color: ${primaryNavy};
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .dashboard-main-title {
          margin: 0 !important;
          color: ${primaryNavy} !important;
          font-family: 'Playfair Display', Georgia, serif !important;
          font-size: clamp(24px, 3.5vw, 32px) !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
        }

        .dashboard-sub-title {
          display: block;
          margin-top: 8px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
        }

        .clock-column {
          display: flex;
          justify-content: flex-end;
        }

        .clock-editorial-card {
          display: inline-block;
          width: auto;
          border: 1px solid rgba(212, 175, 55, 0.25) !important;
          border-radius: 16px !important;
          background: #ffffff !important;
          box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04) !important;
        }

        .clock-editorial-card .ant-card-body {
          padding: 14px 18px;
        }

        .clock-avatar {
          flex-shrink: 0;
          border: 1px solid ${accentGold};
          background: rgba(212, 175, 55, 0.15);
          color: ${primaryNavy};
        }

        .clock-content {
          min-width: 0;
        }

        .clock-time-display {
          display: block;
          color: ${primaryNavy};
          font-family: monospace;
          font-size: 18px;
          line-height: 1.3;
        }

        .clock-date-display {
          display: block;
          text-transform: capitalize;
          font-size: 12px;
        }

        /* WEEK BANNER */

        .liturgical-banner-card {
          margin-bottom: 28px;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 20px !important;
          background: linear-gradient(135deg, ${primaryNavy} 0%, #2a4d80 100%) !important;
          box-shadow: 0 10px 30px rgba(27, 54, 93, 0.15) !important;
        }

        .liturgical-banner-card .ant-card-body {
          padding: 26px 28px;
        }

        .banner-icon {
          color: ${accentGold};
          font-size: 20px;
        }

        .banner-tag-label {
          color: ${accentGold};
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .status-pill-tag {
          border-radius: 12px;
          font-weight: 600;
        }

        .tag-published {
          border-color: #b7eb8f !important;
          background: #f6ffed !important;
          color: #276749 !important;
        }

        .tag-draft {
          border-color: #ffe58f !important;
          background: #fffbe6 !important;
          color: #d48806 !important;
        }

        .banner-schedule-title {
          margin: 4px 0 0 !important;
          color: #ffffff !important;
          font-family: 'Playfair Display', serif !important;
          font-weight: 700 !important;
          overflow-wrap: anywhere;
        }

        .banner-date-range {
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          line-height: 1.7;
        }

        .banner-statistics {
          width: 100%;
        }

        .banner-stat-title {
          color: rgba(255, 255, 255, 0.7);
          font-size: 11px;
          letter-spacing: 1px;
        }

        .banner-stat-divider {
          height: 40px;
          margin: 0 8px;
          border-inline-start-color: rgba(212, 175, 55, 0.3);
        }

        /* BENTO */

        .dashboard-bento-section {
          margin-bottom: 28px;
        }

        .bento-hero-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          min-height: 300px;
          padding: 28px 24px;
          overflow: hidden;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 20px;
          background: linear-gradient(135deg, ${primaryNavy} 0%, #0f2342 100%);
          box-shadow: 0 10px 25px rgba(27, 54, 93, 0.12);
          color: #ffffff;
        }

        .bento-hero-content {
          position: relative;
          z-index: 1;
        }

        .bento-hero-bg-icon {
          position: absolute;
          right: -20px;
          bottom: -20px;
          color: #ffffff;
          font-size: 130px;
          opacity: 0.08;
          pointer-events: none;
        }

        .bento-hero-tag {
          margin-bottom: 12px;
          border: 1px solid ${accentGold} !important;
          border-radius: 10px;
          background: rgba(212, 175, 55, 0.2) !important;
          color: #ffffff !important;
        }

        .bento-hero-title {
          margin: 0 0 8px !important;
          color: #ffffff !important;
          font-family: 'Playfair Display', serif !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
        }

        .bento-hero-desc {
          color: rgba(255, 255, 255, 0.75);
          font-size: 13px;
          line-height: 1.6;
        }

        .bento-hero-stat {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          margin-top: 24px;
        }

        .bento-hero-stat-value {
          color: ${accentGold};
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
        }

        .bento-hero-stat-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
        }

        .bento-small-card {
          height: 100%;
          border: 1px solid rgba(27, 54, 93, 0.08) !important;
          border-radius: 16px !important;
          background: #ffffff !important;
          box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bento-small-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(27, 54, 93, 0.08) !important;
        }

        .bento-small-card .ant-card-body {
          height: 100%;
        }

        .bento-small-card-content {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .bento-small-icon-box {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          font-size: 18px;
        }

        .bento-small-info {
          flex: 1;
          min-width: 0;
        }

        .bento-small-title {
          display: block;
          margin-bottom: 4px;
          overflow: hidden;
          font-size: 12px;
          line-height: 1.4;
          text-overflow: ellipsis;
        }

        .bento-small-value {
          display: block;
          color: ${primaryNavy};
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        /* MAIN CARDS */

        .editorial-main-card {
          border: 1px solid rgba(212, 175, 55, 0.25) !important;
          border-radius: 20px !important;
          background: #ffffff !important;
          box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
        }

        .editorial-main-card .ant-card-head {
          min-height: 58px;
          padding: 0 20px;
        }

        .editorial-main-card .ant-card-head-title {
          min-width: 0;
          padding: 16px 0;
          white-space: normal;
        }

        .editorial-main-card .ant-card-extra {
          padding: 12px 0;
        }

        .editorial-main-card .ant-card-body {
          padding: 20px;
        }

        .section-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${primaryNavy};
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
        }

        .section-card-header .anticon {
          flex-shrink: 0;
          color: ${accentGold};
        }

        .sacred-status-pill {
          border: none !important;
          border-radius: 12px;
          background: rgba(27, 54, 93, 0.06) !important;
          color: ${primaryNavy} !important;
          font-size: 11px;
          font-weight: 600;
        }

        /* UPCOMING EVENTS */

        .event-list {
          height: 540px;
          padding-right: 6px;
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .event-item-card {
          margin-bottom: 12px;
          border: 1px solid rgba(27, 54, 93, 0.08) !important;
          border-radius: 14px !important;
          background: ${softBg} !important;
          cursor: pointer;
          transition: all 0.25s ease !important;
        }

        .event-item-card:hover {
          transform: translateY(-2px);
          border-color: ${accentGold} !important;
          background: #ffffff !important;
          box-shadow: 0 6px 18px rgba(27, 54, 93, 0.08) !important;
        }

        .event-time-column {
          text-align: center;
          border-right: 1px solid rgba(27, 54, 93, 0.1);
        }

        .event-time-display {
          margin: 0 !important;
          color: ${primaryNavy} !important;
          font-family: 'Playfair Display', serif !important;
          font-size: 24px !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
        }

        .event-date-display {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .event-info {
          width: 100%;
          min-width: 0;
        }

        .event-item-title {
          color: ${primaryNavy};
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .priority-pill,
        .type-pill {
          border-radius: 8px;
          font-size: 10px;
        }

        .type-pill {
          border: 1px solid ${accentGold};
          background: rgba(212, 175, 55, 0.12);
          color: ${primaryNavy};
        }

        .event-extra-info {
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .event-extra-info span {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          overflow-wrap: anywhere;
        }

        .event-extra-info .anticon {
          flex-shrink: 0;
          color: ${primaryNavy};
        }

        .event-arrow-column {
          text-align: right;
          color: ${accentGold};
        }

        .event-empty {
          margin-top: 80px;
        }

        /* RIGHT COLUMN */

        .dashboard-right-column {
          display: flex;
          width: 100%;
        }

        .monthly-stat-box {
          height: 100%;
          padding: 12px;
          border: 1px solid rgba(27, 54, 93, 0.08);
          border-radius: 14px;
          background: ${softBg};
          text-align: center;
        }

        .month-label,
        .month-value,
        .month-unit {
          display: block;
        }

        .month-label {
          margin-bottom: 2px;
          font-size: 12px;
        }

        .month-value {
          color: ${primaryNavy};
          font-family: 'Playfair Display', serif;
          font-size: 24px;
        }

        .month-unit {
          font-size: 11px;
        }

        .group-list {
          height: 180px;
          overflow-y: auto;
        }

        .group-list-item {
          padding: 8px 0 !important;
          border-bottom: 1px dashed rgba(27, 54, 93, 0.1) !important;
        }

        .group-avatar {
          background: rgba(27, 54, 93, 0.08);
          color: ${primaryNavy};
        }

        .group-name {
          color: ${primaryNavy};
          overflow-wrap: anywhere;
        }

        .activity-list {
          height: 200px;
          padding-top: 6px;
          overflow-y: auto;
        }

        .dashboard-editorial-timeline .ant-timeline-item {
          padding-bottom: 14px !important;
        }

        .timeline-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .timeline-item-content {
          flex: 1;
          min-width: 0;
        }

        .timeline-item-title {
          display: block;
          color: ${primaryNavy};
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .timeline-item-date {
          display: block;
          margin-top: 3px;
          font-size: 11px;
        }

        .timeline-date-tag {
          flex-shrink: 0;
          margin: 0;
          border-radius: 6px;
          font-size: 10px;
        }

        /* DRAWER */

        .drawer-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${primaryNavy};
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
        }

        .drawer-title-box .anticon {
          color: ${accentGold};
        }

        .drawer-content {
          display: flex;
          width: 100%;
        }

        .drawer-hero-box {
          padding: 16px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 14px;
          background: ${softBg};
          text-align: center;
        }

        .drawer-hero-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .drawer-hero-title {
          margin: 6px 0 0 !important;
          color: ${primaryNavy} !important;
          font-family: 'Playfair Display', serif !important;
          overflow-wrap: anywhere;
        }

        .drawer-descriptions-box {
          overflow: hidden;
          border-radius: 12px;
        }

        .drawer-event-time {
          color: ${primaryNavy};
          font-size: 16px;
        }

        .drawer-event-date {
          color: #64748b;
          font-size: 13px;
        }

        .drawer-notice-card {
          border: 1px dashed ${accentGold} !important;
          border-radius: 12px !important;
          background: #fffbe6 !important;
        }

        .drawer-notice-icon {
          margin-top: 3px;
          color: ${accentGold};
        }

        .drawer-notice-text {
          margin: 0;
          font-size: 13px;
        }

        .drawer-close-button {
          height: 44px;
          border-radius: 10px;
          background: ${primaryNavy};
          font-weight: 700;
        }

        /* SCROLLBAR */

        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(212, 175, 55, 0.4) transparent;
        }

        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
          border-radius: 4px;
          background: rgba(212, 175, 55, 0.4);
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: ${accentGold};
        }

        /* ==============================
           TABLET
        ============================== */

        @media (max-width: 991px) {
          .dashboard-editorial-layout {
            padding: 24px 16px 48px;
          }

          .dashboard-container {
            max-width: 100%;
          }

          .dashboard-top-header {
            margin-bottom: 22px;
          }

          .clock-editorial-card {
            width: 100%;
          }

          .clock-column {
            justify-content: flex-start;
          }

          .liturgical-banner-card .ant-card-body {
            padding: 22px;
          }

          .bento-hero-card {
            min-height: 260px;
          }

          .bento-small-card .ant-card-body {
            padding: 14px !important;
          }

          .bento-small-card-content {
            gap: 9px;
          }

          .bento-small-icon-box {
            width: 38px;
            height: 38px;
            font-size: 16px;
          }

          .bento-small-title {
            font-size: 11px;
          }

          .bento-small-value {
            font-size: 19px;
          }

          .event-list {
            height: 480px;
          }

          .dashboard-right-column {
            gap: 16px;
          }
        }

        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 767px) {
          .dashboard-editorial-layout {
            padding: 18px 12px 36px;
          }

          .dashboard-top-header {
            margin-bottom: 18px;
          }

          .sacred-badge {
            padding: 4px 10px;
            font-size: 9px;
            letter-spacing: 0.5px;
          }

          .dashboard-main-title {
            font-size: 23px !important;
          }

          .dashboard-sub-title {
            font-size: 12px;
          }

          .clock-editorial-card {
            width: 100%;
          }

          .clock-editorial-card .ant-card-body {
            padding: 10px 14px;
          }

          .clock-time-display {
            font-size: 17px;
          }

          .clock-date-display {
            font-size: 11px;
          }

          .liturgical-banner-card {
            margin-bottom: 18px;
            border-radius: 16px !important;
          }

          .liturgical-banner-card .ant-card-body {
            padding: 18px 16px;
          }

          .banner-tag-label {
            font-size: 10px;
            letter-spacing: 0.5px;
          }

          .banner-schedule-title {
            font-size: 21px !important;
          }

          .banner-date-range {
            font-size: 12px;
          }

          .banner-statistics {
            justify-content: space-between;
          }

          .banner-statistics .ant-statistic {
            min-width: 0;
          }

          .banner-statistics .ant-statistic-content {
            font-size: 23px !important;
          }

          .banner-stat-divider {
            height: 34px;
            margin: 0 4px;
          }

          .dashboard-bento-section {
            margin-bottom: 18px;
          }

          .bento-hero-card {
            min-height: 220px;
            padding: 22px 18px;
            border-radius: 16px;
          }

          .bento-hero-title {
            font-size: 21px !important;
          }

          .bento-hero-stat-value {
            font-size: 40px;
          }

          .bento-hero-stat-label {
            font-size: 11px;
          }

          .bento-small-card {
            border-radius: 13px !important;
          }

          .bento-small-card .ant-card-body {
            padding: 12px !important;
          }

          .bento-small-card-content {
            align-items: flex-start;
            gap: 8px;
          }

          .bento-small-icon-box {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            font-size: 14px;
          }

          .bento-small-title {
            min-height: 30px;
            font-size: 10px;
            line-height: 1.4;
          }

          .bento-small-value {
            font-size: 18px;
          }

          .dashboard-main-content {
            row-gap: 16px;
          }

          .editorial-main-card {
            border-radius: 16px !important;
          }

          .editorial-main-card .ant-card-head {
            padding: 0 14px;
          }

          .editorial-main-card .ant-card-head-title {
            padding: 13px 0;
          }

          .editorial-main-card .ant-card-extra {
            padding: 10px 0;
          }

          .editorial-main-card .ant-card-body {
            padding: 14px;
          }

          .section-card-header {
            gap: 6px;
            font-size: 14px;
          }

          .sacred-status-pill {
            font-size: 9px;
            padding-inline: 6px;
          }

          .event-list {
            height: min(60vh, 460px);
            padding-right: 2px;
          }

          .event-item-card {
            margin-bottom: 9px;
            border-radius: 12px !important;
          }

          .event-item-card .ant-card-body {
            padding: 11px !important;
          }

          .event-time-display {
            font-size: 19px !important;
          }

          .event-date-display {
            font-size: 9px;
          }

          .event-item-title {
            font-size: 12px;
          }

          .event-extra-info {
            gap: 4px 10px !important;
            font-size: 10px;
          }

          .priority-pill,
          .type-pill {
            padding-inline: 5px;
            font-size: 9px;
          }

          .event-arrow-column {
            font-size: 11px;
          }

          .event-empty {
            margin-top: 45px;
          }

          .dashboard-right-column {
            gap: 16px;
          }

          .group-list {
            height: 160px;
          }

          .activity-list {
            height: 180px;
          }

          .monthly-stat-box {
            padding: 10px 6px;
          }

          .month-value {
            font-size: 21px;
          }

          .month-unit {
            font-size: 10px;
          }

          .drawer-title-box {
            font-size: 16px;
          }

          .event-detail-drawer .ant-drawer-body {
            padding: 16px;
          }

          .drawer-hero-box {
            padding: 14px;
          }
        }

        /* ==============================
           SMALL MOBILE
        ============================== */

        @media (max-width: 480px) {
          .dashboard-editorial-layout {
            padding: 14px 9px 28px;
          }

          .dashboard-main-title {
            font-size: 21px !important;
          }

          .dashboard-sub-title {
            font-size: 11px;
          }

          .banner-stat-title {
            font-size: 9px;
          }

          .banner-statistics .ant-statistic-content {
            font-size: 21px !important;
          }

          .bento-hero-card {
            min-height: 205px;
          }

          .bento-small-card .ant-card-body {
            padding: 10px !important;
          }

          .bento-small-card-content {
            gap: 7px;
          }

          .bento-small-icon-box {
            width: 29px;
            height: 29px;
            font-size: 13px;
          }

          .bento-small-title {
            font-size: 9px;
          }

          .bento-small-value {
            font-size: 17px;
          }

          .editorial-main-card .ant-card-head {
            padding: 0 11px;
          }

          .editorial-main-card .ant-card-body {
            padding: 11px;
          }

          .section-card-header {
            font-size: 12px;
          }

          .sacred-status-pill {
            white-space: normal;
            line-height: 1.4;
            text-align: center;
          }

          .event-item-card .ant-card-body {
            padding: 9px !important;
          }

          .event-time-display {
            font-size: 17px !important;
          }

          .event-date-display {
            font-size: 8px;
          }

          .event-item-title {
            font-size: 11px;
          }

          .event-extra-info {
            font-size: 9px;
          }

          .event-info .ant-space-item {
            max-width: 100%;
          }

          .event-info .ant-space-item > .ant-space {
            max-width: 100%;
          }

          .event-list {
            height: 55vh;
          }

          .event-detail-drawer {
            max-width: 100vw;
          }

          .event-detail-drawer .ant-drawer-content-wrapper {
            width: 100% !important;
          }

          .event-detail-drawer .ant-drawer-body {
            padding: 12px;
          }

          .drawer-descriptions-box .ant-descriptions-item-label,
          .drawer-descriptions-box .ant-descriptions-item-content {
            padding: 8px !important;
            font-size: 11px;
          }

          .drawer-hero-title {
            font-size: 18px !important;
          }

          .drawer-notice-text {
            font-size: 11px;
          }
        }

        /* ==============================
           VERY SMALL MOBILE
        ============================== */

        @media (max-width: 360px) {
          .dashboard-editorial-layout {
            padding-inline: 7px;
          }

          .sacred-badge {
            font-size: 8px;
          }

          .dashboard-main-title {
            font-size: 19px !important;
          }

          .bento-small-card .ant-card-body {
            padding: 8px !important;
          }

          .bento-small-card-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .bento-small-title {
            min-height: auto;
          }

          .event-time-display {
            font-size: 15px !important;
          }

          .event-date-display {
            white-space: normal;
          }

          .event-item-title {
            font-size: 10px;
          }

          .event-extra-info {
            font-size: 8px;
          }
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Dashboard;
