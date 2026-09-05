import React from "react";
import { Avatar, Modal, Space, Typography, Tag } from "antd";
import {
  EditOutlined,
  UserOutlined,
  CloseOutlined,
  HeartFilled,
} from "@ant-design/icons";
import AppButton from "./AppButton";

const { Text, Title } = Typography;

const AppDetailModal = ({
  open,
  loading = false,
  title = "Thông Tin Chi Tiết",
  subtitle = "Xem toàn bộ thông tin hồ sơ chi tiết",
  avatar,
  avatarIcon = <UserOutlined />,
  children,
  width = 800,
  onCancel,
  onEdit,
  editText = "Chỉnh sửa ✨",
  closeText = "Đóng",
  showEdit = true,
  showClose = true,
  extraHeader,
  className = "",
  ...props
}) => {
  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
  };

  const handleEdit = () => {
    if (loading) return;
    onEdit?.();
  };

  return (
    <Modal
      open={open}
      centered
      width={width}
      destroyOnClose
      maskClosable={!loading}
      closable={!loading}
      onCancel={handleCancel}
      className={`chibi-pastel-detail-modal ${className}`}
      closeIcon={
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FF6B8B",
            backgroundColor: "#FFE4E6",
            border: "1.5px solid #FFD1D9",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            cursor: "pointer",
          }}
          className="chibi-close-hover"
        >
          <CloseOutlined style={{ fontSize: 13, fontWeight: "bold" }} />
        </div>
      }
      styles={{
        content: {
          borderRadius: 28,
          padding: 0,
          boxShadow: "0 20px 40px rgba(255, 182, 193, 0.25)",
          border: "2px solid #FFE4E6",
          overflow: "hidden",
          background: "#FFFFFF",
        },
        header: {
          marginBottom: 0,
          padding: "20px 26px 16px",
          background: "#FFF9FA",
          borderBottom: "1.5px dashed #FFE4E6",
        },
        body: {
          padding: "24px 26px",
          maxHeight: "calc(80vh - 150px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        },
        footer: {
          marginTop: 0,
          padding: "16px 26px",
          background: "#FFF9FA",
          borderTop: "1.5px dashed #FFE4E6",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        },
      }}
      footer={[
        showClose && (
          <AppButton
            key="close"
            disabled={loading}
            onClick={handleCancel}
            variant="secondary"
            size="middle"
            style={{
              borderRadius: 20,
              background: "#F1F5F9",
              color: "#64748B",
              fontWeight: 700,
              border: "none",
            }}
          >
            {closeText}
          </AppButton>
        ),

        showEdit && (
          <AppButton
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            loading={loading}
            onClick={handleEdit}
            size="middle"
            style={{
              borderRadius: 20,
              background: "linear-gradient(135deg, #FF6B8B 0%, #FF8E9E 100%)",
              borderColor: "transparent",
              color: "#FFFFFF",
              fontWeight: 800,
              boxShadow: "0 6px 16px rgba(255, 107, 139, 0.3)",
            }}
          >
            {editText}
          </AppButton>
        ),
      ].filter(Boolean)}
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingRight: 28,
          }}
        >
          <Space align="center" size={14}>
            <Avatar
              size={50}
              src={avatar}
              icon={avatar ? undefined : avatarIcon}
              style={{
                backgroundColor: "#FFE4E6",
                color: "#FF6B8B",
                borderRadius: 20,
                border: "2px solid #FFC0CB",
                fontSize: 22,
                flexShrink: 0,
                boxShadow: "0 4px 10px rgba(255, 182, 193, 0.3)",
              }}
            />

            <div>
              <Space align="center" size={8}>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "#334155",
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: "24px",
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  {title}
                </Title>

                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 10px",
                    margin: 0,
                    backgroundColor: "#FFE4E6",
                    color: "#FF6B8B",
                    border: "1px solid #FFD1D9",
                  }}
                >
                  <HeartFilled style={{ fontSize: 10, marginRight: 4 }} />
                  Chi tiết
                </Tag>
              </Space>

              {subtitle && (
                <Text
                  style={{
                    display: "block",
                    marginTop: 3,
                    fontSize: 13,
                    color: "#94A3B8",
                    fontWeight: 600,
                    lineHeight: "18px",
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </div>
          </Space>

          {extraHeader && <div>{extraHeader}</div>}
        </div>
      }
      {...props}
    >
      {children}
    </Modal>
  );
};

export default AppDetailModal;
