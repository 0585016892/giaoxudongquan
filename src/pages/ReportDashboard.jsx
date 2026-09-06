import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Table,
  Tag,
  Typography,
  ConfigProvider,
  Space,
  Avatar,
  Progress,
  Tabs,
  Modal,
  Button,
  DatePicker,
  message,
  Divider,
} from "antd";

import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  HomeOutlined,
  ArrowRightOutlined,
  GlobalOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  getChurchReport,
  getDocumentReport,
  getEventReport,
  getExamReport,
  getGroupReport,
  getLiturgicalReport,
  getParishionerReport,
  getSlideReport,
  getVisitorReport,
} from "../api/reportApi";

import PageHeroHeader from "../components/common/PageHeroHeader";
import StatCard from "../components/common/StatCard";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#1B365D",
  gold: "#D4AF37",
  dark: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  softBorder: "#F1F5F9",
  softBg: "#F8FAFC",
  white: "#FFFFFF",

  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  red: "#EF4444",

  goldSoft: "rgba(212, 175, 55, 0.12)",
  navySoft: "rgba(27, 54, 93, 0.08)",
  blueSoft: "rgba(59, 130, 246, 0.10)",
  greenSoft: "rgba(16, 185, 129, 0.10)",
};

const PIE_COLORS = [
  COLORS.navy,
  COLORS.gold,
  COLORS.green,
  COLORS.blue,
  COLORS.purple,
  COLORS.red,
];

/* =========================================================
   KPI CONFIG
========================================================= */

const KPI_CONFIG = [
  {
    key: "church",
    title: "GIÁO XỨ & GIÁO HỌ",
    footer: "Xem danh sách",
    icon: <HomeOutlined />,
    color: COLORS.gold,
    line: "gold-line",
    getValue: (report) => report.church?.overview?.totalChurches || 0,
  },
  {
    key: "parishioner",
    title: "TỔNG GIÁO DÂN",
    footer: "Cơ cấu & Bí tích",
    icon: <UserOutlined />,
    color: COLORS.navy,
    line: "navy-line",
    getValue: (report) => report.parishioner?.total || 0,
  },
  {
    key: "exam",
    title: "BÀI THI GIÁO LÝ",
    footer: "Bảng điểm thi",
    icon: <TrophyOutlined />,
    color: COLORS.blue,
    line: "blue-line",
    getValue: (report) => report.exam?.overview?.totalExams || 0,
  },
  {
    key: "event",
    title: "SỰ KIỆN MỤC VỤ",
    footer: "Lịch sự kiện",
    icon: <CalendarOutlined />,
    color: COLORS.green,
    line: "green-line",
    getValue: (report) => report.event?.overview?.totalEvents || 0,
  },
];

/* =========================================================
   FILTER API MAP
========================================================= */

const REPORT_API_MAP = {
  parishioner: getParishionerReport,
  exam: getExamReport,
  document: getDocumentReport,
  event: getEventReport,
  liturgical: getLiturgicalReport,
  visitor: getVisitorReport,
};

const CATEGORY_LABELS = {
  parishioner: "Giáo Dân",
  exam: "Thi Giáo Lý",
  document: "Tài Liệu",
  event: "Sự Kiện",
  liturgical: "Lịch Phụng Vụ",
  visitor: "Lượt Truy Cập",
};

/* =========================================================
   HELPERS
========================================================= */

const extractReportData = (res) => {
  if (res?.status === "fulfilled") {
    return res.value?.data?.data || res.value?.data || {};
  }

  return {};
};

const getCategoryLabel = (type) => CATEGORY_LABELS[type] || type;

/* =========================================================
   COMPONENT
========================================================= */

const ReportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({});

  const [dateFilters, setDateFilters] = useState({
    parishioner: null,
    exam: null,
    document: null,
    event: null,
    liturgical: null,
    visitor: null,
  });

  const [sectionLoading, setSectionLoading] = useState({
    parishioner: false,
    exam: false,
    document: false,
    event: false,
    liturgical: false,
    visitor: false,
  });

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    type: null,
    data: [],
  });

  /* =========================================================
     DOCUMENT TITLE
  ========================================================= */

  useEffect(() => {
    document.title = "Báo Cáo Quản Trị Chuyên Sâu | Giáo Xứ Đồng Quan";

    loadAllReports();
  }, []);

  /* =========================================================
     LOAD ALL REPORTS
  ========================================================= */

  const loadAllReports = async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        getChurchReport(),
        getDocumentReport(),
        getEventReport(),
        getExamReport(),
        getGroupReport(),
        getLiturgicalReport(),
        getParishionerReport(),
        getSlideReport(),
        getVisitorReport(),
      ]);

      const [
        church,
        document,
        event,
        exam,
        group,
        liturgical,
        parishioner,
        slide,
        visitor,
      ] = results;

      setReport({
        church: extractReportData(church),
        document: extractReportData(document),
        event: extractReportData(event),
        exam: extractReportData(exam),
        group: extractReportData(group),
        liturgical: extractReportData(liturgical),
        parishioner: extractReportData(parishioner),
        slide: extractReportData(slide),
        visitor: extractReportData(visitor),
      });
    } catch (error) {
      console.error("Lỗi tải báo cáo:", error);

      message.error("Không thể tải dữ liệu báo cáo tổng hợp.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FILTER SINGLE SECTION
  ========================================================= */

  const handleSingleSectionFilter = async (categoryType, dates) => {
    const api = REPORT_API_MAP[categoryType];

    if (!api) return;

    try {
      setSectionLoading((prev) => ({
        ...prev,
        [categoryType]: true,
      }));

      setDateFilters((prev) => ({
        ...prev,
        [categoryType]: dates,
      }));

      const params = {};

      if (dates?.[0] && dates?.[1]) {
        params.startDate = dates[0].format("YYYY-MM-DD");
        params.endDate = dates[1].format("YYYY-MM-DD");
      }

      const res = await api(params);

      const newData = res?.data?.data || res?.data || {};

      setReport((prev) => ({
        ...prev,
        [categoryType]: newData,
      }));

      if (dates?.[0] && dates?.[1]) {
        message.success(
          `Đã cập nhật ${getCategoryLabel(
            categoryType,
          ).toLowerCase()} theo khoảng ngày.`,
        );
      } else {
        message.success(
          `Đã bỏ bộ lọc ${getCategoryLabel(categoryType).toLowerCase()}.`,
        );
      }
    } catch (error) {
      console.error(`Lỗi lọc ${categoryType}:`, error);

      message.error(
        `Không thể lọc dữ liệu ${getCategoryLabel(
          categoryType,
        ).toLowerCase()}.`,
      );
    } finally {
      setSectionLoading((prev) => ({
        ...prev,
        [categoryType]: false,
      }));
    }
  };

  /* =========================================================
     MODAL
  ========================================================= */

  const openDetailModal = (type, customTitle = "", customData = null) => {
    let title = customTitle;
    let dataList = customData;

    if (!dataList) {
      switch (type) {
        case "church":
          title = "Danh Sách Giáo Xứ & Giáo Họ";
          dataList = report.church?.latest || [];
          break;

        case "parishioner":
          title = "Thống Kê Giáo Dân Chi Tiết";

          dataList = [
            {
              key: "Nam",
              value: `${report.parishioner?.gender?.[0]?.total || 0} người`,
            },
            {
              key: "Nữ",
              value: `${report.parishioner?.gender?.[1]?.total || 0} người`,
            },
            {
              key: "Bí tích Rửa Tội",
              value: `${report.parishioner?.sacrament?.baptism || 0} người`,
            },
            {
              key: "Bí tích Rước Lễ",
              value: `${report.parishioner?.sacrament?.communion || 0} người`,
            },
            {
              key: "Bí tích Thêm Sức",
              value: `${
                report.parishioner?.sacrament?.confirmation || 0
              } người`,
            },
          ];
          break;

        case "exam":
          title = "Bảng Điểm Thi Giáo Lý Chi Tiết";
          dataList = report.exam?.topStudents || [];
          break;

        case "document":
          title = "Danh Sách Biểu Mẫu & Tài Liệu";
          dataList = report.document?.topViews || [];
          break;

        case "event":
          title = "Danh Sách Sự Kiện Mục Vụ Gần Đây";
          dataList = report.event?.latest || [];
          break;

        default:
          title = title || "Chi tiết dữ liệu";
          dataList = dataList || [];
      }
    }

    setModalConfig({
      visible: true,
      title,
      type,
      data: dataList || [],
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  /* =========================================================
     EXAM TABLE
  ========================================================= */

  const examColumns = useMemo(
    () => [
      {
        title: "#",
        key: "rank",
        width: 60,
        align: "center",
        render: (_, __, index) => (
          <Avatar
            size={26}
            style={{
              backgroundColor:
                index === 0
                  ? COLORS.gold
                  : index === 1
                    ? "#94A3B8"
                    : index === 2
                      ? "#CBD5E1"
                      : "#F1F5F9",
              color: index < 3 ? "#FFFFFF" : "#475569",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Avatar>
        ),
      },

      {
        title: "Họ và Tên",
        dataIndex: "full_name",
        key: "full_name",
        render: (text) => (
          <Text
            strong
            style={{
              color: COLORS.navy,
            }}
          >
            {text || "Chưa cập nhật"}
          </Text>
        ),
      },

      {
        title: "Lớp Học",
        dataIndex: "class_name",
        key: "class_name",
        render: (text) => (
          <Tag
            color="blue"
            style={{
              borderRadius: 8,
              fontSize: 11,
            }}
          >
            {text ? text.toUpperCase() : "—"}
          </Tag>
        ),
      },

      {
        title: "Giáo Họ / Xứ",
        dataIndex: "parish",
        key: "parish",
        render: (text) => <Text type="secondary">{text || "—"}</Text>,
      },

      {
        title: "Điểm Số",
        dataIndex: "score",
        key: "score",
        align: "right",
        render: (score) => {
          const numericScore = Number(score) || 0;

          return (
            <Tag
              color={
                numericScore >= 80
                  ? "gold"
                  : numericScore >= 50
                    ? "green"
                    : "red"
              }
              style={{
                fontWeight: 700,
                borderRadius: 10,
              }}
            >
              {numericScore} điểm
            </Tag>
          );
        },
      },
    ],
    [],
  );

  /* =========================================================
     DOCUMENT TABLE
  ========================================================= */

  const docColumns = useMemo(
    () => [
      {
        title: "Tên Tài Liệu & Biểu Mẫu",
        dataIndex: "title",
        key: "title",
        render: (text) => (
          <Space size={8}>
            <FilePdfOutlined
              style={{
                color: COLORS.red,
                fontSize: 16,
              }}
            />

            <Text
              strong
              style={{
                color: COLORS.navy,
              }}
            >
              {text || "Chưa có tiêu đề"}
            </Text>
          </Space>
        ),
      },

      {
        title: "Danh Mục",
        dataIndex: "category",
        key: "category",
        render: (category) => (
          <Tag
            color="gold"
            style={{
              borderRadius: 8,
            }}
          >
            {category || "Chung"}
          </Tag>
        ),
      },

      {
        title: "Lượt Xem",
        dataIndex: "view_count",
        key: "view_count",
        align: "center",
        render: (value) => Number(value) || 0,
      },

      {
        title: "Lượt Tải",
        dataIndex: "download_count",
        key: "download_count",
        align: "center",
        render: (value) => (
          <Tag
            color="blue"
            style={{
              borderRadius: 8,
            }}
          >
            <DownloadOutlined /> {Number(value) || 0}
          </Tag>
        ),
      },
    ],
    [],
  );

  /* =========================================================
     FILTER BAR
  ========================================================= */

  const renderFilterBar = (categoryType, title) => {
    const hasFilter = Boolean(dateFilters[categoryType]);

    return (
      <div className="section-filter-bar">
        <div className="filter-heading">
          <span className="filter-icon">
            <FilterOutlined />
          </span>

          <div>
            <Text className="filter-title">{title}</Text>

            <Text className="filter-subtitle">
              Chọn khoảng thời gian để cập nhật dữ liệu
            </Text>
          </div>
        </div>

        <Space align="center" wrap size={8}>
          <RangePicker
            size="small"
            value={dateFilters[categoryType]}
            placeholder={["Từ ngày", "Đến ngày"]}
            format="DD/MM/YYYY"
            onChange={(dates) => handleSingleSectionFilter(categoryType, dates)}
            allowClear
            style={{
              borderRadius: 8,
            }}
          />

          {hasFilter && (
            <Button
              size="small"
              type="link"
              icon={<ReloadOutlined />}
              onClick={() => handleSingleSectionFilter(categoryType, null)}
              style={{
                color: COLORS.navy,
                fontSize: 11,
                padding: 0,
              }}
            >
              Bỏ lọc
            </Button>
          )}
        </Space>
      </div>
    );
  };

  /* =========================================================
     KPI SECTION
  ========================================================= */

  const renderKpis = () => (
    <Row gutter={[16, 16]} className="report-kpi-grid">
      {KPI_CONFIG.map((item) => (
        <Col key={item.key} xs={24} sm={12} lg={6} className="report-kpi-col">
          <div
            className={`report-kpi-item ${item.line}`}
            onClick={() => openDetailModal(item.key)}
          >
            <StatCard
              title={item.title}
              value={item.getValue(report)}
              prefix={
                <span
                  className="report-stat-icon"
                  style={{
                    color: item.color,
                    background:
                      item.color === COLORS.gold
                        ? COLORS.goldSoft
                        : item.color === COLORS.navy
                          ? COLORS.navySoft
                          : item.color === COLORS.blue
                            ? COLORS.blueSoft
                            : COLORS.greenSoft,
                  }}
                >
                  {item.icon}
                </span>
              }
              valueColor={COLORS.navy}
            />

            <div className="report-kpi-footer">
              <span>{item.footer}</span>

              <ArrowRightOutlined />
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  /* =========================================================
     MODAL CONTENT
  ========================================================= */

  const renderModalContent = () => {
    const data = modalConfig.data || [];

    if (modalConfig.type === "exam") {
      return (
        <Table
          columns={examColumns}
          dataSource={data}
          rowKey={(record, index) =>
            record.id || record.student_id || `exam-${index}`
          }
          pagination={{
            pageSize: 5,
          }}
          size="small"
          className="clean-table"
        />
      );
    }

    if (modalConfig.type === "document") {
      return (
        <Table
          columns={docColumns}
          dataSource={data}
          rowKey={(record, index) => record.id || `document-${index}`}
          pagination={{
            pageSize: 5,
          }}
          size="small"
          className="clean-table"
        />
      );
    }

    if (Array.isArray(data) && data.length > 0 && data[0]?.key) {
      return (
        <Table
          columns={[
            {
              title: "Chỉ số",
              dataIndex: "key",
              key: "key",
            },
            {
              title: "Giá trị",
              dataIndex: "value",
              key: "value",
              render: (value) => (
                <Tag
                  color="gold"
                  style={{
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  {value}
                </Tag>
              ),
            },
          ]}
          dataSource={data}
          rowKey={(record, index) => record.key || `detail-${index}`}
          pagination={false}
          size="small"
          className="clean-table"
        />
      );
    }

    return (
      <Table
        dataSource={data}
        rowKey={(record, index) =>
          record.id ||
          record.code ||
          record.name ||
          record.title ||
          `detail-${index}`
        }
        pagination={{
          pageSize: 5,
        }}
        size="small"
        className="clean-table"
        columns={[
          {
            title: "Tên / Tiêu đề",
            dataIndex: "name",
            render: (text, record) => text || record.title || "Chi tiết",
          },

          {
            title: "Loại / Danh mục",
            dataIndex: "type",
            render: (text, record) => (
              <Tag
                color="blue"
                style={{
                  borderRadius: 8,
                }}
              >
                {text || record.category || "Chung"}
              </Tag>
            ),
          },

          {
            title: "Địa chỉ / Địa điểm",
            dataIndex: "address",
            render: (text, record) =>
              text || record.location || "Giáo xứ Đồng Quan",
          },
        ]}
      />
    );
  };

  /* =========================================================
     MAIN
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
          Tabs: {
            itemColor: COLORS.muted,
            itemSelectedColor: COLORS.navy,
            itemHoverColor: COLORS.navy,
            inkBarColor: COLORS.gold,
          },

          Table: {
            headerBg: COLORS.softBg,
            headerColor: COLORS.navy,
          },
        },
      }}
    >
      <div className="report-dashboard-root">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <PageHeroHeader
          badge="HỆ THỐNG BÁO CÁO TỔNG HỢP MỤC VỤ"
          title="Báo Cáo Quản Trị Giáo Xứ Đồng Quan"
          description="Theo dõi tổng quan giáo dân, giáo lý, tài liệu, sự kiện, phụng vụ và hoạt động truy cập."
          onRefresh={loadAllReports}
          refreshLoading={loading}
        />

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="loading-center-box">
            <div className="loading-inner">
              <Spin size="large" />

              <Text className="loading-title">Đang tổng hợp dữ liệu</Text>

              <Text className="loading-description">
                Hệ thống đang đồng bộ báo cáo mục vụ...
              </Text>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                KPI
            ================================================= */}

            <section className="report-overview-section">
              <div className="section-heading">
                <div>
                  <Text className="section-eyebrow">TỔNG QUAN</Text>

                  <Title level={4} className="section-title">
                    Toàn Cảnh Hoạt Động
                  </Title>
                </div>

                <Text className="section-note">Số liệu tổng hợp hiện tại</Text>
              </div>

              {renderKpis()}
            </section>

            {/* =================================================
                MAIN TABS
            ================================================= */}

            <Tabs
              type="card"
              className="editorial-main-tabs"
              items={[
                /* =================================================
                   TAB 1 - PARISHIONER
                ================================================= */

                {
                  key: "parishioner-section",

                  label: (
                    <span className="tab-label">
                      <UserOutlined />
                      Giáo Dân & Bí Tích
                    </span>
                  ),

                  children: (
                    <Spin spinning={sectionLoading.parishioner}>
                      <Card bordered={false} className="report-box-card">
                        {renderFilterBar(
                          "parishioner",
                          "Lọc Dữ Liệu Giáo Dân & Hôn Nhân",
                        )}

                        <Row gutter={[28, 28]}>
                          {/* GENDER */}

                          <Col xs={24} md={12}>
                            <div className="chart-section">
                              <Title level={5} className="chart-title">
                                Cơ Cấu Giới Tính Giáo Dân
                              </Title>

                              <Text className="chart-description">
                                Phân bổ giáo dân theo giới tính
                              </Text>

                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={report.parishioner?.gender || []}
                                    dataKey="total"
                                    nameKey="gender"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={48}
                                    outerRadius={82}
                                    paddingAngle={5}
                                    onClick={(entry) =>
                                      openDetailModal(
                                        "parishioner",
                                        `Chi tiết giới tính: ${
                                          entry.gender === "male" ? "Nam" : "Nữ"
                                        }`,
                                        [
                                          {
                                            key: "Giới tính",
                                            value:
                                              entry.gender === "male"
                                                ? "Nam"
                                                : "Nữ",
                                          },
                                          {
                                            key: "Số lượng",
                                            value: `${entry.total} người`,
                                          },
                                        ],
                                      )
                                    }
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    {(report.parishioner?.gender || []).map(
                                      (entry, index) => (
                                        <Cell
                                          key={entry.gender || index}
                                          fill={
                                            PIE_COLORS[
                                              index % PIE_COLORS.length
                                            ]
                                          }
                                        />
                                      ),
                                    )}
                                  </Pie>

                                  <Tooltip
                                    formatter={(value) => [
                                      `${value} người`,
                                      "Số lượng",
                                    ]}
                                  />

                                  <Legend />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          </Col>

                          {/* SACRAMENTS */}

                          <Col xs={24} md={12}>
                            <div className="chart-section">
                              <Title level={5} className="chart-title">
                                Bí Tích Đã Hoàn Thành
                              </Title>

                              <Text className="chart-description">
                                Tình trạng các bí tích chính
                              </Text>

                              <div className="sacrament-list">
                                <div className="sacrament-item">
                                  <div className="sacrament-header">
                                    <Text strong>Rửa Tội</Text>

                                    <span className="sacrament-value">
                                      {report.parishioner?.sacrament?.baptism ||
                                        0}{" "}
                                      người
                                    </span>
                                  </div>

                                  <Progress
                                    percent={100}
                                    strokeColor={COLORS.gold}
                                    showInfo={false}
                                  />
                                </div>

                                <div className="sacrament-item">
                                  <div className="sacrament-header">
                                    <Text strong>Rước Lễ Lần Đầu</Text>

                                    <span className="sacrament-value">
                                      {report.parishioner?.sacrament
                                        ?.communion || 0}{" "}
                                      người
                                    </span>
                                  </div>

                                  <Progress
                                    percent={100}
                                    strokeColor={COLORS.navy}
                                    showInfo={false}
                                  />
                                </div>

                                <div className="sacrament-item">
                                  <div className="sacrament-header">
                                    <Text strong>Thêm Sức</Text>

                                    <span className="sacrament-value">
                                      {report.parishioner?.sacrament
                                        ?.confirmation || 0}{" "}
                                      người
                                    </span>
                                  </div>

                                  <Progress
                                    percent={100}
                                    strokeColor={COLORS.green}
                                    showInfo={false}
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Spin>
                  ),
                },

                /* =================================================
                   TAB 2 - EXAM
                ================================================= */

                {
                  key: "exam-section",

                  label: (
                    <span className="tab-label">
                      <TrophyOutlined />
                      Kết Quả Thi Giáo Lý
                    </span>
                  ),

                  children: (
                    <Spin spinning={sectionLoading.exam}>
                      <Card bordered={false} className="report-box-card">
                        {renderFilterBar("exam", "Lọc Kết Quả Thi Giáo Lý")}

                        <Row gutter={[28, 28]} className="exam-overview">
                          <Col xs={24} md={14}>
                            <Title level={5} className="chart-title">
                              Phân Bố Điểm Số
                            </Title>

                            <Text className="chart-description">
                              Phân bố kết quả các bài thi
                            </Text>

                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart
                                data={report.exam?.scoreDistribution || []}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke={COLORS.border}
                                  vertical={false}
                                />

                                <XAxis
                                  dataKey="name"
                                  tick={{
                                    fill: COLORS.muted,
                                    fontSize: 12,
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <YAxis
                                  tick={{
                                    fill: COLORS.muted,
                                    fontSize: 12,
                                  }}
                                  allowDecimals={false}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <Tooltip
                                  formatter={(value) => [
                                    `${value} học viên`,
                                    "Số lượng",
                                  ]}
                                />

                                <Bar
                                  dataKey="value"
                                  fill={COLORS.navy}
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Col>

                          <Col xs={24} md={10}>
                            <Title level={5} className="chart-title">
                              Tóm Tắt Khảo Kinh
                            </Title>

                            <Text className="chart-description">
                              Các chỉ số chính của kỳ thi
                            </Text>

                            <div className="exam-stat-grid">
                              <div className="mini-stat">
                                <Text className="mini-stat-label">
                                  Điểm Trung Bình
                                </Text>

                                <div className="mini-stat-value">
                                  {report.exam?.overview?.averageScore || 0}
                                  <span>/100</span>
                                </div>
                              </div>

                              <div className="mini-stat gold">
                                <Text className="mini-stat-label">
                                  Tổng Bài Thi
                                </Text>

                                <div className="mini-stat-value">
                                  {report.exam?.overview?.totalExams || 0}
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>

                        <Divider />

                        <div className="table-heading">
                          <div>
                            <Title level={5} className="chart-title">
                              Bảng Điểm Thi Cao Nhất
                            </Title>

                            <Text className="chart-description">
                              Danh sách học viên có kết quả nổi bật
                            </Text>
                          </div>
                        </div>

                        <Table
                          columns={examColumns}
                          dataSource={report.exam?.topStudents || []}
                          rowKey={(record, index) =>
                            record.id ||
                            record.student_id ||
                            record.full_name ||
                            `exam-${index}`
                          }
                          pagination={{
                            pageSize: 5,
                          }}
                          size="small"
                          className="clean-table"
                          scroll={{
                            x: 650,
                          }}
                        />
                      </Card>
                    </Spin>
                  ),
                },

                /* =================================================
                   TAB 3 - DOCUMENT + EVENT
                ================================================= */

                {
                  key: "doc-event-section",

                  label: (
                    <span className="tab-label">
                      <FileTextOutlined />
                      Tài Liệu & Sự Kiện
                    </span>
                  ),

                  children: (
                    <Row gutter={[20, 20]}>
                      {/* DOCUMENT */}

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.document}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("document", "Lọc Kho Tài Liệu")}

                            <div className="card-section-heading">
                              <Title level={5} className="chart-title">
                                Tài Liệu Được Quan Tâm
                              </Title>

                              <Text className="chart-description">
                                Những tài liệu có lượt xem cao
                              </Text>
                            </div>

                            <Table
                              columns={docColumns}
                              dataSource={report.document?.topViews || []}
                              rowKey={(record, index) =>
                                record.id || `document-${index}`
                              }
                              pagination={{
                                pageSize: 5,
                              }}
                              size="small"
                              className="clean-table"
                              scroll={{
                                x: 520,
                              }}
                            />
                          </Card>
                        </Spin>
                      </Col>

                      {/* EVENT */}

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.event}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("event", "Lọc Diễn Biến Sự Kiện")}

                            <div className="card-section-heading">
                              <Title level={5} className="chart-title">
                                Tăng Trưởng Sự Kiện
                              </Title>

                              <Text className="chart-description">
                                Số lượng sự kiện được tạo theo tháng
                              </Text>
                            </div>

                            <ResponsiveContainer width="100%" height={250}>
                              <AreaChart
                                data={report.event?.createdByMonth || []}
                              >
                                <defs>
                                  <linearGradient
                                    id="faithEventGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor={COLORS.gold}
                                      stopOpacity={0.35}
                                    />

                                    <stop
                                      offset="95%"
                                      stopColor={COLORS.gold}
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>

                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke={COLORS.border}
                                  vertical={false}
                                />

                                <XAxis
                                  dataKey="month"
                                  tick={{
                                    fill: COLORS.muted,
                                    fontSize: 12,
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <YAxis
                                  tick={{
                                    fill: COLORS.muted,
                                    fontSize: 12,
                                  }}
                                  allowDecimals={false}
                                  axisLine={false}
                                  tickLine={false}
                                />

                                <Tooltip
                                  formatter={(value) => [
                                    `${value} sự kiện`,
                                    "Tổng",
                                  ]}
                                />

                                <Area
                                  type="monotone"
                                  dataKey="total"
                                  stroke={COLORS.gold}
                                  strokeWidth={3}
                                  fillOpacity={1}
                                  fill="url(#faithEventGradient)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Card>
                        </Spin>
                      </Col>
                    </Row>
                  ),
                },

                /* =================================================
                   TAB 4 - LITURGICAL + VISITOR
                ================================================= */

                {
                  key: "liturgy-visitor-section",

                  label: (
                    <span className="tab-label">
                      <GlobalOutlined />
                      Phụng Vụ & Truy Cập
                    </span>
                  ),

                  children: (
                    <Row gutter={[20, 20]}>
                      {/* LITURGICAL */}

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.liturgical}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar(
                              "liturgical",
                              "Lọc Lịch Lễ Phụng Vụ",
                            )}

                            <div className="card-section-heading">
                              <Title level={5} className="chart-title">
                                Phân Bổ Thánh Lễ
                              </Title>

                              <Text className="chart-description">
                                Thống kê số thánh lễ theo giáo xứ
                              </Text>
                            </div>

                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={report.liturgical?.church || []}
                                  dataKey="total"
                                  nameKey="church_name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={82}
                                  innerRadius={36}
                                  paddingAngle={4}
                                >
                                  {(report.liturgical?.church || []).map(
                                    (entry, index) => (
                                      <Cell
                                        key={entry.church_name || index}
                                        fill={
                                          PIE_COLORS[index % PIE_COLORS.length]
                                        }
                                      />
                                    ),
                                  )}
                                </Pie>

                                <Tooltip
                                  formatter={(value) => [
                                    `${value} thánh lễ`,
                                    "Tổng",
                                  ]}
                                />

                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </Card>
                        </Spin>
                      </Col>

                      {/* VISITOR */}

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.visitor}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("visitor", "Lọc Truy Cập Website")}

                            <div className="card-section-heading">
                              <Title level={5} className="chart-title">
                                Hoạt Động Website
                              </Title>

                              <Text className="chart-description">
                                Theo dõi lượng truy cập hệ thống
                              </Text>
                            </div>

                            <Row gutter={[16, 16]}>
                              <Col span={12}>
                                <div className="visitor-stat">
                                  <Text className="visitor-stat-label">
                                    Lượt xem hôm nay
                                  </Text>

                                  <div className="visitor-stat-value">
                                    {report.visitor?.todayVisitors || 0}
                                  </div>
                                </div>
                              </Col>

                              <Col span={12}>
                                <div className="visitor-stat online">
                                  <Text className="visitor-stat-label">
                                    Đang Online
                                  </Text>

                                  <div className="visitor-stat-value">
                                    <span className="online-dot" />
                                    {report.visitor?.onlineUsers || 0}
                                  </div>
                                </div>
                              </Col>
                            </Row>

                            <Divider />

                            <div className="visitor-total">
                              <Text className="visitor-stat-label">
                                Tổng lượt xem tích lũy
                              </Text>

                              <div className="visitor-total-value">
                                {report.visitor?.totalViews || 0}
                              </div>
                            </div>
                          </Card>
                        </Spin>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />

            {/* =================================================
                DETAIL MODAL
            ================================================= */}

            <Modal
              title={
                <div className="modal-title">
                  <span className="modal-title-icon">
                    <FileTextOutlined />
                  </span>

                  <span>{modalConfig.title}</span>
                </div>
              }
              open={modalConfig.visible}
              footer={null}
              onCancel={closeModal}
              width={720}
              centered
              destroyOnClose
              className="report-detail-modal"
            >
              <div className="modal-content">{renderModalContent()}</div>
            </Modal>
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

              .report-dashboard-root {
                min-height: 100vh;
                padding: 24px;
                background: ${COLORS.softBg};
                color: ${COLORS.dark};
                font-family: 'Be Vietnam Pro', sans-serif;
              }

              /* =========================================
                 LOADING
              ========================================= */

              .loading-center-box {
                min-height: 420px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .loading-inner {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 48px;
              }

              .loading-title {
                margin-top: 14px;
                color: ${COLORS.navy};
                font-size: 14px;
                font-weight: 700;
              }

              .loading-description {
                color: ${COLORS.muted};
                font-size: 12px;
              }

              /* =========================================
                 OVERVIEW
              ========================================= */

              .report-overview-section {
                margin-top: 24px;
                margin-bottom: 28px;
              }

              .section-heading {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 14px;
                gap: 16px;
              }

              .section-eyebrow {
                display: block;
                color: ${COLORS.gold};
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1.4px;
                margin-bottom: 3px;
              }

              .section-title {
                margin: 0 !important;
                color: ${COLORS.navy} !important;
                font-family: 'Playfair Display', Georgia, serif !important;
                font-weight: 700 !important;
              }

              .section-note {
                color: ${COLORS.muted};
                font-size: 11px;
              }

              /* =========================================
                 KPI
              ========================================= */

              .report-kpi-col {
                display: flex;
              }

              .report-kpi-item {
                position: relative;
                width: 100%;
                height: 100%;
                padding-left: 4px;
                cursor: pointer;
                transition: transform 0.2s ease;
              }

              .report-kpi-item::before {
                content: "";
                position: absolute;
                z-index: 5;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                border-radius: 5px 0 0 5px;
              }

              .report-kpi-item.gold-line::before {
                background: ${COLORS.gold};
              }

              .report-kpi-item.navy-line::before {
                background: ${COLORS.navy};
              }

              .report-kpi-item.blue-line::before {
                background: ${COLORS.blue};
              }

              .report-kpi-item.green-line::before {
                background: ${COLORS.green};
              }

              .report-kpi-item:hover {
                transform: translateY(-3px);
              }

              .report-kpi-item:hover .faith-stat-card {
                box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important;
              }

              .report-stat-icon {
                width: 40px;
                height: 40px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                font-size: 18px;
              }

              .report-kpi-footer {
                position: absolute;
                z-index: 6;
                left: 24px;
                right: 20px;
                bottom: 13px;
                padding-top: 8px;
                border-top: 1px dashed ${COLORS.border};
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: ${COLORS.gold};
                font-size: 10px;
                font-weight: 600;
                pointer-events: none;
              }

              /* =========================================
                 TABS
              ========================================= */

              .editorial-main-tabs {
                margin-top: 6px;
              }

              .editorial-main-tabs .ant-tabs-nav {
                margin-bottom: 16px !important;
              }

              .editorial-main-tabs .ant-tabs-tab {
                border-radius: 10px 10px 0 0 !important;
                font-size: 12px;
                font-weight: 600;
              }

              .tab-label {
                display: inline-flex;
                align-items: center;
                gap: 7px;
              }

              /* =========================================
                 FILTER
              ========================================= */

              .section-filter-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 14px;
                flex-wrap: wrap;
                padding: 11px 14px;
                margin-bottom: 22px;
                border: 1px solid ${COLORS.border};
                border-radius: 11px;
                background: ${COLORS.softBg};
              }

              .filter-heading {
                display: flex;
                align-items: center;
                gap: 9px;
              }

              .filter-icon {
                width: 30px;
                height: 30px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 9px;
                background: ${COLORS.goldSoft};
                color: ${COLORS.gold};
                font-size: 13px;
              }

              .filter-title {
                display: block;
                color: ${COLORS.navy};
                font-size: 12px;
                font-weight: 700;
              }

              .filter-subtitle {
                display: block;
                margin-top: 1px;
                color: ${COLORS.muted};
                font-size: 10px;
              }

              /* =========================================
                 REPORT CARD
              ========================================= */

              .report-box-card {
                border-radius: 16px !important;
                background: ${COLORS.white} !important;
                border: 1px solid ${COLORS.border} !important;
                box-shadow: 0 5px 20px rgba(15, 23, 42, 0.025) !important;
                overflow: hidden;
              }

              .report-box-card .ant-card-body {
                padding: 20px !important;
              }

              .chart-section {
                min-height: 290px;
              }

              .chart-title {
                margin: 0 !important;
                color: ${COLORS.navy} !important;
                font-size: 15px !important;
                font-weight: 700 !important;
              }

              .chart-description {
                display: block;
                margin-top: 3px;
                color: ${COLORS.muted};
                font-size: 11px;
              }

              .card-section-heading {
                margin-bottom: 16px;
              }

              /* =========================================
                 SACRAMENT
              ========================================= */

              .sacrament-list {
                margin-top: 28px;
              }

              .sacrament-item {
                margin-bottom: 22px;
              }

              .sacrament-item:last-child {
                margin-bottom: 0;
              }

              .sacrament-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 7px;
              }

              .sacrament-header .ant-typography {
                font-size: 12px;
              }

              .sacrament-value {
                color: ${COLORS.navy};
                font-size: 11px;
                font-weight: 700;
              }

              .sacrament-item .ant-progress {
                margin: 0;
              }

              /* =========================================
                 EXAM
              ========================================= */

              .exam-overview {
                margin-top: 6px;
              }

              .exam-stat-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin-top: 26px;
              }

              .mini-stat {
                min-height: 115px;
                padding: 18px;
                border-radius: 14px;
                border: 1px solid ${COLORS.border};
                background: ${COLORS.softBg};
              }

              .mini-stat.gold {
                border-color: rgba(212, 175, 55, 0.25);
                background: rgba(212, 175, 55, 0.05);
              }

              .mini-stat-label {
                display: block;
                color: ${COLORS.muted};
                font-size: 11px;
                font-weight: 600;
              }

              .mini-stat-value {
                margin-top: 12px;
                color: ${COLORS.navy};
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 28px;
                font-weight: 700;
              }

              .mini-stat.gold .mini-stat-value {
                color: ${COLORS.gold};
              }

              .mini-stat-value span {
                margin-left: 3px;
                color: ${COLORS.muted};
                font-family: 'Be Vietnam Pro', sans-serif;
                font-size: 11px;
                font-weight: 500;
              }

              /* =========================================
                 TABLE
              ========================================= */

              .table-heading {
                margin-bottom: 15px;
              }

              .clean-table .ant-table {
                border: 1px solid ${COLORS.softBorder};
                border-radius: 10px;
                overflow: hidden;
              }

              .clean-table .ant-table-thead > tr > th {
                background: ${COLORS.softBg} !important;
                color: ${COLORS.navy} !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                border-bottom: 1px solid ${COLORS.border} !important;
              }

              .clean-table .ant-table-tbody > tr > td {
                font-size: 11px;
                color: ${COLORS.text};
                border-bottom: 1px solid ${COLORS.softBorder};
              }

              .clean-table .ant-table-tbody > tr:hover > td {
                background: rgba(212, 175, 55, 0.035) !important;
              }

              /* =========================================
                 VISITOR
              ========================================= */

              .visitor-stat {
                min-height: 115px;
                padding: 18px;
                border: 1px solid ${COLORS.border};
                border-radius: 14px;
                background: ${COLORS.softBg};
              }

              .visitor-stat.online {
                border-color: rgba(16, 185, 129, 0.22);
                background: rgba(16, 185, 129, 0.035);
              }

              .visitor-stat-label {
                display: block;
                color: ${COLORS.muted};
                font-size: 11px;
                font-weight: 600;
              }

              .visitor-stat-value {
                display: flex;
                align-items: center;
                gap: 7px;
                margin-top: 13px;
                color: ${COLORS.navy};
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 28px;
                font-weight: 700;
              }

              .online-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${COLORS.green};
                box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.10);
              }

              .visitor-total {
                padding: 4px 0;
              }

              .visitor-total-value {
                margin-top: 4px;
                color: ${COLORS.gold};
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 30px;
                font-weight: 700;
              }

              /* =========================================
                 MODAL
              ========================================= */

              .modal-title {
                display: flex;
                align-items: center;
                gap: 10px;
                color: ${COLORS.navy};
                font-size: 15px;
                font-weight: 700;
              }

              .modal-title-icon {
                width: 30px;
                height: 30px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: 9px;
                background: ${COLORS.goldSoft};
                color: ${COLORS.gold};
              }

              .modal-content {
                padding-top: 8px;
              }

              /* =========================================
                 MOBILE
              ========================================= */

              @media (max-width: 768px) {
                .report-dashboard-root {
                  padding: 14px;
                }

                .section-heading {
                  align-items: flex-start;
                  flex-direction: column;
                  gap: 4px;
                }

                .section-filter-bar {
                  align-items: flex-start;
                  flex-direction: column;
                }

                .filter-heading {
                  width: 100%;
                }

                .filter-heading + .ant-space {
                  width: 100%;
                }

                .report-box-card .ant-card-body {
                  padding: 14px !important;
                }

                .exam-stat-grid {
                  grid-template-columns: 1fr;
                }

                .chart-section {
                  min-height: auto;
                }

                .report-kpi-footer {
                  left: 24px;
                }
              }

              @media (max-width: 480px) {
                .report-dashboard-root {
                  padding: 10px;
                }

                .section-title {
                  font-size: 19px !important;
                }

                .report-stat-icon {
                  width: 36px;
                  height: 36px;
                  border-radius: 10px;
                  font-size: 16px;
                }

                .report-kpi-footer {
                  font-size: 9px;
                }

                .mini-stat-value,
                .visitor-stat-value {
                  font-size: 24px;
                }

                .section-filter-bar {
                  padding: 10px;
                }
              }
            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default ReportDashboard;
