import React, { useMemo, useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Typography,
  ConfigProvider,
  Drawer,
  Button,
  Grid,
} from "antd";

import {
  DashboardOutlined,
  CalendarOutlined,
  ReadOutlined,
  BarChartOutlined,
  UserOutlined,
  RightOutlined,
  FileImageOutlined,
  HistoryOutlined,
  SettingOutlined,
  HomeOutlined,
  BookOutlined,
  GoldOutlined,
  DollarOutlined,
  TeamOutlined,
  RobotOutlined,
  MessageOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  MenuOutlined,
} from "@ant-design/icons";

import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const { Sider } = Layout;
const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const softBg = "#FAFAFA";
const activeBg = "#FAF6ED";

export default function AdminSidebar({ collapsed = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  const { user } = useUser();

  const userRole = user?.role || "editor";

  // Responsive
  const isMobile = !screens.md;

  const [mobileOpen, setMobileOpen] = useState(false);

  // Đóng Drawer khi chuyển sang Desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  // =====================================================
  // MENU GROUP LABEL
  // =====================================================

  const renderGroupLabel = React.useCallback(
    (text) => (
      <div className={`sidebar-group-label ${collapsed ? "collapsed" : ""}`}>
        {text}
      </div>
    ),
    [collapsed],
  );

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = useMemo(
    () => [
      {
        key: "group-overview",
        label: renderGroupLabel("Tổng quan"),
        type: "group",
        children: [
          {
            key: "/giao-xu",
            icon: <DashboardOutlined />,
            label: "Bảng điều khiển",
          },
        ],
      },

      {
        key: "group-parish",
        label: renderGroupLabel("Quản lý Website & Giáo xứ"),
        type: "group",
        children: [
          {
            key: "giao-xu-giao-dan",
            icon: <TeamOutlined />,
            label: "Giáo xứ & Giáo dân",
            children: [
              {
                key: "/quan-ly",
                label: "Thông tin Giáo xứ",
              },
              {
                key: "/diocese-management",
                label: "Thông tin Giáo phận & giáo hạt Việt Nam",
              },
              {
                key: "/announcements",
                label: "Thông báo Mục vụ",
              },
              {
                key: "/parishioners",
                label: "Danh sách Giáo dân",
              },
              {
                key: "/doan-the",
                label: "Hội đoàn & Giáo lý viên",
              },
            ],
          },

          {
            key: "finance",
            icon: <DollarOutlined />,
            label: "Tài chính & Quyên góp",
            children: [
              {
                key: "/donations",
                label: "Quyên góp & Thu chi",
              },
              {
                key: "/finance-reports",
                label: "Báo cáo tài chính",
              },
            ],
          },
        ],
      },

      {
        key: "group-catechism",
        label: renderGroupLabel("Giáo lý & Bí tích, Phụng vụ"),
        type: "group",
        children: [
          {
            key: "giao-ly-khao-kinh",
            icon: <BookOutlined />,
            label: "Giáo lý & Khảo kinh",
            children: [
              {
                key: "/lessons",
                label: "Ngân hàng bài học & câu hỏi",
              },
              {
                key: "/marriage-students",
                label: "Danh sách học viên",
              },
              {
                key: "/exam-prayer",
                label: "Kết quả khảo kinh & thi",
              },
              {
                key: "/certificates",
                label: "Chứng nhận cấp bằng",
              },
            ],
          },

          {
            key: "phung-vu",
            icon: <CalendarOutlined />,
            label: "Phụng vụ & Bài đọc",
            children: [
              {
                key: "/lich-phung-vu",
                label: "Lịch phụng vụ & Lễ",
              },
              {
                key: "/readings",
                label: "Bài đọc & Tin Mừng",
              },
              {
                key: "/dailyverse",
                label: "Lời Chúa",
              },
              {
                key: "/servers",
                label: "Tác viên & Phân công",
              },
            ],
          },

          {
            key: "/sacraments",
            icon: <GoldOutlined />,
            label: "Quản lý Bí tích",
          },
        ],
      },

      {
        key: "group-website",
        label: renderGroupLabel("Nội dung Website"),
        type: "group",
        children: [
          {
            key: "/slides",
            icon: <FileImageOutlined />,
            label: "Banner & Slide",
          },
          {
            key: "/news",
            icon: <ReadOutlined />,
            label: "Tin tức & Bài viết",
          },
          {
            key: "/feedbacks",
            icon: <MessageOutlined />,
            label: "Góp ý & Ý kiến",
          },
          {
            key: "library-docs",
            icon: <FolderOpenOutlined />,
            label: "Thư viện & Tài liệu",
            children: [
              {
                key: "/documents",
                label: "Kho Tài liệu & Biểu mẫu",
              },
              {
                key: "/prayers",
                label: "Kho Kinh nguyện",
              },
              {
                key: "/gallery",
                label: "Thư viện Ảnh",
              },
              {
                key: "/media-library",
                label: "Audio & Video",
              },
            ],
          },
        ],
      },

      ...(userRole === "admin"
        ? [
            {
              key: "group-system",
              label: renderGroupLabel("Hệ thống"),
              type: "group",
              children: [
                {
                  key: "/admins",
                  icon: <UserOutlined />,
                  label: "Quản trị viên",
                },
                {
                  key: "/admin-license",
                  icon: <UserOutlined />,
                  label: "Đăng kí gói FaithEdu",
                },
                {
                  key: "/reports",
                  icon: <BarChartOutlined />,
                  label: "Báo cáo & Thống kê",
                },
                {
                  key: "/reports-faithedu",
                  icon: <BarChartOutlined />,
                  label: "Báo cáo FaithEdu",
                },
                {
                  key: "/activity-logs",
                  icon: <HistoryOutlined />,
                  label: "Nhật ký hệ thống",
                },
                {
                  key: "/statistics",
                  icon: <HistoryOutlined />,
                  label: "Nhật ký truy cập",
                },
                {
                  key: "/settings",
                  icon: <SettingOutlined />,
                  label: "Cấu hình hệ thống",
                },
                {
                  key: "/cors",
                  icon: <GlobalOutlined />,
                  label: "Quản lý CORS",
                },
                {
                  key: "/rag",
                  icon: <RobotOutlined />,
                  label: "Huấn luyện AI (RAG)",
                },
              ],
            },
          ]
        : []),

      {
        type: "divider",
      },

      {
        key: "go-home",
        icon: <HomeOutlined />,
        label: "Xem trang chủ",
        className: "go-home-menu-item",
      },
    ],
    [userRole, renderGroupLabel],
  );

  // =====================================================
  // TỰ ĐỘNG MỞ MENU CHA THEO ROUTE
  // =====================================================

  const getOpenKeys = (items, pathname) => {
    const result = [];

    const findParent = (list) => {
      list?.forEach((item) => {
        if (item.children?.length) {
          const hasActiveChild = item.children.some((child) => {
            return (
              child.key === pathname ||
              child.children?.some((sub) => sub.key === pathname)
            );
          });

          if (hasActiveChild) {
            result.push(item.key);
          }

          findParent(item.children);
        }
      });
    };

    findParent(items);

    return result;
  };

  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    setOpenKeys(getOpenKeys(menuItems, location.pathname));
  }, [location.pathname, menuItems]);

  // =====================================================
  // MENU CLICK
  // =====================================================

  const handleMenuClick = ({ key }) => {
    if (key === "go-home") {
      window.open("/giao-xu", "_blank");
      return;
    }

    navigate(key);

    // Mobile tự đóng Drawer
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // =====================================================
  // SIDEBAR CONTENT
  // =====================================================

  const SidebarContent = ({ mobile = false }) => (
    <div className={`sidebar-inner ${mobile ? "mobile-sidebar-inner" : ""}`}>
      {/* BRAND HEADER */}
      <div className="sidebar-brand-header">
        <div className="brand-cube-logo">
          <Text className="brand-cube-text">ĐQ</Text>
        </div>

        <div
          className={`brand-info-box ${
            !mobile && collapsed ? "collapsed" : ""
          }`}
        >
          <Title level={5} className="brand-title">
            Đồng Quan
          </Title>

          <Text className="brand-role-subtitle">
            {userRole === "admin" ? "QUẢN TRỊ TỐI CAO" : "CỘNG TÁC VIÊN"}
          </Text>
        </div>
      </div>

      {/* MENU */}
      <div className="sidebar-menu-scroll custom-editorial-scrollbar">
        <Menu
          selectedKeys={[location.pathname]}
          openKeys={!collapsed || mobile ? openKeys : undefined}
          onOpenChange={setOpenKeys}
          mode="inline"
          inlineIndent={14}
          expandIcon={
            <RightOutlined
              style={{
                fontSize: 9,
                color: "#94a3b8",
              }}
            />
          }
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            border: "none",
            background: "transparent",
          }}
        />
      </div>

      {/* FOOTER */}
      <div className="sidebar-footer-copyright">
        <Text className="footer-copyright-text">© 2026 Giáo xứ Đồng Quan</Text>
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 10,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      {/* ================================================= */}
      {/* MOBILE SIDEBAR */}
      {/* ================================================= */}

      {isMobile ? (
        <>
          {/* NÚT MỞ MENU MOBILE */}
          <Button
            type="default"
            className="mobile-sidebar-trigger"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          />

          <Drawer
            placement="left"
            width={290}
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            closable={false}
            className="responsive-sidebar-drawer"
            styles={{
              body: {
                padding: 0,
                overflow: "hidden",
              },
            }}
          >
            <div className="mobile-sidebar-close">
              <div className="mobile-sidebar-heading">
                <span>MENU QUẢN TRỊ</span>
              </div>

              <Button
                type="text"
                onClick={() => setMobileOpen(false)}
                icon={<span style={{ fontSize: 20 }}>×</span>}
              />
            </div>

            <SidebarContent mobile />
          </Drawer>
        </>
      ) : (
        /* ================================================= */
        /* DESKTOP SIDEBAR */
        /* ================================================= */

        <Sider
          theme="light"
          width={260}
          collapsedWidth={76}
          collapsible
          collapsed={collapsed}
          trigger={null}
          className="editorial-sidebar"
        >
          <SidebarContent />
        </Sider>
      )}

      {/* ================================================= */}
      {/* RESPONSIVE STYLES */}
      {/* ================================================= */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

            .editorial-sidebar {
              height: 100vh;
              height: 100dvh;
              position: sticky;
              top: 0;
              left: 0;
              z-index: 90;
              background: #fff !important;
              border-right: 1px solid rgba(212,175,55,.25) !important;
              transition: all .25s ease !important;
              font-family: 'Be Vietnam Pro', sans-serif;
              flex: 0 0 auto;
            }

            .sidebar-inner {
              height: 100%;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              background: #fff;
              position: relative;
            }

            /* BRAND */

            .sidebar-brand-header {
              padding: 0 18px;
              display: flex;
              align-items: center;
              gap: 12px;
              height: 64px;
              min-height: 64px;
              border-bottom: 1px solid rgba(27,54,93,.08);
              flex-shrink: 0;
            }

            .brand-cube-logo {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, ${primaryNavy}, #0f2342);
              border: 1px solid ${accentGold};
              border-radius: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
              box-shadow: 0 4px 12px rgba(27,54,93,.2);
              flex-shrink: 0;
            }

            .brand-cube-text {
              color: #fff !important;
              font-weight: 800;
              font-size: 13px;
              font-family: 'Playfair Display', serif;
            }

            .brand-info-box {
              min-width: 0;
              opacity: 1;
              max-width: 180px;
              transition: all .2s ease;
              white-space: nowrap;
              overflow: hidden;
            }

            .brand-info-box.collapsed {
              opacity: 0;
              max-width: 0;
              visibility: hidden;
            }

            .brand-title {
              margin: 0 !important;
              font-size: 15px !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              font-family: 'Playfair Display', serif !important;
            }

            .brand-role-subtitle {
              font-size: 9px;
              font-weight: 700;
              color: ${accentGold};
              letter-spacing: .8px;
              display: block;
            }

            /* GROUP LABEL */

            .sidebar-group-label {
              font-size: 10px;
              color: ${accentGold};
              font-weight: 700;
              letter-spacing: 1px;
              padding: 0 10px;
              margin-bottom: 4px;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
            }

            .sidebar-group-label.collapsed {
              opacity: 0;
              max-height: 0;
            }

            /* MENU SCROLL */

            .sidebar-menu-scroll {
              flex: 1;
              min-height: 0;
              overflow-y: auto;
              overflow-x: hidden;
              padding: 12px 8px 20px;
              overscroll-behavior: contain;
            }

            .custom-editorial-scrollbar::-webkit-scrollbar {
              width: 4px;
            }

            .custom-editorial-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(212,175,55,.3);
              border-radius: 10px;
            }

            .custom-editorial-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${accentGold};
            }

            /* MENU ITEMS */

            .editorial-sidebar .ant-menu,
            .mobile-sidebar-inner .ant-menu {
              font-family: 'Be Vietnam Pro', sans-serif;
              font-size: 12px;
            }

            .editorial-sidebar .ant-menu-item,
            .editorial-sidebar .ant-menu-submenu-title,
            .mobile-sidebar-inner .ant-menu-item,
            .mobile-sidebar-inner .ant-menu-submenu-title {
              border-radius: 10px !important;
              margin: 3px 0 !important;
              color: #475569 !important;
              font-weight: 500 !important;
              min-height: 40px !important;
              height: auto !important;
              line-height: 1.5 !important;
              padding-top: 10px !important;
              padding-bottom: 10px !important;
              transition: all .18s ease !important;
            }

            .editorial-sidebar .ant-menu-title-content,
            .mobile-sidebar-inner .ant-menu-title-content {
              white-space: normal;
              overflow-wrap: anywhere;
            }

            .editorial-sidebar .ant-menu-item:hover,
            .editorial-sidebar .ant-menu-submenu-title:hover,
            .mobile-sidebar-inner .ant-menu-item:hover,
            .mobile-sidebar-inner .ant-menu-submenu-title:hover {
              background: ${activeBg} !important;
              color: ${primaryNavy} !important;
            }

            .editorial-sidebar .ant-menu-submenu-open > .ant-menu-submenu-title,
            .mobile-sidebar-inner .ant-menu-submenu-open > .ant-menu-submenu-title {
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
            }

            .editorial-sidebar .ant-menu-item-selected,
            .mobile-sidebar-inner .ant-menu-item-selected {
              background: ${activeBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              position: relative;
            }

            .editorial-sidebar .ant-menu-item-selected::before,
            .mobile-sidebar-inner .ant-menu-item-selected::before {
              content: "";
              position: absolute;
              left: 0;
              top: 10px;
              bottom: 10px;
              width: 3px;
              background: ${accentGold};
              border-radius: 0 4px 4px 0;
            }

            .editorial-sidebar .ant-menu-item-selected .anticon,
            .mobile-sidebar-inner .ant-menu-item-selected .anticon {
              color: ${primaryNavy} !important;
            }

            .editorial-sidebar .ant-menu-item-selected::after,
            .mobile-sidebar-inner .ant-menu-item-selected::after {
              display: none !important;
            }

            /* GO HOME */

            .go-home-menu-item {
              border: 1px dashed rgba(212,175,55,.4) !important;
              margin-top: 14px !important;
              background: ${softBg} !important;
            }

            .go-home-menu-item:hover {
              border-color: ${accentGold} !important;
              background: ${activeBg} !important;
            }

            /* FOOTER */

            .sidebar-footer-copyright {
              padding: 12px 8px;
              text-align: center;
              flex-shrink: 0;
              background: #fff;
              border-top: 1px solid rgba(27,54,93,.06);
            }

            .footer-copyright-text {
              font-size: 10px;
              color: #94a3b8;
              font-weight: 500;
            }

            /* MOBILE TRIGGER */

            .mobile-sidebar-trigger {
              position: fixed;
              top: 12px;
              left: 12px;
              z-index: 999;
              width: 42px;
              height: 42px;
              border-radius: 12px;
              background: ${primaryNavy};
              color: #fff;
              border: 1px solid ${accentGold};
              box-shadow: 0 4px 14px rgba(27,54,93,.2);
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .mobile-sidebar-trigger:hover {
              background: #254b78 !important;
              color: #fff !important;
              border-color: ${accentGold} !important;
            }

            /* MOBILE DRAWER */

            .responsive-sidebar-drawer .ant-drawer-content {
              background: #fff;
            }

            .responsive-sidebar-drawer .ant-drawer-body {
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            .mobile-sidebar-close {
              height: 48px;
              min-height: 48px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 14px;
              background: ${primaryNavy};
              color: #fff;
            }

            .mobile-sidebar-heading {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              color: ${accentGold};
            }

            .mobile-sidebar-close .ant-btn {
              color: #fff;
            }

            .mobile-sidebar-close .ant-btn:hover {
              color: ${accentGold} !important;
              background: rgba(255,255,255,.1) !important;
            }

            .mobile-sidebar-inner {
              flex: 1;
              min-height: 0;
            }

            /* TABLET */

            @media (min-width: 768px) and (max-width: 991px) {
              .editorial-sidebar {
                width: 76px !important;
                max-width: 76px !important;
                min-width: 76px !important;
              }

              .editorial-sidebar .sidebar-brand-header {
                padding: 0;
                justify-content: center;
              }

              .editorial-sidebar .sidebar-group-label {
                display: none;
              }

              .editorial-sidebar .sidebar-menu-scroll {
                padding-left: 5px;
                padding-right: 5px;
              }
            }

            /* MOBILE */

            @media (max-width: 767px) {
              .mobile-sidebar-inner .sidebar-brand-header {
                height: 68px;
                padding: 0 18px;
              }

              .mobile-sidebar-inner .brand-info-box {
                opacity: 1;
                max-width: 180px;
                visibility: visible;
              }

              .mobile-sidebar-inner .sidebar-menu-scroll {
                padding: 10px 12px 20px;
              }

              .mobile-sidebar-inner .ant-menu-item,
              .mobile-sidebar-inner .ant-menu-submenu-title {
                min-height: 44px !important;
              }

              .mobile-sidebar-inner .ant-menu {
                font-size: 13px;
              }

              .mobile-sidebar-inner .sidebar-footer-copyright {
                padding: 14px;
              }
            }

            @media (max-height: 600px) {
              .sidebar-brand-header {
                height: 56px;
                min-height: 56px;
              }

              .sidebar-menu-scroll {
                padding-top: 6px;
              }

              .sidebar-footer-copyright {
                padding: 7px;
              }
            }
          `,
        }}
      />
    </ConfigProvider>
  );
}
