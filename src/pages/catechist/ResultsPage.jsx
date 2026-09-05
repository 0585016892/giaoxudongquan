import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Table,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Input,
  Select,
  Row,
  Col,
  Pagination,
  message,
  Tooltip,
  Form,
  Popconfirm,
  Empty,
  Divider,
  Skeleton,
  Badge,
  Progress,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  DesktopOutlined,
  FormOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import AppFormModal from "../../components/common/AppFormModal";
import ResultForm from "../../components/forms/ResultForm";

import {
  getResults,
  getResultStatistics,
  getResultsByStudent,
  getStudentStatistics,
  createResult,
  updateResult,
  deleteResult,
} from "../../api/resultApi";

import studentApi from "../../api/studentApi";
import classApi from "../../api/classApi";

import AppDetailModal from "../../components/common/AppDetailModal";
import StatCard from "../../components/common/StatCard";
import PageHeroHeader from "../../components/common/PageHeroHeader";

const { Text } = Typography;

const primaryNavy = "#1B365D";

// =========================================================
// COLORS
// =========================================================

const COLORS = {
  primary: "#4F46E5",
  primaryDark: "#4338CA",
  primaryLight: "#EEF2FF",

  green: "#16A34A",
  greenLight: "#F0FDF4",

  orange: "#D97706",
  orangeLight: "#FFFBEB",

  red: "#DC2626",
  redLight: "#FEF2F2",

  blue: "#2563EB",
  blueLight: "#EFF6FF",

  text: "#0F172A",
  textSecondary: "#64748B",
  border: "#E2E8F0",
  background: "#F8FAFC",
  white: "#FFFFFF",
};

// =========================================================
// HELPERS
// =========================================================

const getStudentName = (record, studentsMap) => {
  const student = studentsMap.get(Number(record?.student_id));

  return (
    record?.student_name ||
    record?.studentName ||
    student?.name ||
    student?.full_name ||
    `Học viên #${record?.student_id || ""}`
  );
};

const getScoreStatus = (score) => {
  const value = Number(score || 0);

  if (value >= 8) {
    return {
      label: "Tốt",
      color: COLORS.green,
      background: COLORS.greenLight,
    };
  }

  if (value >= 5) {
    return {
      label: "Đạt",
      color: COLORS.orange,
      background: COLORS.orangeLight,
    };
  }

  return {
    label: "Chưa đạt",
    color: COLORS.red,
    background: COLORS.redLight,
  };
};

// =========================================================
// SCORE DISPLAY
// =========================================================

const ScoreDisplay = ({ score, large = false }) => {
  const value =
    score === null || score === undefined || score === "" ? 0 : Number(score);

  const status = getScoreStatus(value);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: large ? 12 : 8,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          minWidth: large ? 58 : 48,
          height: large ? 42 : 34,
          padding: "0 10px",
          borderRadius: 10,
          background: status.background,
          color: status.color,
          border: `1px solid ${status.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: large ? 18 : 14,
          fontWeight: 800,
          boxSizing: "border-box",
        }}
      >
        {value.toFixed(1)}
      </div>

      {large && (
        <Tag
          bordered={false}
          style={{
            margin: 0,
            borderRadius: 6,
            color: status.color,
            background: status.background,
            fontWeight: 600,
          }}
        >
          {status.label}
        </Tag>
      )}
    </div>
  );
};

// =========================================================
// MAIN
// =========================================================

const ResultsPage = () => {
  // =======================================================
  // LOADING
  // =======================================================

  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [teacherClassesLoading, setTeacherClassesLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // =======================================================
  // DATA
  // =======================================================

  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // =======================================================
  // TEACHER CLASSES
  // =======================================================

  const [teacherClasses, setTeacherClasses] = useState([]);

  // =======================================================
  // FILTER
  // =======================================================

  const [searchText, setSearchText] = useState("");

  // Không cho mặc định all nếu giáo viên có nhiều lớp.
  // Ban đầu chưa chọn lớp.
  const [classId, setClassId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // =======================================================
  // DETAIL
  // =======================================================

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentResults, setStudentResults] = useState([]);
  const [studentStats, setStudentStats] = useState(null);

  // =======================================================
  // FORM
  // =======================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);

  const [form] = Form.useForm();

  // =======================================================
  // LOAD TEACHER CLASSES
  // =======================================================

  const loadTeacherClasses = useCallback(async () => {
    try {
      setTeacherClassesLoading(true);

      const response = await classApi.getClassTeacher();

      const resData = response?.data || response;

      if (resData?.success === false) {
        setTeacherClasses([]);

        message.error(
          resData?.message || "Không thể lấy danh sách lớp giáo viên quản lý",
        );

        return [];
      }

      const rawList = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      const list = rawList
        .filter((item) => item?.id !== undefined && item?.id !== null)
        .map((item) => ({
          ...item,
          id: Number(item.id),
          name:
            item.name || item.class_name || item.className || `Lớp #${item.id}`,
        }));

      setTeacherClasses(list);

      /*
       * Nếu đang chọn một lớp nhưng lớp đó không còn
       * thuộc giáo viên thì reset.
       */
      if (
        classId &&
        !list.some((item) => String(item.id) === String(classId))
      ) {
        setClassId(null);
      }

      /*
       * Nếu chỉ có 1 lớp → tự chọn.
       */
      if (list.length === 1) {
        setClassId(String(list[0].id));
      }

      return list;
    } catch (error) {
      console.error("GET TEACHER CLASSES ERROR:", error);

      setTeacherClasses([]);

      message.error(
        error?.response?.data?.message ||
          "Không thể lấy danh sách lớp giáo viên quản lý",
      );

      return [];
    } finally {
      setTeacherClassesLoading(false);
    }
  }, [classId]);

  // =======================================================
  // LOAD RESULTS
  // =======================================================

  const loadResults = useCallback(async (selectedClassId) => {
    try {
      setLoading(true);

      /*
       * Chưa chọn lớp thì không lấy bảng điểm.
       */
      if (!selectedClassId) {
        setResults([]);
        return;
      }

      const response = await getResults({
        class_id: selectedClassId,
      });

      const resData = response?.data || response;

      if (resData?.success === false) {
        setResults([]);

        message.error(resData?.message || "Không thể lấy bảng điểm");

        return;
      }

      const data = Array.isArray(resData?.data)
        ? resData.data
        : Array.isArray(resData)
          ? resData
          : [];

      setResults(data);
    } catch (error) {
      console.error("GET RESULTS ERROR:", error);

      setResults([]);

      message.error(
        error?.response?.data?.message ||
          "Không thể kết nối đến máy chủ khi tải bảng điểm",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD STUDENTS OF SELECTED CLASS
  // =======================================================

  const loadStudents = useCallback(async (selectedClassId) => {
    try {
      setStudentsLoading(true);

      /*
       * Chưa chọn lớp → không lấy học viên.
       */
      if (!selectedClassId) {
        setStudents([]);
        return;
      }

      /*
       * Nếu studentApi hỗ trợ class_id:
       *
       * GET /students?class_id=17
       */
      const response = await studentApi.getAll({
        class_id: selectedClassId,
      });

      const resData = response?.data || response;

      let list = [];

      if (Array.isArray(resData?.data?.data)) {
        list = resData.data.data;
      } else if (Array.isArray(resData?.data)) {
        list = resData.data;
      } else if (Array.isArray(resData)) {
        list = resData;
      }

      setStudents(list);
    } catch (error) {
      console.error("GET STUDENTS ERROR:", error);

      setStudents([]);

      message.error(
        error?.response?.data?.message ||
          "Không thể lấy danh sách học viên của lớp",
      );
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD STATISTICS
  // =======================================================

  const loadStatistics = useCallback(async (selectedClassId) => {
    try {
      setStatsLoading(true);

      /*
       * Nếu API statistics hỗ trợ class_id
       * thì truyền class_id.
       */
      const response = selectedClassId
        ? await getResultStatistics({
            class_id: selectedClassId,
          })
        : null;

      if (!response) {
        setStatistics(null);
        return;
      }

      const resData = response?.data || response;

      if (resData?.success === false) {
        setStatistics(null);
        return;
      }

      setStatistics(resData?.data || resData || null);
    } catch (error) {
      console.error("GET RESULT STATISTICS ERROR:", error);

      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // =======================================================
  // LOAD ALL
  // =======================================================

  const loadData = useCallback(
    async (selectedClassId) => {
      await Promise.all([
        loadResults(selectedClassId),
        loadStudents(selectedClassId),
        loadStatistics(selectedClassId),
      ]);
    },
    [loadResults, loadStudents, loadStatistics],
  );

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadTeacherClasses();
  }, [loadTeacherClasses]);

  // =======================================================
  // LOAD DATA WHEN CLASS CHANGES
  // =======================================================

  useEffect(() => {
    setCurrentPage(1);
    setSearchText("");

    loadData(classId);
  }, [classId, loadData]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = useCallback(async () => {
    const classes = await loadTeacherClasses();

    /*
     * Sau khi refresh:
     * - nếu đang có classId → tải lại lớp đó
     * - nếu chưa có mà chỉ có 1 lớp → loadData sẽ chạy
     *   theo effect khi classId thay đổi
     */
    if (
      classId &&
      classes.some((item) => String(item.id) === String(classId))
    ) {
      await loadData(classId);
    }
  }, [classId, loadTeacherClasses, loadData]);

  // =======================================================
  // STUDENT MAP
  // =======================================================

  const studentsMap = useMemo(() => {
    const map = new Map();

    students.forEach((student) => {
      map.set(Number(student.id), student);
    });

    return map;
  }, [students]);

  // =======================================================
  // CLASS LIST
  // =======================================================

  const classList = useMemo(() => {
    return [...teacherClasses].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "vi"),
    );
  }, [teacherClasses]);

  // =======================================================
  // SELECTED CLASS
  // =======================================================

  const selectedClass = useMemo(() => {
    return classList.find((item) => String(item.id) === String(classId));
  }, [classList, classId]);

  // =======================================================
  // FILTER RESULTS
  // =======================================================

  const filteredResults = useMemo(() => {
    let data = [...results];

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();

      data = data.filter((item) => {
        const student = studentsMap.get(Number(item.student_id));

        const studentName = getStudentName(item, studentsMap).toLowerCase();

        const studentId = String(
          item.student_id || student?.id || "",
        ).toLowerCase();

        const className = String(
          item.class_name || item.className || "",
        ).toLowerCase();

        const guardianName = String(student?.guardian_name || "").toLowerCase();

        return (
          studentName.includes(keyword) ||
          studentId.includes(keyword) ||
          className.includes(keyword) ||
          guardianName.includes(keyword)
        );
      });
    }

    /*
     * Thêm lớp filter ở frontend để chắc chắn
     * bảng đang hiển thị đúng lớp được chọn.
     */
    if (classId) {
      data = data.filter((item) => String(item.class_id) === String(classId));
    }

    return data;
  }, [results, searchText, classId, studentsMap]);

  // =======================================================
  // PAGINATION
  // =======================================================

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  // =======================================================
  // DETAIL
  // =======================================================

  const fetchStudentDetailsData = useCallback(
    async (studentId) => {
      if (!studentId) return;

      try {
        setDetailLoading(true);

        const [resultsResponse, statsResponse] = await Promise.allSettled([
          getResultsByStudent(studentId),
          getStudentStatistics(studentId),
        ]);

        if (resultsResponse.status === "fulfilled") {
          const resData = resultsResponse.value?.data || resultsResponse.value;

          const list = Array.isArray(resData?.data)
            ? resData.data
            : Array.isArray(resData)
              ? resData
              : [];

          /*
           * Chỉ hiển thị kết quả thuộc lớp
           * đang được chọn.
           */
          const classResults = classId
            ? list.filter((item) => String(item.class_id) === String(classId))
            : list;

          setStudentResults(classResults);
        } else {
          setStudentResults([]);
        }

        if (statsResponse.status === "fulfilled") {
          const resData = statsResponse.value?.data || statsResponse.value;

          setStudentStats(resData?.data || resData || null);
        } else {
          setStudentStats(null);
        }
      } catch (error) {
        console.error("GET STUDENT DETAIL ERROR:", error);

        message.error("Không thể lấy chi tiết điểm của học viên");
      } finally {
        setDetailLoading(false);
      }
    },
    [classId],
  );

  // =======================================================
  // VIEW DETAIL
  // =======================================================

  const handleViewDetail = useCallback(
    (record) => {
      const student = studentsMap.get(Number(record.student_id)) || {
        id: record.student_id,
        name:
          record.student_name ||
          record.studentName ||
          `Học viên #${record.student_id}`,
      };

      setSelectedStudent(student);

      setDetailModalOpen(true);

      fetchStudentDetailsData(record.student_id);
    },
    [studentsMap, fetchStudentDetailsData],
  );

  // =======================================================
  // CREATE
  // =======================================================

  const handleCreate = () => {
    if (!classId) {
      message.warning("Vui lòng chọn lớp trước khi nhập điểm");

      return;
    }

    if (!students.length) {
      message.warning("Lớp này chưa có học viên");

      return;
    }

    setEditingResult(null);

    form.resetFields();

    form.setFieldsValue({
      exam_type: "paper",
      exam_date: dayjs(),
      score: undefined,
      note: "",
    });

    setModalOpen(true);
  };

  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (record) => {
    /*
     * Không cho sửa điểm ngoài lớp hiện tại.
     */
    if (classId && String(record.class_id) !== String(classId)) {
      message.error("Học viên không thuộc lớp đang chọn");

      return;
    }

    setEditingResult(record);

    form.setFieldsValue({
      student_id: record.student_id,

      score:
        record.score !== undefined && record.score !== null
          ? Number(record.score)
          : undefined,

      exam_type: record.exam_type || "paper",

      exam_date: record.exam_date ? dayjs(record.exam_date) : null,

      note: record.note || "",
    });

    setModalOpen(true);
  };

  // =======================================================
  // CLOSE FORM
  // =======================================================

  const handleCloseForm = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingResult(null);

    form.resetFields();
  };

  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!classId) {
        message.error("Vui lòng chọn lớp");

        return;
      }

      /*
       * Kiểm tra học viên có thuộc danh sách
       * của lớp hiện tại hay không.
       */
      const selectedStudentId = Number(values.student_id);

      const validStudent = students.some(
        (student) => Number(student.id) === selectedStudentId,
      );

      if (!validStudent) {
        message.error("Học viên không thuộc lớp đang chọn");

        return;
      }

      setSubmitting(true);

      const payload = {
        student_id: selectedStudentId,

        /*
         * Gửi class_id để backend có thể
         * kiểm tra quyền.
         */
        class_id: Number(classId),

        score: Number(values.score),

        exam_type: values.exam_type || "paper",

        exam_date: values.exam_date
          ? values.exam_date.format("YYYY-MM-DD")
          : null,

        note: values.note ? values.note.trim() : null,
      };

      let response;

      if (editingResult) {
        response = await updateResult(editingResult.id, payload);
      } else {
        response = await createResult(payload);
      }

      const resData = response?.data || response;

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể lưu kết quả");

        return;
      }

      message.success(
        editingResult ? "Cập nhật điểm thành công" : "Nhập điểm thành công",
      );

      setModalOpen(false);
      setEditingResult(null);

      form.resetFields();

      await loadData(classId);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("SAVE RESULT ERROR:", error);

      message.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi lưu điểm",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setDeletingId(id);

      const response = await deleteResult(id);

      const resData = response?.data || response;

      if (resData?.success === false) {
        message.error(resData?.message || "Không thể xóa điểm");

        return;
      }

      message.success("Xóa điểm thành công");

      await loadData(classId);

      if (detailModalOpen && selectedStudent?.id) {
        await fetchStudentDetailsData(selectedStudent.id);
      }
    } catch (error) {
      console.error("DELETE RESULT ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể xóa điểm");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // TABLE COLUMNS
  // =======================================================

  const columns = [
    {
      title: "#",
      width: 60,
      align: "center",

      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },

    {
      title: "Học viên",
      key: "student",
      width: 290,

      render: (_, record) => {
        const student = studentsMap.get(Number(record.student_id));

        const name = getStudentName(record, studentsMap);

        const guardian = student?.guardian_name;

        return (
          <div className="result-student-cell">
            <Avatar size={44} className="result-student-avatar">
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <div className="result-student-info">
              <Text
                strong
                ellipsis
                style={{
                  display: "block",
                  maxWidth: 210,
                  color: COLORS.text,
                  fontSize: 14,
                }}
              >
                {name}
              </Text>

              <div className="result-student-meta">
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                  }}
                >
                  #{record.student_id}
                </Text>

                {guardian && (
                  <>
                    <Text
                      type="secondary"
                      style={{
                        margin: "0 5px",
                        fontSize: 10,
                      }}
                    >
                      •
                    </Text>

                    <Text
                      type="secondary"
                      ellipsis
                      style={{
                        maxWidth: 130,
                        fontSize: 11,
                      }}
                    >
                      {guardian}
                    </Text>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      },
    },

    {
      title: "Bài kiểm tra",
      dataIndex: "total_results",
      key: "total_results",
      width: 120,
      align: "center",

      render: (value) => (
        <div className="result-count-cell">
          <div className="result-count-icon">
            <BookOutlined />
          </div>

          <Text strong>{Number(value) || 0}</Text>
        </div>
      ),
    },

    {
      title: "Điểm trung bình",
      dataIndex: "average_score",
      key: "average_score",
      width: 190,

      sorter: (a, b) =>
        Number(a.average_score || 0) - Number(b.average_score || 0),

      render: (score) => {
        const value = Number(score || 0);

        const status = getScoreStatus(value);

        return (
          <div className="result-score-progress">
            <div className="result-score-header">
              <Text
                strong
                style={{
                  color: status.color,
                }}
              >
                {value.toFixed(1)}
              </Text>

              <Text
                type="secondary"
                style={{
                  fontSize: 11,
                }}
              >
                / 10
              </Text>
            </div>

            <Progress
              percent={Math.min(value * 10, 100)}
              showInfo={false}
              strokeWidth={6}
              strokeColor={status.color}
              trailColor="#E2E8F0"
            />
          </div>
        );
      },
    },

    {
      title: "Kết quả",
      key: "status",
      width: 120,
      align: "center",

      render: (_, record) => {
        const status = getScoreStatus(record.average_score);

        return (
          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 7,
              padding: "5px 10px",
              color: status.color,
              background: status.background,
              fontWeight: 700,
            }}
          >
            {status.label}
          </Tag>
        );
      },
    },

    {
      title: "Gần nhất",
      dataIndex: "latest_exam_date",
      key: "latest_exam_date",
      width: 145,

      render: (date) =>
        date ? (
          <Space size={6}>
            <CalendarOutlined
              style={{
                color: COLORS.textSecondary,
              }}
            />

            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
              }}
            >
              {dayjs(date).format("DD/MM/YYYY")}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },

    {
      title: "",
      key: "action",
      width: 75,
      fixed: "right",
      align: "center",

      render: (_, record) => (
        <Tooltip title="Xem bảng điểm">
          <Button
            type="text"
            shape="circle"
            icon={
              <EyeOutlined
                style={{
                  color: COLORS.primary,
                  fontSize: 18,
                }}
              />
            }
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // =======================================================
  // DETAIL COLUMNS
  // =======================================================

  const detailColumns = [
    {
      title: "#",
      width: 50,
      align: "center",

      render: (_, __, index) => index + 1,
    },

    {
      title: "Ngày kiểm tra",
      dataIndex: "exam_date",
      width: 145,

      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },

    {
      title: "Hình thức",
      dataIndex: "exam_type",
      width: 150,

      render: (type) =>
        type === "online" ? (
          <Tag
            icon={<DesktopOutlined />}
            color="blue"
            style={{
              borderRadius: 7,
              padding: "4px 9px",
            }}
          >
            Online
          </Tag>
        ) : (
          <Tag
            icon={<FormOutlined />}
            color="orange"
            style={{
              borderRadius: 7,
              padding: "4px 9px",
            }}
          >
            Bài giấy
          </Tag>
        ),
    },

    {
      title: "Điểm",
      dataIndex: "score",
      width: 120,

      render: (score) => <ScoreDisplay score={score} />,
    },

    {
      title: "Ghi chú",
      dataIndex: "note",
      ellipsis: true,

      render: (note) =>
        note ? (
          <Text>{note}</Text>
        ) : (
          <Text type="secondary" italic>
            Không có ghi chú
          </Text>
        ),
    },

    {
      title: "",
      width: 100,
      align: "right",

      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined
                  style={{
                    color: COLORS.primary,
                  }}
                />
              }
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa điểm này?"
            description="Kết quả sẽ bị xóa khỏi hệ thống."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              loading: deletingId === record.id,
            }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="results-page">
      {/* ===================================================
          HEADER
      ==================================================== */}

      <PageHeroHeader
        icon={<TrophyOutlined />}
        badgeText="🌸 QUẢN LÝ ĐIỂM SỐ"
        title="Bảng điểm học viên"
        description={
          selectedClass
            ? `Quản lý kết quả học tập — ${selectedClass.name}`
            : "Chọn lớp để xem bảng điểm học viên"
        }
        onRefresh={handleRefresh}
        refreshLoading={
          loading || studentsLoading || statsLoading || teacherClassesLoading
        }
        primaryButtonText="Nhập điểm"
        primaryButtonIcon={<PlusOutlined />}
        onPrimaryClick={handleCreate}
      />

      {/* ===================================================
          CLASS SELECT
      ==================================================== */}

      <Card
        bordered={false}
        className="results-class-card"
        bodyStyle={{
          padding: 18,
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={14} lg={10}>
            <div>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 7,
                  color: COLORS.text,
                }}
              >
                <TeamOutlined
                  style={{
                    marginRight: 7,
                    color: COLORS.primary,
                  }}
                />
                Lớp đang quản lý
              </Text>

              <Select
                value={classId ? String(classId) : undefined}
                onChange={(value) => {
                  setClassId(value);
                  setCurrentPage(1);
                  setSearchText("");
                }}
                loading={teacherClassesLoading}
                disabled={teacherClassesLoading || classList.length === 0}
                style={{
                  width: "100%",
                  height: 44,
                }}
                placeholder={
                  teacherClassesLoading
                    ? "Đang tải lớp..."
                    : "Chọn lớp giáo viên quản lý"
                }
                options={classList.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
              />
            </div>
          </Col>

          <Col xs={24} md={10} lg={14}>
            <div className="selected-class-info">
              {selectedClass ? (
                <>
                  <div className="selected-class-icon">
                    <TeamOutlined />
                  </div>

                  <div>
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        fontSize: 11,
                      }}
                    >
                      ĐANG XEM
                    </Text>

                    <Text
                      strong
                      style={{
                        color: COLORS.text,
                        fontSize: 15,
                      }}
                    >
                      {selectedClass.name}
                    </Text>
                  </div>

                  <Tag
                    bordered={false}
                    style={{
                      marginLeft: "auto",
                      borderRadius: 7,
                      background: COLORS.primaryLight,
                      color: COLORS.primary,
                      fontWeight: 600,
                    }}
                  >
                    {results.length} học viên có điểm
                  </Tag>
                </>
              ) : (
                <>
                  <TeamOutlined
                    style={{
                      fontSize: 24,
                      color: COLORS.textSecondary,
                    }}
                  />

                  <Text type="secondary">
                    Vui lòng chọn một lớp để xem danh sách học viên và bảng điểm
                  </Text>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ===================================================
          KPI
      ==================================================== */}

      <Row gutter={[16, 16]} className="results-kpi-row">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng bài kiểm tra"
            value={Number(statistics?.total_results || 0)}
            loading={statsLoading}
            icon={<FileTextOutlined />}
            iconColor={primaryNavy}
            description={selectedClass ? selectedClass.name : "Chọn lớp"}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Điểm trung bình"
            value={Number(statistics?.average_score || 0).toFixed(2)}
            loading={statsLoading}
            icon={<RiseOutlined />}
            iconColor={COLORS.green}
            description="Mức điểm trung bình"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Điểm cao nhất"
            value={Number(statistics?.highest_score || 0).toFixed(1)}
            loading={statsLoading}
            icon={<TrophyOutlined />}
            iconColor={COLORS.orange}
            description="Thành tích cao nhất"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Kết quả"
            value={
              <>
                <span
                  style={{
                    color: COLORS.green,
                  }}
                >
                  {statistics?.passed ?? 0}
                </span>

                <span
                  style={{
                    margin: "0 5px",
                    color: COLORS.border,
                  }}
                >
                  /
                </span>

                <span
                  style={{
                    color: COLORS.red,
                  }}
                >
                  {statistics?.failed ?? 0}
                </span>
              </>
            }
            loading={statsLoading}
            icon={<CheckCircleOutlined />}
            iconColor={COLORS.green}
            description="Đạt / Chưa đạt"
          />
        </Col>
      </Row>

      {/* ===================================================
          FILTER
      ==================================================== */}

      {classId && (
        <Card
          bordered={false}
          className="results-filter-card"
          bodyStyle={{
            padding: 16,
          }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={14} lg={12}>
              <Input
                allowClear
                prefix={
                  <SearchOutlined
                    style={{
                      color: "#94A3B8",
                    }}
                  />
                }
                placeholder="Tìm tên, mã học viên hoặc phụ huynh..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: 42,
                  borderRadius: 10,
                }}
              />
            </Col>

            <Col xs={24} md={10} lg={12}>
              <div className="results-found">
                <TeamOutlined
                  style={{
                    color: COLORS.textSecondary,
                  }}
                />

                <Text
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: 13,
                  }}
                >
                  Lớp{" "}
                  <strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    {selectedClass?.name}
                  </strong>{" "}
                  — tìm thấy{" "}
                  <strong
                    style={{
                      color: COLORS.text,
                    }}
                  >
                    {filteredResults.length}
                  </strong>{" "}
                  học viên
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* ===================================================
          MAIN TABLE
      ==================================================== */}

      <Card
        bordered={false}
        className="results-main-card"
        bodyStyle={{
          padding: 0,
        }}
      >
        <div className="results-table-header">
          <div className="results-table-title">
            <Text
              strong
              style={{
                fontSize: 16,
                color: COLORS.text,
              }}
            >
              {selectedClass
                ? `Danh sách kết quả — ${selectedClass.name}`
                : "Danh sách kết quả"}
            </Text>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: 3,
                fontSize: 12,
              }}
            >
              {selectedClass
                ? "Chỉ hiển thị học viên thuộc lớp bạn đang quản lý"
                : "Chọn lớp để xem bảng điểm"}
            </Text>
          </div>

          <Tag
            bordered={false}
            style={{
              margin: 0,
              borderRadius: 7,
              background: COLORS.primaryLight,
              color: COLORS.primary,
              fontWeight: 600,
            }}
          >
            {filteredResults.length} học viên
          </Tag>
        </div>

        {!classId ? (
          <div className="results-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Vui lòng chọn lớp giáo viên đang quản lý"
            />
          </div>
        ) : loading ? (
          <div className="results-loading">
            <Skeleton
              active
              paragraph={{
                rows: 8,
              }}
            />
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="results-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                searchText
                  ? "Không tìm thấy học viên phù hợp"
                  : "Lớp chưa có dữ liệu bảng điểm"
              }
            >
              {searchText && (
                <Button
                  onClick={() => {
                    setSearchText("");
                    setCurrentPage(1);
                  }}
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </Empty>
          </div>
        ) : (
          <>
            <div className="results-table-wrapper">
              <Table
                rowKey={(record) => `${record.student_id}-${record.class_id}`}
                columns={columns}
                dataSource={paginatedResults}
                pagination={false}
                scroll={{
                  x: 1200,
                }}
                rowClassName={() => "result-table-row"}
              />
            </div>

            <Divider
              style={{
                margin: 0,
              }}
            />

            <div className="results-pagination">
              <Text type="secondary" className="results-pagination-text">
                Hiển thị <strong>{paginatedResults.length}</strong> /{" "}
                <strong>{filteredResults.length}</strong> học viên
              </Text>

              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredResults.length}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
                size="small"
                responsive
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} / ${total}`
                }
              />
            </div>
          </>
        )}
      </Card>

      {/* ===================================================
          DETAIL MODAL
      ==================================================== */}

      <AppDetailModal
        open={detailModalOpen}
        loading={detailLoading}
        width={940}
        title={
          selectedStudent?.name || selectedStudent?.full_name || "Học viên"
        }
        subtitle={`Mã học viên: #${selectedStudent?.id || ""}`}
        onCancel={() => setDetailModalOpen(false)}
        showEdit={false}
        showClose
        closeText="Đóng"
      >
        {detailLoading ? (
          <Skeleton
            active
            paragraph={{
              rows: 9,
            }}
          />
        ) : (
          <>
            <Row
              gutter={[12, 12]}
              style={{
                marginBottom: 22,
              }}
            >
              <Col xs={24} sm={8}>
                <div className="detail-stat-card">
                  <Text type="secondary" className="detail-stat-label">
                    TỔNG BÀI
                  </Text>

                  <div className="detail-stat-value">
                    <BookOutlined
                      style={{
                        color: COLORS.primary,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                      }}
                    >
                      {studentStats?.total_results ?? studentResults.length}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  className="detail-stat-card"
                  style={{
                    background: COLORS.greenLight,
                    borderColor: "#DCFCE7",
                  }}
                >
                  <Text
                    className="detail-stat-label"
                    style={{
                      color: COLORS.green,
                      fontWeight: 600,
                    }}
                  >
                    ĐIỂM TRUNG BÌNH
                  </Text>

                  <div className="detail-stat-value">
                    <RiseOutlined
                      style={{
                        color: COLORS.green,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                        color: COLORS.green,
                      }}
                    >
                      {Number(studentStats?.average_score || 0).toFixed(2)}
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8}>
                <div
                  className="detail-stat-card"
                  style={{
                    background: COLORS.orangeLight,
                    borderColor: "#FEF3C7",
                  }}
                >
                  <Text
                    className="detail-stat-label"
                    style={{
                      color: COLORS.orange,
                      fontWeight: 600,
                    }}
                  >
                    ĐIỂM CAO NHẤT
                  </Text>

                  <div className="detail-stat-value">
                    <TrophyOutlined
                      style={{
                        color: COLORS.orange,
                        fontSize: 20,
                      }}
                    />

                    <Text
                      strong
                      style={{
                        fontSize: 25,
                        color: COLORS.orange,
                      }}
                    >
                      {Number(studentStats?.highest_score || 0).toFixed(1)}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            <div className="detail-table-title">
              <div>
                <Text
                  strong
                  style={{
                    fontSize: 15,
                  }}
                >
                  Lịch sử kiểm tra
                </Text>

                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {selectedClass
                    ? `Kết quả của ${selectedClass.name}`
                    : "Chi tiết các bài kiểm tra"}
                </Text>
              </div>

              <Badge
                count={studentResults.length}
                showZero
                style={{
                  background: COLORS.primary,
                }}
              />
            </div>

            <div className="detail-table-wrapper">
              <Table
                rowKey="id"
                columns={detailColumns}
                dataSource={studentResults}
                pagination={false}
                size="middle"
                scroll={{
                  x: 700,
                }}
                locale={{
                  emptyText: "Học viên chưa có điểm kiểm tra trong lớp này",
                }}
              />
            </div>
          </>
        )}
      </AppDetailModal>

      {/* ===================================================
          CREATE / EDIT
      ==================================================== */}

      <AppFormModal
        open={modalOpen}
        loading={submitting}
        editing={!!editingResult}
        form={form}
        width={520}
        createTitle="Nhập điểm kiểm tra"
        editTitle="Cập nhật kết quả"
        subtitle={
          editingResult
            ? `Chỉnh sửa kết quả #${editingResult.id}`
            : `Thêm kết quả — ${selectedClass?.name || ""}`
        }
        icon={<FormOutlined />}
        createText="Thêm điểm"
        editText="Lưu thay đổi"
        onCancel={handleCloseForm}
      >
        <ResultForm
          form={form}
          students={students}
          studentsLoading={studentsLoading}
          editingResult={editingResult}
          submitting={submitting}
          onFinish={handleSubmit}
        />
      </AppFormModal>

      {/* ===================================================
          CSS
      ==================================================== */}

      <style>
        {`
          .results-page {
            min-height: 100vh;
            padding: clamp(14px, 3vw, 28px)
              clamp(12px, 3vw, 32px);
            background: #F8FAFC;
            overflow-x: hidden;
            box-sizing: border-box;
          }

          .results-class-card {
            border-radius: 16px;
            margin-bottom: 20px;
            box-shadow:
              0 2px 10px rgba(15, 23, 42, 0.04);
          }

          .results-kpi-row {
            margin-bottom: 24px;
          }

          .selected-class-info {
            min-height: 72px;
            padding: 12px 15px;
            border-radius: 12px;
            background: #F8FAFC;
            border: 1px solid ${COLORS.border};
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .selected-class-icon {
            width: 42px;
            height: 42px;
            border-radius: 11px;
            background: ${COLORS.primaryLight};
            color: ${COLORS.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 19px;
          }

          .results-filter-card {
            border-radius: 16px;
            margin-bottom: 16px;
            box-shadow:
              0 2px 10px rgba(15, 23, 42, 0.04);
          }

          .results-found {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            min-height: 42px;
          }

          .results-main-card {
            border-radius: 18px;
            overflow: hidden;
            box-shadow:
              0 2px 12px rgba(15, 23, 42, 0.04);
          }

          .results-table-header {
            padding: 18px 22px;
            border-bottom: 1px solid ${COLORS.border};
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .results-table-title {
            min-width: 0;
          }

          .results-loading {
            padding: 32px;
          }

          .results-empty {
            padding: 80px 24px;
            text-align: center;
          }

          .results-table-wrapper {
            width: 100%;
            overflow: hidden;
          }

          .result-student-cell {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }

          .result-student-avatar {
            flex-shrink: 0;
            background:
              linear-gradient(
                135deg,
                #6366F1,
                #4F46E5
              );
            font-weight: 800;
          }

          .result-student-info {
            min-width: 0;
            flex: 1;
          }

          .result-student-meta {
            display: flex;
            align-items: center;
            min-width: 0;
            margin-top: 3px;
          }

          .result-count-cell {
            display: inline-flex;
            align-items: center;
            gap: 7px;
          }

          .result-count-icon {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            background: ${COLORS.primaryLight};
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${COLORS.primary};
          }

          .result-score-progress {
            min-width: 150px;
          }

          .result-score-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .results-pagination {
            padding: 15px 22px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
          }

          .results-pagination-text {
            font-size: 12px;
          }

          .detail-stat-card {
            padding: 18px;
            border-radius: 14px;
            background: #F8FAFC;
            border: 1px solid ${COLORS.border};
          }

          .detail-stat-label {
            font-size: 12px;
          }

          .detail-stat-value {
            margin-top: 7px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .detail-table-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            gap: 10px;
          }

          .detail-table-wrapper {
            width: 100%;
            overflow: hidden;
          }

          .result-table-row:hover > td {
            background: #F8FAFC !important;
          }

          .ant-table-thead > tr > th {
            background: #F8FAFC !important;
            color: #64748B !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            border-bottom: 1px solid #E2E8F0 !important;
          }

          .ant-table-tbody > tr > td {
            border-bottom: 1px solid #F1F5F9 !important;
          }

          .ant-pagination-item {
            border-radius: 7px !important;
          }

          .ant-select-selector {
            border-radius: 10px !important;
          }

          .ant-input-affix-wrapper {
            border-radius: 10px !important;
          }

          .ant-input-number {
            border-radius: 9px !important;
          }

          .ant-picker {
            border-radius: 9px !important;
          }

          .ant-modal-content {
            border-radius: 18px !important;
            overflow: hidden;
          }

          .ant-modal-header {
            margin-bottom: 16px !important;
          }

          @media (max-width: 992px) {
            .results-page {
              padding-left: 20px;
              padding-right: 20px;
            }

            .results-found {
              justify-content: flex-start;
            }

            .selected-class-info {
              min-height: auto;
            }
          }

          @media (max-width: 768px) {
            .results-page {
              padding: 14px 12px 24px;
            }

            .results-kpi-row {
              margin-bottom: 16px;
            }

            .results-class-card {
              border-radius: 14px;
            }

            .results-filter-card {
              border-radius: 14px;
            }

            .results-main-card {
              border-radius: 14px;
            }

            .results-table-header {
              padding: 15px 16px;
              align-items: flex-start;
            }

            .results-table-title {
              flex: 1;
            }

            .results-loading {
              padding: 20px 16px;
            }

            .results-empty {
              padding: 55px 16px;
            }

            .results-pagination {
              padding: 14px 16px;
              flex-direction: column;
              align-items: flex-start;
            }

            .results-pagination .ant-pagination {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              justify-content: flex-start;
            }

            .result-student-cell {
              gap: 9px;
            }

            .result-student-avatar {
              width: 38px !important;
              height: 38px !important;
              line-height: 38px !important;
            }

            .result-score-progress {
              min-width: 130px;
            }

            .detail-stat-card {
              padding: 15px;
            }

            .detail-table-title {
              margin-bottom: 10px;
            }

            .ant-table {
              font-size: 12px;
            }

            .ant-table-thead > tr > th {
              font-size: 10px !important;
            }

            .ant-table-tbody > tr > td {
              padding: 10px 8px !important;
            }
          }

          @media (max-width: 480px) {
            .results-page {
              padding: 10px 8px 20px;
            }

            .results-class-card .ant-card-body {
              padding: 12px !important;
            }

            .results-filter-card {
              margin-bottom: 12px;
            }

            .results-filter-card .ant-card-body {
              padding: 12px !important;
            }

            .results-table-header {
              padding: 14px;
              flex-direction: column;
              align-items: stretch;
              gap: 10px;
            }

            .results-table-header .ant-tag {
              align-self: flex-start;
            }

            .results-found {
              justify-content: flex-start;
            }

            .results-pagination {
              padding: 13px 14px;
              gap: 12px;
            }

            .results-pagination-text {
              width: 100%;
            }

            .results-pagination .ant-pagination {
              width: 100%;
            }

            .results-pagination .ant-pagination-options {
              margin-inline-start: 0;
            }

            .selected-class-info {
              padding: 11px;
            }

            .detail-stat-card {
              padding: 14px;
              border-radius: 12px;
            }

            .detail-stat-value {
              margin-top: 5px;
            }

            .detail-table-title {
              align-items: flex-start;
            }

            .ant-modal {
              max-width: calc(100vw - 20px) !important;
              margin: 10px auto !important;
            }

            .ant-modal-content {
              border-radius: 14px !important;
            }
          }

          @media (max-width: 360px) {
            .results-page {
              padding-left: 6px;
              padding-right: 6px;
            }

            .results-table-header {
              padding: 12px;
            }

            .results-pagination {
              padding-left: 12px;
              padding-right: 12px;
            }

            .result-student-meta {
              display: block;
            }

            .result-student-meta > .ant-typography:nth-child(2) {
              display: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              scroll-behavior: auto !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ResultsPage;
