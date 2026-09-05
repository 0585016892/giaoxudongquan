import React, { useCallback, useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
  Typography,
  Empty,
  Skeleton,
  Tag,
  Divider,
} from "antd";

import {
  BookOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import ErrorPage from "./ErrorPage";

const { Title, Text } = Typography;

/* =========================================================
   HELPERS
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;

  /*
   * Trường hợp API:
   * {
   *   success: true,
   *   data: [...]
   * }
   */
  if (Array.isArray(data?.data)) {
    return data.data;
  }

  /*
   * Trường hợp API trả trực tiếp:
   * [...]
   */
  if (Array.isArray(data)) {
    return data;
  }

  return [];
};

/* =========================================================
   FORMAT TIME
========================================================= */

const formatTime = (time) => {
  if (!time) return "—";

  return String(time).slice(0, 5);
};

/* =========================================================
   DAY NAME
========================================================= */

const getDayName = (day) => {
  const days = {
    0: "Chúa Nhật",
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chúa Nhật",

    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chúa Nhật",
  };

  if (day === null || day === undefined || day === "") {
    return "Chưa cập nhật";
  }

  return days[day] || day || "Chưa cập nhật";
};

/* =========================================================
   STATUS CONFIG
========================================================= */

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: "#0284C7",
      bg: "#E0F2FE",
      icon: <CheckCircleOutlined />,
    },

    paused: {
      label: "Tạm dừng",
      color: "#D97706",
      bg: "#FEF3C7",
      icon: <PauseCircleOutlined />,
    },

    completed: {
      label: "Đã kết thúc",
      color: "#64748B",
      bg: "#F1F5F9",
      icon: <StopOutlined />,
    },
  };

  return configs[status] || configs.active;
};

/* =========================================================
   STATUS TAG
========================================================= */

const StatusTag = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <Tag
      bordered={false}
      style={{
        margin: 0,
        borderRadius: 12,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 800,
        color: config.color,
        background: config.bg,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {config.icon}

      {config.label}
    </Tag>
  );
};

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({ icon, label, value }) => {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 18,
        background: "#FFF9FA",
        border: "1px solid #FFE4E6",
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: "100%",
        minWidth: 0,
      }}
    >
      {/* ICON */}

      <div
        style={{
          width: 38,
          height: 38,
          minWidth: 38,
          borderRadius: 12,
          background: "#FFF5F7",
          color: "#FF6B8B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* CONTENT */}

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <Text
          style={{
            display: "block",
            fontSize: 11,
            color: "#94A3B8",
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {label}
        </Text>

        <Text
          strong
          ellipsis
          style={{
            display: "block",
            fontSize: 14,
            color: "#334155",
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {value}
        </Text>
      </div>
    </div>
  );
};

/* =========================================================
   CLASS CARD
========================================================= */

const ClassCard = ({ classData }) => {
  return (
    <Card
      bordered={false}
      style={{
        marginBottom: 20,
        borderRadius: "clamp(18px, 4vw, 24px)",
        overflow: "hidden",
        background: "#FFFFFF",
        border: "2px solid #FFE4E6",
        boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
      }}
      styles={{
        body: {
          padding: "clamp(16px, 4vw, 28px)",
        },
      }}
    >
      {/* =====================================================
          CLASS HEADER
      ===================================================== */}

      <Row
        align="middle"
        gutter={[12, 14]}
        style={{
          marginBottom: 20,
        }}
      >
        {/* ===================================================
            CLASS NAME
        =================================================== */}

        <Col xs={24} sm={17} md={18}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            {/* ICON */}

            <div
              style={{
                width: "clamp(44px, 12vw, 52px)",
                height: "clamp(44px, 12vw, 52px)",
                minWidth: "clamp(44px, 12vw, 52px)",
                borderRadius: 15,
                background: "#FFF5F7",
                color: "#FF6B8B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(20px, 5vw, 24px)",
                border: "1.5px solid #FFD1D9",
                flexShrink: 0,
              }}
            >
              <BookOutlined />
            </div>

            {/* NAME */}

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: "#334155",
                  fontWeight: 800,
                  fontSize: "clamp(18px, 5vw, 26px)",
                  lineHeight: 1.25,
                  wordBreak: "break-word",
                }}
              >
                {classData?.name || "Chưa có tên lớp"}
              </Title>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                <Tag
                  color="gold"
                  style={{
                    borderRadius: 8,
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  ✨ {classData?.code || "—"}
                </Tag>

                {classData?.category && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#FF6B8B",
                      fontWeight: 700,
                      wordBreak: "break-word",
                    }}
                  >
                    {classData.category}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </Col>

        {/* ===================================================
            STATUS
        =================================================== */}

        <Col xs={24} sm={7} md={6}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <StatusTag status={classData?.status} />
          </div>
        </Col>
      </Row>

      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <Divider
        style={{
          borderColor: "#FFE4E6",
          margin: "0 0 20px",
        }}
      />

      {/* =====================================================
          INFO GRID
      ===================================================== */}

      <Row
        gutter={[
          { xs: 8, sm: 12, md: 16 },
          { xs: 8, sm: 12, md: 16 },
        ]}
        style={{
          marginBottom: 16,
        }}
      >
        {/* =================================================
            NGÀY
        ================================================= */}

        <Col xs={24} sm={12} lg={6}>
          <InfoItem
            icon={<CalendarOutlined />}
            label="Lịch học hàng tuần"
            value={getDayName(classData?.day_of_week)}
          />
        </Col>

        {/* =================================================
            GIỜ
        ================================================= */}

        <Col xs={24} sm={12} lg={6}>
          <InfoItem
            icon={<ClockCircleOutlined />}
            label="Khung giờ học"
            value={`${formatTime(
              classData?.start_time,
            )} - ${formatTime(classData?.end_time)}`}
          />
        </Col>

        {/* =================================================
            PHÒNG
        ================================================= */}

        <Col xs={24} sm={12} lg={6}>
          <InfoItem
            icon={<EnvironmentOutlined />}
            label="Địa điểm phòng học"
            value={classData?.room || "Chưa cập nhật"}
          />
        </Col>

        {/* =================================================
            SĨ SỐ
        ================================================= */}

        <Col xs={24} sm={12} lg={6}>
          <InfoItem
            icon={<TeamOutlined />}
            label="Sĩ số học viên"
            value={`${classData?.studentsCount || 0} học viên`}
          />
        </Col>
      </Row>

      {/* =====================================================
          THỜI GIAN KHÓA HỌC
      ===================================================== */}

      <div
        style={{
          padding: "clamp(12px, 3vw, 14px) clamp(14px, 4vw, 18px)",
          borderRadius: 16,
          background: "#FFF5F7",
          border: "1px solid #FFE4E6",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {/* DATE */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            minWidth: 0,
            flex: 1,
          }}
        >
          <CalendarOutlined
            style={{
              color: "#FF6B8B",
              fontSize: 16,
              marginTop: 2,
              flexShrink: 0,
            }}
          />

          <Text
            style={{
              fontSize: 12,
              color: "#64748B",
              fontWeight: 700,
              lineHeight: 1.6,
            }}
          >
            Thời gian khóa học:{" "}
            <span
              style={{
                color: "#334155",
              }}
            >
              {classData?.start_date
                ? dayjs(classData.start_date).format("DD/MM/YYYY")
                : "—"}

              {" đến "}

              {classData?.end_date
                ? dayjs(classData.end_date).format("DD/MM/YYYY")
                : "—"}
            </span>
          </Text>
        </div>

        {/* ROLE */}

        <Tag
          color="pink"
          style={{
            borderRadius: 8,
            fontWeight: 700,
            margin: 0,
            whiteSpace: "normal",
            textAlign: "center",
          }}
        >
          Vai trò: {classData?.catechist_role || "Giáo lý viên"}
        </Tag>
      </div>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {classData?.description && (
        <div
          style={{
            marginTop: 14,
            padding: "14px clamp(12px, 3vw, 16px)",
            borderRadius: 16,
            background: "#FFF9FA",
            border: "1px solid #FFE4E6",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#64748B",
              lineHeight: 1.7,
              wordBreak: "break-word",
            }}
          >
            <strong>Ghi chú/Mô tả:</strong> {classData.description}
          </Text>
        </div>
      )}
    </Card>
  );
};

/* =========================================================
   PAGE
========================================================= */

const TeacherClassesPage = () => {
  const { user } = useUser();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =======================================================
     FETCH CLASSES
  ======================================================= */

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await classApi.getClassTeacher();

      console.log("========================================");
      console.log("GET TEACHER CLASSES RESPONSE:", response);
      console.log("========================================");

      const list = normalizeListResponse(response);

      console.log("NORMALIZED TEACHER CLASSES:", list);

      /*
       * Đảm bảo luôn là array
       */
      setClasses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("GET TEACHER CLASS ERROR:", error);

      setClasses([]);

      setError(
        error?.response?.data?.message || "Không thể tải danh sách lớp học!",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <ErrorPage
        title="Không thể tải danh sách lớp học"
        message={error}
        onRetry={() => {
          setError(null);
          fetchClasses();
        }}
      />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(12px, 3vw, 24px)",
        background: "#FFF9FA",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          HEADER GIÁO LÝ VIÊN
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          marginBottom: 20,
          borderRadius: "clamp(18px, 4vw, 26px)",
          overflow: "hidden",
          background: "linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%)",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
        }}
        styles={{
          body: {
            padding: "clamp(16px, 4vw, 24px)",
          },
        }}
      >
        <Row align="middle" gutter={[16, 16]}>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                minWidth: 0,
              }}
            >
              {/* =================================================
                  AVATAR
              ================================================= */}

              <div
                style={{
                  width: "clamp(48px, 14vw, 60px)",
                  height: "clamp(48px, 14vw, 60px)",
                  minWidth: "clamp(48px, 14vw, 60px)",
                  borderRadius: "clamp(15px, 4vw, 20px)",
                  background: "#FF6B8B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "clamp(22px, 6vw, 28px)",
                  boxShadow: "0 7px 16px rgba(255, 107, 139, 0.25)",
                  flexShrink: 0,
                }}
              >
                <UserOutlined />
              </div>

              {/* =================================================
                  INFORMATION
              ================================================= */}

              <div
                style={{
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    display: "block",
                    fontSize: "clamp(9px, 2.5vw, 11px)",
                    color: "#FF6B8B",
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    lineHeight: 1.4,
                  }}
                >
                  🌸 GIÁO LÝ VIÊN PHỤ TRÁCH
                </Text>

                <Title
                  level={3}
                  style={{
                    margin: "4px 0 8px",
                    color: "#334155",
                    fontWeight: 800,
                    fontSize: "clamp(19px, 5vw, 28px)",
                    lineHeight: 1.25,
                    wordBreak: "break-word",
                  }}
                >
                  {user?.full_name || "Khánh Hưng ( Admin )"}
                </Title>

                {/* TAGS */}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {/* THÁNH DANH */}

                  <Tag
                    color="magenta"
                    style={{
                      borderRadius: 8,
                      fontWeight: 700,
                      margin: 0,
                      maxWidth: "100%",
                      whiteSpace: "normal",
                    }}
                  >
                    Thánh danh: {user?.holy_name || "Đaminh"}
                  </Tag>

                  {/* MÃ GLV */}

                  <Tag
                    color="volcano"
                    style={{
                      borderRadius: 8,
                      fontWeight: 700,
                      margin: 0,
                      maxWidth: "100%",
                      whiteSpace: "normal",
                    }}
                  >
                    Mã GLV: {user?.catechist_code || "GLV20260035"}
                  </Tag>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          TITLE
      ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <Text
          strong
          style={{
            fontSize: "clamp(14px, 4vw, 16px)",
            color: "#334155",
            display: "block",
          }}
        >
          📚 Lớp học được phân công
        </Text>

        {/* TOTAL CLASS */}

        {!loading && classes.length > 0 && (
          <Tag
            color="pink"
            style={{
              margin: 0,
              borderRadius: 10,
              padding: "4px 10px",
              fontWeight: 800,
            }}
          >
            {classes.length} lớp
          </Tag>
        )}
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <Card
          bordered={false}
          style={{
            borderRadius: 22,
            border: "2px solid #FFE4E6",
          }}
          styles={{
            body: {
              padding: "clamp(16px, 4vw, 24px)",
            },
          }}
        >
          <Skeleton
            active
            paragraph={{
              rows: 5,
            }}
          />
        </Card>
      ) : classes.length > 0 ? (
        /* ===================================================
           ALL CLASS CARDS
        =================================================== */

        <div>
          {classes.map((classData, index) => (
            <ClassCard
              key={classData?.assignment_id || classData?.id || index}
              classData={classData}
            />
          ))}
        </div>
      ) : (
        /* ===================================================
           EMPTY
        =================================================== */

        <Card
          bordered={false}
          style={{
            borderRadius: 22,
            border: "2px solid #FFE4E6",
            textAlign: "center",
          }}
          styles={{
            body: {
              padding: "clamp(28px, 8vw, 40px) 20px",
            },
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                style={{
                  color: "#94A3B8",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Bạn chưa được phân công lớp học nào 🌸
              </Text>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default TeacherClassesPage;
