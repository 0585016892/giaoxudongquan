import axiosClient from "./axios";

/**
 * =========================================================
 * GAME API
 * =========================================================
 *
 * POST   /api/games
 * GET    /api/games
 * GET    /api/games/teacher/:teacherId
 * GET    /api/games/:id
 * PUT    /api/games/:id
 * DELETE /api/games/:id
 *
 * Auth:
 * axiosClient tự gửi token
 *
 * teacher_id:
 * Backend lấy từ req.user
 *
 * =========================================================
 */

/**
 * =========================================================
 * GET FULL FILE URL
 * =========================================================
 */

export const getGameFileUrl = (filePath) => {
  // 1. Bắt lỗi nếu filePath bị undefined, null, không phải kiểu string, hoặc chuỗi rỗng
  if (!filePath || typeof filePath !== "string") {
    return null;
  }

  // Trim để tránh khoảng trắng thừa ở 2 đầu
  const cleanPath = filePath.trim();

  if (!cleanPath) {
    return null;
  }

  // 2. Nếu đã là URL đầy đủ (http, https) hoặc Blob Preview URL từ trình duyệt
  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  // 3. Lấy serverURL từ axiosClient.defaults.baseURL
  const baseURL = axiosClient.defaults.baseURL || "";

  // Loại bỏ đuôi /api hoặc /api/ ở cuối (nếu có)
  const serverURL = baseURL.replace(/\/api\/?$/, "");

  // 4. Chuẩn hóa dấu gạch chéo '/' để tránh trùng lặp (ví dụ: http://localhost:12003//uploads/file.png)
  const normalizedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  return `${serverURL}${normalizedPath}`;
};
/**
 * =========================================================
 * BUILD FORM DATA
 * =========================================================
 *
 * Không gửi teacher_id.
 *
 * Backend tự lấy:
 *
 * req.user.id
 *
 * =========================================================
 */
export const buildGameFormData = ({
  name,
  description = "",
  type = "quiz",
  backgroundConfig = {},
  theme = {},
  settings = {},
  media = {},

  questions = [],
  pairs = [],
  wheel = {},
  cards = [],
  crossword = {},
  sorting = {},
  dragDrop = {},

  thumbnail = null,
  background = null,
  backgroundMusic = null,
  correctSound = null,
  wrongSound = null,
} = {}) => {
  const formData = new FormData();

  // ===============================
  // BASIC
  // ===============================

  if (name != null) {
    formData.append("name", String(name));
  }

  if (description != null) {
    formData.append("description", String(description));
  }

  if (type != null) {
    formData.append("type", String(type));
  }

  // ===============================
  // CONFIG
  // ===============================

  formData.append("backgroundConfig", JSON.stringify(backgroundConfig || {}));

  formData.append("theme", JSON.stringify(theme || {}));

  formData.append("settings", JSON.stringify(settings || {}));

  formData.append("media", JSON.stringify(media || {}));

  // ===============================
  // QUESTIONS
  // ===============================

  formData.append(
    "questions",
    JSON.stringify(Array.isArray(questions) ? questions : []),
  );

  // ===============================
  // MATCHING
  // ===============================

  formData.append("pairs", JSON.stringify(Array.isArray(pairs) ? pairs : []));

  // ===============================
  // WHEEL
  // ===============================

  formData.append("wheel", JSON.stringify(wheel || {}));

  // ===============================
  // MEMORY
  // ===============================

  const safeCards = Array.isArray(cards)
    ? cards.map((card) => {
        const cardData = {
          id: Number(card.id),
          type: card.type || "text",
          content: card.type === "text" ? card.content || "" : "",
          image: null,
          pairId: Number(card.pairId),
        };

        /**
         * File mới của card
         */
        const file = card.image?.originFileObj || card.image;

        if (file instanceof File) {
          formData.append("cardImages", file);
        }
        return cardData;
      })
    : [];

  formData.append("cards", JSON.stringify(safeCards));

  // ===============================
  // OTHER GAME TYPES
  // ===============================

  formData.append("wheel", JSON.stringify(wheel || {}));

  formData.append("crossword", JSON.stringify(crossword || {}));

  formData.append("sorting", JSON.stringify(sorting || {}));

  formData.append("dragDrop", JSON.stringify(dragDrop || {}));

  // ===============================
  // MAIN FILES
  // ===============================

  if (thumbnail instanceof File) {
    formData.append("thumbnail", thumbnail);
  }

  if (background instanceof File) {
    formData.append("background", background);
  }

  if (backgroundMusic instanceof File) {
    formData.append("backgroundMusic", backgroundMusic);
  }

  if (correctSound instanceof File) {
    formData.append("correctSound", correctSound);
  }

  if (wrongSound instanceof File) {
    formData.append("wrongSound", wrongSound);
  }

  return formData;
};
/**
 * =========================================================
 * CREATE GAME
 * =========================================================
 *
 * POST /api/games
 *
 * teacher_id không gửi.
 *
 * =========================================================
 */

export const createGame = async (gameData) => {
  try {
    const formData = buildGameFormData(gameData);

    const response = await axiosClient.post("/games", formData);

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * GET ALL GAMES
 * =========================================================
 *
 * GET /api/games
 *
 * Không cần teacherId.
 *
 * =========================================================
 */

export const getAllGames = async () => {
  try {
    const response = await axiosClient.get("/games");

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * GET GAMES BY TEACHER
 * =========================================================
 *
 * GET /api/games/teacher/:teacherId
 *
 * =========================================================
 */

export const getGamesByTeacher = async (teacherId) => {
  try {
    if (!teacherId) {
      throw new Error("teacherId là bắt buộc");
    }

    const response = await axiosClient.get(`/games/teacher/${teacherId}`);

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * GET GAME BY ID
 * =========================================================
 *
 * GET /api/games/:id
 *
 * =========================================================
 */

export const getGameById = async (gameId) => {
  try {
    if (!gameId) {
      throw new Error("gameId là bắt buộc");
    }

    const response = await axiosClient.get(`/games/${gameId}`);

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * UPDATE GAME
 * =========================================================
 *
 * PUT /api/games/:id
 *
 * =========================================================
 */

export const updateGame = async (gameId, gameData) => {
  try {
    if (!gameId) {
      throw new Error("gameId là bắt buộc");
    }

    const formData = buildGameFormData(gameData);

    const response = await axiosClient.put(`/games/${gameId}`, formData);

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * DELETE GAME
 * =========================================================
 *
 * DELETE /api/games/:id
 *
 * =========================================================
 */

export const deleteGame = async (gameId) => {
  try {
    if (!gameId) {
      throw new Error("gameId là bắt buộc");
    }

    const response = await axiosClient.delete(`/games/${gameId}`);

    return response.data;
  } catch (error) {
    throw normalizeGameError(error);
  }
};

/**
 * =========================================================
 * GET THUMBNAIL
 * =========================================================
 */

export const getGameThumbnail = (game) => {
  return getGameFileUrl(game?.thumbnail);
};

/**
 * =========================================================
 * GET BACKGROUND
 * =========================================================
 */

export const getGameBackground = (game) => {
  return getGameFileUrl(game?.background?.image);
};

/**
 * =========================================================
 * GET AUDIO
 * =========================================================
 */

export const getGameAudio = (game, type) => {
  switch (type) {
    case "backgroundMusic":
      return getGameFileUrl(game?.media?.backgroundMusic);

    case "correctSound":
      return getGameFileUrl(game?.media?.correctSound);

    case "wrongSound":
      return getGameFileUrl(game?.media?.wrongSound);

    default:
      return null;
  }
};

/**
 * =========================================================
 * NORMALIZE ERROR
 * =========================================================
 */

export const normalizeGameError = (error) => {
  const response = error?.response;

  const serverData = response?.data;

  const normalizedError = new Error(
    serverData?.message || error?.message || "Có lỗi xảy ra khi xử lý game",
  );

  normalizedError.status = response?.status || null;

  normalizedError.data = serverData || null;

  normalizedError.originalError = error;

  return normalizedError;
};

/**
 * =========================================================
 * DEFAULT EXPORT
 * =========================================================
 */

const gameApi = {
  createGame,
  getAllGames,
  getGamesByTeacher,
  getGameById,
  updateGame,
  deleteGame,

  buildGameFormData,

  getGameFileUrl,
  getGameThumbnail,
  getGameBackground,
  getGameAudio,
};

export default gameApi;
