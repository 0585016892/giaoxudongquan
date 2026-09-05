import React, { useCallback, useEffect, useState } from "react";

import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CompassOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import studentApi from "../api/studentApi";

const { Title, Text, Paragraph } = Typography;

// =====================================================
// DESIGN TOKENS
// =====================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const bgGradient = "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)";
const cardShadow = "0 10px 30px rgba(27, 54, 93, 0.05)";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// =====================================================
// HELPERS
// =====================================================

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = dayjs(date);

  return parsedDate.isValid() ? parsedDate.format("DD/MM/YYYY") : date;
};

const getStatusTag = (status) => {
  switch (status) {
    case "studying":
      return (
        <Tag color="processing" icon={<ClockCircleOutlined />}>
          Đang học
        </Tag>
      );

    case "completed":
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Hoàn thành
        </Tag>
      );

    case "passed":
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Đạt
        </Tag>
      );

    case "failed":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Chưa đạt
        </Tag>
      );

    case "pending":
      return (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          Chờ kiểm tra
        </Tag>
      );

    case "promoted":
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Được lên lớp
        </Tag>
      );

    case "retained":
      return (
        <Tag color="error" icon={<CloseCircleOutlined />}>
          Ở lại lớp
        </Tag>
      );

    default:
      return <Tag>{status || "Không xác định"}</Tag>;
  }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const StudentsPage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  // ===================================================
  // STUDENTS DATA
  // ===================================================

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===================================================
  // SEARCH & FILTER
  // ===================================================

  const [search, setSearch] = useState("");
  const [filterSchoolYear, setFilterSchoolYear] = useState(undefined);

  const [filterPromotionStatus, setFilterPromotionStatus] = useState(undefined);

  // ===================================================
  // PAGINATION
  // ===================================================

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // ===================================================
  // DRAWER
  // ===================================================

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [detailLoading, setDetailLoading] = useState(false);

  // ===================================================
  // STUDENT MODAL
  // ===================================================

  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const [editingStudent, setEditingStudent] = useState(null);

  const [studentForm] = Form.useForm();

  // ===================================================
  // CLASS MODAL
  // ===================================================

  const [classModalOpen, setClassModalOpen] = useState(false);

  const [editingClass, setEditingClass] = useState(null);

  const [classForm] = Form.useForm();

  // ===================================================
  // EXAM MODAL
  // ===================================================

  const [examModalOpen, setExamModalOpen] = useState(false);

  const [editingExam, setEditingExam] = useState(null);

  const [examForm] = Form.useForm();

  // ===================================================
  // FETCH STUDENTS
  // ===================================================

  const fetchStudents = useCallback(
    async ({
      page = 1,
      pageSize = 20,
      keyword = "",
      schoolYear = undefined,
      promotionStatus = undefined,
    } = {}) => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: pageSize,
          search: keyword?.trim() || "",
        };

        if (schoolYear) {
          params.schoolYear = schoolYear;
        }

        if (promotionStatus) {
          params.promotionStatus = promotionStatus;
        }

        const result = await studentApi.getStudents(params);

        if (!result?.success) {
          throw new Error(
            result?.message || "Không thể tải danh sách học viên",
          );
        }

        setStudents(result.data || []);

        setPagination({
          current: result.pagination?.page || page,
          pageSize: result.pagination?.limit || pageSize,
          total: result.pagination?.total || 0,
        });
      } catch (error) {
        console.error("fetchStudents error:", error);

        messageApi.error(
          error.response?.data?.message ||
            error.message ||
            "Không thể tải danh sách học viên",
        );
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    fetchStudents({
      page: 1,
      pageSize: 20,
    });
  }, [fetchStudents]);

  // ===================================================
  // STUDENT DETAIL
  // ===================================================

  const openStudentDetail = async (id) => {
    try {
      setDrawerOpen(true);
      setDetailLoading(true);

      const result = await studentApi.getStudentById(id);

      if (!result?.success) {
        throw new Error(result?.message || "Không thể tải thông tin học viên");
      }

      setSelectedStudent(result.data);
    } catch (error) {
      console.error("openStudentDetail error:", error);

      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải thông tin học viên",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshDetail = async () => {
    if (!selectedStudent?.id) return;

    await openStudentDetail(selectedStudent.id);
  };

  // ===================================================
  // STUDENT ACTIONS
  // ===================================================

  const openCreateStudent = () => {
    setEditingStudent(null);

    studentForm.resetFields();

    setStudentModalOpen(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);

    studentForm.setFieldsValue({
      ...student,

      date_of_birth: student.date_of_birth
        ? dayjs(student.date_of_birth)
        : null,
    });

    setStudentModalOpen(true);
  };

  const submitStudent = async () => {
    try {
      const values = await studentForm.validateFields();

      const payload = {
        ...values,

        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,
      };

      // API TỰ SINH MÃ HỌC VIÊN
      // Khi thêm mới không gửi student_code
      if (!editingStudent) {
        delete payload.student_code;
      }

      if (editingStudent) {
        await studentApi.updateStudent(editingStudent.id, payload);

        messageApi.success("Cập nhật học viên thành công");
      } else {
        await studentApi.createStudent(payload);

        messageApi.success("Thêm học viên thành công");
      }

      setStudentModalOpen(false);

      await fetchStudents({
        page: editingStudent ? pagination.current : 1,

        pageSize: pagination.pageSize,

        keyword: search,

        schoolYear: filterSchoolYear,

        promotionStatus: filterPromotionStatus,
      });

      if (editingStudent?.id) {
        await openStudentDetail(editingStudent.id);
      }
    } catch (error) {
      if (error?.errorFields) return;

      console.error("submitStudent error:", error);

      messageApi.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể lưu học viên",
      );
    }
  };

  const deleteStudent = async (id) => {
    try {
      await studentApi.deleteStudent(id);

      messageApi.success("Đã xóa học viên");

      if (selectedStudent?.id === id) {
        setDrawerOpen(false);
        setSelectedStudent(null);
      }

      const newPage =
        students.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current;

      await fetchStudents({
        page: newPage,

        pageSize: pagination.pageSize,

        keyword: search,

        schoolYear: filterSchoolYear,

        promotionStatus: filterPromotionStatus,
      });
    } catch (error) {
      console.error("deleteStudent error:", error);

      messageApi.error(
        error.response?.data?.message || "Không thể xóa học viên",
      );
    }
  };

  // ===================================================
  // CLASS ACTIONS
  // ===================================================

  const openCreateClass = () => {
    if (!selectedStudent) return;

    setEditingClass(null);

    classForm.resetFields();

    classForm.setFieldsValue({
      student_id: selectedStudent.id,
      status: "studying",
      school_year: "2026 - 2027",
    });

    setClassModalOpen(true);
  };

  const openEditClass = (item) => {
    setEditingClass(item);

    classForm.setFieldsValue({
      ...item,
    });

    setClassModalOpen(true);
  };

  const submitClass = async () => {
    try {
      const values = await classForm.validateFields();

      if (editingClass) {
        await studentApi.updateStudentClass(editingClass.id, values);

        messageApi.success("Cập nhật lớp thành công");
      } else {
        await studentApi.createStudentClass({
          ...values,
          student_id: selectedStudent.id,
        });

        messageApi.success("Thêm học viên vào lớp thành công");
      }

      setClassModalOpen(false);

      await refreshDetail();

      await fetchStudents({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: search,
        schoolYear: filterSchoolYear,
        promotionStatus: filterPromotionStatus,
      });
    } catch (error) {
      if (error?.errorFields) return;

      console.error("submitClass error:", error);

      messageApi.error(error.response?.data?.message || "Không thể lưu lớp");
    }
  };

  const deleteClass = async (id) => {
    try {
      await studentApi.deleteStudentClass(id);

      messageApi.success("Đã xóa lịch sử lớp");

      await refreshDetail();

      await fetchStudents({
        page: pagination.current,
        pageSize: pagination.pageSize,
        keyword: search,
        schoolYear: filterSchoolYear,
        promotionStatus: filterPromotionStatus,
      });
    } catch (error) {
      messageApi.error(error.response?.data?.message || "Không thể xóa lớp");
    }
  };

  // ===================================================
  // EXAM ACTIONS
  // ===================================================

  const openCreateExam = () => {
    if (!selectedStudent) return;

    setEditingExam(null);

    examForm.resetFields();

    examForm.setFieldsValue({
      student_id: selectedStudent.id,
      result: "pending",
    });

    setExamModalOpen(true);
  };

  const openEditExam = (item) => {
    setEditingExam(item);

    examForm.setFieldsValue({
      ...item,

      exam_date: item.exam_date ? dayjs(item.exam_date) : null,
    });

    setExamModalOpen(true);
  };

  const submitExam = async () => {
    try {
      const values = await examForm.validateFields();

      const payload = {
        ...values,

        exam_date: values.exam_date
          ? values.exam_date.format("YYYY-MM-DD")
          : null,
      };

      if (editingExam) {
        await studentApi.updateStudentExam(editingExam.id, payload);

        messageApi.success("Cập nhật kết quả thành công");
      } else {
        await studentApi.createStudentExam({
          ...payload,
          student_id: selectedStudent.id,
        });

        messageApi.success("Thêm kết quả thành công");
      }

      setExamModalOpen(false);

      await refreshDetail();
    } catch (error) {
      if (error?.errorFields) return;

      console.error("submitExam error:", error);

      messageApi.error(
        error.response?.data?.message || "Không thể lưu kết quả",
      );
    }
  };

  const deleteExam = async (id) => {
    try {
      await studentApi.deleteStudentExam(id);

      messageApi.success("Đã xóa kết quả kiểm tra");

      await refreshDetail();
    } catch (error) {
      messageApi.error(
        error.response?.data?.message || "Không thể xóa kết quả",
      );
    }
  };

  // ===================================================
  // FILTER HANDLERS
  // ===================================================

  const handleSearch = async () => {
    await fetchStudents({
      page: 1,

      pageSize: pagination.pageSize,

      keyword: search,

      schoolYear: filterSchoolYear,

      promotionStatus: filterPromotionStatus,
    });
  };

  const handleRefresh = async () => {
    setSearch("");
    setFilterSchoolYear(undefined);
    setFilterPromotionStatus(undefined);

    await fetchStudents({
      page: 1,
      pageSize: pagination.pageSize,
      keyword: "",
    });
  };

  const handleTableChange = async (page, pageSize) => {
    await fetchStudents({
      page,
      pageSize,

      keyword: search,

      schoolYear: filterSchoolYear,

      promotionStatus: filterPromotionStatus,
    });
  };

  // ===================================================
  // TABLE COLUMNS
  // ===================================================

  const columns = [
    {
      title: "MÃ HỌC VIÊN",
      dataIndex: "student_code",
      width: 130,

      render: (value) => (
        <Tag
          style={{
            border: "none",
            background: "#E2E8F0",
            color: primaryNavy,
            fontWeight: 700,
          }}
        >
          {value || "Đang tạo"}
        </Tag>
      ),
    },

    {
      title: "HỌC VIÊN",
      dataIndex: "full_name",
      width: 250,

      render: (_, record) => (
        <Space size={12}>
          <Avatar
            size={42}
            icon={<UserOutlined />}
            style={{
              background: "linear-gradient(135deg, #1B365D 0%, #2B4C7E 100%)",
              color: "#FFF",
              boxShadow: "0 4px 10px rgba(27, 54, 93, 0.2)",
            }}
          />

          <div>
            <Text
              strong
              style={{
                color: primaryNavy,
                fontSize: 15,
                display: "block",
              }}
            >
              {record.full_name}
            </Text>

            {record.saint_name && (
              <Text
                type="secondary"
                style={{
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    color: accentGold,
                  }}
                >
                  ✝
                </span>{" "}
                {record.saint_name}
              </Text>
            )}
          </div>
        </Space>
      ),
    },

    {
      title: "GIỚI TÍNH",
      dataIndex: "gender",
      width: 100,

      render: (value) => {
        if (value === "male") {
          return <Tag color="blue">Nam</Tag>;
        }

        if (value === "female") {
          return <Tag color="magenta">Nữ</Tag>;
        }

        return <Text type="secondary">-</Text>;
      },
    },

    {
      title: "NGÀY SINH",
      dataIndex: "date_of_birth",
      width: 130,
      render: formatDate,
    },

    {
      title: "LỚP HIỆN TẠI",
      dataIndex: "current_class",
      width: 150,

      render: (value) =>
        value ? (
          <Tag
            color="gold"
            style={{
              fontWeight: 600,
            }}
          >
            {value}
          </Tag>
        ) : (
          <Text type="secondary">Chưa xếp lớp</Text>
        ),
    },

    {
      title: "NĂM HỌC",
      dataIndex: "current_school_year",
      width: 130,

      render: (value) => value || "-",
    },

    {
      title: "LIÊN HỆ",
      width: 160,

      render: (_, record) =>
        record.phone ? (
          <a
            href={`tel:${record.phone}`}
            style={{
              color: primaryNavy,
              fontWeight: 500,
            }}
          >
            <PhoneOutlined
              style={{
                marginRight: 6,
              }}
            />

            {record.phone}
          </a>
        ) : (
          "-"
        ),
    },

    {
      title: "THAO TÁC",
      fixed: "right",
      width: 130,

      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            shape="circle"
            icon={
              <EyeOutlined
                style={{
                  color: primaryNavy,
                }}
              />
            }
            onClick={() => openStudentDetail(record.id)}
          />

          <Button
            type="text"
            shape="circle"
            icon={
              <EditOutlined
                style={{
                  color: accentGold,
                }}
              />
            }
            onClick={() => openEditStudent(record)}
          />

          <Popconfirm
            title="Xóa học viên?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteStudent(record.id)}
          >
            <Button
              danger
              type="text"
              shape="circle"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===================================================
  // STATISTICS
  // ===================================================

  const totalStudents = pagination.total;

  const studyingCount = students.filter((item) => item.current_class).length;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      {contextHolder}

      <div
        style={{
          padding: "28px 32px",
          background: bgGradient,
          minHeight: "100vh",
        }}
      >
        {/* =============================================
            HEADER
        ============================================= */}

        <Row
          align="middle"
          justify="space-between"
          style={{
            marginBottom: 24,
          }}
        >
          <Col>
            <div className="schedule-header-section">
              <div className="header-text-group">
                <span className="sacred-badge">
                  <CompassOutlined />
                  HỆ THỐNG QUẢN LÝ GIÁO LÝ
                </span>

                <Title level={2} className="schedule-main-title">
                  QUẢN LÝ HỌC VIÊN
                </Title>

                <Paragraph className="schedule-sub-title">
                  Sổ theo dõi thông tin, quá trình học tập và kết quả khảo sát
                  giáo lý
                </Paragraph>
              </div>
            </div>
          </Col>

          <Col>
            <Space size={12}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                className="refresh-btn"
              >
                Làm mới
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateStudent}
                className="add-schedule-btn"
              >
                Thêm học viên
              </Button>
            </Space>
          </Col>
        </Row>

        {/* =============================================
            STATISTICS
        ============================================= */}

        <Row
          gutter={[20, 20]}
          style={{
            marginBottom: 24,
          }}
        >
          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: cardShadow,
                background: "#FFF",
              }}
            >
              <Statistic
                title={
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    TỔNG HỌC VIÊN
                  </Text>
                }
                value={totalStudents}
                prefix={
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "#EEF2FF",
                      marginRight: 12,
                      display: "inline-flex",
                    }}
                  >
                    <TeamOutlined
                      style={{
                        color: primaryNavy,
                        fontSize: 22,
                      }}
                    />
                  </div>
                }
                valueStyle={{
                  color: primaryNavy,
                  fontWeight: 800,
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: cardShadow,
                background: "#FFF",
              }}
            >
              <Statistic
                title={
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    ĐANG THEO HỌC
                  </Text>
                }
                value={studyingCount}
                prefix={
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "#FEFCE8",
                      marginRight: 12,
                      display: "inline-flex",
                    }}
                  >
                    <BookOutlined
                      style={{
                        color: accentGold,
                        fontSize: 22,
                      }}
                    />
                  </div>
                }
                valueStyle={{
                  color: primaryNavy,
                  fontWeight: 800,
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: cardShadow,
                background: "#FFF",
              }}
            >
              <Statistic
                title={
                  <Text
                    type="secondary"
                    style={{
                      fontWeight: 600,
                    }}
                  >
                    NĂM HỌC HIỆN TẠI
                  </Text>
                }
                value="2026 - 2027"
                prefix={
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: "#F0FDF4",
                      marginRight: 12,
                      display: "inline-flex",
                    }}
                  >
                    <CalendarOutlined
                      style={{
                        color: "#16A34A",
                        fontSize: 22,
                      }}
                    />
                  </div>
                }
                valueStyle={{
                  color: primaryNavy,
                  fontWeight: 800,
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* =============================================
            TABLE
        ============================================= */}

        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: cardShadow,
            background: "#FFF",
          }}
        >
          <Row
            gutter={[12, 12]}
            align="middle"
            style={{
              marginBottom: 20,
            }}
          >
            {/* SEARCH */}

            <Col xs={24} sm={24} md={9} lg={10}>
              <Input
                allowClear
                size="large"
                prefix={
                  <SearchOutlined
                    style={{
                      color: "#94A3B8",
                    }}
                  />
                }
                placeholder="Tìm mã, tên, tên thánh, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={handleSearch}
                style={{
                  borderRadius: 10,
                }}
              />
            </Col>

            {/* SCHOOL YEAR */}

            <Col xs={12} sm={8} md={5} lg={4}>
              <Select
                size="large"
                allowClear
                placeholder="Năm học"
                value={filterSchoolYear}
                style={{
                  width: "100%",
                }}
                onChange={(value) => setFilterSchoolYear(value)}
                options={[
                  {
                    label: "2025 - 2026",
                    value: "2025-2026",
                  },
                  {
                    label: "2026 - 2027",
                    value: "2026-2027",
                  },
                ]}
              />
            </Col>

            {/* PROMOTION STATUS */}

            <Col xs={12} sm={8} md={5} lg={5}>
              <Select
                size="large"
                allowClear
                placeholder="Trạng thái lên lớp"
                value={filterPromotionStatus}
                style={{
                  width: "100%",
                }}
                onChange={(value) => setFilterPromotionStatus(value)}
                options={[
                  {
                    label: "Được lên lớp",
                    value: "promoted",
                  },
                  {
                    label: "Ở lại lớp",
                    value: "retained",
                  },
                  {
                    label: "Chờ xét duyệt",
                    value: "pending",
                  },
                ]}
              />
            </Col>

            {/* BUTTON */}

            <Col
              xs={24}
              sm={8}
              md={5}
              lg={5}
              style={{
                textAlign: "right",
              }}
            >
              <Space
                style={{
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSearch}
                  icon={<SearchOutlined />}
                  style={{
                    background: primaryNavy,
                    borderColor: primaryNavy,
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  Lọc dữ liệu
                </Button>
              </Space>
            </Col>
          </Row>

          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={students}
            scroll={{
              x: 1200,
            }}
            pagination={{
              current: pagination.current,

              pageSize: pagination.pageSize,

              total: pagination.total,

              showSizeChanger: true,

              showTotal: (total) => (
                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  Tổng số{" "}
                  <Text
                    strong
                    style={{
                      color: primaryNavy,
                    }}
                  >
                    {total}
                  </Text>{" "}
                  học viên
                </Text>
              ),

              onChange: handleTableChange,
            }}
          />
        </Card>
      </div>

      {/* =============================================
          STUDENT MODAL
      ============================================= */}

      <Modal
        open={studentModalOpen}
        title={
          <Space>
            <UserOutlined
              style={{
                color: accentGold,
              }}
            />

            <Text
              strong
              style={{
                color: primaryNavy,
                fontSize: 16,
              }}
            >
              {editingStudent
                ? "Hiệu chỉnh học viên"
                : "Tiếp nhận học viên mới"}
            </Text>
          </Space>
        }
        width={800}
        centered
        destroyOnClose
        okText="Lưu dữ liệu"
        cancelText="Hủy"
        onOk={submitStudent}
        onCancel={() => setStudentModalOpen(false)}
      >
        <Form
          form={studentForm}
          layout="vertical"
          style={{
            marginTop: 16,
          }}
        >
          <Divider orientation="left">THÔNG TIN CÁ NHÂN</Divider>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="student_code"
                label="Mã học viên"
                tooltip="Mã học viên được hệ thống tự động tạo"
              >
                <Input
                  disabled
                  placeholder="Hệ thống tự động tạo"
                  style={{
                    background: "#F1F5F9",
                    color: primaryNavy,
                    fontWeight: 600,
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={10}>
              <Form.Item
                name="full_name"
                label="Họ và tên"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ tên học viên",
                  },
                ]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item name="saint_name" label="Tên thánh">
                <Input placeholder="Giuse / Maria..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="gender" label="Giới tính">
                <Select
                  placeholder="Chọn"
                  options={[
                    {
                      label: "Nam",
                      value: "male",
                    },
                    {
                      label: "Nữ",
                      value: "female",
                    },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="date_of_birth" label="Ngày sinh">
                <DatePicker
                  size="large"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                  }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="place_of_birth" label="Nơi sinh">
                <Input placeholder="Tỉnh/Thành phố..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} placeholder="090..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Hòm thư (Email)"
                rules={[
                  {
                    type: "email",
                    message: "Email không đúng định dạng",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="example@gmail.com"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="address" label="Địa chỉ thường trú">
                <Input.TextArea
                  rows={2}
                  placeholder="Nhập địa chỉ chi tiết..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">THÔNG TIN GIA ĐÌNH & GIÁM HỘ</Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="father_name" label="Họ tên cha">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="father_phone" label="Số điện thoại cha">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="mother_name" label="Họ tên mẹ">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="mother_phone" label="Số điện thoại mẹ">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="guardian_name" label="Người giám hộ (nếu có)">
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="guardian_phone" label="SĐT người giám hộ">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* =============================================
          STUDENT DETAIL DRAWER
      ============================================= */}

      <Drawer
        title={
          selectedStudent ? (
            <Space size={12}>
              <Avatar
                size={40}
                style={{
                  background: primaryNavy,
                }}
                icon={<UserOutlined />}
              />

              <div>
                <Text
                  strong
                  style={{
                    color: primaryNavy,
                    fontSize: 16,
                    display: "block",
                  }}
                >
                  {selectedStudent.full_name}
                </Text>

                <Tag
                  color="gold"
                  style={{
                    margin: 0,
                    fontSize: 11,
                  }}
                >
                  MÃ: {selectedStudent.student_code}
                </Tag>
              </div>
            </Space>
          ) : (
            "Hồ sơ học viên"
          )
        }
        placement="right"
        width={720}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        destroyOnClose
      >
        {detailLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
            }}
          >
            Đang tải dữ liệu học viên...
          </div>
        ) : selectedStudent ? (
          <Space
            direction="vertical"
            size={20}
            style={{
              width: "100%",
            }}
          >
            {/* PERSONAL INFO */}

            <Card
              size="small"
              title={
                <Space
                  style={{
                    color: primaryNavy,
                  }}
                >
                  <UserOutlined />

                  <Text strong>THÔNG TIN CÁ NHÂN</Text>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEditStudent(selectedStudent)}
                >
                  Sửa
                </Button>
              }
              style={{
                borderRadius: 12,
                borderColor: "#E2E8F0",
              }}
            >
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Mã HV">
                  {selectedStudent.student_code}
                </Descriptions.Item>

                <Descriptions.Item label="Họ và tên">
                  {selectedStudent.full_name}
                </Descriptions.Item>

                <Descriptions.Item label="Tên thánh">
                  {selectedStudent.saint_name
                    ? `✝ ${selectedStudent.saint_name}`
                    : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Giới tính">
                  {selectedStudent.gender === "male"
                    ? "Nam"
                    : selectedStudent.gender === "female"
                      ? "Nữ"
                      : "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">
                  {formatDate(selectedStudent.date_of_birth)}
                </Descriptions.Item>

                <Descriptions.Item label="Nơi sinh">
                  {selectedStudent.place_of_birth || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Điện thoại">
                  {selectedStudent.phone || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                  {selectedStudent.email || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedStudent.address || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* FAMILY */}

            <Card
              size="small"
              title={
                <Space
                  style={{
                    color: primaryNavy,
                  }}
                >
                  <TeamOutlined />

                  <Text strong>THÔNG TIN GIA ĐÌNH</Text>
                </Space>
              }
              style={{
                borderRadius: 12,
                borderColor: "#E2E8F0",
              }}
            >
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="Họ tên cha">
                  {selectedStudent.father_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="SĐT cha">
                  {selectedStudent.father_phone || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Họ tên mẹ">
                  {selectedStudent.mother_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="SĐT mẹ">
                  {selectedStudent.mother_phone || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Giám hộ">
                  {selectedStudent.guardian_name || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="SĐT giám hộ">
                  {selectedStudent.guardian_phone || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* CLASS HISTORY */}

            <Card
              size="small"
              title={
                <Space
                  style={{
                    color: primaryNavy,
                  }}
                >
                  <BookOutlined />

                  <Text strong>QUÁ TRÌNH HỌC TẬP</Text>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined style={{ fontSize: 13 }} />}
                  onClick={openCreateClass}
                  style={{
                    background: `linear-gradient(135deg, ${primaryNavy} 0%, #2B4C7E 100%)`,
                    borderColor: primaryNavy,
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: "0 14px",
                    height: 30,
                    boxShadow: "0 2px 6px rgba(27, 54, 93, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(27, 54, 93, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 6px rgba(27, 54, 93, 0.25)";
                  }}
                >
                  Xếp lớp
                </Button>
              }
              style={{
                borderRadius: 12,
                borderColor: "#E2E8F0",
              }}
            >
              {!selectedStudent.classes?.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu lịch sử lớp"
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedStudent.classes}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          key="edit"
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => openEditClass(item)}
                        />,

                        <Popconfirm
                          key="delete"
                          title="Xóa thông tin lớp này?"
                          onConfirm={() => deleteClass(item.id)}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              background: "#F1F5F9",
                              color: primaryNavy,
                            }}
                            icon={<BookOutlined />}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>Lớp {item.class_name}</Text>

                            <Tag color="blue">{item.school_year}</Tag>
                          </Space>
                        }
                        description={item.note || "Không có ghi chú"}
                      />

                      <div>{getStatusTag(item.status)}</div>
                    </List.Item>
                  )}
                />
              )}
            </Card>

            {/* EXAMS */}

            <Card
              size="small"
              title={
                <Space
                  style={{
                    color: primaryNavy,
                  }}
                >
                  <SafetyCertificateOutlined />

                  <Text strong>KẾT QUẢ KHẢO SÁT & KIỂM TRA</Text>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined style={{ fontSize: 13 }} />}
                  onClick={openCreateExam}
                  style={{
                    background:
                      "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                    borderColor: "#B8860B",
                    color: "#FFFFFF",
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 12,
                    padding: "0 14px",
                    height: 30,
                    boxShadow: "0 2px 6px rgba(212, 175, 55, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(212, 175, 55, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 6px rgba(212, 175, 55, 0.35)";
                  }}
                >
                  Thêm điểm
                </Button>
              }
              style={{
                borderRadius: 12,
                borderColor: "#E2E8F0",
              }}
            >
              {!selectedStudent.exams?.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa ghi nhận kết quả thi"
                />
              ) : (
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={selectedStudent.exams}
                  columns={[
                    {
                      title: "KỲ THI / MÔN",
                      dataIndex: "exam_name",
                      render: (value) => <Text strong>{value}</Text>,
                    },
                    {
                      title: "NGÀY THI",
                      dataIndex: "exam_date",
                      render: formatDate,
                    },
                    {
                      title: "ĐIỂM",
                      dataIndex: "score",
                      render: (value) => (
                        <Text
                          strong
                          style={{
                            color: primaryNavy,
                          }}
                        >
                          {value ?? "-"}
                        </Text>
                      ),
                    },
                    {
                      title: "KẾT QUẢ",
                      dataIndex: "result",
                      render: getStatusTag,
                    },
                    {
                      title: "",
                      width: 80,
                      render: (_, item) => (
                        <Space size={2}>
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditExam(item)}
                          />

                          <Popconfirm
                            title="Xóa kết quả?"
                            onConfirm={() => deleteExam(item.id)}
                          >
                            <Button
                              danger
                              type="text"
                              icon={<DeleteOutlined />}
                            />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              )}
            </Card>
          </Space>
        ) : null}
      </Drawer>

      {/* =============================================
          CLASS MODAL
      ============================================= */}
      <Modal
        open={classModalOpen}
        title={
          <Space size={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOutlined style={{ color: accentGold, fontSize: 16 }} />
            </div>
            <Text strong style={{ color: primaryNavy, fontSize: 16 }}>
              {editingClass
                ? "Cập nhật thông tin lớp học"
                : "Ghi danh lớp học mới"}
            </Text>
          </Space>
        }
        centered
        destroyOnClose
        okText={editingClass ? "Cập nhật" : "Thêm vào lớp"}
        cancelText="Hủy bỏ"
        okButtonProps={{
          style: {
            background: primaryNavy,
            borderColor: primaryNavy,
            borderRadius: 8,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(27, 54, 93, 0.2)",
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: 8 },
        }}
        onOk={submitClass}
        onCancel={() => setClassModalOpen(false)}
        width={520}
      >
        <Form form={classForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="class_name"
            label={
              <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                Tên lớp học
              </Text>
            }
            rules={[
              { required: true, message: "Vui lòng chọn hoặc nhập tên lớp" },
            ]}
          >
            <Select
              showSearch
              allowClear
              size="large"
              placeholder="Chọn hoặc nhập tên lớp (VD: Khai Tâm 1, Xưng Tội 2...)"
              style={{ borderRadius: 8 }}
              options={[
                {
                  label: "Khối Khai Tâm",
                  options: [
                    { label: "Khai Tâm 1", value: "Khai Tâm 1" },
                    { label: "Khai Tâm 2", value: "Khai Tâm 2" },
                  ],
                },
                {
                  label: "Khối Rơlem",
                  options: [
                    { label: "Rơlem 1", value: "Rơlem 1" },
                    { label: "Rơlem 2", value: "Rơlem 2" },
                  ],
                },
                {
                  label: "Khối Bao Đồng",
                  options: [
                    { label: "Bao Đồng 1", value: "Bao Đồng 1" },
                    { label: "Bao Đồng 2", value: "Bao Đồng 2" },
                    { label: "Bao Đồng 3", value: "Bao Đồng 3" },
                  ],
                },
                {
                  label: "Khối Vào Đời",
                  options: [
                    { label: "Vào Đời 1", value: "Vào Đời 1" },
                    { label: "Vào Đời 2", value: "Vào Đời 2" },
                  ],
                },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="school_year"
                label={
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    Năm học
                  </Text>
                }
                rules={[{ required: true, message: "Vui lòng nhập năm học" }]}
              >
                <Input
                  size="large"
                  prefix={<CalendarOutlined style={{ color: "#94A3B8" }} />}
                  placeholder="2026 - 2027"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="status"
                label={
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    Trạng thái
                  </Text>
                }
              >
                <Select
                  size="large"
                  style={{ borderRadius: 8 }}
                  options={[
                    {
                      label: (
                        <Tag color="processing" icon={<ClockCircleOutlined />}>
                          Đang học
                        </Tag>
                      ),
                      value: "studying",
                    },
                    {
                      label: (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Hoàn thành
                        </Tag>
                      ),
                      value: "completed",
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="note"
            label={
              <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                Ghi chú thêm
              </Text>
            }
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú học tập, điểm danh hoặc chuyển lớp (nếu có)..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* =============================================
          EXAM MODAL
      ============================================= */}

      <Modal
        open={examModalOpen}
        title={
          <Space size={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(212, 175, 55, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined style={{ color: accentGold, fontSize: 16 }} />
            </div>
            <Text strong style={{ color: primaryNavy, fontSize: 16 }}>
              {editingExam
                ? "Chỉnh sửa kết quả kiểm tra"
                : "Ghi nhận kết quả kiểm tra"}
            </Text>
          </Space>
        }
        centered
        destroyOnClose
        okText={editingExam ? "Cập nhật" : "Lưu điểm số"}
        cancelText="Hủy bỏ"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
            borderColor: "#B8860B",
            borderRadius: 8,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: 8 },
        }}
        onOk={submitExam}
        onCancel={() => setExamModalOpen(false)}
        width={540}
      >
        <Form form={examForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="exam_name"
            label={
              <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                Tên kỳ kiểm tra / Môn học
              </Text>
            }
            rules={[
              { required: true, message: "Vui lòng nhập hoặc chọn tên kỳ thi" },
            ]}
          >
            <Select
              showSearch
              allowClear
              size="large"
              placeholder="Chọn hoặc nhập tên bài kiểm tra (VD: Giữa kỳ I, Cuối kỳ...)"
              style={{ borderRadius: 8 }}
              options={[
                {
                  label: "Bài kiểm tra định kỳ",
                  options: [
                    {
                      label: "Kiểm tra Giữa kỳ I",
                      value: "Kiểm tra Giữa kỳ I",
                    },
                    {
                      label: "Kiểm tra Cuối kỳ I",
                      value: "Kiểm tra Cuối kỳ I",
                    },
                    {
                      label: "Kiểm tra Giữa kỳ II",
                      value: "Kiểm tra Giữa kỳ II",
                    },
                    {
                      label: "Kiểm tra Cuối kỳ II",
                      value: "Kiểm tra Cuối kỳ II",
                    },
                  ],
                },
                {
                  label: "Khảo sát đặc biệt",
                  options: [
                    {
                      label: "Khảo sát Giáo lý Thăng Lớp",
                      value: "Khảo sát Giáo lý Thăng Lớp",
                    },
                    {
                      label: "Kiểm tra Kinh nguyện",
                      value: "Kiểm tra Kinh nguyện",
                    },
                    {
                      label: "Sát hạch Xưng Tội / Bao Đồng",
                      value: "Sát hạch Xưng Tội / Bao Đồng",
                    },
                  ],
                },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="exam_date"
                label={
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    Ngày kiểm tra
                  </Text>
                }
              >
                <DatePicker
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="score"
                label={
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    Điểm số (Thang điểm 10)
                  </Text>
                }
              >
                <Input
                  size="large"
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  placeholder="8.5"
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="result"
            label={
              <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                Đánh giá kết quả
              </Text>
            }
          >
            <Select
              size="large"
              style={{ borderRadius: 8 }}
              options={[
                {
                  label: (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Đạt yêu cầu
                    </Tag>
                  ),
                  value: "passed",
                },
                {
                  label: (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                      Chưa đạt
                    </Tag>
                  ),
                  value: "failed",
                },
                {
                  label: (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                      Chờ kiểm tra lại
                    </Tag>
                  ),
                  value: "pending",
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* =============================================
          CSS
      ============================================= */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .schedule-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .schedule-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            .schedule-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 24px;
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

            .schedule-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .schedule-sub-title {
              color: #64748B;
              margin: 4px 0 0 !important;
              font-size: 14px;
            }

            .add-schedule-btn {
              background: ${primaryNavy} !important;
              border-color: ${primaryNavy} !important;
              height: 42px !important;
              border-radius: 10px !important;
              font-weight: 700 !important;
              box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 42px;
            }

            @media (max-width: 768px) {
              .schedule-header-section {
                align-items: flex-start;
              }
            }
          `,
        }}
      />
    </>
  );
};

export default StudentsPage;
