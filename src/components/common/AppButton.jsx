import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const primaryNavy = "#1B365D";

export default function AppButton({
  children = "Thêm mới",
  type = "primary",
  icon = <PlusOutlined />,
  onClick,
  loading = false,
  disabled = false,
  danger = false,
  size = "middle",
  block = false,
  className = "",
  htmlType = "button",
  ...props
}) {
  return (
    <>
      <Button
        type={type}
        icon={icon}
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        danger={danger}
        size={size}
        block={block}
        htmlType={htmlType}
        className={`faith-app-button faith-app-button-${type} ${className}`}
        {...props}
      >
        {children}
      </Button>

      <style>
        {`
          .faith-app-button {
            height: 42px !important;
            padding: 0 17px !important;

            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px;

            border-radius: 10px !important;

            font-family:
              "Be Vietnam Pro",
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif !important;

            font-size: 13px !important;
            font-weight: 600 !important;

            transition:
              all 0.2s ease,
              transform 0.2s ease !important;
          }

          /* =========================
             PRIMARY
          ========================= */

          .faith-app-button-primary {
            background: ${primaryNavy} !important;
            border-color: ${primaryNavy} !important;
            color: #fff !important;

            box-shadow:
              0 5px 14px rgba(27, 54, 93, 0.16);
          }

          .faith-app-button-primary:hover {
            background: #244777 !important;
            border-color: #244777 !important;
            color: #fff !important;

            transform: translateY(-1px);

            box-shadow:
              0 8px 18px rgba(27, 54, 93, 0.22);
          }

          .faith-app-button-primary:active {
            background: #162f50 !important;
            border-color: #162f50 !important;

            transform: translateY(0);
          }

          /* =========================
             DEFAULT
          ========================= */

          .faith-app-button-default {
            background: #fff !important;
            border: 1px solid rgba(27, 54, 93, 0.16) !important;
            color: ${primaryNavy} !important;

            box-shadow:
              0 2px 7px rgba(27, 54, 93, 0.04);
          }

          .faith-app-button-default:hover {
            background: #f8fafc !important;
            border-color: rgba(27, 54, 93, 0.3) !important;
            color: ${primaryNavy} !important;

            transform: translateY(-1px);

            box-shadow:
              0 6px 14px rgba(27, 54, 93, 0.08);
          }

          /* =========================
             TEXT
          ========================= */

          .faith-app-button-text {
            border: none !important;
            background: transparent !important;
            color: ${primaryNavy} !important;
            box-shadow: none !important;
          }

          .faith-app-button-text:hover {
            background: rgba(27, 54, 93, 0.05) !important;
            color: ${primaryNavy} !important;
          }

          /* =========================
             ICON
          ========================= */

          .faith-app-button .anticon {
            font-size: 14px;
            transition: transform 0.2s ease;
          }

          .faith-app-button:hover .anticon {
            transform: scale(1.08);
          }

          /* =========================
             DANGER
          ========================= */

          .faith-app-button-danger {
            box-shadow:
              0 4px 12px rgba(220, 38, 38, 0.12);
          }

          /* =========================
             DISABLED
          ========================= */

          .faith-app-button:disabled,
          .faith-app-button.ant-btn-disabled {
            opacity: 0.5;
            transform: none !important;
            box-shadow: none !important;
          }

          /* =========================
             MOBILE
          ========================= */

          @media (max-width: 480px) {
            .faith-app-button {
              height: 40px !important;
              padding: 0 14px !important;
            }
          }
        `}
      </style>
    </>
  );
}
