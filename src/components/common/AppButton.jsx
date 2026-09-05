import React from "react";
import { Button } from "antd";

/**
 * Modern Slate Design Tokens
 */
const BUTTON_STYLES = {
  primary: {
    bg: "#0F172A",
    color: "#FFFFFF",
    border: "#0F172A",
    hoverBg: "#1E293B",
    hoverBorder: "#1E293B",
    activeBg: "#020617",
    shadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
    hoverShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
  },
  secondary: {
    bg: "#F1F5F9",
    color: "#334155",
    border: "transparent",
    hoverBg: "#E2E8F0",
    hoverBorder: "transparent",
    activeBg: "#CBD5E1",
    shadow: "none",
    hoverShadow: "none",
  },
  danger: {
    bg: "#FEF2F2",
    color: "#DC2626",
    border: "#FECACA",
    hoverBg: "#FEE2E2",
    hoverBorder: "#F87171",
    activeBg: "#FCA5A5",
    shadow: "none",
    hoverShadow: "0 4px 12px rgba(220, 38, 38, 0.12)",
  },
  ghost: {
    bg: "transparent",
    color: "#475569",
    border: "transparent",
    hoverBg: "#F8FAFC",
    hoverBorder: "transparent",
    activeBg: "#F1F5F9",
    shadow: "none",
    hoverShadow: "none",
  },
  default: {
    bg: "#FFFFFF",
    color: "#334155",
    border: "#E2E8F0",
    hoverBg: "#F8FAFC",
    hoverBorder: "#CBD5E1",
    activeBg: "#F1F5F9",
    shadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
    hoverShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
  },
};

const SIZES = {
  small: { height: 32, padding: "0 12px", fontSize: 13, radius: 8 },
  middle: { height: 40, padding: "0 16px", fontSize: 14, radius: 10 },
  large: { height: 48, padding: "0 20px", fontSize: 15, radius: 12 },
};

const AppButton = ({
  children,
  type = "default",
  variant, // "primary" | "secondary" | "outline" | "ghost" | "danger"
  icon,
  loading = false,
  disabled = false,
  size = "middle",
  danger = false,
  block = false,
  shape, // "circle" | "round"
  onClick,
  width,
  minWidth,
  htmlType = "button",
  style,
  className = "",
  ...props
}) => {
  // 1. Phân giải Variant
  const resolveVariant = () => {
    if (danger || variant === "danger") return "danger";
    if (type === "primary" || variant === "primary") return "primary";
    if (variant === "secondary") return "secondary";
    if (variant === "ghost" || type === "text") return "ghost";
    return "default";
  };

  const currentVariant = resolveVariant();
  const theme = BUTTON_STYLES[currentVariant];
  const sizeConfig = SIZES[size] || SIZES.middle;
  const isCircle = shape === "circle";

  // 2. Tính toán Style động qua Inline CSS Variables
  const dynamicVars = {
    "--btn-bg": theme.bg,
    "--btn-color": theme.color,
    "--btn-border": theme.border,
    "--btn-hover-bg": theme.hoverBg,
    "--btn-hover-border": theme.hoverBorder,
    "--btn-active-bg": theme.activeBg,
    "--btn-shadow": theme.shadow,
    "--btn-hover-shadow": theme.hoverShadow,
    "--btn-radius": isCircle
      ? "50%"
      : shape === "round"
        ? "999px"
        : `${sizeConfig.radius}px`,
    height: `${sizeConfig.height}px`,
    width: isCircle ? `${sizeConfig.height}px` : width,
    minWidth: isCircle ? `${sizeConfig.height}px` : minWidth,
    padding: isCircle ? 0 : sizeConfig.padding,
    fontSize: `${sizeConfig.fontSize}px`,
  };

  return (
    <Button
      htmlType={htmlType}
      icon={icon}
      loading={loading}
      disabled={disabled}
      block={block}
      onClick={onClick}
      shape={shape}
      className={`app-btn-slate ${className}`}
      style={{
        ...dynamicVars,
        ...style,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AppButton;
