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
  Grid,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  MenuOutlined,
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
const { useBreakpoint } = Grid;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const softBg = "#FAFAFA";

const DEFAULT_TITLE = "Giáo xứ Đồng Quan";

export default function AdminHeader({
  collapsed,
  setCollapsed,
  onOpenMobileMenu,
}) {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const screens = useBreakpoint();

  const isMobile = !screens.md;

  const [notifyCount, setNotifyCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);

  // FETCH NOTIFICATIONS
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

  // SOCKET NOTIFICATION
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

  // BROWSER NOTIFICATION
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch((err) => {
        console.warn("Không thể xin quyền thông báo:", err);
      });
    }
  }, []);

  // DOCUMENT TITLE
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

  // MARK ALL AS READ
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

  // FORMAT TIME
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

  // USER MENU
  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt hệ thống",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  // NOTIFICATION DROPDOWN
  const notificationDropdown = () => (
    <div className="ah-notification-panel">
      <div className="ah-notification-header">
        <div className="ah-notification-heading">
          <div className="ah-notification-title">Trung Tâm Thông Báo</div>

          <Text className="ah-notification-subtitle">
            Cập nhật hoạt động & Lịch mục vụ Giáo xứ
          </Text>
        </div>

        {notifyCount > 0 && (
          <Button
            size="small"
            type="text"
            icon={<CheckCircleOutlined />}
            onClick={clearNotifications}
            className="ah-clear-button"
          >
            Đọc tất cả
          </Button>
        )}
      </div>

      <div className="ah-notification-body">
        {notifications.length === 0 ? (
          <div className="ah-empty">
            <Empty
              description="Chưa có thông báo mới nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="ah-notification-list">
            {notifications.map((item) => {
              const isMass = item.type === "today_mass";

              return (
                <div
                  key={item.id}
                  className={`ah-notification-item ${
                    !item.is_read ? "unread" : ""
                  } ${isMass ? "mass" : "system"}`}
                >
                  {!item.is_read && <span className="ah-unread-dot" />}

                  <Space
                    align="start"
                    size={12}
                    className="ah-notification-row"
                  >
                    <Avatar
                      size={38}
                      className={`ah-notification-avatar ${
                        isMass ? "mass" : "system"
                      }`}
                      icon={isMass ? <CalendarOutlined /> : <HistoryOutlined />}
                    />

                    <div className="ah-notification-content">
                      <div className="ah-notification-item-title">
                        {item.title}
                      </div>

                      <div className="ah-notification-item-description">
                        {item.content}
                      </div>

                      <div className="ah-notification-time">
                        {formatNotifyTime(item.created_at)}
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

  // USER AVATAR
  const userAvatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${process.env.REACT_APP_API_URL}${user.avatar}`
    : null;

  // ROLE
  const translateRole = (role) => {
    if (role === "priest") return "Linh mục Chánh xứ";
    if (role === "admin") return "Ban Quản Trị";
    return "Hội đồng Mục vụ";
  };

  // MENU CLICK
  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      logout();
    } else if (key === "settings") {
      navigate("/settings");
    } else if (key === "profile") {
      navigate("/profile");
    }
  };

  // RESPONSIVE MENU
  const handleCollapseClick = () => {
    if (isMobile) {
      onOpenMobileMenu?.();
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
          fontFamily: "'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <Header className="editorial-header">
        {/* LEFT */}
        <div className="ah-left">
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={handleCollapseClick}
            className="ah-collapse-button"
            aria-label="Mở hoặc thu gọn menu"
          />

          <div className="ah-brand">
            <div className="ah-brand-logo">ĐQ</div>

            <div className="ah-brand-text">
              <span>Giáo xứ</span>
              <strong>Đồng Quan</strong>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="ah-right">
          <Tooltip title="Hướng dẫn sử dụng">
            <Button
              type="text"
              shape="circle"
              className="ah-action-button ah-help-button"
              icon={<QuestionCircleOutlined />}
              onClick={() => setHelpOpen(true)}
              aria-label="Hướng dẫn sử dụng"
            />
          </Tooltip>

          {/* NOTIFICATION */}
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            dropdownRender={notificationDropdown}
            overlayClassName="ah-dropdown-shadow"
            getPopupContainer={() => document.body}
          >
            <Badge
              count={notifyCount}
              size="small"
              color="#ef4444"
              offset={[-2, 5]}
              overflowCount={99}
            >
              <Button
                type="text"
                shape="circle"
                className={`ah-action-button ${
                  notifyCount > 0 ? "has-notify" : ""
                }`}
                icon={<BellOutlined />}
                aria-label="Thông báo"
              />
            </Badge>
          </Dropdown>

          <div className="ah-divider" />

          {/* USER PROFILE */}
          <Dropdown
            menu={{
              items: menuItems,
              onClick: handleMenuClick,
            }}
            placement="bottomRight"
            trigger={["click"]}
            overlayClassName="ah-dropdown-shadow"
          >
            <div className="ah-user-profile">
              <div className="ah-user-info">
                <div className="ah-user-name">
                  {user?.username || user?.full_name || "Quản trị viên"}
                </div>

                <div className="ah-user-role">{translateRole(user?.role)}</div>
              </div>

              <Avatar
                size={36}
                className={`ah-user-avatar ${
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
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');

        .editorial-header {
          box-sizing: border-box !important;
          width: 100%;
          height: 64px !important;
          min-height: 64px !important;
          padding: 0 24px !important;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 100;
          line-height: normal !important;
          background: rgba(255,255,255,.96) !important;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(212,175,55,.25);
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .ah-left,
        .ah-right {
          display: flex;
          align-items: center;
          min-width: 0;
          height: 100%;
        }

        .ah-left {
          flex: 1 1 auto;
          gap: 16px;
          overflow: hidden;
        }

        .ah-right {
          flex: 0 0 auto;
          justify-content: flex-end;
          gap: 10px;
        }

        .ah-collapse-button {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          padding: 0 !important;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: ${primaryNavy} !important;
          background: ${softBg} !important;
          border: 1px solid rgba(27,54,93,.1) !important;
          transition: .25s ease;
        }

        .ah-collapse-button .anticon {
          font-size: 17px;
        }

        .ah-collapse-button:hover {
          color: ${accentGold} !important;
          border-color: ${accentGold} !important;
          background: white !important;
        }

        .ah-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          overflow: hidden;
        }

        .ah-brand-logo {
          width: 36px;
          height: 36px;
          flex: 0 0 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: linear-gradient(135deg,#1B365D,#0F2342);
          color: #fff;
          border: 1px solid ${accentGold};
          font-family: 'Playfair Display',serif;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 3px 10px rgba(27,54,93,.15);
        }

        .ah-brand-text {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;
          white-space: nowrap;
          color: ${primaryNavy};
          font-size: 15px;
          font-weight: 600;
        }

        .ah-brand-text strong {
          color: ${accentGold};
          font-family: 'Playfair Display',serif;
          font-size: 17px;
          font-weight: 700;
        }

        .ah-action-button {
          width: 38px !important;
          height: 38px !important;
          min-width: 38px !important;
          padding: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px !important;
          color: ${primaryNavy} !important;
          background: transparent !important;
          transition: all .25s ease;
        }

        .ah-action-button .anticon {
          font-size: 18px;
        }

        .ah-action-button:hover {
          background: rgba(27,54,93,.07) !important;
          color: ${accentGold} !important;
        }

        .ah-action-button.has-notify {
          color: ${accentGold} !important;
        }

        .ah-divider {
          width: 1px;
          height: 26px;
          flex: 0 0 1px;
          background: rgba(27,54,93,.12);
          margin: 0 3px;
        }

        .ah-user-profile {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 5px 4px 13px;
          border: 1px solid rgba(212,175,55,.3);
          border-radius: 30px;
          background: #fff;
          cursor: pointer;
          transition: .25s ease;
          min-width: 0;
        }

        .ah-user-profile:hover {
          border-color: ${accentGold};
          background: ${softBg};
          box-shadow: 0 3px 12px rgba(27,54,93,.07);
        }

        .ah-user-info {
          min-width: 0;
          max-width: 180px;
          text-align: right;
          line-height: 1.35;
        }

        .ah-user-name {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 700;
          color: ${primaryNavy};
        }

        .ah-user-role {
          margin-top: 2px;
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }

        .ah-user-avatar {
          flex: 0 0 36px;
          border: 1px solid rgba(212,175,55,.5);
        }

        .ah-user-avatar.priest {
          background: linear-gradient(135deg,#D4AF37,#B38F24);
        }

        .ah-user-avatar.staff {
          background: linear-gradient(135deg,#1B365D,#0F2342);
        }

        .ah-dropdown-shadow {
          z-index: 1100;
        }

        .ah-notification-panel {
          width: 390px;
          max-width: calc(100vw - 24px);
          background: white;
          border: 1px solid rgba(212,175,55,.3);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 45px rgba(27,54,93,.16);
        }

        .ah-notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 15px 17px;
          background: ${softBg};
          border-bottom: 1px solid rgba(27,54,93,.08);
        }

        .ah-notification-heading {
          min-width: 0;
        }

        .ah-notification-title {
          font-family: 'Playfair Display',serif;
          font-weight: 700;
          font-size: 15px;
          color: ${primaryNavy};
        }

        .ah-notification-subtitle {
          display: block;
          font-size: 11px;
          color: #64748b;
          margin-top: 3px;
        }

        .ah-clear-button {
          flex: 0 0 auto;
          color: ${primaryNavy} !important;
          font-size: 11px;
          font-weight: 700;
          padding: 0 5px !important;
        }

        .ah-notification-body {
          max-height: min(430px, 65vh);
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .ah-notification-list {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 10px;
        }

        .ah-notification-item {
          position: relative;
          padding: 12px;
          border-radius: 11px;
          border: 1px solid rgba(27,54,93,.07);
          background: white;
        }

        .ah-notification-item:hover {
          background: ${softBg};
          border-color: rgba(212,175,55,.35);
        }

        .ah-notification-item.unread.mass {
          background: #fffdf5;
          border-color: rgba(212,175,55,.3);
        }

        .ah-notification-item.unread.system {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }

        .ah-notification-row {
          display: flex;
          width: 100%;
          min-width: 0;
        }

        .ah-notification-avatar {
          flex: 0 0 38px;
        }

        .ah-notification-avatar.mass {
          background: #fbf2d9;
          color: ${primaryNavy};
          border: 1px solid ${accentGold};
        }

        .ah-notification-avatar.system {
          background: #eaf0f7;
          color: ${primaryNavy};
        }

        .ah-notification-content {
          flex: 1;
          min-width: 0;
          padding-right: 5px;
        }

        .ah-notification-item-title {
          font-size: 12px;
          font-weight: 700;
          color: ${primaryNavy};
          overflow-wrap: anywhere;
        }

        .ah-notification-item-description {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.5;
          color: #475569;
          overflow-wrap: anywhere;
        }

        .ah-notification-time {
          margin-top: 5px;
          font-size: 10px;
          color: #94a3b8;
        }

        .ah-unread-dot {
          position: absolute;
          right: 11px;
          top: 12px;
          width: 7px;
          height: 7px;
          background: #ef4444;
          border-radius: 50%;
        }

        .ah-empty {
          padding: 35px 10px;
        }

        .ah-notification-body::-webkit-scrollbar {
          width: 5px;
        }

        .ah-notification-body::-webkit-scrollbar-thumb {
          background: rgba(212,175,55,.4);
          border-radius: 10px;
        }

        @media (max-width: 991px) {
          .editorial-header {
            padding: 0 16px !important;
            gap: 10px;
          }

          .ah-left {
            gap: 12px;
          }

          .ah-right {
            gap: 6px;
          }

          .ah-user-info {
            display: none;
          }

          .ah-user-profile {
            padding: 3px;
            border: none;
            background: transparent;
          }

          .ah-user-profile:hover {
            background: rgba(27,54,93,.06);
            box-shadow: none;
          }

          .ah-divider {
            margin: 0 2px;
          }
        }

        @media (max-width: 767px) {
          .editorial-header {
            height: 58px !important;
            min-height: 58px !important;
            padding: 0 10px !important;
            gap: 5px;
          }

          .ah-left {
            gap: 8px;
          }

          .ah-right {
            gap: 3px;
          }

          .ah-collapse-button {
            width: 36px !important;
            height: 36px !important;
            flex-basis: 36px;
            min-width: 36px !important;
          }

          .ah-brand {
            gap: 7px;
          }

          .ah-brand-logo {
            width: 32px;
            height: 32px;
            flex-basis: 32px;
            font-size: 11px;
          }

          .ah-brand-text {
            gap: 3px;
            font-size: 12px;
          }

          .ah-brand-text strong {
            font-size: 14px;
          }

          .ah-action-button {
            width: 34px !important;
            height: 34px !important;
            min-width: 34px !important;
          }

          .ah-action-button .anticon {
            font-size: 17px;
          }

          .ah-divider {
            display: none;
          }

          .ah-user-profile {
            margin-left: 1px;
          }

          .ah-user-avatar {
            width: 32px !important;
            height: 32px !important;
            flex-basis: 32px;
            font-size: 14px;
          }

          .ah-notification-panel {
            width: min(380px, calc(100vw - 20px));
            border-radius: 13px;
          }

          .ah-notification-header {
            padding: 12px;
          }

          .ah-notification-title {
            font-size: 13px;
          }

          .ah-notification-subtitle {
            font-size: 10px;
          }

          .ah-notification-body {
            max-height: 55vh;
          }
        }

        @media (max-width: 380px) {
          .editorial-header {
            padding: 0 7px !important;
            gap: 2px;
          }

          .ah-left {
            gap: 5px;
          }

          .ah-right {
            gap: 1px;
          }

          .ah-collapse-button {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            flex-basis: 32px;
          }

          .ah-brand {
            gap: 5px;
          }

          .ah-brand-logo {
            width: 29px;
            height: 29px;
            flex-basis: 29px;
            border-radius: 8px;
          }

          .ah-brand-text {
            font-size: 11px;
          }

          .ah-brand-text strong {
            font-size: 12px;
          }

          .ah-action-button {
            width: 30px !important;
            height: 30px !important;
            min-width: 30px !important;
          }

          .ah-action-button .anticon {
            font-size: 16px;
          }

          .ah-user-avatar {
            width: 29px !important;
            height: 29px !important;
            flex-basis: 29px;
          }
        }

        @media (max-width: 340px) {
          .editorial-header {
            padding: 0 5px !important;
          }

          .ah-left {
            gap: 4px;
          }

          .ah-right {
            gap: 0;
          }

          .ah-brand-text {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.1;
            gap: 1px;
            font-size: 10px;
          }

          .ah-brand-text strong {
            font-size: 11px;
          }

          .ah-help-button {
            display: none !important;
          }

          .ah-action-button {
            width: 29px !important;
            height: 29px !important;
            min-width: 29px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .editorial-header *,
          .editorial-header *::before,
          .editorial-header *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>
    </ConfigProvider>
  );
}
