import React, { useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Card,
  Col,
  ConfigProvider,
  Empty,
  Progress,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  BankOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined,
  ManOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getStats } from "../../api/reportApi";

import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";

const { Title, Text } = Typography;

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#1B365D",
  navyDark: "#102440",

  gold: "#D4AF37",
  goldDark: "#B89020",

  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",
  orange: "#F97316",

  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",

  border: "#E2E8F0",
  softBorder: "#F1F5F9",
  softBg: "#F8FAFC",
  white: "#FFFFFF",

  navySoft: "rgba(27, 54, 93, 0.08)",
  goldSoft: "rgba(212, 175, 55, 0.12)",
  blueSoft: "rgba(59, 130, 246, 0.10)",
  greenSoft: "rgba(16, 185, 129, 0.10)",
  purpleSoft: "rgba(139, 92, 246, 0.10)",
  redSoft: "rgba(239, 68, 68, 0.10)",
};

const PIE_COLORS = [
  COLORS.navy,
  COLORS.gold,
  COLORS.green,
  COLORS.blue,
  COLORS.purple,
  COLORS.red,
  COLORS.orange,
];

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) => {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
};

const getLicenseConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: "success",
      icon: <CheckCircleOutlined />,
    },

    trial: {
      label: "Dùng thử",
      color: "processing",
      icon: <ClockCircleOutlined />,
    },

    expired: {
      label: "Hết hạn",
      color: "error",
      icon: <ExclamationCircleOutlined />,
    },
  };

  return (
    configs[status] || {
      label: status || "Chưa xác định",
      color: "default",
      icon: <ExclamationCircleOutlined />,
    }
  );
};

const getChurchTypeLabel = (type) => {
  if (type === "GIAO_XU") return "Giáo xứ";

  if (type === "GIAO_HO") return "Giáo họ";

  return type || "—";
};

const getStudentStatusLabel = (status) => {
  const map = {
    active: "Đang hoạt động",
    inactive: "Ngừng hoạt động",
    graduated: "Đã hoàn thành",
    transferred: "Đã chuyển đi",
  };

  return map[status] || status;
};

const getCatechismStatusLabel = (status) => {
  const map = {
    new: "Mới đăng ký",
    studying: "Đang học",
    completed: "Hoàn thành",
    graduated: "Tốt nghiệp",
  };

  return map[status] || status;
};

/* =========================================================
   COMPONENT
========================================================= */

const FaithEduSystemDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    overview: {},
    churches: [],
    gender: [],
    student_status: [],
    catechism_status: [],
  });

  /* =========================================================
     DOCUMENT TITLE
  ========================================================= */

  useEffect(() => {
    document.title = "FaithEdu | Quản Trị Hệ Thống";

    loadStats();
  }, []);

  /* =========================================================
     LOAD STATS
  ========================================================= */

  const loadStats = async () => {
    try {
      setLoading(true);

      const response = await getStats();

      const data = response?.data?.data || response?.data || {};

      setStats({
        overview: data.overview || {},
        churches: data.churches || [],
        gender: data.gender || [],
        student_status: data.student_status || [],
        catechism_status: data.catechism_status || [],
      });
    } catch (error) {
      console.error("Lỗi tải thống kê FaithEdu:", error);

      message.error("Không thể tải dữ liệu thống kê hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     OVERVIEW
  ========================================================= */

  const overview = stats.overview || {};

  /* =========================================================
     LICENSE STATS
  ========================================================= */

  const licenseStats = useMemo(() => {
    const result = {
      active: 0,
      trial: 0,
      expired: 0,
    };

    stats.churches.forEach((church) => {
      if (church.license_status === "active") {
        result.active += 1;
      }

      if (church.license_status === "trial") {
        result.trial += 1;
      }

      if (church.license_status === "expired") {
        result.expired += 1;
      }
    });

    return result;
  }, [stats.churches]);

  /* =========================================================
     CHURCH DISTRIBUTION DATA
  ========================================================= */

  const churchStudentChartData = useMemo(() => {
    return [...stats.churches]
      .sort((a, b) => Number(b.students || 0) - Number(a.students || 0))
      .slice(0, 8)
      .map((church) => ({
        name:
          church.church_name?.length > 18
            ? `${church.church_name.slice(0, 18)}...`
            : church.church_name,

        students: Number(church.students || 0),

        catechists: Number(church.catechists || 0),

        classes: Number(church.classes || 0),
      }));
  }, [stats.churches]);

  /* =========================================================
     GENDER DATA
  ========================================================= */

  const genderData = useMemo(() => {
    return stats.gender.map((item) => ({
      name: item.gender === "male" ? "Nam" : "Nữ",
      value: Number(item.total || 0),
      gender: item.gender,
    }));
  }, [stats.gender]);

  /* =========================================================
     STUDENT STATUS DATA
  ========================================================= */

  const studentStatusData = useMemo(() => {
    return stats.student_status.map((item) => ({
      name: getStudentStatusLabel(item.status),
      value: Number(item.total || 0),
      status: item.status,
    }));
  }, [stats.student_status]);

  /* =========================================================
     CATECHISM STATUS DATA
  ========================================================= */

  const catechismStatusData = useMemo(() => {
    return stats.catechism_status.map((item) => ({
      name: getCatechismStatusLabel(item.status),
      value: Number(item.total || 0),
      status: item.status,
    }));
  }, [stats.catechism_status]);

  /* =========================================================
     CHURCH TABLE COLUMNS
  ========================================================= */

  const churchColumns = [
    {
      title: "Nhà thờ",

      dataIndex: "church_name",

      key: "church_name",

      width: 280,

      render: (text, record) => (
        <div className="church-name-cell">
          <Avatar size={38} className="church-avatar" icon={<BankOutlined />} />

          <div>
            <Text className="church-name-text">{text || "Chưa cập nhật"}</Text>

            <Text className="church-type-text">
              {getChurchTypeLabel(record.church_type)}
            </Text>
          </div>
        </div>
      ),
    },

    {
      title: "Giấy phép",

      dataIndex: "license_status",

      key: "license_status",

      width: 160,

      render: (status) => {
        const config = getLicenseConfig(status);

        return (
          <Tag color={config.color} className="license-tag" icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },

    {
      title: "Học viên",

      dataIndex: "students",

      key: "students",

      align: "center",

      width: 110,

      render: (value) => (
        <div className="table-number">{formatNumber(value)}</div>
      ),
    },

    {
      title: "Giáo lý viên",

      dataIndex: "catechists",

      key: "catechists",

      align: "center",

      width: 130,

      render: (value) => (
        <div className="table-number">{formatNumber(value)}</div>
      ),
    },

    {
      title: "Lớp học",

      dataIndex: "classes",

      key: "classes",

      align: "center",

      width: 100,

      render: (value) => (
        <Tag color="blue" className="class-tag">
          {formatNumber(value)}
        </Tag>
      ),
    },

    {
      title: "Phân công",

      dataIndex: "teaching_assignments",

      key: "teaching_assignments",

      align: "center",

      width: 120,

      render: (value) => (
        <Tag color="gold" className="class-tag">
          {formatNumber(value)}
        </Tag>
      ),
    },

    {
      title: "Trạng thái",

      dataIndex: "is_active",

      key: "is_active",

      width: 120,

      align: "center",

      render: (active) => (
        <Tag color={active ? "success" : "default"} className="status-tag">
          {active ? "Hoạt động" : "Tạm dừng"}
        </Tag>
      ),
    },
  ];

  /* =========================================================
     KPI DATA
  ========================================================= */

  const kpiItems = [
    {
      title: "TỔNG GIÁO XỨ & GIÁO HỌ",

      value: overview.total_churches || 0,

      icon: <BankOutlined />,

      color: COLORS.gold,

      background: COLORS.goldSoft,

      description: "Đơn vị đang quản lý trên FaithEdu",

      footer: `${licenseStats.active} đơn vị đang kích hoạt`,
    },

    {
      title: "TỔNG HỌC VIÊN",

      value: overview.total_students || 0,

      icon: <TeamOutlined />,

      color: COLORS.navy,

      background: COLORS.navySoft,

      description: "Tổng số học viên giáo lý",

      footer: `${overview.active_students || 0} đang hoạt động`,
    },

    {
      title: "GIÁO LÝ VIÊN",

      value: overview.total_catechists || 0,

      icon: <UserOutlined />,

      color: COLORS.blue,

      background: COLORS.blueSoft,

      description: "Đội ngũ giáo lý viên toàn hệ thống",

      footer: `${overview.active_catechists || 0} đang hoạt động`,
    },

    {
      title: "LỚP GIÁO LÝ",

      value: overview.total_classes || 0,

      icon: <ReadOutlined />,

      color: COLORS.green,

      background: COLORS.greenSoft,

      description: "Tổng số lớp đang được quản lý",

      footer: `${overview.active_classes || 0} lớp đang hoạt động`,
    },
  ];

  /* =========================================================
     LICENSE PERCENTAGES
  ========================================================= */

  const totalChurches = Number(overview.total_churches || 0);

  const getPercent = (value) => {
    if (!totalChurches) return 0;

    return Math.round((Number(value || 0) / totalChurches) * 100);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: COLORS.navy,

          borderRadius: 12,

          colorBgLayout: COLORS.softBg,

          fontFamily:
            "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },

        components: {
          Table: {
            headerBg: COLORS.softBg,
            headerColor: COLORS.navy,
          },

          Card: {
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <div className="faithedu-system-dashboard">
        {/* =================================================
            HEADER
        ================================================= */}

        <PageHeroHeader
          badge="FAITHEDU · TRUNG TÂM QUẢN TRỊ HỆ THỐNG"
          title="Tổng Quan Hệ Thống FaithEdu"
          description="Theo dõi hoạt động của các giáo xứ, giáo họ, học viên, giáo lý viên và chương trình giáo lý trên toàn hệ thống."
          onRefresh={loadStats}
          refreshLoading={loading}
        />

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="system-loading">
            <Spin size="large" />

            <Title level={5}>Đang đồng bộ dữ liệu FaithEdu</Title>

            <Text>Hệ thống đang tổng hợp dữ liệu từ các giáo xứ...</Text>
          </div>
        ) : (
          <>
            {/* =================================================
                SYSTEM OVERVIEW
            ================================================= */}

            <section className="dashboard-section">
              <div className="section-header">
                <div>
                  <Text className="section-eyebrow">SYSTEM OVERVIEW</Text>

                  <Title level={3} className="section-title">
                    Toàn Cảnh FaithEdu
                  </Title>
                </div>

                <div className="live-status">
                  <span className="live-dot" />

                  <Text>Dữ liệu hệ thống</Text>
                </div>
              </div>

              <Row gutter={[18, 18]}>
                {kpiItems.map((item, index) => (
                  <Col xs={24} sm={12} xl={6} key={index}>
                    <div className="system-kpi-card">
                      <StatCard
                        title={item.title}
                        value={item.value}
                        prefix={
                          <div
                            className="system-kpi-icon"
                            style={{
                              color: item.color,
                              background: item.background,
                            }}
                          >
                            {item.icon}
                          </div>
                        }
                        valueColor={COLORS.navy}
                      />

                      <div className="kpi-description">{item.description}</div>

                      <div
                        className="kpi-footer"
                        style={{
                          color: item.color,
                        }}
                      >
                        {item.footer}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </section>

            {/* =================================================
                SECONDARY STATS
            ================================================= */}

            <section className="dashboard-section">
              <Row gutter={[18, 18]}>
                <Col xs={24} md={12} xl={6}>
                  <Card className="mini-overview-card">
                    <div className="mini-overview-icon navy">
                      <CheckCircleOutlined />
                    </div>

                    <div>
                      <Text className="mini-overview-label">
                        Học viên đang hoạt động
                      </Text>

                      <div className="mini-overview-value">
                        {formatNumber(overview.active_students)}
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12} xl={6}>
                  <Card className="mini-overview-card">
                    <div className="mini-overview-icon purple">
                      <BookOutlined />
                    </div>

                    <div>
                      <Text className="mini-overview-label">
                        Đang theo học lớp
                      </Text>

                      <div className="mini-overview-value">
                        {formatNumber(overview.studying_class_students)}
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12} xl={6}>
                  <Card className="mini-overview-card">
                    <div className="mini-overview-icon green">
                      <SafetyCertificateOutlined />
                    </div>

                    <div>
                      <Text className="mini-overview-label">
                        Giáo lý viên hoạt động
                      </Text>

                      <div className="mini-overview-value">
                        {formatNumber(overview.active_catechists)}
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12} xl={6}>
                  <Card className="mini-overview-card">
                    <div className="mini-overview-icon gold">
                      <CrownOutlined />
                    </div>

                    <div>
                      <Text className="mini-overview-label">
                        Tổng phân công giảng dạy
                      </Text>

                      <div className="mini-overview-value">
                        {formatNumber(overview.teaching_assignments)}
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </section>

            {/* =================================================
                CHARTS ROW 1
            ================================================= */}

            <section className="dashboard-section">
              <Row gutter={[20, 20]}>
                {/* GENDER */}

                <Col xs={24} lg={8}>
                  <Card bordered={false} className="dashboard-card chart-card">
                    <div className="card-heading">
                      <div>
                        <Title level={5}>Cơ Cấu Giới Tính</Title>

                        <Text>Phân bố học viên nam và nữ</Text>
                      </div>

                      <div className="heading-icon blue">
                        <TeamOutlined />
                      </div>
                    </div>

                    {genderData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={genderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={90}
                            paddingAngle={5}
                          >
                            {genderData.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={
                                  entry.gender === "male"
                                    ? COLORS.navy
                                    : COLORS.gold
                                }
                              />
                            ))}
                          </Pie>

                          <RechartsTooltip
                            formatter={(value) => [
                              `${formatNumber(value)} học viên`,
                              "Số lượng",
                            ]}
                          />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Chưa có dữ liệu" />
                    )}

                    <div className="gender-summary">
                      <div className="gender-item">
                        <div className="gender-icon male">
                          <ManOutlined />
                        </div>

                        <div>
                          <Text>Nam</Text>

                          <strong>
                            {formatNumber(
                              stats.gender.find(
                                (item) => item.gender === "male",
                              )?.total,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="gender-item">
                        <div className="gender-icon female">
                          <WomanOutlined />
                        </div>

                        <div>
                          <Text>Nữ</Text>

                          <strong>
                            {formatNumber(
                              stats.gender.find(
                                (item) => item.gender === "female",
                              )?.total,
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* CATECHISM STATUS */}

                <Col xs={24} lg={8}>
                  <Card bordered={false} className="dashboard-card chart-card">
                    <div className="card-heading">
                      <div>
                        <Title level={5}>Tiến Trình Giáo Lý</Title>

                        <Text>Trạng thái học tập của học viên</Text>
                      </div>

                      <div className="heading-icon gold">
                        <BookOutlined />
                      </div>
                    </div>

                    {catechismStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={catechismStatusData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={88}
                            paddingAngle={5}
                          >
                            {catechismStatusData.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>

                          <RechartsTooltip
                            formatter={(value) => [
                              `${formatNumber(value)} học viên`,
                              "Số lượng",
                            ]}
                          />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Chưa có dữ liệu" />
                    )}
                  </Card>
                </Col>

                {/* LICENSE */}

                <Col xs={24} lg={8}>
                  <Card
                    bordered={false}
                    className="dashboard-card license-card"
                  >
                    <div className="card-heading">
                      <div>
                        <Title level={5}>Tình Trạng Bản Quyền</Title>

                        <Text>Quản lý license các đơn vị</Text>
                      </div>

                      <div className="heading-icon green">
                        <SafetyCertificateOutlined />
                      </div>
                    </div>

                    <div className="license-list">
                      {/* ACTIVE */}

                      <div className="license-item">
                        <div className="license-item-header">
                          <div className="license-label">
                            <span className="license-dot active" />

                            <Text>Đang kích hoạt</Text>
                          </div>

                          <strong>{licenseStats.active}</strong>
                        </div>

                        <Progress
                          percent={getPercent(licenseStats.active)}
                          strokeColor={COLORS.green}
                          trailColor="#F1F5F9"
                        />
                      </div>

                      {/* TRIAL */}

                      <div className="license-item">
                        <div className="license-item-header">
                          <div className="license-label">
                            <span className="license-dot trial" />

                            <Text>Dùng thử</Text>
                          </div>

                          <strong>{licenseStats.trial}</strong>
                        </div>

                        <Progress
                          percent={getPercent(licenseStats.trial)}
                          strokeColor={COLORS.blue}
                          trailColor="#F1F5F9"
                        />
                      </div>

                      {/* EXPIRED */}

                      <div className="license-item">
                        <div className="license-item-header">
                          <div className="license-label">
                            <span className="license-dot expired" />

                            <Text>Hết hạn</Text>
                          </div>

                          <strong>{licenseStats.expired}</strong>
                        </div>

                        <Progress
                          percent={getPercent(licenseStats.expired)}
                          strokeColor={COLORS.red}
                          trailColor="#F1F5F9"
                        />
                      </div>
                    </div>

                    <div className="license-summary-box">
                      <div>
                        <Text>Tổng đơn vị</Text>

                        <strong>{formatNumber(totalChurches)}</strong>
                      </div>

                      <BankOutlined />
                    </div>
                  </Card>
                </Col>
              </Row>
            </section>

            {/* =================================================
                CHURCH DISTRIBUTION
            ================================================= */}

            <section className="dashboard-section">
              <Card bordered={false} className="dashboard-card full-chart-card">
                <div className="card-heading">
                  <div>
                    <Text className="section-eyebrow">CHURCH ANALYTICS</Text>

                    <Title level={4}>Phân Bố Học Viên Theo Đơn Vị</Title>

                    <Text>
                      So sánh quy mô học viên giữa các giáo xứ và giáo họ
                    </Text>
                  </div>

                  <div className="heading-icon navy">
                    <DashboardOutlined />
                  </div>
                </div>

                {churchStudentChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={churchStudentChartData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 50,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={COLORS.border}
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        angle={-25}
                        textAnchor="end"
                        interval={0}
                        height={80}
                        tick={{
                          fill: COLORS.muted,
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: COLORS.muted,
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <RechartsTooltip
                        formatter={(value, name) => [
                          formatNumber(value),
                          name === "students"
                            ? "Học viên"
                            : name === "catechists"
                              ? "Giáo lý viên"
                              : "Lớp học",
                        ]}
                      />

                      <Legend />

                      <Bar
                        dataKey="students"
                        name="Học viên"
                        fill={COLORS.navy}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />

                      <Bar
                        dataKey="catechists"
                        name="Giáo lý viên"
                        fill={COLORS.gold}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />

                      <Bar
                        dataKey="classes"
                        name="Lớp học"
                        fill={COLORS.green}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={42}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Chưa có dữ liệu giáo xứ" />
                )}
              </Card>
            </section>

            {/* =================================================
                STUDENT STATUS
            ================================================= */}

            <section className="dashboard-section">
              <Row gutter={[20, 20]}>
                <Col xs={24} lg={12}>
                  <Card bordered={false} className="dashboard-card">
                    <div className="card-heading">
                      <div>
                        <Title level={5}>Trạng Thái Học Viên</Title>

                        <Text>Tổng quan tình trạng hồ sơ học viên</Text>
                      </div>

                      <div className="heading-icon purple">
                        <UserOutlined />
                      </div>
                    </div>

                    {studentStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={studentStatusData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={COLORS.border}
                            horizontal={false}
                          />

                          <XAxis
                            type="number"
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            type="category"
                            dataKey="name"
                            width={120}
                            tick={{
                              fill: COLORS.muted,
                              fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <RechartsTooltip />

                          <Bar
                            dataKey="value"
                            fill={COLORS.purple}
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Empty description="Chưa có dữ liệu" />
                    )}
                  </Card>
                </Col>

                {/* =================================================
                    SYSTEM HEALTH
                ================================================= */}

                <Col xs={24} lg={12}>
                  <Card
                    bordered={false}
                    className="dashboard-card system-health-card"
                  >
                    <div className="card-heading">
                      <div>
                        <Title level={5}>Sức Khỏe Hệ Thống</Title>

                        <Text>Chỉ số vận hành FaithEdu hiện tại</Text>
                      </div>

                      <div className="heading-icon green">
                        <SafetyCertificateOutlined />
                      </div>
                    </div>

                    <div className="health-grid">
                      <div className="health-item">
                        <div className="health-circle active">
                          <CheckCircleOutlined />
                        </div>

                        <div>
                          <Text>Tỷ lệ học viên hoạt động</Text>

                          <strong>
                            {overview.total_students
                              ? Math.round(
                                  (overview.active_students /
                                    overview.total_students) *
                                    100,
                                )
                              : 0}
                            %
                          </strong>
                        </div>
                      </div>

                      <div className="health-item">
                        <div className="health-circle studying">
                          <BookOutlined />
                        </div>

                        <div>
                          <Text>Tỷ lệ đang học lớp</Text>

                          <strong>
                            {overview.total_students
                              ? Math.round(
                                  (overview.studying_class_students /
                                    overview.total_students) *
                                    100,
                                )
                              : 0}
                            %
                          </strong>
                        </div>
                      </div>

                      <div className="health-item">
                        <div className="health-circle teacher">
                          <UserOutlined />
                        </div>

                        <div>
                          <Text>Giáo lý viên hoạt động</Text>

                          <strong>{overview.active_catechists || 0}</strong>
                        </div>
                      </div>

                      <div className="health-item">
                        <div className="health-circle class">
                          <ReadOutlined />
                        </div>

                        <div>
                          <Text>Phân công giảng dạy</Text>

                          <strong>{overview.teaching_assignments || 0}</strong>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </section>

            {/* =================================================
                CHURCH TABLE
            ================================================= */}

            <section className="dashboard-section">
              <Card
                bordered={false}
                className="dashboard-card church-table-card"
              >
                <div className="table-card-header">
                  <div>
                    <Text className="section-eyebrow">
                      ORGANIZATION MANAGEMENT
                    </Text>

                    <Title level={4}>Danh Sách Giáo Xứ & Giáo Họ</Title>

                    <Text>
                      Theo dõi hoạt động và quy mô từng đơn vị trên FaithEdu
                    </Text>
                  </div>

                  <div className="table-summary">
                    <BankOutlined />

                    <div>
                      <Text>Tổng đơn vị</Text>

                      <strong>{formatNumber(stats.churches.length)}</strong>
                    </div>
                  </div>
                </div>

                <Table
                  columns={churchColumns}
                  dataSource={stats.churches}
                  rowKey="church_id"
                  pagination={{
                    pageSize: 8,
                    showSizeChanger: false,
                  }}
                  scroll={{
                    x: 1050,
                  }}
                  className="faith-system-table"
                />
              </Card>
            </section>
          </>
        )}

        {/* =================================================
            STYLES
        ================================================= */}

        <style
          dangerouslySetInnerHTML={{
            __html: `

              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

              * {
                box-sizing: border-box;
              }

              .faithedu-system-dashboard {
                min-height: 100vh;
                padding: 24px;
                background:
                  linear-gradient(
                    180deg,
                    #F8FAFC 0%,
                    #F8FAFC 55%,
                    #F1F5F9 100%
                  );
                font-family:
                  'Be Vietnam Pro',
                  -apple-system,
                  BlinkMacSystemFont,
                  'Segoe UI',
                  sans-serif;
              }


              /* =========================================
                 LOADING
              ========================================= */

              .system-loading {
                min-height: 520px;

                display: flex;
                flex-direction: column;

                align-items: center;
                justify-content: center;

                gap: 10px;
              }

              .system-loading h5 {
                margin: 12px 0 0 !important;
                color: ${COLORS.navy};
              }

              .system-loading .ant-typography {
                color: ${COLORS.muted};
                font-size: 12px;
              }


              /* =========================================
                 SECTION
              ========================================= */

              .dashboard-section {
                margin-top: 28px;
              }

              .section-header {
                display: flex;

                justify-content: space-between;
                align-items: flex-end;

                gap: 16px;

                margin-bottom: 16px;
              }

              .section-eyebrow {
                display: block;

                margin-bottom: 5px;

                color: ${COLORS.gold};

                font-size: 10px;
                font-weight: 700;

                letter-spacing: 1.6px;
              }

              .section-title {
                margin: 0 !important;

                color: ${COLORS.navy} !important;

                font-family:
                  'Playfair Display',
                  Georgia,
                  serif !important;

                font-weight: 700 !important;
              }

              .live-status {
                display: flex;

                align-items: center;

                gap: 7px;

                padding: 8px 12px;

                border: 1px solid rgba(16, 185, 129, 0.18);

                border-radius: 30px;

                background:
                  rgba(16, 185, 129, 0.05);
              }

              .live-status .ant-typography {
                color: ${COLORS.green};

                font-size: 11px;
                font-weight: 600;
              }

              .live-dot {
                width: 7px;
                height: 7px;

                border-radius: 50%;

                background: ${COLORS.green};

                box-shadow:
                  0 0 0 4px
                  rgba(16, 185, 129, 0.10);
              }


              /* =========================================
                 KPI
              ========================================= */

              .system-kpi-card {
                position: relative;

                height: 100%;

                padding-bottom: 38px;
              }

              .system-kpi-card .faith-stat-card {
                height: 100%;

                border-radius: 16px !important;

                border:
                  1px solid ${COLORS.border} !important;

                box-shadow:
                  0 5px 20px
                  rgba(15, 23, 42, 0.035) !important;

                transition:
                  transform .25s ease,
                  box-shadow .25s ease;
              }

              .system-kpi-card:hover .faith-stat-card {
                transform: translateY(-4px);

                box-shadow:
                  0 15px 35px
                  rgba(15, 23, 42, 0.08) !important;
              }

              .system-kpi-icon {
                width: 42px;
                height: 42px;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 12px;

                font-size: 19px;
              }

              .kpi-description {
                position: absolute;

                left: 24px;
                right: 24px;

                bottom: 28px;

                color: ${COLORS.muted};

                font-size: 10px;

                pointer-events: none;
              }

              .kpi-footer {
                position: absolute;

                left: 24px;
                right: 24px;

                bottom: 8px;

                padding-top: 7px;

                border-top:
                  1px dashed ${COLORS.border};

                font-size: 10px;
                font-weight: 600;

                pointer-events: none;
              }


              /* =========================================
                 MINI OVERVIEW
              ========================================= */

              .mini-overview-card {
                border-radius: 15px !important;

                border:
                  1px solid ${COLORS.border} !important;

                box-shadow: none !important;
              }

              .mini-overview-card .ant-card-body {
                padding: 18px !important;

                display: flex;

                align-items: center;

                gap: 14px;
              }

              .mini-overview-icon {
                width: 42px;
                height: 42px;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 12px;

                font-size: 18px;
              }

              .mini-overview-icon.navy {
                color: ${COLORS.navy};
                background: ${COLORS.navySoft};
              }

              .mini-overview-icon.purple {
                color: ${COLORS.purple};
                background: ${COLORS.purpleSoft};
              }

              .mini-overview-icon.green {
                color: ${COLORS.green};
                background: ${COLORS.greenSoft};
              }

              .mini-overview-icon.gold {
                color: ${COLORS.gold};
                background: ${COLORS.goldSoft};
              }

              .mini-overview-label {
                display: block;

                color: ${COLORS.muted};

                font-size: 10px;
                font-weight: 500;
              }

              .mini-overview-value {
                margin-top: 3px;

                color: ${COLORS.navy};

                font-family:
                  'Playfair Display',
                  Georgia,
                  serif;

                font-size: 25px;
                font-weight: 700;
              }


              /* =========================================
                 CARDS
              ========================================= */

              .dashboard-card {
                height: 100%;

                border-radius: 18px !important;

                border:
                  1px solid ${COLORS.border} !important;

                background: ${COLORS.white} !important;

                box-shadow:
                  0 6px 25px
                  rgba(15, 23, 42, 0.025) !important;
              }

              .dashboard-card .ant-card-body {
                padding: 22px !important;
              }

              .card-heading {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 16px;

                margin-bottom: 20px;
              }

              .card-heading h5,
              .card-heading h4 {
                margin: 0 !important;

                color: ${COLORS.navy} !important;

                font-family:
                  'Playfair Display',
                  Georgia,
                  serif;

                font-weight: 700 !important;
              }

              .card-heading .ant-typography {
                display: block;

                margin-top: 4px;

                color: ${COLORS.muted};

                font-size: 11px;
              }

              .heading-icon {
                width: 38px;
                height: 38px;

                flex-shrink: 0;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 11px;

                font-size: 17px;
              }

              .heading-icon.navy {
                color: ${COLORS.navy};
                background: ${COLORS.navySoft};
              }

              .heading-icon.gold {
                color: ${COLORS.gold};
                background: ${COLORS.goldSoft};
              }

              .heading-icon.blue {
                color: ${COLORS.blue};
                background: ${COLORS.blueSoft};
              }

              .heading-icon.green {
                color: ${COLORS.green};
                background: ${COLORS.greenSoft};
              }

              .heading-icon.purple {
                color: ${COLORS.purple};
                background: ${COLORS.purpleSoft};
              }


              /* =========================================
                 GENDER
              ========================================= */

              .gender-summary {
                display: grid;

                grid-template-columns:
                  repeat(2, minmax(0, 1fr));

                gap: 12px;

                margin-top: 5px;
              }

              .gender-item {
                display: flex;

                align-items: center;

                gap: 10px;

                padding: 12px;

                border:
                  1px solid ${COLORS.softBorder};

                border-radius: 12px;

                background: ${COLORS.softBg};
              }

              .gender-icon {
                width: 34px;
                height: 34px;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 10px;

                font-size: 16px;
              }

              .gender-icon.male {
                color: ${COLORS.navy};

                background: ${COLORS.navySoft};
              }

              .gender-icon.female {
                color: ${COLORS.gold};

                background: ${COLORS.goldSoft};
              }

              .gender-item .ant-typography {
                display: block;

                color: ${COLORS.muted};

                font-size: 10px;
              }

              .gender-item strong {
                display: block;

                margin-top: 2px;

                color: ${COLORS.navy};

                font-size: 16px;
              }


              /* =========================================
                 LICENSE
              ========================================= */

              .license-list {
                margin-top: 25px;
              }

              .license-item {
                margin-bottom: 24px;
              }

              .license-item:last-child {
                margin-bottom: 0;
              }

              .license-item-header {
                display: flex;

                align-items: center;
                justify-content: space-between;

                margin-bottom: 8px;
              }

              .license-label {
                display: flex;

                align-items: center;

                gap: 8px;
              }

              .license-label .ant-typography {
                margin: 0 !important;

                color: ${COLORS.text};

                font-size: 11px;
              }

              .license-item-header strong {
                color: ${COLORS.navy};

                font-size: 15px;
              }

              .license-dot {
                width: 8px;
                height: 8px;

                border-radius: 50%;
              }

              .license-dot.active {
                background: ${COLORS.green};
              }

              .license-dot.trial {
                background: ${COLORS.blue};
              }

              .license-dot.expired {
                background: ${COLORS.red};
              }

              .license-summary-box {
                margin-top: 26px;

                padding: 14px 16px;

                display: flex;

                align-items: center;
                justify-content: space-between;

                border-radius: 13px;

                background:
                  linear-gradient(
                    135deg,
                    ${COLORS.navy},
                    #24497C
                  );

                color: white;
              }

              .license-summary-box .ant-typography {
                display: block;

                color: rgba(255,255,255,.7);

                font-size: 10px;
              }

              .license-summary-box strong {
                display: block;

                margin-top: 2px;

                font-family:
                  'Playfair Display',
                  Georgia,
                  serif;

                font-size: 24px;
              }

              .license-summary-box > .anticon {
                font-size: 25px;

                color: ${COLORS.gold};
              }


              /* =========================================
                 SYSTEM HEALTH
              ========================================= */

              .health-grid {
                display: grid;

                grid-template-columns:
                  repeat(2, minmax(0, 1fr));

                gap: 16px;

                margin-top: 12px;
              }

              .health-item {
                display: flex;

                align-items: center;

                gap: 12px;

                padding: 14px;

                border:
                  1px solid ${COLORS.softBorder};

                border-radius: 13px;

                background: ${COLORS.softBg};
              }

              .health-circle {
                width: 40px;
                height: 40px;

                flex-shrink: 0;

                display: flex;

                align-items: center;
                justify-content: center;

                border-radius: 50%;

                font-size: 16px;
              }

              .health-circle.active {
                color: ${COLORS.green};
                background: ${COLORS.greenSoft};
              }

              .health-circle.studying {
                color: ${COLORS.purple};
                background: ${COLORS.purpleSoft};
              }

              .health-circle.teacher {
                color: ${COLORS.blue};
                background: ${COLORS.blueSoft};
              }

              .health-circle.class {
                color: ${COLORS.gold};
                background: ${COLORS.goldSoft};
              }

              .health-item .ant-typography {
                display: block;

                color: ${COLORS.muted};

                font-size: 10px;
              }

              .health-item strong {
                display: block;

                margin-top: 3px;

                color: ${COLORS.navy};

                font-size: 20px;
              }


              /* =========================================
                 TABLE
              ========================================= */

              .table-card-header {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 20px;

                margin-bottom: 22px;
              }

              .table-card-header h4 {
                margin: 0 !important;

                color: ${COLORS.navy} !important;

                font-family:
                  'Playfair Display',
                  Georgia,
                  serif !important;
              }

              .table-card-header > div:first-child > .ant-typography:last-child {
                display: block;

                margin-top: 4px;

                color: ${COLORS.muted};

                font-size: 11px;
              }

              .table-summary {
                display: flex;

                align-items: center;

                gap: 10px;

                padding: 10px 14px;

                border:
                  1px solid ${COLORS.border};

                border-radius: 12px;

                background: ${COLORS.softBg};
              }

              .table-summary > .anticon {
                color: ${COLORS.gold};

                font-size: 18px;
              }

              .table-summary .ant-typography {
                display: block;

                color: ${COLORS.muted};

                font-size: 9px;
              }

              .table-summary strong {
                display: block;

                margin-top: 2px;

                color: ${COLORS.navy};

                font-size: 18px;
              }

              .faith-system-table .ant-table {
                overflow: hidden;

                border:
                  1px solid ${COLORS.softBorder};

                border-radius: 12px;
              }

              .faith-system-table .ant-table-thead > tr > th {
                padding: 13px 14px !important;

                background: ${COLORS.softBg} !important;

                color: ${COLORS.navy} !important;

                font-size: 10px !important;
                font-weight: 700 !important;

                border-bottom:
                  1px solid ${COLORS.border} !important;
              }

              .faith-system-table .ant-table-tbody > tr > td {
                padding: 13px 14px !important;

                color: ${COLORS.text};

                font-size: 11px;

                border-bottom:
                  1px solid ${COLORS.softBorder} !important;
              }

              .faith-system-table .ant-table-tbody > tr:hover > td {
                background:
                  rgba(212, 175, 55, 0.035) !important;
              }

              .church-name-cell {
                display: flex;

                align-items: center;

                gap: 10px;
              }

              .church-avatar {
                color: ${COLORS.gold} !important;

                background:
                  ${COLORS.navy} !important;
              }

              .church-name-text {
                display: block;

                color: ${COLORS.navy};

                font-size: 11px;
                font-weight: 700;
              }

              .church-type-text {
                display: block;

                margin-top: 2px;

                color: ${COLORS.muted};

                font-size: 9px;
              }

              .license-tag,
              .class-tag,
              .status-tag {
                border-radius: 8px !important;

                font-size: 10px !important;

                padding:
                  3px 8px !important;
              }

              .table-number {
                color: ${COLORS.navy};

                font-weight: 700;
              }


              /* =========================================
                 RECHARTS
              ========================================= */

              .recharts-default-tooltip {
                border-radius: 10px !important;

                border:
                  1px solid ${COLORS.border} !important;

                box-shadow:
                  0 8px 20px
                  rgba(15,23,42,.08) !important;
              }


              /* =========================================
                 RESPONSIVE
              ========================================= */

              @media (max-width: 992px) {

                .table-card-header {
                  flex-direction: column;
                }

              }


              @media (max-width: 768px) {

                .faithedu-system-dashboard {
                  padding: 14px;
                }

                .section-header {
                  align-items: flex-start;

                  flex-direction: column;
                }

                .dashboard-card .ant-card-body {
                  padding: 16px !important;
                }

                .health-grid {
                  grid-template-columns: 1fr;
                }

                .table-card-header {
                  margin-bottom: 16px;
                }

              }


              @media (max-width: 480px) {

                .faithedu-system-dashboard {
                  padding: 10px;
                }

                .section-title {
                  font-size: 21px !important;
                }

                .gender-summary {
                  grid-template-columns: 1fr;
                }

                .mini-overview-card .ant-card-body {
                  padding: 14px !important;
                }

                .mini-overview-value {
                  font-size: 22px;
                }

              }

            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default FaithEduSystemDashboard;
