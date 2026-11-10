import React, { useState, useCallback } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const { Content } = Layout;
// const { useBreakpoint } = Grid;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // const screens = useBreakpoint();
  // const isMobile = !screens.md;

  // Mở menu trên mobile
  const handleOpenMobileMenu = useCallback(() => {
    setMobileOpen(true);
  }, []);

  // Đóng menu trên mobile
  const handleCloseMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Đổi trạng thái sidebar trên desktop
  const handleToggleSidebar = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <Layout className="admin-layout">
      {/* Sidebar desktop và Drawer mobile */}
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobileMenu={handleCloseMobileMenu}
      />

      <Layout className="admin-layout-main">
        {/* Header chứa nút mở menu trên mobile */}
        <AdminHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileMenu={handleOpenMobileMenu}
        />

        <Content className="admin-layout-content">
          <div className="admin-layout-content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #f8fafc;
        }

        .admin-layout-main {
          min-width: 0;
          min-height: 100vh;
          background: #f8fafc;
        }

        .admin-layout-content {
          min-width: 0;
          padding: 24px;
          background: #f8fafc;
          overflow-x: hidden;
        }

        .admin-layout-content-inner {
          width: 100%;
          min-width: 0;
          min-height: 280px;
        }

        @media (max-width: 991px) {
          .admin-layout-content {
            padding: 20px;
          }
        }

        @media (max-width: 767px) {
          .admin-layout-content {
            padding: 14px;
          }
        }

        @media (max-width: 480px) {
          .admin-layout-content {
            padding: 10px;
          }
        }
      `}</style>
    </Layout>
  );
}
