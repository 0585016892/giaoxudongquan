import React, { useEffect, useState } from "react";
import {
  Layout,
  Dropdown,
  Space,
  Avatar,
  Typography,
  Badge,
  Tooltip,
  Button,
  ConfigProvider,
  notification,
  Empty,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CalendarOutlined,
  HistoryOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import { useUser } from "../context/UserContext";
import socket from "../socket/socket";

const { Header } = Layout;
const { Text } = Typography;

export default function AdminHeader({ collapsed, setCollapsed }) {
  const { user, logout } = useUser();
  const [notifyCount, setNotifyCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // 1. Lắng nghe Sự kiện Lịch lễ realtime
    socket.on("today_mass", (data) => {
      setNotifyCount((prev) => prev + 1);
      const newNotify = {
        id: `mass-${Date.now()}-${Math.random()}`,
        type: "today_mass",
        title: "Lịch phụng vụ hôm nay",
        content: data.message,
        created_at: new Date(),
      };
      setNotifications((prev) => [newNotify, ...prev]);

      notification.info({
        message: "Thông báo lịch lễ",
        description: data.message,
        placement: "topRight",
        duration: 5,
      });
    });

    // 2. Lắng nghe Sự kiện Nhật ký hoạt động quản trị realtime
    socket.on("activity_log", (data) => {
      setNotifyCount((prev) => prev + 1);
      const newNotify = {
        id: `log-${Date.now()}-${Math.random()}`,
        type: "activity",
        title: data.user || "Hệ thống",
        content: data.action,
        created_at: new Date(),
      };
      setNotifications((prev) => [newNotify, ...prev]);

      notification.success({
        message: data.user || "Nhật ký hệ thống",
        description: data.action,
        placement: "topRight",
      });
    });

    return () => {
      socket.off("today_mass");
      socket.off("activity_log");
    };
  }, []);

  const clearNotifications = () => {
    setNotifyCount(0);
  };

  // Hàm format thời gian thông báo ngắn gọn dễ nhìn
  const formatNotifyTime = (date) => {
    const diffMs = new Date() - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined style={{ fontSize: 14 }} />,
      label: <span style={{ fontWeight: 500 }}>Thông tin cá nhân</span>,
    },
    {
      key: "settings",
      icon: <SettingOutlined style={{ fontSize: 14 }} />,
      label: <span style={{ fontWeight: 500 }}>Cài đặt hệ thống</span>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: 14 }} />,
      label: <span style={{ fontWeight: 600 }}>Đăng xuất</span>,
      danger: true,
      onClick: logout,
    },
  ];

  // Giao diện khung Dropdown thông báo làm lại siêu đẹp
  const notificationDropdown = () => (
    <div
      style={{
        width: 380,
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafafa",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "15px", color: "#0f172a" }}>
            Trung tâm thông báo
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Cập nhật hoạt động & Phụng vụ Giáo xứ
          </Text>
        </div>
        {notifications.length > 0 && (
          <Button
            size="small"
            type="text"
            icon={<ClearOutlined />}
            onClick={clearNotifications}
            style={{ color: "#8c1515", fontWeight: 600, fontSize: "12px" }}
          >
            Đánh dấu đã đọc
          </Button>
        )}
      </div>

      {/* LIST ITEMS */}
      <div
        style={{ maxHeight: "380px", overflowY: "auto" }}
        className="custom-scrollbar"
      >
        {notifications.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <Empty
              description={
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Không có thông báo mới nào
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          notifications.map((item) => {
            const isMass = item.type === "today_mass";
            return (
              <div
                key={item.id}
                className="notify-item"
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: isMass ? "#fffbeb" : "#ffffff",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                <Space align="start" size={14}>
                  <Avatar
                    size={36}
                    style={{
                      backgroundColor: isMass ? "#ffe4e6" : "#e0f2fe",
                      color: isMass ? "#8c1515" : "#0284c7",
                      flexShrink: 0,
                      border: "none",
                    }}
                    icon={isMass ? <CalendarOutlined /> : <HistoryOutlined />}
                  />
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: "13px",
                        }}
                      >
                        {item.title}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatNotifyTime(item.created_at)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.content}
                    </div>
                  </div>
                </Space>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // Xử lý link avatar sạch đẹp chỉnh chu
  const userAvatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.REACT_APP_API_URL}${user.avatar}`
    : null;

  return (
    <ConfigProvider
      theme={{ token: { colorPrimary: "#8c1515", borderRadius: 10 } }}
    >
      <Header
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          borderBottom: "1px solid #e2e8f0",
          height: 64,
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* THANH ĐIỀU HƯỚNG BÊN TRÁI */}
        <Space size={16}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 38,
              height: 38,
              borderRadius: "8px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />

          <Space size={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8c1515 0%, #b31b1b 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "13px",
                boxShadow: "0 2px 8px rgba(140, 21, 21, 0.2)",
              }}
            >
              ĐQ
            </div>
            <Text
              strong
              style={{
                fontSize: "15px",
                color: "#0f172a",
                letterSpacing: "-0.3px",
              }}
            >
              Giáo xứ <span style={{ color: "#8c1515" }}>Đồng Quan</span>
            </Text>
          </Space>
        </Space>

        {/* CỤM ĐIỀU KHIỂN HỆ THỐNG BÊN PHẢI */}
        <Space size={14}>
          <Tooltip title="Hướng dẫn sử dụng">
            <Button
              type="text"
              shape="circle"
              icon={<QuestionCircleOutlined style={{ color: "#64748b" }} />}
            />
          </Tooltip>

          {/* CHUÔNG THÔNG BÁO BADGE REALTIME */}
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={notificationDropdown}
          >
            <Badge
              count={notifyCount}
              size="small"
              color="#ef4444"
              offset={[-2, 4]}
            >
              <Button
                type="text"
                shape="circle"
                className="action-btn"
                icon={
                  <BellOutlined style={{ fontSize: 18, color: "#475569" }} />
                }
              />
            </Badge>
          </Dropdown>

          {/* HỒ SƠ THÀNH VIÊN ĐANG ĐĂNG NHẬP */}
          <Dropdown
            menu={{ items: menuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div
              className="user-profile-trigger"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "5px 12px",
                borderRadius: "30px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#0f172a",
                    lineHeight: 1.2,
                  }}
                >
                  {user?.full_name || "Quản trị viên"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    marginTop: 2,
                    letterSpacing: "0.3px",
                  }}
                >
                  {user?.role === "priest" ? "Linh Mục" : "Hội Đồng Mục Vụ"}
                </div>
              </div>

              <Avatar
                size={32}
                src={userAvatarUrl}
                icon={<UserOutlined />}
                style={{
                  background:
                    user?.role === "priest"
                      ? "linear-gradient(135deg, #8c1515 0%, #b31b1b 100%)"
                      : "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </Dropdown>
        </Space>

        {/* STYLE NHÚNG CSS CHUYÊN NGHIỆP */}
        <style>{`
          .user-profile-trigger:hover {
            border-color: #cbd5e1 !important;
            background-color: #f8fafc !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          }
          .notify-item:hover {
            background-color: #f8fafc !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .ant-dropdown-menu {
            padding: 6px !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.08) !important;
            border: 1px solid #e2e8f0 !important;
          }
        `}</style>
      </Header>
    </ConfigProvider>
  );
}
