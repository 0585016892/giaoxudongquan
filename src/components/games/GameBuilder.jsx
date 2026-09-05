import React from "react";
import { Alert, Button, Space, Typography, Tag } from "antd";
import { ArrowLeft, Sparkles } from "lucide-react";

import QuizGameEditor from "./quiz/QuizGameEditor";
import MatchingGameEditor from "./matching/MatchingGameEditor";
import WheelGameEditor from "./wheel/WheelGameEditor";
import MemoryGameEditor from "./memory/MemoryGameEditor";
import CrosswordGameEditor from "./crossword/CrosswordGameEditor";
import SortingGameEditor from "./sorting/SortingGameEditor";
import DragDropGameEditor from "./dragDrop/DragDropGameEditor";
import TrueFalseGameEditor from "./trueFalse/TrueFalseGameEditor";

const { Title, Text } = Typography;

// Map Icon & Cấu hình hiển thị Chibi Pastel cho từng loại Game 🌸
const GAME_CONFIG = {
  quiz: {
    name: "Trắc nghiệm",
    icon: "❓",
    color: "#9333EA", // Soft Purple
    bgColor: "#F3E8FF",
    borderColor: "#E9D5FF",
  },
  matching: {
    name: "Ghép hình",
    icon: "🧩",
    color: "#0284C7", // Sky Blue
    bgColor: "#E0F2FE",
    borderColor: "#BAE6FD",
  },
  wheel: {
    name: "Vòng quay",
    icon: "🎡",
    color: "#EA580C", // Pastel Peach
    bgColor: "#FFEDD5",
    borderColor: "#FED7AA",
  },
  memory: {
    name: "Tìm điểm khác",
    icon: "🧠",
    color: "#0D9488", // Mint Foam
    bgColor: "#CCFBF1",
    borderColor: "#99F6E4",
  },
  crossword: {
    name: "Ô chữ",
    icon: "🎨",
    color: "#C026D3", // Soft Orchid
    bgColor: "#FAE8FF",
    borderColor: "#F5D0FE",
  },
  sorting: {
    name: "Sắp xếp",
    icon: "↕️",
    color: "#16A34A", // Soft Lime/Green
    bgColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  drag_drop: {
    name: "Kéo thả",
    icon: "✋",
    color: "#D97706", // Honey Yellow
    bgColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  true_false: {
    name: "Đúng / Sai",
    icon: "✨",
    color: "#E11D48", // Bubblegum Pink
    bgColor: "#FFE4E6",
    borderColor: "#FECDD3",
  },
};

const GameBuilder = ({ type, teacherId, game, onBack, onSuccess }) => {
  const commonProps = {
    teacherId,
    game,
    onSuccess,
  };

  const currentConfig = GAME_CONFIG[type] || {
    name: "Trò chơi",
    icon: "🎮",
    color: "#A855F7",
    bgColor: "#FAF5FF",
    borderColor: "#E9D5FF",
  };

  const renderEditor = () => {
    switch (type) {
      case "quiz":
        return <QuizGameEditor {...commonProps} />;
      case "matching":
        return <MatchingGameEditor {...commonProps} />;
      case "wheel":
        return <WheelGameEditor {...commonProps} />;
      case "memory":
        return <MemoryGameEditor {...commonProps} />;
      case "crossword":
        return <CrosswordGameEditor {...commonProps} />;
      case "sorting":
        return <SortingGameEditor {...commonProps} />;
      case "drag_drop":
        return <DragDropGameEditor {...commonProps} />;
      case "true_false":
        return <TrueFalseGameEditor {...commonProps} />;
      default:
        return (
          <Alert
            type="error"
            showIcon
            message={
              <span style={{ fontWeight: 700, color: "#E11D48" }}>
                Úi, dạng game này bị trốn mất rồi! 😿
              </span>
            }
            description="Bé quay lại chọn đúng một dạng trò chơi dễ thương trong danh sách nha!"
            style={{
              borderRadius: 22,
              padding: 20,
              background: "#FFE4E6",
              border: "2px solid #FECDD3",
            }}
          />
        );
    }
  };

  return (
    <div
      style={{
        padding: "8px 0",
        fontFamily: "'Quicksand', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* 1. TOP NAVBAR / HEADER TOOLBAR CHIBI */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 24px",
          marginBottom: 24,
          background: "#FFFFFF",
          borderRadius: 28,
          border: `2.5px solid ${currentConfig.borderColor}`,
          boxShadow: `0 8px 24px ${currentConfig.color}15`,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        {/* Info Dạng Game đang tạo/sửa */}
        <Space size={16} align="center">
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 22,
              background: currentConfig.bgColor,
              border: `2px solid ${currentConfig.borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              boxShadow: `0 6px 16px ${currentConfig.color}20`,
            }}
          >
            {currentConfig.icon}
          </div>

          <div>
            <Space size={10} align="center" wrap>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#3B2F4C",
                }}
              >
                {game ? "Cấu hình trò chơi nè ✨" : "Tạo trò chơi siêu xịn ✨"}
              </Title>
              <Tag
                style={{
                  color: currentConfig.color,
                  background: currentConfig.bgColor,
                  border: `1.5px solid ${currentConfig.borderColor}`,
                  borderRadius: 16,
                  fontWeight: 700,
                  padding: "3px 12px",
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Sparkles size={12} /> {currentConfig.name}
              </Tag>
            </Space>

            <Text
              style={{
                color: "#827093",
                fontSize: 13,
                fontWeight: 600,
                display: "block",
                marginTop: 2,
              }}
            >
              {game ? (
                <span>
                  Đang sửa:{" "}
                  <b style={{ color: currentConfig.color }}>
                    {game.name || "Chưa đặt tên 🌸"}
                  </b>
                </span>
              ) : (
                "Thêm các câu hỏi ngọt ngào và thử thách thú vị cho bé nhé!"
              )}
            </Text>
          </div>
        </Space>

        {/* Action switch back */}
        <Button
          type="default"
          icon={<ArrowLeft size={16} />}
          onClick={onBack}
          style={{
            borderRadius: 18,
            height: 42,
            fontWeight: 700,
            color: "#6B5B7B",
            background: "#FAF7F5",
            borderColor: "#E9D5FF",
            padding: "0 18px",
            boxShadow: "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#F3E8FF";
            e.currentTarget.style.color = "#9333EA";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FAF7F5";
            e.currentTarget.style.color = "#6B5B7B";
          }}
        >
          Đổi dạng game
        </Button>
      </div>

      {/* 2. EDITOR CONTENT WRAPPER CHIBI */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 32,
          padding: "28px 24px",
          border: "2.5px solid #FFF0F5",
          boxShadow: "0 12px 32px rgba(244, 114, 182, 0.05)",
        }}
      >
        {renderEditor()}
      </div>
    </div>
  );
};

export default GameBuilder;
