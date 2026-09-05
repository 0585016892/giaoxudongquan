import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Progress } from "antd";

import {
  ArrowLeft,
  ArrowRight,
  X,
  Lightbulb,
  Trophy,
  Volume2,
  VolumeX,
  Clock,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  Home,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = process.env.REACT_APP_API_URL || "";

/* =========================================================
   OPTION STYLES
========================================================= */

const OPTION_STYLES = [
  {
    letter: "A",
    bg: "#FFF9E6",
    border: "#FFC53D",
    badge: "linear-gradient(135deg, #FFC53D, #FF9C6E)",
    text: "#593800",
  },
  {
    letter: "B",
    bg: "#E6F7FF",
    border: "#4096FF",
    badge: "linear-gradient(135deg, #4096FF, #1677FF)",
    text: "#002C66",
  },
  {
    letter: "C",
    bg: "#F9F0FF",
    border: "#B37FEB",
    badge: "linear-gradient(135deg, #B37FEB, #722ED1)",
    text: "#391085",
  },
  {
    letter: "D",
    bg: "#E6FFFB",
    border: "#36CFC9",
    badge: "linear-gradient(135deg, #36CFC9, #006D75)",
    text: "#002329",
  },
];

/* =========================================================
   BUTTON COMPONENT
========================================================= */

const GameButton = ({
  children,
  icon,
  variant = "primary",
  onClick,
  disabled = false,
  fullWidth = false,
  style = {},
}) => {
  const variants = {
    primary: {
      background: "linear-gradient(135deg, #6C4BFF 0%, #8B5CF6 100%)",
      color: "#fff",
      border: "2px solid rgba(255,255,255,.35)",
      shadow: "0 8px 20px rgba(108,75,255,.28)",
    },

    secondary: {
      background: "linear-gradient(135deg, #FFD54F 0%, #FFB703 100%)",
      color: "#4A3200",
      border: "2px solid rgba(255,255,255,.7)",
      shadow: "0 8px 20px rgba(255,183,3,.25)",
    },

    danger: {
      background: "linear-gradient(135deg, #FF5C5C 0%, #EF4444 100%)",
      color: "#fff",
      border: "2px solid rgba(255,255,255,.35)",
      shadow: "0 8px 20px rgba(239,68,68,.25)",
    },

    ghost: {
      background: "rgba(255,255,255,.92)",
      color: "#374151",
      border: "2px solid #E5E7EB",
      shadow: "0 5px 14px rgba(0,0,0,.08)",
    },

    dark: {
      background: "linear-gradient(135deg, #374151, #111827)",
      color: "#fff",
      border: "2px solid rgba(255,255,255,.2)",
      shadow: "0 8px 20px rgba(0,0,0,.2)",
    },
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        width: fullWidth ? "100%" : "auto",
        minHeight: 46,
        padding: "10px 18px",
        borderRadius: 16,
        border: v.border,
        background: v.background,
        color: v.color,
        boxShadow: disabled ? "none" : v.shadow,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        fontSize: 15,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition:
          "transform .15s ease, box-shadow .15s ease, filter .15s ease",
        fontFamily: "inherit",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.filter = "brightness(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.filter = "brightness(1)";
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(2px) scale(.98)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>

      <span>{children}</span>
    </button>
  );
};

/* =========================================================
   ROUND BUTTON
========================================================= */

const RoundButton = ({
  children,
  onClick,
  title,
  primaryColor,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 46,
        height: 46,
        minWidth: 46,
        borderRadius: "50%",
        border: "3px solid rgba(255,255,255,.55)",
        background: primaryColor,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        boxShadow: "0 7px 18px rgba(0,0,0,.2)",
        transition: "all .18s ease",
        opacity: disabled ? 0.5 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,.25)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 7px 18px rgba(0,0,0,.2)";
      }}
    >
      {children}
    </button>
  );
};

/* =========================================================
   QUIZ GAME
========================================================= */

const QuizGame = ({ game = {}, onExit }) => {
  console.log("QUIZ GAME:", game);

  /* =====================================================
     DATA
  ===================================================== */

  const rawQuestions = useMemo(() => {
    return Array.isArray(game?.questions) ? game.questions : [];
  }, [game?.questions]);

  const settings = useMemo(() => {
    return game?.settings || {};
  }, [game?.settings]);

  const media = useMemo(() => {
    return game?.media || {};
  }, [game?.media]);

  const theme = useMemo(() => {
    return game?.theme || {};
  }, [game?.theme]);

  const background = useMemo(() => {
    return game?.background || game?.backgroundConfig || {};
  }, [game?.background, game?.backgroundConfig]);

  /* =====================================================
     THEME
  ===================================================== */

  const primaryColor = theme?.primary || "#6C4BFF";

  const secondaryColor = theme?.secondary || "#FFD54F";

  const gameFont = theme?.font || "Baloo 2";

  /* =====================================================
     BACKGROUND
  ===================================================== */

  const bgImage = background?.image
    ? background.image.startsWith("http")
      ? background.image
      : `${API_URL.replace(/\/api\/?$/, "")}${
          background.image.startsWith("/") ? "" : "/"
        }${background.image}`
    : null;

  const bgColor = background?.color || "#ffffff";

  const pageBackground = {
    minHeight: "100vh",
    backgroundColor: bgColor,
    backgroundImage: bgImage
      ? `linear-gradient(
          rgba(0,0,0,.08),
          rgba(0,0,0,.08)
        ), url("${bgImage}")`
      : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    boxSizing: "border-box",
  };

  /* =====================================================
     QUESTIONS
  ===================================================== */

  const questions = useMemo(() => {
    if (!settings.shuffleQuestions) {
      return rawQuestions;
    }

    return [...rawQuestions].sort(() => Math.random() - 0.5);
  }, [rawQuestions, settings.shuffleQuestions]);

  /* =====================================================
     STATE
  ===================================================== */

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [userAnswersHistory, setUserAnswersHistory] = useState([]);

  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(Number(settings.timeLimit) || 30);

  const [finished, setFinished] = useState(false);

  const [showResult, setShowResult] = useState(false);

  const [isReviewMode, setIsReviewMode] = useState(false);

  const [isMuted, setIsMuted] = useState(false);

  const [isHintOpen, setIsHintOpen] = useState(false);

  /* =====================================================
     REFS
  ===================================================== */

  const correctAudioRef = useRef(null);

  const wrongAudioRef = useRef(null);

  const backgroundMusicRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  /* =====================================================
     AUDIO URL
  ===================================================== */

  const getAudioUrl = useCallback((audio) => {
    if (!audio) return null;

    if (typeof audio === "string") {
      return audio.startsWith("http")
        ? audio
        : `${API_URL.replace(/\/api\/?$/, "")}${
            audio.startsWith("/") ? "" : "/"
          }${audio}`;
    }

    if (typeof audio === "object" && audio !== null) {
      const value =
        audio.url || audio.path || audio.src || audio.location || null;

      if (!value) return null;

      if (typeof value === "string" && value.startsWith("http")) {
        return value;
      }

      return `${API_URL.replace(/\/api\/?$/, "")}${
        value.startsWith("/") ? "" : "/"
      }${value}`;
    }

    return null;
  }, []);

  /* =====================================================
     LOAD AUDIO
  ===================================================== */

  useEffect(() => {
    const correctUrl = getAudioUrl(media?.correctSound);

    const wrongUrl = getAudioUrl(media?.wrongSound);

    const backgroundMusicUrl = getAudioUrl(media?.backgroundMusic);

    if (correctUrl) {
      correctAudioRef.current = new Audio(correctUrl);

      correctAudioRef.current.preload = "auto";
    }

    if (wrongUrl) {
      wrongAudioRef.current = new Audio(wrongUrl);

      wrongAudioRef.current.preload = "auto";
    }

    if (backgroundMusicUrl) {
      backgroundMusicRef.current = new Audio(backgroundMusicUrl);

      backgroundMusicRef.current.loop = true;

      backgroundMusicRef.current.volume = 0.3;

      backgroundMusicRef.current.play().catch(() => {});
    }

    return () => {
      [correctAudioRef, wrongAudioRef, backgroundMusicRef].forEach((ref) => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
          ref.current = null;
        }
      });
    };
  }, [
    media?.correctSound,
    media?.wrongSound,
    media?.backgroundMusic,
    getAudioUrl,
  ]);

  /* =====================================================
     MUTE
  ===================================================== */

  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.muted = isMuted;
    }
  }, [isMuted]);

  /* =====================================================
     PLAY SOUND
  ===================================================== */

  const playSound = useCallback(
    (isCorrect) => {
      if (isMuted) return;

      const audio = isCorrect ? correctAudioRef.current : wrongAudioRef.current;

      if (!audio) return;

      audio.currentTime = 0;

      audio.play().catch(() => {});
    },
    [isMuted],
  );

  /* =====================================================
     ANSWERS
  ===================================================== */

  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return [];

    const options = currentQuestion.answers || currentQuestion.options || [];

    if (!settings.shuffleAnswers) {
      return options;
    }

    return [...options].sort(() => Math.random() - 0.5);
  }, [currentQuestion, settings.shuffleAnswers]);

  /* =====================================================
     CHECK CORRECT
  ===================================================== */

  const checkAnswerIsCorrect = useCallback(
    (optionObj, question = currentQuestion) => {
      if (!optionObj || !question) {
        return false;
      }

      /* -----------------------------------------------
         DATA CỦA MÀY:

         {
           id: "A",
           text: "Một",
           correct: true
         }

         nên ưu tiên correct === true
      ------------------------------------------------ */

      if (typeof optionObj === "object" && optionObj !== null) {
        if (optionObj.correct === true || optionObj.isCorrect === true) {
          return true;
        }
      }

      const correctVal =
        question?.correctAnswer ?? question?.answer ?? question?.correct;

      const optionVal =
        typeof optionObj === "object"
          ? (optionObj.value ??
            optionObj.id ??
            optionObj.text ??
            optionObj.label ??
            optionObj.answer)
          : optionObj;

      if (correctVal !== undefined && optionVal !== undefined) {
        return (
          String(correctVal).trim().toLowerCase() ===
          String(optionVal).trim().toLowerCase()
        );
      }

      return false;
    },
    [currentQuestion],
  );

  /* =====================================================
     NEXT QUESTION
     
     KHÔNG TỰ ĐỘNG NEXT.
     Chỉ chạy khi người dùng bấm nút.
  ===================================================== */

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setFinished(true);
      setShowResult(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, questions.length]);

  /* =====================================================
     SELECT ANSWER
     
     Không tự động chuyển câu.
  ===================================================== */

  const handleSelectAnswer = useCallback(
    (option, isTimeout = false) => {
      if (selectedAnswer !== null || !currentQuestion) {
        return;
      }

      setSelectedAnswer(option);

      const isCorrectChoice = !isTimeout && checkAnswerIsCorrect(option);

      playSound(isCorrectChoice);

      const questionPoints = Number(currentQuestion?.points) || 10;

      if (isCorrectChoice) {
        setScore((prev) => prev + questionPoints);
      }

      setUserAnswersHistory((prev) => [
        ...prev,
        {
          questionIndex: currentIndex,

          questionId: currentQuestion?.id || null,

          questionText:
            currentQuestion?.question || currentQuestion?.title || "",

          selectedOption: option,

          isCorrect: isCorrectChoice,

          isTimeout,

          skipped: false,

          points: questionPoints,
        },
      ]);
    },
    [
      selectedAnswer,
      currentQuestion,
      currentIndex,
      checkAnswerIsCorrect,
      playSound,
    ],
  );

  /* =====================================================
     TIMER
     
     Hết giờ:
     - đánh dấu sai
     - đứng nguyên câu
     - người dùng bấm Câu tiếp theo
  ===================================================== */

  useEffect(() => {
    if (
      finished ||
      !settings.showTimer ||
      !currentQuestion ||
      isReviewMode ||
      selectedAnswer !== null
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleSelectAnswer(null, true);

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    finished,
    currentQuestion,
    settings.showTimer,
    isReviewMode,
    selectedAnswer,
    handleSelectAnswer,
  ]);

  /* =====================================================
     RESET QUESTION
  ===================================================== */

  useEffect(() => {
    if (!currentQuestion) return;

    setTimeLeft(Number(settings.timeLimit) || 30);

    setSelectedAnswer(null);

    setIsHintOpen(false);
  }, [currentIndex, currentQuestion, settings.timeLimit]);

  /* =====================================================
     RESTART
  ===================================================== */

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);

    setSelectedAnswer(null);

    setUserAnswersHistory([]);

    setScore(0);

    setTimeLeft(Number(settings.timeLimit) || 30);

    setFinished(false);

    setShowResult(false);

    setIsReviewMode(false);

    setIsHintOpen(false);
  }, [settings.timeLimit]);

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  /* =====================================================
     EMPTY GAME
  ===================================================== */

  if (!questions.length) {
    return (
      <div
        style={{
          ...pageBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: `'${gameFont}', 'Nunito', sans-serif`,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 500,
            padding: 36,
            borderRadius: 28,
            background: "rgba(255,255,255,.95)",
            textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,.18)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6C4BFF,#8B5CF6)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={34} />
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontWeight: 900,
            }}
          >
            Game chưa có câu hỏi
          </h2>

          <p
            style={{
              color: "#6B7280",
              marginBottom: 24,
            }}
          >
            Vui lòng kiểm tra lại cấu hình bộ câu hỏi.
          </p>

          <GameButton icon={<ArrowLeft size={18} />} onClick={onExit} fullWidth>
            Quay lại
          </GameButton>
        </div>
      </div>
    );
  }

  /* =====================================================
     REVIEW MODE
  ===================================================== */

  if (isReviewMode) {
    return (
      <div
        style={{
          ...pageBackground,
          padding: "30px 20px",
          fontFamily: `'${gameFont}', 'Nunito', sans-serif`,
        }}
      >
        <div
          style={{
            maxWidth: 850,
            margin: "0 auto",
            background: "rgba(255,255,255,.94)",
            backdropFilter: "blur(18px)",
            borderRadius: 30,
            padding: 30,
            boxShadow: "0 25px 60px rgba(0,0,0,.18)",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginBottom: 25,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: primaryColor,
                  fontWeight: 800,
                  fontSize: 14,
                  marginBottom: 4,
                }}
              >
                <Eye size={17} />
                KẾT QUẢ
              </div>

              <h2
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  margin: 0,
                  color: "#111827",
                }}
              >
                Xem lại đáp án
              </h2>
            </div>

            <GameButton
              variant="primary"
              icon={<ArrowLeft size={17} />}
              onClick={() => setIsReviewMode(false)}
            >
              Trở lại
            </GameButton>
          </div>

          {/* QUESTIONS */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {questions.map((q, qIdx) => {
              const userAns = userAnswersHistory.find(
                (a) => a.questionId === q.id || a.questionIndex === qIdx,
              );

              const answersList = q.answers || q.options || [];

              return (
                <div
                  key={q.id || qIdx}
                  style={{
                    background: "#F8FAFC",
                    border: "2px solid #E5E7EB",
                    borderRadius: 22,
                    padding: 20,
                  }}
                >
                  {/* QUESTION */}

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 15,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 38,
                        height: 38,
                        borderRadius: 12,
                        background: primaryColor,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      {qIdx + 1}
                    </div>

                    <p
                      style={{
                        fontWeight: 850,
                        fontSize: 17,
                        color: "#111827",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {q.question || q.title}
                    </p>
                  </div>

                  {/* ANSWERS */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                      gap: 10,
                    }}
                  >
                    {answersList.map((opt, optIdx) => {
                      const isCorrectOpt = checkAnswerIsCorrect(opt, q);

                      const isUserSelected =
                        userAns?.selectedOption &&
                        (userAns.selectedOption === opt ||
                          userAns.selectedOption?.id === opt?.id);

                      const optionLabel =
                        typeof opt === "object"
                          ? (opt.text ?? opt.label ?? opt.answer ?? opt.value)
                          : opt;

                      let bg = "#fff";
                      let border = "#E5E7EB";
                      let color = "#374151";

                      if (isCorrectOpt) {
                        bg = "#ECFDF5";
                        border = "#22C55E";
                        color = "#166534";
                      } else if (isUserSelected) {
                        bg = "#FEF2F2";
                        border = "#EF4444";
                        color = "#991B1B";
                      }

                      return (
                        <div
                          key={opt?.id || optIdx}
                          style={{
                            padding: "12px 14px",
                            borderRadius: 16,
                            background: bg,
                            border: `2px solid ${border}`,
                            color,
                            fontWeight: 750,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <span>{optionLabel}</span>

                          {isCorrectOpt && <CheckCircle2 size={19} />}

                          {isUserSelected && !isCorrectOpt && (
                            <XCircle size={19} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* EXPLANATION */}

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 14,
                        background: "#FFFBE6",
                        border: "1px solid #FFE58F",
                        borderRadius: 16,
                        color: "#614700",
                        fontWeight: 650,
                        lineHeight: 1.6,
                      }}
                    >
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     RESULT
  ===================================================== */

  if (showResult) {
    const maxScore =
      questions.reduce(
        (total, question) => total + (Number(question?.points) || 10),
        0,
      ) || 0;

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    const correctCount = userAnswersHistory.filter(
      (item) => item.isCorrect,
    ).length;

    return (
      <div
        style={{
          ...pageBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: `'${gameFont}', 'Nunito', sans-serif`,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 540,
            background: "rgba(255,255,255,.96)",
            backdropFilter: "blur(18px)",
            borderRadius: 34,
            padding: "42px 32px 30px",
            textAlign: "center",
            boxShadow: "0 30px 70px rgba(0,0,0,.22)",
            border: "5px solid rgba(255,255,255,.8)",
          }}
        >
          {/* TROPHY */}

          <div
            style={{
              width: 105,
              height: 105,
              margin: "0 auto 18px",
              borderRadius: "50%",
              background: `linear-gradient(
                135deg,
                ${secondaryColor},
                ${primaryColor}
              )`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 15px 35px rgba(108,75,255,.3)",
            }}
          >
            <Trophy size={55} />
          </div>

          <div
            style={{
              color: primaryColor,
              fontWeight: 850,
              fontSize: 14,
              letterSpacing: 1,
            }}
          >
            🎉 CHÚC MỪNG!
          </div>

          <h1
            style={{
              fontSize: 34,
              fontWeight: 950,
              color: "#111827",
              margin: "5px 0",
            }}
          >
            Hoàn thành!
          </h1>

          <p
            style={{
              color: "#6B7280",
              fontSize: 16,
              margin: "4px 0 15px",
            }}
          >
            {game.name || "Hoàn thành bài trắc nghiệm"}
          </p>

          {/* SCORE */}

          <div
            style={{
              fontSize: 58,
              lineHeight: 1,
              fontWeight: 950,
              color: primaryColor,
              margin: "12px 0",
            }}
          >
            {score}

            <span
              style={{
                fontSize: 22,
                marginLeft: 6,
              }}
            >
              điểm
            </span>
          </div>

          {/* CORRECT */}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 14px",
              background: "#F3F4F6",
              borderRadius: 30,
              color: "#4B5563",
              fontWeight: 800,
              marginBottom: 18,
            }}
          >
            <CheckCircle2 size={17} />
            Đúng {correctCount}/{questions.length} câu
          </div>

          {/* PROGRESS */}

          <Progress
            percent={percentage}
            strokeColor={{
              "0%": secondaryColor,
              "100%": primaryColor,
            }}
            size={["100%", 14]}
            showInfo={false}
          />

          {/* ACTIONS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 25,
            }}
          >
            <GameButton
              variant="ghost"
              icon={<Eye size={18} />}
              onClick={() => setIsReviewMode(true)}
              fullWidth
            >
              Xem đáp án
            </GameButton>

            <GameButton
              variant="primary"
              icon={<RotateCcw size={18} />}
              onClick={handleRestart}
              fullWidth
            >
              Chơi lại
            </GameButton>
          </div>

          <GameButton
            variant="dark"
            icon={<Home size={18} />}
            onClick={onExit}
            fullWidth
            style={{
              marginTop: 12,
            }}
          >
            Thoát Game
          </GameButton>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN GAME
     
     VÀO LÀ CHƠI NGAY
     Không có màn hình Bắt đầu chơi.
  ===================================================== */

  return (
    <div
      style={{
        ...pageBackground,
        minHeight: "100vh",
        padding: "18px 24px 22px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: `'${gameFont}', 'Baloo 2', 'Nunito', sans-serif`,
        userSelect: "none",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1000,
          margin: "0 auto",
          width: "100%",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* TIMER */}

        {settings.showTimer ? (
          <div
            style={{
              background: "linear-gradient(135deg, #6C4BFF, #8B5CF6)",
              border: "3px solid rgba(255,255,255,.4)",
              borderRadius: 22,
              padding: "6px 18px 6px 7px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              boxShadow: "0 8px 22px rgba(0,0,0,.18)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: secondaryColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4A3200",
                boxShadow: "0 4px 10px rgba(0,0,0,.15)",
              }}
            >
              <Clock size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "rgba(255,255,255,.8)",
                  lineHeight: 1,
                  textTransform: "uppercase",
                }}
              >
                Thời gian
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 950,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* CONTROLS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* SCORE */}

          {settings.showScore !== false && (
            <div
              style={{
                background: "rgba(255,255,255,.9)",
                border: "2px solid rgba(255,255,255,.6)",
                borderRadius: 20,
                padding: "6px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 16px rgba(0,0,0,.08)",
              }}
            >
              <Trophy size={18} color={primaryColor} />

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "#111827",
                }}
              >
                Điểm: {score}
              </div>
            </div>
          )}

          {/* MUTE */}

          <RoundButton
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            onClick={() => setIsMuted(!isMuted)}
            primaryColor={primaryColor}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </RoundButton>

          {/* EXIT */}

          <RoundButton title="Thoát" onClick={onExit} primaryColor="#EF4444">
            <X size={20} />
          </RoundButton>
        </div>
      </div>

      {/* =================================================
          QUESTION CARD
      ================================================= */}

      <div
        style={{
          maxWidth: 900,
          width: "100%",
          margin: "24px auto 18px",
          background: "rgba(255,255,255,.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 32,
          padding: 32,
          boxShadow: "0 20px 50px rgba(0,0,0,.15)",
          border: "4px solid rgba(255,255,255,.8)",
          boxSizing: "border-box",
        }}
      >
        {/* QUESTION HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: `linear-gradient(
                135deg,
                ${primaryColor},
                #8B5CF6
              )`,
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 850,
            }}
          >
            Câu {currentIndex + 1} / {questions.length}
          </span>

          {currentQuestion?.hint && (
            <button
              type="button"
              onClick={() => setIsHintOpen(!isHintOpen)}
              style={{
                background: "#FFFBE6",
                border: "2px solid #FFE58F",
                color: "#D48806",
                borderRadius: 16,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <Lightbulb size={16} />
              Gợi ý
            </button>
          )}
        </div>

        {/* HINT */}

        {isHintOpen && currentQuestion?.hint && (
          <div
            style={{
              background: "#FFFBE6",
              border: "2px solid #FFE58F",
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
              color: "#8C6B00",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            💡 {currentQuestion.hint}
          </div>
        )}

        {/* QUESTION */}

        <h2
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#1F2937",
            lineHeight: 1.4,
            margin: "0 0 28px",
          }}
        >
          {currentQuestion?.question || currentQuestion?.title}
        </h2>

        {/* =================================================
            OPTIONS
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {shuffledAnswers.map((option, index) => {
            const styleConfig = OPTION_STYLES[index % OPTION_STYLES.length];

            const isSelected = selectedAnswer === option;

            const isCorrect = checkAnswerIsCorrect(option);

            let bg = styleConfig.bg;

            let border = styleConfig.border;

            if (selectedAnswer !== null) {
              if (isCorrect) {
                bg = "#ECFDF5";

                border = "#10B981";
              } else if (isSelected) {
                bg = "#FEF2F2";

                border = "#EF4444";
              }
            }

            const labelText =
              typeof option === "object"
                ? (option.text ?? option.label ?? option.answer ?? option.value)
                : option;

            return (
              <button
                key={option?.id || index}
                type="button"
                disabled={selectedAnswer !== null}
                onClick={() => handleSelectAnswer(option)}
                style={{
                  background: bg,
                  border: `3px solid ${border}`,
                  borderRadius: 22,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: selectedAnswer !== null ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all .15s ease",
                  boxShadow: "0 6px 16px rgba(0,0,0,.04)",
                  fontFamily: "inherit",
                  minWidth: 0,
                }}
              >
                {/* LETTER */}

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    background: styleConfig.badge,
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {styleConfig.letter}
                </div>

                {/* TEXT */}

                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: styleConfig.text,
                    flex: 1,
                    minWidth: 0,
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  {labelText}
                </span>

                {/* CORRECT */}

                {selectedAnswer !== null && isCorrect && (
                  <CheckCircle2
                    size={24}
                    color="#10B981"
                    style={{
                      flexShrink: 0,
                    }}
                  />
                )}

                {/* WRONG */}

                {selectedAnswer !== null && isSelected && !isCorrect && (
                  <XCircle
                    size={24}
                    color="#EF4444"
                    style={{
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* =================================================
            EXPLANATION
        ================================================= */}

        {selectedAnswer !== null && currentQuestion?.explanation && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "#FFFBE6",
              border: "2px solid #FFE58F",
              borderRadius: 18,
              color: "#614700",
              fontWeight: 650,
              lineHeight: 1.6,
            }}
          >
            <strong>💡 Giải thích:</strong> {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* =================================================
          NEXT BUTTON
          
          CHỈ HIỆN SAU KHI CHỌN ĐÁP ÁN
          HOẶC HẾT THỜI GIAN.
      ================================================= */}

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: 8,
          boxSizing: "border-box",
        }}
      >
        {selectedAnswer !== null && (
          <GameButton
            variant="primary"
            icon={<ArrowRight size={19} />}
            onClick={handleNext}
          >
            {currentIndex >= questions.length - 1
              ? "Xem kết quả"
              : "Câu tiếp theo"}
          </GameButton>
        )}
      </div>

      {/* =================================================
          MOBILE RESPONSIVE
      ================================================= */}

      <style>
        {`
          @media (max-width: 768px) {
            .quiz-game-options {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 576px) {
            .quiz-game-root {
              padding: 12px !important;
            }
          }

          @media (max-width: 480px) {
            button {
              -webkit-tap-highlight-color: transparent;
            }
          }
        `}
      </style>
    </div>
  );
};

export default QuizGame;
