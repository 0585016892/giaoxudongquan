import React from "react";
import {
  ReloadOutlined,
  PlusOutlined,
  CompassOutlined,
} from "@ant-design/icons";

import AppButton from "./AppButton";

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";

export default function PageHeroHeader({
  badge = "HỆ THỐNG ĐIỀU HÀNH MỤC VỤ",
  badgeIcon = <CompassOutlined />,
  title,
  description,

  // ===============================
  // REFRESH
  // ===============================
  showRefresh = true,
  onRefresh,
  refreshLoading = false,
  refreshText = "Làm mới",

  // ===============================
  // PRIMARY ACTION
  // ===============================
  showAction = true,
  actionText = "Thêm mới",
  actionIcon = <PlusOutlined />,
  onAction,
  actionLoading = false,

  // ===============================
  // CUSTOM ACTION
  // ===============================
  extra,

  className = "",
}) {
  return (
    <>
      <div className={`page-hero-header ${className}`}>
        {/* ===============================
            LEFT
        =============================== */}
        <div className="page-hero-header-content">
          {badge && (
            <span className="page-hero-badge">
              {badgeIcon}
              {badge}
            </span>
          )}

          <h1 className="page-hero-title">{title}</h1>

          {description && (
            <p className="page-hero-description">{description}</p>
          )}
        </div>

        {/* ===============================
            RIGHT
        =============================== */}
        <div className="page-hero-actions">
          {extra}

          {/* ===============================
              REFRESH
          =============================== */}
          {showRefresh && onRefresh && (
            <AppButton
              type="default"
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              loading={refreshLoading}
              className="page-hero-refresh-btn"
            >
              {refreshText}
            </AppButton>
          )}

          {/* ===============================
              PRIMARY ACTION
          =============================== */}
          {showAction && onAction && (
            <AppButton
              type="primary"
              icon={actionIcon}
              onClick={onAction}
              loading={actionLoading}
              className="page-hero-action-btn"
            >
              {actionText}
            </AppButton>
          )}
        </div>
      </div>

      {/* =====================================================
          COMMON HEADER STYLE
      ===================================================== */}

      <style>
        {`
          /* ===============================
             HEADER
          =============================== */

          .page-hero-header {
            width: 100%;

            display: flex;
            align-items: flex-end;
            justify-content: space-between;

            gap: 24px;

            margin-bottom: 28px;

            flex-wrap: wrap;

            font-family:
              "Be Vietnam Pro",
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          /* ===============================
             CONTENT
          =============================== */

          .page-hero-header-content {
            flex: 1;
            min-width: 280px;
          }

          /* ===============================
             BADGE
          =============================== */

          .page-hero-badge {
            display: inline-flex;
            align-items: center;

            gap: 7px;

            padding: 5px 14px;

            margin-bottom: 10px;

            border: 1px solid rgba(212, 175, 55, 0.65);

            border-radius: 999px;

            background:
              linear-gradient(
                135deg,
                rgba(212, 175, 55, 0.16),
                rgba(212, 175, 55, 0.06)
              );

            color: ${primaryNavy};

            font-size: 10px;
            font-weight: 700;

            line-height: 1.4;

            letter-spacing: 1.1px;

            white-space: nowrap;

            user-select: none;
          }

          .page-hero-badge .anticon {
            color: ${accentGold};

            font-size: 13px;
          }

          /* ===============================
             TITLE
          =============================== */

          .page-hero-title {
            margin: 0 !important;

            color: ${primaryNavy};

            font-family:
              "Playfair Display",
              Georgia,
              "Times New Roman",
              serif;

            font-size: clamp(25px, 3.2vw, 34px);

            font-weight: 700;

            line-height: 1.2;

            letter-spacing: -0.4px;
          }

          /* ===============================
             DESCRIPTION
          =============================== */

          .page-hero-description {
            max-width: 760px;

            margin: 7px 0 0;

            color: #64748b;

            font-size: 13px;

            font-weight: 400;

            line-height: 1.65;
          }

          /* ===============================
             ACTIONS
          =============================== */

          .page-hero-actions {
            display: flex;

            align-items: center;

            justify-content: flex-end;

            gap: 10px;

            flex-shrink: 0;
          }

          /* ===============================
             REFRESH BUTTON
             AppButton override
          =============================== */

          .page-hero-refresh-btn {
            min-width: 108px;

            height: 42px !important;

            border-radius: 10px !important;

            border: 1px solid
              rgba(27, 54, 93, 0.16) !important;

            background: #ffffff !important;

            color: ${primaryNavy} !important;

            box-shadow:
              0 2px 8px rgba(27, 54, 93, 0.04) !important;
          }

          .page-hero-refresh-btn:hover {
            color: ${primaryNavy} !important;

            border-color:
              rgba(27, 54, 93, 0.32) !important;

            background: #f8fafc !important;

            transform: translateY(-1px);

            box-shadow:
              0 6px 15px rgba(27, 54, 93, 0.08) !important;
          }

          /* ===============================
             REFRESH ICON
          =============================== */

          .page-hero-refresh-btn .anticon {
            font-size: 14px;

            transition:
              transform 0.35s ease;
          }

          .page-hero-refresh-btn:hover .anticon {
            transform: rotate(180deg);
          }

          /* ===============================
             PRIMARY BUTTON
             AppButton override
          =============================== */

          .page-hero-action-btn {
            min-width: 150px;

            height: 42px !important;

            border-radius: 10px !important;

            border: 1px solid
              ${primaryNavy} !important;

            background:
              ${primaryNavy} !important;

            color: #ffffff !important;

            box-shadow:
              0 5px 14px
              rgba(27, 54, 93, 0.18) !important;
          }

          .page-hero-action-btn:hover {
            background: #244777 !important;

            border-color: #244777 !important;

            color: #ffffff !important;

            transform: translateY(-1px);

            box-shadow:
              0 8px 19px
              rgba(27, 54, 93, 0.24) !important;
          }

          .page-hero-action-btn:active {
            background: #162f50 !important;

            border-color: #162f50 !important;

            transform: translateY(0);
          }

          /* ===============================
             PRIMARY ICON
          =============================== */

          .page-hero-action-btn .anticon {
            font-size: 14px;

            transition:
              transform 0.2s ease;
          }

          .page-hero-action-btn:hover .anticon {
            transform: scale(1.1);
          }

          /* ===============================
             MOBILE
          =============================== */

          @media (max-width: 768px) {
            .page-hero-header {
              align-items: flex-start;

              flex-direction: column;

              gap: 16px;

              margin-bottom: 24px;
            }

            .page-hero-header-content {
              width: 100%;

              min-width: 0;
            }

            .page-hero-actions {
              width: 100%;
            }

            .page-hero-actions > * {
              flex: 1;
            }

            .page-hero-refresh-btn,
            .page-hero-action-btn {
              width: 100%;
            }
          }

          /* ===============================
             SMALL MOBILE
          =============================== */

          @media (max-width: 480px) {
            .page-hero-header {
              gap: 14px;

              margin-bottom: 20px;
            }

            .page-hero-badge {
              font-size: 9px;

              padding: 5px 11px;

              letter-spacing: 0.8px;
            }

            .page-hero-title {
              font-size: 25px;

              line-height: 1.25;
            }

            .page-hero-description {
              margin-top: 6px;

              font-size: 12.5px;

              line-height: 1.6;
            }

            .page-hero-actions {
              flex-direction: column;

              gap: 8px;
            }

            .page-hero-actions > * {
              width: 100%;

              flex: none;
            }

            .page-hero-refresh-btn,
            .page-hero-action-btn {
              height: 40px !important;
            }
          }
        `}
      </style>
    </>
  );
}
