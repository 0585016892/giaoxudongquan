import React from "react";
import {
  Layout,
  Menu,
  Typography,
  Avatar,
  Button,
  Flex,
  ConfigProvider,
  Tooltip,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Gamepad2,
  BarChart3,
  ClipboardCheck,
  Trophy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";

import imgSidebar from "../../assets/images/imgSidebar.png";
import logoWeb from "../../assets/images/logoweb.png";
import usePermission from "../../hooks/usePermission";

const { Sider } = Layout;
const { Title } = Typography;

export default function CatechistSidebar({
  onLogout,
  collapsed,
  setCollapsed,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewClass, canViewStudents, canViewCatechists } = usePermission();

  const menuItems = [
    {
      key: "/catechist",
      label: "Tổng quan",
      icon: <Home size={18} strokeWidth={2.3} />,
    },

    canViewClass && {
      key: "/catechist/classes",
      label: "Quản lý lớp học",
      icon: <Users size={18} strokeWidth={2.3} />,
    },

    {
      key: "/catechist/classes-teacher",
      label: "Lớp học của bạn",
      icon: <Users size={18} strokeWidth={2.3} />,
    },

    canViewStudents && {
      key: "/catechist/students",
      label: "Quản lý học sinh",
      icon: <Users size={18} strokeWidth={2.3} />,
    },
    {
      key: "/catechist/student-class",
      label: "Học sinh của bạn",
      icon: <Users size={18} strokeWidth={2.3} />,
    },
    canViewCatechists && {
      key: "/catechist-management",
      label: "Quản lý giáo lý viên",
      icon: <Sparkles size={18} strokeWidth={2.3} />,
    },

    {
      key: "/attendance",
      label: "Điểm danh",
      icon: <ClipboardCheck size={18} strokeWidth={2.3} />,
    },

    {
      key: "/catechist/games",
      label: "Trò chơi tương tác",
      icon: <Gamepad2 size={18} strokeWidth={2.3} />,
    },

    {
      key: "/catechist/results",
      label: "Kết quả học tập",
      icon: <BarChart3 size={18} strokeWidth={2.3} />,
    },

    {
      key: "/catechist/leaderboard",
      label: "Bảng thành tích",
      icon: <Trophy size={18} strokeWidth={2.3} />,
    },
  ].filter(Boolean);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 16,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
        components: {
          Menu: {
            itemBg: "transparent",
            itemColor: "#4A5568",
            itemHoverColor: "#FF6B8B",
            itemHoverBg: "#FFF0F5",
            itemSelectedColor: "#FFFFFF",
            itemSelectedBg: "#FF6B8B",
            itemRadius: 16,
            itemMarginInline: 8,
            itemPaddingInline: collapsed ? 0 : 16,
            itemHeight: 46,
            collapsedIconSize: 20,
          },
        },
      }}
    >
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={80}
        theme="light"
        className="chibi-sidebar"
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          background: "rgba(255, 255, 255, 0.98)",
          borderRight: "2px solid #FFF0F5",
          boxShadow: "6px 0 24px rgba(255, 133, 161, 0.08)",
          zIndex: 99,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <Flex
          vertical
          style={{
            height: "100%",
            padding: collapsed ? "14px 8px" : "14px 10px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* BRAND PASTEL CARD */}
          <div
            className="sidebar-brand-card"
            onClick={() => navigate("/catechist")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 12,
              padding: collapsed ? "8px 0" : "10px 12px",
              marginBottom: 12,
              borderRadius: 20,
              background: collapsed
                ? "transparent"
                : "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
              border: collapsed ? "none" : "1.5px solid #FBCFE8",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
          >
            <div className="avatar-star-container">
              <Avatar
                size={collapsed ? 42 : 46}
                src={logoWeb}
                style={{
                  backgroundColor: "#FFD6E0",
                  border: "2px solid #FF85A1",
                  boxShadow: "0 4px 12px rgba(255, 107, 139, 0.25)",
                  flexShrink: 0,
                }}
              />
            </div>

            {!collapsed && (
              <Flex vertical style={{ minWidth: 0 }}>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "#4A4E69",
                    fontWeight: 700,
                    lineHeight: 1.3,
                    fontSize: 13.5,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Thiếu Nhi Thánh Thể
                </Title>
              </Flex>
            )}
          </div>

          {/* MENU LIST */}
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              border: "none",
              fontWeight: 700,
              fontSize: 13,
              flex: 1,
              background: "transparent",
            }}
          />

          {/* FOOTER ACTIONS */}
          <Flex vertical gap={6} style={{ marginTop: 12 }}>
            {/* TOGGLE COLLAPSE */}
            <Tooltip title={collapsed ? "Mở rộng menu" : ""} placement="right">
              <Button
                type="text"
                onClick={() => setCollapsed(!collapsed)}
                icon={
                  collapsed ? (
                    <PanelLeftOpen size={18} color="#FF6B8B" />
                  ) : (
                    <PanelLeftClose size={18} color="#FF6B8B" />
                  )
                }
                style={{
                  height: 42,
                  borderRadius: 16,
                  color: "#4A5568",
                  fontWeight: 700,
                  fontSize: 13,
                  background: "#FAF5FF",
                  border: "1.5px solid #E9D5FF",
                  justifyContent: collapsed ? "center" : "flex-start",
                  paddingLeft: collapsed ? 0 : 16,
                }}
                block
              >
                {!collapsed && "Thu gọn menu"}
              </Button>
            </Tooltip>

            {/* LOGOUT */}
            <Tooltip
              title={collapsed ? "Tạm biệt / Đăng xuất" : ""}
              placement="right"
            >
              <Button
                type="text"
                icon={<LogOut size={17} strokeWidth={2.3} color="#EF4444" />}
                onClick={onLogout}
                block
                style={{
                  height: 42,
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#EF4444",
                  background: "#FEF2F2",
                  border: "1.5px solid #FCA5A5",
                  justifyContent: collapsed ? "center" : "flex-start",
                  paddingLeft: collapsed ? 0 : 16,
                }}
              >
                {!collapsed && "Tạm biệt / Đăng xuất"}
              </Button>
            </Tooltip>
          </Flex>

          {/* BANNER MINI CHIBI */}
          {!collapsed && (
            <div
              style={{
                marginTop: 12,
                borderRadius: 18,
                overflow: "hidden",
                width: "100%",
                background: "linear-gradient(135deg, #FFF0F5 0%, #F3E8FF 100%)",
                border: "1.5px solid #FBCFE8",
                padding: "8px",
                textAlign: "center",
              }}
            >
              <img
                src={imgSidebar}
                alt="Illustration Banner"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 100,
                  objectFit: "contain",
                  display: "block",
                  borderRadius: 12,
                }}
              />
            </div>
          )}
        </Flex>

        {/* CUSTOM CSS STYLES */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&display=swap');

          .chibi-sidebar ::-webkit-scrollbar {
            width: 4px;
          }
          .chibi-sidebar ::-webkit-scrollbar-thumb {
            background: #FBCFE8;
            border-radius: 10px;
          }
          .chibi-sidebar .ant-menu-item-selected {
            box-shadow: 0 6px 16px rgba(255, 107, 139, 0.35) !important;
          }
          .sidebar-brand-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 107, 139, 0.15);
          }
        `}</style>
      </Sider>
    </ConfigProvider>
  );
}
