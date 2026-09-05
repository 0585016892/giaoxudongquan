import React from "react";
import { Modal, Space, Typography, Tag } from "antd";
import { CloseOutlined, HeartFilled } from "@ant-design/icons";
import AppButton from "./AppButton";

const { Text, Title } = Typography;

const AppFormModal = ({
  open,
  loading = false,
  confirmLoading = false,
  editing = false,
  width = 680,
  title,
  createTitle,
  editTitle,
  subtitle,
  icon,
  children,
  onCancel,
  onSubmit,
  onOk,
  okText,
  cancelText = "Hủy",
  createText = "Tạo mới ✨",
  editText = "Lưu thay đổi 💖",
  destroyOnClose = true,
  maskClosable = true,
  form,
  className = "",
  ...props
}) => {
  const isSubmitting = loading || confirmLoading;

  const resolveTitle = () => {
    if (editing) return editTitle || title || "Chỉnh Sửa Thông Tin";
    return createTitle || title || "Thêm Mới Dữ Liệu";
  };

  const finalTitle = resolveTitle();
  const finalOkText = okText || (editing ? editText : createText);

  const handleSubmit = () => {
    if (isSubmitting) return;
    if (onOk) {
      onOk();
      return;
    }
    if (form) {
      form.submit();
      return;
    }
    onSubmit?.();
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    onCancel?.();
  };

  return (
    <Modal
      open={open}
      width={width}
      centered
      destroyOnClose={destroyOnClose}
      maskClosable={!isSubmitting && maskClosable}
      closable={!isSubmitting}
      onCancel={handleCancel}
      className={`chibi-pastel-modal ${className}`}
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
          borderBottom: "1.5px dashed #FFE4E6",
          backgroundColor: "#FFF9FA",
        },
        body: {
          padding: "24px 26px",
          maxHeight: "calc(80vh - 140px)",
          overflowY: "auto",
          backgroundColor: "#FFFFFF",
        },
        footer: {
          marginTop: 0,
          padding: "16px 26px",
          borderTop: "1.5px dashed #FFE4E6",
          backgroundColor: "#FFF9FA",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 12,
        },
      }}
      footer={[
        <AppButton
          key="cancel"
          disabled={isSubmitting}
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
          {cancelText}
        </AppButton>,

        <AppButton
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
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
          {finalOkText}
        </AppButton>,
      ]}
      title={
        typeof finalTitle !== "string" ? (
          finalTitle
        ) : (
          <Space align="start" size={14}>
            {icon ? (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "#FFE4E6",
                  color: "#FF6B8B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                  border: "1.5px solid #FFC0CB",
                  boxShadow: "0 4px 10px rgba(255, 182, 193, 0.3)",
                }}
              >
                {icon}
              </div>
            ) : (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 16,
                  backgroundColor: "#FFE4E6",
                  color: "#FF6B8B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                <HeartFilled />
              </div>
            )}

            <div style={{ marginTop: 2 }}>
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
                  {finalTitle}
                </Title>

                <Tag
                  bordered={false}
                  style={{
                    borderRadius: 14,
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "2px 10px",
                    margin: 0,
                    backgroundColor: editing ? "#FEF3C7" : "#E0F2FE",
                    color: editing ? "#D97706" : "#0284C7",
                    border: editing ? "1px solid #FDE68A" : "1px solid #BAE6FD",
                  }}
                >
                  {editing ? "🌸 Chỉnh sửa" : "✨ Tạo mới"}
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
        )
      }
      {...props}
    >
      {children}
    </Modal>
  );
};

export default AppFormModal;
