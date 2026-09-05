import React from "react";
import { Pagination, Select, Typography } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// =========================================================
// COLORS — CHIBI PINK PASTEL PALETTE
// =========================================================

const COLORS = {
  primary: "#EC4899",
  primaryLight: "#FDF2F8",
  border: "#FBCFE8",
  textDark: "#1E293B",
  textMuted: "#64748B",
};

const TablePagination = ({
  current = 1,
  pageSize = 10,
  total = 0,
  onChange,
  onPageSizeChange,
}) => {
  // =========================================================
  // SAFE VALUES
  // =========================================================

  const safeTotal = Number.isFinite(Number(total))
    ? Math.max(0, Number(total))
    : 0;

  const safePageSize =
    Number.isFinite(Number(pageSize)) && Number(pageSize) > 0
      ? Number(pageSize)
      : 10;

  const safeCurrent =
    Number.isFinite(Number(current)) && Number(current) > 0
      ? Number(current)
      : 1;

  const totalPages = safeTotal > 0 ? Math.ceil(safeTotal / safePageSize) : 1;

  const safePage = Math.min(Math.max(1, safeCurrent), totalPages);

  const start = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;

  const end =
    safeTotal === 0 ? 0 : Math.min(safePage * safePageSize, safeTotal);

  return (
    <>
      <style>
        {`
          /* =====================================================
             CONTAINER
          ===================================================== */

          .chibi-pagination-container {
            width: 100%;
            box-sizing: border-box;
          }

          /* =====================================================
             TOP INFO
          ===================================================== */

          .chibi-pagination-info {
            display: flex;
            align-items: center;
            min-width: 0;
            flex: 1 1 auto;
          }

          .chibi-pagination-info-text {
            min-width: 0;
          }

          .chibi-pagination-info-title {
            white-space: nowrap;
          }

          /* =====================================================
             PAGINATION
          ===================================================== */

          .chibi-pink-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 0;
          }

          .chibi-pink-pagination .ant-pagination {
            margin: 0 !important;
          }

          .chibi-pink-pagination .ant-pagination-item {
            border-radius: 14px !important;
            border: 2px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            font-weight: 700;
            font-family: 'Nunito', 'Quicksand', sans-serif;
            transition:
              all 0.25s cubic-bezier(
                0.175,
                0.885,
                0.32,
                1.275
              );
            box-shadow:
              0 3px 6px rgba(236, 72, 153, 0.04);
          }

          .chibi-pink-pagination .ant-pagination-item a {
            color: ${COLORS.textMuted} !important;
          }

          .chibi-pink-pagination
            .ant-pagination-item-active {
            background-color: ${COLORS.primary} !important;
            border-color: ${COLORS.primary} !important;
            transform: scale(1.05);
            box-shadow:
              0 6px 16px rgba(236, 72, 153, 0.3) !important;
          }

          .chibi-pink-pagination
            .ant-pagination-item-active a {
            color: #FFFFFF !important;
          }

          .chibi-pink-pagination
            .ant-pagination-item:hover:not(
              .ant-pagination-item-active
            ) {
            border-color: ${COLORS.primary} !important;
            background-color: ${COLORS.primaryLight} !important;
          }

          .chibi-pink-pagination
            .ant-pagination-item:hover a {
            color: ${COLORS.primary} !important;
          }

          /* Prev / Next */

          .chibi-pink-pagination
            .ant-pagination-prev,
          .chibi-pink-pagination
            .ant-pagination-next {
            border-radius: 14px !important;
            border: 2px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            transition: all 0.2s ease;
          }

          .chibi-pink-pagination
            .ant-pagination-prev:hover,
          .chibi-pink-pagination
            .ant-pagination-next:hover {
            border-color: ${COLORS.primary} !important;
            background-color: ${COLORS.primaryLight} !important;
          }

          /* Disabled */

          .chibi-pink-pagination
            .ant-pagination-disabled {
            opacity: 0.45;
          }

          /* =====================================================
             PAGE SIZE
          ===================================================== */

          .chibi-pagination-size {
            display: flex;
            align-items: center;
            flex: 0 0 auto;
          }

          .chibi-pink-select {
            min-width: 120px;
          }

          .chibi-pink-select .ant-select-selector {
            border-radius: 14px !important;
            border: 2px solid ${COLORS.border} !important;
            background: #FFFFFF !important;
            font-weight: 600 !important;
            font-family:
              'Nunito',
              'Quicksand',
              sans-serif !important;
            box-shadow:
              0 3px 6px rgba(236, 72, 153, 0.04);
            transition: all 0.2s ease;
          }

          .chibi-pink-select:hover
            .ant-select-selector,
          .chibi-pink-select.ant-select-focused
            .ant-select-selector {
            border-color: ${COLORS.primary} !important;
            box-shadow:
              0 0 0 4px rgba(236, 72, 153, 0.12) !important;
          }

          /* =====================================================
             TABLET
          ===================================================== */

          @media (max-width: 900px) {
            .chibi-pagination-container {
              padding: 14px 16px !important;
              border-radius: 20px !important;
            }

            .chibi-pagination-info {
              flex: 1 1 100%;
            }

            .chibi-pink-pagination {
              flex: 1 1 auto;
            }

            .chibi-pagination-size {
              flex: 0 0 auto;
            }
          }

          /* =====================================================
             MOBILE
          ===================================================== */

          @media (max-width: 600px) {
            .chibi-pagination-container {
              margin-top: 14px !important;
              padding: 14px !important;
              border-radius: 18px !important;
              gap: 14px !important;
            }

            /* Info */

            .chibi-pagination-info {
              width: 100%;
              flex: 1 1 100%;
            }

            .chibi-pagination-icon {
              width: 40px !important;
              height: 40px !important;
              min-width: 40px !important;
              border-radius: 14px !important;
              font-size: 16px !important;
            }

            .chibi-pagination-info-title {
              font-size: 14px !important;
            }

            .chibi-pagination-info-subtitle {
              font-size: 12px !important;
            }

            /* Pagination */

            .chibi-pink-pagination {
              width: 100%;
              flex: 1 1 100%;
              overflow: hidden;
            }

            .chibi-pink-pagination
              .ant-pagination {
              width: 100%;
              justify-content: center;
              flex-wrap: nowrap;
            }

            .chibi-pink-pagination
              .ant-pagination-item {
              margin-inline-end: 4px !important;
              border-radius: 11px !important;
            }

            .chibi-pink-pagination
              .ant-pagination-prev,
            .chibi-pink-pagination
              .ant-pagination-next {
              margin-inline-end: 4px !important;
              border-radius: 11px !important;
            }

            .chibi-pink-pagination
              .ant-pagination-jump-prev,
            .chibi-pink-pagination
              .ant-pagination-jump-next {
              margin-inline-end: 4px !important;
            }

            /* Page size */

            .chibi-pagination-size {
              width: 100%;
              flex: 1 1 100%;
              justify-content: space-between;
            }

            .chibi-pagination-size
              .chibi-page-size-label {
              font-size: 13px !important;
            }

            .chibi-pink-select {
              width: 140px !important;
              min-width: 140px !important;
            }
          }

          /* =====================================================
             SMALL MOBILE
          ===================================================== */

          @media (max-width: 400px) {
            .chibi-pagination-container {
              padding: 12px !important;
            }

            .chibi-pagination-info {
              gap: 10px !important;
            }

            .chibi-pagination-info-title {
              font-size: 13px !important;
            }

            .chibi-pagination-info-subtitle {
              font-size: 11px !important;
            }

            .chibi-pagination-icon {
              width: 36px !important;
              height: 36px !important;
              min-width: 36px !important;
              border-radius: 12px !important;
            }

            .chibi-pink-pagination
              .ant-pagination-item,
            .chibi-pink-pagination
              .ant-pagination-prev,
            .chibi-pink-pagination
              .ant-pagination-next {
              width: 32px !important;
              min-width: 32px !important;
              height: 32px !important;
              line-height: 28px !important;
              margin-inline-end: 3px !important;
            }

            .chibi-pink-pagination
              .ant-pagination-item {
              font-size: 12px !important;
            }

            .chibi-pink-pagination
              .ant-pagination-prev
              > *,
            .chibi-pink-pagination
              .ant-pagination-next
              > * {
              width: 32px !important;
              height: 32px !important;
            }

            .chibi-pink-select {
              width: 125px !important;
              min-width: 125px !important;
            }
          }

          /* =====================================================
             VERY SMALL SCREEN
          ===================================================== */

          @media (max-width: 330px) {
            .chibi-pink-pagination
              .ant-pagination-item {
              display: none;
            }

            .chibi-pink-pagination
              .ant-pagination-item-active {
              display: block;
            }

            .chibi-pink-pagination
              .ant-pagination-jump-prev,
            .chibi-pink-pagination
              .ant-pagination-jump-next {
              display: none;
            }
          }
        `}
      </style>

      <div
        className="chibi-pagination-container"
        style={{
          marginTop: 20,
          padding: "16px 24px",
          background: "#FFFDFD",
          borderRadius: 24,
          border: `2px solid ${COLORS.border}`,
          boxShadow: "0 10px 25px rgba(236, 72, 153, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================
            LEFT INFO
        ===================================================== */}

        <div
          className="chibi-pagination-info"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            className="chibi-pagination-icon"
            style={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 16,
              background: COLORS.primaryLight,
              border: `2px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.primary,
              fontSize: 18,
              boxSizing: "border-box",
            }}
          >
            <DatabaseOutlined />
          </div>

          <div className="chibi-pagination-info-text">
            <Text
              strong
              className="chibi-pagination-info-title"
              style={{
                display: "block",
                color: COLORS.textDark,
                fontSize: 15,
                fontFamily: "Nunito, Quicksand, sans-serif",
                lineHeight: 1.5,
              }}
            >
              Hiển thị{" "}
              <span
                style={{
                  color: COLORS.primary,
                  fontWeight: 800,
                }}
              >
                {start}
              </span>{" "}
              –{" "}
              <span
                style={{
                  color: COLORS.primary,
                  fontWeight: 800,
                }}
              >
                {end}
              </span>
            </Text>

            <Text
              type="secondary"
              className="chibi-pagination-info-subtitle"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              Tổng số{" "}
              <span
                style={{
                  fontWeight: 700,
                  color: COLORS.textDark,
                }}
              >
                {safeTotal.toLocaleString("vi-VN")}
              </span>{" "}
              bản ghi 💕
            </Text>
          </div>
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="chibi-pink-pagination">
          <Pagination
            current={safePage}
            pageSize={safePageSize}
            total={safeTotal}
            showSizeChanger={false}
            showQuickJumper={false}
            responsive
            hideOnSinglePage={false}
            onChange={(page) => {
              onChange?.(page);
            }}
            itemRender={(page, type, originalElement) => {
              if (type === "prev") {
                return (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LeftOutlined
                      style={{
                        fontSize: 12,
                        color: COLORS.primary,
                      }}
                    />
                  </div>
                );
              }

              if (type === "next") {
                return (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <RightOutlined
                      style={{
                        fontSize: 12,
                        color: COLORS.primary,
                      }}
                    />
                  </div>
                );
              }

              return originalElement;
            }}
          />
        </div>

        {/* =====================================================
            PAGE SIZE
        ===================================================== */}

        <div className="chibi-pagination-size">
          <Text
            type="secondary"
            className="chibi-page-size-label"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: COLORS.textMuted,
            }}
          >
            Số dòng:
          </Text>

          <Select
            className="chibi-pink-select"
            value={safePageSize}
            style={{
              width: 120,
            }}
            options={[
              {
                value: 10,
                label: "10 / trang",
              },
              {
                value: 20,
                label: "20 / trang",
              },
              {
                value: 50,
                label: "50 / trang",
              },
              {
                value: 100,
                label: "100 / trang",
              },
            ]}
            onChange={(size) => {
              onPageSizeChange?.(size);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default TablePagination;
