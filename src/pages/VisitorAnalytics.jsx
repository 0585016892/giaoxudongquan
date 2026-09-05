import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  ConfigProvider,
  Table,
  Tag,
  Spin,
  Badge,
  Modal,
  Button,
  message,
  Descriptions,
  Divider,
  Tooltip as AntTooltip,
} from "antd";

import {
  EyeOutlined,
  UserOutlined,
  GlobalOutlined,
  FileTextOutlined,
  CompassOutlined,
  LineChartOutlined,
  DesktopOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  MobileOutlined,
  LaptopOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  LoginOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import socket from "../socket/socket";

import {
  getVisitorStats,
  getVisitorChart,
  getVisitorHistory,
} from "../api/statApi";

const { Title, Text } = Typography;

/* =========================================================
   ROUTE MAP
========================================================= */

const FIXED_ROUTE_MAP = {
  "/": "Trang Chủ",

  "/giao-ly/hon-nhan": "Giáo Lý Hôn Nhân",
  "/giao-ly/du-tong": "Giáo Lý Dự Tòng",

  "/prayers": "Kinh Đọc Hằng Ngày",
  "/prayers/thanh-ca": "Thánh Ca Hôn Nhân",

  "/giao-xu": "Thông Tin Giáo Xứ",

  "/tai-lieu": "Kho Tài Liệu & Biểu Mẫu",

  "/contact": "Liên Hệ & Trợ Giúp",

  "/su-kien": "Trang Sự Kiện",

  "/bang-tin": "Bảng Tin Giáo Xứ",

  "/hoi-doan": "Hội Đoàn & Đoàn Thể",

  "/exam": "Thi Trắc Nghiệm Giáo Lý",

  "/exam-prayer": "Khảo Kinh Giọng Nói AI",

  "/exam-search": "Tra Cứu Kết Quả Kiểm Tra",

  "/terms": "Điều Khoản Sử Dụng",

  "/guide": "Hướng Dẫn Học Tập",
};

const getFriendlyPageName = (url) => {
  if (!url) return "Trang Không Xác Định";

  if (FIXED_ROUTE_MAP[url]) {
    return FIXED_ROUTE_MAP[url];
  }

  if (url.startsWith("/bang-tin/")) {
    return "Chi Tiết Bảng Tin";
  }

  if (url.startsWith("/su-kien/")) {
    return "Chi Tiết Sự Kiện";
  }

  if (url.startsWith("/hoi-doan/")) {
    return "Chi Tiết Hội Đoàn";
  }

  return url;
};

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const formatDateTime = (time) => {
  if (!time) return "—";

  return new Date(time).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",

    day: "2-digit",
    month: "2-digit",
    year: "numeric",

    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getLocation = (record) => {
  if (!record) return "Không xác định";

  const location = [record.city, record.region, record.country]
    .filter(Boolean)
    .join(", ");

  return location || "Không xác định";
};

const normalizeDevice = (device) => {
  if (!device) return "Unknown";

  const value = device.toLowerCase();

  if (value.includes("mobile") || value.includes("phone")) {
    return "Mobile";
  }

  if (value.includes("tablet")) {
    return "Tablet";
  }

  if (value.includes("desktop")) {
    return "Desktop";
  }

  return device;
};

const getDeviceIcon = (device) => {
  const normalized = normalizeDevice(device);

  if (normalized === "Mobile") {
    return <MobileOutlined />;
  }

  if (normalized === "Desktop") {
    return <DesktopOutlined />;
  }

  return <LaptopOutlined />;
};

const isOnlineVisitor = (visitor) => {
  if (!visitor?.last_seen) return false;

  const lastSeen = new Date(visitor.last_seen).getTime();

  const now = Date.now();

  return now - lastSeen <= 5 * 60 * 1000;
};

/* =========================================================
   COLORS
========================================================= */

const PIE_COLORS = [
  "#1B365D",
  "#D4AF37",
  "#1677FF",
  "#52C41A",
  "#722ED1",
  "#FA8C16",
];

const VisitorAnalytics = () => {
  /* =========================================================
     THEME
  ========================================================= */

  const primaryNavy = "#1B365D";

  const accentGold = "#D4AF37";

  const textDark = "#1E293B";

  const softBg = "#FAFAFA";

  /* =========================================================
     STATES
  ========================================================= */

  const [loading, setLoading] = useState(true);

  const [onlineUsers, setOnlineUsers] = useState(0);

  const [stats, setStats] = useState({
    totalVisitors: 0,

    todayVisitors: 0,

    onlineUsers: 0,

    topPages: [],

    browsers: [],

    devices: [],

    visitors: [],
  });

  const [chartData, setChartData] = useState([]);

  const [historyOpen, setHistoryOpen] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const [visitorHistory, setVisitorHistory] = useState([]);

  /* =========================================================
     FETCH DATA
  ========================================================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, chartRes] = await Promise.all([
        getVisitorStats(),
        getVisitorChart(),
      ]);

      const statsPayload = statsRes?.data?.data || statsRes?.data || {};

      setStats({
        totalVisitors: statsPayload.totalVisitors || 0,

        todayVisitors: statsPayload.todayVisitors || 0,

        onlineUsers: statsPayload.onlineUsers || 0,

        topPages: statsPayload.topPages || [],

        browsers: statsPayload.browsers || [],

        devices: statsPayload.devices || [],

        visitors: statsPayload.visitors || [],
      });

      if (statsPayload.onlineUsers !== undefined) {
        setOnlineUsers(statsPayload.onlineUsers);
      }

      const chartPayload = chartRes?.data?.data || chartRes?.data || [];

      setChartData(chartPayload);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu thống kê:", error);

      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SOCKET
  ========================================================= */

  useEffect(() => {
    fetchData();

    socket.on("onlineCount", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("onlineCount");
    };
  }, []);

  /* =========================================================
     PREPARE DEVICE DATA
  ========================================================= */

  const normalizedDevices = useMemo(() => {
    const deviceMap = {};

    stats.devices.forEach((item) => {
      const name = normalizeDevice(item.device_type);

      if (!deviceMap[name]) {
        deviceMap[name] = 0;
      }

      deviceMap[name] += Number(item.total || 0);
    });

    return Object.entries(deviceMap).map(([device_type, total]) => ({
      device_type,
      total,
    }));
  }, [stats.devices]);

  /* =========================================================
     TOP PAGE
  ========================================================= */

  const topOnePage = stats.topPages?.[0] || {
    page_url: "/",
    total: 0,
  };

  const topOneName = getFriendlyPageName(topOnePage.page_url);

  /* =========================================================
     HISTORY
  ========================================================= */

  const handleViewHistory = async (visitor) => {
    try {
      setSelectedVisitor(visitor);

      setVisitorHistory([]);

      setHistoryOpen(true);

      setHistoryLoading(true);

      const response = await getVisitorHistory(visitor.ip_address);

      const result = response?.data;

      if (result?.success) {
        setVisitorHistory(result.data || []);
      } else {
        message.error("Không thể tải lịch sử truy cập");
      }
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);

      message.error("Có lỗi xảy ra khi tải lịch sử");
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);

    setVisitorHistory([]);

    setSelectedVisitor(null);
  };

  /* =========================================================
     TABLE TOP PAGES
  ========================================================= */

  const columnsTopPages = [
    {
      title: "Trang / Đường dẫn",

      dataIndex: "page_url",

      key: "page_url",

      render: (url) => (
        <Space direction="vertical" size={0}>
          <Text
            strong
            style={{
              color: primaryNavy,
              fontSize: 13,
            }}
          >
            {getFriendlyPageName(url)}
          </Text>

          <Text
            type="secondary"
            style={{
              fontSize: 11,
            }}
          >
            {url}
          </Text>
        </Space>
      ),
    },

    {
      title: "Lượt xem",

      dataIndex: "total",

      key: "total",

      align: "right",

      render: (total) => (
        <Tag
          style={{
            background: "rgba(212, 175, 55, 0.15)",

            border: `1px solid ${accentGold}`,

            color: primaryNavy,

            fontWeight: "bold",

            borderRadius: 10,
          }}
        >
          {total} lượt
        </Tag>
      ),
    },
  ];

  /* =========================================================
     TABLE VISITORS
  ========================================================= */

  const columnsVisitors = [
    {
      title: "Trạng thái",

      key: "status",

      width: 100,

      render: (_, record) => {
        const online = isOnlineVisitor(record);

        return online ? (
          <Badge
            status="processing"
            color="#52c41a"
            text={
              <Text
                style={{
                  color: "#52c41a",

                  fontSize: 12,

                  fontWeight: 600,
                }}
              >
                Online
              </Text>
            }
          />
        ) : (
          <Badge
            status="default"
            text={
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                Offline
              </Text>
            }
          />
        );
      },
    },

    {
      title: "Địa chỉ IP",

      dataIndex: "ip_address",

      key: "ip_address",

      render: (ip) => (
        <Text
          code
          style={{
            color: primaryNavy,
          }}
        >
          {ip || "N/A"}
        </Text>
      ),
    },

    {
      title: "Vị trí",

      key: "location",

      render: (_, record) => (
        <Space size={5}>
          <EnvironmentOutlined
            style={{
              color: accentGold,
            }}
          />

          <Text
            style={{
              fontSize: 12,
            }}
          >
            {getLocation(record)}
          </Text>
        </Space>
      ),
    },

    {
      title: "Thiết bị",

      key: "device",

      render: (_, record) => {
        const device = normalizeDevice(record.device_type);

        return (
          <Space size={4}>
            <Tag
              color={device === "Mobile" ? "blue" : "cyan"}
              icon={getDeviceIcon(device)}
            >
              {device}
            </Tag>

            <Tag color="gold">{record.os_name || "Unknown"}</Tag>
          </Space>
        );
      },
    },

    {
      title: "Trình duyệt",

      dataIndex: "browser",

      key: "browser",

      render: (browser, record) => (
        <Space direction="vertical" size={0}>
          <Text
            style={{
              fontSize: 12,
            }}
          >
            {browser || "Unknown"}
          </Text>

          {record.browser_version && (
            <Text
              type="secondary"
              style={{
                fontSize: 10,
              }}
            >
              v{record.browser_version}
            </Text>
          )}
        </Space>
      ),
    },

    {
      title: "Lượt",

      dataIndex: "visit_count",

      key: "visit_count",

      align: "center",

      sorter: (a, b) => Number(a.visit_count || 0) - Number(b.visit_count || 0),

      render: (count) => (
        <Tag
          color="purple"
          style={{
            fontWeight: 700,

            borderRadius: 20,

            padding: "2px 10px",
          }}
        >
          {count || 1}
        </Tag>
      ),
    },

    {
      title: "Trang gần nhất",

      dataIndex: "page_url",

      key: "page_url",

      render: (url) => (
        <Space direction="vertical" size={0}>
          <Text
            strong
            style={{
              fontSize: 12,

              color: primaryNavy,
            }}
          >
            {getFriendlyPageName(url)}
          </Text>

          <Text
            type="secondary"
            style={{
              fontSize: 10,
            }}
          >
            {url}
          </Text>
        </Space>
      ),
    },

    {
      title: "Hoạt động cuối",

      dataIndex: "updated_at",

      key: "updated_at",

      align: "right",

      render: (time) => (
        <Text
          type="secondary"
          style={{
            fontSize: 11,
          }}
        >
          {formatDateTime(time)}
        </Text>
      ),
    },

    {
      title: "",

      key: "action",

      fixed: "right",

      width: 100,

      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<HistoryOutlined />}
          onClick={(e) => {
            e.stopPropagation();

            handleViewHistory(record);
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  /* =========================================================
     HISTORY COLUMNS
  ========================================================= */

  const historyColumns = [
    {
      title: "#",

      dataIndex: "id",

      width: 70,

      render: (id) => <Text type="secondary">#{id}</Text>,
    },

    {
      title: "Thời gian",

      dataIndex: "updated_at",

      key: "updated_at",

      width: 180,

      render: (time) => (
        <Space size={5}>
          <ClockCircleOutlined
            style={{
              color: accentGold,
            }}
          />

          <Text
            style={{
              fontSize: 12,
            }}
          >
            {formatDateTime(time)}
          </Text>
        </Space>
      ),
    },

    {
      title: "Trang truy cập",

      dataIndex: "page_url",

      key: "page_url",

      render: (url) => (
        <Space direction="vertical" size={0}>
          <Text
            strong
            style={{
              color: primaryNavy,
            }}
          >
            {getFriendlyPageName(url)}
          </Text>

          <Text
            type="secondary"
            style={{
              fontSize: 11,
            }}
          >
            {url}
          </Text>
        </Space>
      ),
    },

    {
      title: "Session",

      dataIndex: "session_id",

      key: "session_id",

      width: 170,

      render: (session) => (
        <AntTooltip title={session}>
          <Text
            code
            style={{
              maxWidth: 140,

              display: "inline-block",

              overflow: "hidden",

              textOverflow: "ellipsis",

              whiteSpace: "nowrap",
            }}
          >
            {session || "Không có"}
          </Text>
        </AntTooltip>
      ),
    },

    {
      title: "Thiết bị",

      key: "device",

      render: (_, record) => (
        <Space direction="vertical" size={3}>
          <Tag color="blue" icon={getDeviceIcon(record.device_type)}>
            {normalizeDevice(record.device_type)}
          </Tag>

          <Tag color="gold">{record.os_name || "Unknown"}</Tag>
        </Space>
      ),
    },

    {
      title: "Trình duyệt",

      dataIndex: "browser",

      key: "browser",

      render: (browser, record) => (
        <Space direction="vertical" size={0}>
          <Text>{browser || "Unknown"}</Text>

          <Text
            type="secondary"
            style={{
              fontSize: 10,
            }}
          >
            {record.browser_version ? `Version ${record.browser_version}` : ""}
          </Text>
        </Space>
      ),
    },
  ];

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
      <div className="visitor-analytics-container">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="analytics-header">
          <div>
            <span className="analytics-badge-tag">
              <CompassOutlined />
              THỐNG KÊ WEBSITE
            </span>

            <Title level={2} className="analytics-main-title">
              Báo Cáo Lưu Lượng Truy Cập
            </Title>

            <Text type="secondary">
              Theo dõi hoạt động và hành vi truy cập website
            </Text>

            <div className="gold-accent-divider" />
          </div>

          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
        </div>

        {loading ? (
          <div className="loading-box">
            <Spin size="large" tip="Đang tải dữ liệu thống kê..." />
          </div>
        ) : (
          <>
            {/* =================================================
                STAT CARDS
            ================================================= */}

            <Row
              gutter={[20, 20]}
              style={{
                marginBottom: 28,
              }}
            >
              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={
                      <span className="stat-title-label">KHÁCH HÔM NAY</span>
                    }
                    value={stats.todayVisitors}
                    prefix={
                      <EyeOutlined
                        style={{
                          color: accentGold,

                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: primaryNavy,

                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title={<span className="stat-title-label">TỔNG KHÁCH</span>}
                    value={stats.totalVisitors}
                    prefix={
                      <UserOutlined
                        style={{
                          color: accentGold,

                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: primaryNavy,

                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card online-card">
                  <Statistic
                    title={
                      <span
                        className="stat-title-label"
                        style={{
                          color: "#52c41a",
                        }}
                      >
                        ĐANG ONLINE
                      </span>
                    }
                    value={onlineUsers}
                    prefix={
                      <GlobalOutlined
                        style={{
                          color: "#52c41a",

                          marginRight: 8,
                        }}
                      />
                    }
                    valueStyle={{
                      color: "#52c41a",

                      fontWeight: "bold",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="stat-card">
                  <div className="top-page-stat-box">
                    <span className="stat-title-label">
                      TRANG PHỔ BIẾN NHẤT
                    </span>

                    <Text
                      strong
                      ellipsis
                      style={{
                        color: primaryNavy,

                        fontSize: 15,

                        marginTop: 6,
                      }}
                    >
                      {topOneName}
                    </Text>

                    <Tag
                      color="gold"
                      style={{
                        width: "fit-content",

                        marginTop: 8,
                      }}
                    >
                      {topOnePage.total || 0} lượt xem
                    </Tag>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* =================================================
                CHARTS
            ================================================= */}

            <Row
              gutter={[24, 24]}
              style={{
                marginBottom: 28,
              }}
            >
              <Col xs={24} lg={16}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <LineChartOutlined
                        style={{
                          color: accentGold,

                          marginRight: 8,
                        }}
                      />
                      Lượt Truy Cập 7 Ngày Gần Đây
                    </span>
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: -10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(212,175,55,0.15)"
                      />

                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "#64748b",

                          fontSize: 12,
                        }}
                      />

                      <YAxis allowDecimals={false} />

                      <Tooltip
                        formatter={(value) => [`${value} lượt`, "Truy cập"]}
                      />

                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={accentGold}
                        strokeWidth={3}
                        dot={{
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <DesktopOutlined
                        style={{
                          color: accentGold,

                          marginRight: 8,
                        }}
                      />
                      Thiết Bị Truy Cập
                    </span>
                  }
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={normalizedDevices}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="device_type"
                      >
                        {normalizedDevices.map((entry, index) => (
                          <Cell
                            key={entry.device_type}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />

                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>

            {/* =================================================
                TABLES
            ================================================= */}

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={8}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <span className="chart-card-title">
                      <FileTextOutlined
                        style={{
                          color: accentGold,

                          marginRight: 8,
                        }}
                      />
                      Top Trang Được Xem
                    </span>
                  }
                >
                  <Table
                    columns={columnsTopPages}
                    dataSource={stats.topPages || []}
                    rowKey="page_url"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>

              <Col xs={24} lg={16}>
                <Card
                  bordered={false}
                  className="analytics-chart-card"
                  title={
                    <div className="table-title-row">
                      <span className="chart-card-title">
                        <ClockCircleOutlined
                          style={{
                            color: accentGold,

                            marginRight: 8,
                          }}
                        />
                        Nhật Ký Khách Truy Cập
                      </span>

                      <Tag color="blue">{stats.visitors?.length || 0} IP</Tag>
                    </div>
                  }
                >
                  <Table
                    columns={columnsVisitors}
                    dataSource={stats.visitors || []}
                    rowKey="ip_address"
                    pagination={{
                      pageSize: 8,

                      size: "small",

                      showSizeChanger: true,
                    }}
                    size="small"
                    className="custom-analytics-table"
                    scroll={{
                      x: 1250,
                    }}
                    onRow={(record) => ({
                      onClick: () => handleViewHistory(record),

                      style: {
                        cursor: "pointer",
                      },
                    })}
                  />
                </Card>
              </Col>
            </Row>

            {/* =================================================
                MODAL HISTORY
            ================================================= */}

            <Modal
              title={
                <Space>
                  <HistoryOutlined
                    style={{
                      color: accentGold,
                    }}
                  />

                  <span>Chi Tiết Khách Truy Cập</span>
                </Space>
              }
              open={historyOpen}
              onCancel={closeHistory}
              footer={<Button onClick={closeHistory}>Đóng</Button>}
              width={1200}
            >
              {selectedVisitor && (
                <>
                  {/* PROFILE */}

                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Card size="small" className="visitor-profile-card">
                        <Text type="secondary">ĐỊA CHỈ IP</Text>

                        <div className="profile-main-value">
                          <GlobalOutlined />

                          <Text code strong>
                            {selectedVisitor.ip_address}
                          </Text>
                        </div>
                        {/* ở đây */}
                        <Tag
                          color={
                            isOnlineVisitor(selectedVisitor)
                              ? "success"
                              : "default"
                          }
                        >
                          {isOnlineVisitor(selectedVisitor)
                            ? "● Đang Online"
                            : "● Offline"}
                        </Tag>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card size="small" className="visitor-profile-card">
                        <Text type="secondary">TỔNG LƯỢT TRUY CẬP</Text>

                        <div className="profile-main-value visit-value">
                          <EyeOutlined />

                          <Text strong>
                            {selectedVisitor.visit_count ||
                              visitorHistory.length ||
                              0}{" "}
                            lần
                          </Text>
                        </div>

                        <Text type="secondary">
                          {visitorHistory.length} bản ghi lịch sử đã tải
                        </Text>
                      </Card>
                    </Col>

                    <Col xs={24} md={8}>
                      <Card size="small" className="visitor-profile-card">
                        <Text type="secondary">VỊ TRÍ</Text>

                        <div className="profile-main-value">
                          <EnvironmentOutlined />

                          <Text strong>{getLocation(selectedVisitor)}</Text>
                        </div>

                        <Text type="secondary">
                          {selectedVisitor.language || "Không xác định"}
                        </Text>
                      </Card>
                    </Col>
                  </Row>

                  <Divider />

                  {/* FULL INFO */}

                  <Descriptions
                    title="Thông Tin Phiên Truy Cập Gần Nhất"
                    bordered
                    size="small"
                    column={{
                      xs: 1,
                      sm: 2,
                      md: 3,
                    }}
                    style={{
                      marginBottom: 24,
                    }}
                  >
                    <Descriptions.Item label="Thiết bị">
                      <Space>
                        {getDeviceIcon(selectedVisitor.device_type)}

                        {normalizeDevice(selectedVisitor.device_type)}
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Hệ điều hành">
                      {selectedVisitor.os_name || "Unknown"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trình duyệt">
                      {selectedVisitor.browser || "Unknown"}

                      {selectedVisitor.browser_version
                        ? ` ${selectedVisitor.browser_version}`
                        : ""}
                    </Descriptions.Item>

                    <Descriptions.Item label="Kích thước màn hình">
                      {selectedVisitor.screen_width || "?"}
                      {" × "}
                      {selectedVisitor.screen_height || "?"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngôn ngữ">
                      {selectedVisitor.language || "Không xác định"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Múi giờ">
                      {selectedVisitor.timezone || "Không xác định"}
                    </Descriptions.Item>

                    <Descriptions.Item label="Landing Page" span={3}>
                      <Space>
                        <LoginOutlined />

                        <Text strong>
                          {getFriendlyPageName(selectedVisitor.landing_page)}
                        </Text>

                        <Text type="secondary">
                          {selectedVisitor.landing_page}
                        </Text>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Trang gần nhất" span={3}>
                      <Space>
                        <FileTextOutlined />

                        <Text strong>
                          {getFriendlyPageName(selectedVisitor.page_url)}
                        </Text>

                        <Text type="secondary">{selectedVisitor.page_url}</Text>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Referrer" span={3}>
                      <Space>
                        <LinkOutlined />

                        <Text
                          ellipsis
                          style={{
                            maxWidth: 800,
                          }}
                        >
                          {selectedVisitor.referrer || "Truy cập trực tiếp"}
                        </Text>
                      </Space>
                    </Descriptions.Item>

                    <Descriptions.Item label="Session ID" span={3}>
                      <Text code>
                        {selectedVisitor.session_id || "Không có"}
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>

                  {/* HISTORY */}

                  <Divider orientation="left">
                    <Space>
                      <HistoryOutlined />
                      Nhật Ký Các Lần Truy Cập
                      <Tag color="purple">{visitorHistory.length} bản ghi</Tag>
                    </Space>
                  </Divider>

                  <Table
                    loading={historyLoading}
                    dataSource={visitorHistory}
                    rowKey="id"
                    columns={historyColumns}
                    pagination={{
                      pageSize: 10,

                      showSizeChanger: true,

                      showTotal: (total) => `Tổng ${total} lượt truy cập`,
                    }}
                    size="small"
                    scroll={{
                      x: 1000,
                    }}
                  />
                </>
              )}
            </Modal>
          </>
        )}

        {/* =====================================================
            STYLES
        ===================================================== */}

        <style
          dangerouslySetInnerHTML={{
            __html: `

            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

            .visitor-analytics-container {
              padding: 32px 24px;
              background: ${softBg};
              min-height: 100vh;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .analytics-header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 20px;
              margin-bottom: 28px;
            }

            .analytics-badge-tag {
              background: rgba(212,175,55,0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 5px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1.3px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 8px;
            }

            .analytics-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
            }

            .gold-accent-divider {
              width: 60px;
              height: 3px;
              background: ${accentGold};
              margin-top: 10px;
              border-radius: 2px;
            }

            .loading-box {
              text-align: center;
              padding: 100px 0;
            }

            .stat-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212,175,55,0.25) !important;
              box-shadow: 0 4px 20px rgba(27,54,93,0.04) !important;
              transition: all 0.3s ease !important;
              height: 100%;
            }

            .stat-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 28px rgba(27,54,93,0.1) !important;
              border-color: ${accentGold} !important;
            }

            .online-card {
              border-color: rgba(82,196,26,0.35) !important;
            }

            .stat-title-label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              color: #64748b;
              display: block;
            }

            .top-page-stat-box {
              display: flex;
              flex-direction: column;
              min-height: 78px;
              justify-content: center;
            }

            .analytics-chart-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212,175,55,0.25) !important;
              box-shadow: 0 8px 24px rgba(27,54,93,0.05) !important;
              height: 100%;
            }

            .chart-card-title {
              font-family: 'Playfair Display', Georgia, serif;
              color: ${primaryNavy};
              font-size: 17px;
              font-weight: 700;
            }

            .table-title-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            }

            .custom-analytics-table .ant-table {
              background: transparent;
            }

            .custom-analytics-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              white-space: nowrap;
            }

            .custom-analytics-table .ant-table-tbody > tr {
              transition: all 0.2s ease;
            }

            .custom-analytics-table .ant-table-tbody > tr:hover > td {
              background: rgba(212,175,55,0.07) !important;
            }

            .visitor-profile-card {
              border-radius: 14px !important;
              background: #FAFAFA !important;
              border: 1px solid rgba(212,175,55,0.25) !important;
              height: 100%;
            }

            .profile-main-value {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 18px;
              margin: 10px 0;
              color: ${primaryNavy};
            }

            .visit-value {
              color: #722ED1;
              font-size: 22px;
            }

            @media (max-width: 768px) {

              .visitor-analytics-container {
                padding: 20px 12px;
              }

              .analytics-header {
                flex-direction: column;
              }

            }

          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default VisitorAnalytics;
