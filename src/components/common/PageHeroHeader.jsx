import React from "react";
import { Row, Col, Space, Typography, Tooltip, Button, Popconfirm } from "antd";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";
import AppButton from "./AppButton"; // Đường dẫn AppButton trong project của bạn

const { Title, Text } = Typography;

const PageHeroHeader = ({
  icon,
  badgeText,
  title,
  description,

  // --- Props cho Bulk Delete (Xóa hàng loạt) ---
  selectedCount = 0,
  onBulkDelete,
  bulkDeleting = false,
  bulkDeleteTitle,
  bulkDeleteConfirmText = "Dữ liệu sau khi xóa không thể khôi phục.",

  // --- Props cho Refresh ---
  onRefresh,
  refreshLoading = false,
  refreshTooltip = "Làm mới dữ liệu",

  // --- Props cho Action chính (Tạo mới/Thêm) ---
  primaryButtonText,
  primaryButtonIcon,
  onPrimaryClick,
  primaryDisabled = false,
  primaryLoading = false,

  // --- Custom Extra ---
  extra,
}) => {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "20px 20px",
        marginBottom: 20,
        borderRadius: 24,
        background:
          "linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 50%, #FFE4E6 100%)",
        border: "2px solid #FFE4E6",
        boxShadow: "0 12px 28px rgba(255, 182, 193, 0.2)",
      }}
    >
      {/* Hiệu ứng bong bóng Chibi mờ */}
      <div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.6)",
          right: -40,
          top: -60,
          pointerEvents: "none",
        }}
      />

      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* BÊN TRÁI: Icon, Badge, Title, Description */}
        <Col xs={24} md={14} lg={16}>
          <Space align="start" size={14} style={{ width: "100%" }}>
            {icon && (
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: "#FF6B8B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  boxShadow: "0 8px 20px rgba(255, 107, 139, 0.35)",
                }}
              >
                {icon}
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              {badgeText && (
                <Text
                  style={{
                    display: "block",
                    color: "#FF6B8B",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    marginBottom: 2,
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {badgeText}
                </Text>
              )}

              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#334155",
                  fontWeight: 900,
                  fontSize: "calc(1.2rem + 0.4vw)",
                  lineHeight: 1.3,
                  fontFamily: "'Fredoka', 'Quicksand', sans-serif",
                  wordBreak: "break-word",
                }}
              >
                {title}
              </Title>

              {description && (
                <Text
                  style={{
                    display: "block",
                    marginTop: 4,
                    fontSize: 13,
                    color: "#94A3B8",
                    fontWeight: 600,
                  }}
                >
                  {description}
                </Text>
              )}
            </div>
          </Space>
        </Col>

        {/* BÊN PHẢI: Các nút hành động */}
        <Col xs={24} md={10} lg={8}>
          <Space
            size={10}
            wrap
            style={{
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            {/* 1. Nút Xóa hàng loạt */}
            {selectedCount > 0 && onBulkDelete && (
              <Popconfirm
                title={bulkDeleteTitle || `Xóa ${selectedCount} mục đã chọn?`}
                description={bulkDeleteConfirmText}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  loading: bulkDeleting,
                  style: { borderRadius: 10, fontWeight: 700 },
                }}
                cancelButtonProps={{
                  disabled: bulkDeleting,
                  style: { borderRadius: 10 },
                }}
                onConfirm={onBulkDelete}
              >
                <Button
                  danger
                  type="primary"
                  icon={<DeleteOutlined />}
                  loading={bulkDeleting}
                  disabled={primaryDisabled || bulkDeleting}
                  style={{
                    height: 40,
                    borderRadius: 14,
                    fontWeight: 800,
                    boxShadow: "0 6px 16px rgba(239, 68, 68, 0.25)",
                  }}
                >
                  {bulkDeleting ? "Đang xóa..." : `Xóa (${selectedCount})`}
                </Button>
              </Popconfirm>
            )}

            {/* 2. Nút Refresh */}
            {onRefresh && (
              <Tooltip title={refreshTooltip}>
                <Button
                  icon={<ReloadOutlined style={{ color: "#FF6B8B" }} />}
                  loading={refreshLoading}
                  onClick={onRefresh}
                  disabled={bulkDeleting}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: "#FFFFFF",
                    border: "1.5px solid #FFE4E6",
                    boxShadow: "0 4px 10px rgba(255, 182, 193, 0.15)",
                  }}
                />
              </Tooltip>
            )}

            {/* 3. Nút Action chính */}
            {primaryButtonText && (
              <AppButton
                type="primary"
                icon={primaryButtonIcon}
                onClick={onPrimaryClick}
                disabled={primaryDisabled || bulkDeleting}
                loading={primaryLoading}
                style={{
                  borderRadius: 14,
                  background: "#FF6B8B",
                  borderColor: "#FF6B8B",
                  height: 40,
                  padding: "0 16px",
                  fontWeight: 800,
                  boxShadow: "0 8px 18px rgba(255, 107, 139, 0.3)",
                }}
              >
                {primaryButtonText}
              </AppButton>
            )}

            {/* 4. Tuỳ chọn thêm các nút khác */}
            {extra}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default PageHeroHeader;
