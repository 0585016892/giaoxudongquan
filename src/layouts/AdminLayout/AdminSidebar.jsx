import React from "react";
import { Layout, Menu, Typography, ConfigProvider } from "antd";
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
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const { Sider } = Layout;
const { Text, Title } = Typography;

// Bảng màu thiết kế Tôn Nghiêm (Sacred Editorial Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const softBg = "#FAFAFA";
const activeBg = "#FAF6ED"; // Màu nền Vàng Kem Nhạt khi Active Item

export default function AdminSidebar({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy vai trò hệ thống từ UserContext
  const { user } = useUser();
  const userRole = user?.role || "editor";

  // Nhãn nhóm tiêu đề với hiệu ứng mờ mượt khi collapse
  const renderGroupLabel = (text) => (
    <div className={`sidebar-group-label ${collapsed ? "collapsed" : ""}`}>
      {text}
    </div>
  );

  // Cây danh mục Menu hệ thống đã gom gọn hợp lý
  const menuItems = [
    // ======================
    // TỔNG QUAN
    // ======================
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
      key: "group-content",
      label: renderGroupLabel("Quản lý Website & Giáo xứ"),
      type: "group",
      children: [
        // QUẢN TRỊ GIÁO XỨ
        // ======================
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
      key: "group-content",
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
              label: "Lời chúa",
            },
            {
              key: "/servers",
              label: "Tác viên & Phân công",
            },
          ],
        },
        // ======================
        // QUẢN LÝ BÍ TÍCH (ĐÃ GOM GỌN TẤT CẢ VÀO 1 MỤC)
        // ======================
        {
          key: "/sacraments",
          icon: <GoldOutlined />,
          label: "Quản lý Bí tích",
        },
      ],
    },
    // ======================
    // NỘI DUNG WEBSITE
    // ======================
    {
      key: "group-content",
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

    // ======================
    // HỆ THỐNG (Chỉ dành cho Admin)
    // ======================
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
                key: "/reports",
                icon: <BarChartOutlined />,
                label: "Báo cáo & Thống kê",
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
  ];

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
      <Sider
        theme="light"
        width={260}
        collapsedWidth={76}
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="editorial-sidebar"
      >
        {/* BRAND HEADER */}
        <div className="sidebar-brand-header">
          <div className="brand-cube-logo">
            <Text className="brand-cube-text">ĐQ</Text>
          </div>

          <div className={`brand-info-box ${collapsed ? "collapsed" : ""}`}>
            <Title level={5} className="brand-title">
              Đồng Quan
            </Title>
            <Text className="brand-role-subtitle">
              {userRole === "admin" ? "QUẢN TRỊ TỐI CAO" : "CỘNG TÁC VIÊN"}
            </Text>
          </div>
        </div>

        {/* MENU NAVIGATION */}
        <div className="sidebar-menu-scroll custom-editorial-scrollbar">
          <Menu
            selectedKeys={[location.pathname]}
            mode="inline"
            inlineIndent={14}
            expandIcon={
              !collapsed && (
                <RightOutlined
                  style={{
                    fontSize: 8,
                    color: "#94a3b8",
                    transition: "transform 0.2s",
                  }}
                />
              )
            }
            onClick={(e) => {
              if (e.key === "go-home") window.open("/giao-xu", "_blank");
              else navigate(e.key);
            }}
            items={menuItems}
            style={{ border: "none" }}
          />
        </div>

        {/* FOOTER BẢN QUYỀN */}
        {!collapsed && (
          <div className="sidebar-footer-copyright">
            <Text className="footer-copyright-text">
              © 2026 Giáo xứ Đồng Quan
            </Text>
          </div>
        )}

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .editorial-sidebar {
              height: 100vh;
              position: sticky;
              top: 0;
              left: 0;
              z-index: 90;
              background: #ffffff !important;
              border-right: 1px solid rgba(212, 175, 55, 0.25) !important;
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
              font-family: 'Be Vietnam Pro', sans-serif;
            }

            /* Brand Header */
            .sidebar-brand-header {
              padding: 0 18px;
              display: flex;
              align-items: center;
              gap: 12px;
              height: 64px;
              border-bottom: 1px solid rgba(27, 54, 93, 0.08);
              justify-content: flex-start;
              transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .brand-cube-logo {
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, ${primaryNavy} 0%, #0f2342 100%);
              border: 1px solid ${accentGold};
              border-radius: 10px;
              display: flex;
              justify-content: center;
              align-items: center;
              box-shadow: 0 4px 12px rgba(27, 54, 93, 0.2);
              flex-shrink: 0;
            }

            .brand-cube-text {
              color: #ffffff;
              font-weight: 800;
              font-size: 13px;
              font-family: 'Playfair Display', serif;
              letter-spacing: -0.5px;
            }

            .brand-info-box {
              opacity: 1;
              max-width: 180px;
              transition: opacity 0.2s ease, max-width 0.2s ease;
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
              letter-spacing: 0.8px;
              display: block;
            }

            /* Group Labels */
            .sidebar-group-label {
              font-size: 10px;
              color: ${accentGold};
              font-weight: 700;
              letter-spacing: 1.2px;
              padding: 0 10px;
              margin-bottom: 4px;
              opacity: 1;
              max-height: 20px;
              transition: opacity 0.2s ease, max-height 0.2s ease;
              overflow: hidden;
              text-transform: uppercase;
            }

            .sidebar-group-label.collapsed {
              opacity: 0;
              max-height: 0;
            }

            /* Scroll Area */
            .sidebar-menu-scroll {
              height: calc(100vh - 110px);
              overflow-y: auto;
              padding: 12px 8px 60px 8px;
            }

            .custom-editorial-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .custom-editorial-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(212, 175, 55, 0.3);
              border-radius: 10px;
            }
            .custom-editorial-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${accentGold};
            }

            /* Menu Customization */
            .ant-menu-item, .ant-menu-submenu-title {
              border-radius: 10px !important;
              margin-bottom: 3px !important;
              margin-top: 3px !important;
              color: #475569 !important;
              font-weight: 500 !important;
              height: 40px !important;
              line-height: 40px !important;
              transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            /* Hover Item */
            .ant-menu-item:hover, .ant-menu-submenu-title:hover {
              background: ${activeBg} !important;
              color: ${primaryNavy} !important;
            }

            /* Submenu Open */
            .ant-menu-submenu-open > .ant-menu-submenu-title {
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
            }

            /* Active Selected Item */
            .ant-menu-item-selected {
              background: ${activeBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              position: relative;
            }

            /* Active Indicator Bar */
            .ant-menu-item-selected::before {
              content: "";
              position: absolute;
              left: 0;
              top: 10px;
              bottom: 10px;
              width: 3px;
              background-color: ${accentGold};
              border-radius: 0 4px 4px 0;
            }

            .ant-menu-item-selected .anticon {
              color: ${primaryNavy} !important;
            }

            .ant-menu-item-selected::after {
              display: none !important;
            }

            /* Go Home Special Item */
            .go-home-menu-item {
              border: 1px dashed rgba(212, 175, 55, 0.4) !important;
              margin-top: 14px !important;
              background: ${softBg} !important;
            }

            .go-home-menu-item:hover {
              border-color: ${accentGold} !important;
              background: ${activeBg} !important;
              color: ${primaryNavy} !important;
            }

            /* Footer Copyright */
            .sidebar-footer-copyright {
              padding: 12px;
              text-align: center;
              position: absolute;
              bottom: 0;
              width: 100%;
              background: linear-gradient(to top, #ffffff 80%, rgba(255, 255, 255, 0) 100%);
              pointer-events: none;
            }

            .footer-copyright-text {
              font-size: 10px;
              color: #94a3b8;
              font-weight: 500;
            }
          `,
          }}
        />
      </Sider>
    </ConfigProvider>
  );
}
