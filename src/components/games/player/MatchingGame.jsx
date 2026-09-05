import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button, Typography, Space, Modal, Progress, message } from "antd";
import {
  ArrowLeft,
  Award,
  Clock,
  RotateCw,
  Lightbulb,
  CheckCircle2,
  XCircle,
  PartyPopper,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  ChevronRight,
  Smile,
  Cat,
  Star,
} from "lucide-react";

const { Title, Text } = Typography;

/* =========================================================
   BỘ MÀU CHIBI CANDY (ĐA SẮC RỰC RỠ)
========================================================= */
const CANDY_PALETTES = [
  { bg: "#FFF0F3", border: "#FFB3C1", text: "#C9184A", shadow: "#FFCCD5" }, // Hồng Dâu
  { bg: "#E8F0FE", border: "#93C5FD", text: "#1E40AF", shadow: "#BFDBFE" }, // Xanh Mây
  { bg: "#F0FDF4", border: "#86EFAC", text: "#166534", shadow: "#BBF7D0" }, // Xanh Bạc Hà
  { bg: "#FFFBEB", border: "#FDE047", text: "#854D0E", shadow: "#FEF08A" }, // Vàng Chuối
  { bg: "#F3E8FF", border: "#C084FC", text: "#6B21A8", shadow: "#E9D5FF" }, // Tím Kẹo Kéo
  { bg: "#FFEDD5", border: "#FB923C", text: "#9A3412", shadow: "#FED7AA" }, // Cam Đào
];

// Hàm lấy palette an toàn phòng trường hợp item.palette bị undefined
const getPalette = (item, index) => {
  if (item && item.palette && item.palette.bg) {
    return item.palette;
  }
  return CANDY_PALETTES[index % CANDY_PALETTES.length] || CANDY_PALETTES[0];
};

const DEFAULT_GAME_DATA = {
  id: 7,
  name: "NỐI ĐÚNG – HIỂU ĐÚNG",
  description:
    "Cùng bé chibi khám phá những kiến thức bổ ích qua thử thách nối đáp án siêu vui!",
  type: "matching",
  thumbnail: "/uploads/games/game7/thumbnail.png",
  background: {
    color: "#F8FAFC",
    image: "/uploads/games/game7/background.png",
  },
  media: {
    backgroundMusic: "/uploads/games/game7/background-music.mp3",
    correctSound: "/uploads/games/game7/correct-sound.mp3",
    wrongSound: "/uploads/games/game7/wrong-sound.mp3",
  },
  pairs: [
    { id: 1, left: "Thiên Chúa", right: "Đấng tạo dựng muôn loài" },
    { id: 2, left: "Đức Giêsu", right: "Con Một Thiên Chúa" },
    { id: 3, left: "Kinh Thánh", right: "Lời Chúa" },
    { id: 4, left: "Bí tích Rửa Tội", right: "Gia nhập Hội Thánh" },
  ],
  settings: {
    allowHint: true,
    allowSkip: true,
    showProgress: true,
    showScore: true,
    showTimer: true,
    shuffleAnswers: true,
    shuffleQuestions: true,
    timeLimit: 60,
  },
  theme: {
    borderRadius: 20,
    font: "Baloo 2",
    primary: "#6366F1",
    secondary: "#FBBF24",
  },
};

const API_URL = process.env.REACT_APP_API_URL || "";

const getMediaUrl = (path) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }
  const baseUrl = API_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const MatchingGame = ({ game = DEFAULT_GAME_DATA, onExit }) => {
  const audioRef = useRef(null);

  const theme = game?.theme || {};
  const primaryColor = theme.primary || "#6366F1";
  const secondaryColor = theme.secondary || "#FBBF24";
  const borderRadius = theme.borderRadius || 20;
  const fontStyle = theme.font || "Baloo 2";

  const background = game?.background || {};
  const bgColor = background.color || "#F8FAFC";
  const bgImage = useMemo(
    () => getMediaUrl(background.image),
    [background.image],
  );

  const settings = game?.settings || {};
  const timeLimit = Number(settings.timeLimit) || 60;
  const showTimer = settings.showTimer !== false;
  const showScore = settings.showScore !== false;
  const showProgress = settings.showProgress !== false;
  const allowHint = settings.allowHint !== false;
  const allowSkip = settings.allowSkip !== false;

  const rawPairs = useMemo(() => {
    if (!Array.isArray(game?.pairs)) return [];
    return game.pairs.filter(
      (pair) =>
        pair &&
        pair.id !== undefined &&
        pair.left !== undefined &&
        pair.right !== undefined,
    );
  }, [game?.pairs]);

  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [hintsLeft, setHintsLeft] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const backgroundMusicUrl = useMemo(
    () => getMediaUrl(game?.media?.backgroundMusic),
    [game?.media?.backgroundMusic],
  );
  const correctSoundUrl = useMemo(
    () => getMediaUrl(game?.media?.correctSound),
    [game?.media?.correctSound],
  );
  const wrongSoundUrl = useMemo(
    () => getMediaUrl(game?.media?.wrongSound),
    [game?.media?.wrongSound],
  );

  const playSound = useCallback(
    (url) => {
      if (!url || isMuted) return;
      const audio = new Audio(url);
      audio.volume = 0.8;
      audio.play().catch((err) => console.warn("Âm thanh ngắt:", err));
    },
    [isMuted],
  );

  const initGame = useCallback(() => {
    const paletteLen = CANDY_PALETTES.length || 1;

    let lefts = rawPairs.map((pair, idx) => ({
      id: pair.id,
      text: pair.left,
      palette: CANDY_PALETTES[idx % paletteLen],
    }));
    let rights = rawPairs.map((pair, idx) => ({
      id: pair.id,
      text: pair.right,
      palette: CANDY_PALETTES[(idx + 2) % paletteLen],
    }));

    if (settings.shuffleQuestions !== false)
      lefts = [...lefts].sort(() => Math.random() - 0.5);
    if (settings.shuffleAnswers !== false)
      rights = [...rights].sort(() => Math.random() - 0.5);

    setLeftItems(lefts);
    setRightItems(rights);
    setMatchedIds([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    setScore(0);
    setTimeLeft(timeLimit);
    setHintsLeft(1);
    setIsGameOver(false);
    setGameStarted(true);
  }, [rawPairs, settings.shuffleQuestions, settings.shuffleAnswers, timeLimit]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!backgroundMusicUrl) return;
    const audio = new Audio(backgroundMusicUrl);
    audio.loop = true;
    audio.volume = 0.3;
    audio.muted = isMuted;
    audioRef.current = audio;
    audio.play().catch(() => console.log("Autoplay blocked"));

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [backgroundMusicUrl, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
  };

  useEffect(() => {
    if (!showTimer || isGameOver || !gameStarted) return;
    if (timeLeft <= 0) {
      setIsGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isGameOver, showTimer, gameStarted]);

  const checkMatch = useCallback(
    (leftId, rightId) => {
      if (
        isGameOver ||
        matchedIds.includes(leftId) ||
        matchedIds.includes(rightId)
      )
        return;

      if (leftId === rightId) {
        const newMatched = [...matchedIds, leftId];
        setMatchedIds(newMatched);
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongPair(null);

        setScore((prev) => prev + 100);
        playSound(correctSoundUrl);

        if (newMatched.length === rawPairs.length) {
          setTimeout(() => setIsGameOver(true), 600);
        }
      } else {
        setWrongPair({ leftId, rightId });
        playSound(wrongSoundUrl);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setWrongPair(null);
        }, 600);
      }
    },
    [
      isGameOver,
      matchedIds,
      rawPairs.length,
      correctSoundUrl,
      wrongSoundUrl,
      playSound,
    ],
  );

  const handleSelectLeft = (item) => {
    if (isGameOver || matchedIds.includes(item.id)) return;
    setSelectedLeft(item.id);
    if (selectedRight !== null) checkMatch(item.id, selectedRight);
  };

  const handleSelectRight = (item) => {
    if (isGameOver || matchedIds.includes(item.id)) return;
    setSelectedRight(item.id);
    if (selectedLeft !== null) checkMatch(selectedLeft, item.id);
  };

  const handleUseHint = () => {
    if (!allowHint) return;
    if (hintsLeft <= 0) return message.warning("Hết lượt gợi ý rồi!");
    if (isGameOver || matchedIds.length === rawPairs.length) return;

    const unMatched = rawPairs.find((pair) => !matchedIds.includes(pair.id));
    if (!unMatched) return;

    setSelectedLeft(unMatched.id);
    setSelectedRight(unMatched.id);
    setHintsLeft((prev) => prev - 1);

    setTimeout(() => {
      checkMatch(unMatched.id, unMatched.id);
      message.success("Bé Chibi soi sáng 1 câu nè! ✨");
    }, 400);
  };

  const handleSkip = () => {
    if (!allowSkip || isGameOver) return;
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongPair(null);
    message.info("Đã chọn lại!");
  };

  const progressPercent =
    rawPairs.length > 0
      ? Math.round((matchedIds.length / rawPairs.length) * 100)
      : 0;
  const completed = matchedIds.length === rawPairs.length;

  return (
    <div
      style={{
        height: "80vh",
        minHeight: 580,
        width: "100%",
        backgroundColor: bgColor,
        backgroundImage: bgImage
          ? `linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(243, 232, 255, 0.6)), url("${bgImage}")`
          : "linear-gradient(135deg, #E0F2FE 0%, #F3E8FF 50%, #FFEDD5 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: `"${fontStyle}", "Comic Sans MS", cursive, sans-serif`,
        padding: "16px 20px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER BAR */}
        <div className="candy-header">
          <Button
            onClick={onExit}
            className="candy-btn-soft"
            icon={<ArrowLeft size={18} />}
          >
            Thoát
          </Button>

          <div className="candy-title-box">
            <Cat size={24} color="#8B5CF6" className="bouncing-cat" />
            <Title
              level={3}
              style={{
                margin: 0,
                color: "#4F46E5",
                fontWeight: 900,
                fontSize: 20,
              }}
            >
              {game?.name || "NỐI ĐÚNG – HIỂU ĐÚNG"}
            </Title>
          </div>

          <Space size={8}>
            {showTimer && (
              <div
                className={`candy-pill ${
                  timeLeft <= 10 ? "pill-danger-candy" : "pill-blue-candy"
                }`}
              >
                <Clock size={16} />
                <span>{timeLeft}s</span>
              </div>
            )}

            {showScore && (
              <div className="candy-pill pill-gold-candy">
                <Award size={16} />
                <span>{score} ĐIỂM</span>
              </div>
            )}

            <Button onClick={toggleMute} className="candy-btn-icon">
              {isMuted ? (
                <VolumeX size={18} color="#EF4444" />
              ) : (
                <Volume2 size={18} color="#10B981" />
              )}
            </Button>
          </Space>
        </div>

        {/* INSTRUCTION & PROGRESS */}
        <div className="candy-info-card">
          {game?.description && (
            <p className="candy-desc-text">{game.description}</p>
          )}

          {showProgress && (
            <div className="candy-progress-section">
              <div className="progress-label">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Heart size={14} color="#EC4899" fill="#EC4899" /> Tiến trình
                  hoàn thành
                </span>
                <span className="count-candy">
                  {matchedIds.length} / {rawPairs.length} Cặp
                </span>
              </div>
              <Progress
                percent={progressPercent}
                strokeColor={{
                  "0%": "#3B82F6",
                  "50%": "#8B5CF6",
                  "100%": "#EC4899",
                }}
                trailColor="#E2E8F0"
                strokeWidth={14}
                showInfo={false}
              />
            </div>
          )}
        </div>

        {/* TOOLBAR */}
        <div className="candy-toolbar">
          {allowHint && (
            <Button
              onClick={handleUseHint}
              disabled={hintsLeft <= 0 || isGameOver}
              className="candy-btn-hint"
              icon={<Lightbulb size={18} />}
            >
              Gợi ý ({hintsLeft})
            </Button>
          )}

          {allowSkip && (
            <Button
              onClick={handleSkip}
              disabled={isGameOver}
              className="candy-btn-soft"
            >
              Bỏ chọn
            </Button>
          )}

          <Button
            onClick={initGame}
            className="candy-btn-soft"
            icon={<RotateCw size={16} />}
          >
            Làm mới
          </Button>
        </div>

        {/* MATCHING BOARD */}
        <div className="candy-board-grid">
          {/* LEFT COLUMN */}
          <div className="candy-column">
            <div className="column-header-candy left-header-candy">
              <Sparkles size={16} style={{ marginRight: 4 }} /> CÂU HỎI / KHÁI
              NIỆM
            </div>

            <div className="cards-scroll-container">
              {leftItems.map((item, idx) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedLeft === item.id;
                const isWrong = wrongPair?.leftId === item.id;
                const palette = getPalette(item, idx);

                let cardState = "state-default";
                if (isMatched) cardState = "state-matched";
                else if (isWrong) cardState = "state-wrong";
                else if (isSelected) cardState = "state-selected";

                return (
                  <div
                    key={`left-${item.id}`}
                    className={`candy-card ${cardState}`}
                    onClick={() => handleSelectLeft(item)}
                    style={{
                      borderRadius,
                      backgroundColor: isSelected
                        ? "#EEF2FF"
                        : isMatched
                          ? "#F0FDF4"
                          : palette.bg,
                      borderColor: isSelected
                        ? "#6366F1"
                        : isMatched
                          ? "#22C55E"
                          : palette.border,
                      boxShadow: isSelected
                        ? "0 4px 0 #6366F1"
                        : isMatched
                          ? "0 4px 0 #22C55E"
                          : `0 4px 0 ${palette.shadow}`,
                    }}
                  >
                    <span
                      className="card-text"
                      style={{
                        color: isSelected
                          ? "#4F46E5"
                          : isMatched
                            ? "#15803D"
                            : palette.text,
                      }}
                    >
                      {item.text}
                    </span>
                    <div className="icon-wrapper">
                      {isMatched && <CheckCircle2 size={20} color="#22C55E" />}
                      {isWrong && <XCircle size={20} color="#EF4444" />}
                      {!isMatched && !isWrong && (
                        <ChevronRight
                          size={18}
                          style={{ color: palette.text, opacity: 0.6 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="candy-column">
            <div className="column-header-candy right-header-candy">
              <Star size={16} style={{ marginRight: 4 }} /> ĐÁP ÁN NHỎ
            </div>

            <div className="cards-scroll-container">
              {rightItems.map((item, idx) => {
                const isMatched = matchedIds.includes(item.id);
                const isSelected = selectedRight === item.id;
                const isWrong = wrongPair?.rightId === item.id;
                const palette = getPalette(item, idx);

                let cardState = "state-default";
                if (isMatched) cardState = "state-matched";
                else if (isWrong) cardState = "state-wrong";
                else if (isSelected) cardState = "state-selected";

                return (
                  <div
                    key={`right-${item.id}`}
                    className={`candy-card ${cardState}`}
                    onClick={() => handleSelectRight(item)}
                    style={{
                      borderRadius,
                      backgroundColor: isSelected
                        ? "#EEF2FF"
                        : isMatched
                          ? "#F0FDF4"
                          : palette.bg,
                      borderColor: isSelected
                        ? "#6366F1"
                        : isMatched
                          ? "#22C55E"
                          : palette.border,
                      boxShadow: isSelected
                        ? "0 4px 0 #6366F1"
                        : isMatched
                          ? "0 4px 0 #22C55E"
                          : `0 4px 0 ${palette.shadow}`,
                    }}
                  >
                    <span
                      className="card-text"
                      style={{
                        color: isSelected
                          ? "#4F46E5"
                          : isMatched
                            ? "#15803D"
                            : palette.text,
                      }}
                    >
                      {item.text}
                    </span>
                    <div className="icon-wrapper">
                      {isMatched && <CheckCircle2 size={20} color="#22C55E" />}
                      {isWrong && <XCircle size={20} color="#EF4444" />}
                      {!isMatched && !isWrong && (
                        <ChevronRight
                          size={18}
                          style={{ color: palette.text, opacity: 0.6 }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* RESULT MODAL */}
      <Modal
        open={isGameOver}
        footer={null}
        closable={false}
        centered
        width={380}
        styles={{
          content: {
            borderRadius: 32,
            padding: "28px 20px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(99, 102, 241, 0.25)",
            border: "4px solid #FFF",
            background: "#FAF5FF",
          },
        }}
      >
        <div
          className={`candy-modal-badge ${
            completed ? "badge-success-candy" : "badge-fail-candy"
          }`}
        >
          {completed ? (
            <PartyPopper size={48} color="#D97706" />
          ) : (
            <Smile size={48} color="#DC2626" />
          )}
        </div>

        <Title
          level={3}
          style={{ margin: "10px 0 4px", color: "#1E293B", fontWeight: 900 }}
        >
          {completed ? "Bé Giỏi Quá Đi!" : "Tiếc Quá Bé Ôi!"}
        </Title>

        <Text
          style={{
            color: "#64748B",
            fontSize: 14,
            fontWeight: 700,
            display: "block",
          }}
        >
          {completed
            ? "Bé đã nối chính xác tất cả các đáp án rùi nè!"
            : "Đừng nản lòng nhé, thử lại một lượt mới nào!"}
        </Text>

        <div className="candy-score-board">
          <div className="score-item">
            <Text className="score-label">ĐIỂM SỐ</Text>
            <Text className="score-val" style={{ color: primaryColor }}>
              {score}
            </Text>
          </div>
          <div className="score-divider" />
          <div className="score-item">
            <Text className="score-label">HOÀN THÀNH</Text>
            <Text className="score-val" style={{ color: "#10B981" }}>
              {matchedIds.length}/{rawPairs.length}
            </Text>
          </div>
        </div>

        <Space direction="vertical" style={{ width: "100%" }} size={10}>
          <Button
            type="primary"
            block
            size="large"
            icon={<RotateCw size={18} />}
            onClick={initGame}
            style={{
              height: 48,
              borderRadius: 24,
              background: "linear-gradient(135deg, #6366F1 0%, #A855F7 100%)",
              border: "none",
              fontWeight: 900,
              fontSize: 15,
              boxShadow: "0 6px 16px rgba(99, 102, 241, 0.4)",
            }}
          >
            Chơi Lại Luôn
          </Button>

          <Button
            block
            size="large"
            onClick={onExit}
            style={{
              height: 48,
              borderRadius: 24,
              fontWeight: 800,
              color: "#64748B",
              border: "2px solid #E2E8F0",
              background: "#FFF",
            }}
          >
            Về Màn Hình Chính
          </Button>
        </Space>
      </Modal>

      {/* STYLES */}
      <style>{`
        .candy-header {
          background: rgba(255, 255, 255, 0.95);
          border-radius: ${borderRadius}px;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.1);
          border: 3px solid #E0E7FF;
        }

        .candy-title-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bouncing-cat {
          animation: bounce 2s infinite ease-in-out;
        }

        .candy-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 900;
          font-size: 13px;
        }

        .pill-blue-candy {
          background: #E0F2FE;
          color: #0284C7;
          border: 2px solid #BAE6FD;
        }

        .pill-danger-candy {
          background: #FEE2E2;
          color: #DC2626;
          border: 2px solid #FCA5A5;
          animation: pulse 1s infinite;
        }

        .pill-gold-candy {
          background: #FEF3C7;
          color: #D97706;
          border: 2px solid #FDE68A;
        }

        .candy-btn-soft {
          border-radius: 18px !important;
          font-weight: 800 !important;
          height: 36px !important;
          background: #FFFFFF !important;
          border: 2px solid #E2E8F0 !important;
          color: #475569 !important;
          box-shadow: 0 4px 0 #CBD5E1 !important;
          transition: all 0.15s ease !important;
        }

        .candy-btn-soft:active {
          transform: translateY(3px) !important;
          box-shadow: 0 1px 0 #CBD5E1 !important;
        }

        .candy-btn-icon {
          border-radius: 50% !important;
          width: 36px !important;
          height: 36px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #FFFFFF !important;
          border: 2px solid #E2E8F0 !important;
          box-shadow: 0 3px 0 #CBD5E1 !important;
        }

        .candy-btn-hint {
          border-radius: 18px !important;
          font-weight: 900 !important;
          height: 36px !important;
          background: ${secondaryColor} !important;
          color: #78350F !important;
          border: 2px solid #F59E0B !important;
          box-shadow: 0 4px 0 #D97706 !important;
        }

        .candy-info-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 10px 16px;
          margin-bottom: 10px;
          border: 2px dashed #C7D2FE;
        }

        .candy-desc-text {
          margin: 0 0 6px;
          font-size: 13px;
          line-height: 1.4;
          color: #475569;
          font-weight: 700;
        }

        .candy-progress-section {
          background: #FFF;
          padding: 8px 12px;
          border-radius: 14px;
          border: 2px solid #E2E8F0;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 900;
          color: #64748B;
          margin-bottom: 4px;
        }

        .count-candy {
          color: #6366F1;
        }

        .candy-toolbar {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 10px;
        }

        .candy-board-grid {
          flex: 1;
          min-height: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .candy-column {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .cards-scroll-container {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 4px;
        }

        .column-header-candy {
          text-align: center;
          font-size: 12px;
          font-weight: 900;
          padding: 6px;
          border-radius: 14px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .left-header-candy {
          color: #4F46E5;
          background: #EEF2FF;
          border: 2px solid #C7D2FE;
        }

        .right-header-candy {
          color: #D97706;
          background: #FEF3C7;
          border: 2px solid #FDE68A;
        }

        .candy-card {
          border-style: solid;
          border-width: 3px;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
        }

        .candy-card:hover:not(.state-matched) {
          transform: translateY(-2px);
        }

        .card-text {
          font-size: 14px;
          font-weight: 800;
        }

        .state-wrong {
          background: #FEF2F2 !important;
          border-color: #EF4444 !important;
          box-shadow: 0 4px 0 #DC2626 !important;
          animation: shake 0.4s ease-in-out;
        }

        .candy-modal-badge {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }

        .badge-success-candy {
          background: #FEF3C7;
          border: 3px solid #FDE68A;
        }

        .badge-fail-candy {
          background: #FEE2E2;
          border: 3px solid #FCA5A5;
        }

        .candy-score-board {
          margin: 14px 0;
          padding: 12px;
          background: #FFF;
          border-radius: 16px;
          border: 2px solid #E2E8F0;
          display: flex;
          justify-around: space-around;
          align-items: center;
        }

        .score-label {
          font-size: 10px;
          font-weight: 900;
          color: #94A3B8;
          display: block;
        }

        .score-val {
          font-size: 22px;
          font-weight: 900;
        }

        .score-divider {
          width: 2px;
          height: 28px;
          background: #E2E8F0;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        @media (max-width: 640px) {
          .candy-board-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchingGame;
