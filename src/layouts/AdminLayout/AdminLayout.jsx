import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const { Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar collapsed={collapsed} />

      <Layout>
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content
          style={{
            margin: "24px",
            background: "#f8fafc",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
