import React from "react";
import { Col, Row, Typography } from "antd";
import {
  Check,
  HelpCircle,
  Puzzle,
  Disc,
  Brain,
  Grid2x2,
  ArrowUpDown,
  Hand,
  CheckCheck,
  Gamepad2,
  Sparkles,
} from "lucide-react";

const { Title, Text } = Typography;

// Map icon Lucide tương ứng với từng loại game
const ICON_MAP = {
  quiz: HelpCircle,
  matching: Puzzle,
  wheel: Disc,
  memory: Brain,
  crossword: Grid2x2,
  sorting: ArrowUpDown,
  drag_drop: Hand,
  true_false: CheckCheck,
};

const GameTypeSelector = ({ types = [], value, onChange }) => {
  return (
    <div
      style={{
        padding: "16px 8px",
        fontFamily: "'Quicksand', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* HEADER SECTION CHIBI */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#FAF5FF",
            padding: "6px 16px",
            borderRadius: 20,
            border: "1.5px solid #E9D5FF",
            marginBottom: 10,
          }}
        >
          <Sparkles size={18} style={{ color: "#A855F7" }} />
          <Text style={{ fontWeight: 700, color: "#9333EA", fontSize: 13 }}>
            Thử thách đáng yêu
          </Text>
        </div>
        <Title
          level={3}
          style={{
            margin: "4px 0 8px 0",
            fontSize: 24,
            fontWeight: 800,
            color: "#3B2F4C",
          }}
        >
          Chọn dạng trò chơi bé thích ✨
        </Title>
        <Text style={{ color: "#827093", fontSize: 14, fontWeight: 500 }}>
          Mỗi mini-game mang đến một phong cách học tập siêu vui và hào hứng!
        </Text>
      </div>

      {/* GAME TYPES GRID */}
      <Row gutter={[20, 20]}>
        {types.map((type) => {
          const isSelected = value === type.key;
          const themeColor = type.color || "#A855F7";
          const bgColor = type.bgColor || "#FAF5FF";
          const borderColor = type.borderColor || "#E9D5FF";

          // Lấy Icon component từ MAP
          const IconComponent = ICON_MAP[type.key] || Gamepad2;

          return (
            <Col xs={24} sm={12} md={8} lg={6} key={type.key}>
              <div
                onClick={() => onChange(type.key)}
                style={{
                  position: "relative",
                  height: "100%",
                  borderRadius: 28, // Bo tròn chuẩn Chibi
                  padding: 22,
                  background: isSelected ? bgColor : "#FFFFFF",
                  border: isSelected
                    ? `2.5px solid ${themeColor}`
                    : `2px solid ${borderColor}`,
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: isSelected
                    ? `0 12px 28px ${themeColor}25`
                    : "0 6px 18px rgba(244, 114, 182, 0.04)",
                  transform: isSelected
                    ? "scale(1.03) translateY(-4px)"
                    : "scale(1)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = themeColor;
                    e.currentTarget.style.transform =
                      "scale(1.02) translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 10px 22px ${themeColor}18`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = borderColor;
                    e.currentTarget.style.transform = "scale(1) translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 18px rgba(244, 114, 182, 0.04)";
                  }
                }}
              >
                {/* ACTIVE CHECK BADGE CHIBI */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: themeColor,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 10px ${themeColor}40`,
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}

                <div>
                  {/* ICON CONTAINER PHONG CÁCH KẸO DẺO / CHIBI */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 22,
                      background: isSelected
                        ? `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`
                        : bgColor,
                      color: isSelected ? "#ffffff" : themeColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                      border: `1.5px solid ${isSelected ? "transparent" : borderColor}`,
                      boxShadow: isSelected
                        ? `0 8px 18px ${themeColor}35`
                        : "none",
                      transition: "all 0.3s ease",
                      fontSize: 28,
                    }}
                  >
                    {type.icon ? (
                      <span>{type.icon}</span>
                    ) : (
                      <IconComponent size={30} strokeWidth={2.3} />
                    )}
                  </div>

                  {/* TITLE */}
                  <div style={{ marginBottom: 6 }}>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 800,
                        color: "#3B2F4C",
                      }}
                    >
                      {type.name}
                    </Title>
                  </div>

                  {/* DESCRIPTION */}
                  <Text
                    style={{
                      color: "#827093",
                      fontSize: 13,
                      lineHeight: 1.5,
                      fontWeight: 500,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {type.description}
                  </Text>
                </div>

                {/* FOOTER INDICATOR CHIBI */}
                <div
                  style={{
                    marginTop: 18,
                    paddingTop: 12,
                    borderTop: `1.5px dashed ${borderColor}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSelected ? themeColor : "#A093AD",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isSelected ? "✨ Đang chọn rồi nè" : "Bấm chọn nha 🌸"}
                  </Text>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default GameTypeSelector;
