import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  Modal,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";

import { css } from "@emotion/css";

import {
  Gamepad2,
  Heart,
  LayoutGrid,
  List,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Search,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { CustomerServiceOutlined } from "@ant-design/icons";
import AppButton from "../../components/common/AppButton";
import StatCard from "../../components/common/StatCard";
import GameTypeSelector from "../../components/games/GameTypeSelector";
import GameBuilder from "../../components/games/GameBuilder";
import GamePlayer from "../../components/games/player/GamePlayer";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import { useUser } from "../../context/UserContext";

import {
  deleteGame,
  getAllGames,
  getGameById,
  getGameThumbnail,
} from "../../api/gameApi";

const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* =========================================================
   GAME TYPES
========================================================= */

export const GAME_TYPES = [
  {
    key: "quiz",
    name: "Trắc nghiệm",
    description: "Trả lời câu hỏi và chọn đáp án đúng",
    icon: "❓",
    color: "#9333EA",
    bgColor: "#F3E8FF",
    borderColor: "#E9D5FF",
  },
  {
    key: "matching",
    name: "Ghép hình",
    description: "Ghép các cặp nội dung tương ứng",
    icon: "🧩",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    borderColor: "#BAE6FD",
  },
  {
    key: "wheel",
    name: "Vòng quay",
    description: "Quay vòng may mắn để chọn câu hỏi",
    icon: "🎡",
    color: "#EA580C",
    bgColor: "#FFEDD5",
    borderColor: "#FED7AA",
  },
  {
    key: "memory",
    name: "Tìm điểm khác",
    description: "Lật thẻ và tìm các cặp giống nhau",
    icon: "🧠",
    color: "#0D9488",
    bgColor: "#CCFBF1",
    borderColor: "#99F6E4",
  },
  {
    key: "crossword",
    name: "Ô chữ",
    description: "Giải ô chữ theo các gợi ý",
    icon: "🎨",
    color: "#C026D3",
    bgColor: "#FAE8FF",
    borderColor: "#F5D0FE",
  },
  {
    key: "sorting",
    name: "Sắp xếp",
    description: "Sắp xếp nội dung theo đúng thứ tự",
    icon: "↕️",
    color: "#16A34A",
    bgColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  {
    key: "drag_drop",
    name: "Kéo thả",
    description: "Kéo nội dung vào đúng vị trí",
    icon: "✋",
    color: "#D97706",
    bgColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  {
    key: "true_false",
    name: "Đúng / Sai",
    description: "Xác định câu nói đúng hay sai",
    icon: "✨",
    color: "#E11D48",
    bgColor: "#FFE4E6",
    borderColor: "#FECDD3",
  },
];

/* =========================================================
   TABS STYLE
========================================================= */

const customTabsStyle = css`
  width: 100%;

  .ant-tabs {
    width: 100%;
  }

  .ant-tabs-nav {
    margin-bottom: 24px !important;

    &::before {
      display: none !important;
    }
  }

  .ant-tabs-nav-wrap {
    overflow-x: auto;
    scrollbar-width: none;
  }

  .ant-tabs-nav-wrap::-webkit-scrollbar {
    display: none;
  }

  .ant-tabs-nav-list {
    gap: 8px;
    background: #ffffff;
    padding: 10px;
    border-radius: 28px;
    border: 2px solid #fff0f5;
    box-shadow: 0 8px 24px rgba(244, 114, 182, 0.06);
    min-width: max-content;
  }

  .ant-tabs-tab {
    padding: 9px 18px !important;
    margin: 0 !important;
    border-radius: 20px !important;
    transition: all 0.25s ease !important;
    color: #8d7b9d !important;
    font-weight: 600;
  }

  .ant-tabs-tab:hover {
    color: #9333ea !important;
    background: #faf5ff;
  }

  .ant-tabs-tab-active {
    background: #f3e8ff !important;
    border: 1.5px solid #e9d5ff !important;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: #9333ea !important;
    font-weight: 700;
  }

  .ant-tabs-ink-bar {
    display: none !important;
  }
`;

/* =========================================================
   FILE URL
========================================================= */

const getFileUrl = (file) => {
  if (!file) {
    return null;
  }

  if (typeof File !== "undefined" && file instanceof File) {
    return URL.createObjectURL(file);
  }

  if (typeof Blob !== "undefined" && file instanceof Blob) {
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
    if (typeof File !== "undefined" && file.originFileObj instanceof File) {
      return URL.createObjectURL(file.originFileObj);
    }

    if (typeof Blob !== "undefined" && file.originFileObj instanceof Blob) {
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

/* =========================================================
   HELPERS
========================================================= */

const getGameType = (type) => {
  return GAME_TYPES.find((item) => item.key === type);
};

const getGameTypeInfo = (game) => {
  return (
    getGameType(game?.type) || {
      key: game?.type,
      name: game?.type || "Game",
      icon: "🎮",
      color: "#9333EA",
      bgColor: "#F3E8FF",
      borderColor: "#E9D5FF",
    }
  );
};

const getThumbnail = (game) => {
  if (!game) {
    return null;
  }

  return getFileUrl(
    game.thumbnail || game.background?.image || getGameThumbnail(game),
  );
};

/* =========================================================
   VIP MODAL
========================================================= */

const showVipModal = (game) => {
  Modal.info({
    title: "Tính năng dành cho VIP ✨",

    content: (
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            fontSize: 15,
            color: "#64748B",
            lineHeight: 1.7,
          }}
        >
          Game <b>{game?.name || "này"}</b> chỉ dành cho tài khoản VIP.
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            borderRadius: 14,
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            color: "#C2410C",
            fontWeight: 600,
          }}
        >
          👑 Tài khoản Member chỉ được chơi Trắc nghiệm.
        </div>
      </div>
    ),

    okText: "Đã hiểu",
    centered: true,

    okButtonProps: {
      style: {
        borderRadius: 12,
        fontWeight: 700,
        background: "#9333EA",
        borderColor: "#9333EA",
      },
    },
  });
};

/* =========================================================
   CARD SKELETON
========================================================= */

const GameCardSkeleton = () => {
  return (
    <Card
      style={{
        borderRadius: 28,
        overflow: "hidden",
        border: "2px solid #F3E8FF",
        background: "#FFFFFF",
      }}
      styles={{
        body: {
          padding: 20,
        },
      }}
    >
      <Skeleton.Image
        active
        style={{
          width: "100%",
          height: 145,
          borderRadius: 0,
        }}
      />

      <div style={{ marginTop: 20 }}>
        <Skeleton
          active
          title={{
            width: "70%",
          }}
          paragraph={{
            rows: 3,
            width: ["55%", "85%", "65%"],
          }}
        />
      </div>
    </Card>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const GameEmpty = ({ onCreate }) => {
  return (
    <Card
      style={{
        borderRadius: 32,
        padding: 60,
        textAlign: "center",
        border: "2.5px dashed #E9D5FF",
        background: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(168, 85, 247, 0.04)",
      }}
    >
      <Empty
        image={
          <div
            style={{
              width: 90,
              height: 90,
              background: "#FAF5FF",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: "2px solid #E9D5FF",
            }}
          >
            <Gamepad2
              size={46}
              style={{
                color: "#A855F7",
              }}
            />
          </div>
        }
        description={
          <div>
            <Title
              level={4}
              style={{
                color: "#3B2F4C",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Chưa có trò chơi nào ở đây nè ~ ✨
            </Title>

            <Text
              type="secondary"
              style={{
                color: "#A093AD",
              }}
            >
              Thử đổi bộ lọc hoặc tạo một trò chơi mới nha!
            </Text>
          </div>
        }
      >
        <Button
          type="primary"
          icon={<Plus size={18} />}
          onClick={onCreate}
          style={{
            background: "#A855F7",
            borderRadius: 18,
            height: 42,
            marginTop: 16,
            fontWeight: 700,
            borderColor: "#A855F7",
            boxShadow: "0 6px 16px rgba(168, 85, 247, 0.25)",
          }}
        >
          Tạo trò chơi ngay
        </Button>
      </Empty>
    </Card>
  );
};

/* =========================================================
   MAIN
========================================================= */

const GameManagementPage = ({ teacherId }) => {
  const { user } = useUser();

  /* =========================================================
     DATA
  ========================================================= */

  const [games, setGames] = useState([]);

  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(true);

  /* =========================================================
     BUILDER
  ========================================================= */

  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const [activeTab, setActiveTab] = useState("all");

  const [searchText, setSearchText] = useState("");

  const [selectedClass, setSelectedClass] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [sortBy] = useState("newest");
  /* =========================================================
     VIEW
  ========================================================= */

  const [viewMode, setViewMode] = useState("grid");

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [currentPage, setCurrentPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  /* =========================================================
     PLAYER
  ========================================================= */

  const [playingGame, setPlayingGame] = useState(null);

  const [playerLoading, setPlayerLoading] = useState(false);

  /* =========================================================
     ACCOUNT TYPE
  ========================================================= */

  const accountType = String(user?.account_type || user?.accountType || "")
    .trim()
    .toLowerCase();

  const isVip = accountType === "vip";

  const isMember =
    accountType === "member" ||
    accountType === "normal" ||
    accountType === "free" ||
    accountType === "user";

  /* =========================================================
     GAME ACCESS
  ========================================================= */

  const getGameAccess = useCallback(
    (game) => {
      /*
       * VIP được chơi tất cả
       */
      if (isVip) {
        return {
          allowed: true,
          isVip: true,
          message: "",
        };
      }

      /*
       * Tất cả tài khoản không phải VIP
       * chỉ được chơi Quiz.
       *
       * Không phụ thuộc vào việc account_type
       * có phải "member" hay không.
       */
      if (game?.type === "quiz") {
        return {
          allowed: true,
          isVip: false,
          message: "",
        };
      }

      return {
        allowed: false,
        isVip: false,
        message:
          isMember || !accountType
            ? "Game này chỉ dành cho tài khoản VIP ✨"
            : "Tài khoản của bạn không có quyền chơi game này.",
      };
    },
    [isVip, isMember, accountType],
  );

  /* =========================================================
     LOAD GAMES
  ========================================================= */

  const loadGames = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getAllGames();

      if (result?.success) {
        setGames(Array.isArray(result.data) ? result.data : []);
      } else {
        message.error(result?.message || "Không thể tải danh sách game");
      }
    } catch (error) {
      console.error("loadGames error:", error);

      message.error(error?.message || "Không thể tải danh sách game");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames, teacherId]);

  /* =========================================================
     BUILDER
  ========================================================= */

  const openCreate = useCallback(() => {
    setEditingGame(null);
    setSelectedType(null);
    setBuilderOpen(true);
  }, []);

  const handleSelectType = useCallback((type) => {
    setSelectedType(type);
  }, []);

  const handleEdit = useCallback((game) => {
    setEditingGame(game);
    setSelectedType(game?.type || null);
    setBuilderOpen(true);
  }, []);

  const closeBuilder = useCallback(() => {
    setBuilderOpen(false);
    setSelectedType(null);
    setEditingGame(null);
  }, []);

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = useCallback(
    (game) => {
      if (!game?.id) {
        message.error("Không tìm thấy ID game");
        return;
      }

      Modal.confirm({
        title: "Xóa trò chơi nha?",

        content: (
          <span
            style={{
              color: "#64748B",
            }}
          >
            Bạn có chắc muốn xóa <b>{game.name}</b> không bé ơi? Dữ liệu game sẽ
            biến mất luôn đó! ✨
          </span>
        ),

        okText: "Xóa nè",
        cancelText: "Thôi quay lại",
        centered: true,

        okButtonProps: {
          danger: true,
          style: {
            borderRadius: 14,
            background: "#FFE4E6",
            color: "#E11D48",
            border: "none",
            fontWeight: 600,
          },
        },

        cancelButtonProps: {
          style: {
            borderRadius: 14,
          },
        },

        onOk: async () => {
          try {
            await deleteGame(game.id);

            message.success("Xóa thành công rồi nhé! ✨");

            await loadGames();
          } catch (error) {
            console.error("deleteGame error:", error);

            message.error(error?.message || "Không thể xóa game");
          }
        },
      });
    },
    [loadGames],
  );

  /* =========================================================
     PLAY GAME
  ========================================================= */

  const handlePlayGame = useCallback(
    async (game) => {
      /*
       * Không có game
       */
      if (!game?.id) {
        message.error("Không tìm thấy trò chơi");
        return;
      }

      /*
       * CHECK QUYỀN LẦN 1
       */
      const access = getGameAccess(game);

      if (!access.allowed) {
        showVipModal(game);
        return;
      }

      try {
        setPlayerLoading(true);

        /*
         * Lấy game đầy đủ từ API
         */
        const result = await getGameById(game.id);

        if (!result?.success || !result?.data) {
          throw new Error(result?.message || "Không thể tải game");
        }

        const loadedGame = result.data;

        /*
         * CHECK QUYỀN LẦN 2
         *
         * Rất quan trọng:
         * Không được setPlayingGame()
         * trước khi kiểm tra lại.
         */
        const loadedAccess = getGameAccess(loadedGame);

        if (!loadedAccess.allowed) {
          showVipModal(loadedGame);
          return;
        }

        /*
         * Chỉ game hợp lệ mới được
         * mở GamePlayer.
         */
        setPlayingGame(loadedGame);
      } catch (error) {
        console.error("handlePlayGame error:", error);

        message.error(error?.message || "Không thể mở game");
      } finally {
        setPlayerLoading(false);
      }
    },
    [getGameAccess],
  );

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredGames = useMemo(() => {
    let result = [...games];

    /*
     * TYPE
     */
    if (activeTab !== "all") {
      result = result.filter((game) => game?.type === activeTab);
    }

    /*
     * SEARCH
     */
    const keyword = searchText.trim().toLowerCase();

    if (keyword) {
      result = result.filter((game) => {
        const name = game?.name?.toLowerCase() || "";

        const description = game?.description?.toLowerCase() || "";

        return name.includes(keyword) || description.includes(keyword);
      });
    }

    /*
     * CLASS
     */
    if (selectedClass !== "all") {
      result = result.filter((game) => game?.grade === selectedClass);
    }

    /*
     * STATUS
     */
    if (selectedStatus !== "all") {
      result = result.filter((game) =>
        selectedStatus === "active"
          ? game?.status !== "draft"
          : game?.status === "draft",
      );
    }

    /*
     * SORT
     */
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0);
      }

      if (sortBy === "oldest") {
        return new Date(a?.created_at || 0) - new Date(b?.created_at || 0);
      }

      if (sortBy === "name") {
        return (a?.name || "").localeCompare(b?.name || "", "vi");
      }

      if (sortBy === "popular") {
        return Number(b?.playersCount || 0) - Number(a?.playersCount || 0);
      }

      return 0;
    });

    return result;
  }, [games, activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  /* =========================================================
     RESET PAGINATION
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText, selectedClass, selectedStatus, sortBy]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * pageSize;

    return filteredGames.slice(start, start + pageSize);
  }, [filteredGames, currentPage, pageSize]);

  /* =========================================================
     STATS
  ========================================================= */

  const totalGames = games.length;

  const totalClasses = useMemo(() => {
    return new Set(games.map((game) => game?.grade).filter(Boolean)).size;
  }, [games]);

  const totalPlayers = useMemo(() => {
    return games.reduce(
      (sum, game) => sum + Number(game?.playersCount || 0),
      0,
    );
  }, [games]);

  const completionRate = useMemo(() => {
    const values = games
      .map((game) => {
        const value = game?.completionRate ?? game?.rating ?? null;

        if (value === null || value === undefined) {
          return null;
        }

        const number = parseFloat(String(value).replace("%", ""));

        return Number.isNaN(number) ? null : number;
      })
      .filter((value) => value !== null);

    if (!values.length) {
      return 0;
    }

    return Math.round(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }, [games]);

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const columns = useMemo(
    () => [
      {
        title: "Trò chơi",
        dataIndex: "name",
        key: "name",

        render: (text, record) => {
          const type = GAME_TYPES.find((item) => item.key === record.type);

          const thumbUrl = getFileUrl(
            record.thumbnail ||
              record.background?.image ||
              getGameThumbnail(record),
          );

          return (
            <Space size={14}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 20,
                  background: type?.bgColor || "#F3E8FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  fontSize: 24,
                  border: `2px solid ${type?.borderColor || "#E9D5FF"}`,
                }}
              >
                {thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt={text || "Game"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  type?.icon || "🎮"
                )}
              </div>

              <div>
                <Text
                  strong
                  style={{
                    fontSize: 14,
                    color: "#3B2F4C",
                  }}
                >
                  {text || "Game chưa đặt tên"}
                </Text>

                <div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                      color: "#A093AD",
                    }}
                  >
                    {record.description || "Chưa có mô tả nhỏ nào hết~"}
                  </Text>
                </div>
              </div>
            </Space>
          );
        },
      },

      {
        title: "Loại trò chơi",
        dataIndex: "type",
        key: "type",

        render: (typeKey) => {
          const type = GAME_TYPES.find((item) => item.key === typeKey);

          return (
            <Tag
              style={{
                color: type?.color || "#9333EA",
                background: type?.bgColor || "#F3E8FF",
                border: `1.5px solid ${type?.borderColor || "#E9D5FF"}`,
                borderRadius: 14,
                padding: "4px 12px",
                fontWeight: 700,
              }}
            >
              {type?.icon} {type?.name || typeKey}
            </Tag>
          );
        },
      },

      {
        title: "Khối lớp",
        dataIndex: "grade",
        key: "grade",

        render: (grade) => (
          <span
            style={{
              color: "#6B5B7B",
            }}
          >
            {grade || "Khối Thiếu Nhi"}
          </span>
        ),
      },

      {
        title: "Tham gia",
        key: "players",

        render: (_, record) => (
          <Text
            style={{
              fontWeight: 600,
              color: "#827093",
            }}
          >
            👶 {record.playersCount || 0} bé
          </Text>
        ),
      },

      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",

        render: (status) =>
          status === "draft" ? (
            <Badge
              status="default"
              text={
                <span
                  style={{
                    color: "#A093AD",
                  }}
                >
                  Bản nháp ✏️
                </span>
              }
            />
          ) : (
            <Badge
              status="success"
              text={
                <span
                  style={{
                    color: "#16A34A",
                  }}
                >
                  Đang mở 🌟
                </span>
              }
            />
          ),
      },

      {
        title: "Thao tác",
        key: "action",
        align: "right",

        render: (_, record) => {
          const access = getGameAccess(record);

          return (
            <Space size={8}>
              <Button
                type="primary"
                icon={
                  access.allowed ? (
                    <Play size={14} fill="currentColor" />
                  ) : (
                    <span>👑</span>
                  )
                }
                disabled={!access.allowed}
                onClick={() => handlePlayGame(record)}
                style={{
                  borderRadius: 14,

                  background: access.allowed ? "#F3E8FF" : "#F8FAFC",

                  color: access.allowed ? "#9333EA" : "#94A3B8",

                  border: access.allowed
                    ? "1.5px solid #E9D5FF"
                    : "1.5px solid #E2E8F0",

                  boxShadow: "none",

                  fontWeight: 700,

                  cursor: access.allowed ? "pointer" : "not-allowed",
                }}
              >
                {access.allowed ? "Vào chơi" : "Chỉ VIP"}
              </Button>

              <Button
                icon={<Pencil size={14} />}
                onClick={() => handleEdit(record)}
                style={{
                  borderRadius: 14,
                  borderColor: "#FFE4E6",
                }}
              />

              <Button
                danger
                icon={<Trash2 size={14} />}
                onClick={() => handleDelete(record)}
                style={{
                  borderRadius: 14,
                  background: "#FFE4E6",
                  color: "#E11D48",
                  border: "none",
                }}
              />
            </Space>
          );
        },
      },
    ],
    [getGameAccess, handleDelete, handleEdit, handlePlayGame],
  );

  /* =========================================================
     PLAYER SCREEN
  ========================================================= */

  if (playerLoading) {
    return <GamePlayer loading onExit={() => setPlayingGame(null)} />;
  }

  if (playingGame) {
    return (
      <GamePlayer game={playingGame} onExit={() => setPlayingGame(null)} />
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "clamp(18px, 3vw, 36px) clamp(14px, 4vw, 48px)",
        fontFamily: "'Quicksand', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <PageHeroHeader
        icon={<CustomerServiceOutlined />} // hoặc icon 🎮 tùy chọn
        badgeText="🌸 TRÒ CHƠI GIÁO LÝ"
        title="Kho trò chơi 🎮"
        description="Tạo và quản lý những trò chơi giáo lý vui nhộn cho các bé ✨"
      />

      {/* =====================================================
          STATS
      ===================================================== */}

      <Row
        gutter={[20, 20]}
        style={{
          marginBottom: 28,
        }}
      >
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng số Game 🎮"
            value={totalGames}
            loading={loading}
            icon={<Gamepad2 size={24} />}
            iconColor="#9333EA"
            description="Tất cả mini games"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #F3E8FF",
              boxShadow: "0 8px 20px rgba(147, 51, 234, 0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Lớp học áp dụng"
            value={totalClasses}
            loading={loading}
            icon={<Users size={24} />}
            iconColor="#0284C7"
            description="Lớp tham gia thử thách"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #E0F2FE",
              boxShadow: "0 8px 20px rgba(2, 132, 199, 0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Các Bé Tham Gia 👶"
            value={totalPlayers}
            loading={loading}
            icon={<Smile size={24} />}
            iconColor="#16A34A"
            description="Tổng số lượt tương tác"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #DCFCE7",
              boxShadow: "0 8px 20px rgba(22, 163, 74, 0.05)",
            }}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tỷ lệ hoàn thành"
            value={`${completionRate}%`}
            loading={loading}
            icon={<Star size={24} />}
            iconColor="#D97706"
            description="Bé hoàn thành game"
            style={{
              background: "#FFFFFF",
              borderRadius: 24,
              border: "2px solid #FEF3C7",
              boxShadow: "0 8px 20px rgba(217, 119, 6, 0.05)",
            }}
          />
        </Col>
      </Row>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className={customTabsStyle}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "all",
              label: (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>🎮</span>

                  <span>Tất cả game</span>
                </span>
              ),
            },

            ...GAME_TYPES.map((type) => ({
              key: type.key,

              label: (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{type.icon}</span>

                  <span>{type.name}</span>
                </span>
              ),
            })),
          ]}
        />
      </div>

      {/* =====================================================
          FILTER
      ===================================================== */}

      <Card
        style={{
          marginBottom: 28,
          borderRadius: 28,
          border: "2px solid #FFF0F5",
          boxShadow: "0 8px 24px rgba(244, 114, 182, 0.04)",
          background: "#FFFFFF",
        }}
        styles={{
          body: {
            padding: "18px 24px",
          },
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Space
            wrap
            size={12}
            style={{
              flex: 1,
            }}
          >
            <Input
              placeholder="Tìm game xịn xịn..."
              prefix={
                <Search
                  size={18}
                  style={{
                    color: "#C0B2CE",
                  }}
                />
              }
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                width: "clamp(220px, 25vw, 280px)",
                borderRadius: 20,
                height: 42,
                border: "1.5px solid #F3E8FF",
                background: "#FAF5FF",
              }}
            />

            <Select
              value={selectedClass}
              onChange={setSelectedClass}
              style={{
                width: 160,
              }}
              options={[
                {
                  value: "all",
                  label: "🎈 Tất cả các khối",
                },
                {
                  value: "thieu_nhi",
                  label: "🐥 Khối Thiếu Nhi",
                },
                {
                  value: "giao_ly",
                  label: "📖 Khối Giáo Lý",
                },
              ]}
            />

            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{
                width: 160,
              }}
              options={[
                {
                  value: "all",
                  label: "Trạng thái: Tất cả",
                },
                {
                  value: "active",
                  label: "🟢 Đang mở",
                },
                {
                  value: "draft",
                  label: "🟡 Bản nháp",
                },
              ]}
            />
          </Space>

          <Space size={12}>
            {/* VIEW MODE */}

            <div
              style={{
                background: "#FAF5FF",
                padding: 4,
                borderRadius: 16,
                display: "flex",
                gap: 4,
                border: "1px solid #F3E8FF",
              }}
            >
              <Button
                type={viewMode === "grid" ? "primary" : "text"}
                icon={<LayoutGrid size={18} />}
                onClick={() => setViewMode("grid")}
                style={{
                  borderRadius: 12,
                  height: 34,
                  width: 34,
                  padding: 0,
                  background: viewMode === "grid" ? "#A855F7" : "transparent",
                  boxShadow:
                    viewMode === "grid"
                      ? "0 4px 12px rgba(168, 85, 247, 0.3)"
                      : "none",
                }}
              />

              <Button
                type={viewMode === "list" ? "primary" : "text"}
                icon={<List size={18} />}
                onClick={() => setViewMode("list")}
                style={{
                  borderRadius: 12,
                  height: 34,
                  width: 34,
                  padding: 0,
                  background: viewMode === "list" ? "#A855F7" : "transparent",
                  boxShadow:
                    viewMode === "list"
                      ? "0 4px 12px rgba(168, 85, 247, 0.3)"
                      : "none",
                }}
              />
            </div>

            <AppButton
              type="primary"
              icon={<Plus size={20} />}
              onClick={openCreate}
            >
              Tạo game mới
            </AppButton>
          </Space>
        </div>
      </Card>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      {loading ? (
        viewMode === "list" ? (
          <Card
            style={{
              borderRadius: 28,
              border: "2px solid #FFF0F5",
              background: "#FFFFFF",
            }}
            styles={{
              body: {
                padding: 24,
              },
            }}
          >
            <Skeleton
              active
              paragraph={{
                rows: 8,
              }}
            />
          </Card>
        ) : (
          <Row gutter={[22, 22]}>
            {Array.from({
              length: 10,
            }).map((_, index) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={index}>
                <GameCardSkeleton />
              </Col>
            ))}
          </Row>
        )
      ) : paginatedGames.length === 0 ? (
        <GameEmpty onCreate={openCreate} />
      ) : viewMode === "list" ? (
        /* ===================================================
           LIST
        =================================================== */

        <Card
          style={{
            borderRadius: 28,
            border: "2px solid #FFF0F5",
            boxShadow: "0 8px 24px rgba(244, 114, 182, 0.04)",
            overflow: "hidden",
            background: "#FFFFFF",
          }}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Table
            columns={columns}
            dataSource={paginatedGames}
            rowKey="id"
            pagination={false}
            scroll={{
              x: 900,
            }}
          />
        </Card>
      ) : (
        /* ===================================================
           GRID
        =================================================== */

        <Row gutter={[22, 22]}>
          {paginatedGames.map((game) => {
            const type = getGameTypeInfo(game);

            const thumbUrl = getThumbnail(game);

            const access = getGameAccess(game);

            return (
              <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={game.id}>
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    borderRadius: 28,
                    overflow: "hidden",
                    border: `2.5px solid ${type.borderColor}`,
                    background: "#FFFFFF",
                    boxShadow: "0 10px 24px rgba(168, 85, 247, 0.06)",
                    transition: "all 0.3s ease",
                  }}
                  styles={{
                    body: {
                      padding: 20,
                    },
                  }}
                  cover={
                    <div
                      style={{
                        height: 145,
                        background: game.background?.color || type.bgColor,
                        backgroundImage:
                          !thumbUrl && game.background?.image
                            ? `url(${getFileUrl(game.background.image)})`
                            : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={game.name || "Game"}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 52,
                          }}
                        >
                          {type.icon}
                        </div>
                      )}

                      {/* TYPE */}

                      <Tag
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          margin: 0,
                          background: "rgba(255,255,255,0.95)",
                          backdropFilter: "blur(8px)",
                          color: type.color,
                          border: `1.5px solid ${type.borderColor}`,
                          borderRadius: 14,
                          fontWeight: 700,
                          padding: "2px 10px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                        }}
                      >
                        {type.icon} {type.name}
                      </Tag>

                      {/* VIP */}

                      {!access.allowed && (
                        <div
                          style={{
                            position: "absolute",
                            left: 12,
                            bottom: 12,
                            background: "rgba(255,255,255,0.94)",
                            border: "1px solid #FED7AA",
                            color: "#C2410C",
                            borderRadius: 12,
                            padding: "4px 9px",
                            fontSize: 11,
                            fontWeight: 800,
                            backdropFilter: "blur(8px)",
                          }}
                        >
                          👑 VIP
                        </div>
                      )}
                    </div>
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    {/* NAME */}

                    <Title
                      level={5}
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: 15,
                        fontWeight: 800,
                        color: "#3B2F4C",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={game.name}
                    >
                      {game.name || "Game chưa đặt tên"}
                    </Title>

                    {/* INFO */}

                    <div
                      style={{
                        color: "#827093",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 7,
                        }}
                      >
                        <Users
                          size={14}
                          style={{
                            color: "#A093AD",
                          }}
                        />

                        <span>{game.grade || "Khối Thiếu Nhi"}</span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span>👶 {game.playersCount || 0} bé chơi</span>

                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            color: "#E11D48",
                            fontWeight: 700,
                          }}
                        >
                          <Heart
                            size={13}
                            style={{
                              color: "#FDA4AF",
                              fill: "#FDA4AF",
                            }}
                          />

                          {game.rating || game.completionRate || "100%"}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: "auto",
                      }}
                    >
                      <Button
                        type="primary"
                        icon={
                          access.allowed ? (
                            <Play size={14} fill="currentColor" />
                          ) : (
                            <span>👑</span>
                          )
                        }
                        disabled={!access.allowed}
                        onClick={() => handlePlayGame(game)}
                        style={{
                          flex: 1,
                          borderRadius: 16,

                          background: access.allowed ? "#F3E8FF" : "#F8FAFC",

                          color: access.allowed ? "#9333EA" : "#94A3B8",

                          border: access.allowed
                            ? "1.5px solid #E9D5FF"
                            : "1.5px solid #E2E8F0",

                          fontWeight: 700,
                          fontSize: 13,
                          height: 40,
                          boxShadow: "none",

                          cursor: access.allowed ? "pointer" : "not-allowed",

                          opacity: access.allowed ? 1 : 0.75,
                        }}
                      >
                        {access.allowed ? "Vào chơi" : "Chỉ VIP"}
                      </Button>

                      <Dropdown
                        trigger={["click"]}
                        menu={{
                          items: [
                            {
                              key: "edit",
                              icon: <Pencil size={14} />,
                              label: "Sửa game",
                              onClick: () => handleEdit(game),
                            },
                            {
                              key: "delete",
                              icon: <Trash2 size={14} />,
                              label: "Xóa game",
                              danger: true,
                              onClick: () => handleDelete(game),
                            },
                          ],
                        }}
                      >
                        <Button
                          type="text"
                          icon={
                            <MoreVertical
                              size={16}
                              style={{
                                color: "#A093AD",
                              }}
                            />
                          }
                          style={{
                            borderRadius: 14,
                            padding: 0,
                            width: 40,
                            height: 40,
                            background: "#FAF5FF",
                          }}
                        />
                      </Dropdown>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading && filteredGames.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 40,
            gap: 16,
          }}
        >
          <Pagination
            current={currentPage}
            total={filteredGames.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            showTotal={(total) => `Tổng ${total} game`}
          />

          <Select
            value={pageSize}
            onChange={(value) => {
              setPageSize(value);
              setCurrentPage(1);
            }}
            style={{
              width: 130,
            }}
            options={[
              {
                value: 10,
                label: "10 game/trang",
              },
              {
                value: 20,
                label: "20 game/trang",
              },
              {
                value: 50,
                label: "50 game/trang",
              },
            ]}
          />
        </div>
      )}

      {/* =====================================================
          BUILDER MODAL
      ===================================================== */}

      <Modal
        open={builderOpen}
        onCancel={closeBuilder}
        footer={null}
        width={selectedType ? 1100 : 900}
        destroyOnClose
        centered
        maskClosable={false}
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 18,
              fontWeight: 800,
              color: "#3B2F4C",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                background: "#F3E8FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px solid #E9D5FF",
              }}
            >
              <Sparkles
                size={20}
                style={{
                  color: "#9333EA",
                }}
              />
            </div>

            <span>
              {editingGame ? "Sửa trò chơi nè" : "Tạo trò chơi mới siêu xịn"}
            </span>
          </div>
        }
      >
        {!selectedType ? (
          <GameTypeSelector
            types={GAME_TYPES}
            value={selectedType}
            onChange={handleSelectType}
          />
        ) : (
          <GameBuilder
            type={selectedType}
            teacherId={teacherId}
            game={editingGame}
            onBack={() => setSelectedType(null)}
            onSuccess={() => {
              closeBuilder();
              loadGames();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default GameManagementPage;
