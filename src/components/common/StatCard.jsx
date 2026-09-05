import React from "react";
import { Card, Col, Row, Skeleton, Typography } from "antd";

const { Text } = Typography;

const StatCard = ({
  title,
  value,
  suffix,
  description,
  icon,
  iconColor = "#FF6B8B", // Tông hồng pastel mặc định
  loading = false,
  trend, // { value: "+12.5%", isUp: true }
  className = "",
  style,
  ...props
}) => {
  return (
    <Card
      bordered={false}
      className={`chibi-stat-card ${className}`}
      style={{
        height: "100%",
        borderRadius: 24,
        background: "#FFFFFF",
        border: "2px solid #FFE4E6",
        boxShadow: "0 12px 28px rgba(255, 182, 193, 0.18)",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
        position: "relative",
        ...style,
      }}
      styles={{
        body: {
          padding: "20px 22px",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
        e.currentTarget.style.boxShadow =
          "0 20px 35px rgba(255, 182, 193, 0.35)";
        e.currentTarget.style.borderColor = "#FFB6C1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 12px 28px rgba(255, 182, 193, 0.18)";
        e.currentTarget.style.borderColor = "#FFE4E6";
      }}
      {...props}
    >
      <Row justify="space-between" align="top" gutter={12}>
        <Col flex="auto">
          {/* TITLE */}
          <Text
            style={{
              display: "block",
              color: "#94A3B8",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            {title}
          </Text>

          {/* VALUE */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginTop: 6,
              minHeight: 38,
            }}
          >
            {loading ? (
              <Skeleton.Input
                active
                size="small"
                style={{
                  width: 100,
                  height: 34,
                  borderRadius: 12,
                }}
              />
            ) : (
              <>
                <span
                  style={{
                    color: "#334155",
                    fontSize: 32,
                    lineHeight: 1,
                    fontWeight: 900,
                    letterSpacing: "-0.5px",
                    fontFamily: "'Fredoka', 'Quicksand', sans-serif",
                  }}
                >
                  {value}
                </span>

                {suffix && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#94A3B8",
                      fontFamily: "'Quicksand', sans-serif",
                    }}
                  >
                    {suffix}
                  </Text>
                )}
              </>
            )}
          </div>

          {/* TREND & DESCRIPTION */}
          {(description || trend) && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 10,
              }}
            >
              {trend && !loading && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 12,
                    color: trend.isUp ? "#0284C7" : "#E11D48",
                    background: trend.isUp ? "#E0F2FE" : "#FFE4E6",
                    border: trend.isUp
                      ? "1px solid #BAE6FD"
                      : "1px solid #FFD1D9",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {trend.isUp ? "✨ ↑" : "🌸 ↓"} {trend.value}
                </span>
              )}

              {description && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#94A3B8",
                    fontWeight: 600,
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {description}
                </Text>
              )}
            </div>
          )}
        </Col>

        {/* ICON BOX CHIBI */}
        {icon && (
          <Col>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FFF5F7",
                color: iconColor,
                fontSize: 22,
                flexShrink: 0,
                border: `2px solid ${iconColor}40`,
                boxShadow: `0 8px 18px ${iconColor}25`,
                transition: "transform 0.3s ease",
              }}
            >
              {icon}
            </div>
          </Col>
        )}
      </Row>

      {/* CHIBI SPARKLE DECORATION */}
      <div
        style={{
          position: "absolute",
          top: 6,
          right: 12,
          fontSize: 10,
          opacity: 0.3,
          pointerEvents: "none",
        }}
      >
        ✨
      </div>
    </Card>
  );
};

export default StatCard;
