import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Tabs,
  message,
  Upload,
} from "antd";

import {
  Plus,
  Trash2,
  Edit3,
  Save,
  HelpCircle,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  UploadCloud,
  ImageIcon,
  X,
  Sliders,
  Eye,
} from "lucide-react";

import {
  createGame,
  updateGame,
  getGameBackground,
} from "../../../api/gameApi";

const { Text, Title } = Typography;
const { TextArea } = Input;

/* =========================================================
   DEFAULT CHIBI PASTEL THEME
========================================================= */

const DEFAULT_THEME = {
  primary: "#9333EA", // Pastel Purple
  secondary: "#F472B6", // Pastel Pink
  font: "Baloo 2",
  borderRadius: 24,
  backgroundColor: "#FAF5FF", // Lavender Mist
};

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
  timeLimit: 60,
  shuffleQuestions: true,
  shuffleAnswers: true,
  showScore: true,
  showTimer: true,

  showProgress: false,
  allowHint: false,
  allowSkip: false,

  showExplanation: false,
  instantFeedback: false,
  enableSound: true,
};

/* =========================================================
   CREATE QUESTION
========================================================= */

const createEmptyQuestion = () => ({
  id: `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  question: "",
  answers: [
    { id: "A", text: "", correct: true },
    { id: "B", text: "", correct: false },
    { id: "C", text: "", correct: false },
    { id: "D", text: "", correct: false },
  ],
  explanation: "",
  points: 10,
});

/* =========================================================
   NORMALIZE QUESTION
========================================================= */

const normalizeQuestion = (q) => ({
  id: q?.id || `question_${Date.now()}`,
  question: q?.question || "",
  answers: Array.isArray(q?.answers)
    ? q.answers.map((a, idx) => ({
        id: a?.id || String.fromCharCode(65 + idx),
        text: a?.text || "",
        correct: Boolean(a?.correct),
      }))
    : createEmptyQuestion().answers,
  explanation: q?.explanation || "",
  points: Number(q?.points ?? 10),
});

/* =========================================================
   COLOR HELPER
========================================================= */

const getColorValue = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value?.toHexString === "function") return value.toHexString();
  return fallback;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const QuizGameEditor = ({ teacherId, game, onSuccess }) => {
  const [form] = Form.useForm();

  /* =======================================================
     STATES
  ======================================================= */

  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  /* =======================================================
     BACKGROUND FILE
  ======================================================= */

  const [backgroundFile, setBackgroundFile] = useState(null);
  const [backgroundPreview, setBackgroundPreview] = useState(null);
  const [oldBackground, setOldBackground] = useState(null);

  /* =======================================================
     FORM VALUES FOR LIVE PREVIEW
  ======================================================= */

  const [formValues, setFormValues] = useState({
    name: "Tên trò chơi",
    backgroundColor: DEFAULT_THEME.backgroundColor,
    primary: DEFAULT_THEME.primary,
    secondary: DEFAULT_THEME.secondary,
    font: DEFAULT_THEME.font,
    borderRadius: DEFAULT_THEME.borderRadius,
    ...DEFAULT_SETTINGS,
  });

  /* =======================================================
     INITIALIZE GAME
  ======================================================= */

  useEffect(() => {
    let initialValues;

    if (game) {
      initialValues = {
        name: game.name || "",
        backgroundColor:
          game.background?.color || DEFAULT_THEME.backgroundColor,
        primary: game.theme?.primary || DEFAULT_THEME.primary,
        secondary: game.theme?.secondary || DEFAULT_THEME.secondary,
        font: game.theme?.font || DEFAULT_THEME.font,
        borderRadius: game.theme?.borderRadius ?? DEFAULT_THEME.borderRadius,
        timeLimit: game.settings?.timeLimit ?? DEFAULT_SETTINGS.timeLimit,
        shuffleQuestions:
          game.settings?.shuffleQuestions ?? DEFAULT_SETTINGS.shuffleQuestions,
        shuffleAnswers:
          game.settings?.shuffleAnswers ?? DEFAULT_SETTINGS.shuffleAnswers,
        showScore: game.settings?.showScore ?? DEFAULT_SETTINGS.showScore,
        showTimer: game.settings?.showTimer ?? DEFAULT_SETTINGS.showTimer,
        showProgress:
          game.settings?.showProgress ?? DEFAULT_SETTINGS.showProgress,
        allowHint: game.settings?.allowHint ?? DEFAULT_SETTINGS.allowHint,
        allowSkip: game.settings?.allowSkip ?? DEFAULT_SETTINGS.allowSkip,
        showExplanation:
          game.settings?.showExplanation ?? DEFAULT_SETTINGS.showExplanation,
        instantFeedback:
          game.settings?.instantFeedback ?? DEFAULT_SETTINGS.instantFeedback,
        enableSound: game.settings?.enableSound ?? DEFAULT_SETTINGS.enableSound,
      };

      const existingBackground = getGameBackground(game);
      setOldBackground(existingBackground);
      setBackgroundPreview(existingBackground);
      setBackgroundFile(null);

      setQuestions(
        Array.isArray(game.questions)
          ? game.questions.map(normalizeQuestion)
          : [],
      );
    } else {
      initialValues = {
        name: "",
        backgroundColor: DEFAULT_THEME.backgroundColor,
        primary: DEFAULT_THEME.primary,
        secondary: DEFAULT_THEME.secondary,
        font: DEFAULT_THEME.font,
        borderRadius: DEFAULT_THEME.borderRadius,
        ...DEFAULT_SETTINGS,
      };

      setOldBackground(null);
      setBackgroundPreview(null);
      setBackgroundFile(null);
      setQuestions([]);
    }

    form.setFieldsValue(initialValues);
    setFormValues(initialValues);
    setPreviewIndex(0);
  }, [game, form]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleValuesChange = (_, allValues) => {
    setFormValues((prev) => ({
      ...prev,
      ...allValues,
      backgroundColor: getColorValue(
        allValues.backgroundColor,
        prev.backgroundColor,
      ),
      primary: getColorValue(allValues.primary, prev.primary),
      secondary: getColorValue(allValues.secondary, prev.secondary),
    }));
  };

  /* =======================================================
     BACKGROUND HANDLERS
  ======================================================= */

  const handleBackgroundChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      message.error("Vui lòng chọn file hình ảnh xinh xắn nha! 🖼️");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error("Ảnh nền nhẹ hơn 5MB để load mượt hơn nè! 🌸");
      return;
    }

    setBackgroundFile(file);
    const previewUrl = URL.createObjectURL(file);
    setBackgroundPreview(previewUrl);
  };

  const handleRemoveBackground = () => {
    setBackgroundFile(null);
    setBackgroundPreview(null);
    setOldBackground(null);
  };

  /* =======================================================
     QUESTION ACTIONS
  ======================================================= */

  const handleAddQuestion = () => {
    setEditingQuestion(createEmptyQuestion());
    setQuestionModalOpen(true);
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== id);
      if (previewIndex >= updated.length && updated.length > 0) {
        setPreviewIndex(updated.length - 1);
      }
      if (updated.length === 0) {
        setPreviewIndex(0);
      }
      return updated;
    });

    message.success("Đã xóa câu hỏi rồi nha ✨");
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    if (!editingQuestion.question.trim()) {
      message.warning("Bé ơi, nhập nội dung câu hỏi nữa nha 📝");
      return;
    }

    const validAnswers = editingQuestion.answers.filter((a) => a.text.trim());

    if (validAnswers.length < 2) {
      message.warning("Cần ít nhất 2 đáp án để trò chơi thêm vui nhé!");
      return;
    }

    if (!validAnswers.some((a) => a.correct)) {
      message.warning("Đừng quên chọn ít nhất 1 đáp án đúng nha ✨");
      return;
    }

    const newQuestion = {
      ...editingQuestion,
      answers: validAnswers.map((answer, index) => ({
        ...answer,
        id: answer.id || String.fromCharCode(65 + index),
        correct: Boolean(answer.correct),
      })),
    };

    setQuestions((prev) => {
      const idx = prev.findIndex((item) => item.id === newQuestion.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newQuestion;
        return updated;
      }
      return [...prev, newQuestion];
    });

    setQuestionModalOpen(false);
    setEditingQuestion(null);
    message.success("Lưu câu hỏi thành công nè 🌸");
  };

  /* =======================================================
     SUBMIT GAME
  ======================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (questions.length === 0) {
        message.warning("Thêm ít nhất 1 câu hỏi để bắt đầu trò chơi nha! 🧩");
        return;
      }

      const backgroundColor = getColorValue(
        values.backgroundColor,
        DEFAULT_THEME.backgroundColor,
      );
      const primary = getColorValue(values.primary, DEFAULT_THEME.primary);
      const secondary = getColorValue(
        values.secondary,
        DEFAULT_THEME.secondary,
      );

      const settings = {
        timeLimit: Number(values.timeLimit ?? DEFAULT_SETTINGS.timeLimit),
        shuffleQuestions: Boolean(values.shuffleQuestions),
        shuffleAnswers: Boolean(values.shuffleAnswers),
        showScore: Boolean(values.showScore),
        showTimer: Boolean(values.showTimer),
        showProgress: Boolean(values.showProgress),
        allowHint: Boolean(values.allowHint),
        allowSkip: Boolean(values.allowSkip),
        showExplanation: Boolean(values.showExplanation),
        instantFeedback: Boolean(values.instantFeedback),
        enableSound: Boolean(values.enableSound),
      };

      const backgroundConfig = { color: backgroundColor };

      const media = {
        backgroundMusic: game?.media?.backgroundMusic || null,
        correctSound: game?.media?.correctSound || null,
        wrongSound: game?.media?.wrongSound || null,
      };

      const payload = {
        name: values.name,
        description: game?.description || "",
        type: "quiz",
        backgroundConfig,
        theme: {
          primary,
          secondary,
          font: values.font || DEFAULT_THEME.font,
          borderRadius: Number(
            values.borderRadius ?? DEFAULT_THEME.borderRadius,
          ),
        },
        settings,
        media,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          answers: q.answers.map((answer) => ({
            id: answer.id,
            text: answer.text,
            correct: Boolean(answer.correct),
          })),
          explanation: q.explanation || "",
          points: Number(q.points ?? 10),
        })),
        background: backgroundFile || null,
      };

      setSubmitting(true);

      let result;
      if (game?.id) {
        result = await updateGame(game.id, payload);
      } else {
        result = await createGame(payload);
      }

      if (result?.success) {
        message.success(
          game?.id
            ? "Cập nhật trò chơi thành công! ✨"
            : "Tạo trò chơi mới siêu xịn rồi! 🎉",
        );
        if (onSuccess) onSuccess(result.data);
      } else {
        message.error(result?.message || "Úi, có lỗi xảy ra rồi");
      }
    } catch (err) {
      console.error("SAVE GAME ERROR:", err);
      message.error(err?.message || "Bé kiểm tra lại các thông tin nhé!");
    } finally {
      setSubmitting(false);
    }
  };

  const currentPreviewQuestion = questions[previewIndex] || null;

  /* =======================================================
     RENDER CHIBI PASTEL
  ======================================================= */

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: 24,
        fontFamily: `'${formValues.font}', 'Quicksand', sans-serif`,
      }}
    >
      <Row gutter={[24, 24]}>
        {/* =================================================
            LEFT EDITOR PANEL (CHIBI PASTEL)
        ================================================= */}
        <Col xs={24} lg={13}>
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
          >
            <Card
              style={{
                borderRadius: 28,
                border: "2.5px solid #F3E8FF",
                boxShadow: "0 10px 28px rgba(147, 51, 234, 0.05)",
                background: "#FFFFFF",
              }}
              styles={{ body: { padding: 22 } }}
            >
              <Tabs
                defaultActiveKey="questions"
                items={[
                  /* 🌸 TAB 1: CÂU HỎI */
                  {
                    key: "questions",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <HelpCircle size={18} color="#9333EA" />
                        Câu hỏi ({questions.length})
                      </span>
                    ),
                    children: (
                      <div style={{ paddingTop: 14 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              color: "#827093",
                              fontWeight: 600,
                            }}
                          >
                            Danh sách câu hỏi thú vị 🧩
                          </Text>

                          <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={handleAddQuestion}
                            style={{
                              background: formValues.primary,
                              borderRadius: 18,
                              fontWeight: 700,
                              height: 38,
                              border: "none",
                              boxShadow: `0 6px 14px ${formValues.primary}35`,
                            }}
                          >
                            Thêm câu hỏi
                          </Button>
                        </div>

                        {questions.length === 0 ? (
                          <div
                            style={{
                              padding: "36px 16px",
                              textAlign: "center",
                              background: "#FAF5FF",
                              borderRadius: 24,
                              border: "2px dashed #E9D5FF",
                            }}
                          >
                            <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={
                                <span
                                  style={{
                                    color: "#827093",
                                    fontWeight: 600,
                                    fontSize: 14,
                                  }}
                                >
                                  Chưa có câu hỏi nào hết nè! Bấm nút trên để
                                  thêm nha ✨
                                </span>
                              }
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 12,
                              maxHeight: 440,
                              overflowY: "auto",
                              paddingRight: 6,
                            }}
                          >
                            {questions.map((q, idx) => {
                              const isSelected = previewIndex === idx;
                              return (
                                <div
                                  key={q.id}
                                  onClick={() => setPreviewIndex(idx)}
                                  style={{
                                    padding: "14px 18px",
                                    borderRadius: 20,
                                    border: isSelected
                                      ? `2.5px solid ${formValues.primary}`
                                      : "2px solid #F3E8FF",
                                    background: isSelected
                                      ? "#FAF5FF"
                                      : "#FFFFFF",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    cursor: "pointer",
                                    transition:
                                      "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                    transform: isSelected
                                      ? "translateY(-2px)"
                                      : "none",
                                    boxShadow: isSelected
                                      ? `0 8px 18px ${formValues.primary}20`
                                      : "0 4px 10px rgba(0,0,0,0.02)",
                                  }}
                                >
                                  <Space style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                      style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        background: isSelected
                                          ? formValues.primary
                                          : "#F3E8FF",
                                        color: isSelected
                                          ? "#FFFFFF"
                                          : "#9333EA",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: 13,
                                      }}
                                    >
                                      {idx + 1}
                                    </div>

                                    <Text
                                      strong
                                      style={{
                                        fontSize: 14,
                                        color: "#3B2F4C",
                                        fontWeight: 700,
                                      }}
                                      ellipsis={{ tooltip: q.question }}
                                    >
                                      {q.question || "Chưa nhập nội dung..."}
                                    </Text>
                                  </Space>

                                  <Space size={6}>
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<Edit3 size={16} color="#9333EA" />}
                                      style={{
                                        background: "#F3E8FF",
                                        borderRadius: 12,
                                        width: 32,
                                        height: 32,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditQuestion(q);
                                      }}
                                    />

                                    <Popconfirm
                                      title="Xóa câu hỏi này hả bé?"
                                      okText="Xóa luôn"
                                      cancelText="Giữ lại"
                                      okButtonProps={{
                                        danger: true,
                                        style: { borderRadius: 10 },
                                      }}
                                      cancelButtonProps={{
                                        style: { borderRadius: 10 },
                                      }}
                                      onConfirm={() =>
                                        handleDeleteQuestion(q.id)
                                      }
                                    >
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<Trash2 size={16} />}
                                        style={{
                                          background: "#FFE4E6",
                                          borderRadius: 12,
                                          width: 32,
                                          height: 32,
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    </Popconfirm>
                                  </Space>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ),
                  },

                  /* 🌸 TAB 2: THÔNG TIN TRÒ CHƠI */
                  {
                    key: "info",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <Settings size={18} color="#0284C7" />
                        Thông tin
                      </span>
                    ),
                    children: (
                      <div style={{ paddingTop: 14 }}>
                        <Form.Item
                          name="name"
                          label={
                            <Text style={{ fontWeight: 800, color: "#3B2F4C" }}>
                              Tên trò chơi ✨
                            </Text>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Đừng quên đặt tên cho trò chơi nha!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Ví dụ: Đố vui khám phá đại dương! 🐬"
                            style={{
                              borderRadius: 16,
                              height: 44,
                              fontSize: 14,
                              fontWeight: 600,
                              border: "2px solid #E9D5FF",
                            }}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* 🌸 TAB 3: GIAO DIỆN PASTEL */
                  {
                    key: "theme",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <Palette size={18} color="#EC4899" />
                        Giao diện
                      </span>
                    ),
                    children: (
                      <div style={{ paddingTop: 14 }}>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item
                              name="backgroundColor"
                              label={
                                <Text
                                  style={{ fontWeight: 800, color: "#3B2F4C" }}
                                >
                                  Màu nền pastel
                                </Text>
                              }
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                  borderRadius: 14,
                                  height: 40,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              name="primary"
                              label={
                                <Text
                                  style={{ fontWeight: 800, color: "#3B2F4C" }}
                                >
                                  Màu chủ đạo
                                </Text>
                              }
                            >
                              <ColorPicker
                                showText
                                format="hex"
                                style={{
                                  width: "100%",
                                  borderRadius: 14,
                                  height: 40,
                                }}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        {/* UPLOAD ẢNH NỀN */}
                        <Form.Item
                          label={
                            <Text style={{ fontWeight: 800, color: "#3B2F4C" }}>
                              <ImageIcon
                                size={16}
                                style={{
                                  marginRight: 6,
                                  verticalAlign: "middle",
                                }}
                              />
                              Hình nền trò chơi
                            </Text>
                          }
                        >
                          <Upload
                            accept="image/*"
                            maxCount={1}
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleBackgroundChange}
                          >
                            <Button
                              icon={<UploadCloud size={16} />}
                              style={{
                                borderRadius: 16,
                                height: 40,
                                fontWeight: 700,
                                border: "2px solid #E9D5FF",
                                background: "#FAF5FF",
                                color: "#9333EA",
                              }}
                            >
                              Tải hình xinh lên
                            </Button>
                          </Upload>

                          <Text
                            style={{
                              display: "block",
                              fontSize: 12,
                              marginTop: 6,
                              color: "#827093",
                            }}
                          >
                            Định dạng JPG, PNG, WEBP · Tối đa 5MB
                          </Text>

                          {backgroundPreview && (
                            <div
                              style={{
                                marginTop: 12,
                                position: "relative",
                                borderRadius: 20,
                                overflow: "hidden",
                                border: "2px solid #E9D5FF",
                                background: "#FAF5FF",
                              }}
                            >
                              <Image
                                src={backgroundPreview}
                                preview
                                width="100%"
                                height={150}
                                style={{ objectFit: "cover" }}
                              />

                              <Button
                                danger
                                type="primary"
                                shape="circle"
                                size="small"
                                icon={<X size={14} />}
                                onClick={handleRemoveBackground}
                                style={{
                                  position: "absolute",
                                  right: 10,
                                  top: 10,
                                  borderRadius: "50%",
                                }}
                              />
                            </div>
                          )}

                          {!backgroundPreview && oldBackground && (
                            <div style={{ marginTop: 8 }}>
                              <Text style={{ color: "#827093", fontSize: 13 }}>
                                Chưa chọn hình nền
                              </Text>
                            </div>
                          )}
                        </Form.Item>

                        <Form.Item
                          name="font"
                          label={
                            <Text style={{ fontWeight: 800, color: "#3B2F4C" }}>
                              Kiểu chữ cute
                            </Text>
                          }
                        >
                          <Select
                            style={{ height: 42, borderRadius: 14 }}
                            options={[
                              {
                                value: "Baloo 2",
                                label: "Baloo 2 (Thơ mộng, đáng yêu) 🌸",
                              },
                              {
                                value: "Be Vietnam Pro",
                                label:
                                  "Be Vietnam Pro (Hiện đại, tròn trịa) ✨",
                              },
                              {
                                value: "Nunito",
                                label: "Nunito (Thân thiện, mềm mại) 🍬",
                              },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },

                  /* 🌸 TAB 4: CÀI ĐẶT NÂNG CAO */
                  {
                    key: "settings",
                    label: (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 800,
                          fontSize: 14,
                        }}
                      >
                        <Sliders size={18} color="#D97706" />
                        Tùy chọn
                      </span>
                    ),
                    children: (
                      <div style={{ paddingTop: 14 }}>
                        <Row gutter={[16, 16]}>
                          <Col span={12}>
                            <Form.Item
                              name="timeLimit"
                              label={
                                <Text
                                  style={{ fontWeight: 800, color: "#3B2F4C" }}
                                >
                                  Thời gian mỗi câu (giây)
                                </Text>
                              }
                            >
                              <InputNumber
                                min={5}
                                max={300}
                                style={{
                                  width: "100%",
                                  borderRadius: 14,
                                  height: 40,
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <div style={{ padding: "8px 0" }}>
                              <Form.Item
                                name="showTimer"
                                valuePropName="checked"
                                style={{ marginBottom: 8 }}
                              >
                                <Switch size="small" />
                                <Text
                                  style={{
                                    marginLeft: 8,
                                    fontWeight: 700,
                                    color: "#3B2F4C",
                                  }}
                                >
                                  Hiện đồng hồ ⏱️
                                </Text>
                              </Form.Item>

                              <Form.Item
                                name="showScore"
                                valuePropName="checked"
                                style={{ marginBottom: 0 }}
                              >
                                <Switch size="small" />
                                <Text
                                  style={{
                                    marginLeft: 8,
                                    fontWeight: 700,
                                    color: "#3B2F4C",
                                  }}
                                >
                                  Hiện điểm số ⭐
                                </Text>
                              </Form.Item>
                            </div>
                          </Col>
                        </Row>

                        <div
                          style={{
                            background: "#FAF5FF",
                            padding: 16,
                            borderRadius: 20,
                            border: "1.5px solid #E9D5FF",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                          }}
                        >
                          <Form.Item
                            name="shuffleQuestions"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch size="small" />
                            <Text
                              style={{
                                marginLeft: 8,
                                fontWeight: 700,
                                color: "#3B2F4C",
                              }}
                            >
                              Trộn ngẫu nhiên câu hỏi 🔀
                            </Text>
                          </Form.Item>

                          <Form.Item
                            name="shuffleAnswers"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch size="small" />
                            <Text
                              style={{
                                marginLeft: 8,
                                fontWeight: 700,
                                color: "#3B2F4C",
                              }}
                            >
                              Trộn ngẫu nhiên đáp án 🎲
                            </Text>
                          </Form.Item>

                          <Form.Item
                            name="enableSound"
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch size="small" />
                            <Text
                              style={{
                                marginLeft: 8,
                                fontWeight: 700,
                                color: "#3B2F4C",
                              }}
                            >
                              Bật âm thanh vui nhộn 🎵
                            </Text>
                          </Form.Item>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              {/* SAVE ACTION BUTTON */}
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: "2px dashed #F3E8FF",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<Save size={18} />}
                  loading={submitting}
                  onClick={handleSubmit}
                  block
                  style={{
                    height: 48,
                    borderRadius: 22,
                    background: `linear-gradient(135deg, ${formValues.primary} 0%, #A855F7 100%)`,
                    border: "none",
                    fontWeight: 800,
                    fontSize: 15,
                    boxShadow: `0 8px 20px ${formValues.primary}40`,
                  }}
                >
                  {game ? "Cập nhật trò chơi ✨" : "Hoàn tất & Tạo trò chơi 🎉"}
                </Button>
              </div>
            </Card>
          </Form>
        </Col>

        {/* =================================================
            RIGHT LIVE PREVIEW (CHIBI PASTEL MOCKUP)
        ================================================= */}
        <Col xs={24} lg={11}>
          <div
            style={{
              position: "sticky",
              top: 24,
              background: formValues.backgroundColor,
              backgroundImage: backgroundPreview
                ? `url(${backgroundPreview})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 32,
              padding: 24,
              border: `3px solid ${formValues.primary}30`,
              boxShadow: "0 14px 36px rgba(147, 51, 234, 0.08)",
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.3s ease",
            }}
          >
            {/* HEADER PREVIEW */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Tag
                  style={{
                    background: "#FFFFFF",
                    color: formValues.primary,
                    border: `1.5px solid ${formValues.primary}40`,
                    borderRadius: 16,
                    padding: "4px 12px",
                    fontWeight: 800,
                    fontSize: 12,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <Eye
                    size={14}
                    style={{ marginRight: 4, verticalAlign: "middle" }}
                  />
                  Xem trước giao diện
                </Tag>

                {formValues.showTimer && (
                  <div
                    style={{
                      background: "#FFFFFF",
                      padding: "4px 12px",
                      borderRadius: 16,
                      fontWeight: 800,
                      color: "#EA580C",
                      border: "1.5px solid #FFEDD5",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                    }}
                  >
                    <Clock size={14} /> {formValues.timeLimit}s
                  </div>
                )}
              </div>

              {/* GAME TITLE */}
              <Title
                level={4}
                style={{
                  textAlign: "center",
                  color: "#3B2F4C",
                  fontWeight: 800,
                  marginBottom: 20,
                  fontSize: 18,
                }}
              >
                {formValues.name || "Tên trò chơi cute ✨"}
              </Title>

              {/* QUESTION PREVIEW BOX */}
              {currentPreviewQuestion ? (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 24,
                    padding: 20,
                    border: "2px solid #FFFFFF",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: 800,
                        color: formValues.primary,
                        fontSize: 13,
                      }}
                    >
                      Câu {previewIndex + 1}/{questions.length}
                    </Text>

                    <Tag
                      color="purple"
                      style={{
                        borderRadius: 12,
                        fontWeight: 700,
                        border: "none",
                      }}
                    >
                      +{currentPreviewQuestion.points || 10} điểm ⭐
                    </Tag>
                  </div>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#3B2F4C",
                      display: "block",
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {currentPreviewQuestion.question ||
                      "Chưa có nội dung câu hỏi..."}
                  </Text>

                  {/* ANSWERS LIST PREVIEW */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {currentPreviewQuestion.answers.map((ans, aIdx) => (
                      <div
                        key={aIdx}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 16,
                          background: ans.correct ? "#DCFCE7" : "#F8FAFC",
                          border: ans.correct
                            ? "2px solid #86EFAC"
                            : "1.5px solid #E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 700,
                            color: ans.correct ? "#166534" : "#475569",
                            fontSize: 13,
                          }}
                        >
                          <b style={{ marginRight: 6 }}>
                            {ans.id || String.fromCharCode(65 + aIdx)}.
                          </b>
                          {ans.text || "Chưa nhập đáp án..."}
                        </Text>

                        {ans.correct && (
                          <CheckCircle2 size={16} color="#16A34A" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    borderRadius: 24,
                    padding: "40px 20px",
                    textAlign: "center",
                    border: "2px dashed #E9D5FF",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 700,
                      color: "#827093",
                      fontSize: 14,
                    }}
                  >
                    Thêm câu hỏi để xem trước tại đây nha! 🌸
                  </Text>
                </div>
              )}
            </div>

            {/* PREVIEW FOOTER NAVIGATION */}
            {questions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 20,
                  paddingTop: 14,
                  borderTop: "1.5px dashed rgba(147, 51, 234, 0.2)",
                }}
              >
                <Button
                  shape="circle"
                  icon={<ChevronLeft size={18} />}
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => prev - 1)}
                  style={{ borderRadius: "50%" }}
                />

                <Text
                  style={{ fontWeight: 800, color: "#3B2F4C", fontSize: 13 }}
                >
                  {previewIndex + 1} / {questions.length}
                </Text>

                <Button
                  shape="circle"
                  icon={<ChevronRight size={18} />}
                  disabled={previewIndex === questions.length - 1}
                  onClick={() => setPreviewIndex((prev) => prev + 1)}
                  style={{ borderRadius: "50%" }}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* =========================================================
          MODAL SOẠN THẢO CÂU HỎI (CHIBI PASTEL MODAL)
      ========================================================= */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={20} color="#9333EA" />
            <span style={{ fontWeight: 800, fontSize: 17, color: "#3B2F4C" }}>
              Soạn thảo câu hỏi cute ✨
            </span>
          </div>
        }
        open={questionModalOpen}
        onOk={handleSaveQuestion}
        onCancel={() => {
          setQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        okText="Lưu câu hỏi ✨"
        cancelText="Hủy bỏ"
        width={620}
        centered
        styles={{
          content: {
            borderRadius: 32,
            padding: 24,
            border: "2.5px solid #F3E8FF",
          },
        }}
        okButtonProps={{
          style: {
            borderRadius: 16,
            height: 40,
            fontWeight: 800,
            background: formValues.primary,
            border: "none",
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: 16, height: 40, fontWeight: 700 },
        }}
      >
        {editingQuestion && (
          <div style={{ padding: "12px 0" }}>
            {/* INPUT CÂU HỎI */}
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontWeight: 800,
                  color: "#3B2F4C",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Nội dung câu hỏi 📝
              </Text>
              <TextArea
                rows={3}
                placeholder="Nhập nội dung câu hỏi cho các bé..."
                value={editingQuestion.question}
                onChange={(e) =>
                  setEditingQuestion({
                    ...editingQuestion,
                    question: e.target.value,
                  })
                }
                style={{
                  borderRadius: 18,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "2px solid #E9D5FF",
                }}
              />
            </div>

            {/* DANH SÁCH ĐÁP ÁN */}
            <div style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontWeight: 800,
                  color: "#3B2F4C",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Danh sách đáp án (Đánh dấu tích 💚 cho đáp án đúng)
              </Text>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {editingQuestion.answers.map((ans, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: ans.correct ? "#F0FDF4" : "#FAF5FF",
                      padding: "8px 12px",
                      borderRadius: 18,
                      border: ans.correct
                        ? "2px solid #86EFAC"
                        : "1.5px solid #E9D5FF",
                    }}
                  >
                    <Button
                      shape="circle"
                      type={ans.correct ? "primary" : "default"}
                      icon={
                        ans.correct ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <XCircle size={18} color="#A093AD" />
                        )
                      }
                      style={{
                        background: ans.correct ? "#16A34A" : "#FFFFFF",
                        borderColor: ans.correct ? "#16A34A" : "#CBD5E1",
                      }}
                      onClick={() => {
                        const updated = editingQuestion.answers.map(
                          (item, i) => ({
                            ...item,
                            correct: i === idx,
                          }),
                        );
                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updated,
                        });
                      }}
                    />

                    <Input
                      placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                      value={ans.text}
                      onChange={(e) => {
                        const updated = [...editingQuestion.answers];
                        updated[idx].text = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          answers: updated,
                        });
                      }}
                      style={{
                        borderRadius: 14,
                        fontWeight: 600,
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ĐIỂM SỐ & GIẢI THÍCH */}
            <Row gutter={16}>
              <Col span={12}>
                <Text
                  style={{
                    fontWeight: 800,
                    color: "#3B2F4C",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Điểm thưởng ⭐
                </Text>
                <InputNumber
                  min={1}
                  max={100}
                  value={editingQuestion.points}
                  onChange={(val) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      points: val || 10,
                    })
                  }
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    height: 40,
                  }}
                />
              </Col>

              <Col span={12}>
                <Text
                  style={{
                    fontWeight: 800,
                    color: "#3B2F4C",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Giải thích đáp án (Tùy chọn) 💡
                </Text>
                <Input
                  placeholder="Giải thích ngắn gọn cho bé hiểu..."
                  value={editingQuestion.explanation}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      explanation: e.target.value,
                    })
                  }
                  style={{
                    borderRadius: 14,
                    height: 40,
                    border: "1.5px solid #E9D5FF",
                  }}
                />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuizGameEditor;
