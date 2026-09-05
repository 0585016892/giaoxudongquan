import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  StarFilled,
  TrophyFilled,
} from "@ant-design/icons";
import { RotateCw, Sparkles, Volume2, VolumeX } from "lucide-react";

import { getGameFileUrl } from "../../../api/gameApi";

const { Title, Text } = Typography;

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_ITEMS = [
  {
    id: 1,
    label: "10 điểm",
    value: "10",
    color: "#6C4BFF",
    probability: 25,
  },
  {
    id: 2,
    label: "20 điểm",
    value: "20",
    color: "#1677FF",
    probability: 25,
  },
  {
    id: 3,
    label: "30 điểm",
    value: "30",
    color: "#13C2C2",
    probability: 25,
  },
  {
    id: 4,
    label: "50 điểm",
    value: "50",
    color: "#FF7A45",
    probability: 25,
  },
];

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
   HELPERS
========================================================= */

const normalizeNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const normalizeBoolean = (value, fallback = false) => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return Boolean(value);
};

const getFileUrl = (file) => {
  if (!file) {
    return null;
  }

  if (typeof file === "string") {
    try {
      return getGameFileUrl(file);
    } catch {
      return file;
    }
  }

  if (file?.url) {
    return file.url;
  }

  if (file?.path) {
    try {
      return getGameFileUrl(file.path);
    } catch {
      return file.path;
    }
  }

  if (file?.response?.url) {
    return file.response.url;
  }

  return null;
};

/* =========================================================
   COMPONENT
========================================================= */

const WheelGame = ({ game, onComplete, onBack }) => {
  /* =======================================================
     RAW GAME DATA
  ======================================================= */

  const settings = game?.settings || {};
  const wheel = game?.wheel || {};
  const theme = game?.theme || {};

  /* =======================================================
     NORMALIZED CONFIG
  ======================================================= */

  const primaryColor = theme?.primary || wheel?.wheelColor || "#6C4BFF";

  const secondaryColor = theme?.secondary || wheel?.pointerColor || "#FFD54F";

  const fontFamily = theme?.font || "Baloo 2, sans-serif";

  const borderRadius = normalizeNumber(theme?.borderRadius, 20);

  const timeLimit = normalizeNumber(settings?.timeLimit, 60);

  const spinsPerPlayer = Math.max(1, normalizeNumber(wheel?.spinsPerPlayer, 1));

  const autoSpin = normalizeBoolean(wheel?.autoSpin, false);

  const showResult = normalizeBoolean(wheel?.showResult, true);

  const allowReplay = normalizeBoolean(wheel?.allowReplay, false);

  const showScore = normalizeBoolean(settings?.showScore, true);

  const showTimer = normalizeBoolean(settings?.showTimer, true);

  /* =======================================================
     BACKGROUND
     
     Đưa background vào useMemo để tránh warning
     react-hooks/exhaustive-deps.
  ======================================================= */

  const background = useMemo(() => {
    return game?.background || {};
  }, [game?.background]);

  const backgroundImage = useMemo(() => {
    return getFileUrl(background?.image);
  }, [background?.image]);

  /* =======================================================
     ITEMS
     
     Game #10 hiện tại:
     
     wheel.items: []
     
     => dùng DEFAULT_ITEMS để game vẫn có thể chơi.
  ======================================================= */

  const items = useMemo(() => {
    const rawItems = Array.isArray(wheel?.items) ? wheel.items : [];

    if (rawItems.length === 0) {
      return DEFAULT_ITEMS.map((item) => ({
        ...item,
      }));
    }

    return rawItems.map((item, index) => ({
      id: item?.id ?? index + 1,

      label: String(item?.label || "").trim() || `Phần thưởng ${index + 1}`,

      value:
        item?.value !== undefined && item?.value !== null
          ? String(item.value)
          : "",

      color: item?.color || COLOR_LIST[index % COLOR_LIST.length],

      probability: Math.max(0, normalizeNumber(item?.probability, 0)),
    }));
  }, [wheel?.items]);

  /* =======================================================
     TOTAL PROBABILITY
     
     Không tạo biến thừa.
  ======================================================= */

  const totalProbability = useMemo(() => {
    return items.reduce(
      (total, item) => total + normalizeNumber(item?.probability, 0),
      0,
    );
  }, [items]);

  /* =======================================================
     STATE
  ======================================================= */

  const [rotation, setRotation] = useState(0);

  const [isSpinning, setIsSpinning] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [showResultModal, setShowResultModal] = useState(false);

  const [score, setScore] = useState(0);

  const [spinCount, setSpinCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [finished, setFinished] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(true);

  const [autoStarted, setAutoStarted] = useState(false);

  const spinTimeoutRef = useRef(null);

  const autoSpinTimeoutRef = useRef(null);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }

      if (autoSpinTimeoutRef.current) {
        clearTimeout(autoSpinTimeoutRef.current);
      }
    };
  }, []);

  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = useCallback((seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);

    const minutes = Math.floor(safeSeconds / 60);

    const secs = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0",
    )}`;
  }, []);

  /* =======================================================
     SELECT RANDOM ITEM BY PROBABILITY
  ======================================================= */

  const selectWeightedItem = useCallback(() => {
    if (!items.length) {
      return null;
    }

    const validItems = items.filter(
      (item) => normalizeNumber(item?.probability, 0) > 0,
    );

    if (!validItems.length) {
      return items[Math.floor(Math.random() * items.length)];
    }

    const total = validItems.reduce(
      (sum, item) => sum + normalizeNumber(item?.probability, 0),
      0,
    );

    if (total <= 0) {
      return validItems[Math.floor(Math.random() * validItems.length)];
    }

    let random = Math.random() * total;

    for (const item of validItems) {
      random -= normalizeNumber(item?.probability, 0);

      if (random <= 0) {
        return item;
      }
    }

    return validItems[validItems.length - 1];
  }, [items]);

  /* =======================================================
     GET ITEM INDEX
  ======================================================= */

  const getItemIndex = useCallback(
    (item) => {
      if (!item) {
        return 0;
      }

      const index = items.findIndex((current) => current.id === item.id);

      return index >= 0 ? index : 0;
    },
    [items],
  );

  /* =======================================================
     CALCULATE ROTATION
     
     Pointer nằm ở phía trên.
     
     Vị trí giữa mỗi segment:
     
       0 độ = phía trên
  ======================================================= */

  const calculateTargetRotation = useCallback(
    (itemIndex) => {
      const segment = 360 / items.length;

      const centerAngle = itemIndex * segment + segment / 2;

      const targetAngle = 360 - centerAngle;

      const currentRotation = rotation;

      const currentNormalized = ((currentRotation % 360) + 360) % 360;

      const targetNormalized = ((targetAngle % 360) + 360) % 360;

      let difference = targetNormalized - currentNormalized;

      if (difference < 0) {
        difference += 360;
      }

      const extraRounds = 5 + Math.floor(Math.random() * 3);

      return currentRotation + extraRounds * 360 + difference;
    },
    [items.length, rotation],
  );

  /* =======================================================
     PLAY SOUND
     
     Data media có thể là:
     
     - string
     - object
     - uid object
  ======================================================= */

  const playSound = useCallback(
    (file) => {
      if (!audioEnabled || !file) {
        return;
      }

      const url = getFileUrl(file);

      if (!url) {
        return;
      }

      try {
        const audio = new Audio(url);

        audio.volume = 0.7;

        audio.play().catch(() => {});
      } catch {
        // Không làm crash game nếu browser chặn audio.
      }
    },
    [audioEnabled],
  );

  /* =======================================================
     COMPLETE
  ======================================================= */

  const completeGame = useCallback(
    (resultItem, finalScore) => {
      if (typeof onComplete !== "function") {
        return;
      }

      onComplete({
        score: finalScore,

        totalScore: finalScore,

        spinCount: spinCount + 1,

        result: resultItem,

        item: resultItem,

        gameId: game?.id,
      });
    },
    [game?.id, onComplete, spinCount],
  );

  /* =======================================================
     SPIN
  ======================================================= */
  const backgroundMusic = game?.media?.backgroundMusic || null;
  const handleSpin = useCallback(() => {
    if (isSpinning) {
      return;
    }

    if (finished) {
      return;
    }

    if (items.length < 2) {
      message.warning("Vòng quay cần ít nhất 2 phần thưởng.");
      return;
    }

    if (spinCount >= spinsPerPlayer) {
      message.info("Bạn đã hết lượt quay.");
      return;
    }

    const resultItem = selectWeightedItem();

    if (!resultItem) {
      message.error("Không có phần thưởng hợp lệ.");
      return;
    }

    const itemIndex = getItemIndex(resultItem);
    const targetRotation = calculateTargetRotation(itemIndex);

    setSelectedItem(null);
    setShowResultModal(false);
    setIsSpinning(true);
    setRotation(targetRotation);

    // Âm thanh quay
    playSound(backgroundMusic);

    spinTimeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setSelectedItem(resultItem);

      setSpinCount((previous) => previous + 1);

      const numericValue = Number(
        String(resultItem?.value || "").replace(/[^0-9.-]/g, ""),
      );

      const gainedScore = Number.isFinite(numericValue) ? numericValue : 0;

      setScore((previousScore) => {
        const nextScore = previousScore + gainedScore;

        if (showResult) {
          setShowResultModal(true);
        }

        message.success(`🎉 Chúc mừng! ${resultItem.label}`);

        return nextScore;
      });

      if (spinCount + 1 >= spinsPerPlayer && !allowReplay) {
        setFinished(true);
      }

      if (spinCount + 1 >= spinsPerPlayer) {
        completeGame(resultItem, score + gainedScore);
      }
    }, 3600);
  }, [
    allowReplay,
    backgroundMusic,
    calculateTargetRotation,
    completeGame,
    finished,
    getItemIndex,
    isSpinning,
    items.length,
    playSound,
    score,
    selectWeightedItem,
    showResult,
    spinCount,
    spinsPerPlayer,
  ]);

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (!showTimer) {
      return undefined;
    }

    if (finished) {
      return undefined;
    }

    if (timeLeft <= 0) {
      setFinished(true);

      message.warning("⏰ Hết thời gian!");

      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [finished, showTimer, timeLeft]);

  /* =======================================================
     AUTO SPIN
  ======================================================= */

  useEffect(() => {
    if (!autoSpin) {
      return undefined;
    }

    if (autoStarted) {
      return undefined;
    }

    if (finished) {
      return undefined;
    }

    if (isSpinning) {
      return undefined;
    }

    if (spinCount > 0) {
      return undefined;
    }

    autoSpinTimeoutRef.current = setTimeout(() => {
      setAutoStarted(true);

      handleSpin();
    }, 800);

    return () => {
      if (autoSpinTimeoutRef.current) {
        clearTimeout(autoSpinTimeoutRef.current);
      }
    };
  }, [autoSpin, autoStarted, finished, handleSpin, isSpinning, spinCount]);

  /* =======================================================
     REPLAY
  ======================================================= */

  const handleReplay = useCallback(() => {
    if (!allowReplay) {
      return;
    }

    setFinished(false);

    setSelectedItem(null);

    setShowResultModal(false);

    setSpinCount(0);

    setScore(0);

    setTimeLeft(timeLimit);

    setAutoStarted(false);

    message.info("🔄 Đã bắt đầu lại vòng quay.");
  }, [allowReplay, timeLimit]);

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset = useCallback(() => {
    if (isSpinning) {
      return;
    }

    setRotation(0);

    setSelectedItem(null);

    setShowResultModal(false);

    setSpinCount(0);

    setScore(0);

    setFinished(false);

    setTimeLeft(timeLimit);

    setAutoStarted(false);
  }, [isSpinning, timeLimit]);

  /* =======================================================
     WHEEL CSS
  ======================================================= */

  const wheelGradient = useMemo(() => {
    if (!items.length) {
      return primaryColor;
    }

    const segment = 360 / items.length;

    return `conic-gradient(${items
      .map((item, index) => {
        const start = index * segment;

        const end = (index + 1) * segment;

        return `${item.color} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  }, [items, primaryColor]);

  /* =======================================================
     WHEEL SIZE
  ======================================================= */

  const wheelSize = 440;

  /* =======================================================
     RENDER WHEEL LABEL
  ======================================================= */

  const renderWheelLabels = () => {
    const segment = 360 / items.length;

    return items.map((item, index) => {
      const angle = index * segment + segment / 2;

      return (
        <div
          key={item.id}
          style={{
            position: "absolute",

            left: "50%",

            top: "50%",

            width: 110,

            marginLeft: -55,

            transform: `
              rotate(${angle}deg)
              translateY(-165px)
              rotate(-${angle}deg)
            `,

            textAlign: "center",

            color: "#ffffff",

            fontWeight: 900,

            fontSize: 15,

            lineHeight: 1.15,

            textShadow: "0 2px 4px rgba(0,0,0,.45)",

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",

            pointerEvents: "none",
          }}
        >
          {item.label}
        </div>
      );
    });
  };

  /* =======================================================
     EMPTY GAME
  ======================================================= */

  if (!game) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          background: "#F8F9FC",

          padding: 24,

          fontFamily,
        }}
      >
        <Card
          style={{
            borderRadius,

            maxWidth: 500,

            width: "100%",
          }}
        >
          <Alert
            type="warning"
            showIcon
            message="Không tìm thấy trò chơi"
            description="Dữ liệu game không tồn tại."
          />
        </Card>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",

        padding: 24,

        fontFamily,

        backgroundColor: background?.color || "#F8F9FC",

        backgroundImage: backgroundImage ? `url("${backgroundImage}")` : "none",

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundAttachment: "fixed",

        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Card
        bordered={false}
        style={{
          maxWidth: 1250,

          margin: "0 auto 20px",

          borderRadius,

          boxShadow: "0 10px 35px rgba(108,75,255,.12)",

          border: `2px solid ${primaryColor}18`,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size={2}>
              <Text
                style={{
                  color: secondaryColor,

                  fontWeight: 900,

                  letterSpacing: 1,

                  textTransform: "uppercase",
                }}
              >
                ✨ Game Giáo Lý
              </Text>

              <Title
                level={2}
                style={{
                  margin: 0,

                  color: primaryColor,

                  fontWeight: 900,
                }}
              >
                🎡 {game?.name || "Vòng quay may mắn"}
              </Title>

              {game?.description && (
                <Text type="secondary">{game.description}</Text>
              )}
            </Space>
          </Col>

          <Col xs={24} md={8}>
            <div
              style={{
                display: "flex",

                justifyContent: "flex-end",

                flexWrap: "wrap",

                gap: 8,
              }}
            >
              {showScore && (
                <Tag
                  icon={<StarFilled />}
                  color="gold"
                  style={{
                    borderRadius: 12,

                    padding: "7px 12px",

                    fontSize: 14,

                    fontWeight: 800,
                  }}
                >
                  {score} điểm
                </Tag>
              )}

              {showTimer && (
                <Tag
                  icon={<ClockCircleOutlined />}
                  color={timeLeft <= 10 ? "red" : "purple"}
                  style={{
                    borderRadius: 12,

                    padding: "7px 12px",

                    fontSize: 14,

                    fontWeight: 800,
                  }}
                >
                  {formatTime(timeLeft)}
                </Tag>
              )}

              <Tag
                color="blue"
                style={{
                  borderRadius: 12,

                  padding: "7px 12px",

                  fontSize: 14,

                  fontWeight: 800,
                }}
              >
                🎯 {Math.max(0, spinsPerPlayer - spinCount)} lượt
              </Tag>
            </div>
          </Col>
        </Row>
      </Card>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        style={{
          maxWidth: 1250,

          margin: "0 auto",
        }}
      >
        <Row gutter={[20, 20]} align="stretch">
          {/* =================================================
              LEFT
          ================================================= */}

          <Col xs={24} lg={15}>
            <Card
              bordered={false}
              style={{
                height: "100%",

                borderRadius,

                boxShadow: "0 10px 35px rgba(0,0,0,.06)",
              }}
            >
              {/* TITLE */}

              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: 10,

                  flexWrap: "wrap",
                }}
              >
                <Space>
                  <Sparkles size={22} color={primaryColor} />

                  <Title
                    level={4}
                    style={{
                      margin: 0,

                      color: primaryColor,

                      fontWeight: 900,
                    }}
                  >
                    Vòng quay may mắn
                  </Title>
                </Space>

                <Button
                  type="text"
                  onClick={() => setAudioEnabled((previous) => !previous)}
                  icon={
                    audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />
                  }
                >
                  {audioEnabled ? "Âm thanh" : "Tắt âm"}
                </Button>
              </div>

              {/* WHEEL AREA */}

              <div
                style={{
                  marginTop: 20,

                  minHeight: 560,

                  display: "flex",

                  justifyContent: "center",

                  alignItems: "center",

                  overflow: "hidden",

                  borderRadius,

                  background: `radial-gradient(circle at center, ${primaryColor}10 0%, rgba(255,255,255,.75) 70%)`,
                }}
              >
                <div
                  style={{
                    position: "relative",

                    width: wheelSize,

                    height: wheelSize,

                    maxWidth: "90vw",

                    maxHeight: "90vw",

                    aspectRatio: "1 / 1",
                  }}
                >
                  {/* POINTER */}

                  <div
                    style={{
                      position: "absolute",

                      top: -5,

                      left: "50%",

                      transform: "translateX(-50%)",

                      zIndex: 20,

                      width: 0,

                      height: 0,

                      borderLeft: "22px solid transparent",

                      borderRight: "22px solid transparent",

                      borderTop: `48px solid ${secondaryColor}`,

                      filter: "drop-shadow(0 4px 5px rgba(0,0,0,.3))",
                    }}
                  />

                  {/* OUTER RING */}

                  <div
                    style={{
                      position: "absolute",

                      inset: 0,

                      borderRadius: "50%",

                      background: primaryColor,

                      padding: 10,

                      boxSizing: "border-box",

                      boxShadow: "0 18px 45px rgba(0,0,0,.2)",
                    }}
                  >
                    {/* WHEEL */}

                    <div
                      style={{
                        width: "100%",

                        height: "100%",

                        borderRadius: "50%",

                        background: wheelGradient,

                        position: "relative",

                        overflow: "hidden",

                        transform: `rotate(${rotation}deg)`,

                        transition: isSpinning
                          ? "transform 3.6s cubic-bezier(.12,.82,.18,1)"
                          : "none",
                      }}
                    >
                      {renderWheelLabels()}

                      {/* CENTER */}

                      <div
                        style={{
                          position: "absolute",

                          left: "50%",

                          top: "50%",

                          width: 82,

                          height: 82,

                          transform: "translate(-50%, -50%)",

                          borderRadius: "50%",

                          background: "#ffffff",

                          border: `7px solid ${primaryColor}`,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          boxShadow: "0 6px 20px rgba(0,0,0,.2)",

                          zIndex: 15,

                          cursor:
                            isSpinning || finished ? "not-allowed" : "pointer",
                        }}
                        onClick={handleSpin}
                      >
                        <RotateCw size={32} color={primaryColor} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SPIN BUTTON */}

              <div
                style={{
                  textAlign: "center",

                  marginTop: 20,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  icon={<RotateCw size={20} />}
                  loading={isSpinning}
                  disabled={
                    isSpinning || finished || spinCount >= spinsPerPlayer
                  }
                  onClick={handleSpin}
                  style={{
                    height: 52,

                    padding: "0 35px",

                    borderRadius: 16,

                    background: primaryColor,

                    borderColor: primaryColor,

                    fontSize: 17,

                    fontWeight: 900,

                    boxShadow: `0 8px 22px ${primaryColor}55`,
                  }}
                >
                  {isSpinning
                    ? "Đang quay..."
                    : finished
                      ? "Đã hết lượt"
                      : "QUAY NGAY 🎡"}
                </Button>
              </div>

              {/* RESULT */}

              {showResult && selectedItem && !showResultModal && (
                <Alert
                  type="success"
                  showIcon
                  icon={<TrophyFilled />}
                  message="🎉 Kết quả"
                  description={<strong>{selectedItem.label}</strong>}
                  style={{
                    marginTop: 20,

                    borderRadius: 16,
                  }}
                />
              )}

              {/* FINISHED */}

              {finished && (
                <Alert
                  type="info"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  message="🎊 Bạn đã hoàn thành!"
                  description={`Tổng điểm: ${score}`}
                  style={{
                    marginTop: 20,

                    borderRadius: 16,
                  }}
                />
              )}

              {/* ACTIONS */}

              <div
                style={{
                  marginTop: 20,

                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: 10,

                  flexWrap: "wrap",
                }}
              >
                <Space wrap>
                  <Tag
                    color="purple"
                    style={{
                      borderRadius: 10,

                      padding: "5px 10px",
                    }}
                  >
                    Lượt đã quay: {spinCount}/{spinsPerPlayer}
                  </Tag>

                  {totalProbability > 0 && (
                    <Tag
                      color={
                        Math.abs(totalProbability - 100) < 0.01
                          ? "green"
                          : "orange"
                      }
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Tỷ lệ: {totalProbability}%
                    </Tag>
                  )}
                </Space>

                <Space>
                  {allowReplay && finished && (
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReplay}
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Chơi lại
                    </Button>
                  )}

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    disabled={isSpinning}
                    style={{
                      borderRadius: 10,
                    }}
                  >
                    Đặt lại
                  </Button>

                  {onBack && (
                    <Button
                      onClick={onBack}
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Thoát
                    </Button>
                  )}
                </Space>
              </div>
            </Card>
          </Col>

          {/* =================================================
              RIGHT
          ================================================= */}

          <Col xs={24} lg={9}>
            <Space
              direction="vertical"
              size={20}
              style={{
                width: "100%",
              }}
            >
              {/* RESULT CARD */}

              <Card
                bordered={false}
                style={{
                  borderRadius,

                  boxShadow: "0 10px 30px rgba(0,0,0,.06)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    color: primaryColor,

                    marginTop: 0,
                  }}
                >
                  🏆 Kết quả gần nhất
                </Title>

                {selectedItem ? (
                  <div
                    style={{
                      padding: 20,

                      borderRadius: 18,

                      textAlign: "center",

                      background: `${selectedItem.color}18`,

                      border: `2px solid ${selectedItem.color}55`,
                    }}
                  >
                    <div
                      style={{
                        width: 70,

                        height: 70,

                        margin: "0 auto 12px",

                        borderRadius: "50%",

                        background: selectedItem.color,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        color: "#fff",

                        fontSize: 25,

                        fontWeight: 900,

                        boxShadow: `0 8px 20px ${selectedItem.color}55`,
                      }}
                    >
                      🎁
                    </div>

                    <Text type="secondary">Bạn nhận được</Text>

                    <Title
                      level={3}
                      style={{
                        margin: "5px 0",

                        color: selectedItem.color,
                      }}
                    >
                      {selectedItem.label}
                    </Title>

                    {selectedItem.value && (
                      <Tag
                        color="gold"
                        style={{
                          borderRadius: 10,

                          fontSize: 14,

                          padding: "5px 12px",
                        }}
                      >
                        {selectedItem.value}
                      </Tag>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: 30,

                      textAlign: "center",

                      background: "#F8F9FC",

                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 45,

                        marginBottom: 10,
                      }}
                    >
                      🎡
                    </div>

                    <Text type="secondary">
                      Hãy quay vòng quay để nhận phần thưởng
                    </Text>
                  </div>
                )}
              </Card>

              {/* SCORE */}

              {showScore && (
                <Card
                  bordered={false}
                  style={{
                    borderRadius,

                    boxShadow: "0 10px 30px rgba(0,0,0,.06)",
                  }}
                >
                  <Title
                    level={5}
                    style={{
                      marginTop: 0,

                      color: primaryColor,
                    }}
                  >
                    ⭐ Điểm số
                  </Title>

                  <div
                    style={{
                      textAlign: "center",

                      padding: 10,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 46,

                        fontWeight: 900,

                        color: primaryColor,
                      }}
                    >
                      {score}
                    </div>

                    <Text type="secondary">điểm</Text>
                  </div>
                </Card>
              )}

              {/* PROGRESS */}

              <Card
                bordered={false}
                style={{
                  borderRadius,

                  boxShadow: "0 10px 30px rgba(0,0,0,.06)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    marginTop: 0,

                    color: primaryColor,
                  }}
                >
                  🎯 Tiến trình
                </Title>

                <Progress
                  percent={Math.round(
                    Math.min(100, (spinCount / spinsPerPlayer) * 100),
                  )}
                  strokeColor={primaryColor}
                  format={() => `${spinCount}/${spinsPerPlayer}`}
                />

                <Text
                  type="secondary"
                  style={{
                    display: "block",

                    marginTop: 8,
                  }}
                >
                  Mỗi người có <strong>{spinsPerPlayer}</strong> lượt quay.
                </Text>
              </Card>

              {/* ITEMS */}

              <Card
                bordered={false}
                style={{
                  borderRadius,

                  boxShadow: "0 10px 30px rgba(0,0,0,.06)",
                }}
              >
                <Title
                  level={5}
                  style={{
                    marginTop: 0,

                    color: primaryColor,
                  }}
                >
                  🎁 Phần thưởng
                </Title>

                <div
                  style={{
                    display: "flex",

                    flexDirection: "column",

                    gap: 9,

                    maxHeight: 350,

                    overflowY: "auto",
                  }}
                >
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",

                        alignItems: "center",

                        gap: 10,

                        padding: 10,

                        borderRadius: 12,

                        background:
                          selectedItem?.id === item.id
                            ? `${item.color}18`
                            : "#F8F9FC",

                        border:
                          selectedItem?.id === item.id
                            ? `2px solid ${item.color}`
                            : "1px solid #edf0f5",
                      }}
                    >
                      <div
                        style={{
                          width: 32,

                          height: 32,

                          borderRadius: "50%",

                          flexShrink: 0,

                          background: item.color,

                          color: "#ffffff",

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          fontWeight: 900,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                          flex: 1,

                          minWidth: 0,
                        }}
                      >
                        <Text
                          strong
                          style={{
                            display: "block",

                            overflow: "hidden",

                            textOverflow: "ellipsis",

                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.label}
                        </Text>

                        {item.value && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                            }}
                          >
                            {item.value}
                          </Text>
                        )}
                      </div>

                      <Tag
                        color="blue"
                        style={{
                          margin: 0,

                          borderRadius: 8,

                          flexShrink: 0,
                        }}
                      >
                        {item.probability}%
                      </Tag>
                    </div>
                  ))}
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      {/* =====================================================
          RESULT OVERLAY
      ===================================================== */}

      {showResult && showResultModal && selectedItem && (
        <div
          style={{
            position: "fixed",

            inset: 0,

            zIndex: 9999,

            background: "rgba(15,23,42,.62)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            padding: 20,
          }}
          onClick={() => setShowResultModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(500px, 100%)",

              background: "#ffffff",

              borderRadius: 28,

              padding: 35,

              textAlign: "center",

              boxShadow: "0 30px 80px rgba(0,0,0,.3)",

              animation: "wheelResultPop .35s ease",
            }}
          >
            <div
              style={{
                fontSize: 60,

                marginBottom: 8,
              }}
            >
              🎉
            </div>

            <Text
              style={{
                color: secondaryColor,

                fontWeight: 900,

                textTransform: "uppercase",

                letterSpacing: 1,
              }}
            >
              Chúc mừng bạn!
            </Text>

            <Title
              level={2}
              style={{
                color: selectedItem.color,

                margin: "10px 0",
              }}
            >
              {selectedItem.label}
            </Title>

            {selectedItem.value && (
              <Tag
                color="gold"
                style={{
                  fontSize: 17,

                  padding: "7px 16px",

                  borderRadius: 12,
                }}
              >
                🎁 {selectedItem.value}
              </Tag>
            )}

            <div
              style={{
                marginTop: 25,
              }}
            >
              <Button
                type="primary"
                size="large"
                onClick={() => setShowResultModal(false)}
                style={{
                  borderRadius: 14,

                  background: primaryColor,

                  borderColor: primaryColor,

                  padding: "0 35px",

                  fontWeight: 800,
                }}
              >
                Tuyệt vời! 🎊
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>
        {`
          @keyframes wheelResultPop {
            0% {
              opacity: 0;
              transform: scale(.75);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default WheelGame;
