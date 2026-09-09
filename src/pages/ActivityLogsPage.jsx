import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Avatar,
  Tag,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Select,
  Tooltip,
  ConfigProvider,
  message,
  DatePicker,
  Button,
  Drawer,
  Descriptions,
  Badge,
  Modal,
} from "antd";

import {
  HistoryOutlined,
  SearchOutlined,
  LoginOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  KeyOutlined,
  EyeOutlined,
  CloudServerOutlined,
  UserOutlined,
  CodeOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getActivityLogs, deleteActivityLogs } from "../api/activityLogApi";
import PageHeroHeader from "../components/common/PageHeroHeader";
import StatCard from "../components/common/StatCard";
dayjs.extend(isBetween);

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Bảng màu thiết kế Tôn Nghiêm (Editorial Sacred Palette)
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleting, setDeleting] = useState(false);

  // Bộ lọc nâng cao
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);

  // Xem chi tiết Log
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getActivityLogs();
      const dataLogs = res.data?.data || res.data || [];
      setLogs(dataLogs);
    } catch (err) {
      console.error(err);
      message.error("Không thể kết nối tới máy chủ nhật ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Logic lọc dữ liệu
  const filteredLogs = logs.filter((log) => {
    const matchesKeyword =
      !search ||
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address?.includes(search) ||
      log.action?.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const logDate = dayjs(log.created_at);
      const startDate = dateRange[0].startOf("day");
      const endDate = dateRange[1].endOf("day");
      matchesDate = logDate.isBetween(startDate, endDate, null, "[]");
    }

    return matchesKeyword && matchesAction && matchesDate;
  });

  const totalLogs = filteredLogs.length;
  const criticalActions = filteredLogs.filter(
    (l) => l.action?.includes("DELETE") || l.action?.includes("RESET_PASSWORD"),
  ).length;
  const sysMutations = filteredLogs.filter(
    (l) => l.action?.includes("CREATE") || l.action?.includes("UPDATE"),
  ).length;

  // Cấu hình nhãn hành động
  const getActionConfig = (action) => {
    switch (action) {
      case "LOGIN":
        return {
          color: "#2e7d32",
          bg: "#f0fdf4",
          icon: <LoginOutlined />,
          label: "Đăng Nhập",
        };
      case "CREATE_ADMIN":
        return {
          color: primaryNavy,
          bg: "rgba(212, 175, 55, 0.15)",
          icon: <PlusOutlined />,
          label: "Khởi Tạo",
        };
      case "UPDATE_ADMIN":
        return {
          color: accentGold,
          bg: "#fffbeb",
          icon: <EditOutlined />,
          label: "Cập Nhật",
        };
      case "DELETE_ADMIN":
        return {
          color: "#c62828",
          bg: "#fff5f5",
          icon: <DeleteOutlined />,
          label: "Xóa Dữ Liệu",
        };
      case "RESET_PASSWORD":
        return {
          color: "#6b21a8",
          bg: "#f3e8ff",
          icon: <KeyOutlined />,
          label: "Cấp Mật Khẩu",
        };
      default:
        return {
          color: "#475569",
          bg: "#f8fafc",
          icon: <HistoryOutlined />,
          label: action,
        };
    }
  };
  const handleDeleteSelected = () => {
    if (!selectedRowKeys.length) {
      message.warning("Vui lòng chọn ít nhất một log để xóa");
      return;
    }

    Modal.confirm({
      title: "Xóa nhật ký hoạt động?",
      content: (
        <div>
          Bạn có chắc muốn xóa <strong>{selectedRowKeys.length} log</strong> đã
          chọn?
          <br />
          <span style={{ color: "#c62828", fontSize: 12 }}>
            Thao tác này không thể hoàn tác.
          </span>
        </div>
      ),
      okText: "Xóa log",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },

      onOk: async () => {
        try {
          setDeleting(true);

          const res = await deleteActivityLogs(selectedRowKeys);

          message.success(
            res.data?.message || `Đã xóa ${selectedRowKeys.length} log`,
          );

          setSelectedRowKeys([]);

          await fetchLogs();
        } catch (err) {
          console.error("DELETE SELECTED LOGS ERROR:", err);

          message.error(
            err.response?.data?.message || "Không thể xóa các log đã chọn",
          );
        } finally {
          setDeleting(false);
        }
      },
    });
  };
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: "#94a3b8" }}>{index + 1}</span>
      ),
    },
    {
      title: "Quản trị viên thao tác",
      key: "user",
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            src={
              record.avatar
                ? `${process.env.REACT_APP_API_URL}${record.avatar}`
                : null
            }
            icon={<UserOutlined />}
            style={{
              background:
                record.role === "priest"
                  ? "linear-gradient(135deg, #8b0000 0%, #a81c1c 100%)"
                  : primaryNavy,
              border: "1px solid " + accentGold,
            }}
          />
          <div>
            <div
              style={{ fontWeight: 700, color: primaryNavy, fontSize: "14px" }}
            >
              {record.full_name || "Hệ thống"}
            </div>
            <Tag className="gold-category-tag">
              {record.role === "priest" ? "LINH MỤC CHÁNH XỨ" : "QUẢN TRỊ VIÊN"}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Phân loại hành động",
      dataIndex: "action",
      width: 160,
      render: (action) => {
        const cfg = getActionConfig(action);
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              color: cfg.color,
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.color}`,
            }}
          >
            {cfg.icon} {cfg.label}
          </span>
        );
      },
    },
    {
      title: "Chi tiết nội dung thực thi",
      dataIndex: "description",
      render: (text) => (
        <Text style={{ color: textDark, fontSize: "13px", fontWeight: 500 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ip_address",
      width: 130,
      render: (ip) => (
        <Text
          code
          style={{
            fontSize: "11px",
            color: primaryNavy,
            background: softBg,
            borderColor: "rgba(212, 175, 55, 0.3)",
            fontWeight: 600,
          }}
        >
          {ip || "0.0.0.0"}
        </Text>
      ),
    },
    {
      title: "Thời gian ghi nhận",
      dataIndex: "created_at",
      width: 160,
      render: (date) => (
        <div>
          <div
            style={{ color: primaryNavy, fontWeight: 700, fontSize: "13px" }}
          >
            {dayjs(date).format("DD/MM/YYYY")}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              marginTop: "1px",
              fontWeight: 500,
            }}
          >
            {dayjs(date).format("HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      title: "Tra cứu",
      key: "inspect",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xem cấu trúc gói tin dữ liệu">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined style={{ color: primaryNavy, fontSize: 16 }} />}
            onClick={() => {
              setSelectedLog(record);
              setDetailOpen(true);
            }}
            className="action-btn-view"
          />
        </Tooltip>
      ),
    },
  ];
  const rowSelection = {
    selectedRowKeys,

    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },

    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily: "'Be Vietnam Pro', -apple-system, sans-serif",
        },
      }}
    >
      <div className="audit-editorial-layout">
        <div className="audit-editorial-container">
          {/* HEADER BAR */}
          <PageHeroHeader
            badge="HỆ THỐNG AN NINH & GIÁM SÁT TỐI CAO"
            title="NHẬT KÝ HOẠT ĐỘNG (AUDIT LOGS)"
            description="Lưu vết thời gian thực tất cả biến động dữ liệu và thao tác vận
                hành Giáo xứ."
            onRefresh={fetchLogs}
            refreshLoading={loading}
          />
          {/* STATS BENTO GRID */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <StatCard
                title="Bản ghi trong bộ lọc"
                value={totalLogs}
                prefix={<CloudServerOutlined className="stat-icon navy" />}
                style={{ borderLeft: "4px solid " + primaryNavy }}
              />
            </Col>

            <Col xs={24} sm={8}>
              <StatCard
                title=" Thay đổi cấu trúc / Nghiệp vụ"
                value={sysMutations}
                prefix={
                  <CloudServerOutlined
                    className="stat-icon navy"
                    style={{
                      color: accentGold,
                    }}
                  />
                }
                style={{
                  borderLeft: "4px solid " + primaryNavy,
                  color: accentGold,
                }}
              />
            </Col>

            <Col xs={24} sm={8}>
              <StatCard
                title="   Thao tác nguy hiểm (Xóa/Cấp lại)"
                value={criticalActions}
                prefix={
                  <CloudServerOutlined
                    className="stat-icon navy"
                    style={{
                      color: "red",
                    }}
                  />
                }
                style={{
                  borderLeft: "4px solid " + primaryNavy,
                  color: "red",
                }}
              />
            </Col>
          </Row>

          {/* ADVANCED CONTROL FILTERS */}
          <Card bordered={false} className="filter-card">
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} lg={9}>
                <Input
                  allowClear
                  placeholder="Tìm người dùng, nội dung hoặc địa chỉ IP..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <Select
                  style={{ width: "100%" }}
                  value={actionFilter}
                  onChange={setActionFilter}
                  className="custom-filter-select"
                >
                  <Option value="all">Tất cả nhóm hành động</Option>
                  <Option value="LOGIN">LOGIN (Đăng nhập)</Option>
                  <Option value="CREATE_ADMIN">
                    CREATE_ADMIN (Khởi tạo mới)
                  </Option>
                  <Option value="UPDATE_ADMIN">
                    UPDATE_ADMIN (Cập nhật dữ liệu)
                  </Option>
                  <Option value="DELETE_ADMIN">
                    DELETE_ADMIN (Xóa tài khoản)
                  </Option>
                  <Option value="RESET_PASSWORD">
                    RESET_PASSWORD (Cấp mật khẩu)
                  </Option>
                </Select>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates)}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} lg={3}>
                <Button
                  block
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setSearch("");
                    setActionFilter("all");
                    setDateRange(null);
                  }}
                  className="clear-filter-btn"
                >
                  Đặt lại
                </Button>
              </Col>
            </Row>
          </Card>

          {/* MAIN TABLE CARD */}
          <Card bordered={false} className="main-table-card">
            {/* TOOLBAR */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <div>
                {selectedRowKeys.length > 0 ? (
                  <Text
                    style={{
                      color: primaryNavy,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Đã chọn{" "}
                    <span
                      style={{
                        color: accentGold,
                        fontWeight: 800,
                      }}
                    >
                      {selectedRowKeys.length}
                    </span>{" "}
                    log
                  </Text>
                ) : (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 13,
                    }}
                  >
                    Chọn các bản ghi cần thao tác
                  </Text>
                )}
              </div>

              <Space wrap>
                {selectedRowKeys.length > 0 && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleting}
                    onClick={handleDeleteSelected}
                    style={{
                      borderRadius: 10,
                      fontWeight: 600,
                    }}
                  >
                    Xóa {selectedRowKeys.length} log
                  </Button>
                )}
              </Space>
            </div>

            <Table
              rowKey="id"
              rowSelection={rowSelection}
              loading={loading || deleting}
              columns={columns}
              dataSource={filteredLogs}
              pagination={{
                pageSize: 12,
                showTotal: (total) =>
                  `Tổng cộng: ${total} vết bản ghi hệ thống`,
                style: {
                  marginTop: 20,
                },
              }}
              scroll={{ x: 900 }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* INSPECT DRAWER */}
        <Drawer
          title={
            <div className="drawer-title-box">
              <CodeOutlined style={{ color: accentGold }} />
              <span>Cấu Trúc Gói Tin Dữ Liệu (Payload)</span>
            </div>
          }
          width={520}
          onClose={() => setDetailOpen(false)}
          open={detailOpen}
          className="editorial-drawer"
        >
          {selectedLog && (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Card size="small" bordered={false} className="modal-prayer-card">
                <Descriptions
                  column={1}
                  size="small"
                  bordered
                  className="custom-modal-desc"
                >
                  <Descriptions.Item label="Mã log ID">
                    #{selectedLog.id}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người thực hiện">
                    <strong style={{ color: primaryNavy }}>
                      {selectedLog.full_name || "Hệ thống tự động"}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã hành động">
                    <Badge
                      color={getActionConfig(selectedLog.action).color}
                      text={
                        <span style={{ fontWeight: 700, color: primaryNavy }}>
                          {selectedLog.action}
                        </span>
                      }
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi nhận lúc">
                    {dayjs(selectedLog.created_at).format(
                      "HH:mm:ss — DD/MM/YYYY",
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ IP nguồn">
                    {selectedLog.ip_address || "Mạng nội bộ"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <div>
                <Text
                  strong
                  style={{
                    color: primaryNavy,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Mô tả chi tiết nghiệp vụ:
                </Text>
                <div className="description-text-box">
                  {selectedLog.description}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text strong style={{ color: primaryNavy, fontSize: 13 }}>
                    Gói tin định danh đối tượng hệ thống:
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: accentGold,
                      fontWeight: 700,
                    }}
                  >
                    Target Payload
                  </Text>
                </div>

                <pre className="payload-json-box">
                  {JSON.stringify(
                    {
                      target_type: selectedLog.target_type || "admins",
                      target_id: selectedLog.target_id || null,
                      action_code: selectedLog.action,
                      security_status: "VERIFIED_AUDITED",
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </Space>
          )}
        </Drawer>

        {/* STYLES SCOPED */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

            .audit-editorial-layout {
              background: ${softBg};
              min-height: 100vh;
              padding: 40px 20px 80px 20px;
              font-family: 'Be Vietnam Pro', sans-serif;
              color: ${textDark};
            }

            .audit-editorial-container {
              max-width: 1100px;
              margin: 0 auto;
            }

            /* Header Section */
            .audit-header-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-bottom: 28px;
              flex-wrap: wrap;
              gap: 16px;
            }

            .sacred-badge {
              background: rgba(212, 175, 55, 0.15);
              border: 1px solid ${accentGold};
              color: ${primaryNavy};
              padding: 4px 14px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              display: inline-flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 10px;
            }

            .audit-main-title {
              font-family: 'Playfair Display', Georgia, serif !important;
              color: ${primaryNavy} !important;
              margin: 0 !important;
              font-weight: 700 !important;
              font-size: clamp(24px, 3.5vw, 32px) !important;
            }

            .audit-sub-title {
              color: #64748b;
              margin: 4px 0 0 0 !important;
              font-size: 14px;
            }

            .refresh-btn {
              border-radius: 10px !important;
              border-color: rgba(27, 54, 93, 0.2) !important;
              color: ${primaryNavy} !important;
              font-weight: 600;
              height: 42px;
            }

            /* Stats Bento Cards */
            .stat-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
            }

            .stat-icon {
              margin-right: 8px;
            }
            .stat-icon.navy { color: ${primaryNavy}; }
            .stat-icon.gold { color: ${accentGold}; }
            .stat-icon.red { color: #c62828; }

            /* Filter Card */
            .filter-card {
              border-radius: 16px !important;
              background: #ffffff !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              margin-bottom: 20px;
              padding: 4px;
            }

            .custom-filter-input {
              border-radius: 10px !important;
              height: 40px !important;
            }

            .custom-filter-select .ant-select-selector {
              border-radius: 10px !important;
              height: 40px !important;
              display: flex;
              align-items: center;
            }

            .clear-filter-btn {
              border-radius: 10px !important;
              height: 40px !important;
              color: #64748b !important;
            }

            /* Main Table Card */
            .main-table-card {
              border-radius: 20px !important;
              background: #ffffff !important;
              border: 1px solid rgba(212, 175, 55, 0.25) !important;
              box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
              padding: 8px;
            }

            .custom-admin-table .ant-table-thead > tr > th {
              background: ${softBg} !important;
              color: ${primaryNavy} !important;
              font-weight: 700 !important;
              border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
            }

            .gold-category-tag {
              background: rgba(212, 175, 55, 0.12) !important;
              border: 1px solid ${accentGold} !important;
              color: ${primaryNavy} !important;
              border-radius: 6px;
              font-weight: 600;
              font-size: 10px;
            }

            .action-btn-view:hover {
              background: rgba(27, 54, 93, 0.1) !important;
            }

            /* Drawer Style */
            .drawer-title-box {
              display: flex;
              align-items: center;
              gap: 8px;
              font-family: 'Playfair Display', serif;
              color: ${primaryNavy};
              font-size: 18px;
              font-weight: 700;
            }

            .modal-prayer-card {
              border-radius: 12px !important;
              border: 1px solid rgba(27, 54, 93, 0.08) !important;
              background: ${softBg} !important;
            }

            .custom-modal-desc {
              border-radius: 12px;
              overflow: hidden;
            }

            .description-text-box {
              background: ${softBg};
              padding: 14px;
              border-radius: 10px;
              border: 1px solid rgba(27, 54, 93, 0.1);
              font-size: 13px;
              color: ${textDark};
              line-height: 1.6;
              font-weight: 500;
            }

            .payload-json-box {
              background: ${primaryNavy};
              color: ${accentGold};
              padding: 16px;
              border-radius: 10px;
              overflow-x: auto;
              font-family: 'Fira Code', monospace;
              font-size: 12px;
              margin: 0;
              border: 1px solid ${accentGold};
            }
          `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
