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
  Typography,
  Upload,
  Progress,
  Tag,
  message,
  Tooltip,
} from "antd";

import {
  ArrowLeft,
  ImagePlus,
  Music,
  Plus,
  RotateCw,
  Save,
  Trash2,
  Trophy,
  Volume2,
  Sparkles,
  Settings,
  Palette,
  PlayCircle,
  FileCheck,
  Dice5,
  Eye,
  Clock,
  Repeat,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { createGame, updateGame, getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/* =========================================================
   DEFAULT ITEMS
========================================================= */

const DEFAULT_ITEMS = [
  {
    id: 1,
    label: "Phần thưởng 1",
    value: "10 điểm",
    color: "#6C4BFF",
    probability: 25,
  },
  {
    id: 2,
    label: "Phần thưởng 2",
    value: "20 điểm",
    color: "#1677FF",
    probability: 25,
  },
  {
    id: 3,
    label: "Phần thưởng 3",
    value: "30 điểm",
    color: "#13C2C2",
    probability: 25,
  },
  {
    id: 4,
    label: "Phần thưởng 4",
    value: "50 điểm",
    color: "#FF7A45",
    probability: 25,
  },
];

/* =========================================================
   COLOR LIST
========================================================= */

const COLOR_LIST = [
  "#6C4BFF",
  "#1677FF",
  "#13C2C2",
  "#52C41A",
  "#FAAD14",
  "#FF7A45",
  "#F5222D",
  "#EB2F96",
  "#722ED1",
  "#1890FF",
];

/* =========================================================
   DEFAULT BACKGROUND
========================================================= */

const DEFAULT_BACKGROUND = {
  color: "#F8F9FC",
  image: null,
};

/* =========================================================
   DEFAULT THEME
========================================================= */

const DEFAULT_THEME = {
  primary: "#6C4BFF",
  secondary: "#FFD54F",
  font: "Baloo 2",
  borderRadius: 20,
};

/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const DEFAULT_SETTINGS = {
  timeLimit: 60,
  shuffleQuestions: false,
  shuffleAnswers: false,
  showScore: true,
  showTimer: true,
  showProgress: false,
  allowHint: false,
  allowSkip: false,
};

/* =========================================================
   DEFAULT WHEEL
========================================================= */

const DEFAULT_WHEEL = {
  items: DEFAULT_ITEMS,
  wheelColor: "#6C4BFF",
  pointerColor: "#FFD54F",
  spinsPerPlayer: 1,
  autoSpin: false,
  showResult: true,
  allowReplay: false,
};

/* =========================================================
   HELPERS
========================================================= */

const cloneItems = (items) => {
  return items.map((item) => ({
    ...item,
  }));
};

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return Boolean(value);
};

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/* =========================================================
   COMPONENT
========================================================= */

const WheelGameEditor = ({ teacherId, game = null, onSuccess, onBack }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  /* =======================================================
     WHEEL
  ======================================================= */

  const [items, setItems] = useState(cloneItems(DEFAULT_ITEMS));

  const [wheelColor, setWheelColor] = useState(DEFAULT_WHEEL.wheelColor);

  const [pointerColor, setPointerColor] = useState(DEFAULT_WHEEL.pointerColor);

  /* =======================================================
     THEME
  ======================================================= */

  const [primaryColor, setPrimaryColor] = useState(DEFAULT_THEME.primary);

  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_THEME.secondary);

  const [fontFamily, setFontFamily] = useState(DEFAULT_THEME.font);

  const [borderRadius, setBorderRadius] = useState(DEFAULT_THEME.borderRadius);

  /* =======================================================
     BACKGROUND
  ======================================================= */

  const [backgroundColor, setBackgroundColor] = useState(
    DEFAULT_BACKGROUND.color,
  );

  /* =======================================================
     PREVIEW
  ======================================================= */

  const [isSpinning, setIsSpinning] = useState(false);

  const [rotationDegree, setRotationDegree] = useState(0);

  const [previewResult, setPreviewResult] = useState(null);

  /* =======================================================
     FILE STATE
  ======================================================= */

  const [thumbnail, setThumbnail] = useState(null);

  const [background, setBackground] = useState(null);

  const [backgroundMusic, setBackgroundMusic] = useState(null);

  const [correctSound, setCorrectSound] = useState(null);

  const [wrongSound, setWrongSound] = useState(null);

  const [spinSound, setSpinSound] = useState(null);

  const [winSound, setWinSound] = useState(null);

  const isEdit = Boolean(game);

  /* =========================================================
     LOAD GAME
  ========================================================= */

  useEffect(() => {
    if (!game) {
      form.setFieldsValue({
        name: "",
        description: "",

        ...DEFAULT_SETTINGS,

        timeLimit: DEFAULT_SETTINGS.timeLimit,

        spinsPerPlayer: DEFAULT_WHEEL.spinsPerPlayer,

        autoSpin: DEFAULT_WHEEL.autoSpin,

        showResult: DEFAULT_WHEEL.showResult,

        allowReplay: DEFAULT_WHEEL.allowReplay,
      });

      setItems(cloneItems(DEFAULT_ITEMS));

      setWheelColor(DEFAULT_WHEEL.wheelColor);

      setPointerColor(DEFAULT_WHEEL.pointerColor);

      setPrimaryColor(DEFAULT_THEME.primary);

      setSecondaryColor(DEFAULT_THEME.secondary);

      setFontFamily(DEFAULT_THEME.font);

      setBorderRadius(DEFAULT_THEME.borderRadius);

      setBackgroundColor(DEFAULT_BACKGROUND.color);

      setThumbnail(null);

      setBackground(null);

      setBackgroundMusic(null);

      setCorrectSound(null);

      setWrongSound(null);

      setSpinSound(null);

      setWinSound(null);

      return;
    }

    const settings = game?.settings || {};

    const wheel = game?.wheel || {};

    const theme = game?.theme || {};

    const gameBackground = game?.background || {};

    const media = game?.media || {};

    /* =====================================================
       BASIC
    ===================================================== */

    form.setFieldsValue({
      name: game?.name || "",

      description: game?.description || "",

      timeLimit: normalizeNumber(
        settings?.timeLimit,
        DEFAULT_SETTINGS.timeLimit,
      ),

      shuffleQuestions: normalizeBoolean(
        settings?.shuffleQuestions,
        DEFAULT_SETTINGS.shuffleQuestions,
      ),

      shuffleAnswers: normalizeBoolean(
        settings?.shuffleAnswers,
        DEFAULT_SETTINGS.shuffleAnswers,
      ),

      showScore: normalizeBoolean(
        settings?.showScore,
        DEFAULT_SETTINGS.showScore,
      ),

      showTimer: normalizeBoolean(
        settings?.showTimer,
        DEFAULT_SETTINGS.showTimer,
      ),

      showProgress: normalizeBoolean(
        settings?.showProgress,
        DEFAULT_SETTINGS.showProgress,
      ),

      allowHint: normalizeBoolean(
        settings?.allowHint,
        DEFAULT_SETTINGS.allowHint,
      ),

      allowSkip: normalizeBoolean(
        settings?.allowSkip,
        DEFAULT_SETTINGS.allowSkip,
      ),

      spinsPerPlayer: normalizeNumber(
        wheel?.spinsPerPlayer,
        DEFAULT_WHEEL.spinsPerPlayer,
      ),

      autoSpin: normalizeBoolean(wheel?.autoSpin, DEFAULT_WHEEL.autoSpin),

      showResult: normalizeBoolean(wheel?.showResult, DEFAULT_WHEEL.showResult),

      allowReplay: normalizeBoolean(
        wheel?.allowReplay,
        DEFAULT_WHEEL.allowReplay,
      ),
    });

    /* =====================================================
       ITEMS
    ===================================================== */

    if (Array.isArray(wheel?.items) && wheel.items.length > 0) {
      const loadedItems = wheel.items.map((item, index) => ({
        id: item?.id ?? index + 1,

        label: item?.label || "",

        value: item?.value || "",

        color: item?.color || COLOR_LIST[index % COLOR_LIST.length],

        probability: normalizeNumber(item?.probability, 0),
      }));

      setItems(loadedItems);
    } else {
      /*
       * Game 10 hiện tại wheel.items = [].
       *
       * Cho editor một bộ item mặc định để giáo viên
       * có thể bắt đầu cấu hình.
       */
      setItems(cloneItems(DEFAULT_ITEMS));
    }

    /* =====================================================
       WHEEL COLORS
    ===================================================== */

    const loadedWheelColor =
      wheel?.wheelColor || theme?.primary || DEFAULT_WHEEL.wheelColor;

    const loadedPointerColor =
      wheel?.pointerColor || theme?.secondary || DEFAULT_WHEEL.pointerColor;

    setWheelColor(loadedWheelColor);

    setPointerColor(loadedPointerColor);

    /* =====================================================
       THEME
    ===================================================== */

    setPrimaryColor(theme?.primary || DEFAULT_THEME.primary);

    setSecondaryColor(theme?.secondary || DEFAULT_THEME.secondary);

    setFontFamily(theme?.font || DEFAULT_THEME.font);

    setBorderRadius(
      normalizeNumber(theme?.borderRadius, DEFAULT_THEME.borderRadius),
    );

    /* =====================================================
       BACKGROUND
    ===================================================== */

    setBackgroundColor(gameBackground?.color || DEFAULT_BACKGROUND.color);

    /* =====================================================
       FILE STATE
    ===================================================== */

    setThumbnail(null);

    setBackground(null);

    setBackgroundMusic(null);

    setCorrectSound(null);

    setWrongSound(null);

    setSpinSound(null);

    setWinSound(null);

    console.log("EDIT WHEEL GAME:", {
      game,
      settings,
      wheel,
      theme,
      background: gameBackground,
      media,
    });
  }, [game, form]);

  /* =========================================================
     PROBABILITY
  ========================================================= */

  const totalProbability = useMemo(() => {
    return items.reduce(
      (total, item) => total + normalizeNumber(item?.probability, 0),
      0,
    );
  }, [items]);

  const isProbabilityValid = Math.abs(totalProbability - 100) < 0.01;

  /* =========================================================
     ADD ITEM
  ========================================================= */

  const addItem = () => {
    const maxId =
      items.length > 0
        ? Math.max(...items.map((item) => normalizeNumber(item?.id, 0)))
        : 0;

    const newId = maxId + 1;

    const color = COLOR_LIST[items.length % COLOR_LIST.length];

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        label: `Phần thưởng ${newId}`,
        value: "",
        color,
        probability: 0,
      },
    ]);
  };

  /* =========================================================
     UPDATE ITEM
  ========================================================= */

  const updateItem = (id, field, value) => {
    setItems((prev) =>
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

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

  const removeItem = (id) => {
    if (items.length <= 2) {
      message.warning("Vòng quay phải có ít nhất 2 ô");

      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  /* =========================================================
     DISTRIBUTE PROBABILITY
  ========================================================= */

  const autoDistributeProbability = () => {
    if (!items.length) {
      return;
    }

    const base = Math.floor(100 / items.length);

    const remainder = 100 - base * items.length;

    setItems((prev) =>
      prev.map((item, index) => ({
        ...item,

        probability: index === 0 ? base + remainder : base,
      })),
    );

    message.success("Đã tự động chia tỷ lệ 100%");
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const beforeUpload = (setter) => (file) => {
    setter(file);

    return false;
  };

  /* =========================================================
     TEST SPIN
  ========================================================= */

  const handleTestSpin = () => {
    if (isSpinning || items.length < 2) {
      return;
    }

    if (!isProbabilityValid) {
      message.warning("Hãy chỉnh tổng tỷ lệ về 100% trước khi quay thử");

      return;
    }

    setPreviewResult(null);

    setIsSpinning(true);

    const random = Math.random() * 360;

    const randomSpin = 1800 + random;

    setRotationDegree((prev) => prev + randomSpin);

    /*
     * Chọn kết quả theo probability.
     */

    const randomProbability = Math.random() * 100;

    let cumulative = 0;

    let selected = items[items.length - 1];

    for (const item of items) {
      cumulative += Number(item.probability) || 0;

      if (randomProbability <= cumulative) {
        selected = item;
        break;
      }
    }

    setTimeout(() => {
      setIsSpinning(false);

      setPreviewResult(selected);

      message.success(
        `Kết quả: ${selected?.label || selected?.value || "Phần thưởng"}`,
      );
    }, 3500);
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      /* ===================================================
         VALIDATE ITEMS
      =================================================== */

      if (items.length < 2) {
        message.error("Vòng quay phải có ít nhất 2 ô");

        return;
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        if (!String(item?.label || "").trim()) {
          message.error(`Ô số ${index + 1} chưa có tên`);

          return;
        }

        const probability = Number(item?.probability);

        if (
          !Number.isFinite(probability) ||
          probability < 0 ||
          probability > 100
        ) {
          message.error(`Tỷ lệ ô ${index + 1} không hợp lệ`);

          return;
        }
      }

      if (!isProbabilityValid) {
        message.error(
          `Tổng tỷ lệ phải bằng 100%. Hiện tại: ${totalProbability}%`,
        );

        return;
      }

      setLoading(true);

      /* ===================================================
         WHEEL
      =================================================== */

      const wheelData = {
        items: items.map((item, index) => ({
          id: item?.id ?? index + 1,

          label: String(item?.label || "").trim(),

          value: item?.value || "",

          color: item?.color || COLOR_LIST[index % COLOR_LIST.length],

          probability: Number(item?.probability || 0),
        })),

        wheelColor: wheelColor || DEFAULT_WHEEL.wheelColor,

        pointerColor: pointerColor || DEFAULT_WHEEL.pointerColor,

        spinsPerPlayer: Number(
          values?.spinsPerPlayer || DEFAULT_WHEEL.spinsPerPlayer,
        ),

        autoSpin: Boolean(values?.autoSpin),

        showResult: Boolean(values?.showResult),

        allowReplay: Boolean(values?.allowReplay),
      };

      /* ===================================================
         SETTINGS
      =================================================== */

      const settings = {
        timeLimit: Number(values?.timeLimit || DEFAULT_SETTINGS.timeLimit),

        shuffleQuestions: Boolean(values?.shuffleQuestions),

        shuffleAnswers: Boolean(values?.shuffleAnswers),

        showScore: Boolean(values?.showScore),

        showTimer: Boolean(values?.showTimer),

        showProgress: Boolean(values?.showProgress),

        allowHint: Boolean(values?.allowHint),

        allowSkip: Boolean(values?.allowSkip),
      };

      /* ===================================================
         BACKGROUND
      =================================================== */

      const backgroundConfig = {
        color:
          backgroundColor ||
          game?.background?.color ||
          DEFAULT_BACKGROUND.color,

        image: background || game?.background?.image || null,
      };

      /* ===================================================
         MEDIA
      =================================================== */

      const media = {
        backgroundMusic:
          backgroundMusic || game?.media?.backgroundMusic || null,

        correctSound: correctSound || game?.media?.correctSound || null,

        wrongSound: wrongSound || game?.media?.wrongSound || null,

        spinSound: spinSound || game?.media?.spinSound || null,

        winSound: winSound || game?.media?.winSound || null,
      };

      /* ===================================================
         THEME
      =================================================== */

      const theme = {
        primary: primaryColor || wheelColor || DEFAULT_THEME.primary,

        secondary: secondaryColor || pointerColor || DEFAULT_THEME.secondary,

        font: fontFamily || game?.theme?.font || DEFAULT_THEME.font,

        borderRadius: Number(
          borderRadius ||
            game?.theme?.borderRadius ||
            DEFAULT_THEME.borderRadius,
        ),
      };

      /* ===================================================
         GAME DATA
      =================================================== */

      const gameData = {
        teacher_id: teacherId || game?.teacher_id || null,

        name: String(values?.name || "").trim(),

        description: values?.description || "",

        type: "wheel",

        /* BACKGROUND */

        background: backgroundConfig,

        /* THEME */

        theme,

        /* SETTINGS */

        settings,

        /* MEDIA */

        media,

        /* OTHER GAME DATA */

        questions: [],

        pairs: [],

        cards: [],

        crossword: game?.crossword || {},

        sorting: game?.sorting || {},

        dragDrop: game?.dragDrop || {},

        /* WHEEL */

        wheel: wheelData,

        /* THUMBNAIL */

        thumbnail: thumbnail || game?.thumbnail || null,
      };

      console.log("====================================");

      console.log("WHEEL GAME DATA:", gameData);

      console.log("====================================");

      /* ===================================================
         CREATE / UPDATE
      =================================================== */

      const result = isEdit
        ? await updateGame(game.id, gameData)
        : await createGame(gameData);

      if (!result?.success) {
        throw new Error(result?.message || "Không thể lưu trò chơi");
      }

      message.success(
        isEdit
          ? "Cập nhật vòng quay thành công 🎉"
          : "Tạo vòng quay thành công 🎉",
      );

      onSuccess?.(result?.data);
    } catch (error) {
      console.error("WHEEL SAVE ERROR:", error);

      if (!error?.errorFields) {
        message.error(error?.message || "Không thể lưu vòng quay");
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     WHEEL PREVIEW
  ========================================================= */

  const renderWheelPreview = () => {
    if (!items.length) {
      return null;
    }

    const size = 300;

    const segment = 360 / items.length;

    return (
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          margin: "30px auto",
        }}
      >
        {/* ================================================
            POINTER
        ================================================= */}

        <div
          style={{
            position: "absolute",

            top: -8,

            left: "50%",

            transform: "translateX(-50%)",

            width: 0,

            height: 0,

            borderLeft: "18px solid transparent",

            borderRight: "18px solid transparent",

            borderTop: `40px solid ${pointerColor}`,

            zIndex: 20,

            filter: "drop-shadow(0 4px 5px rgba(0,0,0,.25))",
          }}
        />

        {/* ================================================
            WHEEL
        ================================================= */}

        <div
          style={{
            width: size,

            height: size,

            borderRadius: "50%",

            background: `conic-gradient(
              ${items
                .map(
                  (item, index) =>
                    `${item.color} ${index * segment}deg ${
                      (index + 1) * segment
                    }deg`,
                )
                .join(", ")}
            )`,

            border: `8px solid ${wheelColor}`,

            boxShadow: "0 14px 40px rgba(0,0,0,.16)",

            position: "relative",

            transform: `rotate(${rotationDegree}deg)`,

            transition: isSpinning
              ? "transform 3.5s cubic-bezier(0.15, 0.9, 0.15, 1)"
              : "none",

            overflow: "hidden",
          }}
        >
          {/* ============================================
              LABELS
          ============================================ */}

          {items.map((item, index) => {
            const angle = index * segment + segment / 2;

            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",

                  left: "50%",

                  top: "50%",

                  width: 90,

                  marginLeft: -45,

                  textAlign: "center",

                  transform: `
                      rotate(${angle}deg)
                      translateY(-105px)
                      rotate(-${angle}deg)
                    `,

                  transformOrigin: "center",

                  color: "#ffffff",

                  fontWeight: 800,

                  fontSize: 12,

                  textShadow: "0 2px 4px rgba(0,0,0,.5)",

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: "nowrap",

                  pointerEvents: "none",
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {/* ================================================
            CENTER
        ================================================= */}

        <div
          onClick={handleTestSpin}
          style={{
            position: "absolute",

            width: 68,

            height: 68,

            borderRadius: "50%",

            background: "#ffffff",

            border: `6px solid ${wheelColor}`,

            left: "50%",

            top: "50%",

            transform: "translate(-50%, -50%)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            boxShadow: "0 6px 20px rgba(0,0,0,.22)",

            cursor: isSpinning ? "not-allowed" : "pointer",

            zIndex: 30,
          }}
        >
          <RotateCw size={28} color={wheelColor} />
        </div>
      </div>
    );
  };

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  const FileUpload = ({ title, icon, accept, file, setter, existing }) => {
    const existingUrl = existing ? getGameFileUrl(existing) : null;

    return (
      <div
        style={{
          border: "1px dashed #d9d9d9",

          borderRadius: 14,

          padding: 16,

          background: "#fafafa",

          textAlign: "center",

          minHeight: 140,

          display: "flex",

          flexDirection: "column",

          justifyContent: "center",
        }}
      >
        <Space
          style={{
            marginBottom: 10,
          }}
        >
          {icon}

          <Text strong>{title}</Text>
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
              borderRadius: 9,
            }}
          >
            {file ? "Đổi file" : "Chọn tệp"}
          </Button>
        </Upload>

        {file && (
          <div
            style={{
              marginTop: 8,
            }}
          >
            <Tag color="purple" icon={<FileCheck size={12} />}>
              {file.name}
            </Tag>
          </div>
        )}

        {!file && existingUrl && (
          <div
            style={{
              marginTop: 8,
            }}
          >
            <Tag color="blue">Đang có file</Tag>
          </div>
        )}
      </div>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",

        padding: 24,

        background: backgroundColor || "#F8F9FC",

        fontFamily: fontFamily || "Baloo 2, sans-serif",
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

          gap: 16,

          marginBottom: 24,

          background: "#ffffff",

          padding: "16px 24px",

          borderRadius: 18,

          boxShadow: "0 3px 15px rgba(0,0,0,.05)",
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

                fontWeight: 800,
              }}
            >
              🎡 {isEdit ? "Chỉnh sửa vòng quay" : "Tạo vòng quay mới"}
            </Title>

            <Text type="secondary">
              Tạo trò chơi vòng quay tương tác cho học sinh
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

            fontWeight: 700,

            padding: "0 28px",

            boxShadow: `0 5px 15px ${primaryColor}45`,
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
            {/* =================================================
                BASIC
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
            >
              <Title
                level={5}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Settings size={18} color={primaryColor} />
                Thông tin cơ bản
              </Title>

              <Form.Item
                name="name"
                label="Tên trò chơi"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên trò chơi",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: Vòng quay may mắn"
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>

              <Form.Item name="description" label="Mô tả">
                <TextArea
                  rows={3}
                  placeholder="Nhập mô tả trò chơi..."
                  style={{
                    borderRadius: 10,
                  }}
                />
              </Form.Item>
            </Card>

            {/* =================================================
                ITEMS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
              title={
                <Space>
                  <Trophy size={18} color={primaryColor} />
                  Cấu hình ô vòng quay
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title="Tự động chia đều tỷ lệ">
                    <Button
                      icon={<Dice5 size={16} />}
                      onClick={autoDistributeProbability}
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Chia đều
                    </Button>
                  </Tooltip>

                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={addItem}
                    style={{
                      borderRadius: 10,

                      background: primaryColor,

                      borderColor: primaryColor,
                    }}
                  >
                    Thêm ô
                  </Button>
                </Space>
              }
            >
              {/* =================================================
                  PROBABILITY
              ================================================= */}

              <div
                style={{
                  padding: 16,

                  borderRadius: 14,

                  background: isProbabilityValid ? "#f6ffed" : "#fff2f0",

                  border: `1px solid ${
                    isProbabilityValid ? "#b7eb8f" : "#ffccc7"
                  }`,

                  marginBottom: 18,

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",
                }}
              >
                <div>
                  <Text
                    strong
                    style={{
                      color: isProbabilityValid ? "#389e0d" : "#cf1322",
                    }}
                  >
                    Tổng tỷ lệ: {totalProbability}%
                  </Text>

                  <Text
                    type="secondary"
                    style={{
                      display: "block",

                      fontSize: 12,

                      marginTop: 3,
                    }}
                  >
                    {isProbabilityValid
                      ? "Tỷ lệ đã hợp lệ"
                      : "Tổng tỷ lệ phải bằng 100%"}
                  </Text>
                </div>

                <Progress
                  type="circle"
                  percent={Math.min(totalProbability, 100)}
                  width={48}
                  strokeColor={isProbabilityValid ? "#52c41a" : "#ff4d4f"}
                />
              </div>

              {/* =================================================
                  ITEMS LIST
              ================================================= */}

              <div
                style={{
                  display: "flex",

                  flexDirection: "column",

                  gap: 12,

                  maxHeight: 550,

                  overflowY: "auto",

                  paddingRight: 4,
                }}
              >
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 14,

                      border: "1px solid #e2e8f0",

                      borderRadius: 14,

                      background: "#ffffff",
                    }}
                  >
                    <Row gutter={[10, 10]} align="middle">
                      <Col xs={4} sm={2}>
                        <div
                          style={{
                            width: 32,

                            height: 32,

                            borderRadius: "50%",

                            background: item.color,

                            color: "#fff",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            fontWeight: 800,
                          }}
                        >
                          {index + 1}
                        </div>
                      </Col>

                      <Col xs={20} sm={7}>
                        <Input
                          value={item.label}
                          placeholder="Tên phần thưởng"
                          onChange={(e) =>
                            updateItem(item.id, "label", e.target.value)
                          }
                          style={{
                            borderRadius: 8,
                          }}
                        />
                      </Col>

                      <Col xs={12} sm={6}>
                        <Input
                          value={item.value}
                          placeholder="Giá trị"
                          onChange={(e) =>
                            updateItem(item.id, "value", e.target.value)
                          }
                          style={{
                            borderRadius: 8,
                          }}
                        />
                      </Col>

                      <Col xs={8} sm={4}>
                        <InputNumber
                          min={0}
                          max={100}
                          addonAfter="%"
                          value={item.probability}
                          onChange={(value) =>
                            updateItem(item.id, "probability", value ?? 0)
                          }
                          style={{
                            width: "100%",
                          }}
                        />
                      </Col>

                      <Col xs={4} sm={2}>
                        <ColorPicker
                          value={item.color}
                          onChange={(color) =>
                            updateItem(item.id, "color", color.toHexString())
                          }
                        />
                      </Col>

                      <Col
                        xs={24}
                        sm={3}
                        style={{
                          textAlign: "right",
                        }}
                      >
                        <Button
                          danger
                          type="text"
                          icon={<Trash2 size={17} />}
                          onClick={() => removeItem(item.id)}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>

            {/* =================================================
                SETTINGS
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
            >
              <Title level={5}>⚙️ Cấu hình lượt chơi</Title>

              <Row gutter={[16, 12]}>
                <Col xs={24} md={12}>
                  <Form.Item name="timeLimit" label="Thời gian chơi (giây)">
                    <InputNumber
                      min={10}
                      max={3600}
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item name="spinsPerPlayer" label="Số lượt quay / người">
                    <InputNumber
                      min={1}
                      max={100}
                      style={{
                        width: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>

                {/* AUTO SPIN */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="autoSpin"
                    label={
                      <Space>
                        <Zap size={14} />
                        Tự động quay
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* RESULT */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showResult"
                    label={
                      <Space>
                        <Eye size={14} />
                        Hiển thị kết quả
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* REPLAY */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowReplay"
                    label={
                      <Space>
                        <Repeat size={14} />
                        Cho phép quay lại
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* SCORE */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showScore"
                    label="Hiển thị điểm"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* TIMER */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showTimer"
                    label={
                      <Space>
                        <Clock size={14} />
                        Hiển thị thời gian
                      </Space>
                    }
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* PROGRESS */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="showProgress"
                    label="Hiển thị tiến trình"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* HINT */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowHint"
                    label="Cho phép gợi ý"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* SKIP */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="allowSkip"
                    label="Cho phép bỏ qua"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* SHUFFLE QUESTIONS */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleQuestions"
                    label="Trộn câu hỏi"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                {/* SHUFFLE ANSWERS */}

                <Col xs={12} md={8}>
                  <Form.Item
                    name="shuffleAnswers"
                    label="Trộn đáp án"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* =================================================
                THEME
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
                marginBottom: 20,
              }}
            >
              <Title
                level={5}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Palette size={18} color={primaryColor} />
                Giao diện
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div
                    style={{
                      padding: 14,

                      border: "1px solid #f0f0f0",

                      borderRadius: 12,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        marginBottom: 8,
                      }}
                    >
                      Màu chính
                    </Text>

                    <ColorPicker
                      value={primaryColor}
                      onChange={(color) => {
                        const value = color.toHexString();

                        setPrimaryColor(value);

                        setWheelColor(value);
                      }}
                      showText
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div
                    style={{
                      padding: 14,

                      border: "1px solid #f0f0f0",

                      borderRadius: 12,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        marginBottom: 8,
                      }}
                    >
                      Màu phụ
                    </Text>

                    <ColorPicker
                      value={secondaryColor}
                      onChange={(color) => {
                        const value = color.toHexString();

                        setSecondaryColor(value);

                        setPointerColor(value);
                      }}
                      showText
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div
                    style={{
                      padding: 14,

                      border: "1px solid #f0f0f0",

                      borderRadius: 12,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        marginBottom: 8,
                      }}
                    >
                      Bo góc
                    </Text>

                    <InputNumber
                      min={0}
                      max={50}
                      value={borderRadius}
                      onChange={(value) =>
                        setBorderRadius(value ?? DEFAULT_THEME.borderRadius)
                      }
                      addonAfter="px"
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div
                    style={{
                      padding: 14,

                      border: "1px solid #f0f0f0",

                      borderRadius: 12,
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        display: "block",

                        marginBottom: 8,
                      }}
                    >
                      Màu nền
                    </Text>

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

            {/* =================================================
                MEDIA
            ================================================= */}

            <Card
              bordered={false}
              style={{
                borderRadius: 18,
              }}
            >
              <Title level={5}>🎨 Hình ảnh & Âm thanh</Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh thumbnail"
                    icon={<ImagePlus size={17} />}
                    accept="image/*"
                    file={thumbnail}
                    setter={setThumbnail}
                    existing={game?.thumbnail}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Ảnh nền"
                    icon={<ImagePlus size={17} />}
                    accept="image/*"
                    file={background}
                    setter={setBackground}
                    existing={game?.background?.image}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Nhạc nền"
                    icon={<Music size={17} />}
                    accept="audio/*"
                    file={backgroundMusic}
                    setter={setBackgroundMusic}
                    existing={game?.media?.backgroundMusic}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh đúng"
                    icon={<CheckCircle2 size={17} />}
                    accept="audio/*"
                    file={correctSound}
                    setter={setCorrectSound}
                    existing={game?.media?.correctSound}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <FileUpload
                    title="Âm thanh sai"
                    icon={<XCircle size={17} />}
                    accept="audio/*"
                    file={wrongSound}
                    setter={setWrongSound}
                    existing={game?.media?.wrongSound}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Âm thanh quay"
                    icon={<Volume2 size={17} />}
                    accept="audio/*"
                    file={spinSound}
                    setter={setSpinSound}
                    existing={game?.media?.spinSound}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <FileUpload
                    title="Âm thanh trúng thưởng"
                    icon={<Trophy size={17} />}
                    accept="audio/*"
                    file={winSound}
                    setter={setWinSound}
                    existing={game?.media?.winSound}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* =================================================
              RIGHT PREVIEW
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
                  borderRadius: 18,

                  boxShadow: "0 5px 24px rgba(0,0,0,.05)",
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

                    <Text strong>Xem trước</Text>
                  </Space>

                  <Button
                    size="small"
                    type="dashed"
                    icon={<PlayCircle size={14} />}
                    loading={isSpinning}
                    onClick={handleTestSpin}
                  >
                    Quay thử
                  </Button>
                </div>

                <Divider />

                {/* =================================================
                    WHEEL
                ================================================= */}

                <div
                  style={{
                    background: `linear-gradient(
                        145deg,
                        ${primaryColor}18,
                        ${secondaryColor}25
                      )`,

                    borderRadius: 20,

                    padding: "24px 10px",

                    textAlign: "center",

                    overflow: "hidden",
                  }}
                >
                  {renderWheelPreview()}

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Bấm vào giữa vòng quay để thử
                  </Text>

                  {/* =================================================
                      RESULT
                  ================================================= */}

                  {previewResult && !isSpinning && (
                    <div
                      style={{
                        marginTop: 20,

                        padding: "14px 18px",

                        borderRadius: 14,

                        background: "#ffffff",

                        border: `2px solid ${primaryColor}`,

                        boxShadow: `0 5px 18px ${primaryColor}25`,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          display: "block",

                          fontSize: 12,
                        }}
                      >
                        🎉 Kết quả
                      </Text>

                      <Text
                        strong
                        style={{
                          display: "block",

                          marginTop: 4,

                          fontSize: 18,

                          color: primaryColor,
                        }}
                      >
                        {previewResult.label}
                      </Text>

                      {previewResult.value && (
                        <Tag
                          color="gold"
                          style={{
                            marginTop: 8,
                            borderRadius: 8,
                          }}
                        >
                          {previewResult.value}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>

                <Divider />

                {/* =================================================
                    SUMMARY
                ================================================= */}

                <Title
                  level={5}
                  style={{
                    fontSize: 14,
                  }}
                >
                  📊 Thông tin vòng quay
                </Title>

                <Row gutter={[10, 10]}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        background: "#fafafa",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 11,
                        }}
                      >
                        Số ô
                      </Text>

                      <Text
                        strong
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {items.length}
                      </Text>
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        background: "#fafafa",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          display: "block",
                          fontSize: 11,
                        }}
                      >
                        Số lượt
                      </Text>

                      <Text
                        strong
                        style={{
                          fontSize: 18,
                        }}
                      >
                        {form.getFieldValue("spinsPerPlayer") || 1}
                      </Text>
                    </div>
                  </Col>
                </Row>

                <Divider />

                {/* =================================================
                    COLORS
                ================================================= */}

                <Title
                  level={5}
                  style={{
                    fontSize: 14,

                    display: "flex",

                    alignItems: "center",

                    gap: 6,
                  }}
                >
                  <Palette size={16} color={primaryColor} />
                  Tùy chỉnh màu sắc
                </Title>

                <Row gutter={[12, 12]}>
                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        border: "1px solid #f0f0f0",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",

                          marginBottom: 8,
                        }}
                      >
                        Màu vòng
                      </Text>

                      <ColorPicker
                        value={wheelColor}
                        onChange={(color) => {
                          const value = color.toHexString();

                          setWheelColor(value);

                          setPrimaryColor(value);
                        }}
                        showText
                      />
                    </div>
                  </Col>

                  <Col span={12}>
                    <div
                      style={{
                        padding: 12,

                        border: "1px solid #f0f0f0",

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 12,

                          display: "block",

                          marginBottom: 8,
                        }}
                      >
                        Màu kim
                      </Text>

                      <ColorPicker
                        value={pointerColor}
                        onChange={(color) => {
                          const value = color.toHexString();

                          setPointerColor(value);

                          setSecondaryColor(value);
                        }}
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

export default WheelGameEditor;
