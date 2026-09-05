import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  Button,
  Tag,
  Avatar,
  Segmented,
  Flex,
  Badge,
  Tooltip,
  Spin,
  Empty,
  message,
  ConfigProvider,
} from "antd";

import {
  PlusOutlined,
  QuestionOutlined,
  SendOutlined,
  RiseOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Cell,
} from "recharts";

import { Gamepad2, Sparkles, Heart, Trophy } from "lucide-react";

import { getDashboardCate } from "../../api/dashboardApi";
import dailyVerseApi from "../../api/dailyVerseApi";

import dash1 from "../../assets/images/dash1.png";
import dash2 from "../../assets/images/dash2.png";
import dash3 from "../../assets/images/dash3.png";
import dash4 from "../../assets/images/dash4.png";

const { Title, Text, Paragraph } = Typography;

// =====================================================
// CONSTANTS
// =====================================================

const IMAGE_ASSETS = {
  students: dash1,
  classes: dash2,
  lessons: dash3,
  achievements: dash4,
};

// =====================================================
// CUSTOM CHART TOOLTIP
// =====================================================

const ClassChartTooltip = ({ active, payload, label, mode }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0]?.payload;

  if (!data) {
    return null;
  }

  return (
    <div
      style={{
        minWidth: 220,
        padding: 14,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #FBCFE8",
        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
      }}
    >
      <Text
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 800,
          color: "#374151",
          marginBottom: 4,
        }}
      >
        📚 {label}
      </Text>

      {data.code && (
        <Text
          style={{
            display: "block",
            fontSize: 11,
            color: "#9CA3AF",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          {data.code}
        </Text>
      )}

      <div
        style={{
          padding: "8px 10px",
          borderRadius: 10,
          background: "#FFF7F9",
          marginBottom: 8,
        }}
      >
        <Flex justify="space-between">
          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: 600,
            }}
          >
            {mode}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: "#FF6B8B",
              fontWeight: 800,
            }}
          >
            {Number(data.value || 0)} học sinh
          </Text>
        </Flex>
      </div>

      <Flex vertical gap={5}>
        <Flex justify="space-between">
          <Text
            style={{
              fontSize: 11,
              color: "#6B7280",
            }}
          >
            👨 Nam
          </Text>

          <Text
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#2563EB",
            }}
          >
            {data.male}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Text
            style={{
              fontSize: 11,
              color: "#6B7280",
            }}
          >
            👩 Nữ
          </Text>

          <Text
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#DB2777",
            }}
          >
            {data.female}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Text
            style={{
              fontSize: 11,
              color: "#6B7280",
            }}
          >
            ✨ Học sinh mới
          </Text>

          <Text
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#9333EA",
            }}
          >
            {data.newStudents}
          </Text>
        </Flex>
      </Flex>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CatechistDashboard() {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [timeRange, setTimeRange] = useState("Tuần");

  const [dailyVerse, setDailyVerse] = useState(null);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [classChartMode, setClassChartMode] = useState("Tổng");

  // ===================================================
  // FETCH DASHBOARD
  // ===================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await getDashboardCate();

      const data = response?.data?.data || response?.data || response || null;

      if (!data) {
        throw new Error("Không có dữ liệu dashboard");
      }

      setDashboard(data);
    } catch (err) {
      console.error("❌ GET DASHBOARD ERROR:", err);

      setError(true);

      message.error(
        err?.response?.data?.message || "Không thể tải dữ liệu dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // FETCH DAILY VERSE
  // ===================================================

  const fetchDailyVerse = async () => {
    try {
      const response = await dailyVerseApi.getRandom();

      if (response?.data?.success) {
        setDailyVerse(response.data.data);
      }
    } catch (err) {
      console.error("❌ GET DAILY VERSE ERROR:", err);
    }
  };

  // ===================================================
  // EFFECTS
  // ===================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  // ===================================================
  // SAFE DASHBOARD DATA
  // ===================================================

  const metrics = dashboard?.top_metrics || {};

  const totalStudents = Number(metrics?.total_students?.value ?? 0);

  const studentCompare = Number(
    metrics?.total_students?.compare_last_month_pct ?? 0,
  );

  const totalClasses = Number(metrics?.classes?.total ?? 0);

  const activeClasses = Number(metrics?.classes?.active ?? 0);

  const totalLessons = Number(metrics?.lessons?.total ?? 0);

  const newLessons = Number(metrics?.lessons?.new_this_month ?? 0);

  const completionRate = Number(metrics?.completion_rate?.value_pct ?? 0);

  const completionCompare = Number(
    metrics?.completion_rate?.compare_last_month_pct ?? 0,
  );

  // ===================================================
  // WEEKLY DATA
  // ===================================================

  const weeklyProgress = Array.isArray(dashboard?.weekly_progress?.chart_data)
    ? dashboard.weekly_progress.chart_data
    : [];

  // ===================================================
  // QUIZ DATA
  // ===================================================

  const quizMetrics = dashboard?.quiz_metrics || {};

  const correctPct = Number(quizMetrics?.correct_pct ?? 0);

  const wrongPct = Number(quizMetrics?.wrong_pct ?? 0);

  const uncompletedPct = Number(quizMetrics?.uncompleted_pct ?? 0);

  // ===================================================
  // STUDENT STATISTICS
  // ===================================================

  const studentStatistics = dashboard?.student_statistics || {};

  const studentOverview = studentStatistics?.overview || {};
  const classStatistics = useMemo(
    () =>
      Array.isArray(studentStatistics?.classes)
        ? studentStatistics.classes
        : [],
    [studentStatistics?.classes],
  );

  // ===================================================
  // STUDENT OVERVIEW
  // ===================================================

  const overviewTotalStudents = Number(
    studentOverview?.total_students ?? totalStudents,
  );

  const overviewTotalClasses = Number(
    studentOverview?.total_classes ?? totalClasses,
  );

  // ===================================================
  // ATTENDANCE
  // ===================================================

  const attendanceToday = studentOverview?.attendance_today || {};

  const attendancePresent = Number(attendanceToday?.present ?? 0);

  const attendanceAbsent = Number(attendanceToday?.absent ?? 0);

  const attendanceLate = Number(attendanceToday?.late ?? 0);

  const attendanceRate = Number(attendanceToday?.attendance_rate_pct ?? 0);

  // ===================================================
  // NORMALIZE CLASS DATA
  //
  // Hỗ trợ cả:
  //
  // students.total
  // students.male
  // students.female
  //
  // và:
  //
  // total_students
  // male_students
  // female_students
  // ===================================================

  const normalizedClassStatistics = useMemo(() => {
    return classStatistics
      .map((item) => {
        const total = Number(
          item?.students?.total ?? item?.total_students ?? 0,
        );

        const male = Number(item?.students?.male ?? item?.male_students ?? 0);

        const female = Number(
          item?.students?.female ?? item?.female_students ?? 0,
        );

        const newStudents = Number(
          item?.students?.new_this_month ?? item?.new_students_this_month ?? 0,
        );

        return {
          id: item?.class_id,

          name: item?.class_name || item?.name || `Lớp ${item?.class_id ?? ""}`,

          code: item?.class_code || "",

          category: item?.category || "",

          status: item?.class_status || item?.status || "active",

          total,
          male,
          female,
          newStudents,

          attendancePresent: Number(
            item?.attendance_today?.present ?? item?.present_today ?? 0,
          ),

          attendanceAbsent: Number(
            item?.attendance_today?.absent ?? item?.absent_today ?? 0,
          ),

          attendanceLate: Number(item?.attendance_today?.late ?? 0),

          attendanceExcused: Number(item?.attendance_today?.excused ?? 0),

          attendanceNotCheckedIn: Number(
            item?.attendance_today?.not_checked_in ?? 0,
          ),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [classStatistics]);

  // ===================================================
  // CHART DATA
  // ===================================================

  const visibleClassChartData = useMemo(() => {
    return normalizedClassStatistics.map((item) => {
      let value = item.total;

      if (classChartMode === "Nam") {
        value = item.male;
      }

      if (classChartMode === "Nữ") {
        value = item.female;
      }

      if (classChartMode === "Học sinh mới") {
        value = item.newStudents;
      }

      return {
        ...item,
        value,
      };
    });
  }, [normalizedClassStatistics, classChartMode]);

  // ===================================================
  // LARGEST CLASS
  // ===================================================

  const largestClass = normalizedClassStatistics[0] || null;

  // ===================================================
  // CLASS SUMMARY
  // ===================================================

  const totalStudentsFromClasses = useMemo(() => {
    return normalizedClassStatistics.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );
  }, [normalizedClassStatistics]);

  const averageClassSize =
    normalizedClassStatistics.length > 0
      ? Math.round(totalStudentsFromClasses / normalizedClassStatistics.length)
      : 0;

  const classesWithStudents = normalizedClassStatistics.filter(
    (item) => item.total > 0,
  ).length;

  // ===================================================
  // COMMON CARD STYLE
  // ===================================================

  const chibiCardStyle = {
    borderRadius: 24,
    border: "2px solid #FFF0F5",
    boxShadow: "0 10px 25px rgba(255, 107, 139, 0.06)",
    background: "#FFFFFF",
    overflow: "hidden",
    transition: "all 0.3s ease",
  };

  // ===================================================
  // LOADING
  //
  // QUAN TRỌNG:
  // Tất cả HOOK đã nằm phía trên.
  // ===================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
          borderRadius: 24,
          padding: 24,
        }}
      >
        <Flex vertical align="center" gap={16}>
          <Spin size="large" />

          <Text
            style={{
              fontWeight: 700,
              color: "#FF6B8B",
            }}
          >
            Đang tải dữ liệu... ✨
          </Text>
        </Flex>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error || !dashboard) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Card
          bordered={false}
          style={{
            ...chibiCardStyle,
            maxWidth: 450,
            width: "100%",
            textAlign: "center",
          }}
          bodyStyle={{
            padding: 30,
          }}
        >
          <Empty
            description={
              <Text
                style={{
                  fontWeight: 700,
                }}
              >
                Không thể tải dữ liệu dashboard
              </Text>
            }
          />

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchDashboard}
            style={{
              marginTop: 16,
              borderRadius: 16,
              height: 42,
              padding: "0 22px",
              background: "linear-gradient(135deg, #FF6B8B 0%, #FF85A1 100%)",
              border: "none",
              fontWeight: 800,
            }}
          >
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
          borderRadius: 20,
        },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: 4,
        }}
      >
        {/* =================================================
            TOP METRICS
        ================================================= */}
        <Row gutter={[20, 20]}>
          {/* =========================================================
      1. TỔNG HỌC SINH
  ========================================================= */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFF1F5 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex vertical gap={14}>
                <Flex justify="space-between" align="flex-start">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: "#FFE4E6",
                      border: "2px solid #FECDD3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={IMAGE_ASSETS.students}
                      alt="students"
                      style={{
                        width: 42,
                        height: 42,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <Tag
                    style={{
                      margin: 0,
                      border: "none",
                      borderRadius: 10,
                      background: "#DCFCE7",
                      color: "#15803D",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                    }}
                  >
                    <RiseOutlined /> +{studentCompare}%
                  </Tag>
                </Flex>

                <div>
                  <Text
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#881337",
                      marginBottom: 2,
                    }}
                  >
                    Tổng học sinh
                  </Text>

                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#FF6B8B",
                      fontWeight: 800,
                      fontSize: 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {totalStudents}
                  </Title>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    học sinh đang quản lý
                  </Text>
                </div>
              </Flex>
            </Card>
          </Col>

          {/* =========================================================
      2. LỚP PHỤ TRÁCH
  ========================================================= */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex vertical gap={14}>
                <Flex justify="space-between" align="flex-start">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: "#D1FAE5",
                      border: "2px solid #A7F3D0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={IMAGE_ASSETS.classes}
                      alt="classes"
                      style={{
                        width: 42,
                        height: 42,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <Tag
                    style={{
                      margin: 0,
                      border: "none",
                      borderRadius: 10,
                      background: "#D1FAE5",
                      color: "#047857",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                    }}
                  >
                    Đang hoạt động
                  </Tag>
                </Flex>

                <div>
                  <Text
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#065F46",
                      marginBottom: 2,
                    }}
                  >
                    Lớp phụ trách
                  </Text>

                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#10B981",
                      fontWeight: 800,
                      fontSize: 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {totalClasses}
                  </Title>

                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        color: "#059669",
                        fontWeight: 800,
                      }}
                    >
                      {activeClasses}
                    </span>{" "}
                    lớp đang hoạt động
                  </Text>
                </div>
              </Flex>
            </Card>
          </Col>

          {/* =========================================================
      3. BÀI HỌC
  ========================================================= */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                background: "linear-gradient(135deg, #FFFFFF 0%, #F3E8FF 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex vertical gap={14}>
                <Flex justify="space-between" align="flex-start">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: "#E9D5FF",
                      border: "2px solid #DDD6FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={IMAGE_ASSETS.lessons}
                      alt="lessons"
                      style={{
                        width: 42,
                        height: 42,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <Tag
                    style={{
                      margin: 0,
                      border: "none",
                      borderRadius: 10,
                      background: "#F3E8FF",
                      color: "#7E22CE",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                    }}
                  >
                    Bài học
                  </Tag>
                </Flex>

                <div>
                  <Text
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#581C87",
                      marginBottom: 2,
                    }}
                  >
                    Bài học đã soạn
                  </Text>

                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#9333EA",
                      fontWeight: 800,
                      fontSize: 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {totalLessons}
                  </Title>

                  <Text
                    style={{
                      fontSize: 11,
                      color: "#6B7280",
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        color: "#7E22CE",
                        fontWeight: 800,
                      }}
                    >
                      +{newLessons}
                    </span>{" "}
                    bài mới tháng này
                  </Text>
                </div>
              </Flex>
            </Card>
          </Col>

          {/* =========================================================
      4. TỶ LỆ HOÀN THÀNH
  ========================================================= */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
                background: "linear-gradient(135deg, #FFFFFF 0%, #FEF3C7 100%)",
              }}
              bodyStyle={{ padding: 20 }}
            >
              <Flex vertical gap={14}>
                <Flex justify="space-between" align="flex-start">
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      background: "#FDE68A",
                      border: "2px solid #FCD34D",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={IMAGE_ASSETS.achievements}
                      alt="completion"
                      style={{
                        width: 42,
                        height: 42,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <Tag
                    style={{
                      margin: 0,
                      border: "none",
                      borderRadius: 10,
                      background: "#FEF3C7",
                      color: "#B45309",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                    }}
                  >
                    Tiến độ
                  </Tag>
                </Flex>

                <div>
                  <Text
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#78350F",
                      marginBottom: 2,
                    }}
                  >
                    Tỷ lệ hoàn thành
                  </Text>

                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#D97706",
                      fontWeight: 800,
                      fontSize: 30,
                      lineHeight: 1.2,
                    }}
                  >
                    {completionRate}%
                  </Title>

                  <Flex align="center" gap={5}>
                    <RiseOutlined
                      style={{
                        color: "#D97706",
                        fontSize: 12,
                      }}
                    />

                    <Text
                      style={{
                        fontSize: 11,
                        color: "#92400E",
                        fontWeight: 700,
                      }}
                    >
                      +{completionCompare}% so với trước
                    </Text>
                  </Flex>
                </div>
              </Flex>
            </Card>
          </Col>

          {/* =========================================================
      5. ĐIỂM DANH HÔM NAY
  ========================================================= */}
          <Col xs={24}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%)",
              }}
              bodyStyle={{
                padding: 20,
              }}
            >
              <Row gutter={[24, 16]} align="middle">
                {/* TITLE */}
                <Col xs={24} md={7}>
                  <Flex align="center" gap={14}>
                    <Avatar
                      size={54}
                      style={{
                        background: "#D1FAE5",
                        color: "#059669",
                        fontSize: 24,
                        fontWeight: 800,
                      }}
                    >
                      ✓
                    </Avatar>

                    <div>
                      <Text
                        style={{
                          display: "block",
                          color: "#065F46",
                          fontSize: 15,
                          fontWeight: 800,
                        }}
                      >
                        Điểm danh hôm nay
                      </Text>

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Tình hình tham dự của học sinh
                      </Text>
                    </div>
                  </Flex>
                </Col>

                {/* PRESENT */}
                <Col xs={12} sm={6} md={4}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#F0FDF4",
                      border: "1px solid #DCFCE7",
                    }}
                  >
                    <Text
                      style={{
                        display: "block",
                        color: "#166534",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Có mặt
                    </Text>

                    <Flex align="baseline" gap={4}>
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: "#16A34A",
                          fontWeight: 800,
                        }}
                      >
                        {attendancePresent}
                      </Title>

                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        / {overviewTotalStudents}
                      </Text>
                    </Flex>
                  </div>
                </Col>

                {/* ABSENT */}
                <Col xs={12} sm={6} md={4}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#FEF2F2",
                      border: "1px solid #FEE2E2",
                    }}
                  >
                    <Text
                      style={{
                        display: "block",
                        color: "#991B1B",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Vắng
                    </Text>

                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: "#DC2626",
                        fontWeight: 800,
                      }}
                    >
                      {attendanceAbsent}
                    </Title>
                  </div>
                </Col>

                {/* LATE */}
                <Col xs={12} sm={6} md={4}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: 16,
                      background: "#FFF7ED",
                      border: "1px solid #FFEDD5",
                    }}
                  >
                    <Text
                      style={{
                        display: "block",
                        color: "#9A3412",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      Đi trễ
                    </Text>

                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: "#EA580C",
                        fontWeight: 800,
                      }}
                    >
                      {attendanceLate}
                    </Title>
                  </div>
                </Col>

                {/* PROGRESS */}
                <Col xs={24} sm={12} md={5}>
                  <div>
                    <Flex justify="space-between" align="center">
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontWeight: 700,
                        }}
                      >
                        Tỷ lệ có mặt
                      </Text>

                      <Text
                        style={{
                          color: "#059669",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {attendanceRate}%
                      </Text>
                    </Flex>

                    <Progress
                      percent={Math.min(100, Math.max(0, attendanceRate))}
                      size="small"
                      strokeColor="#10B981"
                      trailColor="#D1FAE5"
                      showInfo={false}
                      style={{
                        margin: "7px 0 0",
                      }}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* =================================================
            STUDENT OVERVIEW
        ================================================= */}

        {/* =================================================
            CLASS CHART
        ================================================= */}

        <Card
          bordered={false}
          style={chibiCardStyle}
          bodyStyle={{
            padding: 0,
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            <Flex justify="space-between" align="center" gap={16} wrap>
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    background:
                      "linear-gradient(135deg, #FFE4E6 0%, #FCE7F3 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TeamOutlined
                    style={{
                      fontSize: 21,
                      color: "#FF6B8B",
                    }}
                  />
                </div>

                <div>
                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#881337",
                    }}
                  >
                    Thống kê học sinh theo lớp
                  </Title>

                  <Text
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      fontWeight: 600,
                    }}
                  >
                    Phân bố học sinh của từng lớp
                  </Text>
                </div>
              </Flex>

              <Flex align="center" gap={8} wrap>
                <Segmented
                  value={classChartMode}
                  onChange={setClassChartMode}
                  options={["Tổng", "Nam", "Nữ", "Học sinh mới"]}
                  style={{
                    background: "#FFF0F5",
                    padding: 4,
                    borderRadius: 14,
                    fontWeight: 700,
                  }}
                />

                <Tag
                  color="pink"
                  style={{
                    margin: 0,
                    borderRadius: 12,
                    fontWeight: 800,
                  }}
                >
                  {overviewTotalClasses} lớp
                </Tag>
              </Flex>
            </Flex>
          </div>

          {/* SUMMARY */}

          <div
            style={{
              padding: "18px 24px 0",
            }}
          >
            <Row gutter={[12, 12]}>
              {/* TOTAL */}

              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#FFF7F9",
                    border: "1px solid #FCE7F3",
                  }}
                >
                  <Flex align="center" gap={10}>
                    <Avatar
                      size={38}
                      style={{
                        background: "#FFE4E6",
                        color: "#FF6B8B",
                      }}
                    >
                      <TeamOutlined />
                    </Avatar>

                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        Tổng học sinh
                      </Text>

                      <Text
                        style={{
                          fontSize: 20,
                          color: "#FF6B8B",
                          fontWeight: 800,
                        }}
                      >
                        {overviewTotalStudents}
                      </Text>
                    </div>
                  </Flex>
                </div>
              </Col>

              {/* AVERAGE */}

              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#F5F9FF",
                    border: "1px solid #DBEAFE",
                  }}
                >
                  <Flex align="center" gap={10}>
                    <Avatar
                      size={38}
                      style={{
                        background: "#DBEAFE",
                        color: "#2563EB",
                      }}
                    >
                      <UserOutlined />
                    </Avatar>

                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        Bình quân / lớp
                      </Text>

                      <Text
                        style={{
                          fontSize: 20,
                          color: "#2563EB",
                          fontWeight: 800,
                        }}
                      >
                        {averageClassSize}
                      </Text>
                    </div>
                  </Flex>
                </div>
              </Col>

              {/* ACTIVE CLASSES */}

              <Col xs={24} sm={8}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#F0FDF4",
                    border: "1px solid #DCFCE7",
                  }}
                >
                  <Flex align="center" gap={10}>
                    <Avatar
                      size={38}
                      style={{
                        background: "#DCFCE7",
                        color: "#10B981",
                      }}
                    >
                      <TrophyOutlined />
                    </Avatar>

                    <div>
                      <Text
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "#9CA3AF",
                          fontWeight: 700,
                        }}
                      >
                        Lớp có học sinh
                      </Text>

                      <Text
                        style={{
                          fontSize: 20,
                          color: "#10B981",
                          fontWeight: 800,
                        }}
                      >
                        {classesWithStudents}
                      </Text>
                    </div>
                  </Flex>
                </div>
              </Col>
            </Row>
          </div>

          {/* CHART */}

          {visibleClassChartData.length === 0 ? (
            <div
              style={{
                padding: 50,
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có dữ liệu lớp học"
              />
            </div>
          ) : (
            <div
              style={{
                padding: "24px 16px 30px 8px",
                width: "100%",
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  minWidth: visibleClassChartData.length > 7 ? 850 : "100%",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(430, visibleClassChartData.length * 60)}
                >
                  <BarChart
                    data={visibleClassChartData}
                    layout="vertical"
                    margin={{
                      top: 10,
                      right: 55,
                      left: 10,
                      bottom: 10,
                    }}
                    barCategoryGap="25%"
                  >
                    <CartesianGrid
                      strokeDasharray="4 4"
                      horizontal={false}
                      stroke="#E5E7EB"
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{
                        fontSize: 12,
                        fontWeight: 600,
                        fill: "#6B7280",
                      }}
                      axisLine={{
                        stroke: "#E5E7EB",
                      }}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={155}
                      tick={{
                        fontSize: 12,
                        fontWeight: 800,
                        fill: "#374151",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <RechartsTooltip
                      content={(props) => (
                        <ClassChartTooltip {...props} mode={classChartMode} />
                      )}
                      cursor={{
                        fill: "#FFF7F9",
                      }}
                    />

                    <Bar
                      dataKey="value"
                      name={classChartMode}
                      radius={[0, 10, 10, 0]}
                      barSize={25}
                      label={{
                        position: "right",
                        fill: "#374151",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {visibleClassChartData.map((item, index) => {
                        let fill = "#FF9DB3";

                        if (classChartMode === "Nam") {
                          fill = "#60A5FA";
                        }

                        if (classChartMode === "Nữ") {
                          fill = "#F472B6";
                        }

                        if (classChartMode === "Học sinh mới") {
                          fill = "#A78BFA";
                        }

                        if (classChartMode === "Tổng" && index === 0) {
                          fill = "#FF6B8B";
                        }

                        return <Cell key={`${item.id}-${index}`} fill={fill} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* LARGEST CLASS */}

          {largestClass && (
            <div
              style={{
                margin: "0 24px 24px",
                padding: "14px 16px",
                borderRadius: 16,
                background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
                border: "1px solid #FDE68A",
              }}
            >
              <Flex align="center" justify="space-between" gap={12} wrap>
                <Flex align="center" gap={10}>
                  <Avatar
                    size={38}
                    style={{
                      background: "#F59E0B",
                      color: "#FFFFFF",
                    }}
                  >
                    <TrophyOutlined />
                  </Avatar>

                  <div>
                    <Text
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "#92400E",
                        fontWeight: 700,
                      }}
                    >
                      Lớp đông học sinh nhất
                    </Text>

                    <Text
                      style={{
                        fontSize: 14,
                        color: "#78350F",
                        fontWeight: 800,
                      }}
                    >
                      {largestClass.name}
                    </Text>
                  </div>
                </Flex>

                <Text
                  style={{
                    fontSize: 20,
                    color: "#D97706",
                    fontWeight: 800,
                  }}
                >
                  {largestClass.total}{" "}
                  <span
                    style={{
                      fontSize: 12,
                    }}
                  >
                    học sinh
                  </span>
                </Text>
              </Flex>
            </div>
          )}
        </Card>

        {/* =================================================
            WEEKLY / QUIZ / WORD OF GOD
        ================================================= */}

        <Row gutter={[20, 20]}>
          {/* WEEKLY */}

          <Col xs={24} lg={14}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Sparkles size={18} color="#3B82F6" />

                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#1E3A8A",
                    }}
                  >
                    Tiến độ học tập tuần này
                  </Title>
                </Flex>
              }
              extra={
                <Segmented
                  options={["Tuần", "Tháng"]}
                  value={timeRange}
                  onChange={setTimeRange}
                  style={{
                    background: "#EFF6FF",
                    padding: 3,
                    borderRadius: 14,
                    fontWeight: 700,
                  }}
                />
              }
              bordered={false}
              style={chibiCardStyle}
              bodyStyle={{
                padding: 24,
              }}
            >
              <div
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: "0 10px",
                    borderBottom: "2px dashed #BFDBFE",
                  }}
                >
                  {weeklyProgress.length > 0 ? (
                    weeklyProgress.map((item, index) => {
                      const rawValue = Number(item?.value ?? 0);

                      const maxValue = Math.max(
                        ...weeklyProgress.map((x) => Number(x?.value ?? 0)),
                        1,
                      );

                      const height =
                        rawValue > 0
                          ? Math.max(6, Math.round((rawValue / maxValue) * 100))
                          : 0;

                      return (
                        <Flex
                          vertical
                          align="center"
                          key={`${item?.day}-${index}`}
                          style={{
                            height: "100%",
                            justifyContent: "flex-end",
                            width: "11%",
                          }}
                        >
                          <Tooltip title={`${item?.day}: ${rawValue} lượt`}>
                            <div
                              style={{
                                width: "100%",
                                maxWidth: 22,
                                height: `${height}%`,
                                minHeight: height > 0 ? 6 : 0,
                                background:
                                  item?.day === "CN"
                                    ? "linear-gradient(180deg, #FF6B8B 0%, #FF85A1 100%)"
                                    : "linear-gradient(180deg, #60A5FA 0%, #93C5FD 100%)",
                                borderRadius: "10px 10px 4px 4px",
                              }}
                            />
                          </Tooltip>
                        </Flex>
                      );
                    })
                  ) : (
                    <Flex
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      align="center"
                      justify="center"
                    >
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có dữ liệu"
                      />
                    </Flex>
                  )}
                </div>

                {weeklyProgress.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 10px 0",
                      fontSize: 12,
                      color: "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    {weeklyProgress.map((item, index) => (
                      <span
                        key={index}
                        style={{
                          color: item?.day === "CN" ? "#FF6B8B" : "#64748B",
                          fontWeight: item?.day === "CN" ? 800 : 700,
                        }}
                      >
                        {item?.day}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Col>

          {/* QUIZ */}

          <Col xs={24} lg={10}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Trophy size={18} color="#10B981" />

                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#065F46",
                    }}
                  >
                    Kết quả trắc nghiệm
                  </Title>
                </Flex>
              }
              bordered={false}
              style={chibiCardStyle}
              bodyStyle={{
                padding: 24,
              }}
            >
              <Flex
                vertical
                align="center"
                gap={20}
                style={{
                  height: 200,
                }}
              >
                <Progress
                  type="dashboard"
                  percent={Math.min(100, Math.max(0, correctPct))}
                  format={(percent) => (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "#10B981",
                        }}
                      >
                        {percent}%
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          color: "#6B7280",
                          fontWeight: 700,
                        }}
                      >
                        Chính xác
                      </span>
                    </div>
                  )}
                  strokeColor="#10B981"
                  trailColor="#E5E7EB"
                  size={135}
                  strokeWidth={10}
                />

                <Flex
                  justify="space-between"
                  style={{
                    width: "100%",
                    background: "#F0FDF4",
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1.5px solid #DCFCE7",
                  }}
                >
                  <Badge
                    color="#10B981"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#065F46",
                        }}
                      >
                        Đúng {correctPct}%
                      </Text>
                    }
                  />

                  <Badge
                    color="#FF6B8B"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#9F1239",
                        }}
                      >
                        Sai {wrongPct}%
                      </Text>
                    }
                  />

                  <Badge
                    color="#F59E0B"
                    text={
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#92400E",
                        }}
                      >
                        Chưa {uncompletedPct}%
                      </Text>
                    }
                  />
                </Flex>
              </Flex>
            </Card>
          </Col>

          {/* DAILY VERSE */}
        </Row>

        {/* =================================================
            QUICK ACTION + SUPPORT STUDENTS
        ================================================= */}

        <Row gutter={[20, 20]}>
          {/* QUICK ACTION */}

          <Col xs={24} lg={8}>
            <Card
              title={
                <Flex align="center" gap={8}>
                  <Sparkles size={18} color="#FF6B8B" />

                  <Title
                    level={5}
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: "#881337",
                    }}
                  >
                    Thao tác nhanh
                  </Title>
                </Flex>
              }
              bordered={false}
              style={{
                ...chibiCardStyle,
                height: "100%",
              }}
              bodyStyle={{
                padding: 20,
              }}
            >
              <Row gutter={[12, 12]}>
                {/* LESSON */}

                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/lessons")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#FFF0F5",
                      color: "#FF6B8B",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #FBCFE8",
                      fontWeight: 800,
                    }}
                  >
                    <div
                      style={{
                        background: "#FF6B8B",
                        color: "#FFFFFF",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      <PlusOutlined />
                    </div>

                    <span>Bài học</span>
                  </Button>
                </Col>

                {/* STUDENTS */}

                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/students")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#ECFDF5",
                      color: "#059669",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #A7F3D0",
                      fontWeight: 800,
                    }}
                  >
                    <div
                      style={{
                        background: "#10B981",
                        color: "#FFFFFF",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      <QuestionOutlined />
                    </div>

                    <span>Học sinh</span>
                  </Button>
                </Col>

                {/* GAME */}

                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/games")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#F3E8FF",
                      color: "#7E22CE",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #DDD6FE",
                      fontWeight: 800,
                    }}
                  >
                    <div
                      style={{
                        background: "#9333EA",
                        color: "#FFFFFF",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      <Gamepad2 size={16} />
                    </div>

                    <span>Tạo trò chơi</span>
                  </Button>
                </Col>

                {/* ACHIEVEMENT */}

                <Col span={12}>
                  <Button
                    type="text"
                    onClick={() => navigate("/catechist/leaderboard")}
                    style={{
                      height: 92,
                      width: "100%",
                      borderRadius: 20,
                      background: "#FEF3C7",
                      color: "#D97706",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      border: "1.5px solid #FDE68A",
                      fontWeight: 800,
                    }}
                  >
                    <div
                      style={{
                        background: "#F59E0B",
                        color: "#FFFFFF",
                        padding: 8,
                        borderRadius: 12,
                      }}
                    >
                      <SendOutlined />
                    </div>

                    <span>Thành tích</span>
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* SUPPORT STUDENTS */}
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              style={{
                ...chibiCardStyle,
                background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
                border: "2px solid #FDE68A",
              }}
              bodyStyle={{
                padding: 24,
              }}
            >
              <Flex
                vertical
                justify="space-between"
                style={{
                  height: 200,
                }}
              >
                <div>
                  <Flex align="center" justify="space-between">
                    <Tag
                      style={{
                        borderRadius: 14,
                        fontWeight: 800,
                        padding: "3px 12px",
                        margin: 0,
                        background: "#F59E0B",
                        color: "#FFFFFF",
                        border: "none",
                      }}
                    >
                      ✨ LỜI CHÚA HÔM NAY
                    </Tag>

                    <Heart size={20} fill="#FF6B8B" color="#FF6B8B" />
                  </Flex>

                  <Paragraph
                    style={{
                      marginTop: 16,
                      color: "#78350F",
                      fontWeight: 700,
                      fontSize: 13.5,
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    "{dailyVerse?.verse_text || "Đang tải Lời Chúa..."}"
                  </Paragraph>
                </div>

                <Flex justify="flex-end">
                  <Text
                    strong
                    style={{
                      color: "#D97706",
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    – {dailyVerse?.reference || "Tân Ước"} –
                  </Text>
                </Flex>
              </Flex>
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}
