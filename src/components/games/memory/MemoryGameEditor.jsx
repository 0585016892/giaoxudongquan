import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
  message,
  Modal,
  Empty,
  Segmented,
} from "antd";

import {
  ArrowLeft,
  Brain,
  ImagePlus,
  Music,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Settings,
  Palette,
  PlayCircle,
  FileCheck,
  RotateCcw,
  Type,
  Image as ImageIcon,
} from "lucide-react";

import { createGame, updateGame } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * =========================================================
 * API URL
 * =========================================================
 */

const API_URL = process.env.REACT_APP_API_URL || "";

/**
 * =========================================================
 * DEFAULT DATA
 * =========================================================
 */

const DEFAULT_CARDS = [
  {
    id: 1,
    type: "text",
    content: "Chúa Giêsu",
    image: null,
    pairId: 1,
  },
  {
    id: 2,
    type: "text",
    content: "Con Thiên Chúa",
    image: null,
    pairId: 1,
  },
  {
    id: 3,
    type: "text",
    content: "Kinh Thánh",
    image: null,
    pairId: 2,
  },
  {
    id: 4,
    type: "text",
    content: "Lời Chúa",
    image: null,
    pairId: 2,
  },
];

/**
 * =========================================================
 * URL HELPERS
 * =========================================================
 */

/**
 * Chuyển:
 * /uploads/games/game9/thumbnail.png
 *
 * thành:
 * https://domain-api.com/uploads/games/game9/thumbnail.png
 *
 * Nếu API_URL rỗng thì giữ nguyên path.
 */
const getFileUrl = (file) => {
  if (!file) return null;

  /**
   * File mới từ Upload
   */
  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

  /**
   * String
   */
  if (typeof file === "string") {
    if (
      file.startsWith("http://") ||
      file.startsWith("https://") ||
      file.startsWith("blob:")
    ) {
      return file;
    }

    const normalized = file.startsWith("/") ? file : `/${file}`;

    return `${API_URL}${normalized}`;
  }

  /**
   * Object từ Ant Design Upload / backend
   *
   * Có thể có:
   * {
   *   url: "/uploads/..."
   * }
   *
   * hoặc:
   * {
   *   path: "/uploads/..."
   * }
   *
   * hoặc:
   * {
   *   response: {
   *      url: "/uploads/..."
   *   }
   * }
   */

  if (typeof file === "object") {
    const possibleUrl =
      file.url ||
      file.path ||
      file.location ||
      file.response?.url ||
      file.response?.path ||
      file.response?.data?.url ||
      file.response?.data?.path;

    if (possibleUrl) {
      return getFileUrl(possibleUrl);
    }
  }

  return null;
};

/**
 * Lấy tên file
 */
const getFileName = (file) => {
  if (!file) return "";

  if (typeof file === "string") {
    return file.split("/").pop();
  }

  if (file.name) return file.name;

  return "File";
};

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

const MemoryGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();
  console.log(game);

  const [loading, setLoading] = useState(false);

  /**
   * Cards
   */
  const [cards, setCards] = useState(DEFAULT_CARDS);

  /**
   * Theme
   */
  const [primaryColor, setPrimaryColor] = useState("#6C4BFF");
  const [secondaryColor, setSecondaryColor] = useState("#FFD54F");

  /**
   * Background color
   */
  const [backgroundColor, setBackgroundColor] = useState("#F8F9FC");

  /**
   * Media
   *
   * null = không chọn file mới
   * File = file mới
   */
  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  /**
   * Preview
   */
  const [previewCards, setPreviewCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const isEdit = Boolean(game);

  /**
   * =========================================================
   * LOAD GAME
   * =========================================================
   */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",
        timeLimit: 120,

        shuffleQuestions: true,
        shuffleAnswers: true,

        showScore: true,
        showTimer: true,
        showProgress: true,

        allowHint: true,
        allowSkip: false,
      });

      setCards(DEFAULT_CARDS);

      setPrimaryColor("#6C4BFF");
      setSecondaryColor("#FFD54F");
      setBackgroundColor("#F8F9FC");

      setThumbnail(null);
      setBackground(null);
      setBackgroundMusic(null);
      setCorrectSound(null);
      setWrongSound(null);

      return;
    }

    const settings = game?.settings || {};
    const theme = game?.theme || {};
    const gameBackground = game?.background || {};

    /**
     * Form
     */
    form.setFieldsValue({
      name: game?.name || "",
      description: game?.description || "",

      timeLimit: settings.timeLimit ?? 120,

      shuffleQuestions: settings.shuffleQuestions ?? true,

      shuffleAnswers: settings.shuffleAnswers ?? true,

      showScore: settings.showScore ?? true,

      showTimer: settings.showTimer ?? true,

      showProgress: settings.showProgress ?? true,

      allowHint: settings.allowHint ?? true,

      allowSkip: settings.allowSkip ?? false,
    });

    /**
     * Cards
     */
    if (Array.isArray(game?.cards) && game.cards.length > 0) {
      setCards(
        game.cards.map((card) => ({
          id: Number(card.id),
          type: card.type || (card.image ? "image" : "text"),
          content: card.content || "",
          image: card.image || null,
          pairId: Number(card.pairId),
        })),
      );
    } else {
      setCards([]);
    }

    /**
     * Theme
     */
    setPrimaryColor(theme.primary || "#6C4BFF");

    setSecondaryColor(theme.secondary || "#FFD54F");

    /**
     * Background
     */
    setBackgroundColor(gameBackground.color || "#F8F9FC");

    /**
     * Khi edit:
     *
     * KHÔNG set các file cũ vào state File.
     *
     * Vì nếu set string vào thumbnail/background
     * thì khi submit cần phân biệt:
     *
     * - File mới
     * - URL cũ
     *
     * Ta sẽ lấy trực tiếp game.thumbnail,
     * game.background.image,
     * game.media...
     */

    setThumbnail(null);
    setBackground(null);
    setBackgroundMusic(null);
    setCorrectSound(null);
    setWrongSound(null);

    /**
     * Reset preview
     */
    setPreviewCards([]);
    setFlipped([]);
    setMatched([]);
  }, [game, form]);

  /**
   * =========================================================
   * CARD ID
   * =========================================================
   */

  const getNextCardId = () => {
    if (!cards.length) return 1;

    return Math.max(...cards.map((card) => Number(card.id) || 0)) + 1;
  };

  /**
   * =========================================================
   * PAIR ID
   * =========================================================
   */

  const getNextPairId = () => {
    if (!cards.length) return 1;

    return Math.max(...cards.map((card) => Number(card.pairId) || 0)) + 1;
  };

  /**
   * =========================================================
   * ADD PAIR
   * =========================================================
   */

  const addPair = () => {
    const pairId = getNextPairId();

    const firstId = getNextCardId();
    const secondId = firstId + 1;

    setCards((prev) => [
      ...prev,

      {
        id: firstId,
        type: "text",
        content: `Mặt A - Cặp ${pairId}`,
        image: null,
        pairId,
      },

      {
        id: secondId,
        type: "text",
        content: `Mặt B - Cặp ${pairId}`,
        image: null,
        pairId,
      },
    ]);
  };

  /**
   * =========================================================
   * REMOVE PAIR
   * =========================================================
   */

  const removeCard = (id) => {
    const target = cards.find((card) => Number(card.id) === Number(id));

    if (!target) return;

    Modal.confirm({
      title: "Xóa cặp thẻ?",
      content: "Thẻ này thuộc một cặp. Xóa thẻ này sẽ xóa cả 2 thẻ trong cặp.",
      okText: "Xóa cả cặp",
      cancelText: "Hủy",

      okButtonProps: {
        danger: true,
      },

      onOk: () => {
        setCards((prev) =>
          prev.filter((card) => Number(card.pairId) !== Number(target.pairId)),
        );
      },
    });
  };

  /**
   * =========================================================
   * UPDATE CARD
   * =========================================================
   */

  const updateCard = (id, field, value) => {
    setCards((prev) =>
      prev.map((card) =>
        Number(card.id) === Number(id)
          ? {
              ...card,
              [field]: value,
            }
          : card,
      ),
    );
  };

  /**
   * =========================================================
   * GROUP PAIRS
   * =========================================================
   */

  const pairs = useMemo(() => {
    const map = new Map();

    cards.forEach((card) => {
      const pairId = Number(card.pairId);

      if (!map.has(pairId)) {
        map.set(pairId, []);
      }

      map.get(pairId).push(card);
    });

    return Array.from(map.entries()).map(([pairId, pairCards]) => ({
      pairId,
      cards: pairCards,
    }));
  }, [cards]);

  /**
   * =========================================================
   * VALIDATE
   * =========================================================
   */

  const validateCards = () => {
    if (!cards.length) {
      throw new Error("Vui lòng tạo ít nhất 1 cặp thẻ");
    }

    if (cards.length % 2 !== 0) {
      throw new Error("Số lượng thẻ phải là số chẵn");
    }

    const pairMap = new Map();

    cards.forEach((card, index) => {
      if (!card.pairId) {
        throw new Error(`Thẻ ${index + 1} thiếu Cặp ID`);
      }

      if (card.type === "text") {
        if (!String(card.content || "").trim()) {
          throw new Error(`Thẻ ${index + 1} chưa nhập nội dung`);
        }
      }

      if (card.type === "image") {
        if (!card.image) {
          throw new Error(`Thẻ ${index + 1} chưa chọn ảnh`);
        }
      }

      const pairId = Number(card.pairId);

      pairMap.set(pairId, (pairMap.get(pairId) || 0) + 1);
    });

    for (const [pairId, count] of pairMap) {
      if (count !== 2) {
        throw new Error(`Cặp ${pairId} phải có đúng 2 thẻ`);
      }
    }
  };

  /**
   * =========================================================
   * BUILD CARD DATA
   * =========================================================
   */

  const buildCards = () => {
    return cards.map((card) => {
      let image = null;

      if (card.type === "image") {
        if (card.image instanceof File) {
          image = card.image;
        } else if (card.image?.originFileObj instanceof File) {
          image = card.image.originFileObj;
        } else if (typeof card.image === "string") {
          image = card.image;
        } else if (card.image?.url) {
          image = card.image.url;
        } else if (card.image?.path) {
          image = card.image.path;
        }
      }

      return {
        id: Number(card.id),

        type: card.type,

        content: card.type === "text" ? card.content || "" : "",

        image,

        pairId: Number(card.pairId),
      };
    });
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      validateCards();

      setLoading(true);

      const memoryCards = buildCards();

      /**
       * Background
       *
       * API hiện tại trả:
       *
       * background: {
       *   image: "/uploads/...",
       *   color: "#F8F9FC"
       * }
       *
       * Khi tạo:
       * background.image = File nếu có
       *
       * Khi edit mà không chọn ảnh mới:
       * giữ ảnh cũ game.background.image
       */

      const backgroundImage = background || game?.background?.image || null;

      /**
       * Media
       */

      const finalBackgroundMusic =
        backgroundMusic || game?.media?.backgroundMusic || null;

      const finalCorrectSound =
        correctSound || game?.media?.correctSound || null;

      const finalWrongSound = wrongSound || game?.media?.wrongSound || null;

      /**
       * Thumbnail
       */

      const finalThumbnail = thumbnail || game?.thumbnail || null;

      /**
       * DATA
       */

      const gameData = {
        teacher_id: teacherId,

        name: values.name,

        description: values.description || "",

        type: "memory",

        backgroundConfig: {
          color: backgroundColor,
          image: backgroundImage,
        },

        theme: {
          primary: primaryColor,
          secondary: secondaryColor,
          font: "Baloo 2",
          borderRadius: 20,
        },

        settings: {
          timeLimit: Number(values.timeLimit || 120),

          shuffleQuestions: Boolean(values.shuffleQuestions),

          shuffleAnswers: Boolean(values.shuffleAnswers),

          showScore: Boolean(values.showScore),

          showTimer: Boolean(values.showTimer),

          showProgress: Boolean(values.showProgress),

          allowHint: Boolean(values.allowHint),

          allowSkip: Boolean(values.allowSkip),
        },

        questions: [],

        cards: memoryCards,

        thumbnail: finalThumbnail,

        background: background instanceof File ? background : null,

        backgroundMusic: finalBackgroundMusic,

        correctSound: finalCorrectSound,

        wrongSound: finalWrongSound,
      };

      console.log("MEMORY GAME DATA:", gameData);

      let result;

      if (isEdit) {
        result = await updateGame(game.id, gameData);
      } else {
        result = await createGame(gameData);
      }

      if (result?.success) {
        message.success(
          isEdit ? "Cập nhật game thành công" : "Tạo game thành công",
        );

        onSuccess?.(result.data);
      } else {
        throw new Error(result?.message || "Không thể lưu game");
      }
    } catch (error) {
      console.error("SAVE MEMORY GAME ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu game ghi nhớ");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * =========================================================
   * PREVIEW
   * =========================================================
   */

  const startPreview = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);

    setPreviewCards(shuffled);
    setFlipped([]);
    setMatched([]);
  };

  /**
   * =========================================================
   * PREVIEW CARD
   * =========================================================
   */

  const handlePreviewCard = (id) => {
    if (flipped.length >= 2 || flipped.includes(id) || matched.includes(id)) {
      return;
    }

    const nextFlipped = [...flipped, id];

    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = cards.find(
        (card) => Number(card.id) === Number(nextFlipped[0]),
      );

      const second = cards.find(
        (card) => Number(card.id) === Number(nextFlipped[1]),
      );

      if (first && second && Number(first.pairId) === Number(second.pairId)) {
        setTimeout(() => {
          setMatched((prev) => [...prev, first.id, second.id]);

          setFlipped([]);
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 900);
      }
    }
  };

  /**
   * =========================================================
   * FILE UPLOAD
   * =========================================================
   */

  const FileUpload = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = getFileUrl(existing);

    return (
      <div
        style={{
          border: "1px dashed #CBD5E1",
          borderRadius: 12,
          padding: 12,
          background: "#F8FAFC",
          textAlign: "center",
        }}
      >
        <Space
          style={{
            marginBottom: 6,
            color: "#475569",
          }}
        >
          {icon}

          <Text
            strong
            style={{
              fontSize: 13,
            }}
          >
            {title}
          </Text>
        </Space>

        <div>
          <Upload
            maxCount={1}
            beforeUpload={(file) => {
              setter(file);

              return false;
            }}
            showUploadList={false}
            accept={accept}
          >
            <Button
              size="small"
              style={{
                borderRadius: 8,
              }}
            >
              {file ? "Đổi tệp" : "Chọn tệp"}
            </Button>
          </Upload>
        </div>

        {file ? (
          <Tag
            color="purple"
            icon={<FileCheck size={12} />}
            style={{
              marginTop: 6,
              fontSize: 11,
            }}
          >
            {file.name}
          </Tag>
        ) : existingUrl ? (
          <Tag
            color="blue"
            style={{
              marginTop: 6,
              fontSize: 11,
            }}
          >
            Đang có file
          </Tag>
        ) : null}
      </div>
    );
  };

  /**
   * =========================================================
   * CARD EDITOR
   * =========================================================
   */

  const renderCardEditor = (card, index) => {
    const imageUrl = getFileUrl(card.image);

    return (
      <div
        key={card.id}
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: 16,
          padding: 16,
          background: "#FFFFFF",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        {/* CARD HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Space>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: primaryColor,
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {index + 1}
            </div>

            <Text strong>Thẻ #{card.id}</Text>

            <Tag color="purple">Cặp {card.pairId}</Tag>
          </Space>

          <Button
            danger
            type="text"
            icon={<Trash2 size={16} />}
            onClick={() => removeCard(card.id)}
          />
        </div>

        {/* CARD CONFIG */}

        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10}>
            <Segmented
              block
              value={card.type || "text"}
              onChange={(value) => updateCard(card.id, "type", value)}
              options={[
                {
                  label: "Văn bản",
                  value: "text",
                  icon: <Type size={14} />,
                },
                {
                  label: "Hình ảnh",
                  value: "image",
                  icon: <ImageIcon size={14} />,
                },
              ]}
            />
          </Col>

          <Col xs={24} md={8}>
            {card.type === "text" ? (
              <Input
                value={card.content || ""}
                onChange={(e) => updateCard(card.id, "content", e.target.value)}
                placeholder="Nhập nội dung thẻ..."
                style={{
                  borderRadius: 8,
                }}
              />
            ) : (
              <Upload
                maxCount={1}
                beforeUpload={(file) => {
                  const actualFile = file?.originFileObj || file;

                  updateCard(card.id, "image", actualFile);

                  return false;
                }}
                showUploadList={false}
                accept="image/*"
              >
                <Button
                  icon={<ImagePlus size={14} />}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                  }}
                >
                  {card.image ? "Đổi ảnh" : "Chọn ảnh"}
                </Button>
              </Upload>
            )}
          </Col>

          <Col xs={24} md={6}>
            <InputNumber
              min={1}
              value={card.pairId}
              onChange={(value) => updateCard(card.id, "pairId", value || 1)}
              addonBefore="Cặp"
              style={{
                width: "100%",
                borderRadius: 8,
              }}
            />
          </Col>
        </Row>

        {/* IMAGE PREVIEW */}

        {card.type === "image" && imageUrl && (
          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <img
              src={imageUrl}
              alt="Card preview"
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
              }}
            />

            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {getFileName(card.image)}
            </Text>
          </div>
        )}
      </div>
    );
  };

  /**
   * =========================================================
   * BACKGROUND PREVIEW
   * =========================================================
   */

  const backgroundPreviewUrl = getFileUrl(
    background || game?.background?.image,
  );

  /**
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          background: "#FFF",
          padding: "16px 24px",
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <Space size={16}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{
              borderRadius: 10,
            }}
          >
            Quay lại
          </Button>

          <div>
            <Title
              level={4}
              style={{
                margin: 0,
              }}
            >
              🧠 {isEdit ? "Chỉnh sửa Game Ghi Nhớ" : "Tạo Game Ghi Nhớ"}
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: 13,
              }}
            >
              Tạo game lật thẻ ghép cặp kiến thức giáo lý
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
            borderRadius: 12,
            background: primaryColor,
            borderColor: primaryColor,
            fontWeight: 600,
            padding: "0 28px",
          }}
        >
          {isEdit ? "Lưu thay đổi" : "Hoàn tất & Tạo"}
        </Button>
      </div>

      <Form form={form} layout="vertical">
        <Row gutter={[20, 20]}>
          {/* =================================================
              LEFT
          ================================================= */}

          <Col xs={24} lg={15}>
            {/* BASIC */}

            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                marginBottom: 20,
              }}
            >
              <Title level={5}>
                <Settings
                  size={18}
                  color={primaryColor}
                  style={{
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
                Thông tin cơ bản
              </Title>

              <Form.Item
                name="name"
                label="Tên trò chơi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên game",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Lật thẻ Đức Tin"
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea
                  rows={3}
                  placeholder="Mô tả ngắn về trò chơi..."
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>
            </Card>

            {/* =================================================
                CARDS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                marginBottom: 20,
              }}
              title={
                <Space>
                  <Brain size={18} color={primaryColor} />

                  <span>
                    Cấu hình Thẻ ({pairs.length} cặp - {cards.length} thẻ)
                  </span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={15} />}
                  onClick={addPair}
                  style={{
                    borderRadius: 10,
                    background: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  Thêm cặp
                </Button>
              }
            >
              {!cards.length ? (
                <Empty description="Chưa có thẻ nào">
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={addPair}
                  >
                    Tạo cặp đầu tiên
                  </Button>
                </Empty>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    maxHeight: 650,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {cards.map((card, index) => renderCardEditor(card, index))}
                </div>
              )}
            </Card>

            {/* =================================================
                SETTINGS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                marginBottom: 20,
              }}
            >
              <Title level={5}>⚙️ Cài đặt trò chơi</Title>

              <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item name="timeLimit" label="Thời gian chơi">
                    <InputNumber
                      min={10}
                      max={3600}
                      addonAfter="giây"
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="shuffleQuestions"
                    label="Xáo trộn thẻ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="shuffleAnswers"
                    label="Xáo trộn đáp án"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="showScore"
                    label="Hiện điểm"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="showTimer"
                    label="Hiện thời gian"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="showProgress"
                    label="Hiện tiến độ"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="allowHint"
                    label="Cho phép gợi ý"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={12} md={6}>
                  <Form.Item
                    name="allowSkip"
                    label="Cho phép bỏ qua"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* =================================================
                MEDIA
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                marginBottom: 20,
              }}
            >
              <Title level={5}>🎨 Hình ảnh & Âm thanh</Title>

              <Row gutter={[12, 12]}>
                {/* THUMBNAIL */}

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Thumbnail"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                {/* BACKGROUND */}

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Background"
                    icon={<ImagePlus size={16} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background?.image}
                  />
                </Col>

                {/* MUSIC */}

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Nhạc nền"
                    icon={<Music size={16} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                {/* CORRECT */}

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm đúng"
                    icon={<Sparkles size={16} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>

                {/* WRONG */}

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm sai"
                    icon={<RotateCcw size={16} />}
                    accept="audio/*"
                    file={wrongSound}
                    setter={setWrongSound}
                    existing={game?.media?.wrongSound}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* =================================================
              RIGHT / PREVIEW
          ================================================= */}

          <Col xs={24} lg={9}>
            <div
              style={{
                position: "sticky",
                top: 20,
              }}
            >
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Space>
                    <Sparkles size={18} color={primaryColor} />

                    <Text strong>Xem trước Game</Text>
                  </Space>

                  <Button
                    size="small"
                    icon={<PlayCircle size={14} />}
                    onClick={startPreview}
                  >
                    Chơi thử
                  </Button>
                </div>

                <Divider
                  style={{
                    margin: "12px 0",
                  }}
                />

                {/* GAME PREVIEW */}

                <div
                  style={{
                    background: backgroundPreviewUrl
                      ? `url(${backgroundPreviewUrl}) center/cover`
                      : backgroundColor,
                    borderRadius: 16,
                    padding: 16,
                    minHeight: 300,
                  }}
                >
                  {!previewCards.length ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "70px 10px",
                      }}
                    >
                      <Brain size={44} color={primaryColor} />

                      <div
                        style={{
                          marginTop: 10,
                        }}
                      >
                        <Text type="secondary">
                          Bấm "Chơi thử" để test lật thẻ
                        </Text>
                      </div>
                    </div>
                  ) : (
                    <Row gutter={[8, 8]}>
                      {previewCards.map((card) => {
                        const isFlipped =
                          flipped.includes(card.id) ||
                          matched.includes(card.id);

                        const isMatched = matched.includes(card.id);

                        const imageUrl = getFileUrl(card.image);

                        return (
                          <Col span={8} key={card.id}>
                            <div
                              onClick={() => handlePreviewCard(card.id)}
                              style={{
                                height: 90,

                                borderRadius: 12,

                                cursor: "pointer",

                                background: isFlipped
                                  ? isMatched
                                    ? "#DCFCE7"
                                    : "#FFFFFF"
                                  : primaryColor,

                                border: isMatched
                                  ? "2px solid #22C55E"
                                  : "1px solid #E2E8F0",

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "center",

                                padding: 6,

                                textAlign: "center",

                                overflow: "hidden",

                                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",

                                transition: "all .2s ease",
                              }}
                            >
                              {isFlipped ? (
                                card.type === "image" && imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt="Card"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {card.content || "—"}
                                  </Text>
                                )
                              ) : (
                                <Brain size={24} color="#FFF" />
                              )}
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>

                {/* BACKGROUND COLOR */}

                <Divider
                  style={{
                    margin: "16px 0",
                  }}
                />

                <Title
                  level={5}
                  style={{
                    fontSize: 14,
                  }}
                >
                  <Palette
                    size={16}
                    color={primaryColor}
                    style={{
                      verticalAlign: "middle",
                      marginRight: 6,
                    }}
                  />
                  Màu giao diện
                </Title>

                <Row gutter={12}>
                  <Col span={8}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Màu chính
                    </Text>

                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <ColorPicker
                        value={primaryColor}
                        onChange={(color) =>
                          setPrimaryColor(color.toHexString())
                        }
                        showText
                      />
                    </div>
                  </Col>

                  <Col span={8}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Màu phụ
                    </Text>

                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <ColorPicker
                        value={secondaryColor}
                        onChange={(color) =>
                          setSecondaryColor(color.toHexString())
                        }
                        showText
                      />
                    </div>
                  </Col>

                  <Col span={8}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                      }}
                    >
                      Background
                    </Text>

                    <div
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <ColorPicker
                        value={backgroundColor}
                        onChange={(color) =>
                          setBackgroundColor(color.toHexString())
                        }
                        showText
                      />
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MemoryGameEditor;
