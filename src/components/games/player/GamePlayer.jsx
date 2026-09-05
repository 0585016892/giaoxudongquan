import React, { useRef, useState, useEffect } from "react";
import { Button, Spin, Typography, Tooltip } from "antd";
import {
  ArrowLeft,
  Gamepad2,
  Maximize,
  Minimize,
  Play,
  Clock,
  HelpCircle,
  Trophy,
  Sparkles,
  Star,
  Smile,
} from "lucide-react";

import QuizPlayer from "./QuizGame";
import MatchingPlayer from "./MatchingGame";
import WheelPlayer from "./WheelGame";
import MemoryPlayer from "./MemoryGame";
import CrosswordPlayer from "./CrosswordGame";
import SortingPlayer from "./SortingGame";
import DragDropPlayer from "./DragDropGame";
import TrueFalsePlayer from "./TrueFalseGame";

const { Text, Title } = Typography;

const GAME_PLAYERS = {
  quiz: QuizPlayer,
  matching: MatchingPlayer,
  wheel: WheelPlayer,
  memory: MemoryPlayer,
  crossword: CrosswordPlayer,
  sorting: SortingPlayer,
  drag_drop: DragDropPlayer,
  true_false: TrueFalsePlayer,
};

const GamePlayer = ({ game, loading = false, onExit }) => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = () => {
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn("Không thể mở toàn màn hình:", err.message);
      });
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Lỗi khi thoát toàn màn hình:", err.message);
      });
    }
  };

  const handleStartGame = () => {
    setHasStarted(true);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#FFF4F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
        }}
      >
        <Spin size="large" />
        <Text style={{ color: "#7C3AED", fontWeight: 700, fontSize: 16 }}>
          Đang tải thế giới trò chơi... ✨
        </Text>
      </div>
    );
  }

  if (!game) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#FFF4F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
          fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
        }}
      >
        <div
          style={{
            background: "#FFEDD5",
            padding: 24,
            borderRadius: "50%",
            border: "4px solid #FDBA74",
          }}
        >
          <Gamepad2 size={64} color="#FB923C" strokeWidth={2.5} />
        </div>
        <Text style={{ fontSize: 18, fontWeight: 700, color: "#4B5563" }}>
          Hơ... Không tìm thấy trò chơi rồi! 😿
        </Text>
        <Button
          onClick={onExit}
          style={{
            borderRadius: 20,
            height: 44,
            fontWeight: 800,
            background: "#60A5FA",
            color: "#FFF",
            border: "none",
            boxShadow: "0 4px 0 #2563EB",
          }}
        >
          Quay lại màn chính
        </Button>
      </div>
    );
  }

  const PlayerComponent = GAME_PLAYERS[game.type];

  if (!PlayerComponent) {
    return (
      <div
        style={{
          minHeight: "80vh",
          background: "#FFF4F8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
        }}
      >
        <Gamepad2 size={64} color="#F43F5E" />
        <Text strong style={{ fontSize: 18, color: "#E11D48" }}>
          Loại game này chưa chuẩn bị xong! 🛠️
        </Text>
        <Text type="secondary">Mã loại: {game.type}</Text>
        <Button icon={<ArrowLeft size={16} />} onClick={onExit} shape="round">
          Quay lại
        </Button>
      </div>
    );
  }

  const questionCount = game?.questions?.length || 0;
  const timeLimit = game?.settings?.timeLimit || 30;

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "80vh",
        background: "#F5F3FF",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Fredoka', 'Baloo 2', 'Nunito', sans-serif",
      }}
    >
      {/* Dynamic Keyframe Animations */}
      <style>{`
        @keyframes floatCute {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
      `}</style>

      {/* MÀN HÌNH BẮT ĐẦU CHIBI */}
      {!hasStarted ? (
        <div
          style={{
            flex: 1,
            minHeight: "83vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background:
              "linear-gradient(135deg, #7C3AED 0%, #C084FC 50%, #F472B6 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Họa tiết Chibi Polka Dot trang trí */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.25) 3px, transparent 3px)",
              backgroundSize: "36px 36px",
              pointerEvents: "none",
            }}
          />

          {/* Các chi tiết bóng mây / lấp lánh trang trí nền */}
          <Star
            size={40}
            color="#FDE047"
            fill="#FDE047"
            style={{
              position: "absolute",
              top: "10%",
              left: "12%",
              animation: "floatCute 3s ease-in-out infinite",
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
            }}
          />
          <Sparkles
            size={48}
            color="#FFF"
            style={{
              position: "absolute",
              bottom: "15%",
              right: "10%",
              animation: "floatCute 4s ease-in-out infinite 1s",
            }}
          />

          {/* Card Chibi Pop-up Trung Tâm */}
          <div
            style={{
              maxWidth: 460,
              width: "100%",
              background: "#FFFFFF",
              borderRadius: 40,
              padding: "44px 32px 32px",
              border: "6px solid #F3E8FF",
              boxShadow:
                "0 20px 0px rgba(109, 40, 217, 0.3), 0 30px 50px rgba(0, 0, 0, 0.22)",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Mascot Avatar 3D Chibi Nổi */}
            <div
              style={{
                width: 104,
                height: 104,
                margin: "-96px auto 16px",
                borderRadius: "32px",
                background: "linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "6px solid #FFFFFF",
                boxShadow:
                  "0 8px 0px #D97706, 0 12px 24px rgba(245, 158, 11, 0.4)",
                animation: "floatCute 3s ease-in-out infinite",
              }}
            >
              <Gamepad2 size={54} color="#FFF" strokeWidth={2.5} />
            </div>

            {/* Tag Thách Thức Chibi */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                borderRadius: 99,
                background: "#FEF3C7",
                color: "#D97706",
                fontWeight: 900,
                fontSize: 13,
                marginBottom: 12,
                border: "2px solid #FDE047",
              }}
            >
              <Sparkles size={16} color="#F59E0B" fill="#F59E0B" />
              GIAO DIỆN CHÍNH THỨC
            </div>

            {/* Tên Game Chibi */}
            <Title
              level={2}
              style={{
                color: "#4C1D95",
                fontSize: 28,
                fontWeight: 900,
                margin: "0 0 20px 0",
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {game.name}
            </Title>

            {/* Bảng Thông Số Chibi (Pill Badges) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {/* Câu hỏi */}
              <div
                style={{
                  background: "#EFF6FF",
                  borderRadius: 24,
                  padding: "12px 6px",
                  border: "3px solid #BFDBFE",
                  boxShadow: "0 4px 0 #93C5FD",
                }}
              >
                <HelpCircle
                  size={22}
                  color="#3B82F6"
                  style={{ marginBottom: 2 }}
                />
                <div
                  style={{ color: "#1E40AF", fontWeight: 900, fontSize: 18 }}
                >
                  {questionCount}
                </div>
                <div
                  style={{ color: "#60A5FA", fontSize: 11, fontWeight: 800 }}
                >
                  Câu hỏi
                </div>
              </div>

              {/* Thời gian */}
              <div
                style={{
                  background: "#FEF2F2",
                  borderRadius: 24,
                  padding: "12px 6px",
                  border: "3px solid #FECACA",
                  boxShadow: "0 4px 0 #FCA5A5",
                }}
              >
                <Clock size={22} color="#EF4444" style={{ marginBottom: 2 }} />
                <div
                  style={{ color: "#991B1B", fontWeight: 900, fontSize: 18 }}
                >
                  {timeLimit}s
                </div>
                <div
                  style={{ color: "#F87171", fontSize: 11, fontWeight: 800 }}
                >
                  Mỗi câu
                </div>
              </div>

              {/* Điểm tối đa */}
              <div
                style={{
                  background: "#ECFDF5",
                  borderRadius: 24,
                  padding: "12px 6px",
                  border: "3px solid #A7F3D0",
                  boxShadow: "0 4px 0 #6EE7B7",
                }}
              >
                <Trophy size={22} color="#10B981" style={{ marginBottom: 2 }} />
                <div
                  style={{ color: "#065F46", fontWeight: 900, fontSize: 18 }}
                >
                  {questionCount * 10}
                </div>
                <div
                  style={{ color: "#34D399", fontSize: 11, fontWeight: 800 }}
                >
                  Điểm Max
                </div>
              </div>
            </div>

            {/* Các Nút Bấm Chibi 3D */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Nút Bắt đầu 3D Vàng */}
              <button
                onClick={handleStartGame}
                style={{
                  width: "100%",
                  height: 60,
                  borderRadius: 30,
                  border: "4px solid #FFF",
                  background:
                    "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: 20,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  boxShadow:
                    "0 7px 0 #047857, 0 12px 20px rgba(5, 150, 105, 0.4)",
                  transition: "all 0.1s ease",
                  letterSpacing: 0.5,
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(4px)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 0 #047857, 0 6px 10px rgba(5, 150, 105, 0.4)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow =
                    "0 7px 0 #047857, 0 12px 20px rgba(5, 150, 105, 0.4)";
                }}
              >
                <Play size={26} fill="#FFF" /> BẮT ĐẦU NGAY!
              </button>

              {/* Nút Thoát Chibi */}
              <button
                onClick={onExit}
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 24,
                  border: "none",
                  background: "#F3E8FF",
                  color: "#6B21A8",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 0 #E9D5FF",
                  transition: "all 0.1s ease",
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(2px)";
                  e.currentTarget.style.boxShadow = "0 2px 0 #E9D5FF";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow = "0 4px 0 #E9D5FF";
                }}
              >
                <ArrowLeft size={18} strokeWidth={2.5} /> Quay lại
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER TRONG GAME PHONG CÁCH CHIBI */}
          <div
            style={{
              height: 64,
              padding: "0 20px",
              background: "#FFFFFF",
              borderBottom: "4px solid #F3E8FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "sticky",
              top: 0,
              zIndex: 100,
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.08)",
            }}
          >
            {/* Nút thoát trong game */}
            <button
              onClick={onExit}
              style={{
                border: "none",
                background: "#FFE4E6",
                color: "#E11D48",
                fontWeight: 800,
                padding: "8px 16px",
                borderRadius: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 3px 0 #FECDD3",
              }}
            >
              <ArrowLeft size={16} strokeWidth={2.5} /> Thoát
            </button>

            {/* Title Game */}
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: "#5B21B6",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Smile size={22} color="#F59E0B" /> {game.name}
            </div>

            {/* Các nút công cụ */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Tooltip
                title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
              >
                <button
                  onClick={toggleFullscreen}
                  style={{
                    border: "none",
                    background: "#F3E8FF",
                    color: "#7C3AED",
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 3px 0 #DDD6FE",
                  }}
                >
                  {isFullscreen ? (
                    <Minimize size={20} strokeWidth={2.5} />
                  ) : (
                    <Maximize size={20} strokeWidth={2.5} />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* COMPONENT GAME */}
          <div style={{ flex: 1, background: "#F5F3FF" }}>
            <PlayerComponent game={game} onExit={onExit} />
          </div>
        </>
      )}
    </div>
  );
};

export default GamePlayer;
