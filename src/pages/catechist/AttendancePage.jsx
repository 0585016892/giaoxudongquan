import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Input,
  Modal,
  Progress,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  BookOutlined,
  SearchOutlined,
  LockOutlined,
  EyeOutlined,
  UserOutlined,
  CameraOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import QRCodeScanner from "./QRCodeScanner";

import {
  getAttendance,
  saveBulkAttendance,
  getStudentAttendance,
} from "../../api/attendanceApi";

import { useUser } from "../../context/UserContext";

import classApi from "../../api/classApi";

import AppButton from "../../components/common/AppButton";
import StatCard from "../../components/common/StatCard";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import TablePagination from "../../components/common/TablePagination";

const { Text, Title } = Typography;

/**
 * =========================================================
 * DESIGN TOKENS
 * =========================================================
 */

const COLORS = {
  primarySoft: "#86A8CF",
  accentPink: "#FFB6C1",
  accentYellow: "#FFE4B5",

  textDark: "#1E293B",
  softBg: "#F8FAFC",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",

  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#15803D",

  dangerBg: "#FEF2F2",
  dangerBorder: "#FECACA",
  dangerText: "#DC2626",

  warningBg: "#FFFBEB",
  warningBorder: "#FEF08A",
  warningText: "#B45309",

  infoBg: "#EFF6FF",
  infoBorder: "#BFDBFE",
  infoText: "#1D4ED8",
};

/**
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

const STATUS_CONFIG = {
  present: {
    label: "Có mặt",
    short: "Có",
    bg: COLORS.successBg,
    border: COLORS.successBorder,
    color: COLORS.successText,
    icon: <CheckCircleOutlined />,
  },

  absent: {
    label: "Vắng",
    short: "Vắng",
    bg: COLORS.dangerBg,
    border: COLORS.dangerBorder,
    color: COLORS.dangerText,
    icon: <CloseCircleOutlined />,
  },

  late: {
    label: "Muộn",
    short: "Muộn",
    bg: COLORS.warningBg,
    border: COLORS.warningBorder,
    color: COLORS.warningText,
    icon: <ClockCircleOutlined />,
  },

  excused: {
    label: "Có phép",
    short: "Phép",
    bg: COLORS.infoBg,
    border: COLORS.infoBorder,
    color: COLORS.infoText,
    icon: <ExclamationCircleOutlined />,
  },
};

const STATUS_LIST = ["present", "absent", "late", "excused"];

/**
 * =========================================================
 * CHECK PAST DATE
 * =========================================================
 */

const isPastDate = (date) => {
  if (!date) return false;

  return date.isBefore(dayjs().startOf("day"), "day");
};

/**
 * =========================================================
 * NORMALIZE CLASS
 * =========================================================
 */

const normalizeClassList = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.classes)) {
    return response.data.classes;
  }

  if (response.id || response.class_id) {
    return [response];
  }

  if (response.data?.id || response.data?.class_id) {
    return [response.data];
  }

  return [];
};

/**
 * =========================================================
 * NORMALIZE STUDENT
 * =========================================================
 */

const normalizeStudent = (student) => {
  const attendanceStatus = student.attendance_status || student.status || null;

  return {
    ...student,

    student_id: Number(student.student_id || student.id),

    student_name:
      student.student_name ||
      student.name ||
      student.full_name ||
      "Không có tên",

    status: attendanceStatus,

    attendance_status: attendanceStatus,

    attendance_id: student.attendance_id ? Number(student.attendance_id) : null,

    attendance_date: student.attendance_date || null,

    check_in_time: student.check_in_time || null,

    note: student.note || "",

    code: student.code || null,

    student_status: student.student_status || "active",

    teacher_id: student.teacher_id ? Number(student.teacher_id) : null,
  };
};

/**
 * =========================================================
 * NORMALIZE STUDENT HISTORY
 * =========================================================
 */

const normalizeStudentHistory = (response) => {
  const data = response?.data || {};

  return {
    student: data.student || null,

    attendances: Array.isArray(data.attendances) ? data.attendances : [],

    summary: data.summary || {},
  };
};

/**
 * =========================================================
 * MAIN COMPONENT
 * =========================================================
 */

const AttendancePage = () => {
  const { user } = useUser();

  const role = user?.role;

  /**
   * =======================================================
   * STATES
   * =======================================================
   */

  const [classes, setClasses] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [students, setStudents] = useState([]);

  const [classInfo, setClassInfo] = useState(null);

  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");

  /**
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  /**
   * =======================================================
   * STUDENT DETAIL
   * =======================================================
   */

  const [studentDetailOpen, setStudentDetailOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentHistory, setStudentHistory] = useState([]);

  const [loadingStudentHistory, setLoadingStudentHistory] = useState(false);

  /**
   * =======================================================
   * QR SCANNER
   * =======================================================
   */

  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  /**
   * =======================================================
   * ATTENDANCE LOCK
   * =======================================================
   */

  const attendanceLocked = useMemo(() => {
    return isPastDate(selectedDate);
  }, [selectedDate]);

  /**
   * =======================================================
   * OPEN QR SCANNER
   * =======================================================
   */

  const handleOpenQRScanner = () => {
    if (!selectedClassId) {
      message.warning("Vui lòng chọn lớp trước khi quét QR.");
      return;
    }

    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể điểm danh bằng QR.");
      return;
    }

    setQrScannerOpen(true);
  };

  /**
   * =======================================================
   * QR SUCCESS
   * =======================================================
   */

  const handleQRSuccess = async (data) => {
    const student = data?.student;

    if (!student?.id) {
      await loadAttendance();
      return;
    }

    const attendance = data?.attendance;

    const studentId = Number(student.id);

    setStudents((prev) =>
      prev.map((item) => {
        if (Number(item.student_id) !== studentId) {
          return item;
        }

        const nextStatus =
          attendance?.status || data?.attendance_status || "present";

        return {
          ...item,

          attendance_id: attendance?.id || item.attendance_id || null,

          status: nextStatus,

          attendance_status: nextStatus,

          check_in_time:
            attendance?.check_in_time || item.check_in_time || null,

          attendance_date:
            attendance?.attendance_date ||
            item.attendance_date ||
            selectedDate.format("YYYY-MM-DD"),

          note: item.note || "",
        };
      }),
    );

    message.success(`${student.name || "Học sinh"} điểm danh thành công`);
  };

  /**
   * =======================================================
   * FINISH QR ATTENDANCE
   * =======================================================
   */

  const handleFinishQRScan = async () => {
    if (!selectedClassId) {
      setQrScannerOpen(false);
      return;
    }

    const unmarkedStudents = students.filter((student) => {
      const status = student.status ?? student.attendance_status ?? null;

      const hasAttendance = Boolean(student.attendance_id) || Boolean(status);

      return !hasAttendance;
    });

    /**
     * TẤT CẢ ĐÃ ĐIỂM DANH
     */

    if (unmarkedStudents.length === 0) {
      setQrScannerOpen(false);

      message.success("Tất cả học sinh đã được điểm danh. 🎉");

      return;
    }

    /**
     * XÁC NHẬN
     */

    Modal.confirm({
      title: "Xác nhận kết thúc điểm danh",

      icon: <ExclamationCircleOutlined />,

      content: (
        <div>
          <p>
            Hiện còn <strong>{unmarkedStudents.length}</strong> học sinh chưa
            được điểm danh.
          </p>

          <p>
            Nếu kết thúc bây giờ, hệ thống sẽ tự động đánh dấu những học sinh
            này là{" "}
            <strong
              style={{
                color: COLORS.dangerText,
              }}
            >
              Vắng
            </strong>
            .
          </p>

          <Alert
            type="warning"
            showIcon
            style={{
              marginTop: 12,
              borderRadius: 10,
            }}
            message="Hành động này sẽ lưu trạng thái vắng vào hệ thống."
          />
        </div>
      ),

      okText: `Xác nhận ${unmarkedStudents.length} học sinh vắng`,

      cancelText: "Quay lại quét tiếp",

      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          const studentsForAbsent = unmarkedStudents.map((student) => {
            const studentId = student.student_id ?? student.id;

            return {
              student_id: Number(studentId),

              status: "absent",

              check_in_time: null,

              note: "Không điểm danh",
            };
          });

          const invalidStudents = studentsForAbsent.filter(
            (student) =>
              !Number.isInteger(student.student_id) || student.student_id <= 0,
          );

          if (invalidStudents.length > 0) {
            message.error(
              "Có học sinh không xác định được ID. Vui lòng tải lại danh sách.",
            );

            return;
          }

          const payload = {
            class_id: Number(selectedClassId),

            attendance_date: selectedDate.format("YYYY-MM-DD"),

            students: studentsForAbsent,
          };

          await saveBulkAttendance(payload);

          message.success(
            `Đã đánh dấu ${studentsForAbsent.length} học sinh vắng.`,
          );

          setQrScannerOpen(false);

          await loadAttendance();
        } catch (error) {
          message.error(
            error?.response?.data?.message ||
              "Không thể cập nhật trạng thái vắng.",
          );
        }
      },
    });
  };

  /**
   * =======================================================
   * LOAD CLASSES
   * =======================================================
   */

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      setError("");

      let response;

      if (role === "teacher") {
        response = await classApi.getClassTeacher();
      } else {
        response = await classApi.getAll();
      }

      const list = normalizeClassList(response);

      setClasses(list);

      if (list.length > 0) {
        const firstClassId = Number(list[0].id || list[0].class_id);

        setSelectedClassId(firstClassId);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Không thể tải danh sách lớp";

      setError(msg);

      message.error(msg);
    } finally {
      setLoadingClasses(false);
    }
  }, [role]);

  /**
   * =======================================================
   * LOAD ATTENDANCE
   * =======================================================
   */

  const loadAttendance = useCallback(async () => {
    if (!selectedClassId) {
      setStudents([]);
      setClassInfo(null);
      return;
    }

    try {
      setLoadingAttendance(true);
      setError("");

      const date = selectedDate.format("YYYY-MM-DD");

      const response = await getAttendance({
        class_id: Number(selectedClassId),
        date,
      });

      let rawStudents = [];

      let classData = null;

      if (Array.isArray(response?.data)) {
        rawStudents = response.data;
      } else if (Array.isArray(response?.data?.students)) {
        rawStudents = response.data.students;

        classData = response.data.class || null;
      } else if (Array.isArray(response)) {
        rawStudents = response;
      } else if (Array.isArray(response?.students)) {
        rawStudents = response.students;

        classData = response.class || null;
      }

      const studentList = rawStudents.map(normalizeStudent);

      setClassInfo(classData);

      setStudents(studentList);

      setCurrentPage(1);
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Không thể tải dữ liệu điểm danh";

      setError(msg);

      message.error(msg);

      setStudents([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, [selectedClassId, selectedDate]);

  /**
   * =======================================================
   * EFFECT LOAD CLASSES
   * =======================================================
   */

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  /**
   * =======================================================
   * EFFECT LOAD ATTENDANCE
   * =======================================================
   */

  useEffect(() => {
    if (selectedClassId) {
      loadAttendance();
    }
  }, [selectedClassId, selectedDate, loadAttendance]);

  /**
   * =======================================================
   * RESET SEARCH
   * =======================================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  /**
   * =======================================================
   * RESET FILTER
   * =======================================================
   */

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClassId, selectedDate]);

  /**
   * =======================================================
   * STATISTICS
   * =======================================================
   */

  const statistics = useMemo(() => {
    const total = students.length;

    const present = students.filter((s) => s.status === "present").length;

    const absent = students.filter((s) => s.status === "absent").length;

    const late = students.filter((s) => s.status === "late").length;

    const excused = students.filter((s) => s.status === "excused").length;

    const attended = present + late;

    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    const notMarked = students.filter(
      (s) => !s.status && !s.attendance_status && !s.attendance_id,
    ).length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attended,
      notMarked,
      rate,
    };
  }, [students]);

  /**
   * =======================================================
   * SELECTED CLASS
   * =======================================================
   */

  const selectedClass = useMemo(() => {
    return (
      classes.find(
        (item) => Number(item.id || item.class_id) === Number(selectedClassId),
      ) ||
      classInfo ||
      null
    );
  }, [classes, selectedClassId, classInfo]);

  /**
   * =======================================================
   * FILTER STUDENTS
   * =======================================================
   */

  const filteredStudents = useMemo(() => {
    if (!searchText.trim()) {
      return students;
    }

    const keyword = searchText.trim().toLowerCase();

    return students.filter((student) => {
      const name = student.student_name?.toLowerCase() || "";

      const code = student.code?.toLowerCase() || "";

      const id = String(student.student_id || "");

      return (
        name.includes(keyword) || code.includes(keyword) || id.includes(keyword)
      );
    });
  }, [students, searchText]);

  /**
   * =======================================================
   * SAFE PAGINATION
   * =======================================================
   */

  const safeCurrentPage = Number(currentPage) > 0 ? Number(currentPage) : 1;

  const safePageSize = Number(pageSize) > 0 ? Number(pageSize) : 10;

  /**
   * =======================================================
   * TOTAL PAGES
   * =======================================================
   */

  const totalPages = useMemo(() => {
    if (filteredStudents.length === 0) {
      return 1;
    }

    return Math.max(1, Math.ceil(filteredStudents.length / safePageSize));
  }, [filteredStudents.length, safePageSize]);

  /**
   * =======================================================
   * ENSURE PAGE VALID
   * =======================================================
   */

  useEffect(() => {
    if (safeCurrentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [safeCurrentPage, totalPages]);

  /**
   * =======================================================
   * PAGINATED STUDENTS
   * =======================================================
   */

  const paginatedStudents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * safePageSize;

    return filteredStudents.slice(startIndex, startIndex + safePageSize);
  }, [filteredStudents, safeCurrentPage, safePageSize]);

  /**
   * =======================================================
   * PAGINATION INFO
   * =======================================================
   */

  const paginationInfo = useMemo(() => {
    const total = filteredStudents.length;

    if (total === 0) {
      return {
        start: 0,
        end: 0,
        total: 0,
      };
    }

    const start = (safeCurrentPage - 1) * safePageSize + 1;

    const end = Math.min(safeCurrentPage * safePageSize, total);

    return {
      start,
      end,
      total,
    };
  }, [filteredStudents.length, safeCurrentPage, safePageSize]);

  /**
   * =======================================================
   * CHANGE STATUS
   * =======================================================
   */

  const handleStatusChange = (studentId, status) => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, chỉ được xem dữ liệu.");

      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        Number(student.student_id) === Number(studentId)
          ? {
              ...student,
              status,
              attendance_status: status,
            }
          : student,
      ),
    );
  };

  /**
   * =======================================================
   * CHANGE NOTE
   * =======================================================
   */

  const handleNoteChange = (studentId, note) => {
    if (attendanceLocked) {
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        Number(student.student_id) === Number(studentId)
          ? {
              ...student,
              note,
            }
          : student,
      ),
    );
  };

  /**
   * =======================================================
   * MARK ALL
   * =======================================================
   */

  const handleMarkAll = (status) => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể chỉnh sửa.");

      return;
    }

    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status,
        attendance_status: status,
      })),
    );
  };

  /**
   * =======================================================
   * CLEAR STATUS
   * =======================================================
   */

  const handleClearStatus = () => {
    if (attendanceLocked) {
      message.warning("Ngày điểm danh đã qua, không thể chỉnh sửa.");

      return;
    }

    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: null,
        attendance_status: null,
      })),
    );
  };

  /**
   * =======================================================
   * VIEW STUDENT HISTORY
   * =======================================================
   */

  const handleViewStudent = async (student) => {
    try {
      setSelectedStudent(student);

      setStudentDetailOpen(true);

      setLoadingStudentHistory(true);

      setStudentHistory([]);

      const response = await getStudentAttendance(Number(student.student_id));

      const { attendances } = normalizeStudentHistory(response);

      setStudentHistory(attendances);
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Không thể tải lịch sử điểm danh",
      );
    } finally {
      setLoadingStudentHistory(false);
    }
  };

  /**
   * =======================================================
   * MONTHLY HISTORY
   * =======================================================
   */

  const monthlyHistory = useMemo(() => {
    if (!selectedDate || !Array.isArray(studentHistory)) {
      return [];
    }

    const year = selectedDate.year();

    const month = selectedDate.month();

    return studentHistory
      .filter((item) => {
        if (!item.attendance_date) {
          return false;
        }

        const date = dayjs(item.attendance_date);

        return date.year() === year && date.month() === month;
      })
      .sort(
        (a, b) =>
          dayjs(b.attendance_date).valueOf() -
          dayjs(a.attendance_date).valueOf(),
      );
  }, [studentHistory, selectedDate]);

  /**
   * =======================================================
   * MONTHLY STUDENT STATISTICS
   * =======================================================
   */

  const monthlyStudentStatistics = useMemo(() => {
    const total = monthlyHistory.length;

    const present = monthlyHistory.filter((i) => i.status === "present").length;

    const absent = monthlyHistory.filter((i) => i.status === "absent").length;

    const late = monthlyHistory.filter((i) => i.status === "late").length;

    const excused = monthlyHistory.filter((i) => i.status === "excused").length;

    const attended = present + late;

    const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attended,
      rate,
    };
  }, [monthlyHistory]);

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div
      style={{
        minHeight: "100%",
        background: COLORS.softBg,

        padding: "clamp(12px, 3vw, 24px)",

        paddingBottom: "clamp(100px, 15vw, 120px)",

        width: "100%",
        maxWidth: "100%",

        boxSizing: "border-box",

        overflowX: "hidden",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          marginBottom: "clamp(16px, 3vw, 24px)",
        }}
      >
        <PageHeroHeader
          icon={<BookOutlined />}
          badgeText="🌸 QUẢN LÝ GIÁO LÝ"
          title="Điểm Danh Kiểu Danh Sách"
          description="Giao diện danh sách học viên trực quan, tinh tế và dễ thao tác."
        />
      </div>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          marginBottom: 20,
          borderRadius: 20,
          boxShadow: "0 4px 20px rgba(148, 163, 184, 0.08)",
          background: COLORS.cardBg,
          border: `1px solid ${COLORS.border}`,
          width: "100%",
        }}
        bodyStyle={{
          padding: "clamp(14px, 3vw, 18px)",
        }}
      >
        <Row
          gutter={[
            { xs: 8, sm: 16 },
            { xs: 12, sm: 16 },
          ]}
          align="middle"
        >
          {/* CLASS */}

          <Col xs={24} sm={12} lg={8}>
            <Text
              strong
              style={{
                color: COLORS.textDark,
                display: "block",
                marginBottom: 6,
              }}
            >
              Chọn Lớp 📚
              {role === "teacher" && (
                <Tag
                  color="orange"
                  style={{
                    marginLeft: 6,
                    borderRadius: 6,
                  }}
                >
                  Lớp phụ trách
                </Tag>
              )}
            </Text>

            <Select
              value={selectedClassId ? Number(selectedClassId) : undefined}
              onChange={(value) => setSelectedClassId(Number(value))}
              loading={loadingClasses}
              placeholder="Chọn lớp học..."
              style={{
                width: "100%",
              }}
              size="large"
              showSearch
              optionFilterProp="label"
              options={classes.map((item) => ({
                value: Number(item.id || item.class_id),

                label:
                  item.name ||
                  item.class_name ||
                  `Lớp ${item.id || item.class_id}`,
              }))}
            />
          </Col>

          {/* DATE */}

          <Col xs={24} sm={12} lg={6}>
            <Text
              strong
              style={{
                color: COLORS.textDark,
                display: "block",
                marginBottom: 6,
              }}
            >
              Ngày Điểm Danh 🗓️
            </Text>

            <DatePicker
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="DD/MM/YYYY"
              size="large"
              allowClear={false}
              style={{
                width: "100%",
              }}
              suffixIcon={
                <CalendarOutlined
                  style={{
                    color: "#E57373",
                  }}
                />
              }
            />
          </Col>

          {/* BUTTONS */}

          <Col xs={24} sm={24} lg={10}>
            <div
              style={{
                height: 22,
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 8,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <AppButton
                size="large"
                icon={<ReloadOutlined />}
                onClick={loadAttendance}
                loading={loadingAttendance}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,

                  flex: "1 1 120px",

                  minWidth: 120,
                }}
              >
                Tải lại
              </AppButton>

              <AppButton
                type="primary"
                size="large"
                icon={<CameraOutlined />}
                onClick={handleOpenQRScanner}
                disabled={
                  !selectedClassId || attendanceLocked || loadingAttendance
                }
                style={{
                  borderRadius: 12,
                  fontWeight: 700,

                  flex: "1 1 140px",

                  minWidth: 140,
                }}
              >
                Quét QR
              </AppButton>
            </div>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          LOCK ALERT
      ===================================================== */}

      {attendanceLocked && (
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Ngày điểm danh đã khóa chỉnh sửa"
          description={
            <>
              Bạn đang xem dữ liệu ngày{" "}
              <strong>{selectedDate.format("DD/MM/YYYY")}</strong>. Ngày đã qua
              chỉ ở chế độ xem lịch sử.
            </>
          }
          style={{
            marginBottom: 20,
            borderRadius: 16,
          }}
        />
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError("")}
          style={{
            marginBottom: 20,
            borderRadius: 16,
          }}
        />
      )}

      {/* =====================================================
          CLASS INFO
      ===================================================== */}

      {selectedClass && (
        <Row
          gutter={[
            { xs: 8, sm: 16 },
            { xs: 12, sm: 16 },
          ]}
          style={{
            marginBottom: 20,
          }}
        >
          {/* CLASS */}

          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "linear-gradient(135deg, #EFF6FF 0%, #FCE7F3 100%)",
                border: "1px solid #E2E8F0",
                height: "100%",
              }}
              bodyStyle={{
                padding: "clamp(14px, 3vw, 20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <Avatar
                  size={"clamp(42px, 12vw, 48px)"}
                  style={{
                    background: "#FFFFFF",
                    color: "#3B82F6",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    flexShrink: 0,
                  }}
                  icon={<TeamOutlined />}
                />

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#1E293B",
                      fontSize: "clamp(16px, 4vw, 20px)",
                      lineHeight: 1.3,
                      wordBreak: "break-word",
                    }}
                  >
                    {selectedClass.name ||
                      selectedClass.class_name ||
                      `Lớp ${selectedClass.id || selectedClass.class_id}`}
                  </Title>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      lineHeight: 1.6,
                      display: "block",
                    }}
                  >
                    Sĩ số: <strong>{statistics.total}</strong> học viên • Ngày:{" "}
                    {selectedDate.format("DD/MM/YYYY")}
                  </Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* ATTENDANCE RATE */}

          <Col xs={24} lg={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                border: `1px solid ${COLORS.border}`,
                height: "100%",
              }}
              bodyStyle={{
                padding: "clamp(14px, 3vw, 20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontWeight: 600,
                  }}
                >
                  Tỷ lệ chuyên cần
                </Text>

                <Text
                  strong
                  style={{
                    color: "#3B82F6",
                  }}
                >
                  {statistics.rate}%
                </Text>
              </div>

              <Progress
                percent={statistics.rate}
                strokeColor="#3B82F6"
                showInfo={false}
                strokeWidth={8}
              />

              <Space
                wrap
                size={[6, 4]}
                style={{
                  marginTop: 8,
                  maxWidth: "100%",
                }}
              >
                <Tag color="success">Có mặt: {statistics.present}</Tag>

                <Tag color="warning">Muộn: {statistics.late}</Tag>

                <Tag color="error">Vắng: {statistics.absent}</Tag>

                <Tag color="processing">Có phép: {statistics.excused}</Tag>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      {selectedClassId && (
        <Row
          gutter={[
            { xs: 8, sm: 16 },
            { xs: 8, sm: 16 },
          ]}
          style={{
            marginBottom: 20,
          }}
        >
          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng số"
              value={statistics.total}
              icon={<TeamOutlined />}
              style={{
                borderRadius: 16,
              }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Có mặt"
              value={statistics.present}
              icon={<CheckCircleOutlined />}
              style={{
                borderRadius: 16,
              }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Vắng"
              value={statistics.absent}
              icon={<CloseCircleOutlined />}
              style={{
                borderRadius: 16,
              }}
            />
          </Col>

          <Col xs={12} sm={6}>
            <StatCard
              title="Muộn"
              value={statistics.late}
              icon={<ClockCircleOutlined />}
              style={{
                borderRadius: 16,
              }}
            />
          </Col>
        </Row>
      )}

      {/* =====================================================
          STUDENT LIST
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          borderRadius: "clamp(18px, 4vw, 24px)",
          boxShadow: "0 4px 20px rgba(148, 163, 184, 0.08)",
          border: `1px solid ${COLORS.border}`,
          width: "100%",
          overflow: "hidden",
        }}
        bodyStyle={{
          padding: "clamp(12px, 3vw, 24px)",
        }}
      >
        {/* ===================================================
            TOOLBAR
        =================================================== */}

        {students.length > 0 && !loadingAttendance && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",

              flexWrap: "wrap",

              gap: 12,

              marginBottom: 20,

              paddingBottom: 16,

              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            {/* QUICK ACTIONS */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
                flex: "1 1 400px",
                minWidth: 0,
              }}
            >
              <Text
                strong
                style={{
                  color: COLORS.textDark,
                  marginRight: 2,
                }}
              >
                ⚡ Thao tác nhanh:
              </Text>

              <AppButton
                size="small"
                type="primary"
                disabled={attendanceLocked}
                onClick={() => handleMarkAll("present")}
                style={{
                  background: "#10B981",
                  borderColor: "#10B981",
                  borderRadius: 8,
                }}
              >
                Tất cả có mặt
              </AppButton>

              <AppButton
                size="small"
                disabled={attendanceLocked}
                onClick={() => handleMarkAll("absent")}
                style={{
                  borderRadius: 8,
                }}
              >
                Tất cả vắng
              </AppButton>

              <AppButton
                size="small"
                disabled={attendanceLocked}
                onClick={handleClearStatus}
                style={{
                  borderRadius: 8,
                }}
              >
                Xóa trạng thái
              </AppButton>
            </div>

            {/* SEARCH */}

            <Input
              placeholder="Tìm tên hoặc mã học viên..."
              prefix={
                <SearchOutlined
                  style={{
                    color: "#94A3B8",
                  }}
                />
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                width: "clamp(200px, 100%, 280px)",
                borderRadius: 10,
                flex: "1 1 220px",
              }}
            />
          </div>
        )}

        {/* ===================================================
            LOADING
        =================================================== */}

        {loadingAttendance && (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                active
                avatar
                paragraph={{
                  rows: 1,
                }}
                style={{
                  marginBottom: 16,
                  padding: 12,
                  background: "#F8FAFC",
                  borderRadius: 12,
                }}
              />
            ))}
          </div>
        )}

        {/* ===================================================
            NO CLASS
        =================================================== */}

        {!loadingAttendance && !selectedClassId && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Hãy chọn lớp ở trên để bắt đầu điểm danh!"
            style={{
              padding: "clamp(30px, 8vw, 60px) 10px",
            }}
          />
        )}

        {/* ===================================================
            NO STUDENTS
        =================================================== */}

        {!loadingAttendance && selectedClassId && students.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Lớp này chưa có học viên nào."
            style={{
              padding: "clamp(30px, 8vw, 60px) 10px",
            }}
          />
        )}

        {/* ===================================================
            STUDENTS
        =================================================== */}

        {!loadingAttendance && students.length > 0 && (
          <div>
            {filteredStudents.length === 0 ? (
              <Empty
                description="Không tìm thấy học viên phù hợp"
                style={{
                  padding: 40,
                }}
              />
            ) : (
              <>
                {/* PAGINATION INFO */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 13,
                    }}
                  >
                    Hiển thị{" "}
                    <Text strong>
                      {paginationInfo.start}–{paginationInfo.end}
                    </Text>{" "}
                    trong tổng số <Text strong>{paginationInfo.total}</Text> học
                    viên
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 13,
                    }}
                  >
                    Trang {safeCurrentPage} / {totalPages}
                  </Text>
                </div>

                {/* =========================================
                      STUDENT ROWS
                  ========================================= */}

                {paginatedStudents.map((student, index) => {
                  const currentStatus = student.status;

                  const config = currentStatus
                    ? STATUS_CONFIG[currentStatus]
                    : null;

                  const rowNumber =
                    (safeCurrentPage - 1) * safePageSize + index + 1;

                  return (
                    <div
                      key={student.student_id}
                      style={{
                        display: "flex",

                        alignItems: "stretch",

                        justifyContent: "space-between",

                        flexWrap: "wrap",

                        gap: "clamp(12px, 3vw, 16px)",

                        padding: "clamp(12px, 3vw, 18px)",

                        borderRadius: 16,

                        marginBottom: 12,

                        background: config ? config.bg : "#FFFFFF",

                        border: `1px solid ${
                          config ? config.border : COLORS.border
                        }`,

                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",

                        transition: "all 0.2s ease",

                        width: "100%",

                        boxSizing: "border-box",
                      }}
                    >
                      {/* =================================
                              STUDENT INFO
                          ================================= */}

                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: "clamp(8px, 2vw, 14px)",

                          minWidth: 0,

                          flex: "1 1 280px",
                        }}
                      >
                        {/* NUMBER */}

                        <div
                          style={{
                            width: 28,
                            height: 28,
                            minWidth: 28,
                            borderRadius: 8,

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            fontSize: 12,

                            fontWeight: 700,

                            color: "#64748B",

                            background: "#F1F5F9",

                            flexShrink: 0,
                          }}
                        >
                          {rowNumber}
                        </div>

                        {/* AVATAR */}

                        <Avatar
                          size={"clamp(38px, 10vw, 42px)"}
                          style={{
                            background: config ? config.color : "#94A3B8",

                            color: "#FFFFFF",

                            fontWeight: 700,

                            flexShrink: 0,
                          }}
                        >
                          {(student.student_name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        {/* INFORMATION */}

                        <div
                          style={{
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {/* NAME */}

                          <div
                            style={{
                              display: "flex",

                              alignItems: "center",

                              flexWrap: "wrap",

                              gap: 4,

                              minWidth: 0,
                            }}
                          >
                            <Text
                              strong
                              style={{
                                fontSize: "clamp(13px, 3.5vw, 15px)",

                                color: COLORS.textDark,

                                lineHeight: 1.4,

                                wordBreak: "break-word",

                                overflowWrap: "anywhere",
                              }}
                            >
                              {student.student_name}
                            </Text>

                            <Tooltip title="Xem lịch sử chuyên cần">
                              <AppButton
                                type="text"
                                size="small"
                                icon={
                                  <EyeOutlined
                                    style={{
                                      color: "#3B82F6",
                                    }}
                                  />
                                }
                                onClick={() => handleViewStudent(student)}
                                style={{
                                  padding: "0 4px",

                                  height: 26,

                                  flexShrink: 0,
                                }}
                              />
                            </Tooltip>
                          </div>

                          {/* CODE */}

                          <div
                            style={{
                              display: "flex",

                              alignItems: "center",

                              flexWrap: "wrap",

                              gap: 6,

                              marginTop: 2,
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                              }}
                            >
                              {student.code || `ID: ${student.student_id}`}
                            </Text>

                            {student.attendance_id && (
                              <Tag
                                color="success"
                                style={{
                                  margin: 0,
                                  fontSize: 11,
                                  borderRadius: 6,
                                }}
                              >
                                Đã điểm danh
                              </Tag>
                            )}
                          </div>

                          {/* CHECK IN */}

                          {student.check_in_time && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 11,
                                display: "block",
                                marginTop: 2,
                              }}
                            >
                              🕐 {student.check_in_time}
                            </Text>
                          )}
                        </div>
                      </div>

                      {/* =================================
                              ACTIONS
                          ================================= */}

                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          justifyContent: "flex-end",

                          flexWrap: "wrap",

                          gap: 8,

                          flex: "1 1 420px",

                          minWidth: 0,
                        }}
                      >
                        {/* NOTE */}

                        <Input
                          placeholder="Ghi chú..."
                          value={student.note || ""}
                          disabled={attendanceLocked}
                          onChange={(e) =>
                            handleNoteChange(student.student_id, e.target.value)
                          }
                          style={{
                            width: "clamp(140px, 100%, 180px)",

                            flex: "1 1 140px",

                            minWidth: 0,

                            borderRadius: 10,

                            background: "#FFFFFF",
                          }}
                        />

                        {/* STATUS */}

                        <div
                          style={{
                            display: "flex",

                            alignItems: "center",

                            flexWrap: "wrap",

                            gap: 4,

                            maxWidth: "100%",
                          }}
                        >
                          {STATUS_LIST.map((st) => {
                            const isSelected = currentStatus === st;

                            const stCfg = STATUS_CONFIG[st];

                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={attendanceLocked}
                                onClick={() =>
                                  handleStatusChange(student.student_id, st)
                                }
                                style={{
                                  padding: "6px 9px",

                                  minHeight: 34,

                                  borderRadius: 10,

                                  border: `1px solid ${
                                    isSelected ? stCfg.color : "#CBD5E1"
                                  }`,

                                  background: isSelected
                                    ? stCfg.color
                                    : "#FFFFFF",

                                  color: isSelected ? "#FFFFFF" : "#64748B",

                                  fontSize: "clamp(11px, 2.8vw, 13px)",

                                  fontWeight: isSelected ? 700 : 500,

                                  cursor: attendanceLocked
                                    ? "not-allowed"
                                    : "pointer",

                                  display: "flex",

                                  alignItems: "center",

                                  justifyContent: "center",

                                  gap: 4,

                                  opacity:
                                    attendanceLocked && !isSelected ? 0.6 : 1,

                                  transition: "all 0.15s ease",

                                  whiteSpace: "nowrap",
                                }}
                              >
                                {stCfg.icon}

                                <span>{stCfg.short}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* =========================================
                      PAGINATION
                  ========================================= */}

                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 20,
                    borderTop: `1px solid ${COLORS.border}`,

                    width: "100%",

                    overflowX: "auto",
                  }}
                >
                  <TablePagination
                    current={safeCurrentPage}
                    pageSize={safePageSize}
                    total={filteredStudents.length}
                    onChange={(page, size) => {
                      const nextPage = Number(page) || 1;

                      const nextSize = Number(size) || 10;

                      if (nextSize !== safePageSize) {
                        setPageSize(nextSize);

                        setCurrentPage(1);

                        return;
                      }

                      setCurrentPage(nextPage);
                    }}
                    showSizeChanger
                    pageSizeOptions={[10, 20, 50, 100]}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* =====================================================
          FLOATING BAR
      ===================================================== */}

      {students.length > 0 && !loadingAttendance && !attendanceLocked && (
        <div
          style={{
            position: "fixed",

            bottom: "clamp(10px, 3vw, 24px)",

            left: "clamp(8px, 3vw, 24px)",

            right: "clamp(8px, 3vw, 24px)",

            width: "auto",

            maxWidth: 600,

            margin: "0 auto",

            background: "rgba(255, 255, 255, 0.94)",

            backdropFilter: "blur(12px)",

            padding: "10px clamp(14px, 4vw, 24px)",

            borderRadius: "clamp(16px, 4vw, 24px)",

            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",

            border: "1px solid rgba(255, 255, 255, 0.8)",

            display: "flex",

            justifyContent: "center",

            alignItems: "center",

            zIndex: 99,

            boxSizing: "border-box",
          }}
        >
          <Text
            style={{
              fontSize: "clamp(11px, 3vw, 13px)",

              color: COLORS.textDark,

              textAlign: "center",

              lineHeight: 1.5,
            }}
          >
            Đã điểm danh: <strong>{statistics.attended}</strong> /{" "}
            {statistics.total} bạn
          </Text>
        </div>
      )}

      {/* =====================================================
          STUDENT HISTORY MODAL
      ===================================================== */}

      <Modal
        title={
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 8,

              minWidth: 0,

              paddingRight: 20,
            }}
          >
            <UserOutlined
              style={{
                color: "#3B82F6",
                flexShrink: 0,
              }}
            />

            <span
              style={{
                overflowWrap: "anywhere",

                wordBreak: "break-word",
              }}
            >
              Lịch sử chuyên cần: {selectedStudent?.student_name}
            </span>
          </div>
        }
        open={studentDetailOpen}
        onCancel={() => setStudentDetailOpen(false)}
        footer={null}
        width="min(650px, calc(100vw - 24px))"
        centered
      >
        {loadingStudentHistory ? (
          <div
            style={{
              textAlign: "center",

              padding: 40,
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* MONTHLY STATS */}

            <Row
              gutter={[
                { xs: 8, sm: 12 },
                { xs: 12, sm: 12 },
              ]}
              style={{
                marginBottom: 20,
              }}
            >
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tổng số buổi"
                  value={monthlyStudentStatistics.total}
                  valueStyle={{
                    fontSize: "clamp(20px, 6vw, 28px)",
                  }}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Có mặt"
                  value={monthlyStudentStatistics.present}
                  valueStyle={{
                    color: "#15803D",
                    fontSize: "clamp(20px, 6vw, 28px)",
                  }}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Muộn"
                  value={monthlyStudentStatistics.late}
                  valueStyle={{
                    color: "#B45309",
                    fontSize: "clamp(20px, 6vw, 28px)",
                  }}
                />
              </Col>

              <Col xs={12} sm={6}>
                <Statistic
                  title="Vắng"
                  value={monthlyStudentStatistics.absent}
                  valueStyle={{
                    color: "#DC2626",
                    fontSize: "clamp(20px, 6vw, 28px)",
                  }}
                />
              </Col>
            </Row>

            <Divider
              style={{
                margin: "12px 0",
              }}
            />

            {/* HISTORY */}

            {monthlyHistory.length === 0 ? (
              <Empty
                description="Không có lịch sử điểm danh trong tháng này"
                style={{
                  padding: 30,
                }}
              />
            ) : (
              <div
                style={{
                  maxHeight: 350,

                  overflowY: "auto",

                  paddingRight: 4,
                }}
              >
                {monthlyHistory.map((item, idx) => {
                  const cfg = STATUS_CONFIG[item.status] || {};

                  return (
                    <div
                      key={item.id || item.attendance_id || idx}
                      style={{
                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        flexWrap: "wrap",

                        gap: 8,

                        padding: "10px 14px",

                        marginBottom: 8,

                        borderRadius: 12,

                        background: cfg.bg || "#F8FAFC",

                        border: `1px solid ${cfg.border || "#E2E8F0"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems: "center",

                          gap: 8,

                          minWidth: 0,
                        }}
                      >
                        <CalendarOutlined
                          style={{
                            color: "#64748B",
                            flexShrink: 0,
                          }}
                        />

                        <Text
                          strong
                          style={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dayjs(item.attendance_date).format("DD/MM/YYYY")}
                        </Text>
                      </div>

                      <Tag
                        style={{
                          color: cfg.color || "#64748B",

                          margin: 0,
                        }}
                      >
                        {cfg.label || item.status}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* =====================================================
          QR SCANNER
      ===================================================== */}

      <QRCodeScanner
        open={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        classId={selectedClassId}
        onSuccess={handleQRSuccess}
        onFinishAttendance={handleFinishQRScan}
      />
    </div>
  );
};

export default AttendancePage;
