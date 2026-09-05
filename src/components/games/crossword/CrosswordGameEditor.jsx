import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Input,
  InputNumber,
  message,
  Row,
  Space,
  Spin,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  FileImageOutlined,
  PlusOutlined,
  SaveOutlined,
  SoundOutlined,
  UpOutlined,
} from "@ant-design/icons";

import {
  Heart,
  Star,
  Sparkles,
  Smile,
  Lightbulb,
  SkipForward,
  Trophy,
  Clock3,
  Shuffle,
  Eye,
  Target,
} from "lucide-react";

import { createGame, updateGame } from "../../../api/gameApi";

const { Title, Text } = Typography;

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  navy: "#FF5C8A",
  gold: "#FFB703",
  text: "#2D3748",
  bg: "#FFF5F7",
  border: "#FFE3E8",
  soft: "#FFF9FA",
  success: "#52C41A",
  danger: "#FF4D4F",
  purple: "#9B5DE5",
  blue: "#4D96FF",
};

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

const createPreviewFileList = (
  file,
  fallbackUrl = null,
  name = "file",
) => {
  if (file instanceof File) {
    return [
      {
        uid: "-1",
        name: file.name,
        status: "done",
        originFileObj: file,
      },
    ];
  }

  if (fallbackUrl) {
    return [
      {
        uid: "-1",
        name,
        status: "done",
        url: fallbackUrl,
      },
    ];
  }

  return [];
};

const createEmptyQuestion = (id, number) => ({
  id,
  number,
  question: "",
  answer: "",
  answerDisplay: "",
  points: 10,
  answerIndex: null,
});

/* =========================================================
   COMPONENT
========================================================= */

const CrosswordGameEditor = ({
  teacherId,
  game = null,
  onSuccess,
  onBack,
}) => {
  const isEdit = Boolean(game?.id);

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  /* =======================================================
     BASIC
  ======================================================= */

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* =======================================================
     CROSSWORD
  ======================================================= */

  const [verticalAnswer, setVerticalAnswer] = useState("");

  const [questions, setQuestions] = useState([
    createEmptyQuestion(1, 1),
  ]);

  /* =======================================================
     SETTINGS
  ======================================================= */

  const [showTimer, setShowTimer] = useState(true);
  const [timeLimit, setTimeLimit] = useState(60);

  const [allowRetry, setAllowRetry] = useState(true);
  const [showAnswerAfterSubmit, setShowAnswerAfterSubmit] =
    useState(true);

  const [allowHint, setAllowHint] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);

  const [showProgress, setShowProgress] = useState(false);
  const [showScore, setShowScore] = useState(true);
  const [showPoints, setShowPoints] = useState(true);

  const [shuffleQuestions, setShuffleQuestions] =
    useState(false);

  const [shuffleAnswers, setShuffleAnswers] = useState(false);

  /* =======================================================
     FILES
  ======================================================= */

  const [thumbnail, setThumbnail] = useState(null);
  const [background, setBackground] = useState(null);

  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [correctSound, setCorrectSound] = useState(null);
  const [wrongSound, setWrongSound] = useState(null);

  /* =======================================================
     BACKGROUND CONFIG
  ======================================================= */

  const [bgColor, setBgColor] = useState("#F8F9FC");
  const [bgImage, setBgImage] = useState(null);

  /* =======================================================
     OLD FILE URLS
  ======================================================= */

  const [oldThumbnail, setOldThumbnail] = useState(null);
  const [oldBackground, setOldBackground] = useState(null);

  const [oldBackgroundMusic, setOldBackgroundMusic] =
    useState(null);

  const [oldCorrectSound, setOldCorrectSound] = useState(null);
  const [oldWrongSound, setOldWrongSound] = useState(null);

  /* =======================================================
     SELECTED CELL
  ======================================================= */

  const [selectedCell, setSelectedCell] = useState(null);

  /* =======================================================
     LOAD GAME
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadGame = () => {
      try {
        setInitializing(true);

        /* =================================================
           CREATE MODE
        ================================================= */

        if (!game) {
          setName("");
          setDescription("");

          setVerticalAnswer("");

          setQuestions([
            createEmptyQuestion(1, 1),
          ]);

          /* SETTINGS */

          setShowTimer(true);
          setTimeLimit(60);

          setAllowRetry(true);
          setShowAnswerAfterSubmit(true);

          setAllowHint(false);
          setAllowSkip(false);

          setShowProgress(false);
          setShowScore(true);
          setShowPoints(true);

          setShuffleQuestions(false);
          setShuffleAnswers(false);

          /* MEDIA */

          setThumbnail(null);
          setBackground(null);

          setBackgroundMusic(null);
          setCorrectSound(null);
          setWrongSound(null);

          /* BACKGROUND */

          setBgColor("#F8F9FC");
          setBgImage(null);

          /* OLD MEDIA */

          setOldThumbnail(null);
          setOldBackground(null);

          setOldBackgroundMusic(null);
          setOldCorrectSound(null);
          setOldWrongSound(null);

          return;
        }

        /* =================================================
           BASIC
        ================================================= */

        setName(game.name || "");
        setDescription(game.description || "");

        /* =================================================
           CROSSWORD
        ================================================= */

        const crosswordData = game.crossword || {};

        const words = Array.isArray(crosswordData.words)
          ? crosswordData.words
          : [];

        let loadedVertical =
          crosswordData.verticalAnswerDisplay ||
          crosswordData.verticalAnswer ||
          "";

        /* Nếu không có verticalAnswer thì tự ghép từ requiredLetter */

        if (!loadedVertical && words.length > 0) {
          const sortedWords = [...words].sort(
            (a, b) =>
              Number(a.number || 0) -
              Number(b.number || 0),
          );

          loadedVertical = sortedWords
            .map(
              (item) =>
                item.requiredLetter || "",
            )
            .join("");
        }

        setVerticalAnswer(loadedVertical);

        /* =================================================
           QUESTIONS
        ================================================= */

        const loadedQuestions = words
          .slice()
          .sort(
            (a, b) =>
              Number(a.number || 0) -
              Number(b.number || 0),
          )
          .map((item, index) => {
            const rawAnswer =
              item.answerDisplay ||
              item.answer ||
              item.word ||
              "";

            return {
              id: item.id ?? index + 1,

              number:
                Number(item.number) ||
                index + 1,

              question:
                item.question ||
                item.clue ||
                "",

              answer: rawAnswer,

              answerDisplay: rawAnswer,

              points:
                Number(item.points) || 10,

              answerIndex:
                item.answerIndex !== undefined &&
                item.answerIndex !== null
                  ? Number(item.answerIndex)
                  : null,
            };
          });

        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
        } else {
          /* Hỗ trợ format cũ */

          const oldQuestions =
            Array.isArray(crosswordData.questions)
              ? crosswordData.questions
              : [];

          if (oldQuestions.length > 0) {
            setQuestions(
              oldQuestions.map(
                (item, index) => ({
                  id:
                    item.id ??
                    index + 1,

                  number:
                    Number(item.number) ||
                    index + 1,

                  question:
                    item.question ||
                    item.clue ||
                    "",

                  answer:
                    item.answerDisplay ||
                    item.answer ||
                    "",

                  answerDisplay:
                    item.answerDisplay ||
                    item.answer ||
                    "",

                  points:
                    Number(item.points) ||
                    10,

                  answerIndex:
                    item.answerIndex !==
                      undefined &&
                    item.answerIndex !== null
                      ? Number(
                          item.answerIndex,
                        )
                      : null,
                }),
              ),
            );
          } else {
            setQuestions([
              createEmptyQuestion(1, 1),
            ]);
          }
        }

        /* =================================================
           SETTINGS
        ================================================= */

        const settings = game.settings || {};

        setShowTimer(
          settings.showTimer !== undefined
            ? Boolean(settings.showTimer)
            : true,
        );

        setTimeLimit(
          settings.timeLimit !== undefined
            ? Number(settings.timeLimit) ||
                60
            : 60,
        );

        setAllowRetry(
          settings.allowRetry !== undefined
            ? Boolean(settings.allowRetry)
            : true,
        );

        setShowAnswerAfterSubmit(
          settings.showAnswerAfterSubmit !==
            undefined
            ? Boolean(
                settings.showAnswerAfterSubmit,
              )
            : true,
        );

        setAllowHint(
          settings.allowHint !== undefined
            ? Boolean(settings.allowHint)
            : false,
        );

        setAllowSkip(
          settings.allowSkip !== undefined
            ? Boolean(settings.allowSkip)
            : false,
        );

        setShowProgress(
          settings.showProgress !== undefined
            ? Boolean(settings.showProgress)
            : false,
        );

        setShowScore(
          settings.showScore !== undefined
            ? Boolean(settings.showScore)
            : true,
        );

        setShowPoints(
          settings.showPoints !== undefined
            ? Boolean(settings.showPoints)
            : true,
        );

        setShuffleQuestions(
          settings.shuffleQuestions !==
            undefined
            ? Boolean(
                settings.shuffleQuestions,
              )
            : false,
        );

        setShuffleAnswers(
          settings.shuffleAnswers !==
            undefined
            ? Boolean(
                settings.shuffleAnswers,
              )
            : false,
        );

        /* =================================================
           BACKGROUND
        ================================================= */

        const bgConfig = game.background;

        if (
          bgConfig &&
          typeof bgConfig === "object" &&
          !Array.isArray(bgConfig)
        ) {
          const loadedColor =
            bgConfig.color ||
            "#F8F9FC";

          const loadedImage =
            bgConfig.image || null;

          setBgColor(loadedColor);
          setBgImage(loadedImage);
          setOldBackground(loadedImage);
        } else if (
          typeof bgConfig === "string"
        ) {
          setBgColor("#F8F9FC");
          setBgImage(bgConfig);
          setOldBackground(bgConfig);
        } else {
          setBgColor("#F8F9FC");
          setBgImage(null);
          setOldBackground(null);
        }

        /* =================================================
           THUMBNAIL
        ================================================= */

        setOldThumbnail(
          game.thumbnail || null,
        );

        /* =================================================
           MEDIA
        ================================================= */

        const media = game.media || {};

        setOldBackgroundMusic(
          media.backgroundMusic || null,
        );

        setOldCorrectSound(
          media.correctSound || null,
        );

        setOldWrongSound(
          media.wrongSound || null,
        );
      } catch (error) {
        console.error(
          "LOAD CROSSWORD GAME ERROR:",
          error,
        );

        message.error(
          "Không thể đọc dữ liệu game.",
        );
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    loadGame();

    return () => {
      cancelled = true;
    };
  }, [game]);

  /* =======================================================
     UPDATE QUESTION
  ======================================================= */

  const updateQuestion = (
    id,
    field,
    value,
  ) => {
    setQuestions((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const next = {
          ...item,
          [field]: value,
        };

        if (field === "answer") {
          next.answerIndex = null;
          next.answerDisplay = value;
        }

        return next;
      }),
    );
  };

  /* =======================================================
     SELECT INTERSECTION
  ======================================================= */

  const selectIntersection = (
    questionId,
    charIndex,
  ) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === questionId
          ? {
              ...item,
              answerIndex: charIndex,
            }
          : item,
      ),
    );
  };

  /* =======================================================
     ADD QUESTION
  ======================================================= */

  const addQuestion = () => {
    const nextId =
      questions.length > 0
        ? Math.max(
            ...questions.map(
              (item) =>
                Number(item.id) || 0,
            ),
          ) + 1
        : 1;

    setQuestions((prev) => [
      ...prev,
      createEmptyQuestion(
        nextId,
        prev.length + 1,
      ),
    ]);
  };

  /* =======================================================
     DELETE QUESTION
  ======================================================= */

  const removeQuestion = (id) => {
    setQuestions((prev) => {
      const next = prev
        .filter(
          (item) => item.id !== id,
        )
        .map((item, index) => ({
          ...item,
          number: index + 1,
        }));

      return next.length
        ? next
        : [
            createEmptyQuestion(
              1,
              1,
            ),
          ];
    });
  };

  /* =======================================================
     MOVE QUESTION
  ======================================================= */

  const moveQuestion = (
    index,
    direction,
  ) => {
    const newIndex =
      index + direction;

    if (
      newIndex < 0 ||
      newIndex >= questions.length
    ) {
      return;
    }

    const clone = [...questions];

    [
      clone[index],
      clone[newIndex],
    ] = [
      clone[newIndex],
      clone[index],
    ];

    setQuestions(
      clone.map(
        (item, index) => ({
          ...item,
          number: index + 1,
        }),
      ),
    );
  };

  /* =======================================================
     BUILD CROSSWORD
  ======================================================= */

  const crossword = useMemo(() => {
    const vertical =
      normalizeAnswer(
        verticalAnswer,
      );

    if (!vertical) {
      return {
        grid: [],
        placements: [],
        width: 0,
        height: 0,
        verticalCol: 0,
      };
    }

    const placements = [];

    const verticalCol = 0;

    questions.forEach(
      (item, questionIndex) => {
        const answer =
          normalizeAnswer(
            item.answer,
          );

        if (!answer) {
          return;
        }

        const requiredLetter =
          vertical[
            questionIndex
          ] || "";

        if (!requiredLetter) {
          return;
        }

        let answerIndex =
          Number.isInteger(
            Number(
              item.answerIndex,
            ),
          )
            ? Number(
                item.answerIndex,
              )
            : -1;

        if (
          answerIndex < 0 ||
          answerIndex >=
            answer.length ||
          answer[answerIndex] !==
            requiredLetter
        ) {
          answerIndex =
            answer.indexOf(
              requiredLetter,
            );
        }

        if (answerIndex === -1) {
          return;
        }

        placements.push({
          questionId: item.id,

          number:
            Number(item.number) ||
            questionIndex + 1,

          answer,

          row: questionIndex,

          col:
            verticalCol -
            answerIndex,

          answerIndex,

          requiredLetter,
        });
      },
    );

    let minCol = verticalCol;
    let maxCol = verticalCol;

    placements.forEach(
      (placement) => {
        minCol = Math.min(
          minCol,
          placement.col,
        );

        maxCol = Math.max(
          maxCol,
          placement.col +
            placement.answer.length -
            1,
        );
      },
    );

    const padding = 2;

    const width =
      maxCol -
      minCol +
      1 +
      padding * 2;

    const height =
      Math.max(
        vertical.length,
        questions.length,
      ) +
      padding * 2;

    const offsetCol =
      padding - minCol;

    const offsetRow = padding;

    const actualVerticalCol =
      verticalCol + offsetCol;

    const grid = Array.from(
      {
        length: height,
      },
      () =>
        Array.from(
          {
            length: width,
          },
          () => ({
            active: false,
            letter: "",
            numbers: [],
            wordIds: [],
            type: null,
          }),
        ),
    );

    vertical
      .split("")
      .forEach(
        (letter, index) => {
          const row =
            index + offsetRow;

          if (
            row < 0 ||
            row >= height
          ) {
            return;
          }

          grid[row][
            actualVerticalCol
          ] = {
            active: true,

            letter,

            numbers: [
              index + 1,
            ],

            wordIds: [
              questions[index]?.id,
            ].filter(Boolean),

            type: "vertical",
          };
        },
      );

    placements.forEach(
      (placement) => {
        const row =
          placement.row +
          offsetRow;

        const startCol =
          placement.col +
          offsetCol;

        placement.answer
          .split("")
          .forEach(
            (
              letter,
              charIndex,
            ) => {
              const col =
                startCol +
                charIndex;

              if (
                row < 0 ||
                row >= height ||
                col < 0 ||
                col >= width
              ) {
                return;
              }

              const existing =
                grid[row][col];

              const isIntersection =
                existing.active;

              grid[row][col] = {
                active: true,

                letter,

                numbers: [
                  ...new Set([
                    ...(existing.numbers ||
                      []),

                    ...(charIndex ===
                    placement.answerIndex
                      ? [
                          placement.number,
                        ]
                      : []),
                  ]),
                ],

                wordIds: [
                  ...new Set([
                    ...(existing.wordIds ||
                      []),
                    placement.questionId,
                  ]),
                ],

                type:
                  isIntersection
                    ? "intersection"
                    : "horizontal",
              };
            },
          );
      },
    );

    return {
      grid,
      placements,
      width,
      height,
      verticalCol:
        actualVerticalCol,
    };
  }, [
    verticalAnswer,
    questions,
  ]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validation = useMemo(() => {
    const errors = [];

    const vertical =
      normalizeAnswer(
        verticalAnswer,
      );

    if (!name.trim()) {
      errors.push(
        "Chưa nhập tên game.",
      );
    }

    if (!vertical) {
      errors.push(
        "Chưa nhập đáp án hàng dọc.",
      );
    }

    if (
      vertical &&
      questions.length !==
        vertical.length
    ) {
      errors.push(
        `Số câu hỏi (${questions.length}) phải bằng số chữ của đáp án hàng dọc (${vertical.length}).`,
      );
    }

    questions.forEach(
      (item, index) => {
        if (!item.question?.trim()) {
          errors.push(
            `Câu ${index + 1}: chưa nhập câu hỏi.`,
          );
        }

        const answer =
          normalizeAnswer(
            item.answer,
          );

        if (!answer) {
          errors.push(
            `Câu ${index + 1}: chưa nhập đáp án.`,
          );

          return;
        }

        const requiredLetter =
          vertical[index];

        if (
          requiredLetter &&
          !answer.includes(
            requiredLetter,
          )
        ) {
          errors.push(
            `Câu ${index + 1}: đáp án phải chứa chữ "${requiredLetter}".`,
          );
        }

        if (
          requiredLetter &&
          (
            item.answerIndex ===
              null ||
            item.answerIndex ===
              undefined
          )
        ) {
          errors.push(
            `Câu ${index + 1}: chưa chọn ô chữ giao.`,
          );
        }

        if (
          item.answerIndex !==
            null &&
          item.answerIndex !==
            undefined &&
          requiredLetter &&
          answer[
            item.answerIndex
          ] !== requiredLetter
        ) {
          errors.push(
            `Câu ${index + 1}: ô chữ giao phải là "${requiredLetter}".`,
          );
        }
      },
    );

    return {
      valid:
        errors.length === 0,
      errors,
    };
  }, [
    name,
    verticalAnswer,
    questions,
  ]);

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (!validation.valid) {
      message.warning(
        validation.errors[0] ||
          "Vui lòng kiểm tra dữ liệu.",
      );

      return;
    }

    const normalizedVertical =
      normalizeAnswer(
        verticalAnswer,
      );

    /* =====================================================
       WORDS
    ===================================================== */

    const words = questions.map(
      (item, index) => {
        const answer =
          normalizeAnswer(
            item.answer,
          );

        const placement =
          crossword.placements.find(
            (p) =>
              p.questionId ===
              item.id,
          );

        return {
          id: item.id,

          number: index + 1,

          word: answer,

          answer,

          answerDisplay:
            item.answer?.trim() ||
            "",

          clue:
            item.question?.trim() ||
            "",

          question:
            item.question?.trim() ||
            "",

          points:
            Number(item.points) ||
            10,

          direction:
            "horizontal",

          row:
            placement?.row ??
            index,

          col:
            placement?.col ??
            0,

          answerIndex:
            placement?.answerIndex ??
            item.answerIndex ??
            null,

          requiredLetter:
            normalizedVertical[
              index
            ] || null,
        };
      },
    );

    /* =====================================================
       GRID
    ===================================================== */

    const grid =
      crossword.grid.map(
        (row) =>
          row.map((cell) => ({
            active: Boolean(
              cell.active,
            ),

            letter:
              cell.letter || "",

            numbers:
              cell.numbers || [],

            wordIds:
              cell.wordIds || [],

            type:
              cell.type || null,
          })),
      );

    /* =====================================================
       QUESTIONS
    ===================================================== */

    const questionData =
      questions.map(
        (item, index) => ({
          id: item.id,

          number: index + 1,

          question:
            item.question?.trim() ||
            "",

          answer:
            normalizeAnswer(
              item.answer,
            ),

          answerDisplay:
            item.answer?.trim() ||
            "",

          points:
            Number(item.points) ||
            10,

          answerIndex:
            item.answerIndex !==
              null &&
            item.answerIndex !==
              undefined
              ? Number(
                  item.answerIndex,
                )
              : null,

          requiredLetter:
            normalizedVertical[
              index
            ] || null,
        }),
      );

    /* =====================================================
       PLACEMENTS
    ===================================================== */

    const placements =
      crossword.placements.map(
        (item) => ({
          questionId:
            item.questionId,

          number: item.number,

          answer: item.answer,

          row: item.row,

          col: item.col,

          answerIndex:
            item.answerIndex,

          requiredLetter:
            item.requiredLetter ||
            null,
        }),
      );

    /* =====================================================
       CROSSWORD DATA
    ===================================================== */

    const crosswordData = {
      version: 2,

      verticalAnswer:
        normalizedVertical,

      verticalAnswerDisplay:
        verticalAnswer.trim(),

      width:
        crossword.width,

      height:
        crossword.height,

      rows:
        crossword.height,

      cols:
        crossword.width,

      verticalCol:
        crossword.verticalCol,

      words,

      questions:
        questionData,

      placements,

      grid,
    };

    /* =====================================================
       GAME DATA
    ===================================================== */

    const gameData = {
      /* ================================================
         BASIC
      ================================================= */

      name:
        name.trim(),

      description:
        description.trim(),

      type:
        "crossword",

      teacher_id:
        teacherId ||
        game?.teacher_id ||
        null,

      /* ================================================
         THUMBNAIL
      ================================================= */

      thumbnail:
        thumbnail instanceof File
          ? thumbnail
          : game?.thumbnail ||
            oldThumbnail ||
            undefined,

      /* ================================================
         BACKGROUND
      ================================================= */

      background: {
        color:
          bgColor ||
          "#F8F9FC",

        image:
          background instanceof File
            ? background
            : bgImage ||
              oldBackground ||
              null,
      },

      /* ================================================
         THEME
      ================================================= */

      theme: {
        primary:
          COLORS.navy,

        secondary:
          COLORS.gold,

        primaryColor:
          COLORS.navy,

        secondaryColor:
          COLORS.gold,

        font:
          "Be Vietnam Pro",

        fontFamily:
          "Be Vietnam Pro",

        borderRadius: 20,
      },

      /* ================================================
         SETTINGS
      ================================================= */

      settings: {
        /* Timer */

        showTimer:
          Boolean(showTimer),

        timeLimit:
          Number(timeLimit) ||
          60,

        /* Gameplay */

        allowRetry:
          Boolean(allowRetry),

        showAnswerAfterSubmit:
          Boolean(
            showAnswerAfterSubmit,
          ),

        /* Help */

        allowHint:
          Boolean(allowHint),

        allowSkip:
          Boolean(allowSkip),

        /* Display */

        showProgress:
          Boolean(showProgress),

        showScore:
          Boolean(showScore),

        showPoints:
          Boolean(showPoints),

        /* Shuffle */

        shuffleQuestions:
          Boolean(
            shuffleQuestions,
          ),

        shuffleAnswers:
          Boolean(
            shuffleAnswers,
          ),
      },

      /* ================================================
         MEDIA
      ================================================= */

      media: {
        backgroundMusic:
          backgroundMusic instanceof
          File
            ? backgroundMusic
            : oldBackgroundMusic ||
              null,

        correctSound:
          correctSound instanceof File
            ? correctSound
            : oldCorrectSound ||
              null,

        wrongSound:
          wrongSound instanceof File
            ? wrongSound
            : oldWrongSound ||
              null,
      },

      /* ================================================
         CROSSWORD
      ================================================= */

      crossword:
        crosswordData,

      /* ================================================
         OTHER GAME STRUCTURES
      ================================================= */

      questions: [],

      pairs: [],

      wheel: {},

      cards: [],

      sorting: {},

      dragDrop: {},

      /* ================================================
         LEGACY TOP LEVEL MEDIA
      ================================================= */

      backgroundMusic:
        backgroundMusic instanceof File
          ? backgroundMusic
          : undefined,

      correctSound:
        correctSound instanceof File
          ? correctSound
          : undefined,

      wrongSound:
        wrongSound instanceof File
          ? wrongSound
          : undefined,
    };

    console.log(
      "SAVE CROSSWORD:",
      gameData,
    );

    try {
      setLoading(true);

      let response;

      if (isEdit) {
        response =
          await updateGame(
            game.id,
            gameData,
          );
      } else {
        response =
          await createGame(
            gameData,
          );
      }

      message.success(
        isEdit
          ? "Cập nhật game ô chữ thành công! ✨"
          : "Tạo game ô chữ thành công! ✨",
      );

      if (
        typeof onSuccess ===
        "function"
      ) {
        onSuccess(response);
      }
    } catch (error) {
      console.error(
        "SAVE CROSSWORD ERROR:",
        error,
      );

      message.error(
        error?.message ||
          "Không thể lưu game ô chữ.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     UPLOAD
  ======================================================= */

  const beforeUpload =
    (setter) => (file) => {
      setter(file);

      return false;
    };

  const removeUpload =
    (setter) => () => {
      setter(null);
    };

  /* =======================================================
     SETTING ITEM
  ======================================================= */

  const SettingItem = ({
    icon,
    title,
    description,
    checked,
    onChange,
  }) => {
    return (
      <div
        style={{
          padding: 14,
          borderRadius: 16,
          border:
            "2px solid #FFE3E8",
          background: "#FFF9FA",
          height: "100%",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          gutter={12}
        >
          <Col flex="auto">
            <Space
              align="start"
              size={10}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background:
                    "#FFF0F3",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    COLORS.navy,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>

              <div>
                <Text
                  strong
                  style={{
                    color:
                      COLORS.text,
                    display:
                      "block",
                    fontSize: 14,
                  }}
                >
                  {title}
                </Text>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 12,
                    lineHeight:
                      1.4,
                  }}
                >
                  {description}
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Switch
              checked={checked}
              onChange={onChange}
            />
          </Col>
        </Row>
      </div>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (initializing) {
    return (
      <div
        style={{
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            COLORS.bg,
        }}
      >
        <Space
          direction="vertical"
          align="center"
        >
          <Spin size="large" />

          <Text type="secondary">
            Đang tải dữ liệu game
            chibi...
          </Text>
        </Space>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      style={{
        minHeight: "100%",
        background:
          COLORS.bg,
        padding: 24,
        fontFamily:
          "'Baloo 2', cursive, sans-serif",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          marginBottom: 20,
          boxShadow:
            "0 8px 24px rgba(255, 92, 138, 0.08)",
          border:
            "2px solid #FFE3E8",
        }}
      >
        <Row
          justify="space-between"
          align="middle"
          gutter={[20, 20]}
        >
          <Col>
            <Space size={14}>
              <Button
                icon={
                  <ArrowLeftOutlined />
                }
                onClick={onBack}
                disabled={loading}
                style={{
                  borderRadius: 14,
                  borderColor:
                    "#FFE3E8",
                  background:
                    COLORS.soft,
                  fontWeight: 600,
                }}
              >
                Quay lại
              </Button>

              <Divider
                type="vertical"
                style={{
                  borderColor:
                    "#FFE3E8",
                }}
              />

              <Space
                direction="vertical"
                size={2}
              >
                <Text
                  style={{
                    color:
                      COLORS.gold,
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform:
                      "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Game Giáo Lý
                  Chibi 🌸
                </Text>

                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color:
                      COLORS.navy,
                    fontWeight: 800,
                  }}
                >
                  🧩{" "}
                  {isEdit
                    ? "Chỉnh sửa ô chữ"
                    : "Tạo game ô chữ"}
                </Title>
              </Space>
            </Space>
          </Col>

          <Col>
            <Button
              type="primary"
              size="large"
              icon={
                <SaveOutlined />
              }
              loading={loading}
              disabled={
                !validation.valid
              }
              onClick={
                handleSave
              }
              style={{
                background:
                  COLORS.navy,
                borderColor:
                  COLORS.navy,
                borderRadius: 16,
                fontWeight: 700,
                height: 46,
                padding:
                  "0 28px",
                boxShadow:
                  `0 6px 16px ${COLORS.navy}40`,
              }}
            >
              {isEdit
                ? "Cập nhật game ✨"
                : "Lưu game ✨"}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* =================================================
          VALIDATION
      ================================================= */}

      {!validation.valid &&
        validation.errors.length >
          0 && (
          <Alert
            type="warning"
            showIcon
            style={{
              marginBottom: 20,
              borderRadius: 16,
              border:
                "2px solid #FFE3E8",
              background:
                "#FFFBEB",
            }}
            message="Game chưa hoàn chỉnh nha bé!"
            description={
              <ul
                style={{
                  margin:
                    "6px 0 0 18px",
                  padding: 0,
                }}
              >
                {validation.errors
                  .slice(0, 10)
                  .map(
                    (
                      error,
                      index,
                    ) => (
                      <li
                        key={index}
                      >
                        {error}
                      </li>
                    ),
                  )}
              </ul>
            }
          />
        )}

      <Row
        gutter={[20, 20]}
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <Col
          xs={24}
          lg={10}
        >
          {/* BASIC */}

          <Card
            bordered={false}
            title={
              <Space
                style={{
                  color:
                    COLORS.navy,
                  fontWeight: 700,
                }}
              >
                <Smile size={18} />
                Thông tin game
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            <Space
              direction="vertical"
              size={18}
              style={{
                width: "100%",
              }}
            >
              <div>
                <Text
                  strong
                  style={{
                    color:
                      "#475569",
                  }}
                >
                  Tên game{" "}
                  <span
                    style={{
                      color:
                        COLORS.danger,
                    }}
                  >
                    *
                  </span>
                </Text>

                <Input
                  size="large"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target
                        .value,
                    )
                  }
                  placeholder="VD: Ô chữ Giáo lý vui nhộn 🎀"
                  style={{
                    marginTop: 8,
                    borderRadius: 14,
                    borderColor:
                      "#FFE3E8",
                    background:
                      COLORS.soft,
                  }}
                />
              </div>

              <div>
                <Text
                  strong
                  style={{
                    color:
                      "#475569",
                  }}
                >
                  Mô tả
                </Text>

                <Input.TextArea
                  rows={4}
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target
                        .value,
                    )
                  }
                  placeholder="Nhập mô tả game..."
                  style={{
                    marginTop: 8,
                    borderRadius: 14,
                    borderColor:
                      "#FFE3E8",
                    background:
                      COLORS.soft,
                  }}
                />
              </div>
            </Space>
          </Card>

          {/* VERTICAL */}

          <Card
            bordered={false}
            title={
              <Space>
                <Star
                  size={18}
                  color={
                    COLORS.gold
                  }
                  fill={
                    COLORS.gold
                  }
                />

                <span
                  style={{
                    color:
                      COLORS.navy,
                    fontWeight: 700,
                  }}
                >
                  Đáp án hàng dọc
                </span>

                <Tag
                  color="gold"
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  {
                    normalizeAnswer(
                      verticalAnswer,
                    ).length
                  }{" "}
                  chữ
                </Tag>
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            <Input
              size="large"
              value={
                verticalAnswer
              }
              onChange={(e) =>
                setVerticalAnswer(
                  e.target.value,
                )
              }
              placeholder="VD: MARIA"
              style={{
                fontWeight: 800,
                letterSpacing: 4,
                textTransform:
                  "uppercase",
                borderRadius: 14,
                borderColor:
                  "#FFE3E8",
                background:
                  COLORS.soft,
                color:
                  COLORS.navy,
                textAlign:
                  "center",
              }}
            />

            <Text
              type="secondary"
              style={{
                display:
                  "block",
                marginTop: 8,
                lineHeight: 1.6,
                fontSize: 13,
              }}
            >
              Mỗi chữ cái của
              đáp án hàng dọc
              tương ứng với một
              câu hỏi hàng ngang.
            </Text>
          </Card>

          {/* QUESTIONS */}

          <Card
            bordered={false}
            title={
              <Space>
                <Sparkles
                  size={18}
                  color={
                    COLORS.navy
                  }
                />

                <span
                  style={{
                    color:
                      COLORS.navy,
                    fontWeight: 700,
                  }}
                >
                  Câu hỏi hàng
                  ngang
                </span>

                <Tag
                  color="magenta"
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  {
                    questions.length
                  }
                </Tag>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={
                  <PlusOutlined />
                }
                onClick={
                  addQuestion
                }
                style={{
                  background:
                    COLORS.navy,
                  borderColor:
                    COLORS.navy,
                  borderRadius: 14,
                  fontWeight: 700,
                }}
              >
                Thêm câu
              </Button>
            }
            style={{
              borderRadius: 24,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            <Space
              direction="vertical"
              size={14}
              style={{
                width: "100%",
              }}
            >
              {questions.map(
                (
                  item,
                  index,
                ) => {
                  const answer =
                    normalizeAnswer(
                      item.answer,
                    );

                  const vertical =
                    normalizeAnswer(
                      verticalAnswer,
                    );

                  const requiredLetter =
                    vertical[index];

                  const selectedLetter =
                    item.answerIndex !==
                      null &&
                    item.answerIndex !==
                      undefined
                      ? answer[
                          item
                            .answerIndex
                        ]
                      : null;

                  const valid =
                    Boolean(
                      item.question?.trim(),
                    ) &&
                    Boolean(answer) &&
                    Boolean(
                      requiredLetter,
                    ) &&
                    selectedLetter ===
                      requiredLetter;

                  return (
                    <Card
                      key={
                        item.id
                      }
                      size="small"
                      style={{
                        borderRadius: 18,
                        border:
                          valid
                            ? "2px solid #B7EB8F"
                            : "2px solid #ffccc7",
                        background:
                          valid
                            ? "#fff"
                            : "#fffafa",
                      }}
                    >
                      <Space
                        direction="vertical"
                        size={12}
                        style={{
                          width:
                            "100%",
                        }}
                      >
                        {/* HEADER */}

                        <Row
                          justify="space-between"
                          align="middle"
                        >
                          <Col>
                            <Space
                              wrap
                            >
                              <Tag
                                color="pink"
                                style={{
                                  borderRadius: 10,
                                  fontWeight: 800,
                                }}
                              >
                                Câu{" "}
                                {
                                  item.number
                                }
                              </Tag>

                              {requiredLetter && (
                                <Tag
                                  color="orange"
                                  style={{
                                    borderRadius: 10,
                                    fontWeight: 700,
                                  }}
                                >
                                  Chữ
                                  giao:{" "}
                                  {
                                    requiredLetter
                                  }
                                </Tag>
                              )}

                              {valid && (
                                <Tag
                                  color="success"
                                  icon={
                                    <CheckCircleOutlined />
                                  }
                                  style={{
                                    borderRadius: 10,
                                  }}
                                >
                                  Đã
                                  đúng
                                </Tag>
                              )}
                            </Space>
                          </Col>

                          <Col>
                            <Space
                              size={4}
                            >
                              <Tooltip title="Đưa lên">
                                <Button
                                  size="small"
                                  disabled={
                                    index ===
                                    0
                                  }
                                  icon={
                                    <UpOutlined />
                                  }
                                  onClick={() =>
                                    moveQuestion(
                                      index,
                                      -1,
                                    )
                                  }
                                  style={{
                                    borderRadius: 8,
                                  }}
                                />
                              </Tooltip>

                              <Tooltip title="Đưa xuống">
                                <Button
                                  size="small"
                                  disabled={
                                    index ===
                                    questions.length -
                                      1
                                  }
                                  icon={
                                    <DownOutlined />
                                  }
                                  onClick={() =>
                                    moveQuestion(
                                      index,
                                      1,
                                    )
                                  }
                                  style={{
                                    borderRadius: 8,
                                  }}
                                />
                              </Tooltip>

                              <Tooltip title="Xóa câu">
                                <Button
                                  size="small"
                                  danger
                                  type="text"
                                  icon={
                                    <DeleteOutlined />
                                  }
                                  onClick={() =>
                                    removeQuestion(
                                      item.id,
                                    )
                                  }
                                />
                              </Tooltip>
                            </Space>
                          </Col>
                        </Row>

                        {/* QUESTION */}

                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 13,
                              color:
                                "#475569",
                            }}
                          >
                            Nội dung câu
                            hỏi
                          </Text>

                          <Input
                            value={
                              item.question
                            }
                            onChange={(
                              e,
                            ) =>
                              updateQuestion(
                                item.id,
                                "question",
                                e.target
                                  .value,
                              )
                            }
                            placeholder="VD: Thiên Chúa tạo dựng con người đầu tiên là ai?"
                            style={{
                              marginTop: 4,
                              borderRadius: 12,
                              borderColor:
                                "#FFE3E8",
                              background:
                                COLORS.soft,
                            }}
                          />
                        </div>

                        {/* ANSWER */}

                        <Row
                          gutter={8}
                        >
                          <Col
                            span={16}
                          >
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                color:
                                  "#475569",
                              }}
                            >
                              Đáp án
                              ngang
                            </Text>

                            <Input
                              value={
                                item.answer
                              }
                              onChange={(
                                e,
                              ) =>
                                updateQuestion(
                                  item.id,
                                  "answer",
                                  e.target
                                    .value,
                                )
                              }
                              placeholder="VD: ADAM"
                              style={{
                                marginTop: 4,
                                fontWeight: 700,
                                textTransform:
                                  "uppercase",
                                borderRadius: 12,
                                borderColor:
                                  "#FFE3E8",
                                background:
                                  COLORS.soft,
                              }}
                            />
                          </Col>

                          <Col
                            span={8}
                          >
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                color:
                                  "#475569",
                              }}
                            >
                              Điểm
                            </Text>

                            <InputNumber
                              min={1}
                              max={100}
                              value={
                                item.points
                              }
                              onChange={(
                                val,
                              ) =>
                                updateQuestion(
                                  item.id,
                                  "points",
                                  val ??
                                    10,
                                )
                              }
                              style={{
                                marginTop: 4,
                                width:
                                  "100%",
                                borderRadius: 12,
                              }}
                            />
                          </Col>
                        </Row>

                        {/* INTERSECTION */}

                        {answer &&
                          requiredLetter && (
                            <div
                              style={{
                                padding: 12,
                                borderRadius: 14,
                                background:
                                  "#FFFDF5",
                                border:
                                  "1px dashed #FFD666",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  display:
                                    "block",
                                  marginBottom:
                                    4,
                                  fontSize: 12,
                                  color:
                                    "#92400E",
                                }}
                              >
                                Chọn chữ cái
                                giao với
                                hàng dọc
                                {" "}
                                <b>
                                  {requiredLetter}
                                </b>
                              </Text>

                              <Space
                                size={6}
                                wrap
                              >
                                {answer
                                  .split(
                                    "",
                                  )
                                  .map(
                                    (
                                      char,
                                      charIndex,
                                    ) => {
                                      const isSelected =
                                        item.answerIndex ===
                                        charIndex;

                                      const isMatch =
                                        char ===
                                        requiredLetter;

                                      return (
                                        <Tooltip
                                          key={
                                            charIndex
                                          }
                                          title={
                                            isMatch
                                              ? `Chọn chữ ${char} làm ô giao`
                                              : undefined
                                          }
                                        >
                                          <Button
                                            size="small"
                                            type={
                                              isSelected
                                                ? "primary"
                                                : "default"
                                            }
                                            onClick={() =>
                                              selectIntersection(
                                                item.id,
                                                charIndex,
                                              )
                                            }
                                            style={{
                                              minWidth: 34,
                                              borderRadius: 10,
                                              fontWeight: 800,
                                              background:
                                                isSelected
                                                  ? COLORS.navy
                                                  : isMatch
                                                  ? "#FFF7E6"
                                                  : "#fff",
                                              borderColor:
                                                isMatch
                                                  ? COLORS.gold
                                                  : "#FFE3E8",
                                              color:
                                                isSelected
                                                  ? "#fff"
                                                  : COLORS.text,
                                            }}
                                          >
                                            {char}
                                          </Button>
                                        </Tooltip>
                                      );
                                    },
                                  )}
                              </Space>
                            </div>
                          )}
                      </Space>
                    </Card>
                  );
                },
              )}
            </Space>
          </Card>
        </Col>

        {/* =================================================
            RIGHT
        ================================================= */}

        <Col
          xs={24}
          lg={14}
        >
          {/* PREVIEW */}

          <Card
            bordered={false}
            title={
              <Space
                style={{
                  color:
                    COLORS.navy,
                  fontWeight: 700,
                }}
              >
                <Heart
                  size={18}
                  fill={
                    COLORS.navy
                  }
                />

                Xem trước bảng ô
                chữ Chibi
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            {crossword.grid.length ===
            0 ? (
              <Empty
                description="Hãy nhập đáp án hàng dọc để xem trước ô chữ"
              />
            ) : (
              <div
                style={{
                  background:
                    bgColor ||
                    COLORS.soft,
                  borderRadius: 20,
                  padding: 20,
                  overflowX:
                    "auto",
                  border:
                    "2px dashed #FFE3E8",
                  display: "flex",
                  justifyContent:
                    "center",
                  backgroundImage:
                    bgImage
                      ? `url(${bgImage})`
                      : "none",
                  backgroundSize:
                    "cover",
                  backgroundPosition:
                    "center",
                }}
              >
                <div
                  style={{
                    display:
                      "inline-block",
                  }}
                >
                  {crossword.grid.map(
                    (
                      row,
                      rowIndex,
                    ) => (
                      <div
                        key={
                          rowIndex
                        }
                        style={{
                          display:
                            "flex",
                        }}
                      >
                        {row.map(
                          (
                            cell,
                            colIndex,
                          ) => {
                            const isVerticalCol =
                              colIndex ===
                              crossword.verticalCol;

                            const isSelected =
                              selectedCell &&
                              selectedCell.row ===
                                rowIndex &&
                              selectedCell.col ===
                                colIndex;

                            return (
                              <div
                                key={
                                  colIndex
                                }
                                onClick={() =>
                                  cell.active &&
                                  setSelectedCell(
                                    {
                                      row: rowIndex,
                                      col: colIndex,
                                      cell,
                                    },
                                  )
                                }
                                style={{
                                  width: 38,
                                  height: 38,
                                  margin: 2,
                                  borderRadius: 10,

                                  background:
                                    cell.active
                                      ? isVerticalCol
                                        ? "#FFD166"
                                        : "#FFFFFF"
                                      : "transparent",

                                  border:
                                    cell.active
                                      ? isSelected
                                        ? `3px solid ${COLORS.navy}`
                                        : "2px solid #FF85A1"
                                      : "1px dashed transparent",

                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  position:
                                    "relative",

                                  cursor:
                                    cell.active
                                      ? "pointer"
                                      : "default",

                                  boxShadow:
                                    cell.active
                                      ? "0 4px 10px rgba(255, 133, 161, 0.15)"
                                      : "none",

                                  transition:
                                    "all 0.2s",
                                }}
                              >
                                {cell.numbers &&
                                  cell.numbers
                                    .length >
                                    0 && (
                                    <span
                                      style={{
                                        position:
                                          "absolute",
                                        top: 1,
                                        left: 3,
                                        fontSize: 9,
                                        fontWeight: 800,
                                        color:
                                          COLORS.navy,
                                      }}
                                    >
                                      {
                                        cell
                                          .numbers[0]
                                      }
                                    </span>
                                  )}

                                <span
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color:
                                      COLORS.navy,
                                  }}
                                >
                                  {
                                    cell.letter
                                  }
                                </span>
                              </div>
                            );
                          },
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* GRID INFO */}

            {crossword.grid.length >
              0 && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 14,
                  background:
                    "#FFF9FA",
                  border:
                    "1px solid #FFE3E8",
                }}
              >
                <Space
                  wrap
                  size={8}
                >
                  <Tag
                    color="pink"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    {crossword.width}{" "}
                    cột
                  </Tag>

                  <Tag
                    color="purple"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    {crossword.height}{" "}
                    hàng
                  </Tag>

                  <Tag
                    color="gold"
                    style={{
                      borderRadius: 8,
                    }}
                  >
                    {
                      crossword
                        .placements
                        .length
                    }{" "}
                    đáp án
                  </Tag>
                </Space>
              </div>
            )}
          </Card>

          {/* =================================================
              SETTINGS
          ================================================= */}

          <Card
            bordered={false}
            title={
              <Space
                style={{
                  color:
                    COLORS.navy,
                  fontWeight: 700,
                }}
              >
                <Sparkles size={18} />
                Cài đặt luật chơi
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            {/* TIMER */}

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background:
                  "#FFF5F7",
                border:
                  "2px solid #FFE3E8",
                marginBottom: 16,
              }}
            >
              <Space
                align="center"
                style={{
                  marginBottom: 14,
                }}
              >
                <Clock3
                  size={20}
                  color={
                    COLORS.navy
                  }
                />

                <Text
                  strong
                  style={{
                    color:
                      COLORS.navy,
                    fontSize: 16,
                  }}
                >
                  Thời gian
                </Text>
              </Space>

              <Row
                gutter={[16, 16]}
              >
                <Col
                  xs={24}
                  md={12}
                >
                  <Text
                    strong
                    style={{
                      display:
                        "block",
                      marginBottom: 6,
                      color:
                        "#475569",
                    }}
                  >
                    Thời gian làm
                    bài (giây)
                  </Text>

                  <InputNumber
                    min={10}
                    max={3600}
                    value={
                      timeLimit
                    }
                    onChange={(
                      val,
                    ) =>
                      setTimeLimit(
                        val ||
                          60,
                      )
                    }
                    disabled={
                      !showTimer
                    }
                    style={{
                      width:
                        "100%",
                      borderRadius: 12,
                    }}
                  />
                </Col>

                <Col
                  xs={24}
                  md={12}
                >
                  <SettingItem
                    icon={
                      <Clock3
                        size={18}
                      />
                    }
                    title="Hiển thị đồng hồ"
                    description="Đếm ngược thời gian khi chơi"
                    checked={
                      showTimer
                    }
                    onChange={
                      setShowTimer
                    }
                  />
                </Col>
              </Row>
            </div>

            {/* GAMEPLAY */}

            <Text
              strong
              style={{
                display:
                  "block",
                marginBottom: 10,
                color:
                  COLORS.navy,
              }}
            >
              🎮 Luật chơi
            </Text>

            <Row
              gutter={[
                12, 12,
              ]}
            >
              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Target
                      size={18}
                    />
                  }
                  title="Cho phép thử lại"
                  description="Người chơi được làm lại game"
                  checked={
                    allowRetry
                  }
                  onChange={
                    setAllowRetry
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Eye
                      size={18}
                    />
                  }
                  title="Hiện đáp án sau khi nộp"
                  description="Hiển thị đáp án đúng sau khi submit"
                  checked={
                    showAnswerAfterSubmit
                  }
                  onChange={
                    setShowAnswerAfterSubmit
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Lightbulb
                      size={18}
                    />
                  }
                  title="Cho phép gợi ý"
                  description="Người chơi có thể sử dụng hint"
                  checked={
                    allowHint
                  }
                  onChange={
                    setAllowHint
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <SkipForward
                      size={18}
                    />
                  }
                  title="Cho phép bỏ qua"
                  description="Người chơi có thể bỏ qua câu"
                  checked={
                    allowSkip
                  }
                  onChange={
                    setAllowSkip
                  }
                />
              </Col>
            </Row>

            <Divider />

            {/* DISPLAY */}

            <Text
              strong
              style={{
                display:
                  "block",
                marginBottom: 10,
                color:
                  COLORS.navy,
              }}
            >
              👀 Hiển thị
            </Text>

            <Row
              gutter={[
                12, 12,
              ]}
            >
              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Target
                      size={18}
                    />
                  }
                  title="Hiển thị tiến độ"
                  description="Hiển thị tiến độ câu hỏi"
                  checked={
                    showProgress
                  }
                  onChange={
                    setShowProgress
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Trophy
                      size={18}
                    />
                  }
                  title="Hiển thị điểm"
                  description="Hiển thị tổng điểm của người chơi"
                  checked={
                    showScore
                  }
                  onChange={
                    setShowScore
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Star
                      size={18}
                    />
                  }
                  title="Hiển thị điểm từng câu"
                  description="Hiển thị số điểm của từng câu hỏi"
                  checked={
                    showPoints
                  }
                  onChange={
                    setShowPoints
                  }
                />
              </Col>
            </Row>

            <Divider />

            {/* SHUFFLE */}

            <Text
              strong
              style={{
                display:
                  "block",
                marginBottom: 10,
                color:
                  COLORS.navy,
              }}
            >
              🔀 Xáo trộn
            </Text>

            <Row
              gutter={[
                12, 12,
              ]}
            >
              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Shuffle
                      size={18}
                    />
                  }
                  title="Xáo trộn câu hỏi"
                  description="Thay đổi thứ tự câu hỏi khi chơi"
                  checked={
                    shuffleQuestions
                  }
                  onChange={
                    setShuffleQuestions
                  }
                />
              </Col>

              <Col
                xs={24}
                md={12}
              >
                <SettingItem
                  icon={
                    <Shuffle
                      size={18}
                    />
                  }
                  title="Xáo trộn đáp án"
                  description="Xáo trộn đáp án nếu game hỗ trợ"
                  checked={
                    shuffleAnswers
                  }
                  onChange={
                    setShuffleAnswers
                  }
                />
              </Col>
            </Row>
          </Card>

          {/* =================================================
              BACKGROUND
          ================================================= */}

          <Card
            bordered={false}
            title={
              <Space
                style={{
                  color:
                    COLORS.navy,
                  fontWeight: 700,
                }}
              >
                <FileImageOutlined />
                Hình nền & giao diện
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            <Row
              gutter={[
                16, 16,
              ]}
            >
              {/* COLOR */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 8,
                    color:
                      "#475569",
                  }}
                >
                  Màu nền
                </Text>

                <Space
                  style={{
                    width:
                      "100%",
                  }}
                >
                  <input
                    type="color"
                    value={
                      bgColor
                    }
                    onChange={(
                      e,
                    ) =>
                      setBgColor(
                        e.target
                          .value,
                      )
                    }
                    style={{
                      width: 52,
                      height: 42,
                      border: "none",
                      padding: 0,
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                    }}
                  />

                  <Input
                    value={
                      bgColor
                    }
                    onChange={(
                      e,
                    ) =>
                      setBgColor(
                        e.target
                          .value,
                      )
                    }
                    style={{
                      borderRadius: 12,
                    }}
                  />
                </Space>
              </Col>

              {/* BACKGROUND IMAGE */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 8,
                    color:
                      "#475569",
                  }}
                >
                  Hình nền
                </Text>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(
                    setBackground,
                  )}
                  fileList={createPreviewFileList(
                    background,
                    oldBackground,
                    "background.png",
                  )}
                  onRemove={removeUpload(
                    setBackground,
                  )}
                  accept="image/*"
                >
                  <Button
                    icon={
                      <FileImageOutlined />
                    }
                    style={{
                      borderRadius: 12,
                      borderColor:
                        "#FFE3E8",
                    }}
                  >
                    Chọn hình nền
                  </Button>
                </Upload>
              </Col>
            </Row>
          </Card>

          {/* =================================================
              MEDIA
          ================================================= */}

          <Card
            bordered={false}
            title={
              <Space
                style={{
                  color:
                    COLORS.navy,
                  fontWeight: 700,
                }}
              >
                <SoundOutlined />
                Tệp đa phương tiện
              </Space>
            }
            style={{
              borderRadius: 24,
              marginBottom: 20,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
            }}
          >
            <Row
              gutter={[
                16, 20,
              ]}
            >
              {/* THUMBNAIL */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 6,
                    color:
                      "#475569",
                  }}
                >
                  Ảnh thu nhỏ
                  (Thumbnail)
                </Text>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(
                    setThumbnail,
                  )}
                  fileList={createPreviewFileList(
                    thumbnail,
                    oldThumbnail,
                    "thumbnail.png",
                  )}
                  onRemove={removeUpload(
                    setThumbnail,
                  )}
                  accept="image/*"
                >
                  <Button
                    icon={
                      <FileImageOutlined />
                    }
                    style={{
                      borderRadius: 12,
                      borderColor:
                        "#FFE3E8",
                    }}
                  >
                    Chọn ảnh
                  </Button>
                </Upload>
              </Col>

              {/* BACKGROUND MUSIC */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 6,
                    color:
                      "#475569",
                  }}
                >
                  Nhạc nền
                </Text>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(
                    setBackgroundMusic,
                  )}
                  fileList={createPreviewFileList(
                    backgroundMusic,
                    oldBackgroundMusic,
                    "background-music.mp3",
                  )}
                  onRemove={removeUpload(
                    setBackgroundMusic,
                  )}
                  accept="audio/*"
                >
                  <Button
                    icon={
                      <SoundOutlined />
                    }
                    style={{
                      borderRadius: 12,
                      borderColor:
                        "#FFE3E8",
                    }}
                  >
                    Chọn nhạc
                  </Button>
                </Upload>
              </Col>

              {/* CORRECT SOUND */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 6,
                    color:
                      "#475569",
                  }}
                >
                  Âm thanh trả
                  lời đúng
                </Text>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(
                    setCorrectSound,
                  )}
                  fileList={createPreviewFileList(
                    correctSound,
                    oldCorrectSound,
                    "correct.mp3",
                  )}
                  onRemove={removeUpload(
                    setCorrectSound,
                  )}
                  accept="audio/*"
                >
                  <Button
                    icon={
                      <SoundOutlined />
                    }
                    style={{
                      borderRadius: 12,
                      borderColor:
                        "#FFE3E8",
                    }}
                  >
                    Chọn âm thanh
                  </Button>
                </Upload>
              </Col>

              {/* WRONG SOUND */}

              <Col
                xs={24}
                md={12}
              >
                <Text
                  strong
                  style={{
                    display:
                      "block",
                    marginBottom: 6,
                    color:
                      "#475569",
                  }}
                >
                  Âm thanh trả
                  lời sai
                </Text>

                <Upload
                  maxCount={1}
                  beforeUpload={beforeUpload(
                    setWrongSound,
                  )}
                  fileList={createPreviewFileList(
                    wrongSound,
                    oldWrongSound,
                    "wrong.mp3",
                  )}
                  onRemove={removeUpload(
                    setWrongSound,
                  )}
                  accept="audio/*"
                >
                  <Button
                    icon={
                      <SoundOutlined />
                    }
                    style={{
                      borderRadius: 12,
                      borderColor:
                        "#FFE3E8",
                    }}
                  >
                    Chọn âm thanh
                  </Button>
                </Upload>
              </Col>
            </Row>
          </Card>

          {/* =================================================
              DATA SUMMARY
          ================================================= */}

          <Card
            bordered={false}
            style={{
              borderRadius: 24,
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.03)",
              border:
                "2px solid #FFE3E8",
              background:
                "#FFFDFE",
            }}
          >
            <Space
              direction="vertical"
              style={{
                width:
                  "100%",
              }}
              size={12}
            >
              <Text
                strong
                style={{
                  color:
                    COLORS.navy,
                  fontSize: 16,
                }}
              >
                📦 Cấu hình đang lưu
              </Text>

              <Row
                gutter={[
                  8, 8,
                ]}
              >
                <Col
                  span={12}
                >
                  <Tag
                    color="pink"
                    style={{
                      width:
                        "100%",
                      textAlign:
                        "center",
                      padding: 6,
                      borderRadius: 10,
                    }}
                  >
                    {questions.length}{" "}
                    câu hỏi
                  </Tag>
                </Col>

                <Col
                  span={12}
                >
                  <Tag
                    color="gold"
                    style={{
                      width:
                        "100%",
                      textAlign:
                        "center",
                      padding: 6,
                      borderRadius: 10,
                    }}
                  >
                    {
                      normalizeAnswer(
                        verticalAnswer,
                      ).length
                    }{" "}
                    chữ hàng dọc
                  </Tag>
                </Col>

                <Col
                  span={12}
                >
                  <Tag
                    color="blue"
                    style={{
                      width:
                        "100%",
                      textAlign:
                        "center",
                      padding: 6,
                      borderRadius: 10,
                    }}
                  >
                    {showTimer
                      ? `${timeLimit}s`
                      : "Không giới hạn"}
                  </Tag>
                </Col>

                <Col
                  span={12}
                >
                  <Tag
                    color={
                      validation.valid
                        ? "success"
                        : "error"
                    }
                    style={{
                      width:
                        "100%",
                      textAlign:
                        "center",
                      padding: 6,
                      borderRadius: 10,
                    }}
                  >
                    {validation.valid
                      ? "✓ Sẵn sàng lưu"
                      : "⚠ Chưa hoàn chỉnh"}
                  </Tag>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* =====================================================
          FLOATING SAVE
      ===================================================== */}

      <div
        style={{
          position: "sticky",
          bottom: 20,
          zIndex: 20,
          display: "flex",
          justifyContent:
            "flex-end",
          marginTop: 20,
          pointerEvents:
            "none",
        }}
      >
        <Button
          type="primary"
          size="large"
          icon={
            <SaveOutlined />
          }
          loading={loading}
          disabled={
            !validation.valid
          }
          onClick={
            handleSave
          }
          style={{
            pointerEvents:
              "auto",
            background:
              COLORS.navy,
            borderColor:
              COLORS.navy,
            borderRadius: 18,
            height: 52,
            padding:
              "0 30px",
            fontWeight: 800,
            boxShadow:
              "0 10px 30px rgba(255,92,138,0.35)",
          }}
        >
          {isEdit
            ? "Cập nhật game ✨"
            : "Lưu game ✨"}
        </Button>
      </div>
    </div>
  );
};

export default CrosswordGameEditor;