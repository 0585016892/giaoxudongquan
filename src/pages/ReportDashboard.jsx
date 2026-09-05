import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
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
  Dropdown,
  Divider,
} from "antd";

import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CompassOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  HomeOutlined,
  PrinterOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  GlobalOutlined,
  ExportOutlined,
  FilterOutlined,
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
  exportReportFile,
} from "../api/reportApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Bảng màu thiết kế Tôn Nghiêm (Sacred Palette)
const PIE_COLORS = [
  "#1B365D",
  "#D4AF37",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EF4444",
];

const ReportDashboard = () => {
  const primaryNavy = "#1B365D"; // Xanh Đêm Navy
  const accentGold = "#D4AF37"; // Vàng Đồng Ánh Kim
  const textDark = "#0F172A";
  const softBg = "#F8FAFC";

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState({});

  // State quản lý khoảng ngày lọc riêng cho từng loại API
  const [dateFilters, setDateFilters] = useState({
    parishioner: null,
    exam: null,
    document: null,
    event: null,
    liturgical: null,
    visitor: null,
  });

  // State loading riêng cho từng phần khi lọc ngày
  const [sectionLoading, setSectionLoading] = useState({
    parishioner: false,
    exam: false,
    document: false,
    event: false,
    liturgical: false,
    visitor: false,
  });

  // State Modal Chi Tiết
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    type: null,
    data: [],
  });

  useEffect(() => {
    document.title = "Báo Cáo Quản Trị Chuyên Sâu | Giáo Xứ Đồng Quan";
    loadAllReports();
  }, []);

  // 1. GỌI TOÀN BỘ API LẦN ĐẦU
  const loadAllReports = async () => {
    try {
      setLoading(true);

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
      ] = await Promise.allSettled([
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

      const extractData = (res) =>
        res.status === "fulfilled"
          ? res.value?.data?.data || res.value?.data || {}
          : {};

      setReport({
        church: extractData(church),
        document: extractData(document),
        event: extractData(event),
        exam: extractData(exam),
        group: extractData(group),
        liturgical: extractData(liturgical),
        parishioner: extractData(parishioner),
        slide: extractData(slide),
        visitor: extractData(visitor),
      });
    } catch (err) {
      console.error("Lỗi tải báo cáo:", err);
      message.error("Lỗi tải báo cáo tổng hợp!");
    } finally {
      setLoading(false);
    }
  };

  // 2. HÀM XỬ LÝ LỌC NGÀY RIÊNG CHO TỪNG LOẠI API
  const handleSingleSectionFilter = async (categoryType, dates) => {
    try {
      setSectionLoading((prev) => ({ ...prev, [categoryType]: true }));
      setDateFilters((prev) => ({ ...prev, [categoryType]: dates }));

      let params = {};
      if (dates && dates[0] && dates[1]) {
        params.startDate = dates[0].format("YYYY-MM-DD");
        params.endDate = dates[1].format("YYYY-MM-DD");
      }

      let res;
      switch (categoryType) {
        case "parishioner":
          res = await getParishionerReport(params);
          break;
        case "exam":
          res = await getExamReport(params);
          break;
        case "document":
          res = await getDocumentReport(params);
          break;
        case "event":
          res = await getEventReport(params);
          break;
        case "liturgical":
          res = await getLiturgicalReport(params);
          break;
        case "visitor":
          res = await getVisitorReport(params);
          break;
        default:
          break;
      }

      if (res) {
        const newData = res?.data?.data || res?.data || {};
        setReport((prev) => ({
          ...prev,
          [categoryType]: newData,
        }));
        message.success(
          `Đã cập nhật dữ liệu ${getCategoryLabel(categoryType)} theo ngày chọn!`,
        );
      }
    } catch (err) {
      console.error(`Lỗi lọc ngày ${categoryType}:`, err);
      message.error(
        `Không thể lọc dữ liệu cho ${getCategoryLabel(categoryType)}!`,
      );
    } finally {
      setSectionLoading((prev) => ({ ...prev, [categoryType]: false }));
    }
  };

  const getCategoryLabel = (type) => {
    const labels = {
      parishioner: "Giáo Dân",
      exam: "Thi Giáo Lý",
      document: "Tài Liệu",
      event: "Sự Kiện",
      liturgical: "Lịch Phụng Vụ",
      visitor: "Lượt Truy Cập",
    };
    return labels[type] || type;
  };

  // 3. HÀM XUẤT BÁO CÁO CSV
  const handleExport = async (type, label) => {
    try {
      message.loading({
        content: `Đang kết xuất báo cáo ${label}...`,
        key: "exporting",
      });
      const response = await exportReportFile(type);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bao_Cao_${type}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success({
        content: `Đã xuất báo cáo ${label} thành công!`,
        key: "exporting",
      });
    } catch (err) {
      console.error("Lỗi xuất file:", err);
      message.error({
        content: "Không thể xuất file báo cáo!",
        key: "exporting",
      });
    }
  };

  const exportMenuItems = [
    {
      key: "church",
      label: "Báo cáo Giáo Xứ & Họ",
      onClick: () => handleExport("church", "Giáo Xứ"),
    },
    {
      key: "parishioner",
      label: "Báo cáo Giáo Dân",
      onClick: () => handleExport("parishioner", "Giáo Dân"),
    },
    {
      key: "exam",
      label: "Báo cáo Thi Giáo Lý",
      onClick: () => handleExport("exam", "Thi Giáo Lý"),
    },
    {
      key: "document",
      label: "Báo cáo Kho Tài Liệu",
      onClick: () => handleExport("document", "Tài Liệu"),
    },
    {
      key: "event",
      label: "Báo cáo Sự Kiện Mục Vụ",
      onClick: () => handleExport("event", "Sự Kiện"),
    },
    {
      key: "liturgical",
      label: "Báo cáo Lịch Phụng Vụ",
      onClick: () => handleExport("liturgical", "Lịch Phụng Vụ"),
    },
    {
      key: "visitor",
      label: "Báo cáo Lượt Truy Cập",
      onClick: () => handleExport("visitor", "Truy Cập Website"),
    },
  ];

  // Mở Modal Chi Tiết
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
              value: `${report.parishioner?.sacrament?.confirmation || 0} người`,
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
          break;
      }
    }

    setModalConfig({
      visible: true,
      title,
      type,
      data: dataList,
    });
  };

  // Cột cho Bảng Thi Giáo Lý
  const examColumns = [
    {
      title: "#",
      key: "rank",
      width: 50,
      render: (_, __, index) => (
        <Avatar
          size={24}
          style={{
            backgroundColor:
              index === 0
                ? accentGold
                : index === 1
                  ? "#94A3B8"
                  : index === 2
                    ? "#CBD5E1"
                    : "#F1F5F9",
            color: index < 3 ? "#FFF" : "#475569",
            fontSize: 12,
            fontWeight: "bold",
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
        <Text strong style={{ color: primaryNavy }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Lớp Học",
      dataIndex: "class_name",
      key: "class_name",
      render: (text) => <Tag color="blue">{text?.toUpperCase()}</Tag>,
    },
    {
      title: "Giáo Họ / Xứ",
      dataIndex: "parish",
      key: "parish",
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: "Điểm Số",
      dataIndex: "score",
      key: "score",
      align: "right",
      render: (score) => (
        <Tag
          color={score >= 80 ? "gold" : score >= 50 ? "green" : "red"}
          style={{ fontWeight: "bold", borderRadius: 10 }}
        >
          {score} điểm
        </Tag>
      ),
    },
  ];

  // Cột cho Bảng Tài Liệu
  const docColumns = [
    {
      title: "Tên Tài Liệu & Biểu Mẫu",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Space>
          <FilePdfOutlined style={{ color: "#e74c3c", fontSize: 16 }} />
          <Text strong style={{ color: primaryNavy }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: "Danh Mục",
      dataIndex: "category",
      key: "category",
      render: (cat) => <Tag color="gold">{cat || "Chung"}</Tag>,
    },
    {
      title: "Lượt Xem",
      dataIndex: "view_count",
      key: "view_count",
      align: "center",
      render: (v) => <Text>{v || 0}</Text>,
    },
    {
      title: "Lượt Tải",
      dataIndex: "download_count",
      key: "download_count",
      align: "center",
      render: (v) => (
        <Tag color="blue">
          <DownloadOutlined /> {v || 0}
        </Tag>
      ),
    },
  ];

  // Render Khung Lọc Ngày Dành Riêng Cho Từng Thẻ Báo Cáo
  const renderFilterBar = (categoryType, title) => (
    <div className="section-filter-bar">
      <Space align="center">
        <FilterOutlined style={{ color: accentGold }} />
        <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
          {title}
        </Text>
      </Space>

      <Space align="center" wrap>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Lọc ngày:
        </Text>
        <RangePicker
          size="small"
          placeholder={["Từ ngày", "Đến ngày"]}
          onChange={(dates) => handleSingleSectionFilter(categoryType, dates)}
          style={{ borderRadius: 8 }}
        />
        {dateFilters[categoryType] && (
          <Button
            size="small"
            type="link"
            onClick={() => handleSingleSectionFilter(categoryType, null)}
          >
            Xóa lọc
          </Button>
        )}
      </Space>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 16,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="report-dashboard-root">
        {/* HEADER VỚI NÚT EXPORT & IN BÁO CÁO */}
        <div className="report-top-header">
          <div>
            <span className="badge-sacred">
              <CompassOutlined /> HỆ THỐNG BÁO CÁO TỔNG HỢP MỤC VỤ
            </span>
            <Title level={2} className="report-main-title">
              Báo Cáo Quản Trị Giáo Xứ Đồng Quan
            </Title>
          </div>

          <Space size="middle" wrap>
            <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
              <Button
                icon={<ExportOutlined />}
                style={{ borderRadius: 10, fontWeight: 600 }}
              >
                Xuất Báo Cáo (CSV)
              </Button>
            </Dropdown>

            <Button
              icon={<PrinterOutlined />}
              onClick={() => window.print()}
              style={{ borderRadius: 10, fontWeight: 600 }}
            >
              In Báo Cáo
            </Button>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={loadAllReports}
              style={{
                borderRadius: 10,
                fontWeight: 600,
                background: primaryNavy,
              }}
            >
              Làm mới toàn bộ
            </Button>
          </Space>
        </div>

        {loading ? (
          <div className="loading-center-box">
            <Spin
              size="large"
              tip="Đang tổng hợp dữ liệu báo cáo chuyên sâu..."
            />
          </div>
        ) : (
          <>
            {/* 1. KHU VỰC TỔNG QUAN HỆ THỐNG - 5 CARDS KPIS */}
            <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
              <Col xs={24} sm={12} lg={6} style={{ flexGrow: 1 }}>
                <Card
                  bordered={false}
                  className="kpi-card gold-line clickable-card"
                  onClick={() => openDetailModal("church")}
                >
                  <Statistic
                    title={<span className="kpi-label">GIÁO XỨ & HỌ</span>}
                    value={report.church?.overview?.totalChurches || 0}
                    prefix={
                      <HomeOutlined
                        style={{ color: primaryNavy, marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                  <div className="card-footer-action">
                    <Text className="action-text">
                      Xem danh sách <ArrowRightOutlined />
                    </Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6} style={{ flexGrow: 1 }}>
                <Card
                  bordered={false}
                  className="kpi-card navy-line clickable-card"
                  onClick={() => openDetailModal("parishioner")}
                >
                  <Statistic
                    title={<span className="kpi-label">TỔNG GIÁO DÂN</span>}
                    value={report.parishioner?.total || 0}
                    prefix={
                      <UserOutlined
                        style={{ color: accentGold, marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                  <div className="card-footer-action">
                    <Text className="action-text">
                      Cơ cấu & Bí tích <ArrowRightOutlined />
                    </Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6} style={{ flexGrow: 1 }}>
                <Card
                  bordered={false}
                  className="kpi-card blue-line clickable-card"
                  onClick={() => openDetailModal("exam")}
                >
                  <Statistic
                    title={<span className="kpi-label">BÀI THI GIÁO LÝ</span>}
                    value={report.exam?.overview?.totalExams || 0}
                    prefix={
                      <TrophyOutlined
                        style={{ color: "#3B82F6", marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                  <div className="card-footer-action">
                    <Text className="action-text">
                      Bảng điểm thi <ArrowRightOutlined />
                    </Text>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={6} style={{ flexGrow: 1 }}>
                <Card
                  bordered={false}
                  className="kpi-card green-line clickable-card"
                  onClick={() => openDetailModal("event")}
                >
                  <Statistic
                    title={<span className="kpi-label">SỰ KIỆN MỤC VỤ</span>}
                    value={report.event?.overview?.totalEvents || 0}
                    prefix={
                      <CalendarOutlined
                        style={{ color: "#10B981", marginRight: 8 }}
                      />
                    }
                    valueStyle={{ color: primaryNavy, fontWeight: "bold" }}
                  />
                  <div className="card-footer-action">
                    <Text className="action-text">
                      Lịch sự kiện <ArrowRightOutlined />
                    </Text>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 2. TABS CHÂN TRANG ĐIỀU HÀNH PHÂN KHU (SECTION NAVIGATION) */}
            <Tabs
              type="card"
              className="editorial-main-tabs"
              items={[
                {
                  key: "parishioner-section",
                  label: (
                    <span>
                      <UserOutlined /> Báo Cáo Giáo Dân & Bí Tích
                    </span>
                  ),
                  children: (
                    <Spin spinning={sectionLoading.parishioner}>
                      <Card bordered={false} className="report-box-card">
                        {renderFilterBar(
                          "parishioner",
                          "Lọc Dữ Liệu Giáo Dân & Hôn Nhân",
                        )}

                        <Row gutter={[24, 24]}>
                          <Col xs={24} md={12}>
                            <Title level={5} style={{ color: primaryNavy }}>
                              Cơ Cấu Giới Tính Giáo Dân
                            </Title>
                            <ResponsiveContainer width="100%" height={240}>
                              <PieChart>
                                <Pie
                                  data={report.parishioner?.gender || []}
                                  dataKey="total"
                                  nameKey="gender"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={45}
                                  outerRadius={75}
                                  paddingAngle={5}
                                  onClick={(entry) =>
                                    openDetailModal(
                                      "parishioner",
                                      `Chi tiết giới tính: ${entry.gender === "male" ? "Nam" : "Nữ"}`,
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
                                  style={{ cursor: "pointer" }}
                                >
                                  {(report.parishioner?.gender || []).map(
                                    (entry, index) => (
                                      <Cell
                                        key={index}
                                        fill={
                                          PIE_COLORS[index % PIE_COLORS.length]
                                        }
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(v) => [`${v} người`, "Số lượng"]}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </Col>

                          <Col xs={24} md={12}>
                            <Title level={5} style={{ color: primaryNavy }}>
                              Bí Tích Đã Hoàn Thành
                            </Title>
                            <div style={{ marginTop: 20 }}>
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size={16}
                              >
                                <div>
                                  <Text strong style={{ fontSize: 13 }}>
                                    Rửa Tội (Baptism)
                                  </Text>
                                  <Progress
                                    percent={100}
                                    strokeColor={accentGold}
                                    format={() =>
                                      `${report.parishioner?.sacrament?.baptism || 0} người`
                                    }
                                  />
                                </div>
                                <div>
                                  <Text strong style={{ fontSize: 13 }}>
                                    Rước Lễ Lần Đầu (Communion)
                                  </Text>
                                  <Progress
                                    percent={100}
                                    strokeColor={primaryNavy}
                                    format={() =>
                                      `${report.parishioner?.sacrament?.communion || 0} người`
                                    }
                                  />
                                </div>
                                <div>
                                  <Text strong style={{ fontSize: 13 }}>
                                    Thêm Sức (Confirmation)
                                  </Text>
                                  <Progress
                                    percent={100}
                                    strokeColor="#10B981"
                                    format={() =>
                                      `${report.parishioner?.sacrament?.confirmation || 0} người`
                                    }
                                  />
                                </div>
                              </Space>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Spin>
                  ),
                },
                {
                  key: "exam-section",
                  label: (
                    <span>
                      <TrophyOutlined /> Kết Quả Thi Giáo Lý
                    </span>
                  ),
                  children: (
                    <Spin spinning={sectionLoading.exam}>
                      <Card bordered={false} className="report-box-card">
                        {renderFilterBar("exam", "Lọc Kết Quả Thi Giáo Lý")}

                        <Row gutter={[24, 24]} style={{ marginBottom: 20 }}>
                          <Col xs={24} md={14}>
                            <Title level={5} style={{ color: primaryNavy }}>
                              Phân Bố Điểm Số
                            </Title>
                            <ResponsiveContainer width="100%" height={240}>
                              <BarChart
                                data={report.exam?.scoreDistribution || []}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E2E8F0"
                                />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fill: "#64748B", fontSize: 12 }}
                                />
                                <YAxis
                                  tick={{ fill: "#64748B", fontSize: 12 }}
                                  allowDecimals={false}
                                />
                                <Tooltip
                                  formatter={(v) => [
                                    `${v} học viên`,
                                    "Số lượng",
                                  ]}
                                />
                                <Bar
                                  dataKey="value"
                                  fill={primaryNavy}
                                  radius={[6, 6, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </Col>

                          <Col xs={24} md={10}>
                            <Title level={5} style={{ color: primaryNavy }}>
                              Tóm Tắt Khảo Kinh
                            </Title>
                            <div style={{ marginTop: 24 }}>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Statistic
                                    title="Điểm TB"
                                    value={
                                      report.exam?.overview?.averageScore || 0
                                    }
                                    suffix="/100"
                                    valueStyle={{
                                      color: primaryNavy,
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Col>
                                <Col span={12}>
                                  <Statistic
                                    title="Số bài thi"
                                    value={
                                      report.exam?.overview?.totalExams || 0
                                    }
                                    valueStyle={{
                                      color: accentGold,
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>

                        <Divider style={{ margin: "16px 0" }} />
                        <Title
                          level={5}
                          style={{ color: primaryNavy, marginBottom: 16 }}
                        >
                          Bảng Điểm Thi Cao Nhất
                        </Title>
                        <Table
                          columns={examColumns}
                          dataSource={report.exam?.topStudents || []}
                          rowKey="full_name"
                          pagination={{ pageSize: 5 }}
                          size="small"
                          className="clean-table"
                        />
                      </Card>
                    </Spin>
                  ),
                },
                {
                  key: "doc-event-section",
                  label: (
                    <span>
                      <FileTextOutlined /> Tài Liệu & Sự Kiện
                    </span>
                  ),
                  children: (
                    <Row gutter={[20, 20]}>
                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.document}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("document", "Lọc Kho Tài Liệu")}
                            <Table
                              columns={docColumns}
                              dataSource={report.document?.topViews || []}
                              rowKey="id"
                              pagination={{ pageSize: 5 }}
                              size="small"
                              className="clean-table"
                            />
                          </Card>
                        </Spin>
                      </Col>

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.event}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("event", "Lọc Diễn Biến Sự Kiện")}
                            <ResponsiveContainer width="100%" height={240}>
                              <AreaChart
                                data={report.event?.createdByMonth || []}
                              >
                                <defs>
                                  <linearGradient
                                    id="colorEvent"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor={accentGold}
                                      stopOpacity={0.4}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor={accentGold}
                                      stopOpacity={0.0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#E2E8F0"
                                />
                                <XAxis
                                  dataKey="month"
                                  tick={{ fill: "#64748B", fontSize: 12 }}
                                />
                                <YAxis
                                  tick={{ fill: "#64748B", fontSize: 12 }}
                                  allowDecimals={false}
                                />
                                <Tooltip
                                  formatter={(v) => [`${v} sự kiện`, "Tổng"]}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="total"
                                  stroke={accentGold}
                                  strokeWidth={3}
                                  fillOpacity={1}
                                  fill="url(#colorEvent)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Card>
                        </Spin>
                      </Col>
                    </Row>
                  ),
                },
                {
                  key: "liturgy-visitor-section",
                  label: (
                    <span>
                      <GlobalOutlined /> Phụng Vụ & Lượt Truy Cập
                    </span>
                  ),
                  children: (
                    <Row gutter={[20, 20]}>
                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.liturgical}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar(
                              "liturgical",
                              "Lọc Lịch Lễ Phụng Vụ",
                            )}
                            <ResponsiveContainer width="100%" height={240}>
                              <PieChart>
                                <Pie
                                  data={report.liturgical?.church || []}
                                  dataKey="total"
                                  nameKey="church_name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={75}
                                >
                                  {(report.liturgical?.church || []).map(
                                    (entry, index) => (
                                      <Cell
                                        key={index}
                                        fill={
                                          PIE_COLORS[index % PIE_COLORS.length]
                                        }
                                      />
                                    ),
                                  )}
                                </Pie>
                                <Tooltip
                                  formatter={(v) => [`${v} thánh lễ`, "Tổng"]}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </Card>
                        </Spin>
                      </Col>

                      <Col xs={24} md={12}>
                        <Spin spinning={sectionLoading.visitor}>
                          <Card bordered={false} className="report-box-card">
                            {renderFilterBar("visitor", "Lọc Truy Cập Website")}
                            <div style={{ padding: "20px 0" }}>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Statistic
                                    title="Lượt xem hôm nay"
                                    value={report.visitor?.todayVisitors || 0}
                                    valueStyle={{
                                      color: primaryNavy,
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Col>
                                <Col span={12}>
                                  <Statistic
                                    title="Đang Online Realtime"
                                    value={report.visitor?.onlineUsers || 0}
                                    valueStyle={{
                                      color: "#10B981",
                                      fontWeight: "bold",
                                    }}
                                  />
                                </Col>
                              </Row>
                              <Divider style={{ margin: "16px 0" }} />
                              <Statistic
                                title="Tổng lượt xem tích lũy"
                                value={report.visitor?.totalViews || 0}
                                valueStyle={{
                                  color: accentGold,
                                  fontWeight: "bold",
                                }}
                              />
                            </div>
                          </Card>
                        </Spin>
                      </Col>
                    </Row>
                  ),
                },
              ]}
            />

            {/* MODAL XEM CHI TIẾT DỮ LIỆU */}
            <Modal
              title={
                <span style={{ color: primaryNavy, fontWeight: 700 }}>
                  {modalConfig.title}
                </span>
              }
              open={modalConfig.visible}
              footer={null}
              onCancel={() =>
                setModalConfig({ ...modalConfig, visible: false })
              }
              width={680}
              centered
            >
              <div style={{ padding: "8px 0" }}>
                {modalConfig.type === "exam" ? (
                  <Table
                    columns={examColumns}
                    dataSource={modalConfig.data}
                    rowKey="full_name"
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                ) : modalConfig.type === "document" ? (
                  <Table
                    columns={docColumns}
                    dataSource={modalConfig.data}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                  />
                ) : Array.isArray(modalConfig.data) &&
                  modalConfig.data.length > 0 &&
                  modalConfig.data[0].key ? (
                  <Table
                    columns={[
                      { title: "Chỉ số", dataIndex: "key", key: "key" },
                      {
                        title: "Giá trị",
                        dataIndex: "value",
                        key: "value",
                        render: (v) => <Tag color="gold">{v}</Tag>,
                      },
                    ]}
                    dataSource={modalConfig.data}
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Table
                    dataSource={modalConfig.data}
                    rowKey={(r) => r.id || r.name || Math.random()}
                    pagination={{ pageSize: 5 }}
                    size="small"
                    columns={[
                      {
                        title: "Tên / Tiêu đề",
                        dataIndex: "name",
                        render: (text, record) =>
                          text || record.title || "Chi tiết",
                      },
                      {
                        title: "Loại / Danh mục",
                        dataIndex: "type",
                        render: (text, record) => (
                          <Tag color="blue">
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
                )}
              </div>
            </Modal>
          </>
        )}

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

          .report-dashboard-root {
            padding: 24px;
            background: ${softBg};
            min-height: 100vh;
            font-family: 'Be Vietnam Pro', sans-serif;
            color: ${textDark};
          }

          .report-top-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
          }

          .badge-sacred {
            background: rgba(212, 175, 55, 0.15);
            border: 1px solid ${accentGold};
            color: ${primaryNavy};
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 6px;
          }

          .report-main-title {
            font-family: 'Playfair Display', Georgia, serif !important;
            color: ${primaryNavy} !important;
            margin: 0 !important;
            font-weight: 700 !important;
          }

          /* KPI Cards */
          .kpi-card {
            background: #FFFFFF !important;
            border-radius: 16px !important;
            padding: 12px 14px !important;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.03) !important;
            transition: all 0.3s ease !important;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .clickable-card {
            cursor: pointer;
          }

          .clickable-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
          }

          .gold-line { border-left: 4px solid ${accentGold} !important; }
          .navy-line { border-left: 4px solid ${primaryNavy} !important; }
          .blue-line { border-left: 4px solid #3B82F6 !important; }
          .green-line { border-left: 4px solid #10B981 !important; }
          .purple-line { border-left: 4px solid #8B5CF6 !important; }

          .kpi-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            letter-spacing: 0.5px;
          }

          .card-footer-action {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed #F1F5F9;
          }

          .action-text {
            font-size: 11px;
            color: ${accentGold};
            font-weight: 600;
          }

          /* Section Filter Bar */
          .section-filter-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #F1F5F9;
            padding: 8px 14px;
            border-radius: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 10px;
          }

          /* Chart Cards */
          .report-box-card {
            border-radius: 16px !important;
            background: #FFFFFF !important;
            border: 1px solid #E2E8F0 !important;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
            padding: 8px;
          }

          .editorial-main-tabs .ant-tabs-nav {
            margin-bottom: 16px !important;
          }

          .clean-table .ant-table-thead > tr > th {
            background: #F8FAFC !important;
            color: ${primaryNavy} !important;
            font-weight: 700;
            font-size: 12px;
          }

          .loading-center-box {
            text-align: center;
            padding: 100px 0;
          }

          @media (max-width: 768px) {
            .report-dashboard-root { padding: 14px; }
            .section-filter-bar { flex-direction: column; align-items: flex-start; }
          }
        `,
          }}
        />
      </div>
    </ConfigProvider>
  );
};

export default ReportDashboard;
