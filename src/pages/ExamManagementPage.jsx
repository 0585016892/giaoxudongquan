import React, { useEffect, useState, useMemo, useRef } from "react";
import { io } from "socket.io-client";
import {
  Layout,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Row,
  Col,
  Statistic,
  Descriptions,
  Popconfirm,
  message,
  Tooltip,
  ConfigProvider,
  Typography,
} from "antd";

import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  CompassOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

// Import API
import { getExamResults, deleteExamResult } from "../api/examResultApi";

const { Content } = Layout;
const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

// Màu sắc chủ đạo (Đồng bộ với ExamPrayerPage)
const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// Helper parse thông tin chi tiết bài làm
const getParsedDetails = (record) => {
  if (!record) return [];

  if (Array.isArray(record.details)) {
    return record.details;
  }

  const rawContent = record.details || record.user_content;
  if (typeof rawContent === "string") {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Chuỗi bình thường
    }
  }

  return [];
};

const ExamManagementPage = () => {
  const socketRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Bộ lọc & Tìm kiếm
  const [searchText, setSearchText] = useState("");
  const [selectedSession, setSelectedSession] = useState("ALL");

  // Modal Chi tiết
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Thí sinh đang làm bài
  const [activeStudents, setActiveStudents] = useState([]);

  // Socket setup
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🟢 ADMIN SOCKET CONNECTED:", socket.id);
    });

    socket.on("students_doing_exam", (students) => {
      setActiveStudents(Array.isArray(students) ? students : []);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔴 ADMIN SOCKET DISCONNECTED:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ ADMIN SOCKET ERROR:", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("students_doing_exam");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await getExamResults();
      const list = res?.data?.data || res?.data || res || [];

      if (Array.isArray(list)) {
        setData(list);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách kết quả:", error);
      message.error(
        error?.response?.data?.message ||
          "Không thể tải danh sách kết quả kiểm tra",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExamResult(id);
      message.success("Xóa kết quả thành công!");
      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi xóa kết quả:", error);
      message.error(error?.response?.data?.message || "Xóa thất bại!");
    }
  };

  const sessionOptions = useMemo(() => {
    const sessions = Array.from(
      new Set(data.map((item) => item.exam_session || item.exam_session_name)),
    ).filter(Boolean);

    return [
      { value: "ALL", label: "Tất cả các đợt" },
      ...sessions.map((s) => ({ value: s, label: `Đợt: ${s}` })),
    ];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const session = item.exam_session || item.exam_session_name || "";
      const matchesSession =
        selectedSession === "ALL" || session === selectedSession;

      const name = (item.full_name || "").toLowerCase();
      const className = (item.class_name || "").toLowerCase();
      const parish = (item.parish || "").toLowerCase();
      const query = searchText.toLowerCase().trim();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        className.includes(query) ||
        parish.includes(query);

      return matchesSession && matchesSearch;
    });
  }, [data, selectedSession, searchText]);

  const stats = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) return { total: 0, passed: 0, failed: 0, avgScore: 0 };

    let passed = 0;
    let sumScore = 0;

    filteredData.forEach((item) => {
      if (item.score >= 50) passed++;
      sumScore += item.score || 0;
    });

    return {
      total,
      passed,
      failed: total - passed,
      avgScore: Math.round(sumScore / total),
    };
  }, [filteredData]);

  // Cấu hình Cột Bảng
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Thí sinh",
      key: "full_name",
      render: (record) => (
        <Space direction="vertical" size={2}>
          <Text strong style={{ color: primaryNavy, fontSize: 15 }}>
            {record.full_name}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.class_name ? `Lớp: ${record.class_name}` : ""}{" "}
            {record.parish ? `• Giáo xứ: ${record.parish}` : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đợt kiểm tra",
      dataIndex: "exam_session",
      key: "exam_session",
      render: (text, record) => (
        <Tag className="gold-session-tag">
          <BookOutlined style={{ marginRight: 4 }} />
          {text || record.exam_session_name || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Số bài kinh",
      key: "p_count",
      align: "center",
      render: (record) => {
        const detailsList = getParsedDetails(record);
        return <Tag className="count-pill-tag">{detailsList.length} bài</Tag>;
      },
    },
    {
      title: "Điểm TB",
      dataIndex: "score",
      key: "score",
      align: "center",
      sorter: (a, b) => a.score - b.score,
      render: (score) => {
        const isPass = score >= 50;
        return (
          <span
            className={`score-badge ${isPass ? "score-pass" : "score-fail"}`}
          >
            {score} / 100
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (record) =>
        record.score >= 50 ? (
          <Tag color="success" className="status-pill">
            <CheckCircleOutlined /> Đạt
          </Tag>
        ) : (
          <Tag color="error" className="status-pill">
            <CloseCircleOutlined /> Chưa đạt
          </Tag>
        ),
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submitted_at",
      key: "submitted_at",
      sorter: (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at),
      render: (date) => (
        <Text style={{ fontSize: 13, color: "#64748b" }}>
          {date ? dayjs(date).format("HH:mm — DD/MM/YYYY") : "—"}
        </Text>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      width: 110,
      render: (record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết bài làm">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => {
                setSelectedDetail(record);
                setIsModalOpen(true);
              }}
              className="action-btn-view"
            />
          </Tooltip>

          <Popconfirm
            title="Xóa kết quả này?"
            description="Bạn có chắc chắn muốn xóa dữ liệu bài làm này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
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
          borderRadius: 14,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <Layout className="admin-exam-layout">
        <Content className="admin-exam-wrapper">
          <div className="admin-exam-container">
            {/* HEADER */}
            <div className="admin-header-section">
              <div className="header-text-group">
                <span className="sacred-badge">
                  <CompassOutlined /> HỆ THỐNG PHÂN TÍCH & BÁO CÁO
                </span>
                <Title level={2} className="admin-main-title">
                  QUẢN LÝ KẾT QUẢ KHẢO KINH
                </Title>
                <Paragraph className="admin-sub-title">
                  Theo dõi kết quả thi trực tuyến, danh sách bài làm và số liệu
                  thống kê tổng quan.
                </Paragraph>
              </div>

              <div className="header-action-group">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchResults}
                  loading={loading}
                  className="refresh-btn"
                >
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>

            {/* HỘP BÁO CÁO LIVE THÍ SÍNH ĐANG LÀM BÀI */}
            <Card className="live-status-card" bordered={false}>
              <div className="live-card-header">
                <div className="live-indicator">
                  <span className="pulse-dot"></span>
                  <Title level={4} style={{ margin: 0, color: primaryNavy }}>
                    Thí sinh đang bài trực tuyến ({activeStudents.length})
                  </Title>
                </div>
                {activeStudents.length > 0 && (
                  <Tag className="live-count-tag">
                    {activeStudents.length} đang làm bài
                  </Tag>
                )}
              </div>

              {activeStudents.length > 0 ? (
                <Row gutter={[16, 16]} style={{ marginTop: 14 }}>
                  {activeStudents.map((student) => (
                    <Col xs={24} sm={12} md={8} key={student.examCode}>
                      <div className="active-student-chip">
                        <div className="chip-avatar">
                          <UserOutlined />
                        </div>
                        <div className="chip-info">
                          <Text strong className="student-name">
                            {student.fullName}
                          </Text>
                          <Text type="secondary" className="student-sub">
                            {student.className || "Lớp: —"} |{" "}
                            {student.parish || "GX: —"}
                          </Text>
                          <div className="chip-tags">
                            <Tag className="session-mini-tag">
                              {student.examSession || "Chưa rõ đợt"}
                            </Tag>
                            <span className="code-mini-tag">
                              #{student.examCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="empty-live-box">
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  Hiện tại không có học viên nào đang mở đề làm bài.
                </div>
              )}
            </Card>

            {/* CARDS THỐNG KÊ KẾT QUẢ */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title="Tổng Lượt Nộp"
                    value={stats.total}
                    prefix={<FileTextOutlined className="stat-icon navy" />}
                    valueStyle={{
                      color: primaryNavy,
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={12} sm={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title="Điểm Trung Bình"
                    value={stats.avgScore}
                    suffix="/ 100"
                    prefix={<PercentageOutlined className="stat-icon gold" />}
                    valueStyle={{
                      color: accentGold,
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={12} sm={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title="Số Lượng Đạt"
                    value={stats.passed}
                    prefix={<CheckOutlined className="stat-icon green" />}
                    valueStyle={{
                      color: "#2e7d32",
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>

              <Col xs={12} sm={6}>
                <Card bordered={false} className="stat-card">
                  <Statistic
                    title="Chưa Đạt"
                    value={stats.failed}
                    prefix={<CloseOutlined className="stat-icon red" />}
                    valueStyle={{
                      color: "#c62828",
                      fontWeight: 700,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* BẢNG DỮ LIỆU CHÍNH */}
            <Card bordered={false} className="main-table-card">
              {/* TOOLBAR */}
              <Row
                gutter={[16, 16]}
                style={{ marginBottom: 20 }}
                justify="space-between"
                align="middle"
              >
                <Col xs={24} sm={12} md={10}>
                  <Search
                    placeholder="Tìm theo tên thí sinh, lớp, giáo xứ..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="custom-search-input"
                  />
                </Col>

                <Col xs={24} sm={12} md={8}>
                  <Select
                    style={{ width: "100%" }}
                    value={selectedSession}
                    onChange={setSelectedSession}
                    options={sessionOptions}
                    className="custom-select-box"
                  />
                </Col>
              </Row>

              {/* TABLE */}
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  style: { marginTop: 20 },
                }}
                scroll={{ x: 800 }}
                className="custom-admin-table"
              />
            </Card>

            {/* MODAL CHI TIẾT BÀI LÀM */}
            <Modal
              title={
                <div className="modal-custom-title">
                  <FileTextOutlined style={{ color: accentGold }} />
                  <span>Chi Tiết Bài Làm — {selectedDetail?.full_name}</span>
                </div>
              }
              open={isModalOpen}
              onCancel={() => setIsModalOpen(false)}
              footer={[
                <Button
                  key="close"
                  type="primary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ backgroundColor: primaryNavy, borderRadius: 8 }}
                >
                  Đóng
                </Button>,
              ]}
              width={820}
              centered
            >
              {selectedDetail &&
                (() => {
                  const parsedDetails = getParsedDetails(selectedDetail);

                  return (
                    <div style={{ paddingTop: 8 }}>
                      <Descriptions
                        bordered
                        size="small"
                        column={{ xs: 1, sm: 2 }}
                        className="custom-modal-desc"
                      >
                        <Descriptions.Item label="Thí sinh">
                          <strong style={{ color: primaryNavy }}>
                            {selectedDetail.full_name}
                          </strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="Đợt kiểm tra">
                          <Tag className="gold-session-tag">
                            {selectedDetail.exam_session ||
                              selectedDetail.exam_session_name}
                          </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Lớp Giáo lý">
                          {selectedDetail.class_name || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Giáo xứ">
                          {selectedDetail.parish || "—"}
                        </Descriptions.Item>

                        <Descriptions.Item label="Mã tra cứu">
                          <Text copyable style={{ fontWeight: 600 }}>
                            {selectedDetail.exam_code || "—"}
                          </Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Điểm đợt">
                          <Tag
                            color={selectedDetail.score >= 50 ? "green" : "red"}
                            style={{ fontWeight: "bold" }}
                          >
                            {selectedDetail.score} / 100
                          </Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian nộp" span={2}>
                          {dayjs(selectedDetail.submitted_at).format(
                            "HH:mm:ss — DD/MM/YYYY",
                          )}
                        </Descriptions.Item>

                        {selectedDetail.feedback && (
                          <Descriptions.Item label="Đánh giá chung" span={2}>
                            {selectedDetail.feedback}
                          </Descriptions.Item>
                        )}
                      </Descriptions>

                      <Title
                        level={5}
                        style={{
                          marginTop: 24,
                          marginBottom: 12,
                          color: primaryNavy,
                          fontFamily: "'Playfair Display', serif",
                        }}
                      >
                        Nội Dung Các Bài Kinh ({parsedDetails.length} bài)
                      </Title>

                      <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size={16}
                      >
                        {parsedDetails.length > 0 ? (
                          parsedDetails.map((item, idx) => (
                            <Card
                              key={idx}
                              size="small"
                              bordered={false}
                              className="modal-prayer-card"
                              title={
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text strong style={{ color: primaryNavy }}>
                                    {idx + 1}. {item.prayerTitle}
                                  </Text>
                                  <Tag
                                    color={item.score >= 50 ? "green" : "red"}
                                  >
                                    Điểm: {item.score} / 100
                                  </Tag>
                                </div>
                              }
                            >
                              <div className="prayer-text-box">
                                {item.userContent || (
                                  <span
                                    style={{ color: "#94a3b8", italic: true }}
                                  >
                                    (Thí sinh bỏ trống bài kinh này)
                                  </span>
                                )}
                              </div>
                            </Card>
                          ))
                        ) : (
                          <div className="prayer-text-box">
                            {typeof selectedDetail.user_content === "string" &&
                            !selectedDetail.user_content.startsWith("[")
                              ? selectedDetail.user_content
                              : "Không tìm thấy chi tiết bài làm."}
                          </div>
                        )}
                      </Space>
                    </div>
                  );
                })()}
            </Modal>
          </div>
        </Content>

        {/* CSS SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .admin-exam-layout {
              background: ${softBg};
              min-height: 100vh;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .admin-exam-wrapper {
              padding: 40px 20px 80px 20px;
            }

            .admin-exam-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .admin-header-section {
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

            .admin-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .admin-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 40px;
            }

            /* Live Active Card */
            .live-status-card {
              border-radius: 18px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 25px rgba(27, 54, 93, 0.04) !important;
              margin-bottom: 24px;
              padding: 6px;
            }

            .live-card-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .live-indicator {
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .pulse-dot {
              width: 10px;
              height: 10px;
              background-color: #22c55e;
              border-radius: 50%;
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
              animation: pulse-green 1.8s infinite;
            }

            @keyframes pulse-green {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
              70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
            }

            .live-count-tag {
              background: #f0fdf4 !important;
              color: #166534 !important;
              border-color: #bbf7d0 !important;
              border-radius: 20px;
              font-weight: 600;
              padding: 2px 12px;
            }

            .active-student-chip {
              display: flex;
              align-items: center;
              gap: 12px;
              background: ${softBg};
              padding: 10px 14px;
              border-radius: 12px;
              border: 1px solid rgba(27, 54, 93, 0.08);
            }

            .chip-avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: rgba(27, 54, 93, 0.1);
              color: ${primaryNavy};
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
            }

            .student-name {
              color: ${primaryNavy};
              font-size: 14px;
              display: block;
            }

            .student-sub {
              font-size: 12px;
              display: block;
            }

            .chip-tags {
              display: flex;
              gap: 6px;
              align-items: center;
              margin-top: 4px;
            }

            .session-mini-tag {
              font-size: 10px !important;
              border-radius: 6px;
              margin: 0;
            }

            .code-mini-tag {
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
            }

            .empty-live-box {
              color: #94a3b8;
              font-size: 13px;
              margin-top: 8px;
            }

            /* Statistics Cards */
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
            .stat-icon.red { color: #c62828; }

            /* Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-search-input .ant-input {
              border-radius: 10px 0 0 10px !important;
            }

            .custom-search-input .ant-btn {
              border-radius: 0 10px 10px 0 !important;
              background: ${primaryNavy} !important;
            }

            .custom-select-box .ant-select-selector {
              border-radius: 10px !important;
            }

            /* Table Customization */
            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-session-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 10px;
              font-weight: 600;
            }

            .count-pill-tag {
              border-radius: 12px;
              background: rgba(27, 54, 93, 0.06);
              color: ${primaryNavy};
              border: none;
              font-weight: 600;
            }

            .score-badge {
              font-weight: 700;
              font-size: 13px;
              padding: 4px 10px;
              border-radius: 20px;
              display: inline-block;
            }

            .score-pass {
              background: #f6ffed;
              color: #276749;
              border: 1px solid #b7eb8f;
            }

            .score-fail {
              background: #fff5f5;
              color: #9b2c2c;
              border: 1px solid #feb2b2;
            }

            .status-pill {
              border-radius: 12px;
              font-weight: 600;
            }

            .action-btn-view:hover {
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

            .custom-modal-desc {
              border-radius: 12px;
              overflow: hidden;
            }

            .modal-prayer-card {
              border-radius: 12px !important;
              border: 1px solid rgba(27, 54, 93, 0.1) !important;
              background: #ffffff !important;
            }

            .prayer-text-box {
              background: ${softBg};
              padding: 12px 14px;
              border-radius: 8px;
              border-left: 3px solid ${accentGold};
              font-size: 14px;
              line-height: 1.7;
              white-space: pre-wrap;
              color: ${textDark};
            }
          `,
          }}
        />
      </Layout>
    </ConfigProvider>
  );
};

export default ExamManagementPage;
