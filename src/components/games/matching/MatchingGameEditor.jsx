import React, { useEffect, useMemo, useState } from "react";

import {
  Button,
  Card,
  Col,
  ColorPicker,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Typography,
  Upload,
  Progress,
  Tag,
  message,
  Empty,
  Divider,
} from "antd";

import {
  ArrowLeft,
  ImagePlus,
  Music,
  Plus,
  Save,
  Trash2,
  Settings,
  FileCheck,
  RotateCcw,
  Volume2,
  Heart,
  Star,
  Sparkles,
} from "lucide-react";

import { createGame, updateGame, getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * =========================================================
 * DEFAULT PAIRS
 * =========================================================
 */

const DEFAULT_PAIRS = [
  {
    id: 1,
    left: "Thiên Chúa",
    right: "Đấng tạo dựng muôn loài",
  },
  {
    id: 2,
    left: "Đức Giêsu",
    right: "Con Một Thiên Chúa",
  },
  {
    id: 3,
    left: "Kinh Thánh",
    right: "Lời Chúa",
  },
  {
    id: 4,
    left: "Bí tích Rửa Tội",
    right: "Gia nhập Hội Thánh",
  },
];

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const MatchingGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [pairs, setPairs] = useState(DEFAULT_PAIRS);

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  const [primaryColor, setPrimaryColor] = useState("#FF85A1"); // Hồng Pastel Chibi
  const [secondaryColor, setSecondaryColor] = useState("#FFD166"); // Vàng kem Pastel

  /**
   * Preview selected pair
   */
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);

  const isEdit = Boolean(game);

  /**
   * =========================================================
   * INIT FORM
   * =========================================================
   */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",
        timeLimit: 60,
        shuffleQuestions: false,
        shuffleAnswers: true,
        showScore: true,
        showTimer: true,
        showProgress: true,
        allowHint: false,
        allowSkip: false,
      });

      setPairs(DEFAULT_PAIRS);
      setPrimaryColor("#FF85A1");
      setSecondaryColor("#FFD166");
      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setCorrectSound(null);
      setWrongSound(null);
      return;
    }

    const settings = game?.settings || {};
    const theme = game?.theme || {};

    form.setFieldsValue({
      name: game.name || "",
      description: game.description || "",
      timeLimit: settings.timeLimit ?? 60,
      shuffleQuestions: settings.shuffleQuestions ?? false,
      shuffleAnswers: settings.shuffleAnswers ?? true,
      showScore: settings.showScore !== undefined ? settings.showScore : true,
      showTimer: settings.showTimer !== undefined ? settings.showTimer : true,
      showProgress:
        settings.showProgress !== undefined ? settings.showProgress : true,
      allowHint: settings.allowHint ?? false,
      allowSkip: settings.allowSkip ?? false,
    });

    if (Array.isArray(game.pairs) && game.pairs.length > 0) {
      setPairs(game.pairs);
    }

    if (theme.primary) {
      setPrimaryColor(theme.primary);
    }

    if (theme.secondary) {
      setSecondaryColor(theme.secondary);
    }

    setThumbnail(null);
    setBackground(null);
    setBackgroundMusic(null);
    setCorrectSound(null);
    setWrongSound(null);
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [game, form]);

  /**
   * =========================================================
   * ADD PAIR
   * =========================================================
   */

  const addPair = () => {
    const newId =
      pairs.length > 0
        ? Math.max(...pairs.map((item) => Number(item.id) || 0)) + 1
        : 1;

    setPairs((prev) => [
      ...prev,
      {
        id: newId,
        left: "",
        right: "",
      },
    ]);
  };

  /**
   * =========================================================
   * UPDATE PAIR
   * =========================================================
   */

  const updatePair = (id, field, value) => {
    setPairs((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  /**
   * =========================================================
   * DELETE PAIR
   * =========================================================
   */

  const removePair = (id) => {
    if (pairs.length <= 2) {
      message.warning("Trò chơi ghép đôi cần ít nhất 2 cặp");
      return;
    }
    setPairs((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * =========================================================
   * TOTAL
   * =========================================================
   */

  const validPairs = useMemo(() => {
    return pairs.filter(
      (item) =>
        String(item.left || "").trim() && String(item.right || "").trim(),
    );
  }, [pairs]);

  const completionPercent = useMemo(() => {
    if (!pairs.length) return 0;
    return Math.round((validPairs.length / pairs.length) * 100);
  }, [pairs.length, validPairs.length]);

  /**
   * =========================================================
   * FILE UPLOAD
   * =========================================================
   */

  const beforeUpload = (setter) => (file) => {
    setter(file);
    return false;
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (pairs.length < 2) {
        message.error("Trò chơi ghép đôi phải có ít nhất 2 cặp");
        return;
      }

      const invalidIndex = pairs.findIndex(
        (item) =>
          !String(item.left || "").trim() || !String(item.right || "").trim(),
      );

      if (invalidIndex !== -1) {
        message.error(`Cặp số ${invalidIndex + 1} chưa nhập đầy đủ hai bên`);
        return;
      }

      setLoading(true);

      const normalizedPairs = pairs.map((item, index) => ({
        id: item.id ?? index + 1,
        left: String(item.left || "").trim(),
        right: String(item.right || "").trim(),
      }));

      const settings = {
        timeLimit: Number(values.timeLimit || 60),
        shuffleQuestions: Boolean(values.shuffleQuestions),
        shuffleAnswers: Boolean(values.shuffleAnswers),
        showScore:
          values.showScore !== undefined ? Boolean(values.showScore) : true,
        showTimer:
          values.showTimer !== undefined ? Boolean(values.showTimer) : true,
        showProgress:
          values.showProgress !== undefined
            ? Boolean(values.showProgress)
            : true,
        allowHint: Boolean(values.allowHint),
        allowSkip: Boolean(values.allowSkip),
      };

      const gameData = {
        name: String(values.name).trim(),
        description: String(values.description || "").trim(),
        type: "matching",
        backgroundConfig: {
          color: "#FFF0F3",
        },
        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          font: "Baloo 2",
          borderRadius: 24,
        },
        settings,
        media: {},
        pairs: normalizedPairs,
        questions: [],
        thumbnail,
        background,
        backgroundMusic,
        correctSound,
        wrongSound,
      };

      const result = isEdit
        ? await updateGame(game.id, gameData)
        : await createGame(gameData);

      if (result?.success) {
        message.success(
          isEdit
            ? "Cập nhật trò chơi ghép đôi thành công ✨"
            : "Tạo trò chơi ghép đôi thành công ✨",
        );
        onSuccess?.(result.data);
        return;
      }

      throw new Error(result?.message || "Không thể lưu trò chơi");
    } catch (error) {
      console.error("MATCHING SAVE ERROR:", error);
      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu trò chơi ghép đôi");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================================================
   * RESET PREVIEW
   * =========================================================
   */

  const resetPreview = () => {
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  /**
   * =========================================================
   * FILE COMPONENT
   * =========================================================
   */

  const FileUploadBox = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = existing ? getGameFileUrl(existing) : null;

    return (
      <div
        style={{
          border: `2px dashed ${primaryColor}40`,
          borderRadius: 16,
          padding: 12,
          background: "#FFF9FA",
          textAlign: "center",
          minHeight: 105,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "all 0.3s",
        }}
      >
        <Space
          style={{
            marginBottom: 6,
            color: "#64748B",
            justifyContent: "center",
          }}
        >
          {icon}
          <Text
            strong
            style={{
              fontSize: 13,
              color: "#475569",
            }}
          >
            {title}
          </Text>
        </Space>

        <Upload
          maxCount={1}
          beforeUpload={beforeUpload(setter)}
          showUploadList={false}
          accept={accept}
        >
          <Button
            size="small"
            style={{
              borderRadius: 10,
              background: "#fff",
              borderColor: primaryColor,
              color: primaryColor,
              fontWeight: 600,
            }}
          >
            {file ? "Đổi file khác" : "Chọn tệp"}
          </Button>
        </Upload>

        {file ? (
          <div style={{ marginTop: 4 }}>
            <Tag color="pink" icon={<FileCheck size={12} />}>
              {file.name}
            </Tag>
          </div>
        ) : (
          existingUrl && (
            <div style={{ marginTop: 4 }}>
              <Tag color="cyan">Đã có tệp</Tag>
            </div>
          )
        )}
      </div>
    );
  };

  /**
   * =========================================================
   * PREVIEW COMPONENT
   * =========================================================
   */

  const renderPreview = () => {
    if (!pairs.length) {
      return <Empty description="Chưa có cặp dữ liệu chibi nào" />;
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {pairs.map((pair, index) => {
          return (
            <div
              key={pair.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 40px 1fr",
                gap: 8,
                alignItems: "center",
              }}
            >
              {/* LEFT */}
              <Button
                block
                onClick={() => setSelectedLeft(pair.id)}
                style={{
                  height: 56,
                  borderRadius: 16,
                  textAlign: "left",
                  border:
                    selectedLeft === pair.id
                      ? `2px solid ${primaryColor}`
                      : "2px solid #F1F5F9",
                  background:
                    selectedLeft === pair.id ? `${primaryColor}15` : "#fff",
                  boxShadow:
                    selectedLeft === pair.id
                      ? `0 6px 16px ${primaryColor}30`
                      : "0 2px 8px rgba(0,0,0,0.02)",
                  whiteSpace: "normal",
                  fontWeight: 600,
                  color: "#1E293B",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${primaryColor}20`,
                      color: primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{pair.left || "Chưa nhập..."}</span>
                </div>
              </Button>

              {/* CONNECTOR */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  color: secondaryColor,
                }}
              >
                <Heart size={18} fill={secondaryColor} />
              </div>

              {/* RIGHT */}
              <Button
                block
                onClick={() => setSelectedRight(pair.id)}
                style={{
                  height: 56,
                  borderRadius: 16,
                  textAlign: "left",
                  border:
                    selectedRight === pair.id
                      ? `2px solid ${secondaryColor}`
                      : "2px solid #F1F5F9",
                  background:
                    selectedRight === pair.id ? `${secondaryColor}25` : "#fff",
                  boxShadow:
                    selectedRight === pair.id
                      ? `0 6px 16px ${secondaryColor}30`
                      : "0 2px 8px rgba(0,0,0,0.02)",
                  whiteSpace: "normal",
                  fontWeight: 600,
                  color: "#1E293B",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{pair.right || "Chưa nhập..."}</span>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * =========================================================
   * RENDER MAIN
   * =========================================================
   */

  return (
    <div
      style={{
        background: "#FFF5F7",
        minHeight: "100vh",
        padding: 24,
        fontFamily: "'Baloo 2', cursive, sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          background: "#FFFFFF",
          padding: "16px 24px",
          borderRadius: 24,
          boxShadow: "0 8px 24px rgba(255, 133, 161, 0.12)",
          border: "2px solid #FFE3E8",
        }}
      >
        <Space size={16}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{
              borderRadius: 14,
              borderColor: "#FFE3E8",
              background: "#FFF9FA",
              fontWeight: 600,
            }}
          >
            Quay lại
          </Button>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 800,
                color: "#FF5C8A",
              }}
            >
              🌸{" "}
              {isEdit ? "Sửa Trò Chơi Ghép Đôi" : "Tạo Trò Chơi Ghép Đôi Chibi"}
            </Title>
            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              Thiết kế trò chơi nối thẻ xinh xắn, sinh động cho lớp học
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          size="large"
          icon={<Save size={18} />}
          loading={loading}
          onClick={handleSubmit}
          style={{
            borderRadius: 16,
            background: primaryColor,
            borderColor: primaryColor,
            fontWeight: 700,
            padding: "0 32px",
            height: 46,
            boxShadow: `0 6px 16px ${primaryColor}50`,
          }}
        >
          {isEdit ? "Lưu thay đổi ✨" : "Hoàn tất & Tạo ✨"}
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[24, 24]}>
          {/* LEFT FORM PANEL */}
          <Col xs={24} lg={14}>
            {/* BASIC INFO */}
            <Card
              bordered={false}
              style={{
                borderRadius: 24,
                marginBottom: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                border: "2px solid #FFE3E8",
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#FF5C8A",
                }}
              >
                <Settings size={18} color={primaryColor} />
                Thông tin cơ bản
              </Title>

              <Form.Item
                name="name"
                label={
                  <Text strong style={{ color: "#475569" }}>
                    Tên trò chơi
                  </Text>
                }
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên trò chơi",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Bé tập ghép đôi - Các Bí tích 🎀"
                  style={{
                    borderRadius: 14,
                    borderColor: "#FFE3E8",
                    background: "#FFF9FA",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Text strong style={{ color: "#475569" }}>
                    Mô tả ngắn
                  </Text>
                }
              >
                <TextArea
                  rows={2}
                  placeholder="Nhập mô tả trò chơi cho bé..."
                  style={{
                    borderRadius: 14,
                    borderColor: "#FFE3E8",
                    background: "#FFF9FA",
                  }}
                />
              </Form.Item>
            </Card>

            {/* PAIRS SECTION */}
            <Card
              bordered={false}
              style={{
                borderRadius: 24,
                marginBottom: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                border: "2px solid #FFE3E8",
              }}
              title={
                <Space>
                  <Star size={18} color={primaryColor} fill={primaryColor} />
                  <span style={{ color: "#FF5C8A", fontWeight: 700 }}>
                    Các cặp nối (Pairs)
                  </span>
                  <Tag color="magenta">{pairs.length} cặp</Tag>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={15} />}
                  onClick={addPair}
                  style={{
                    borderRadius: 14,
                    background: primaryColor,
                    borderColor: primaryColor,
                    fontWeight: 700,
                    boxShadow: `0 4px 12px ${primaryColor}40`,
                  }}
                >
                  Thêm cặp mới
                </Button>
              }
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderRadius: 16,
                  background: completionPercent === 100 ? "#F0FDF4" : "#FEFCE8",
                  border: `2px solid ${
                    completionPercent === 100 ? "#BBF7D0" : "#FEF08A"
                  }`,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: completionPercent === 100 ? "#15803D" : "#A16207",
                    }}
                  >
                    ✨ {validPairs.length}/{pairs.length} cặp đã sẵn sàng
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      display: "block",
                      fontSize: 12,
                    }}
                  >
                    Mỗi câu hỏi bên trái sẽ nối với đáp án chính xác bên phải
                  </Text>
                </div>
                <Progress
                  type="circle"
                  percent={completionPercent}
                  width={44}
                  strokeColor={
                    completionPercent === 100 ? "#22C55E" : primaryColor
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  maxHeight: 520,
                  overflowY: "auto",
                  paddingRight: 6,
                }}
              >
                {pairs.map((pair, index) => (
                  <div
                    key={pair.id}
                    style={{
                      padding: "16px",
                      border: "2px solid #FEE2E2",
                      borderRadius: 18,
                      background: "#FFFFFF",
                      boxShadow: "0 4px 12px rgba(254, 226, 226, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <Space>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: `${primaryColor}20`,
                            color: primaryColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {index + 1}
                        </div>
                        <Text strong style={{ fontSize: 13, color: "#475569" }}>
                          Cặp số {index + 1}
                        </Text>
                      </Space>

                      <Button
                        danger
                        type="text"
                        icon={<Trash2 size={16} />}
                        onClick={() => removePair(pair.id)}
                      />
                    </div>

                    <Row gutter={[12, 12]}>
                      <Col xs={24} sm={11}>
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Nội dung trái (Câu hỏi)
                        </Text>
                        <Input.TextArea
                          value={pair.left}
                          onChange={(e) =>
                            updatePair(pair.id, "left", e.target.value)
                          }
                          autoSize={{ minRows: 2, maxRows: 4 }}
                          placeholder="Ví dụ: Bí tích Rửa Tội"
                          style={{ borderRadius: 12, background: "#FFF9FA" }}
                        />
                      </Col>

                      <Col
                        xs={24}
                        sm={2}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Heart
                          size={20}
                          color={secondaryColor}
                          fill={secondaryColor}
                        />
                      </Col>

                      <Col xs={24} sm={11}>
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            marginBottom: 6,
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          Nội dung phải (Đáp án)
                        </Text>
                        <Input.TextArea
                          value={pair.right}
                          onChange={(e) =>
                            updatePair(pair.id, "right", e.target.value)
                          }
                          autoSize={{ minRows: 2, maxRows: 4 }}
                          placeholder="Ví dụ: Gia nhập Hội Thánh"
                          style={{ borderRadius: 12, background: "#FFF9FA" }}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>

            {/* THEME & SETTINGS */}
            <Card
              bordered={false}
              style={{
                borderRadius: 24,
                marginBottom: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                border: "2px solid #FFE3E8",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, color: "#FF5C8A" }}>
                🎨 Bảng màu Chibi Pastel
              </Title>
              <Row gutter={20}>
                <Col span={12}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: "#475569",
                    }}
                  >
                    Màu hồng kẹo (Primary)
                  </Text>
                  <ColorPicker
                    value={primaryColor}
                    onChange={(color) => setPrimaryColor(color.toHexString())}
                    showText
                  />
                </Col>
                <Col span={12}>
                  <Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: "#475569",
                    }}
                  >
                    Màu vàng kem (Secondary)
                  </Text>
                  <ColorPicker
                    value={secondaryColor}
                    onChange={(color) => setSecondaryColor(color.toHexString())}
                    showText
                  />
                </Col>
              </Row>

              <Divider style={{ borderColor: "#FFE3E8" }} />

              <Title level={5} style={{ marginBottom: 16, color: "#FF5C8A" }}>
                ⚙️ Cài đặt luật chơi
              </Title>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="timeLimit"
                    label={
                      <Text strong style={{ color: "#475569" }}>
                        Thời gian làm bài (giây)
                      </Text>
                    }
                  >
                    <InputNumber
                      min={10}
                      max={3600}
                      style={{ width: "100%", borderRadius: 12 }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleQuestions"
                    label="Xáo trộn câu hỏi"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleAnswers"
                    label="Xáo trộn đáp án"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name="showProgress"
                    label="Hiển thị tiến độ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name="showScore"
                    label="Hiển thị điểm"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={8}>
                  <Form.Item
                    name="showTimer"
                    label="Đồng hồ đếm ngược"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* MEDIA UPLOAD SECTION */}
            <Card
              bordered={false}
              style={{
                borderRadius: 24,
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)",
                border: "2px solid #FFE3E8",
              }}
            >
              <Title level={5} style={{ marginBottom: 16, color: "#FF5C8A" }}>
                🧸 Hình ảnh & Âm thanh ngộ nghĩnh
              </Title>
              <Row gutter={[12, 12]}>
                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Ảnh thu nhỏ"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Hình nền"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background}
                  />
                </Col>
                <Col xs={12} sm={8}>
                  <FileUploadBox
                    title="Nhạc nền"
                    icon={<Music size={16} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>
                <Col xs={12} sm={12}>
                  <FileUploadBox
                    title="Âm thanh đúng 🎉"
                    icon={<Volume2 size={16} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>
                <Col xs={12} sm={12}>
                  <FileUploadBox
                    title="Âm thanh sai ❌"
                    icon={<Volume2 size={16} />}
                    accept="audio/*"
                    file={wrongSound}
                    setter={setWrongSound}
                    existing={game?.media?.wrongSound}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* RIGHT PREVIEW PANEL */}
          <Col xs={24} lg={10}>
            <div
              style={{
                position: "sticky",
                top: 24,
              }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 24,
                  boxShadow: "0 8px 24px rgba(255, 133, 161, 0.1)",
                  border: "2px solid #FFE3E8",
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <Sparkles size={18} color={primaryColor} />
                      <span style={{ color: "#FF5C8A", fontWeight: 700 }}>
                        Xem Trước (Live Preview)
                      </span>
                    </Space>
                    <Button
                      size="small"
                      icon={<RotateCcw size={13} />}
                      onClick={resetPreview}
                      style={{ borderRadius: 10, borderColor: "#FFE3E8" }}
                    >
                      Làm mới
                    </Button>
                  </div>
                }
              >
                <div
                  style={{
                    background: "#FFF0F3",
                    borderRadius: 20,
                    padding: 16,
                    minHeight: 450,
                    border: "2px dashed #FFCCD5",
                  }}
                >
                  {renderPreview()}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MatchingGameEditor;
