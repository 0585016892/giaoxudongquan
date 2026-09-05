import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Card, Typography, Space, Row, Col, Progress, Modal } from "antd";
import {
  Brain,
  RotateCcw,
  Clock,
  Trophy,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  HelpCircle,
  Smile,
} from "lucide-react";

const { Title, Text, Paragraph } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// --- Hàm xử lý lấy URL chuẩn hoá ---
const getFileUrl = (file) => {
  if (!file) return null;

  if (file instanceof File || file instanceof Blob) {
    return URL.createObjectURL(file);
  }

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

  if (typeof file === "object") {
    if (
      file.originFileObj instanceof File ||
      file.originFileObj instanceof Blob
    ) {
      return URL.createObjectURL(file.originFileObj);
    }

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

// --- Giả lập âm thanh Web Audio API Fallback ---
const playSyntheticSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "correct") {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        659.25,
        ctx.currentTime + 0.15,
      );
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "flip") {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

const MemoryGame = ({ game, onExit }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Styling & Theme Variables (Mặc định chuẩn Chibi Gaming)
  const primaryColor = game?.theme?.primary || "#8B5CF6";
  const secondaryColor = game?.theme?.secondary || "#EC4899";
  const fontFamily = "'Fredoka', 'Baloo 2', 'Nunito', sans-serif";
  const borderRadius = 24;

  const bgImageUrl = getFileUrl(game?.background?.image);
  const bgColor = game?.background?.color || "#F5F3FF";

  const settings = useMemo(() => game?.settings || {}, [game?.settings]);
  const media = useMemo(() => game?.media || {}, [game?.media]);

  const audioRefs = useRef({
    correct: null,
    wrong: null,
    bgMusic: null,
  });

  // Khởi tạo Audio từ Media Props
  useEffect(() => {
    const audio = {
      correct: null,
      wrong: null,
      bgMusic: null,
    };

    if (media.correctSound) {
      audio.correct = new Audio(getFileUrl(media.correctSound));
    }

    if (media.wrongSound) {
      audio.wrong = new Audio(getFileUrl(media.wrongSound));
    }

    if (media.backgroundMusic) {
      const bgAudio = new Audio(getFileUrl(media.backgroundMusic));
      bgAudio.loop = true;
      bgAudio.volume = 0.3;
      audio.bgMusic = bgAudio;
    }

    audioRefs.current = audio;

    return () => {
      if (audio.bgMusic) {
        audio.bgMusic.pause();
        audio.bgMusic.currentTime = 0;
      }
      if (audio.correct) audio.correct.pause();
      if (audio.wrong) audio.wrong.pause();
    };
  }, [media.correctSound, media.wrongSound, media.backgroundMusic]);

  // Quản lý Bật/Tắt nhạc nền
  useEffect(() => {
    const bgAudio = audioRefs.current.bgMusic;
    if (bgAudio) {
      if (soundEnabled && isPlaying && !isGameOver) {
        bgAudio.play().catch(() => {});
      } else {
        bgAudio.pause();
      }
    }
  }, [soundEnabled, isPlaying, isGameOver]);

  const playSound = useCallback(
    (type) => {
      if (!soundEnabled) return;

      if (type === "correct" && audioRefs.current.correct) {
        audioRefs.current.correct.currentTime = 0;
        audioRefs.current.correct
          .play()
          .catch(() => playSyntheticSound("correct"));
      } else if (type === "wrong" && audioRefs.current.wrong) {
        audioRefs.current.wrong.currentTime = 0;
        audioRefs.current.wrong.play().catch(() => playSyntheticSound("wrong"));
      } else {
        playSyntheticSound(type);
      }
    },
    [soundEnabled],
  );

  const initGame = useCallback(() => {
    const rawCards = game?.cards || game?.questions || [];
    let processedCards = [...rawCards];

    if (settings.shuffleQuestions !== false) {
      processedCards = processedCards.sort(() => Math.random() - 0.5);
    }

    setCards(processedCards);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setScore(0);
    setCombo(0);
    setTimeLeft(settings.timeLimit || 120);
    setIsPlaying(true);
    setIsGameOver(false);
  }, [
    game?.cards,
    game?.questions,
    settings.shuffleQuestions,
    settings.timeLimit,
  ]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Đếm ngược thời gian
  useEffect(() => {
    let timer;
    if (
      isPlaying &&
      settings.showTimer !== false &&
      timeLeft > 0 &&
      !isGameOver
    ) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, isGameOver, settings.showTimer]);

  useEffect(() => {
    if (cards.length > 0 && matchedCards.length === cards.length) {
      setIsGameOver(true);
      setIsPlaying(false);
      playSound("correct");
    }
  }, [matchedCards.length, cards.length, playSound]);

  const handleCardClick = (index) => {
    if (
      !isPlaying ||
      isGameOver ||
      flippedCards.includes(index) ||
      matchedCards.includes(index) ||
      flippedCards.length >= 2
    ) {
      return;
    }

    playSound("flip");

    const nextFlipped = [...flippedCards, index];
    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const first = cards[nextFlipped[0]];
      const second = cards[nextFlipped[1]];

      if (
        first?.pairId === second?.pairId &&
        (first?.id !== second?.id || nextFlipped[0] !== nextFlipped[1])
      ) {
        playSound("correct");
        setScore((prev) => prev + 100 + combo * 20);
        setCombo((prev) => prev + 1);

        setTimeout(() => {
          setMatchedCards((prev) => [...prev, ...nextFlipped]);
          setFlippedCards([]);
        }, 400);
      } else {
        playSound("wrong");
        setCombo(0);
        setTimeout(() => setFlippedCards([]), 850);
      }
    }
  };

  const totalPairs = cards.length / 2;
  const currentMatchedPairs = matchedCards.length / 2;
  const progressPercent =
    totalPairs > 0 ? Math.round((currentMatchedPairs / totalPairs) * 100) : 0;

  return (
    <div
      style={{
        backgroundColor: bgColor,
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "80vh",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily,
      }}
    >
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes popMatch {
          0% { transform: scale(1) rotateY(180deg); }
          50% { transform: scale(1.12) rotateY(180deg); }
          100% { transform: scale(1) rotateY(180deg); }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 920 }}>
        {/* HEADER CHIBI BAR */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: 28,
            boxShadow: "0 8px 0px #DDD6FE, 0 15px 25px rgba(124, 58, 237, 0.1)",
            marginBottom: 20,
            border: "4px solid #F3E8FF",
          }}
        >
          <Space size={14}>
            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  color: "#5B21B6",
                  fontWeight: 900,
                  fontSize: 18,
                  fontFamily,
                  lineHeight: 1.2,
                }}
              >
                {game?.name || "LẬT THẺ KỲ DIỆU 🌟"}
              </Title>
              <Text
                style={{
                  fontSize: 12,
                  color: "#8B5CF6",
                  fontWeight: 700,
                  fontFamily,
                }}
              >
                {game?.description ||
                  "Ghi nhớ & tìm các cặp thẻ trùng nhau nha!"}
              </Text>
            </div>
          </Space>

          <Space size={10}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                border: "none",
                background: soundEnabled ? "#FEF3C7" : "#F3F4F6",
                color: soundEnabled ? "#D97706" : "#9CA3AF",
                width: 42,
                height: 42,
                borderRadius: 21,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: soundEnabled ? "0 4px 0 #FDE047" : "0 4px 0 #E5E7EB",
              }}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={initGame}
              style={{
                border: "none",
                background: "linear-gradient(180deg, #A78BFA 0%, #7C3AED 100%)",
                color: "#FFF",
                fontWeight: 900,
                padding: "8px 18px",
                borderRadius: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow:
                  "0 4px 0 #5B21B6, 0 8px 15px rgba(124, 58, 237, 0.3)",
                fontSize: 14,
                fontFamily,
              }}
            >
              <RotateCcw size={16} strokeWidth={2.5} /> Chơi lại
            </button>
          </Space>
        </div>

        {/* HUD STATS CHIBI BADGES */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          {settings.showTimer !== false && (
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: "#FFF",
                  borderRadius: 24,
                  padding: "10px 14px",
                  border: "3px solid #FECACA",
                  boxShadow: "0 5px 0 #FCA5A5",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: timeLeft <= 20 ? "#FEE2E2" : "#FEF2F2",
                    padding: 8,
                    borderRadius: 16,
                  }}
                >
                  <Clock
                    size={22}
                    color={timeLeft <= 20 ? "#EF4444" : "#F87171"}
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#991B1B",
                      fontFamily,
                    }}
                  >
                    THỜI GIAN
                  </Text>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: timeLeft <= 20 ? "#DC2626" : "#7F1D1D",
                      fontWeight: 900,
                      fontFamily,
                    }}
                  >
                    {timeLeft}s
                  </Title>
                </div>
              </div>
            </Col>
          )}

          {settings.showScore !== false && (
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: "#FFF",
                  borderRadius: 24,
                  padding: "10px 14px",
                  border: "3px solid #FDE047",
                  boxShadow: "0 5px 0 #F59E0B",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    background: "#FEF3C7",
                    padding: 8,
                    borderRadius: 16,
                  }}
                >
                  <Trophy size={22} color="#D97706" strokeWidth={2.5} />
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#92400E",
                      fontFamily,
                    }}
                  >
                    ĐIỂM SỐ
                  </Text>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color: "#B45309",
                      fontWeight: 900,
                      fontFamily,
                    }}
                  >
                    {score}
                  </Title>
                </div>
              </div>
            </Col>
          )}

          <Col xs={12} sm={6}>
            <div
              style={{
                background: "#FFF",
                borderRadius: 24,
                padding: "10px 14px",
                border: "3px solid #BFDBFE",
                boxShadow: "0 5px 0 #60A5FA",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#EFF6FF",
                  padding: 8,
                  borderRadius: 16,
                }}
              >
                <Sparkles size={22} color="#3B82F6" strokeWidth={2.5} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#1E40AF",
                    fontFamily,
                  }}
                >
                  LƯỢT LẬT
                </Text>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#1D4ED8",
                    fontWeight: 900,
                    fontFamily,
                  }}
                >
                  {moves}
                </Title>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6}>
            <div
              style={{
                background: "#FFF",
                borderRadius: 24,
                padding: "10px 14px",
                border: "3px solid #FFEDD5",
                boxShadow: "0 5px 0 #FB923C",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "#FFF7ED",
                  padding: 8,
                  borderRadius: 16,
                }}
              >
                <Flame size={22} color="#F97316" strokeWidth={2.5} />
              </div>
              <div>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#9A3412",
                    fontFamily,
                  }}
                >
                  COMBO
                </Text>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    color: "#EA580C",
                    fontWeight: 900,
                    fontFamily,
                  }}
                >
                  x{combo}
                </Title>
              </div>
            </div>
          </Col>
        </Row>

        {/* BÀN CHƠI GAME CHIBI */}
        <Card
          bordered={false}
          style={{
            borderRadius: 36,
            border: "4px solid #F3E8FF",
            boxShadow:
              "0 15px 0px rgba(124, 58, 237, 0.15), 0 25px 35px rgba(0,0,0,0.1)",
            background: "#FFFFFF",
            padding: 12,
          }}
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 8px",
              }}
            >
              <Space>
                <Brain size={24} color={primaryColor} strokeWidth={2.5} />
                <Text
                  strong
                  style={{ fontSize: 17, color: "#4C1D95", fontFamily }}
                >
                  Sân Chơi Thách Thức ✨
                </Text>
              </Space>
              {settings.showProgress !== false && (
                <div style={{ width: 180 }}>
                  <Progress
                    percent={progressPercent}
                    strokeColor={{
                      "0%": "#A78BFA",
                      "100%": "#7C3AED",
                    }}
                    trailColor="#F3E8FF"
                    strokeWidth={12}
                    format={() => (
                      <span
                        style={{
                          fontWeight: 800,
                          color: "#6D28D9",
                          fontSize: 12,
                        }}
                      >
                        {currentMatchedPairs}/{totalPairs} Cặp
                      </span>
                    )}
                  />
                </div>
              )}
            </div>
          }
        >
          {cards.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Text type="secondary" style={{ fontFamily, fontWeight: 700 }}>
                Hơ... Chưa có thẻ game nào hết! 🎈
              </Text>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                gap: 16,
                padding: "10px 4px",
              }}
            >
              {cards.map((card, index) => {
                const isFlipped =
                  flippedCards.includes(index) || matchedCards.includes(index);
                const isMatched = matchedCards.includes(index);
                const imageUrl = getFileUrl(card.image);

                return (
                  <div
                    key={`${card.id}-${index}`}
                    onClick={() => handleCardClick(index)}
                    style={{
                      height: 155,
                      perspective: 1000,
                      cursor: isMatched ? "default" : "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformStyle: "preserve-3d",
                        transition:
                          "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transform: isFlipped
                          ? "rotateY(180deg)"
                          : "rotateY(0deg)",
                        animation: isMatched ? "popMatch 0.5s ease" : "none",
                      }}
                    >
                      {/* MẶT ÚP (CHIBI CARD BACK) */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          borderRadius,
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "4px solid #FFFFFF",
                          boxShadow:
                            "0 6px 0px rgba(109, 40, 217, 0.3), 0 10px 15px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.25)",
                            borderRadius: "50%",
                            padding: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Smile size={38} color="#FFFFFF" strokeWidth={2.5} />
                        </div>
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 11,
                            fontWeight: 900,
                            marginTop: 8,
                            letterSpacing: 1,
                            fontFamily,
                            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          CHIBI MEMORY
                        </Text>
                      </div>

                      {/* MẶT NGỬA (CARD FRONT) */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backfaceVisibility: "hidden",
                          transform: "rotateY(180deg)",
                          borderRadius,
                          border: isMatched
                            ? "4px solid #34D399"
                            : "4px solid #E9D5FF",
                          background: isMatched ? "#ECFDF5" : "#FFFFFF",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 10,
                          textAlign: "center",
                          boxShadow: isMatched
                            ? "0 6px 0px #10B981"
                            : "0 6px 0px #C084FC",
                        }}
                      >
                        {card.type === "image" && imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="Card content"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "85%",
                              objectFit: "contain",
                              borderRadius: borderRadius / 2,
                            }}
                          />
                        ) : card.type === "image" && !imageUrl ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <HelpCircle size={32} color="#A78BFA" />
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 10,
                                marginTop: 4,
                                fontFamily,
                                fontWeight: 700,
                              }}
                            >
                              [Ảnh #{card.id}]
                            </Text>
                          </div>
                        ) : (
                          <Text
                            strong
                            style={{
                              fontSize: 15,
                              color: isMatched ? "#047857" : "#4C1D95",
                              lineHeight: 1.3,
                              fontFamily,
                              fontWeight: 800,
                            }}
                          >
                            {card.content || `Thẻ #${card.id}`}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* MODAL KẾT THÚC GAME CHIBI POP-UP */}
      <Modal
        open={isGameOver}
        footer={null}
        closable={false}
        centered
        width={400}
        bodyStyle={{
          padding: "36px 28px",
          textAlign: "center",
          fontFamily,
          borderRadius: 36,
        }}
      >
        {matchedCards.length === cards.length && cards.length > 0 ? (
          <div>
            <div
              style={{
                width: 90,
                height: 90,
                background: "linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: "5px solid #FFF",
                boxShadow:
                  "0 8px 0 #D97706, 0 12px 20px rgba(245, 158, 11, 0.3)",
              }}
            >
              <Trophy size={50} color="#FFF" strokeWidth={2.5} />
            </div>
            <Title
              level={3}
              style={{
                margin: 0,
                color: "#4C1D95",
                fontWeight: 900,
                fontSize: 26,
                fontFamily,
              }}
            >
              XUẤT SẮC QUÁ! 🎉
            </Title>
            <Text
              style={{
                color: "#6D28D9",
                fontWeight: 700,
                fontFamily,
                fontSize: 15,
              }}
            >
              Bạn đã lật mở thành công tất cả cặp thẻ rồi!
            </Text>

            <div
              style={{
                background: "#F3E8FF",
                padding: "16px",
                borderRadius: 24,
                margin: "24px 0",
                display: "flex",
                justifyContent: "space-around",
                border: "2px solid #E9D5FF",
              }}
            >
              <div>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#6B21A8",
                    fontFamily,
                  }}
                >
                  Điểm Số
                </Text>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "#D97706",
                    fontWeight: 900,
                    fontFamily,
                  }}
                >
                  {score}
                </Title>
              </div>
              <div style={{ width: 2, background: "#DDD6FE" }} />
              <div>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#6B21A8",
                    fontFamily,
                  }}
                >
                  Số Lượt
                </Text>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "#7C3AED",
                    fontWeight: 900,
                    fontFamily,
                  }}
                >
                  {moves}
                </Title>
              </div>
            </div>

            <Space
              style={{ width: "100%", justifyContent: "center" }}
              size={12}
            >
              <button
                onClick={initGame}
                style={{
                  border: "none",
                  background:
                    "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                  color: "#FFF",
                  fontWeight: 900,
                  padding: "12px 24px",
                  borderRadius: 24,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 16,
                  boxShadow: "0 5px 0 #047857",
                  fontFamily,
                }}
              >
                <RotateCcw size={18} strokeWidth={2.5} /> Chơi Lại
              </button>
              <button
                onClick={onExit}
                style={{
                  border: "none",
                  background: "#F3E8FF",
                  color: "#6B21A8",
                  fontWeight: 800,
                  padding: "12px 20px",
                  borderRadius: 24,
                  cursor: "pointer",
                  fontSize: 15,
                  boxShadow: "0 4px 0 #E9D5FF",
                  fontFamily,
                }}
              >
                Thoát Game
              </button>
            </Space>
          </div>
        ) : (
          <div>
            <div
              style={{
                width: 80,
                height: 80,
                background: "#FEE2E2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: "4px solid #FFF",
                boxShadow: "0 6px 0 #FCA5A5",
              }}
            >
              <Clock size={44} color="#EF4444" strokeWidth={2.5} />
            </div>
            <Title
              level={3}
              style={{
                color: "#DC2626",
                fontWeight: 900,
                fontFamily,
                margin: 0,
              }}
            >
              HẾT GIỜ RỒI! 😿
            </Title>
            <Paragraph
              style={{
                color: "#7F1D1D",
                fontWeight: 700,
                fontFamily,
                marginTop: 8,
              }}
            >
              Tiếc quá, đã hết thời gian rồi. Bạn hãy nhấn thử lại để chơi lại
              nhé!
            </Paragraph>
            <button
              onClick={initGame}
              style={{
                border: "none",
                background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)",
                color: "#FFF",
                fontWeight: 900,
                padding: "12px 28px",
                borderRadius: 24,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                boxShadow: "0 5px 0 #1D4ED8",
                marginTop: 12,
                fontFamily,
              }}
            >
              <RotateCcw size={18} strokeWidth={2.5} /> Thử Lại
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MemoryGame;
