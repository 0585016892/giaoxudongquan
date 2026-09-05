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
  Divider,
  Modal,
  Progress,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  ClockCircleFilled,
  CloseCircleFilled,
  HeartFilled,
  PauseCircleOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  StarFilled,
  TrophyFilled,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/* =========================================================
   HELPERS
========================================================= */

const normalizeAnswer = (value = "") => {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
};

const getWordAnswer = (word) => {
  return normalizeAnswer(word?.answer || word?.word || "");
};

const getWordDisplay = (word) => {
  return word?.answerDisplay || word?.answer || word?.word || "";
};

const getWordId = (word, index) => {
  return word?.id ?? `word-${index}`;
};

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/* =========================================================
   COMPONENT
========================================================= */

const CrosswordGame = ({ game, onComplete, onBack }) => {
  /* =======================================================
     DATA
  ======================================================= */

  const crossword = useMemo(() => game?.crossword || {}, [game]);
  const settings = game?.settings || {};
  const theme = game?.theme || {};
  const background = game?.background || {};
  const media = game?.media || {};

  const primaryColor = theme.primary || "#FF5C8A";
  const secondaryColor = theme.secondary || "#FFB703";
  const borderRadius = Number(theme.borderRadius) || 20;
  const fontFamily = theme.font || "Be Vietnam Pro";

  const allowHint = Boolean(settings.allowHint);
  const allowSkip = Boolean(settings.allowSkip);
  const showProgress = Boolean(settings.showProgress);
  const showScore = Boolean(settings.showScore);
  const showTimer = Boolean(settings.showTimer);
  // const shuffleAnswers = Boolean(settings.shuffleAnswers);
  const shuffleQuestions = Boolean(settings.shuffleQuestions);

  const timeLimit = Math.max(1, Number(settings.timeLimit) || 60);

  /* =======================================================
     WORDS

     QUAN TRỌNG:
     Không tự tính lại row / col.
     Dùng chính xác dữ liệu backend.

     Ví dụ:
       ADAM
       row = 0
       col = -3
       answerIndex = 3

     => chữ M nằm ở:
       col + answerIndex
       = -3 + 3
       = 0
  ======================================================= */

  const words = useMemo(() => {
    const rawWords = Array.isArray(crossword.words) ? crossword.words : [];
    const result = rawWords
      .map((word, index) => {
        const answer = getWordAnswer(word);

        const row = Number(word?.row);
        const col = Number(word?.col);

        let answerIndex = Number(word?.answerIndex);

        if (!Number.isFinite(answerIndex)) {
          answerIndex = 0;
        }

        return {
          ...word,

          id: getWordId(word, index),

          number: Number.isFinite(Number(word?.number))
            ? Number(word.number)
            : index + 1,

          answer,

          displayAnswer: getWordDisplay(word),

          row: Number.isFinite(row) ? row : 0,

          col: Number.isFinite(col) ? col : 0,

          answerIndex: clamp(answerIndex, 0, Math.max(0, answer.length - 1)),

          points: Number.isFinite(Number(word?.points))
            ? Number(word.points)
            : 10,

          direction: word?.direction === "vertical" ? "vertical" : "horizontal",
        };
      })
      .filter((word) => word.answer.length > 0);

    const sorted = [...result].sort((a, b) => a.number - b.number);

    if (shuffleQuestions) {
      return [...sorted].sort(() => Math.random() - 0.5);
    }

    return sorted;
  }, [crossword, shuffleQuestions]);

  /* =======================================================
     STATE
  ======================================================= */

  const [selectedWordId, setSelectedWordId] = useState(null);

  const [answers, setAnswers] = useState({});

  const [correctWords, setCorrectWords] = useState({});

  const [wrongWords, setWrongWords] = useState({});

  const [revealedWords, setRevealedWords] = useState({});

  const [skippedWords, setSkippedWords] = useState({});

  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const [gameStarted, setGameStarted] = useState(false);

  const [gameFinished, setGameFinished] = useState(false);

  const [isPaused, setIsPaused] = useState(false);

  const [showFinishModal, setShowFinishModal] = useState(false);

  const [completedOnce, setCompletedOnce] = useState(false);

  const completedCallbackRef = useRef(false);

  /* =======================================================
     AUDIO
  ======================================================= */

  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const backgroundAudioRef = useRef(null);

  useEffect(() => {
    if (media.correctSound) {
      correctAudioRef.current = new Audio(media.correctSound);
    }

    if (media.wrongSound) {
      wrongAudioRef.current = new Audio(media.wrongSound);
    }

    if (media.backgroundMusic) {
      backgroundAudioRef.current = new Audio(media.backgroundMusic);

      backgroundAudioRef.current.loop = true;
      backgroundAudioRef.current.volume = 0.25;
    }

    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
      }
    };
  }, [media.correctSound, media.wrongSound, media.backgroundMusic]);

  const playCorrectSound = useCallback(() => {
    if (!correctAudioRef.current) return;

    try {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const playWrongSound = useCallback(() => {
    if (!wrongAudioRef.current) return;

    try {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const startBackgroundMusic = useCallback(() => {
    if (!backgroundAudioRef.current) return;

    backgroundAudioRef.current.play().catch(() => {});
  }, []);

  /* =======================================================
     START
  ======================================================= */

  useEffect(() => {
    if (!words.length) return;

    if (selectedWordId === null) {
      setSelectedWordId(words[0].id);
    }
  }, [words, selectedWordId]);

  useEffect(() => {
    if (!gameStarted) return;

    startBackgroundMusic();
  }, [gameStarted, startBackgroundMusic]);

  /* =======================================================
     TIMER
  ======================================================= */

  useEffect(() => {
    if (!showTimer) return;
    if (!gameStarted) return;
    if (gameFinished) return;
    if (isPaused) return;

    if (timeLeft <= 0) {
      setGameFinished(true);
      setShowFinishModal(true);

      message.warning("Hết thời gian! ⏰");

      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimer, gameStarted, gameFinished, isPaused, timeLeft]);

  /* =======================================================
     FINISH GAME
  ======================================================= */

  const finishGame = useCallback(
    (reason = "completed") => {
      if (completedCallbackRef.current) return;

      completedCallbackRef.current = true;

      setGameFinished(true);
      setCompletedOnce(true);
      setShowFinishModal(true);

      if (typeof onComplete === "function") {
        onComplete({
          gameId: game?.id,

          score,

          totalQuestions: words.length,

          completedQuestions: Object.keys(correctWords).length,

          timeLeft,

          reason,
        });
      }
    },
    [game?.id, score, words.length, correctWords, timeLeft, onComplete],
  );

  /* =======================================================
     AUTO FINISH
  ======================================================= */

  useEffect(() => {
    if (!words.length) return;
    if (gameFinished) return;

    const solvedCount = Object.keys(correctWords).length;

    const skippedCount = Object.keys(skippedWords).length;

    const totalDone = solvedCount + skippedCount;

    if (totalDone >= words.length) {
      finishGame("completed");
    }
  }, [correctWords, skippedWords, words.length, gameFinished, finishGame]);

  /* =======================================================
     SELECT WORD
  ======================================================= */

  const selectWord = (word) => {
    if (!word) return;

    setSelectedWordId(word.id);
  };

  /* =======================================================
     UPDATE ANSWER
  ======================================================= */

  const updateAnswer = (word, value) => {
    if (!word) return;

    if (
      correctWords[word.id] ||
      skippedWords[word.id] ||
      revealedWords[word.id]
    ) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [word.id]: value,
    }));

    setWrongWords((prev) => {
      if (!prev[word.id]) return prev;

      const next = { ...prev };
      delete next[word.id];

      return next;
    });
  };

  /* =======================================================
     CHECK ANSWER
  ======================================================= */

  const submitAnswer = useCallback(
    (word) => {
      if (!word) return;

      if (gameFinished) return;

      if (correctWords[word.id]) return;

      const input = answers[word.id] || "";

      if (!input.trim()) {
        message.warning("Hãy nhập đáp án nhé!");
        return;
      }

      const userAnswer = normalizeAnswer(input);
      const correctAnswer = word.answer;

      if (userAnswer === correctAnswer) {
        setCorrectWords((prev) => ({
          ...prev,
          [word.id]: true,
        }));

        setWrongWords((prev) => {
          const next = { ...prev };
          delete next[word.id];
          return next;
        });

        setScore((prev) => prev + word.points);

        playCorrectSound();

        message.success(
          `Câu ${word.number} chính xác! 🎉 +${word.points} điểm`,
        );

        const currentIndex = words.findIndex((item) => item.id === word.id);

        const nextWord = words
          .slice(currentIndex + 1)
          .find((item) => !correctWords[item.id] && !skippedWords[item.id]);

        if (nextWord) {
          setTimeout(() => {
            setSelectedWordId(nextWord.id);
          }, 350);
        }
      } else {
        setWrongWords((prev) => ({
          ...prev,
          [word.id]: true,
        }));

        playWrongSound();

        message.error(`Câu ${word.number} chưa đúng. Thử lại nhé!`);
      }
    },
    [
      gameFinished,
      correctWords,
      answers,
      words,
      skippedWords,
      playCorrectSound,
      playWrongSound,
    ],
  );
  /* =======================================================
     HINT
  ======================================================= */

  const revealAnswer = (word) => {
    if (!allowHint) {
      message.info("Game này không bật gợi ý.");
      return;
    }

    if (correctWords[word.id]) return;
    if (gameFinished) return;

    setRevealedWords((prev) => ({
      ...prev,
      [word.id]: true,
    }));

    setAnswers((prev) => ({
      ...prev,
      [word.id]: word.displayAnswer,
    }));

    message.info(`Đáp án câu ${word.number}: ${word.displayAnswer}`);
  };

  /* =======================================================
     SKIP
  ======================================================= */

  const skipQuestion = (word) => {
    if (!allowSkip) {
      message.info("Game này không cho phép bỏ qua câu.");
      return;
    }

    if (correctWords[word.id]) return;
    if (gameFinished) return;

    setSkippedWords((prev) => ({
      ...prev,
      [word.id]: true,
    }));

    setSelectedWordId(null);

    message.info(`Đã bỏ qua câu ${word.number}.`);

    const currentIndex = words.findIndex((item) => item.id === word.id);

    const nextWord = words
      .slice(currentIndex + 1)
      .find((item) => !correctWords[item.id] && !skippedWords[item.id]);

    if (nextWord) {
      setTimeout(() => {
        setSelectedWordId(nextWord.id);
      }, 200);
    }
  };

  /* =======================================================
     KEYBOARD
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedWordId) return;
      if (gameFinished) return;
      if (isPaused) return;

      const word = words.find((item) => item.id === selectedWordId);

      if (!word) return;

      if (event.key === "Enter") {
        event.preventDefault();
        submitAnswer(word);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWordId, words, gameFinished, isPaused, submitAnswer]);
  /* =======================================================
     GRID
     
     Đây là phần QUAN TRỌNG NHẤT.

     Không dùng:
       row = index
       col = index

     Mà dùng:
       word.row
       word.col
       word.direction

     Và:
       answerIndex

     Ví dụ ADAM:
       col = -3
       answerIndex = 3

     M => -3 + 3 = 0

     Vì vậy chữ M nằm đúng cột 0.
  ======================================================= */

  const gridData = useMemo(() => {
    if (!words.length) {
      return {
        grid: [],
        rows: 0,
        cols: 0,
        offsetRow: 0,
        offsetCol: 0,
        verticalColumn: null,
      };
    }

    const placements = [];

    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -Infinity;
    let maxCol = -Infinity;

    words.forEach((word) => {
      const answer = word.answer;

      if (!answer) return;

      const row = word.row;
      const col = word.col;

      const direction = word.direction;

      let endRow = row;
      let endCol = col;

      if (direction === "vertical") {
        endRow = row + answer.length - 1;
      } else {
        endCol = col + answer.length - 1;
      }

      minRow = Math.min(minRow, row);
      minCol = Math.min(minCol, col);
      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);

      placements.push({
        word,
        row,
        col,
        direction,
      });
    });

    if (!placements.length) {
      return {
        grid: [],
        rows: 0,
        cols: 0,
        offsetRow: 0,
        offsetCol: 0,
        verticalColumn: null,
      };
    }

    /*
      Backend có rows=9, cols=13.
      Tuy nhiên row/col có thể bắt đầu từ số âm.
      Vì vậy ta offset toàn bộ grid.
    */

    const backendRows = Number(crossword.rows) || 0;

    const backendCols = Number(crossword.cols) || 0;

    const usedRows = maxRow - minRow + 1;

    const usedCols = maxCol - minCol + 1;

    const rows = Math.max(backendRows, usedRows);

    const cols = Math.max(backendCols, usedCols);

    const offsetRow = -minRow;
    const offsetCol = -minCol;

    const grid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        active: false,

        letter: "",

        wordIds: [],

        wordNumbers: [],

        startNumbers: [],
      })),
    );

    placements.forEach(({ word, row, col, direction }) => {
      const answer = word.answer;

      for (let i = 0; i < answer.length; i++) {
        const actualRow = direction === "vertical" ? row + i : row;

        const actualCol = direction === "horizontal" ? col + i : col;

        const gridRow = actualRow + offsetRow;

        const gridCol = actualCol + offsetCol;

        if (gridRow < 0 || gridRow >= rows || gridCol < 0 || gridCol >= cols) {
          continue;
        }

        const current = grid[gridRow][gridCol];

        const letter = answer[i];

        grid[gridRow][gridCol] = {
          ...current,

          active: true,

          letter: current.letter || letter,

          wordIds: [...new Set([...current.wordIds, word.id])],

          wordNumbers: [...new Set([...current.wordNumbers, word.number])],

          startNumbers:
            i === 0
              ? [...new Set([...current.startNumbers, word.number])]
              : current.startNumbers,
        };
      }
    });

    /*
      Tìm cột chứa chữ cái hàng dọc.
      Chính xác dựa trên:
        col + answerIndex

      Không đoán bằng số thứ tự câu.
    */

    const verticalCandidates = words
      .map((word) => {
        if (!Number.isFinite(word.answerIndex)) {
          return null;
        }

        if (word.answerIndex < 0 || word.answerIndex >= word.answer.length) {
          return null;
        }

        if (word.direction === "vertical") {
          return null;
        }

        const actualCol = word.col + word.answerIndex;

        return actualCol;
      })
      .filter((value) => value !== null);

    let verticalColumn = null;

    if (verticalCandidates.length) {
      const counter = {};

      verticalCandidates.forEach((col) => {
        counter[col] = (counter[col] || 0) + 1;
      });

      const mostCommon = Object.entries(counter).sort(
        (a, b) => Number(b[1]) - Number(a[1]),
      )[0];

      if (mostCommon) {
        verticalColumn = Number(mostCommon[0]) + offsetCol;
      }
    }

    return {
      grid,
      rows,
      cols,
      offsetRow,
      offsetCol,
      verticalColumn,
      placements,
    };
  }, [words, crossword.rows, crossword.cols]);

  /* =======================================================
     CURRENT WORD
  ======================================================= */

  const selectedWord = useMemo(() => {
    return words.find((word) => word.id === selectedWordId) || null;
  }, [words, selectedWordId]);

  /* =======================================================
     PROGRESS
  ======================================================= */

  const correctCount = Object.keys(correctWords).length;

  const skippedCount = Object.keys(skippedWords).length;

  const answeredCount = correctCount + skippedCount;

  const progressPercent =
    words.length > 0 ? Math.round((answeredCount / words.length) * 100) : 0;

  /* =======================================================
     TIMER FORMAT
  ======================================================= */

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /* =======================================================
     TIMER COLOR
  ======================================================= */

  const timerDanger = timeLeft <= Math.max(10, Math.floor(timeLimit * 0.15));

  /* =======================================================
     RESET
  ======================================================= */

  const resetGame = () => {
    setSelectedWordId(words[0]?.id || null);

    setAnswers({});
    setCorrectWords({});
    setWrongWords({});
    setRevealedWords({});
    setSkippedWords({});

    setScore(0);
    setTimeLeft(timeLimit);

    setGameStarted(false);
    setGameFinished(false);
    setIsPaused(false);
    setCompletedOnce(false);
    setShowFinishModal(false);

    completedCallbackRef.current = false;

    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
      backgroundAudioRef.current.currentTime = 0;
    }
  };

  /* =======================================================
     START / PAUSE
  ======================================================= */

  const togglePause = () => {
    if (gameFinished) return;

    setGameStarted(true);
    setIsPaused((prev) => !prev);
  };

  /* =======================================================
     CELL CLICK
  ======================================================= */

  const handleCellClick = (cell) => {
    if (!cell?.active) return;

    const word = words.find((item) => cell.wordIds?.includes(item.id));

    if (word) {
      setSelectedWordId(word.id);
    }
  };

  /* =======================================================
     CELL LETTER
  ======================================================= */

  /* =======================================================
     RENDER CELL
  ======================================================= */

  const renderCell = (cell, rowIndex, colIndex) => {
    if (!cell.active) {
      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          style={{
            width: 48,
            height: 48,
            margin: 2,
            flex: "0 0 auto",
          }}
        />
      );
    }

    const wordForCell = words.find((word) => cell.wordIds?.includes(word.id));

    const isSelected = wordForCell && selectedWordId === wordForCell.id;

    const isCompleted = cell.wordIds?.some((id) => correctWords[id]);

    const isRevealed = cell.wordIds?.some((id) => revealedWords[id]);

    const isVertical =
      gridData.verticalColumn !== null && colIndex === gridData.verticalColumn;

    /*
      Xác định chữ hiện tại.
    */

    let displayLetter = "";

    if (isCompleted || isRevealed) {
      const visibleWord = words.find(
        (word) =>
          cell.wordIds?.includes(word.id) &&
          (correctWords[word.id] || revealedWords[word.id]),
      );

      if (visibleWord) {
        let charIndex;

        if (visibleWord.direction === "vertical") {
          charIndex = rowIndex - (visibleWord.row + gridData.offsetRow);
        } else {
          charIndex = colIndex - (visibleWord.col + gridData.offsetCol);
        }

        if (charIndex >= 0 && charIndex < visibleWord.answer.length) {
          displayLetter = visibleWord.answer[charIndex];
        }
      }
    }

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        onClick={() => handleCellClick(cell)}
        style={{
          position: "relative",

          width: 48,
          height: 48,

          margin: 2,

          flex: "0 0 auto",

          borderRadius: 10,

          border: isSelected
            ? `3px solid ${primaryColor}`
            : isVertical
              ? `2px solid ${secondaryColor}`
              : "2px solid #FFD1DC",

          background: isSelected
            ? "#FFE3EC"
            : isVertical
              ? "#FFF5D6"
              : "#FFFFFF",

          boxShadow: isSelected
            ? `0 5px 15px ${primaryColor}55`
            : "0 3px 8px rgba(255,92,138,.10)",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          cursor: "pointer",

          transition: "all .18s ease",

          userSelect: "none",
        }}
      >
        {/* START NUMBER */}

        {cell.startNumbers?.length > 0 && (
          <span
            style={{
              position: "absolute",

              top: 3,

              left: 5,

              fontSize: 9,

              fontWeight: 900,

              color: primaryColor,

              lineHeight: 1,
            }}
          >
            {cell.startNumbers[0]}
          </span>
        )}

        {/* LETTER */}

        <span
          style={{
            fontSize: 21,

            fontWeight: 900,

            color: isVertical ? "#9A6500" : primaryColor,

            lineHeight: 1,
          }}
        >
          {displayLetter}
        </span>

        {/* CHECK */}

        {isCompleted && (
          <CheckCircleFilled
            style={{
              position: "absolute",

              right: 3,

              bottom: 3,

              fontSize: 10,

              color: "#52C41A",
            }}
          />
        )}
      </div>
    );
  };

  /* =======================================================
     QUESTION STATUS
  ======================================================= */

  const getQuestionStatus = (word) => {
    if (correctWords[word.id]) return "correct";

    if (skippedWords[word.id]) return "skipped";

    if (wrongWords[word.id]) return "wrong";

    if (revealedWords[word.id]) return "revealed";

    return "pending";
  };

  /* =======================================================
     QUESTION CARD
  ======================================================= */

  const renderQuestion = (word) => {
    const status = getQuestionStatus(word);

    const isSelected = selectedWordId === word.id;

    const value = answers[word.id] || "";

    const disabled =
      gameFinished ||
      correctWords[word.id] ||
      skippedWords[word.id] ||
      revealedWords[word.id];

    return (
      <Card
        key={word.id}
        size="small"
        onClick={() => selectWord(word)}
        style={{
          marginBottom: 12,

          borderRadius: 16,

          cursor: "pointer",

          border: isSelected
            ? `2px solid ${primaryColor}`
            : "2px solid #FFE3E8",

          background:
            status === "correct"
              ? "#F6FFED"
              : status === "wrong"
                ? "#FFF2F0"
                : status === "skipped"
                  ? "#FAFAFA"
                  : "#FFFFFF",

          boxShadow: isSelected
            ? `0 6px 18px ${primaryColor}25`
            : "0 3px 10px rgba(0,0,0,.04)",

          transition: "all .2s",
        }}
        bodyStyle={{
          padding: 14,
        }}
      >
        <Space
          direction="vertical"
          size={9}
          style={{
            width: "100%",
          }}
        >
          {/* HEADER */}

          <Row justify="space-between" align="middle">
            <Col>
              <Space size={6} wrap>
                <Tag
                  color={status === "correct" ? "green" : "pink"}
                  style={{
                    borderRadius: 9,
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  Câu {word.number}
                </Tag>

                {word.requiredLetter && (
                  <Tag
                    color="gold"
                    style={{
                      borderRadius: 9,
                      fontWeight: 800,
                      margin: 0,
                    }}
                  >
                    Chữ: {word.requiredLetter}
                  </Tag>
                )}

                <Tag
                  style={{
                    borderRadius: 9,
                    margin: 0,
                  }}
                >
                  {word.direction === "vertical" ? "↓ Dọc" : "→ Ngang"}
                </Tag>
              </Space>
            </Col>

            <Col>
              {status === "correct" && (
                <CheckCircleFilled
                  style={{
                    color: "#52C41A",
                    fontSize: 20,
                  }}
                />
              )}

              {status === "wrong" && (
                <CloseCircleFilled
                  style={{
                    color: "#FF4D4F",
                    fontSize: 20,
                  }}
                />
              )}
            </Col>
          </Row>

          {/* QUESTION */}

          <Text
            strong
            style={{
              display: "block",
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {word.question || word.clue}
          </Text>

          {/* ANSWER */}

          <input
            value={value}
            disabled={disabled}
            onFocus={() => selectWord(word)}
            onChange={(event) => updateAnswer(word, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitAnswer(word);
              }
            }}
            placeholder="Nhập đáp án..."
            style={{
              width: "100%",

              height: 42,

              boxSizing: "border-box",

              padding: "0 12px",

              borderRadius: 11,

              border:
                status === "wrong" ? "2px solid #FF4D4F" : `2px solid #FFE0E7`,

              outline: "none",

              background: disabled ? "#F5F5F5" : "#FFF9FA",

              fontSize: 14,

              fontWeight: 700,

              color: "#333",
            }}
          />

          {/* FOOTER */}

          <Row justify="space-between" align="middle" gutter={8}>
            <Col>
              <Tag
                color="orange"
                style={{
                  borderRadius: 8,
                  margin: 0,
                }}
              >
                +{word.points} điểm
              </Tag>
            </Col>

            <Col>
              <Space size={5} wrap>
                {allowHint && (
                  <Button
                    size="small"
                    icon={<QuestionCircleOutlined />}
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      revealAnswer(word);
                    }}
                    style={{
                      borderRadius: 9,
                    }}
                  >
                    Gợi ý
                  </Button>
                )}

                {allowSkip && (
                  <Button
                    size="small"
                    icon={<RightOutlined />}
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      skipQuestion(word);
                    }}
                    style={{
                      borderRadius: 9,
                    }}
                  >
                    Bỏ qua
                  </Button>
                )}

                <Button
                  size="small"
                  type="primary"
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!gameStarted) {
                      setGameStarted(true);
                    }

                    submitAnswer(word);
                  }}
                  style={{
                    background: primaryColor,

                    borderColor: primaryColor,

                    borderRadius: 9,

                    fontWeight: 700,
                  }}
                >
                  Trả lời
                </Button>
              </Space>
            </Col>
          </Row>

          {/* STATUS */}

          {status === "correct" && (
            <Alert
              type="success"
              showIcon
              message="Chính xác! 🎉"
              description={word.displayAnswer}
              style={{
                borderRadius: 10,
              }}
            />
          )}

          {status === "skipped" && (
            <Alert
              type="info"
              showIcon
              message="Đã bỏ qua"
              description={`Đáp án: ${word.displayAnswer}`}
              style={{
                borderRadius: 10,
              }}
            />
          )}

          {status === "revealed" && (
            <Alert
              type="warning"
              showIcon
              message="Đã sử dụng gợi ý"
              description={`Đáp án: ${word.displayAnswer}`}
              style={{
                borderRadius: 10,
              }}
            />
          )}
        </Space>
      </Card>
    );
  };

  /* =======================================================
     EMPTY DATA
  ======================================================= */

  if (!words.length) {
    return (
      <div
        style={{
          minHeight: "100vh",

          display: "flex",

          justifyContent: "center",

          alignItems: "center",

          background: background.color || "#F8F9FC",

          fontFamily: fontFamily,
        }}
      >
        <Card
          style={{
            borderRadius: borderRadius,
          }}
        >
          <Alert
            type="warning"
            showIcon
            message="Game chưa có dữ liệu"
            description="Không tìm thấy crossword.words."
          />
        </Card>
      </div>
    );
  }

  /* =======================================================
     BACKGROUND
  ======================================================= */

  const backgroundStyle = {
    backgroundColor: background.color || "#F8F9FC",

    ...(background.image
      ? {
          backgroundImage: `url("${process.env.REACT_APP_API_URL}/${background.image}")`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }
      : {}),
  };

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",

        padding: "18px 20px 30px",

        boxSizing: "border-box",

        fontFamily: `'${fontFamily}', sans-serif`,

        ...backgroundStyle,
      }}
    >
      {/* =================================================
          TOP HEADER
      ================================================= */}

      <Card
        bordered={false}
        style={{
          maxWidth: 1500,

          margin: "0 auto 16px",

          borderRadius: borderRadius + 4,

          border: "2px solid #FFE3E8",

          boxShadow: "0 8px 30px rgba(255,92,138,.12)",

          background: "rgba(255,255,255,.94)",

          backdropFilter: "blur(8px)",
        }}
        bodyStyle={{
          padding: "16px 20px",
        }}
      >
        <Row justify="space-between" align="middle" gutter={[15, 15]}>
          {/* TITLE */}

          <Col xs={24} md={12}>
            <Space direction="vertical" size={2}>
              <Text
                style={{
                  color: secondaryColor,

                  fontWeight: 900,

                  fontSize: 12,

                  textTransform: "uppercase",

                  letterSpacing: 1.2,
                }}
              >
                🌸 GAME GIÁO LÝ CHIBI
              </Text>

              <Title
                level={2}
                style={{
                  margin: 0,

                  color: primaryColor,

                  fontWeight: 900,

                  fontSize: "clamp(22px, 3vw, 30px)",
                }}
              >
                🧩 {game?.name || "Ô chữ"}
              </Title>

              {game?.description && (
                <Text type="secondary">{game.description}</Text>
              )}
            </Space>
          </Col>

          {/* STATS */}

          <Col>
            <Space size={8} wrap>
              {showScore && (
                <Tag
                  icon={<StarFilled />}
                  color="gold"
                  style={{
                    padding: "7px 11px",

                    borderRadius: 11,

                    fontWeight: 800,

                    fontSize: 13,

                    margin: 0,
                  }}
                >
                  {score} điểm
                </Tag>
              )}

              {showTimer && (
                <Tag
                  icon={<ClockCircleFilled />}
                  color={timerDanger ? "red" : "pink"}
                  style={{
                    padding: "7px 11px",

                    borderRadius: 11,

                    fontWeight: 800,

                    fontSize: 13,

                    margin: 0,
                  }}
                >
                  {formatTime(timeLeft)}
                </Tag>
              )}

              <Button
                size="small"
                icon={
                  isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />
                }
                disabled={gameFinished}
                onClick={togglePause}
                style={{
                  borderRadius: 10,
                }}
              >
                {isPaused ? "Tiếp tục" : "Tạm dừng"}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* PROGRESS */}

        {showProgress && (
          <>
            <Divider
              style={{
                margin: "14px 0 8px",
              }}
            />

            <Progress
              percent={progressPercent}
              strokeColor={primaryColor}
              trailColor="#FFE8EE"
              format={() => `${answeredCount}/${words.length}`}
            />
          </>
        )}
      </Card>

      {/* =================================================
          PAUSED
      ================================================= */}

      {isPaused && !gameFinished && (
        <div
          style={{
            maxWidth: 1500,

            margin: "0 auto 16px",
          }}
        >
          <Alert
            type="info"
            showIcon
            message="Game đang tạm dừng"
            description="Nhấn Tiếp tục để chơi tiếp."
            action={
              <Button
                size="small"
                type="primary"
                onClick={togglePause}
                style={{
                  background: primaryColor,

                  borderColor: primaryColor,

                  borderRadius: 9,
                }}
              >
                Tiếp tục
              </Button>
            }
            style={{
              borderRadius: 15,
            }}
          />
        </div>
      )}

      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        style={{
          maxWidth: 1500,

          margin: "0 auto",
        }}
      >
        <Row gutter={[18, 18]} align="top">
          {/* =================================================
              QUESTIONS
          ================================================= */}

          <Col xs={24} lg={8}>
            <Card
              bordered={false}
              title={
                <Space>
                  <QuestionCircleOutlined
                    style={{
                      color: primaryColor,
                    }}
                  />

                  <span
                    style={{
                      color: primaryColor,

                      fontWeight: 900,
                    }}
                  >
                    Câu hỏi
                  </span>

                  <Tag
                    color="pink"
                    style={{
                      borderRadius: 8,
                      margin: 0,
                    }}
                  >
                    {words.length}
                  </Tag>
                </Space>
              }
              style={{
                borderRadius: borderRadius,

                border: "2px solid #FFE3E8",

                boxShadow: "0 8px 24px rgba(0,0,0,.05)",

                background: "rgba(255,255,255,.95)",
              }}
              bodyStyle={{
                maxHeight: "calc(100vh - 200px)",

                overflowY: "auto",

                padding: 14,
              }}
            >
              {words.map(renderQuestion)}
            </Card>
          </Col>

          {/* =================================================
              CROSSWORD
          ================================================= */}

          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              title={
                <Space>
                  <HeartFilled
                    style={{
                      color: primaryColor,
                    }}
                  />

                  <span
                    style={{
                      color: primaryColor,

                      fontWeight: 900,
                    }}
                  >
                    Bảng ô chữ
                  </span>
                </Space>
              }
              extra={
                <Space>
                  <Tag
                    color="gold"
                    style={{
                      borderRadius: 9,

                      fontWeight: 800,

                      margin: 0,
                    }}
                  >
                    {gridData.rows} × {gridData.cols}
                  </Tag>
                </Space>
              }
              style={{
                borderRadius: borderRadius,

                border: "2px solid #FFE3E8",

                boxShadow: "0 8px 24px rgba(0,0,0,.05)",

                background: "rgba(255,255,255,.95)",
              }}
              bodyStyle={{
                padding: "10px 14px 18px",
              }}
            >
              {/* SELECTED QUESTION */}

              {selectedWord && (
                <div
                  style={{
                    marginBottom: 14,

                    padding: "13px 15px",

                    borderRadius: 15,

                    background: `linear-gradient(135deg, ${primaryColor}12, ${secondaryColor}18)`,

                    border: `1px solid ${primaryColor}35`,
                  }}
                >
                  <Row justify="space-between" align="middle" gutter={[10, 10]}>
                    <Col flex="1">
                      <Space direction="vertical" size={2}>
                        <Text
                          style={{
                            fontSize: 11,

                            color: primaryColor,

                            fontWeight: 900,

                            textTransform: "uppercase",
                          }}
                        >
                          Đang chọn
                        </Text>

                        <Text
                          strong
                          style={{
                            fontSize: 15,

                            lineHeight: 1.5,
                          }}
                        >
                          Câu {selectedWord.number}:{" "}
                          {selectedWord.question || selectedWord.clue}
                        </Text>
                      </Space>
                    </Col>

                    <Col>
                      <Tag
                        color="pink"
                        style={{
                          borderRadius: 9,

                          fontWeight: 800,

                          margin: 0,
                        }}
                      >
                        {selectedWord.direction === "vertical"
                          ? "↓ Dọc"
                          : "→ Ngang"}
                      </Tag>
                    </Col>
                  </Row>
                </div>
              )}

              {/* GRID */}

              <div
                style={{
                  width: "100%",

                  overflow: "auto",

                  padding: "15px 8px 22px",

                  borderRadius: 18,

                  background: "rgba(255,250,252,.75)",

                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "inline-block",

                    minWidth: "max-content",

                    padding: 8,
                  }}
                >
                  {gridData.grid.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        display: "flex",
                      }}
                    >
                      {row.map((cell, colIndex) =>
                        renderCell(cell, rowIndex, colIndex),
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* LEGEND */}

              <div
                style={{
                  marginTop: 12,

                  display: "flex",

                  justifyContent: "center",

                  flexWrap: "wrap",

                  gap: 8,
                }}
              >
                <Tag
                  color="pink"
                  style={{
                    borderRadius: 8,
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                    }}
                  >
                    Ô hồng
                  </span>{" "}
                  = câu đang chọn
                </Tag>

                <Tag
                  color="gold"
                  style={{
                    borderRadius: 8,
                    margin: 0,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 900,
                    }}
                  >
                    Ô vàng
                  </span>{" "}
                  = chữ hàng dọc
                </Tag>
              </div>

              {/* FINISHED */}

              {gameFinished && (
                <Alert
                  type="success"
                  showIcon
                  icon={<TrophyFilled />}
                  message="Hoàn thành trò chơi! 🎉"
                  description={`Bạn đạt ${score} điểm và hoàn thành ${correctCount}/${words.length} câu.`}
                  style={{
                    marginTop: 16,

                    borderRadius: 15,
                  }}
                />
              )}

              {/* BOTTOM */}

              <Divider
                style={{
                  margin: "18px 0 14px",
                }}
              />

              <Row justify="space-between" align="middle" gutter={[10, 10]}>
                <Col>
                  <Space wrap>
                    <Tag
                      color="green"
                      style={{
                        borderRadius: 9,

                        padding: "4px 9px",

                        margin: 0,

                        fontWeight: 700,
                      }}
                    >
                      <CheckCircleOutlined /> {correctCount} đúng
                    </Tag>

                    {skippedCount > 0 && (
                      <Tag
                        color="default"
                        style={{
                          borderRadius: 9,

                          padding: "4px 9px",

                          margin: 0,
                        }}
                      >
                        {skippedCount} bỏ qua
                      </Tag>
                    )}

                    {showScore && (
                      <Tag
                        color="gold"
                        style={{
                          borderRadius: 9,

                          padding: "4px 9px",

                          margin: 0,

                          fontWeight: 800,
                        }}
                      >
                        <StarFilled /> {score}
                      </Tag>
                    )}
                  </Space>
                </Col>

                <Col>
                  <Space>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={resetGame}
                      style={{
                        borderRadius: 10,
                      }}
                    >
                      Chơi lại
                    </Button>

                    {onBack && (
                      <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{
                          borderRadius: 10,
                        }}
                      >
                        Thoát game
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      {/* =================================================
          FINISH MODAL
      ================================================= */}

      <Modal
        open={showFinishModal}
        centered
        closable={!completedOnce}
        footer={null}
        onCancel={() => setShowFinishModal(false)}
        styles={{
          content: {
            borderRadius: 24,
          },
        }}
      >
        <div
          style={{
            textAlign: "center",

            padding: "15px 10px 5px",
          }}
        >
          <div
            style={{
              width: 80,

              height: 80,

              margin: "0 auto 15px",

              borderRadius: "50%",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              background: `${secondaryColor}25`,

              color: secondaryColor,

              fontSize: 42,
            }}
          >
            🏆
          </div>

          <Title
            level={3}
            style={{
              margin: "0 0 8px",

              color: primaryColor,

              fontWeight: 900,
            }}
          >
            Tuyệt vời! 🎉
          </Title>

          <Text type="secondary">Bạn đã kết thúc trò chơi.</Text>

          <div
            style={{
              display: "flex",

              justifyContent: "center",

              gap: 12,

              margin: "20px 0",
            }}
          >
            {showScore && (
              <Card
                size="small"
                style={{
                  minWidth: 110,

                  borderRadius: 15,

                  background: "#FFF9E6",

                  border: "1px solid #FFE58F",
                }}
              >
                <StarFilled
                  style={{
                    color: secondaryColor,

                    fontSize: 20,
                  }}
                />

                <div
                  style={{
                    fontSize: 24,

                    fontWeight: 900,
                  }}
                >
                  {score}
                </div>

                <Text type="secondary">điểm</Text>
              </Card>
            )}

            <Card
              size="small"
              style={{
                minWidth: 110,

                borderRadius: 15,

                background: "#F6FFED",

                border: "1px solid #B7EB8F",
              }}
            >
              <CheckCircleFilled
                style={{
                  color: "#52C41A",

                  fontSize: 20,
                }}
              />

              <div
                style={{
                  fontSize: 24,

                  fontWeight: 900,
                }}
              >
                {correctCount}/{words.length}
              </div>

              <Text type="secondary">đúng</Text>
            </Card>
          </div>

          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setShowFinishModal(false);

                resetGame();
              }}
              style={{
                borderRadius: 11,
              }}
            >
              Chơi lại
            </Button>

            {onBack && (
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                style={{
                  background: primaryColor,

                  borderColor: primaryColor,

                  borderRadius: 11,
                }}
              >
                Thoát game
              </Button>
            )}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default CrosswordGame;
