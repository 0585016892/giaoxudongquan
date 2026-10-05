import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  message,
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
  CheckCircleOutlined,
} from "@ant-design/icons";

import { useUser } from "../../context/UserContext";
import socket from "../../socket/socket";
import {
  getNotificationsToday,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";
import HelpModal from "../../components/HelpModal";

const { Header } = Layout;
const { Text } = Typography;

// ==============================
// THEME
// ==============================
const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const DEFAULT_TITLE = "Giáo xứ Đồng Quan";

export default function AdminHeader({
  collapsed,
  setCollapsed,
  onOpenMobileMenu,
}) {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [notifyCount, setNotifyCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);

  // ==============================
  // FETCH NOTIFICATIONS
  // ==============================
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotificationsToday();
      const dataList = res?.data || [];

      setNotifications(dataList);
      setNotifyCount(dataList.filter((item) => !item.is_read).length);
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // ==============================
  // SOCKET NOTIFICATION
  // ==============================
  useEffect(() => {
    const handleNotification = (data) => {
      const standardizedData = {
        id: data.id || Date.now() + Math.random(),
        title: data.title || "Thông báo hệ thống",
        content: data.content || data.message || "",
        type: data.type || "system",
        is_read: false,
        created_at: data.created_at || new Date(),
      };

      setNotifyCount((prev) => prev + 1);
      setNotifications((prev) => [standardizedData, ...prev]);

      notification.info({
        message: standardizedData.title,
        description: standardizedData.content,
        placement: "topRight",
        icon:
          standardizedData.type === "today_mass" ? (
            <CalendarOutlined style={{ color: accentGold }} />
          ) : (
            <HistoryOutlined style={{ color: primaryNavy }} />
          ),
      });

      if (
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(standardizedData.title, {
          body: standardizedData.content,
          tag: "church-notification",
        });
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, []);

  // ==============================
  // BROWSER NOTIFICATION
  // ==============================
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((err) => {
        console.warn("Không thể xin quyền thông báo:", err);
      });
    }
  }, []);

  // ==============================
  // DOCUMENT TITLE
  // ==============================
  useEffect(() => {
    document.title =
      notifyCount > 0 ? `(${notifyCount}) Thông báo mới` : DEFAULT_TITLE;
  }, [notifyCount]);

  useEffect(() => {
    let interval = null;

    if (notifyCount > 0 && document.hidden) {
      interval = setInterval(() => {
        document.title =
          document.title === "🔔 Có thông báo mới!"
            ? DEFAULT_TITLE
            : "🔔 Có thông báo mới!";
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notifyCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title =
          notifyCount > 0 ? `(${notifyCount}) Thông báo mới` : DEFAULT_TITLE;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [notifyCount]);

  // ==============================
  // MARK ALL AS READ
  // ==============================
  const clearNotifications = async () => {
    try {
      await markAllNotificationsAsRead();

      setNotifyCount(0);
      document.title = DEFAULT_TITLE;

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: 1,
        })),
      );

      message.success("Đã đánh dấu đọc tất cả thông báo");
    } catch (err) {
      console.error("Lỗi cập nhật thông báo:", err);
      message.error("Lỗi khi cập nhật thông báo");
    }
  };

  // ==============================
  // FORMAT TIME
  // ==============================
  const formatNotifyTime = (date) => {
    if (!date) return "";

    const diffMs = new Date() - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==============================
  // USER MENU
  // ==============================
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined style={{ fontSize: "14px", color: primaryNavy }} />,
      label: (
        <span style={{ fontWeight: 600, color: textDark }}>
          Thông tin cá nhân
        </span>
      ),
    },
    {
      key: "settings",
      icon: (
        <SettingOutlined style={{ fontSize: "14px", color: primaryNavy }} />
      ),
      label: (
        <span style={{ fontWeight: 600, color: textDark }}>
          Cài đặt hệ thống
        </span>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: "14px" }} />,
      label: <span style={{ fontWeight: 700 }}>Đăng xuất</span>,
      danger: true,
    },
  ];

  // ==============================
  // NOTIFICATION DROPDOWN
  // ==============================
  const notificationDropdown = () => (
    <div className="dropdown-container">
      <div className="dropdown-header">
        <div className="dropdown-heading">
          <div className="dropdown-title">Trung Tâm Thông Báo</div>

          <Text className="dropdown-subtitle">
            Cập nhật hoạt động & Lịch mục vụ Giáo xứ
          </Text>
        </div>

        {notifyCount > 0 && (
          <Button
            size="small"
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={clearNotifications}
            className="btn-clear-all"
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      <div className="dropdown-body custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <Empty
              description={
                <span style={{ color: "#94a3b8" }}>
                  Chưa có thông báo mới nào
                </span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="notify-list-wrapper">
            {notifications.map((item) => {
              const isMass = item.type === "today_mass";

              return (
                <div
                  key={item.id}
                  className={`notify-card-item ${
                    !item.is_read ? "unread" : ""
                  } ${isMass ? "mass-type" : "sys-type"}`}
                >
                  {!item.is_read && <span className="unread-dot" />}

                  <Space align="start" size={12} style={{ width: "100%" }}>
                    <Avatar
                      size={36}
                      className={`notify-avatar ${isMass ? "mass" : "sys"}`}
                      icon={isMass ? <CalendarOutlined /> : <HistoryOutlined />}
                    />

                    <div className="notify-content-wrapper">
                      <div className="notify-item-meta">
                        <span className="notify-item-title">{item.title}</span>
                      </div>

                      <div className="notify-item-content">{item.content}</div>

                      <div
                        className="notify-item-meta"
                        style={{ marginTop: 4 }}
                      >
                        <span className="notify-item-time">
                          {formatNotifyTime(item.created_at)}
                        </span>
                      </div>
                    </div>
                  </Space>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ==============================
  // USER AVATAR
  // ==============================
  const userAvatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.REACT_APP_API_URL}${user.avatar}`
    : null;

  // ==============================
  // ROLE
  // ==============================
  const translateRole = (role) => {
    if (role === "priest") return "Linh mục Chánh xứ";
    if (role === "admin") return "Ban Quản Trị";
    return "Hội đồng Mục vụ";
  };

  // ==============================
  // MENU CLICK
  // ==============================
  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    } else if (key === "settings") {
      navigate("/settings");
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  // ==============================
  // RESPONSIVE MENU CLICK
  // ==============================
  const handleCollapseClick = () => {
    if (window.innerWidth < 768 && onOpenMobileMenu) {
      onOpenMobileMenu();
      return;
    }

    setCollapsed?.(!collapsed);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <Header className="editorial-header">
        {/* LEFT */}
        <div className="header-left">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleCollapseClick}
            className="btn-collapse"
            aria-label="Mở hoặc thu gọn menu"
          />

          <Space size={10} className="brand-wrapper">
            <div className="brand-logo-cube">ĐQ</div>

            <Text className="brand-text">
              Giáo xứ <span className="brand-highlight">Đồng Quan</span>
            </Text>
          </Space>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          <Tooltip title="Hướng dẫn sử dụng">
            <Button
              type="text"
              shape="circle"
              className="btn-action-icon help-button"
              icon={<QuestionCircleOutlined style={{ fontSize: "18px" }} />}
              onClick={() => setHelpOpen(true)}
            />
          </Tooltip>

          {/* NOTIFICATION */}
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={notificationDropdown}
            overlayClassName="editorial-dropdown-shadow"
            getPopupContainer={(trigger) =>
              trigger.parentElement || document.body
            }
          >
            <Badge
              count={notifyCount}
              size="small"
              color="#ef4444"
              offset={[-2, 6]}
            >
              <Button
                type="text"
                shape="circle"
                className={`btn-action-icon ${
                  notifyCount > 0 ? "has-notify" : ""
                }`}
                icon={<BellOutlined style={{ fontSize: "18px" }} />}
                aria-label="Thông báo"
              />
            </Badge>
          </Dropdown>

          <div className="divider-vertical hide-mobile" />

          {/* USER PROFILE */}
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="editorial-dropdown-shadow"
          >
            <div className="user-profile-badge">
              <div className="user-meta-info hide-mobile">
                <div className="user-name">
                  {user?.username || user?.full_name || "Quản trị viên"}
                </div>

                <div className={`user-role-tag ${user?.role || "staff"}`}>
                  {translateRole(user?.role)}
                </div>
              </div>

              <Avatar
                size={34}
                className={`user-avatar-main ${
                  user?.role === "priest" ? "priest" : "staff"
                }`}
                src={userAvatarUrl}
                icon={<UserOutlined />}
              />
            </div>
          </Dropdown>
        </div>

        <HelpModal open={helpOpen} onCancel={() => setHelpOpen(false)} />
      </Header>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

        /* ==============================
           HEADER BASE
        ============================== */

        .editorial-header {
          box-sizing: border-box;
          background: rgba(255, 255, 255, 0.92) !important;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          height: 64px;
          line-height: normal;
          border-bottom: 1px solid rgba(212, 175, 55, 0.25);
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .header-left,
        .header-right {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .header-left {
          flex: 1;
          gap: 18px;
          overflow: hidden;
        }

        .header-right {
          flex-shrink: 0;
          gap: 12px;
        }

        /* ==============================
           COLLAPSE BUTTON
        ============================== */

        .btn-collapse {
          flex-shrink: 0;
          font-size: 15px;
          width: 38px;
          height: 38px;
          min-width: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${softBg} !important;
          border: 1px solid rgba(27, 54, 93, 0.1) !important;
          color: ${primaryNavy};
          transition: all 0.2s ease;
        }

        .btn-collapse:hover {
          color: ${accentGold} !important;
          background: #ffffff !important;
          border-color: ${accentGold} !important;
        }

        /* ==============================
           BRAND
        ============================== */

        .brand-wrapper {
          min-width: 0;
          overflow: hidden;
          padding-left: 2px;
        }

        .brand-logo-cube {
          width: 34px;
          height: 34px;
          min-width: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.5px;
          background: linear-gradient(
            135deg,
            ${primaryNavy} 0%,
            #0f2342 100%
          );
          border: 1px solid ${accentGold};
          box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2);
          font-family: 'Playfair Display', serif;
        }

        .brand-text {
          display: block;
          min-width: 0;
          color: ${primaryNavy};
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brand-highlight {
          color: ${accentGold};
          font-weight: 700;
          font-family: 'Playfair Display', serif;
        }

        /* ==============================
           ACTION BUTTONS
        ============================== */

        .btn-action-icon {
          width: 38px;
          height: 38px;
          min-width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${primaryNavy};
          background: transparent;
          transition: all 0.2s ease;
          border-radius: 10px;
        }

        .btn-action-icon:hover {
          background: rgba(27, 54, 93, 0.06) !important;
          color: ${accentGold} !important;
        }

        .btn-action-icon.has-notify {
          color: ${accentGold};
        }

        .divider-vertical {
          width: 1px;
          height: 22px;
          background: rgba(27, 54, 93, 0.12);
          margin: 0 4px;
        }

        /* ==============================
           USER PROFILE
        ============================== */

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 4px 6px 4px 14px;
          border-radius: 100px;
          transition: all 0.2s ease;
          border: 1px solid rgba(212, 175, 55, 0.3);
          background: #ffffff;
          flex-shrink: 0;
        }

        .user-profile-badge:hover {
          border-color: ${accentGold};
          background: ${softBg};
          box-shadow: 0 4px 14px rgba(27, 54, 93, 0.08);
        }

        .user-meta-info {
          text-align: right;
          line-height: 1.3;
          min-width: 0;
        }

        .user-name {
          max-width: 180px;
          font-weight: 700;
          font-size: 13px;
          color: ${primaryNavy};
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-top: 1px;
          white-space: nowrap;
        }

        .user-role-tag.priest {
          color: ${accentGold};
        }

        .user-role-tag.admin {
          color: ${primaryNavy};
        }

        .user-role-tag.staff {
          color: #64748b;
        }

        .user-avatar-main.priest {
          background: linear-gradient(
            135deg,
            ${accentGold} 0%,
            #b38f24 100%
          );
          border: 1px solid ${accentGold};
        }

        .user-avatar-main.staff {
          background: linear-gradient(
            135deg,
            ${primaryNavy} 0%,
            #0f2342 100%
          );
        }

        /* ==============================
           NOTIFICATION DROPDOWN
        ============================== */

        .dropdown-container {
          width: 380px;
          max-width: calc(100vw - 24px);
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          overflow: hidden;
          box-shadow: 0 20px 30px -5px rgba(27, 54, 93, 0.12);
        }

        .dropdown-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(27, 54, 93, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          background: ${softBg};
        }

        .dropdown-heading {
          min-width: 0;
        }

        .dropdown-title {
          font-weight: 700;
          font-size: 15px;
          color: ${primaryNavy};
          font-family: 'Playfair Display', serif;
        }

        .dropdown-subtitle {
          font-size: 12px;
          color: #64748b;
          display: block;
          margin-top: 1px;
        }

        .btn-clear-all {
          flex-shrink: 0;
          color: ${primaryNavy} !important;
          font-weight: 700;
          font-size: 12px;
          padding: 0 4px;
        }

        .btn-clear-all:hover {
          color: ${accentGold} !important;
        }

        .dropdown-body {
          max-height: 360px;
          overflow-y: auto;
        }

        .notify-list-wrapper {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .notify-card-item {
          padding: 12px 14px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid rgba(27, 54, 93, 0.06);
          transition: all 0.2s ease;
          position: relative;
        }

        .notify-card-item:hover {
          background: ${softBg} !important;
          border-color: rgba(212, 175, 55, 0.3);
        }

        .notify-card-item.unread.mass-type {
          background: #fffdf5;
          border-color: rgba(212, 175, 55, 0.3);
        }

        .notify-card-item.unread.sys-type {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .unread-dot {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 7px;
          height: 7px;
          background-color: #ef4444;
          border-radius: 50%;
        }

        .notify-avatar.mass {
          background: rgba(212, 175, 55, 0.15);
          color: ${primaryNavy};
          border: 1px solid ${accentGold};
          flex-shrink: 0;
        }

        .notify-avatar.sys {
          background: rgba(27, 54, 93, 0.1);
          color: ${primaryNavy};
          flex-shrink: 0;
        }

        .notify-content-wrapper {
          width: 100%;
          min-width: 0;
        }

        .notify-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .notify-item-title {
          font-weight: 700;
          color: ${primaryNavy};
          font-size: 13px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notify-item-time {
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
        }

        .notify-item-content {
          font-size: 12.5px;
          color: #475569;
          margin-top: 3px;
          line-height: 1.45;
          overflow-wrap: anywhere;
        }

        .empty-state {
          padding: 40px 0;
          text-align: center;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 20px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${accentGold};
        }

        /* ==============================
           TABLET
        ============================== */

        @media (max-width: 991px) {
          .editorial-header {
            padding: 0 16px;
          }

          .header-left {
            gap: 12px;
          }

          .header-right {
            gap: 6px;
          }

          .brand-text {
            font-size: 14px;
          }

          .user-profile-badge {
            gap: 0;
            padding: 3px;
            border: none;
            background: transparent;
          }

          .user-profile-badge:hover {
            background: rgba(27, 54, 93, 0.06);
            box-shadow: none;
          }
        }

        /* ==============================
           MOBILE
        ============================== */

        @media (max-width: 767px) {
          .editorial-header {
            height: 58px;
            min-height: 58px;
            padding: 0 10px;
            gap: 6px;
          }

          .header-left {
            gap: 8px;
          }

          .header-right {
            gap: 2px;
          }

          .btn-collapse {
            width: 34px;
            height: 34px;
            min-width: 34px;
            padding: 0;
            font-size: 16px;
          }

          .brand-wrapper {
            gap: 7px !important;
          }

          .brand-logo-cube {
            width: 32px;
            height: 32px;
            min-width: 32px;
            font-size: 11px;
          }

          .brand-text {
            max-width: 125px;
            font-size: 13px;
            letter-spacing: -0.3px;
          }

          .brand-highlight {
            font-size: 13px;
          }

          .btn-action-icon {
            width: 34px;
            height: 34px;
            min-width: 34px;
            padding: 0;
          }

          .btn-action-icon .anticon {
            font-size: 17px !important;
          }

          .user-profile-badge {
            padding: 0;
            margin-left: 2px;
          }

          .user-avatar-main {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px;
          }

          .hide-mobile {
            display: none !important;
          }

          .dropdown-container {
            width: calc(100vw - 20px);
            max-width: 380px;
            border-radius: 14px;
          }

          .dropdown-header {
            padding: 12px 14px;
            gap: 8px;
          }

          .dropdown-title {
            font-size: 14px;
          }

          .dropdown-subtitle {
            font-size: 11px;
          }

          .dropdown-body {
            max-height: min(55vh, 360px);
          }

          .notify-list-wrapper {
            padding: 8px;
            gap: 6px;
          }

          .notify-card-item {
            padding: 10px;
          }
        }

        /* ==============================
           SMALL MOBILE
        ============================== */

        @media (max-width: 380px) {
          .editorial-header {
            padding: 0 7px;
          }

          .header-left {
            gap: 5px;
          }

          .header-right {
            gap: 0;
          }

          .brand-text {
            max-width: 105px;
            font-size: 12px;
          }

          .brand-highlight {
            font-size: 12px;
          }

          .btn-collapse,
          .btn-action-icon {
            width: 32px;
            height: 32px;
            min-width: 32px;
          }

          .user-avatar-main {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px;
          }
        }
      `}</style>
    </ConfigProvider>
  );
}
