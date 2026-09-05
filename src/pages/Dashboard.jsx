import React, { useEffect, useState } from "react";
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
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { getVisitorStats } from "../api/statApi";
import socket from "../socket/socket";
dayjs.locale("vi");
const { Title, Text, Paragraph } = Typography;

// Bảng màu thiết kế Tôn Nghiêm & Hiện Đại (Sacred Editorial Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
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
  });
  useEffect(() => {
    fetchDashboard();

    fetchVisitorStats();

    socket.on("onlineCount", (count) => {
      console.log("ONLINE:", count);
      setOnlineUsers(count);
    });

    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => {
      clearInterval(timer);
      socket.off("onlineCount");
    };
  }, []);
  const fetchVisitorStats = async () => {
    try {
      const res = await getVisitorStats();

      console.log("VISITOR:", res.data);

      if (res.data.success) {
        setVisitorStats(res.data.data);
      }
    } catch (error) {
      console.log("Visitor stats error:", error);
    }
  };
  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showDetail = (event) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  if (loading) {
    return (
      <div
        className="dashboard-loading-screen"
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <Space direction="vertical" align="center" size="middle">
          <Spin size="large" />
          <Text style={{ color: primaryNavy, fontWeight: 600 }}>
            Đang khởi tạo Trung tâm Điều hành Giáo xứ...
          </Text>
        </Space>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="dashboard-loading-screen">
        <Empty description="Không thể tải dữ liệu hệ thống hoặc dữ liệu trống" />
      </div>
    );
  }

  const {
    stats,
    recentEvents,
    recentGroups,
    upcomingEvents,
    currentWeekSchedule,
    monthlyEvents,
  } = data;

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
          {/* --- 1. TOP HEADER BAR --- */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 32 }}
            gutter={[16, 16]}
          >
            <Col xs={24} md={16}>
              <span className="sacred-badge">
                <CompassOutlined /> TRUNG TÂM ĐIỀU HÀNH MỤC VỤ
              </span>
              <Title level={2} className="dashboard-main-title">
                BẢNG ĐIỀU HÀNH GIÁO XỨ
              </Title>
              <Text className="dashboard-sub-title">
                Xin chào quản trị viên, chúc bạn một ngày tràn đầy hồng ân và an
                lành!
              </Text>
            </Col>

            <Col xs={24} md={8} style={{ textAlign: "right" }}>
              <Card bordered={false} className="clock-editorial-card">
                <Space size="middle" align="center">
                  <Avatar
                    style={{
                      backgroundColor: "rgba(212, 175, 55, 0.15)",
                      color: primaryNavy,
                      border: `1px solid ${accentGold}`,
                    }}
                    icon={<ClockCircleOutlined />}
                  />
                  <div style={{ textAlign: "left" }}>
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

          {/* --- 2. CURRENT WEEK SCHEDULE BANNER --- */}
          {currentWeekSchedule && (
            <Card bordered={false} className="liturgical-banner-card">
              <Row align="middle" justify="space-between" gutter={[20, 20]}>
                <Col xs={24} md={16}>
                  <Space direction="vertical" size={6}>
                    <Space align="center" wrap>
                      <CarryOutOutlined
                        style={{ fontSize: 20, color: accentGold }}
                      />
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
                    <Text
                      style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}
                    >
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
                  <Row gutter={16} justify="end" align="middle">
                    <Col>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: 11,
                              letterSpacing: 1,
                            }}
                          >
                            LỊCH ĐÃ ĐĂNG
                          </Text>
                        }
                        value={stats.publishedSchedules}
                        valueStyle={{
                          color: accentGold,
                          fontWeight: 700,
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 28,
                        }}
                      />
                    </Col>
                    <Divider
                      type="vertical"
                      style={{
                        height: 40,
                        backgroundColor: "rgba(212, 175, 55, 0.3)",
                        margin: "0 12px",
                      }}
                    />
                    <Col>
                      <Statistic
                        title={
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.7)",
                              fontSize: 11,
                              letterSpacing: 1,
                            }}
                          >
                            LƯỢT TRUY CẬP
                          </Text>
                        }
                        value={stats.totalVisits}
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

          {/* --- 3. BENTO GRID STATS --- */}
          <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
            {/* Cột trái: Khối tiêu điểm lớn */}
            <Col xs={24} lg={8}>
              <div className="bento-hero-card">
                <div className="bento-hero-bg-icon">
                  <ProjectOutlined />
                </div>
                <div>
                  <Tag className="bento-hero-tag">Trọng tâm hệ thống</Tag>
                  <Title level={3} className="bento-hero-title">
                    Dữ liệu Lịch Phụng Vụ
                  </Title>
                  <Text className="bento-hero-desc">
                    Tổng số chương trình phân phối hoạt động tôn giáo của các cơ
                    sở trực thuộc.
                  </Text>
                </div>
                <div style={{ marginTop: 24 }}>
                  <span className="bento-hero-stat-value">
                    {stats.totalLiturgicalSchedules}
                  </span>
                  <span className="bento-hero-stat-label">
                    Danh mục chương trình
                  </span>
                </div>
              </div>
            </Col>

            {/* Cột phải: Lưới 6 thẻ nhỏ */}
            <Col xs={24} lg={16}>
              <Row gutter={[16, 16]}>
                {[
                  {
                    title: "Cơ sở Giáo xứ/Họ",
                    value: stats.totalChurches,
                    icon: <HomeOutlined />,
                    color: primaryNavy,
                    bg: "rgba(27, 54, 93, 0.08)",
                  },
                  {
                    title: "Đoàn thể & Hội nhóm",
                    value: stats.totalGroups,
                    icon: <TeamOutlined />,
                    color: "#8b5cf6",
                    bg: "#f5f3ff",
                  },
                  {
                    title: "Sự kiện & Ngày lễ",
                    value: stats.totalEvents,
                    icon: <CalendarOutlined />,
                    color: "#d97706",
                    bg: "#fffbeb",
                  },
                  {
                    title: "Ý nguyện & Kinh cầu",
                    value: stats.totalPrayers,
                    icon: <FileTextOutlined />,
                    color: "#dc2626",
                    bg: "#fef2f2",
                  },
                  {
                    title: "Khách ghé thăm",
                    value: stats.totalVisitors,
                    icon: <GlobalOutlined />,
                    color: "#0284c7",
                    bg: "#f0f9ff",
                  },
                  {
                    title: "Ban quản trị",
                    value: `${stats.activeAdmins}/${stats.totalAdmins}`,
                    icon: <UserOutlined />,
                    color: "#475569",
                    bg: "#f8fafc",
                  },
                  {
                    title: "Tổng lượt truy cập",
                    value: visitorStats.totalVisitors,
                    icon: <EyeOutlined />,
                    color: "#0284c7",
                    bg: "#f0f9ff",
                  },

                  {
                    title: "Hôm nay",
                    value: visitorStats.todayVisitors,
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
                ].map((item, idx) => (
                  <Col xs={12} sm={8} lg={idx < 2 ? 12 : 8} key={idx}>
                    <Card
                      bordered={false}
                      className="bento-small-card"
                      bodyStyle={{ padding: "18px 20px" }}
                    >
                      <Space size="middle" align="center">
                        <div
                          className="bento-small-icon-box"
                          style={{
                            background: item.bg,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <Text type="secondary" className="bento-small-title">
                            {item.title}
                          </Text>
                          <Text strong className="bento-small-value">
                            {item.value}
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>

          {/* --- 4. MAIN CONTENT BODY --- */}
          <Row gutter={[24, 24]}>
            {/* CỘT TRÁI: CHƯƠNG TRÌNH PHỤNG VỤ SẮP TỚI */}
            <Col xs={24} lg={15}>
              <Card
                title={
                  <div className="section-card-header">
                    <CalendarOutlined style={{ color: accentGold }} />
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
                <div
                  style={{
                    height: "540px",
                    overflowY: "auto",
                    paddingRight: "6px",
                  }}
                  className="custom-scroll"
                >
                  {upcomingEvents && upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Card
                        key={event.id}
                        size="small"
                        bordered={false}
                        onClick={() => showDetail(event)}
                        className="event-item-card"
                        bodyStyle={{ padding: "14px 18px" }}
                      >
                        <Row align="middle" gutter={16}>
                          <Col
                            xs={6}
                            sm={5}
                            style={{
                              textAlign: "center",
                              borderRight: "1px solid rgba(27, 54, 93, 0.1)",
                              paddingRight: 12,
                            }}
                          >
                            <Title level={3} className="event-time-display">
                              {event.event_time
                                ? event.event_time.substring(0, 5)
                                : "--:--"}
                            </Title>
                            <Text
                              type="secondary"
                              style={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              {dayjs(event.event_date).format("DD/MM/YYYY")}
                            </Text>
                          </Col>

                          <Col xs={16} sm={17}>
                            <Space direction="vertical" size={4}>
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
                                size="large"
                                style={{ fontSize: "13px", color: "#64748b" }}
                              >
                                {event.church_name && (
                                  <span>
                                    <EnvironmentOutlined
                                      style={{
                                        marginRight: 4,
                                        color: primaryNavy,
                                      }}
                                    />
                                    {event.church_name}
                                  </span>
                                )}
                                {event.priest && (
                                  <span>
                                    <UserOutlined
                                      style={{
                                        marginRight: 4,
                                        color: primaryNavy,
                                      }}
                                    />
                                    {event.priest}
                                  </span>
                                )}
                              </Space>
                            </Space>
                          </Col>

                          <Col xs={2} sm={2} style={{ textAlign: "right" }}>
                            <RightOutlined style={{ color: accentGold }} />
                          </Col>
                        </Row>
                      </Card>
                    ))
                  ) : (
                    <Empty
                      description="Không có sự kiện phụng vụ sắp tới"
                      style={{ marginTop: 80 }}
                    />
                  )}
                </div>
              </Card>
            </Col>

            {/* CỘT PHẢI: BIỂU ĐỒ THÁNG, ĐOÀN THỂ & NHẬT KÝ */}
            <Col xs={24} lg={9}>
              <Space direction="vertical" style={{ width: "100%" }} size={24}>
                {/* KHỐI TỔNG HỢP SỰ KIỆN THEO THÁNG */}
                {monthlyEvents && (
                  <Card
                    title={
                      <div className="section-card-header">
                        <PieChartOutlined style={{ color: accentGold }} />
                        <span>Thống kê sự kiện theo tháng</span>
                      </div>
                    }
                    bordered={false}
                    className="editorial-main-card"
                  >
                    <Row gutter={16} justify="space-around">
                      {monthlyEvents.map((m, index) => (
                        <Col
                          span={11}
                          key={index}
                          style={{ textAlign: "center" }}
                        >
                          <div className="monthly-stat-box">
                            <Text type="secondary" className="month-label">
                              Tháng {m.month}
                            </Text>
                            <Text strong className="month-value">
                              {m.total}
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

                {/* KHỐI HỘI ĐOÀN MỚI LẬP */}
                <Card
                  title={
                    <div className="section-card-header">
                      <TeamOutlined style={{ color: accentGold }} />
                      <span>Hội đoàn mới lập gần đây</span>
                    </div>
                  }
                  bordered={false}
                  className="editorial-main-card"
                >
                  <div
                    style={{ height: "160px", overflowY: "auto" }}
                    className="custom-scroll"
                  >
                    <List
                      itemLayout="horizontal"
                      dataSource={recentGroups}
                      renderItem={(group) => (
                        <List.Item className="group-list-item">
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                style={{
                                  backgroundColor: "rgba(27, 54, 93, 0.08)",
                                  color: primaryNavy,
                                }}
                                icon={<TeamOutlined />}
                              />
                            }
                            title={
                              <Text strong style={{ color: primaryNavy }}>
                                {group.name}
                              </Text>
                            }
                            description={`Khởi tạo: ${dayjs(group.created_at).format("DD/MM/YYYY")}`}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </Card>

                {/* KHỐI NHẬT KÝ HOẠT ĐỘNG */}
                <Card
                  title={
                    <div className="section-card-header">
                      <NotificationOutlined style={{ color: accentGold }} />
                      <span>Nhật ký hoạt động hệ thống</span>
                    </div>
                  }
                  bordered={false}
                  className="editorial-main-card"
                >
                  <div
                    style={{
                      height: "180px",
                      overflowY: "auto",
                      paddingTop: "6px",
                    }}
                    className="custom-scroll"
                  >
                    <Timeline
                      pending={false}
                      className="dashboard-editorial-timeline"
                      items={recentEvents.map((item) => ({
                        color: primaryNavy,
                        children: (
                          <div className="timeline-item-row">
                            <div style={{ paddingRight: "8px" }}>
                              <Text strong className="timeline-item-title">
                                {item.title}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "11px" }}
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
                  </div>
                </Card>
              </Space>
            </Col>
          </Row>

          {/* --- 5. DRAWER CHI TIẾT SỰ KIỆN --- */}
          <Drawer
            title={
              <div className="drawer-title-box">
                <InfoCircleOutlined style={{ color: accentGold }} />
                <span>Chi Tiết Lịch Phụng Vụ</span>
              </div>
            }
            onClose={() => setIsDrawerOpen(false)}
            open={isDrawerOpen}
            width={460}
          >
            {selectedEvent && (
              <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
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
                    <Text strong style={{ color: primaryNavy, fontSize: 16 }}>
                      {selectedEvent.event_time
                        ? selectedEvent.event_time.substring(0, 5)
                        : "--:--"}
                    </Text>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
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
                    <InfoCircleOutlined
                      style={{ color: accentGold, marginTop: 3 }}
                    />
                    <Paragraph
                      type="secondary"
                      style={{ fontSize: "13px", margin: 0 }}
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
                  onClick={() => setIsDrawerOpen(false)}
                  style={{
                    height: 44,
                    fontWeight: 700,
                    backgroundColor: primaryNavy,
                    borderRadius: 10,
                  }}
                >
                  Đóng thông tin
                </Button>
              </Space>
            )}
          </Drawer>

          {/* --- 6. STYLES SCOPED --- */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

              .dashboard-loading-screen {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: ${softBg};
                font-family: 'Be Vietnam Pro', sans-serif;
              }

              .dashboard-editorial-layout {
                background: ${softBg};
                min-height: 100vh;
                padding: 40px 20px 80px 20px;
                font-family: 'Be Vietnam Pro', sans-serif;
                color: ${textDark};
              }

              .dashboard-container {
                max-width: 1100px;
                margin: 0 auto;
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

              .dashboard-main-title {
                font-family: 'Playfair Display', Georgia, serif !important;
                color: ${primaryNavy} !important;
                margin: 0 !important;
                font-weight: 700 !important;
                font-size: clamp(24px, 3.5vw, 32px) !important;
              }

              .dashboard-sub-title {
                color: #64748b;
                font-size: 14px;
              }

              .clock-editorial-card {
                border-radius: 16px !important;
                background: #ffffff !important;
                border: 1px solid rgba(212, 175, 55, 0.25) !important;
                box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04) !important;
                display: inline-block;
              }

              .clock-time-display {
                font-size: 18px;
                color: ${primaryNavy};
                display: block;
                font-family: monospace;
                line-height: 1.2;
              }

              .clock-date-display {
                text-transform: capitalize;
                font-size: 12px;
              }

              /* Liturgical Banner Card */
              .liturgical-banner-card {
                margin-bottom: 32px;
                background: linear-gradient(135deg, ${primaryNavy} 0%, #2a4d80 100%) !important;
                border-radius: 20px !important;
                box-shadow: 0 10px 30px rgba(27, 54, 93, 0.15) !important;
                border: 1px solid rgba(212, 175, 55, 0.3) !important;
              }

              .banner-tag-label {
                color: ${accentGold};
                font-weight: 700;
                letter-spacing: 1px;
                font-size: 12px;
              }

              .status-pill-tag {
                border-radius: 12px;
                font-weight: 600;
              }

              .tag-published {
                background: #f6ffed !important;
                color: #276749 !important;
                border-color: #b7eb8f !important;
              }

              .tag-draft {
                background: #fffbe6 !important;
                color: #d48806 !important;
                border-color: #ffe58f !important;
              }

              .banner-schedule-title {
                color: #ffffff !important;
                margin: 4px 0 0 0 !important;
                font-family: 'Playfair Display', serif !important;
                font-weight: 700 !important;
              }

              /* Bento Grid Styling */
              .bento-hero-card {
                background: linear-gradient(135deg, ${primaryNavy} 0%, #0f2342 100%);
                padding: 32px 24px;
                border-radius: 20px;
                color: #fff;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 10px 25px rgba(27, 54, 93, 0.12);
                position: relative;
                overflow: hidden;
                border: 1px solid rgba(212, 175, 55, 0.3);
              }

              .bento-hero-bg-icon {
                position: absolute;
                right: -20px;
                bottom: -20px;
                opacity: 0.08;
                font-size: 130px;
                pointer-events: none;
                color: #ffffff;
              }

              .bento-hero-tag {
                background: rgba(212, 175, 55, 0.2) !important;
                border: 1px solid ${accentGold} !important;
                color: #ffffff !important;
                margin-bottom: 12px;
                border-radius: 10px;
              }

              .bento-hero-title {
                color: #ffffff !important;
                margin: 0 !important;
                font-family: 'Playfair Display', serif !important;
                font-weight: 700 !important;
              }

              .bento-hero-desc {
                color: rgba(255, 255, 255, 0.75);
                font-size: 13px;
              }

              .bento-hero-stat-value {
                font-size: 48px;
                font-weight: 700;
                font-family: 'Playfair Display', serif;
                line-height: 1;
                color: ${accentGold};
              }

              .bento-hero-stat-label {
                margin-left: 10px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
              }

              .bento-small-card {
                border-radius: 16px !important;
                background: #ffffff !important;
                border: 1px solid rgba(27, 54, 93, 0.08) !important;
                box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
              }

              .bento-small-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(27, 54, 93, 0.08) !important;
              }

              .bento-small-icon-box {
                width: 42px;
                height: 42px;
                border-radius: 12px;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 18px;
              }

              .bento-small-title {
                font-size: 13px;
                display: block;
                margin-bottom: 2px;
              }

              .bento-small-value {
                font-size: 20px;
                color: ${primaryNavy};
                line-height: 1;
                font-family: 'Playfair Display', serif;
              }

              /* Main Editorial Section Cards */
              .editorial-main-card {
                border-radius: 20px !important;
                background: #ffffff !important;
                border: 1px solid rgba(212, 175, 55, 0.25) !important;
                box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
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

              .sacred-status-pill {
                border-radius: 12px;
                background: rgba(27, 54, 93, 0.06) !important;
                color: ${primaryNavy} !important;
                border: none !important;
                font-weight: 600;
              }

              .event-item-card {
                background: ${softBg} !important;
                margin-bottom: 12px;
                border-radius: 14px !important;
                border: 1px solid rgba(27, 54, 93, 0.08) !important;
                transition: all 0.25s ease !important;
                cursor: pointer;
              }

              .event-item-card:hover {
                background: #ffffff !important;
                border-color: ${accentGold} !important;
                box-shadow: 0 6px 18px rgba(27, 54, 93, 0.08) !important;
                transform: translateY(-2px);
              }

              .event-time-display {
                margin: 0 !important;
                color: ${primaryNavy} !important;
                font-family: 'Playfair Display', serif !important;
                font-weight: 700 !important;
              }

              .event-item-title {
                font-size: 15px;
                color: ${primaryNavy};
              }

              .priority-pill {
                border-radius: 8px;
                font-size: 11px;
              }

              .type-pill {
                border-radius: 8px;
                font-size: 11px;
                background: rgba(212, 175, 55, 0.12);
                color: ${primaryNavy};
                border: 1px solid ${accentGold};
              }

              .monthly-stat-box {
                background: ${softBg};
                padding: 12px;
                border-radius: 14px;
                border: 1px solid rgba(27, 54, 93, 0.08);
              }

              .month-label {
                font-size: 12px;
                display: block;
                margin-bottom: 2px;
              }

              .month-value {
                font-size: 24px;
                color: ${primaryNavy};
                font-family: 'Playfair Display', serif;
                display: block;
              }

              .month-unit {
                display: block;
                font-size: 11px;
              }

              .group-list-item {
                padding: 8px 0 !important;
                border-bottom: 1px dashed rgba(27, 54, 93, 0.1) !important;
              }

              .dashboard-editorial-timeline .ant-timeline-item {
                padding-bottom: 12px !important;
              }

              .timeline-item-row {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }

              .timeline-item-title {
                font-size: 13px;
                color: ${primaryNavy};
                display: block;
              }

              .timeline-date-tag {
                font-size: 10px;
                border-radius: 6px;
                margin: 0;
              }

              /* Drawer Customization */
              .drawer-title-box {
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Playfair Display', serif;
                color: ${primaryNavy};
                font-size: 18px;
                font-weight: 700;
              }

              .drawer-hero-box {
                background: ${softBg};
                padding: 16px;
                border-radius: 14px;
                border: 1px solid rgba(212, 175, 55, 0.3);
                text-align: center;
              }

              .drawer-hero-label {
                text-transform: uppercase;
                font-size: 11px;
                letter-spacing: 1px;
                font-weight: 700;
              }

              .drawer-hero-title {
                margin: 6px 0 0 0 !important;
                color: ${primaryNavy} !important;
                font-family: 'Playfair Display', serif !important;
              }

              .drawer-descriptions-box {
                border-radius: 12px;
                overflow: hidden;
              }

              .drawer-notice-card {
                background: #fffbe6 !important;
                border: 1px dashed ${accentGold} !important;
                border-radius: 12px !important;
              }

              .custom-scroll::-webkit-scrollbar {
                width: 5px;
              }
              .custom-scroll::-webkit-scrollbar-thumb {
                background: rgba(212, 175, 55, 0.4);
                border-radius: 4px;
              }
              .custom-scroll::-webkit-scrollbar-thumb:hover {
                background: ${accentGold};
              }
            `,
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard;
