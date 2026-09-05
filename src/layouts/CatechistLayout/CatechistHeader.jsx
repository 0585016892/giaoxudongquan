import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Dropdown,
  Space,
  Avatar,
  Tooltip,
  ConfigProvider,
  Tag,
} from "antd";

import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BookOutlined,
  StarFilled,
  CrownFilled,
  SmileOutlined,
  DownOutlined,
  HomeOutlined,
} from "@ant-design/icons";

import { useUser } from "../../context/UserContext";
import HelpModalCate from "../../components/HelpModalCate";
import logoWeb from "../../assets/images/logoweb.png";

const { Header } = Layout;

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdminHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useUser();

  const [helpOpen, setHelpOpen] = useState(false);

  /* =========================================================
     PAGE TITLE
  ========================================================= */

  useEffect(() => {
    const path = location.pathname;

    let title = "Tổng quan";

    if (path === "/catechist") {
      title = "Tổng quan";
    } else if (path === "/catechist/classes") {
      title = "Quản lý lớp học";
    } else if (path === "/catechist/students") {
      title = "Quản lý học sinh";
    } else if (path === "/catechist/games") {
      title = "Kho trò chơi";
    } else if (path === "/catechist/results") {
      title = "Kết quả học tập";
    } else if (path === "/catechist/leaderboard") {
      title = "Bảng thành tích";
    } else if (path === "/catechist/lessons") {
      title = "Bài học & Câu hỏi";
    } else if (path === "/catechist-management") {
      title = "Quản lý giáo lý viên";
    } else if (path === "/catechist/profile") {
      title = "Trang cá nhân";
    } else if (path === "/catechist/settings") {
      title = "Thiết lập hệ thống";
    } else if (path === "/catechist/classes-teacher") {
      title = "Lớp học của bạn";
    } else if (path === "/catechist/student-class") {
      title = "Học sinh của bạn";
    } else if (path === "/attendance") {
      title = "Điểm danh";
    } else if (path === "/catechist") {
      title = "Trang cá nhân";
    } else if (path === "/login") {
      title = "Đăng nhập";
    }

    document.title = `${title} | FaithEdu`;
  }, [location.pathname]);

  /* =========================================================
     AVATAR URL
  ========================================================= */

  const userAvatarUrl = useMemo(() => {
    if (!user?.avatar) return null;

    const avatar = String(user.avatar).trim();

    if (
      avatar.startsWith("http://") ||
      avatar.startsWith("https://") ||
      avatar.startsWith("blob:")
    ) {
      return avatar;
    }

    const normalized = avatar.startsWith("/catechist") ? avatar : `/${avatar}`;

    return `${API_URL}${normalized}`;
  }, [user?.avatar]);

  /* =========================================================
     ROLE
  ========================================================= */

  const translateRole = (role) => {
    switch (role) {
      case "priest":
        return "Linh mục Chánh xứ";

      case "admin":
        return "Ban Quản Trị";

      case "teacher":
        return "Giáo lý viên";

      case "catechist":
        return "Ban Quản Trị";

      case "liturgy_manager":
        return "Ban Phụng Vụ";

      case "media_manager":
        return "Ban Truyền Thông";

      default:
        return "Hội đồng Mục vụ";
    }
  };

  /* =========================================================
     ACCOUNT TYPE
  ========================================================= */

  const accountType = useMemo(() => {
    const type = String(user?.account_type || "")
      .trim()
      .toLowerCase();

    if (type === "vip") {
      return {
        key: "vip",
        label: "VIP",
        icon: <CrownFilled />,
        color: "#B7791F",
        bg: "#FFF8E1",
        border: "#F6D98B",
      };
    }

    return {
      key: "member",
      label: "Thành viên",
      icon: <StarFilled />,
      color: "#64748B",
      bg: "#F8FAFC",
      border: "#E2E8F0",
    };
  }, [user?.account_type]);

  /* =========================================================
     USER
  ========================================================= */

  const userName = user?.full_name || user?.email || "Giáo lý viên";

  const userRole = translateRole(user?.role);

  /* =========================================================
     HELP MODAL
  ========================================================= */

  const handleOpenHelp = () => {
    setHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setHelpOpen(false);
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    try {
      if (typeof logout === "function") {
        logout();
      }
    } finally {
      navigate("/");
    }
  };

  /* =========================================================
     USER MENU
  ========================================================= */

  const menuItems = [
    {
      key: "account-info",
      disabled: true,

      label: (
        <div className="faith-user-menu-header">
          <div className="faith-user-menu-caption">TÀI KHOẢN HIỆN TẠI</div>

          <div className="faith-user-menu-name">{userName}</div>

          <div className="faith-user-menu-tags">
            <Tag className="faith-role-tag">{userRole}</Tag>

            <Tag
              icon={accountType.icon}
              className="faith-account-tag"
              style={{
                color: accountType.color,
                background: accountType.bg,
                borderColor: accountType.border,
              }}
            >
              {accountType.label}
            </Tag>
          </div>
        </div>
      ),
    },

    {
      type: "divider",
    },

    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },

    {
      key: "profile",
      icon: <SmileOutlined />,
      label: "Trang cá nhân",
    },

    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Thiết lập hệ thống",
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

  /* =========================================================
     MENU CLICK
  ========================================================= */

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "home":
        navigate("/catechist");
        break;

      case "profile":
        navigate("/catechist/profile");
        break;

      case "settings":
        navigate("/catechist/settings");
        break;

      case "logout":
        handleLogout();
        break;

      default:
        break;
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#FF6B8B",
          borderRadius: 16,
          fontFamily: "'Quicksand', 'Be Vietnam Pro', sans-serif",
        },
      }}
    >
      <div className="faith-header-wrapper">
        <Header className="faith-header">
          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="faith-brand"
            onClick={() => navigate("/catechist")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/catechist");
              }
            }}
          >
            <div className="faith-brand-logo">
              <img src={logoWeb} alt="FaithEdu" className="faith-logo-image" />
            </div>

            <div className="faith-brand-content">
              <div className="faith-brand-name">
                Faith<span>Edu</span>
              </div>

              <div className="faith-brand-slogan">
                Số hóa giáo lý • Kết nối đức tin
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT AREA
          ================================================= */}

          <Space className="faith-header-right" size={10} align="center">
            {/* =================================================
                HELP BUTTON
            ================================================= */}

            <Tooltip title="Khám phá FaithEdu" placement="bottom">
              <button
                type="button"
                className="faith-help-button"
                onClick={handleOpenHelp}
                aria-label="Về FaithEdu"
              >
                <span className="faith-help-icon">
                  <BookOutlined />
                </span>

                <span className="faith-help-text">Về FaithEdu</span>
              </button>
            </Tooltip>

            {/* =================================================
                USER DROPDOWN
            ================================================= */}

            <Dropdown
              menu={{
                items: menuItems,
                onClick: handleMenuClick,
              }}
              placement="bottomRight"
              trigger={["click"]}
              overlayClassName="faith-dropdown"
            >
              <div className="faith-user" role="button" tabIndex={0}>
                {/* AVATAR */}

                <div className="faith-avatar-wrapper">
                  <Avatar
                    size={38}
                    className="faith-avatar"
                    src={userAvatarUrl}
                    icon={<UserOutlined />}
                  />

                  <span className={`faith-account-badge ${accountType.key}`}>
                    {accountType.key === "vip" ? (
                      <CrownFilled />
                    ) : (
                      <StarFilled />
                    )}
                  </span>
                </div>

                {/* USER INFO */}

                <div className="faith-user-info">
                  <div className="faith-user-name">{userName}</div>

                  <div className="faith-user-role">{userRole}</div>
                </div>

                {/* ARROW */}

                <DownOutlined className="faith-user-arrow" />
              </div>
            </Dropdown>
          </Space>

          {/* =================================================
              HELP MODAL

              QUAN TRỌNG:
              Chỉ truyền open + onCancel.
          ================================================= */}

          <HelpModalCate open={helpOpen} onClose={handleCloseHelp} />
        </Header>
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700;800&display=swap'
        );

        /* =====================================================
           WRAPPER
        ===================================================== */

        .faith-header-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;

          padding: 9px 16px 0;

          background: transparent;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .faith-header {
          position: relative;

          height: 64px !important;
          min-height: 64px !important;

          padding: 0 10px 0 8px !important;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-radius: 22px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.96),
              rgba(255,249,252,.94)
            ) !important;

          border: 1px solid rgba(248,194,208,.65);

          box-shadow:
            0 8px 25px rgba(224,136,164,.10),
            0 2px 6px rgba(224,136,164,.06);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        /* =====================================================
           BRAND
        ===================================================== */

        .faith-brand {
          display: flex;
          align-items: center;

          gap: 10px;

          padding: 4px 14px 4px 5px;

          border-radius: 17px;

          cursor: pointer;
          user-select: none;

          background:
            linear-gradient(
              135deg,
              #fff5f8 0%,
              #fffafa 55%,
              #fffdf8 100%
            );

          border: 1px solid #f7dce4;

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .faith-brand:hover {
          transform: translateY(-1px);

          border-color: #efbdce;

          background:
            linear-gradient(
              135deg,
              #ffedf3,
              #fff8fa
            );

          box-shadow:
            0 7px 18px rgba(231,130,159,.14);
        }

        .faith-brand:active {
          transform: translateY(0);
        }

        /* =====================================================
           LOGO
        ===================================================== */

        .faith-brand-logo {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 15px;

          background: #fff;

          border: 2px solid #fff;

          box-shadow:
            0 5px 12px rgba(232,113,150,.20);
        }

        .faith-logo-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: contain;

          border-radius: 13px;
        }

        /* =====================================================
           BRAND TEXT
        ===================================================== */

        .faith-brand-content {
          display: flex;
          flex-direction: column;

          justify-content: center;

          gap: 2px;

          line-height: 1;
        }

        .faith-brand-name {
          color: #694455;

          font-size: 18px;
          font-weight: 800;

          letter-spacing: -.5px;
        }

        .faith-brand-name span {
          color: #ef7194;
        }

        .faith-brand-slogan {
          color: #b9788d;

          font-size: 9.5px;
          font-weight: 700;

          letter-spacing: .05px;

          white-space: nowrap;
        }

        /* =====================================================
           RIGHT AREA
        ===================================================== */

        .faith-header-right {
          display: flex;
          align-items: center;
        }

        /* =====================================================
           HELP BUTTON
        ===================================================== */

        .faith-help-button {
          height: 40px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 14px;

          border-radius: 13px;

          border: 1px solid #ead79e;

          background:
            linear-gradient(
              135deg,
              #fffdf5,
              #fff8df
            );

          color: #806414;

          cursor: pointer;

          font-family: inherit;

          box-shadow:
            0 3px 8px rgba(168,132,35,.07);

          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .faith-help-button:hover {
          transform: translateY(-1px);

          border-color: #d8b94e;

          background:
            linear-gradient(
              135deg,
              #fff9df,
              #fff2c4
            );

          box-shadow:
            0 6px 14px rgba(168,132,35,.12);
        }

        .faith-help-button:active {
          transform: translateY(0);
        }

        .faith-help-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #fff3c4;

          color: #b18b28;

          font-size: 14px;
        }

        .faith-help-text {
          color: #765b13;

          font-size: 12px;
          font-weight: 800;

          white-space: nowrap;
        }

        /* =====================================================
           USER
        ===================================================== */

        .faith-user {
          display: flex;
          align-items: center;

          gap: 9px;

          min-width: 0;

          padding: 4px 10px 4px 5px;

          border-radius: 17px;

          border: 1px solid #eadcf6;

          background:
            linear-gradient(
              135deg,
              #fcf8ff,
              #faf5ff
            );

          cursor: pointer;

          transition:
            transform .2s ease,
            background .2s ease,
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .faith-user:hover {
          transform: translateY(-1px);

          background:
            linear-gradient(
              135deg,
              #f8efff,
              #f5ebff
            );

          border-color: #dcbff4;

          box-shadow:
            0 5px 14px rgba(168,85,247,.10);
        }

        /* =====================================================
           AVATAR
        ===================================================== */

        .faith-avatar-wrapper {
          position: relative;

          width: 38px;
          height: 38px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          line-height: 0;
        }

        .faith-avatar {
          width: 38px !important;
          height: 38px !important;

          display: flex !important;
          align-items: center !important;
          justify-content: center !important;

          margin: 0 !important;
          padding: 0 !important;

          vertical-align: middle !important;

          line-height: 1 !important;

          background: #f28caf !important;

          border: 2px solid #fff;

          box-shadow:
            0 3px 8px rgba(177,88,126,.18);
        }

        .faith-avatar .anticon {
          display: flex !important;

          align-items: center;
          justify-content: center;

          line-height: 1 !important;
        }

        /* =====================================================
           ACCOUNT BADGE
        ===================================================== */

        .faith-account-badge {
          position: absolute;

          right: -3px;
          bottom: -2px;

          width: 15px;
          height: 15px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border: 1.5px solid #fff;

          color: #fff;

          font-size: 7px;

          box-shadow:
            0 2px 4px rgba(0,0,0,.08);
        }

        .faith-account-badge.vip {
          background: #f3a51a;
        }

        .faith-account-badge.member {
          background: #94a3b8;
        }

        /* =====================================================
           USER INFO
        ===================================================== */

        .faith-user-info {
          display: flex;
          flex-direction: column;

          justify-content: center;

          min-width: 0;

          line-height: 1.15;
        }

        .faith-user-name {
          max-width: 125px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          color: #334155;

          font-size: 12px;
          font-weight: 800;
        }

        .faith-user-role {
          max-width: 135px;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;

          margin-top: 2px;

          color: #9b59c8;

          font-size: 9px;
          font-weight: 700;
        }

        .faith-user-arrow {
          margin-left: 2px;

          color: #a855f7;

          font-size: 9px;
        }

        /* =====================================================
           DROPDOWN
        ===================================================== */

        .faith-dropdown .ant-dropdown-menu {
          min-width: 245px;

          padding: 8px !important;

          border-radius: 18px !important;

          border: 1px solid #eadcf6 !important;

          box-shadow:
            0 15px 35px rgba(115,73,140,.13) !important;
        }

        .faith-dropdown .ant-dropdown-menu-item {
          border-radius: 11px;

          min-height: 40px;

          font-family:
            "Quicksand",
            "Be Vietnam Pro",
            sans-serif;

          font-size: 12px;
          font-weight: 700;
        }

        .faith-dropdown
          .ant-dropdown-menu-item:hover {
          background: #faf5ff !important;
        }

        .faith-dropdown
          .ant-dropdown-menu-item
          .anticon {
          color: #a855f7;
        }

        /* =====================================================
           MENU HEADER
        ===================================================== */

        .faith-user-menu-header {
          padding: 5px 6px 8px;

          min-width: 215px;
        }

        .faith-user-menu-caption {
          color: #a1a1aa;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: .7px;
        }

        .faith-user-menu-name {
          margin-top: 3px;
          margin-bottom: 7px;

          color: #1e293b;

          font-size: 15px;
          font-weight: 800;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .faith-user-menu-tags {
          display: flex;
          align-items: center;

          gap: 5px;

          flex-wrap: wrap;
        }

        .faith-role-tag {
          margin: 0 !important;

          border-radius: 8px !important;

          border: 1px solid #eadcf6 !important;

          background: #faf5ff !important;

          color: #9333ea !important;

          font-size: 9px !important;

          font-weight: 800 !important;
        }

        .faith-account-tag {
          margin: 0 !important;

          border-radius: 8px !important;

          font-size: 9px !important;

          font-weight: 800 !important;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .faith-header-wrapper {
            padding: 6px 8px 0;
          }

          .faith-header {
            height: 56px !important;
            min-height: 56px !important;

            padding: 0 7px !important;

            border-radius: 18px;
          }

          .faith-brand {
            gap: 0;

            padding: 3px;

            border-radius: 14px;
          }

          .faith-brand-content {
            display: none;
          }

          .faith-brand-logo {
            width: 38px;
            height: 38px;

            border-radius: 13px;
          }

          .faith-help-button {
            width: 38px;
            height: 38px;

            padding: 0;

            border-radius: 11px;
          }

          .faith-help-text {
            display: none;
          }

          .faith-help-icon {
            width: 26px;
            height: 26px;
          }

          .faith-user {
            padding: 3px;

            border-radius: 14px;
          }

          .faith-user-info,
          .faith-user-arrow {
            display: none;
          }

          .faith-avatar-wrapper,
          .faith-avatar {
            width: 38px !important;
            height: 38px !important;
          }
        }

        /* =====================================================
           VERY SMALL SCREEN
        ===================================================== */

        @media (max-width: 400px) {

          .faith-header {
            padding: 0 5px !important;
          }

          .faith-header-right {
            gap: 5px !important;
          }

          .faith-help-button {
            width: 36px;
            height: 36px;
          }

          .faith-user {
            padding: 2px;
          }

          .faith-brand-logo {
            width: 36px;
            height: 36px;
          }
        }

      `}</style>
    </ConfigProvider>
  );
}
