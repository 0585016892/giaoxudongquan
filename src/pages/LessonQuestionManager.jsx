import React, { useEffect, useMemo, useState } from "react";

import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tag,
  Descriptions,
  Tooltip,
  Typography,
  ConfigProvider,
  Statistic,
  Empty,
  Divider,
  Alert,
} from "antd";

import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CompassOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CheckOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../api/lessonApi";

import { useUser } from "../context/UserContext";

// =====================================================
// CONSTANTS
// =====================================================

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

// =====================================================
// CATECHISM TYPES
// ĐỒNG BỘ VỚI BACKEND
// =====================================================

const CATECHISM_TYPES = [
  {
    value: "du_tong",
    label: "Giáo lý Dự tòng",
    shortLabel: "Dự tòng",
  },
  {
    value: "hon_nhan",
    label: "Giáo lý Hôn nhân",
    shortLabel: "Hôn nhân",
  },
  {
    value: "thieu_nhi",
    label: "Giáo lý Thiếu nhi",
    shortLabel: "Thiếu nhi",
  },
  {
    value: "thanh_them_suc",
    label: "Giáo lý Thêm sức",
    shortLabel: "Thêm sức",
  },
  {
    value: "ruoc_le",
    label: "Giáo lý Rước lễ",
    shortLabel: "Rước lễ",
  },
  {
    value: "vao_dao",
    label: "Giáo lý Vào đạo",
    shortLabel: "Vào đạo",
  },
];

// =====================================================
// HELPER
// =====================================================

const getCatechismLabel = (value) => {
  return (
    CATECHISM_TYPES.find((item) => item.value === value)?.label ||
    "Chưa phân loại"
  );
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isNaN(number) ? value : number;
};

// =====================================================
// COMPONENT
// =====================================================

export default function LessonQuestionManager() {
  const { user } = useUser();

  const allowRoles = ["admin", "priest"];

  const canManage = allowRoles.includes(user?.role);

  // =====================================================
  // TABS
  // =====================================================

  const [activeTab, setActiveTab] = useState("lessons");

  // =====================================================
  // DATA
  // =====================================================

  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);

  // =====================================================
  // LOADING
  // =====================================================

  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [savingLesson, setSavingLesson] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);

  // =====================================================
  // MODAL
  // =====================================================

  const [lessonModal, setLessonModal] = useState(false);
  const [questionModal, setQuestionModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);

  // =====================================================
  // EDITING
  // =====================================================

  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [selectedQuestionDetail, setSelectedQuestionDetail] = useState(null);

  // =====================================================
  // FILTER
  // =====================================================

  const [lessonSearchText, setLessonSearchText] = useState("");
  const [questionSearchText, setQuestionSearchText] = useState("");

  const [selectedLessonFilter, setSelectedLessonFilter] = useState(null);

  const [selectedCatechismType, setSelectedCatechismType] = useState(null);

  // =====================================================
  // FORM
  // =====================================================

  const [lessonForm] = Form.useForm();
  const [questionForm] = Form.useForm();

  // =====================================================
  // LOAD LESSONS
  // =====================================================

  const loadLessons = async () => {
    setLoadingLesson(true);

    try {
      const response = await getLessons({
        page: 1,
        limit: 1000,
      });

      const data = response?.data?.data || [];

      setLessons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD LESSONS ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách bài học",
      );
    } finally {
      setLoadingLesson(false);
    }
  };

  // =====================================================
  // LOAD QUESTIONS
  // =====================================================

  const loadQuestions = async () => {
    setLoadingQuestion(true);

    try {
      const response = await getQuestions({
        page: 1,
        limit: 1000,
      });

      const data = response?.data?.data || [];

      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD QUESTIONS ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách câu hỏi",
      );
    } finally {
      setLoadingQuestion(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadLessons();
    loadQuestions();
  }, []);

  // =====================================================
  // OPEN CREATE LESSON
  // =====================================================

  const openCreateLesson = () => {
    setEditingLesson(null);

    lessonForm.resetFields();

    lessonForm.setFieldsValue({
      catechism_type: "du_tong",
    });

    setLessonModal(true);
  };

  // =====================================================
  // OPEN EDIT LESSON
  // =====================================================

  const openEditLesson = (record) => {
    setEditingLesson(record);

    lessonForm.resetFields();

    lessonForm.setFieldsValue({
      title: record.title,
      catechism_type: record.catechism_type || "du_tong",
    });

    setLessonModal(true);
  };

  // =====================================================
  // CLOSE LESSON MODAL
  // =====================================================

  const closeLessonModal = () => {
    if (savingLesson) return;

    setLessonModal(false);
    setEditingLesson(null);
    lessonForm.resetFields();
  };

  // =====================================================
  // SAVE LESSON
  // =====================================================

  const saveLesson = async () => {
    if (savingLesson) return;

    try {
      const values = await lessonForm.validateFields();

      const payload = {
        title: values.title?.trim(),
        catechism_type: values.catechism_type,
      };

      setSavingLesson(true);

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);

        message.success("Cập nhật bài học thành công");
      } else {
        await createLesson(payload);

        message.success("Thêm bài học thành công");
      }

      closeLessonModal();

      await loadLessons();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("SAVE LESSON ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể lưu bài học");
    } finally {
      setSavingLesson(false);
    }
  };

  // =====================================================
  // DELETE LESSON
  // =====================================================

  const handleDeleteLesson = async (id) => {
    if (deletingLessonId) return;

    try {
      setDeletingLessonId(id);

      const response = await deleteLesson(id);

      message.success(response?.data?.message || "Xóa bài học thành công");

      // Nếu đang filter bài này
      if (normalizeId(selectedLessonFilter) === normalizeId(id)) {
        setSelectedLessonFilter(null);
      }

      await Promise.all([loadLessons(), loadQuestions()]);
    } catch (error) {
      console.error("DELETE LESSON ERROR:", error);

      message.error(error?.response?.data?.message || "Xóa bài học thất bại");
    } finally {
      setDeletingLessonId(null);
    }
  };

  // =====================================================
  // OPEN CREATE QUESTION
  // =====================================================

  const openCreateQuestion = () => {
    setEditingQuestion(null);

    questionForm.resetFields();

    setQuestionModal(true);
  };

  // =====================================================
  // OPEN EDIT QUESTION
  // =====================================================

  const openEditQuestion = (record) => {
    setEditingQuestion(record);

    questionForm.resetFields();

    questionForm.setFieldsValue({
      lesson_id: normalizeId(record.lesson_id),
      question: record.question,
      answer_a: record.answer_a,
      answer_b: record.answer_b,
      answer_c: record.answer_c,
      answer_d: record.answer_d,
      correct_answer: record.correct_answer,
    });

    setQuestionModal(true);
  };

  // =====================================================
  // CLOSE QUESTION MODAL
  // =====================================================

  const closeQuestionModal = () => {
    if (savingQuestion) return;

    setQuestionModal(false);
    setEditingQuestion(null);
    questionForm.resetFields();
  };

  // =====================================================
  // SAVE QUESTION
  // =====================================================

  const saveQuestion = async () => {
    if (savingQuestion) return;

    try {
      const values = await questionForm.validateFields();

      const payload = {
        lesson_id: normalizeId(values.lesson_id),
        question: values.question?.trim(),
        answer_a: values.answer_a?.trim(),
        answer_b: values.answer_b?.trim(),
        answer_c: values.answer_c?.trim(),
        answer_d: values.answer_d?.trim(),
        correct_answer: values.correct_answer,
      };

      setSavingQuestion(true);

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, payload);

        message.success("Cập nhật câu hỏi thành công");
      } else {
        await createQuestion(payload);

        message.success("Thêm câu hỏi thành công");
      }

      closeQuestionModal();

      await loadQuestions();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("SAVE QUESTION ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể lưu câu hỏi");
    } finally {
      setSavingQuestion(false);
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const handleDeleteQuestion = async (id) => {
    if (deletingQuestionId) return;

    try {
      setDeletingQuestionId(id);

      const response = await deleteQuestion(id);

      message.success(response?.data?.message || "Xóa câu hỏi thành công");

      await loadQuestions();
    } catch (error) {
      console.error("DELETE QUESTION ERROR:", error);

      message.error(error?.response?.data?.message || "Xóa câu hỏi thất bại");
    } finally {
      setDeletingQuestionId(null);
    }
  };

  // =====================================================
  // FILTER LESSONS
  // =====================================================

  const filteredLessons = useMemo(() => {
    const keyword = lessonSearchText.trim().toLowerCase();

    return lessons.filter((lesson) => {
      const title = lesson.title?.toLowerCase() || "";

      const matchesSearch = !keyword || title.includes(keyword);

      const matchesType =
        !selectedCatechismType ||
        lesson.catechism_type === selectedCatechismType;

      return matchesSearch && matchesType;
    });
  }, [lessons, lessonSearchText, selectedCatechismType]);

  // =====================================================
  // FILTER QUESTIONS
  // =====================================================

  const filteredQuestions = useMemo(() => {
    const keyword = questionSearchText.trim().toLowerCase();

    return questions.filter((item) => {
      const question = item.question?.toLowerCase() || "";

      const matchesSearch = !keyword || question.includes(keyword);

      const matchesLesson =
        !selectedLessonFilter ||
        normalizeId(item.lesson_id) === normalizeId(selectedLessonFilter);

      return matchesSearch && matchesLesson;
    });
  }, [questions, questionSearchText, selectedLessonFilter]);

  // =====================================================
  // LESSON COLUMNS
  // =====================================================

  const lessonColumns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <span
          style={{
            fontWeight: 700,
            color: "#94a3b8",
          }}
        >
          {index + 1}
        </span>
      ),
    },

    {
      title: "Tên bài học",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || "", "vi"),

      render: (text, record) => (
        <Space direction="vertical" size={5}>
          <Space>
            <BookOutlined
              style={{
                color: accentGold,
                fontSize: 17,
              }}
            />

            <span
              style={{
                fontWeight: 700,
                color: primaryNavy,
                fontSize: 15,
              }}
            >
              {text}
            </span>
          </Space>

          <Tag className="gold-category-tag">
            {getCatechismLabel(record.catechism_type)}
          </Tag>
        </Space>
      ),
    },

    {
      title: "Loại giáo lý",
      dataIndex: "catechism_type",
      width: 190,

      render: (value) => (
        <Tag className="type-tag">{getCatechismLabel(value)}</Tag>
      ),
    },

    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      align: "center",

      render: (id) => <Text type="secondary">#{id}</Text>,
    },

    ...(canManage
      ? [
          {
            title: "Thao tác",
            key: "action",
            width: 140,
            fixed: "right",
            align: "center",

            render: (_, record) => (
              <Space size="small">
                <Tooltip title="Chỉnh sửa">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <EditOutlined
                        style={{
                          color: primaryNavy,
                          fontSize: 16,
                        }}
                      />
                    }
                    onClick={() => openEditLesson(record)}
                    className="action-btn-edit"
                  />
                </Tooltip>

                <Popconfirm
                  title="Xóa bài học này?"
                  description={
                    "Các câu hỏi thuộc bài học này có thể bị ảnh hưởng."
                  }
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{
                    danger: true,
                    loading: deletingLessonId === record.id,
                  }}
                  onConfirm={() => handleDeleteLesson(record.id)}
                >
                  <Tooltip title="Xóa bài học">
                    <Button
                      type="text"
                      danger
                      shape="circle"
                      loading={deletingLessonId === record.id}
                      icon={
                        !(deletingLessonId === record.id) && (
                          <DeleteOutlined
                            style={{
                              fontSize: 16,
                            }}
                          />
                        )
                      }
                      className="action-btn-delete"
                    />
                  </Tooltip>
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  // =====================================================
  // QUESTION COLUMNS
  // =====================================================

  const questionColumns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",

      render: (_, __, index) => (
        <span
          style={{
            fontWeight: 700,
            color: "#94a3b8",
          }}
        >
          {index + 1}
        </span>
      ),
    },

    {
      title: "Bài học",
      key: "lesson",
      width: 260,

      render: (_, record) => {
        const type = getCatechismLabel(record.catechism_type);

        return (
          <Space direction="vertical" size={4}>
            <Tag className="gold-category-tag">
              {record.lesson_title || "Chưa phân loại"}
            </Tag>

            <Text
              type="secondary"
              style={{
                fontSize: 11,
              }}
            >
              {type}
            </Text>
          </Space>
        );
      },
    },

    {
      title: "Nội dung câu hỏi",
      dataIndex: "question",
      key: "question",
      ellipsis: true,

      render: (text) => (
        <span
          style={{
            fontWeight: 600,
            color: textDark,
            fontSize: 14,
          }}
        >
          {text}
        </span>
      ),
    },

    {
      title: "Đáp án đúng",
      dataIndex: "correct_answer",
      width: 150,
      align: "center",

      render: (text) => (
        <Tag className="correct-answer-pill">
          <CheckOutlined /> Đáp án {text}
        </Tag>
      ),
    },

    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      align: "center",

      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined
                  style={{
                    color: primaryNavy,
                    fontSize: 16,
                  }}
                />
              }
              onClick={() => {
                setSelectedQuestionDetail(record);
                setDetailModal(true);
              }}
              className="action-btn-view"
            />
          </Tooltip>

          {canManage && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      color: primaryNavy,
                      fontSize: 16,
                    }}
                  />
                }
                onClick={() => openEditQuestion(record)}
                className="action-btn-edit"
              />
            </Tooltip>
          )}

          {canManage && (
            <Popconfirm
              title="Xóa câu hỏi này?"
              description="Dữ liệu câu hỏi sẽ bị xóa khỏi ngân hàng."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
                loading: deletingQuestionId === record.id,
              }}
              onConfirm={() => handleDeleteQuestion(record.id)}
            >
              <Tooltip title="Xóa câu hỏi">
                <Button
                  type="text"
                  danger
                  shape="circle"
                  loading={deletingQuestionId === record.id}
                  icon={
                    !(deletingQuestionId === record.id) && (
                      <DeleteOutlined
                        style={{
                          fontSize: 16,
                        }}
                      />
                    )
                  }
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily:
            "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <div className="lesson-editorial-layout">
        <div className="lesson-editorial-container">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="lesson-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined />
                HỆ THỐNG QUẢN LÝ GIÁO LÝ
              </span>

              <Title level={2} className="lesson-main-title">
                NGÂN HÀNG BÀI HỌC & CÂU HỎI
              </Title>

              <Paragraph className="lesson-sub-title">
                Quản lý bài học, loại giáo lý và ngân hàng câu hỏi trắc nghiệm.
              </Paragraph>
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="pill-navigation-box">
              <button
                type="button"
                onClick={() => setActiveTab("lessons")}
                className={`pill-tab-btn ${
                  activeTab === "lessons" ? "active" : ""
                }`}
              >
                <BookOutlined />
                Bài học ({lessons.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={`pill-tab-btn ${
                  activeTab === "questions" ? "active" : ""
                }`}
              >
                <QuestionCircleOutlined />
                Câu hỏi ({questions.length})
              </button>
            </div>
          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <Row
            gutter={[16, 16]}
            style={{
              marginBottom: 24,
            }}
          >
            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tổng số bài học"
                  value={lessons.length}
                  prefix={<BookOutlined className="stat-icon gold" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Ngân hàng câu hỏi"
                  value={questions.length}
                  prefix={<FileTextOutlined className="stat-icon navy" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Trung bình câu / bài"
                  value={
                    lessons.length
                      ? (questions.length / lessons.length).toFixed(1)
                      : 0
                  }
                  prefix={<CheckCircleOutlined className="stat-icon green" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: "#2e7d32",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* =================================================
              LESSON TAB
          ================================================= */}

          {activeTab === "lessons" && (
            <Card bordered={false} className="main-table-card">
              <Row
                gutter={[16, 16]}
                justify="space-between"
                align="middle"
                style={{
                  marginBottom: 20,
                }}
              >
                <Col xs={24} lg={18}>
                  <Space
                    wrap
                    size="middle"
                    style={{
                      width: "100%",
                    }}
                  >
                    <Input
                      placeholder="Tìm theo tên bài học..."
                      prefix={
                        <SearchOutlined
                          style={{
                            color: "#94a3b8",
                          }}
                        />
                      }
                      allowClear
                      value={lessonSearchText}
                      onChange={(e) => setLessonSearchText(e.target.value)}
                      className="custom-filter-input"
                    />

                    <Select
                      placeholder="Tất cả loại giáo lý"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      value={selectedCatechismType}
                      onChange={setSelectedCatechismType}
                      className="custom-filter-select"
                      style={{
                        minWidth: 220,
                      }}
                    >
                      {CATECHISM_TYPES.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>

                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => loadLessons()}
                      loading={loadingLesson}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </Col>

                {canManage && (
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateLesson}
                      className="add-editorial-btn"
                    >
                      Thêm bài học
                    </Button>
                  </Col>
                )}
              </Row>

              <Table
                rowKey="id"
                columns={lessonColumns}
                dataSource={filteredLessons}
                loading={loadingLesson}
                locale={{
                  emptyText: <Empty description="Chưa có bài học" />,
                }}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  showTotal: (total) => `Tổng ${total} bài học`,
                }}
                scroll={{
                  x: 900,
                }}
                className="custom-admin-table"
              />
            </Card>
          )}

          {/* =================================================
              QUESTION TAB
          ================================================= */}

          {activeTab === "questions" && (
            <Card bordered={false} className="main-table-card">
              <Row
                gutter={[16, 16]}
                justify="space-between"
                align="middle"
                style={{
                  marginBottom: 20,
                }}
              >
                <Col xs={24} lg={18}>
                  <Space
                    wrap
                    size="middle"
                    style={{
                      width: "100%",
                    }}
                  >
                    <Input
                      placeholder="Tìm nội dung câu hỏi..."
                      prefix={
                        <SearchOutlined
                          style={{
                            color: "#94a3b8",
                          }}
                        />
                      }
                      allowClear
                      value={questionSearchText}
                      onChange={(e) => setQuestionSearchText(e.target.value)}
                      className="custom-filter-input"
                    />

                    <Select
                      placeholder="Tất cả bài học"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      value={selectedLessonFilter}
                      onChange={setSelectedLessonFilter}
                      className="custom-filter-select"
                      style={{
                        minWidth: 260,
                      }}
                    >
                      {lessons.map((item) => (
                        <Option key={item.id} value={normalizeId(item.id)}>
                          {item.title}
                        </Option>
                      ))}
                    </Select>

                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => loadQuestions()}
                      loading={loadingQuestion}
                    >
                      Làm mới
                    </Button>
                  </Space>
                </Col>

                {canManage && (
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={openCreateQuestion}
                      className="add-editorial-btn"
                    >
                      Thêm câu hỏi
                    </Button>
                  </Col>
                )}
              </Row>

              <Table
                rowKey="id"
                columns={questionColumns}
                dataSource={filteredQuestions}
                loading={loadingQuestion}
                locale={{
                  emptyText: <Empty description="Chưa có câu hỏi" />,
                }}
                pagination={{
                  defaultPageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: [10, 20, 50, 100],
                  showTotal: (total) => `Tổng ${total} câu hỏi`,
                }}
                scroll={{
                  x: 1000,
                }}
                className="custom-admin-table"
              />
            </Card>
          )}
        </div>

        {/* =====================================================
            LESSON MODAL
        ===================================================== */}

        <Modal
          open={lessonModal}
          title={
            <div className="modal-custom-title">
              <BookOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>
                {editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
              </span>
            </div>
          }
          onOk={saveLesson}
          onCancel={closeLessonModal}
          okText={editingLesson ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          confirmLoading={savingLesson}
          centered
          destroyOnClose
          maskClosable={!savingLesson}
          closable={!savingLesson}
          okButtonProps={{
            disabled: savingLesson,
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            disabled: savingLesson,
            style: {
              borderRadius: 8,
              height: 38,
            },
          }}
        >
          <Alert
            type="info"
            showIcon
            message={
              editingLesson
                ? "Bạn đang chỉnh sửa bài học"
                : "Tạo một bài học mới"
            }
            style={{
              marginBottom: 18,
              borderRadius: 10,
            }}
          />

          <Form form={lessonForm} layout="vertical">
            <Form.Item
              label="Tên bài học"
              name="title"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập tên bài học!",
                },
                {
                  max: 255,
                  message: "Tên bài học tối đa 255 ký tự!",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Ví dụ: Bài 1: Thiên Chúa là Cha..."
                maxLength={255}
                showCount
                disabled={savingLesson}
              />
            </Form.Item>

            <Form.Item
              label="Loại giáo lý"
              name="catechism_type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại giáo lý!",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn loại giáo lý"
                disabled={savingLesson}
                showSearch
                optionFilterProp="children"
              >
                {CATECHISM_TYPES.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* =====================================================
            QUESTION MODAL
        ===================================================== */}

        <Modal
          open={questionModal}
          width={760}
          title={
            <div className="modal-custom-title">
              <QuestionCircleOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>
                {editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
              </span>
            </div>
          }
          onOk={saveQuestion}
          onCancel={closeQuestionModal}
          okText={editingQuestion ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          confirmLoading={savingQuestion}
          centered
          destroyOnClose
          maskClosable={!savingQuestion}
          closable={!savingQuestion}
          okButtonProps={{
            disabled: savingQuestion,
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            disabled: savingQuestion,
            style: {
              borderRadius: 8,
              height: 38,
            },
          }}
        >
          <Form form={questionForm} layout="vertical">
            <Form.Item
              label="Thuộc bài học"
              name="lesson_id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn bài học!",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn bài học liên kết"
                disabled={savingQuestion}
                showSearch
                optionFilterProp="children"
              >
                {lessons.map((item) => (
                  <Option key={item.id} value={normalizeId(item.id)}>
                    {item.title} — {getCatechismLabel(item.catechism_type)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Nội dung câu hỏi"
              name="question"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: "Vui lòng nhập nội dung câu hỏi!",
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập nội dung câu hỏi..."
                maxLength={1000}
                showCount
                disabled={savingQuestion}
              />
            </Form.Item>

            <Divider orientation="left">
              <Text strong>Các phương án trả lời</Text>
            </Divider>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Đáp án A"
                  name="answer_a"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Không được để trống!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập đáp án A"
                    disabled={savingQuestion}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Đáp án B"
                  name="answer_b"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Không được để trống!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập đáp án B"
                    disabled={savingQuestion}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Đáp án C"
                  name="answer_c"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Không được để trống!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập đáp án C"
                    disabled={savingQuestion}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Đáp án D"
                  name="answer_d"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "Không được để trống!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nhập đáp án D"
                    disabled={savingQuestion}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Đáp án chính xác"
              name="correct_answer"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn đáp án chính xác!",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Chọn đáp án đúng"
                disabled={savingQuestion}
              >
                <Option value="A">Đáp án A</Option>

                <Option value="B">Đáp án B</Option>

                <Option value="C">Đáp án C</Option>

                <Option value="D">Đáp án D</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* =====================================================
            QUESTION DETAIL
        ===================================================== */}

        <Modal
          open={detailModal}
          width={680}
          centered
          destroyOnClose
          onCancel={() => setDetailModal(false)}
          footer={[
            <Button
              key="close"
              type="primary"
              onClick={() => setDetailModal(false)}
              style={{
                backgroundColor: primaryNavy,
                borderRadius: 8,
                height: 38,
              }}
            >
              Đóng
            </Button>,
          ]}
          title={
            <div className="modal-custom-title">
              <EyeOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>Chi tiết câu hỏi #{selectedQuestionDetail?.id}</span>
            </div>
          }
        >
          {selectedQuestionDetail && (
            <>
              <Descriptions
                bordered
                column={1}
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Bài học">
                  <Space wrap>
                    <Tag className="gold-category-tag">
                      {selectedQuestionDetail.lesson_title}
                    </Tag>

                    <Tag className="type-tag">
                      {getCatechismLabel(selectedQuestionDetail.catechism_type)}
                    </Tag>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Nội dung">
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      fontWeight: 600,
                      color: primaryNavy,
                      lineHeight: 1.7,
                    }}
                  >
                    {selectedQuestionDetail.question}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Title
                level={5}
                style={{
                  marginTop: 24,
                  color: primaryNavy,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Các phương án trả lời
              </Title>

              <Space
                direction="vertical"
                size={10}
                style={{
                  width: "100%",
                }}
              >
                {[
                  {
                    key: "A",
                    value: selectedQuestionDetail.answer_a,
                  },
                  {
                    key: "B",
                    value: selectedQuestionDetail.answer_b,
                  },
                  {
                    key: "C",
                    value: selectedQuestionDetail.answer_c,
                  },
                  {
                    key: "D",
                    value: selectedQuestionDetail.answer_d,
                  },
                ].map((answer) => {
                  const isCorrect =
                    selectedQuestionDetail.correct_answer === answer.key;

                  return (
                    <div
                      key={answer.key}
                      className={`answer-choice-card ${
                        isCorrect ? "correct" : ""
                      }`}
                    >
                      <Tag
                        color={isCorrect ? "success" : "default"}
                        style={{
                          minWidth: 30,
                          textAlign: "center",
                          fontWeight: 700,
                          borderRadius: 6,
                        }}
                      >
                        {answer.key}
                      </Tag>

                      <span
                        style={{
                          flex: 1,
                          color: isCorrect ? "#1e4620" : textDark,
                          fontWeight: isCorrect ? 700 : 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {answer.value}
                      </span>

                      {isCorrect && (
                        <Tag
                          color="success"
                          style={{
                            margin: 0,
                            fontWeight: 700,
                          }}
                        >
                          <CheckOutlined /> Đúng
                        </Tag>
                      )}
                    </div>
                  );
                })}
              </Space>
            </>
          )}
        </Modal>

        {/* =====================================================
            STYLES
        ===================================================== */}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

              * {
                box-sizing: border-box;
              }

              .lesson-editorial-layout {
                min-height: 100vh;
                background: ${softBg};
                padding: 40px 20px 80px;
                font-family: 'Be Vietnam Pro', sans-serif;
                color: ${textDark};
              }

              .lesson-editorial-container {
                width: 100%;
                max-width: 1200px;
                margin: 0 auto;
              }

              /* ================= HEADER ================= */

              .lesson-header-section {
                display: flex;
                align-items: flex-end;
                justify-content: space-between;
                gap: 24px;
                margin-bottom: 28px;
                flex-wrap: wrap;
              }

              .header-text-group {
                flex: 1;
                min-width: 280px;
              }

              .sacred-badge {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 6px 14px;
                margin-bottom: 12px;
                border: 1px solid ${accentGold};
                border-radius: 30px;
                background: rgba(212,175,55,.12);
                color: ${primaryNavy};
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .7px;
              }

              .lesson-main-title {
                margin: 0 !important;
                color: ${primaryNavy} !important;
                font-family: 'Playfair Display', Georgia, serif !important;
                font-size: clamp(25px, 4vw, 34px) !important;
                font-weight: 700 !important;
                line-height: 1.2 !important;
              }

              .lesson-sub-title {
                margin: 7px 0 0 !important;
                color: #64748b;
                font-size: 14px;
              }

              /* ================= PILLS ================= */

              .pill-navigation-box {
                display: flex;
                gap: 5px;
                padding: 6px;
                border: 1px solid rgba(212,175,55,.28);
                border-radius: 30px;
                background: white;
                box-shadow: 0 5px 18px rgba(27,54,93,.05);
              }

              .pill-tab-btn {
                display: inline-flex;
                align-items: center;
                gap: 7px;
                padding: 10px 18px;
                border: none;
                border-radius: 25px;
                background: transparent;
                color: #64748b;
                font-family: inherit;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                transition: all .25s ease;
              }

              .pill-tab-btn:hover {
                color: ${primaryNavy};
                background: rgba(27,54,93,.05);
              }

              .pill-tab-btn.active {
                color: white;
                background: ${primaryNavy};
                box-shadow: 0 5px 14px rgba(27,54,93,.2);
              }

              /* ================= STAT ================= */

              .stat-card {
                border: 1px solid rgba(27,54,93,.08) !important;
                border-radius: 16px !important;
                background: white !important;
                box-shadow: 0 5px 18px rgba(27,54,93,.04) !important;
              }

              .stat-icon {
                margin-right: 6px;
              }

              .stat-icon.gold {
                color: ${accentGold};
              }

              .stat-icon.navy {
                color: ${primaryNavy};
              }

              .stat-icon.green {
                color: #2e7d32;
              }

              /* ================= TABLE ================= */

              .main-table-card {
                overflow: hidden;
                border: 1px solid rgba(212,175,55,.2) !important;
                border-radius: 20px !important;
                background: white !important;
                box-shadow: 0 10px 30px rgba(27,54,93,.05) !important;
              }

              .custom-filter-input {
                width: 300px;
                height: 40px;
                border-radius: 10px !important;
              }

              .custom-filter-select {
                min-height: 40px;
              }

              .custom-filter-select .ant-select-selector {
                min-height: 40px !important;
                border-radius: 10px !important;
                display: flex !important;
                align-items: center !important;
              }

              .add-editorial-btn {
                height: 40px !important;
                border-radius: 10px !important;
                border-color: ${primaryNavy} !important;
                background: ${primaryNavy} !important;
                font-weight: 700 !important;
                box-shadow: 0 5px 15px rgba(27,54,93,.2);
              }

              .custom-admin-table .ant-table-thead > tr > th {
                padding-top: 14px !important;
                padding-bottom: 14px !important;
                background: ${softBg} !important;
                color: ${primaryNavy} !important;
                font-weight: 700 !important;
                border-bottom: 1px solid rgba(27,54,93,.1) !important;
              }

              .custom-admin-table .ant-table-tbody > tr {
                transition: background .2s ease;
              }

              .custom-admin-table .ant-table-tbody > tr:hover > td {
                background: rgba(212,175,55,.035) !important;
              }

              /* ================= TAGS ================= */

              .gold-category-tag {
                margin: 0 !important;
                padding: 2px 9px;
                border: 1px solid ${accentGold} !important;
                border-radius: 8px !important;
                background: rgba(212,175,55,.1) !important;
                color: ${primaryNavy} !important;
                font-size: 11px;
                font-weight: 700;
              }

              .type-tag {
                border: 1px solid rgba(27,54,93,.12) !important;
                border-radius: 8px !important;
                background: rgba(27,54,93,.05) !important;
                color: ${primaryNavy} !important;
                font-size: 11px;
                font-weight: 600;
              }

              .correct-answer-pill {
                padding: 3px 11px;
                border: 1px solid #b7eb8f !important;
                border-radius: 12px !important;
                background: #f6ffed !important;
                color: #276749 !important;
                font-weight: 700;
              }

              /* ================= ACTION ================= */

              .action-btn-view:hover,
              .action-btn-edit:hover {
                background: rgba(27,54,93,.08) !important;
              }

              .action-btn-delete:hover {
                background: #fff1f0 !important;
              }

              /* ================= MODAL ================= */

              .modal-custom-title {
                display: flex;
                align-items: center;
                gap: 9px;
                color: ${primaryNavy};
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 18px;
                font-weight: 700;
              }

              .custom-modal-desc {
                overflow: hidden;
                border-radius: 12px;
              }

              /* ================= ANSWER ================= */

              .answer-choice-card {
                display: flex;
                align-items: center;
                gap: 10px;
                min-height: 52px;
                padding: 11px 14px;
                border: 1px solid rgba(27,54,93,.1);
                border-radius: 11px;
                background: ${softBg};
                transition: all .2s ease;
              }

              .answer-choice-card:hover {
                border-color: rgba(27,54,93,.25);
              }

              .answer-choice-card.correct {
                border-color: #b7eb8f;
                background: #f6ffed;
              }

              /* ================= RESPONSIVE ================= */

              @media (max-width: 768px) {
                .lesson-editorial-layout {
                  padding: 24px 12px 50px;
                }

                .lesson-header-section {
                  align-items: stretch;
                }

                .pill-navigation-box {
                  width: 100%;
                }

                .pill-tab-btn {
                  flex: 1;
                  justify-content: center;
                  padding: 10px 8px;
                }

                .custom-filter-input {
                  width: 100%;
                }

                .custom-filter-select {
                  width: 100% !important;
                }

                .add-editorial-btn {
                  width: 100%;
                }

                .main-table-card {
                  border-radius: 14px !important;
                }
              }

              @media (max-width: 480px) {
                .lesson-main-title {
                  font-size: 24px !important;
                }

                .sacred-badge {
                  font-size: 9px;
                }

                .lesson-sub-title {
                  font-size: 12px;
                }

                .stat-card .ant-card-body {
                  padding: 16px;
                }
              }
            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
