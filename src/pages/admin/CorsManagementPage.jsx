import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CheckCircleFilled,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
  SafetyCertificateOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";

import corsApi from "../../api/corsApi";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import StatCard from "../../components/common/StatCard";

const { Text, Paragraph } = Typography;

/* =========================================================
   DESIGN TOKENS
========================================================= */

const COLORS = {
  navy: "#1B365D",
  navyDark: "#102A43",
  navyLight: "#EEF3F8",

  gold: "#D4AF37",
  goldLight: "#FBF7E8",

  green: "#16A34A",
  greenLight: "#ECFDF3",

  red: "#DC2626",
  redLight: "#FEF2F2",

  orange: "#D97706",
  orangeLight: "#FFF7ED",

  text: "#1E293B",
  textSecondary: "#64748B",
  border: "rgba(27, 54, 93, 0.09)",

  background: "#F8FAFC",
  white: "#FFFFFF",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeOrigin = (value) => {
  if (!value) return "";

  return String(value).trim().replace(/\/+$/, "");
};

const validateOrigin = (_, value) => {
  if (!value) {
    return Promise.reject(new Error("Vui lòng nhập domain"));
  }

  const origin = normalizeOrigin(value);

  try {
    const url = new URL(origin);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return Promise.reject(
        new Error("Domain phải sử dụng http:// hoặc https://"),
      );
    }

    if (url.pathname !== "/" && url.pathname !== "") {
      return Promise.reject(
        new Error("Không nhập pathname. Ví dụ: https://giaolyso.site"),
      );
    }

    if (url.search || url.hash) {
      return Promise.reject(
        new Error("Domain không được chứa query hoặc hash"),
      );
    }

    if (url.username || url.password) {
      return Promise.reject(
        new Error("Domain không được chứa username hoặc password"),
      );
    }

    return Promise.resolve();
  } catch {
    return Promise.reject(
      new Error("Domain không hợp lệ. Ví dụ: https://giaolyso.site"),
    );
  }
};

/* =========================================================
   COMPONENT
========================================================= */

const CorsManagementPage = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [data, setData] = useState([]);

  const [openModal, setOpenModal] = useState(false);

  const [togglingId, setTogglingId] = useState(null);

  /* =======================================================
     LOAD CORS
  ======================================================= */

  const loadCors = useCallback(async () => {
    try {
      setLoading(true);

      const response = await corsApi.getAll();

      const rows =
        response?.data?.data || response?.data?.rows || response?.data || [];

      setData(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("LOAD CORS ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách CORS",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCors();
  }, [loadCors]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const total = data.length;

    const active = data.filter((item) => Number(item.is_active) === 1).length;

    const inactive = total - active;

    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      total,
      active,
      inactive,
      activePercent,
    };
  }, [data]);

  /* =======================================================
     CREATE MODAL
  ======================================================= */

  const handleOpenCreate = () => {
    form.resetFields();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    if (submitting) return;

    form.resetFields();
    setOpenModal(false);
  };

  /* =======================================================
     CREATE
  ======================================================= */

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();

      const origin = normalizeOrigin(values.origin);

      setSubmitting(true);

      await corsApi.create({
        origin,
        description: values.description?.trim() || null,
        is_active: 1,
      });

      message.success("Thêm domain CORS thành công");

      setOpenModal(false);

      form.resetFields();

      await loadCors();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("CREATE CORS ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể thêm domain");
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const handleToggle = useCallback(
    async (record) => {
      if (!record?.id) return;

      try {
        setTogglingId(record.id);

        await corsApi.toggle(record.id);

        const isActive = Number(record.is_active) === 1;

        message.success(
          isActive
            ? `Đã tắt ${record.origin}`
            : `Đã kích hoạt ${record.origin}`,
        );

        await loadCors();
      } catch (error) {
        console.error("TOGGLE CORS ERROR:", error);

        message.error(
          error?.response?.data?.message ||
            "Không thể thay đổi trạng thái domain",
        );
      } finally {
        setTogglingId(null);
      }
    },
    [loadCors],
  );
  /* =======================================================
     DELETE
  ======================================================= */
  const handleDelete = useCallback(
    (record) => {
      Modal.confirm({
        centered: true,

        icon: (
          <div className="cors-confirm-icon">
            <DeleteOutlined />
          </div>
        ),

        title: "Xóa domain CORS?",

        content: (
          <div className="cors-delete-content">
            <Paragraph
              type="secondary"
              style={{
                marginBottom: 14,
              }}
            >
              Domain này sẽ không còn được phép truy cập API của hệ thống.
            </Paragraph>

            <div className="cors-delete-domain">
              <GlobalOutlined />
              <span>{record.origin}</span>
            </div>

            {Number(record.is_active) === 1 && (
              <Alert
                type="warning"
                showIcon
                message="Domain hiện đang hoạt động"
                description="Sau khi xóa, các request từ domain này sẽ bị CORS từ chối."
                style={{
                  marginTop: 14,
                  borderRadius: 10,
                }}
              />
            )}
          </div>
        ),

        okText: "Xóa domain",
        cancelText: "Hủy",

        okButtonProps: {
          danger: true,
          icon: <DeleteOutlined />,
        },

        async onOk() {
          try {
            await corsApi.remove(record.id);

            message.success("Đã xóa domain CORS");

            await loadCors();
          } catch (error) {
            console.error("DELETE CORS ERROR:", error);

            message.error(
              error?.response?.data?.message || "Không thể xóa domain",
            );

            throw error;
          }
        },
      });
    },
    [loadCors],
  );
  /* =======================================================
     COPY
  ======================================================= */

  const handleCopy = async (origin) => {
    try {
      if (!navigator?.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(origin);

      message.success("Đã copy domain");
    } catch (error) {
      console.error("COPY ERROR:", error);

      message.error("Không thể copy domain");
    }
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = useMemo(
    () => [
      {
        title: "DOMAIN / ORIGIN",
        dataIndex: "origin",
        key: "origin",
        width: 420,

        render: (origin) => (
          <div className="cors-domain-cell">
            <div className="cors-domain-icon">
              <GlobalOutlined />
            </div>

            <div className="cors-domain-info">
              <Tooltip title={origin}>
                <Text strong className="cors-domain-name" ellipsis>
                  {origin}
                </Text>
              </Tooltip>

              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                className="cors-copy-btn"
                onClick={() => handleCopy(origin)}
              >
                Sao chép
              </Button>
            </div>
          </div>
        ),
      },

      {
        title: "MÔ TẢ",
        dataIndex: "description",
        key: "description",
        width: 280,

        render: (description) =>
          description ? (
            <Tooltip title={description}>
              <Text
                ellipsis
                style={{
                  display: "block",
                  maxWidth: 240,
                  color: COLORS.text,
                }}
              >
                {description}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary">Chưa có mô tả</Text>
          ),
      },

      {
        title: "TRẠNG THÁI",
        dataIndex: "is_active",
        key: "is_active",
        width: 170,

        render: (isActive) => {
          const active = Number(isActive) === 1;

          return active ? (
            <Tag
              icon={<CheckCircleOutlined />}
              className="cors-status-tag active"
            >
              ĐANG HOẠT ĐỘNG
            </Tag>
          ) : (
            <Tag
              icon={<CloseCircleOutlined />}
              className="cors-status-tag inactive"
            >
              ĐANG TẮT
            </Tag>
          );
        },
      },

      {
        title: "KÍCH HOẠT",
        dataIndex: "is_active",
        key: "switch",
        width: 120,
        align: "center",

        render: (isActive, record) => {
          const active = Number(isActive) === 1;

          return (
            <Tooltip title={active ? "Tắt domain" : "Kích hoạt domain"}>
              <Switch
                checked={active}
                loading={togglingId === record.id}
                onChange={() => handleToggle(record)}
              />
            </Tooltip>
          );
        },
      },

      {
        title: "",
        key: "actions",
        width: 70,
        align: "right",

        render: (_, record) => (
          <Tooltip title="Xóa domain">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="cors-delete-btn"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        ),
      },
    ],
    [handleToggle, handleDelete, togglingId],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <div className="cors-page">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="cors-header">
          <PageHeroHeader
            badge="HỆ THỐNG ĐIỀU HÀNH DOMAIN"
            title="QUẢN LÝ CORS"
            description="Quản lý các domain được phép truy cập API hệ thống."
            onRefresh={loadCors}
            refreshLoading={loading}
            actionText="Thêm domain"
            actionIcon={<PlusOutlined />}
            onAction={handleOpenCreate}
          />
        </div>

        {/* =================================================
            SYSTEM STATUS
        ================================================= */}

        <Card bordered={false} className="cors-system-card">
          <div className="cors-system-content">
            <div className="cors-system-icon">
              <SafetyCertificateFilled />
            </div>

            <div className="cors-system-info">
              <div className="cors-system-title">
                <Text strong>CORS đang hoạt động bình thường</Text>

                <Tag icon={<ThunderboltFilled />} className="cors-realtime-tag">
                  REALTIME
                </Tag>
              </div>

              <Text className="cors-system-description">
                Danh sách domain được lưu trực tiếp trên server. Khi thêm, xóa
                hoặc bật/tắt domain, cấu hình CORS sẽ được cập nhật mà không cần
                restart PM2.
              </Text>
            </div>

            <div className="cors-system-status">
              <span className="cors-status-dot" />
              <span>Server Online</span>
            </div>
          </div>
        </Card>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="cors-section-title">
          <div>
            <Text className="section-eyebrow">OVERVIEW</Text>

            <Text className="section-title">Tổng quan hệ thống</Text>
          </div>

          <Text className="section-description">
            Theo dõi nhanh trạng thái các domain
          </Text>
        </div>

        <Row gutter={[16, 16]} className="cors-stat-row">
          <Col xs={24} sm={12} lg={8}>
            <div className="cors-stat-wrapper total">
              <StatCard
                title="Tổng domain"
                value={statistics.total}
                prefix={<GlobalOutlined />}
                className="cors-stat-card"
              />

              <div className="cors-stat-accent" />
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div className="cors-stat-wrapper active">
              <StatCard
                title="Đang hoạt động"
                value={statistics.active}
                prefix={<CheckCircleOutlined />}
                valueColor={COLORS.green}
                className="cors-stat-card"
              />

              <div className="cors-stat-footer">
                <CheckCircleFilled />
                <span>{statistics.activePercent}% hệ thống</span>
              </div>

              <div className="cors-stat-accent" />
            </div>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <div className="cors-stat-wrapper inactive">
              <StatCard
                title="Đang tắt"
                value={statistics.inactive}
                prefix={<CloseCircleOutlined />}
                valueColor={COLORS.red}
                className="cors-stat-card"
              />

              <div className="cors-stat-footer">
                <InfoCircleOutlined />
                <span>Không được phép truy cập API</span>
              </div>

              <div className="cors-stat-accent" />
            </div>
          </Col>
        </Row>

        {/* =================================================
            DOMAIN TABLE
        ================================================= */}

        <Card bordered={false} className="cors-table-card">
          <div className="cors-table-header">
            <div>
              <div className="cors-table-title-row">
                <div className="cors-table-title-icon">
                  <GlobalOutlined />
                </div>

                <div>
                  <Text className="cors-table-title">Danh sách domain</Text>

                  <Text className="cors-table-subtitle">
                    Chỉ domain đang bật mới được phép gọi API.
                  </Text>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              className="cors-add-btn"
            >
              Thêm domain
            </Button>
          </div>

          <Divider className="cors-table-divider" />

          <div className="cors-table-wrapper">
            <Table
              rowKey="id"
              loading={{
                spinning: loading,
                indicator: (
                  <Spin size="large" indicator={<ReloadOutlined spin />} />
                ),
              }}
              columns={columns}
              dataSource={data}
              scroll={{
                x: 900,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50],
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} / ${total} domain`,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={
                      <div className="cors-empty-icon">
                        <GlobalOutlined />
                      </div>
                    }
                    description={
                      <div className="cors-empty-content">
                        <Text strong>Chưa có domain CORS</Text>

                        <Text type="secondary">
                          Thêm domain đầu tiên để cho phép website truy cập API.
                        </Text>
                      </div>
                    }
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleOpenCreate}
                      className="cors-empty-btn"
                    >
                      Thêm domain đầu tiên
                    </Button>
                  </Empty>
                ),
              }}
            />
          </div>
        </Card>

        {/* =================================================
            CREATE MODAL
        ================================================= */}

        <Modal
          open={openModal}
          centered
          width={540}
          title={
            <div className="cors-modal-title">
              <div className="cors-modal-icon">
                <GlobalOutlined />
              </div>

              <div>
                <Text className="cors-modal-heading">Thêm domain CORS</Text>

                <Text className="cors-modal-subheading">
                  Cấp quyền truy cập API cho website
                </Text>
              </div>
            </div>
          }
          okText="Thêm domain"
          cancelText="Hủy"
          onCancel={handleCloseModal}
          onOk={handleCreate}
          confirmLoading={submitting}
          destroyOnHidden
          className="cors-create-modal"
        >
          <div className="cors-modal-body">
            <Alert
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              message="Nhập Origin của website"
              description={
                <div>
                  <div>Ví dụ đúng:</div>

                  <code>https://giaolyso.site</code>

                  <div
                    style={{
                      marginTop: 6,
                    }}
                  >
                    Không nhập:
                  </div>

                  <code>https://giaolyso.site/login</code>
                </div>
              }
              className="cors-input-alert"
            />

            <Form form={form} layout="vertical" requiredMark="optional">
              <Form.Item
                label={<span className="cors-form-label">Domain / Origin</span>}
                name="origin"
                rules={[
                  {
                    validator: validateOrigin,
                  },
                ]}
                extra="Sử dụng http:// hoặc https://"
              >
                <Input
                  size="large"
                  prefix={<GlobalOutlined />}
                  placeholder="https://example.com"
                  autoComplete="off"
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label={<span className="cors-form-label">Mô tả</span>}
                name="description"
                extra="Giúp m dễ nhận biết domain này thuộc website nào."
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Ví dụ: Website FaithEdu"
                  maxLength={255}
                  showCount
                />
              </Form.Item>
            </Form>

            <div className="cors-modal-note">
              <SafetyCertificateOutlined />

              <div>
                <Text strong>Domain sẽ được kích hoạt ngay</Text>

                <Text type="secondary">
                  Sau khi thêm, website có thể gọi API mà không cần restart
                  server.
                </Text>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* ===================================================
          PAGE CSS
      =================================================== */}

      <style>
        {`
          /* ================================================
             PAGE
          ================================================ */

          .cors-page {
            min-height: 100%;
            padding: 24px;
            background: ${COLORS.background};
            color: ${COLORS.text};
          }

          .cors-header {
            margin-bottom: 20px;
          }

          /* ================================================
             SYSTEM CARD
          ================================================ */

          .cors-system-card {
            margin-bottom: 28px;
            border: 1px solid rgba(22, 163, 74, 0.12) !important;
            border-radius: 16px !important;
            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #f8fffa 100%
              ) !important;
            box-shadow:
              0 4px 18px rgba(27, 54, 93, 0.035) !important;
          }

          .cors-system-card .ant-card-body {
            padding: 17px 20px !important;
          }

          .cors-system-content {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .cors-system-icon {
            width: 44px;
            height: 44px;
            flex: 0 0 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            color: ${COLORS.green};
            background: ${COLORS.greenLight};
            font-size: 21px;
          }

          .cors-system-info {
            flex: 1;
            min-width: 0;
          }

          .cors-system-title {
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 3px;
          }

          .cors-system-title .ant-typography {
            color: ${COLORS.text};
            font-size: 14px;
          }

          .cors-system-description {
            display: block;
            color: ${COLORS.textSecondary};
            font-size: 12px;
            line-height: 1.55;
          }

          .cors-realtime-tag {
            margin: 0 !important;
            border: 0 !important;
            border-radius: 6px !important;
            background: ${COLORS.greenLight} !important;
            color: ${COLORS.green} !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            letter-spacing: .4px;
          }

          .cors-system-status {
            display: flex;
            align-items: center;
            gap: 7px;
            flex-shrink: 0;
            padding: 7px 11px;
            border-radius: 8px;
            background: #F8FAFC;
            color: ${COLORS.textSecondary};
            font-size: 11px;
            font-weight: 600;
          }

          .cors-status-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: ${COLORS.green};
            box-shadow:
              0 0 0 4px rgba(22, 163, 74, .1);
          }

          /* ================================================
             SECTION TITLE
          ================================================ */

          .cors-section-title {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 13px;
          }

          .section-eyebrow {
            display: block;
            margin-bottom: 3px;
            color: ${COLORS.gold} !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            letter-spacing: 1.4px;
          }

          .section-title {
            display: block;
            color: ${COLORS.navy} !important;
            font-family: "Playfair Display", serif;
            font-size: 20px;
            font-weight: 700;
          }

          .section-description {
            color: ${COLORS.textSecondary} !important;
            font-size: 12px;
          }

          .cors-stat-row {
            margin-bottom: 28px;
          }

          /* ================================================
             STAT CARDS
          ================================================ */

          .cors-stat-wrapper {
            position: relative;
            height: 100%;
            overflow: hidden;
            border-radius: 16px;
          }

          .cors-stat-card {
            height: 100%;
          }

          .cors-stat-accent {
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            border-radius: 16px 0 0 16px;
            background: ${COLORS.navy};
            pointer-events: none;
          }

          .cors-stat-wrapper.active .cors-stat-accent {
            background: ${COLORS.green};
          }

          .cors-stat-wrapper.inactive .cors-stat-accent {
            background: ${COLORS.red};
          }

          .cors-stat-footer {
            position: absolute;
            right: 18px;
            bottom: 14px;
            display: flex;
            align-items: center;
            gap: 5px;
            color: ${COLORS.textSecondary};
            font-size: 10px;
            font-weight: 500;
            pointer-events: none;
          }

          .cors-stat-footer svg {
            font-size: 11px;
          }

          .cors-stat-wrapper.active .cors-stat-footer svg {
            color: ${COLORS.green};
          }

          .cors-stat-wrapper.inactive .cors-stat-footer svg {
            color: ${COLORS.red};
          }

          /* ================================================
             TABLE CARD
          ================================================ */

          .cors-table-card {
            overflow: hidden;
            border: 1px solid ${COLORS.border} !important;
            border-radius: 18px !important;
            background: ${COLORS.white} !important;
            box-shadow:
              0 5px 20px rgba(27, 54, 93, 0.035) !important;
          }

          .cors-table-card .ant-card-body {
            padding: 0 !important;
          }

          .cors-table-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 20px 22px 17px;
          }

          .cors-table-title-row {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .cors-table-title-icon {
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: ${COLORS.navyLight};
            color: ${COLORS.navy};
            font-size: 17px;
          }

          .cors-table-title {
            display: block;
            color: ${COLORS.text} !important;
            font-size: 15px !important;
            font-weight: 700 !important;
          }

          .cors-table-subtitle {
            display: block;
            margin-top: 2px;
            color: ${COLORS.textSecondary} !important;
            font-size: 11px !important;
          }

          .cors-add-btn {
            height: 38px !important;
            border-radius: 9px !important;
            background: ${COLORS.navy} !important;
            border-color: ${COLORS.navy} !important;
            box-shadow:
              0 4px 10px rgba(27, 54, 93, 0.14) !important;
            font-weight: 600;
          }

          .cors-add-btn:hover {
            background: ${COLORS.navyDark} !important;
            border-color: ${COLORS.navyDark} !important;
          }

          .cors-table-divider {
            margin: 0 !important;
            border-color: rgba(27, 54, 93, 0.07) !important;
          }

          .cors-table-wrapper {
            padding: 0 8px 8px;
          }

          .cors-table-wrapper .ant-table {
            background: transparent;
          }

          .cors-table-wrapper .ant-table-thead > tr > th {
            padding: 14px 14px !important;
            border-bottom: 1px solid rgba(27, 54, 93, 0.07) !important;
            background: #FAFBFC !important;
            color: #64748B !important;
            font-size: 10px !important;
            font-weight: 800 !important;
            letter-spacing: .55px;
          }

          .cors-table-wrapper .ant-table-tbody > tr > td {
            padding: 14px !important;
            border-bottom: 1px solid rgba(27, 54, 93, 0.055) !important;
          }

          .cors-table-wrapper .ant-table-tbody > tr:last-child > td {
            border-bottom: 0 !important;
          }

          .cors-table-wrapper .ant-table-tbody > tr {
            transition: background .18s ease;
          }

          .cors-table-wrapper .ant-table-tbody > tr:hover > td {
            background: #FBFCFE !important;
          }

          /* ================================================
             DOMAIN
          ================================================ */

          .cors-domain-cell {
            display: flex;
            align-items: center;
            gap: 11px;
            min-width: 0;
          }

          .cors-domain-icon {
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            background: ${COLORS.navyLight};
            color: ${COLORS.navy};
            font-size: 16px;
          }

          .cors-domain-info {
            min-width: 0;
          }

          .cors-domain-name {
            display: block;
            max-width: 330px;
            color: ${COLORS.text} !important;
            font-family: "SFMono-Regular",
              Consolas,
              "Liberation Mono",
              monospace;
            font-size: 12px !important;
          }

          .cors-copy-btn {
            margin-top: 1px;
            padding: 0 !important;
            height: 20px !important;
            color: ${COLORS.navy} !important;
            font-size: 10px !important;
          }

          .cors-copy-btn:hover {
            color: ${COLORS.gold} !important;
          }

          /* ================================================
             STATUS
          ================================================ */

          .cors-status-tag {
            margin: 0 !important;
            padding: 4px 8px !important;
            border: 0 !important;
            border-radius: 7px !important;
            font-size: 9px !important;
            font-weight: 800 !important;
            letter-spacing: .3px;
          }

          .cors-status-tag.active {
            background: ${COLORS.greenLight} !important;
            color: ${COLORS.green} !important;
          }

          .cors-status-tag.inactive {
            background: #F1F5F9 !important;
            color: #64748B !important;
          }

          .cors-delete-btn {
            width: 34px;
            height: 34px;
            border-radius: 8px !important;
          }

          .cors-delete-btn:hover {
            background: ${COLORS.redLight} !important;
          }

          /* ================================================
             EMPTY
          ================================================ */

          .cors-empty-icon {
            width: 64px;
            height: 64px;
            margin: 0 auto 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
            background: ${COLORS.navyLight};
            color: ${COLORS.navy};
            font-size: 28px;
          }

          .cors-empty-content {
            display: flex;
            flex-direction: column;
            gap: 3px;
          }

          .cors-empty-content .ant-typography:first-child {
            color: ${COLORS.text};
            font-size: 13px;
          }

          .cors-empty-content .ant-typography:last-child {
            font-size: 11px;
          }

          .cors-empty-btn {
            margin-top: 10px;
            border-radius: 8px !important;
            background: ${COLORS.navy} !important;
            border-color: ${COLORS.navy} !important;
          }

          /* ================================================
             CREATE MODAL
          ================================================ */

          .cors-create-modal .ant-modal-content {
            overflow: hidden;
            padding: 0 !important;
            border-radius: 18px !important;
          }

          .cors-create-modal .ant-modal-header {
            margin: 0 !important;
            padding: 20px 22px !important;
            border-bottom: 1px solid rgba(27, 54, 93, 0.07);
          }

          .cors-create-modal .ant-modal-body {
            padding: 0 !important;
          }

          .cors-create-modal .ant-modal-footer {
            margin: 0 !important;
            padding: 14px 22px 18px !important;
            border-top: 1px solid rgba(27, 54, 93, 0.07);
          }

          .cors-modal-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .cors-modal-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 11px;
            background: ${COLORS.goldLight};
            color: ${COLORS.gold};
            font-size: 18px;
          }

          .cors-modal-heading {
            display: block;
            color: ${COLORS.text} !important;
            font-size: 15px !important;
            font-weight: 700 !important;
          }

          .cors-modal-subheading {
            display: block;
            margin-top: 2px;
            color: ${COLORS.textSecondary} !important;
            font-size: 11px !important;
            font-weight: 400 !important;
          }

          .cors-modal-body {
            padding: 20px 22px 6px;
          }

          .cors-input-alert {
            margin-bottom: 20px;
            border-radius: 11px !important;
          }

          .cors-input-alert code {
            display: inline-block;
            margin-top: 3px;
            padding: 2px 6px;
            border-radius: 5px;
            background: rgba(27, 54, 93, .06);
            color: ${COLORS.navy};
            font-size: 11px;
          }

          .cors-form-label {
            color: ${COLORS.text};
            font-size: 12px;
            font-weight: 600;
          }

          .cors-create-modal .ant-form-item-label {
            padding-bottom: 5px !important;
          }

          .cors-create-modal .ant-form-item-explain,
          .cors-create-modal .ant-form-item-extra {
            margin-top: 4px;
            color: ${COLORS.textSecondary};
            font-size: 10px;
          }

          .cors-create-modal .ant-input,
          .cors-create-modal .ant-input-affix-wrapper {
            border-radius: 9px !important;
          }

          .cors-create-modal .ant-input-affix-wrapper-lg {
            min-height: 42px;
          }

          .cors-modal-note {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin: 5px 0 13px;
            padding: 12px;
            border: 1px solid rgba(212, 175, 55, .18);
            border-radius: 10px;
            background: ${COLORS.goldLight};
          }

          .cors-modal-note > svg {
            margin-top: 2px;
            flex-shrink: 0;
            color: ${COLORS.gold};
          }

          .cors-modal-note div {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .cors-modal-note .ant-typography {
            font-size: 10px;
          }

          .cors-modal-note .ant-typography:first-child {
            color: ${COLORS.text};
            font-size: 11px;
          }

          .cors-create-modal .ant-btn-primary {
            border-radius: 8px !important;
            background: ${COLORS.navy} !important;
            border-color: ${COLORS.navy} !important;
          }

          /* ================================================
             DELETE CONFIRM
          ================================================ */

          .cors-confirm-icon {
            width: 38px;
            height: 38px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
            border-radius: 10px;
            background: ${COLORS.redLight};
            color: ${COLORS.red};
          }

          .cors-delete-content {
            margin-top: 8px;
          }

          .cors-delete-domain {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 11px 12px;
            border: 1px solid rgba(27, 54, 93, .08);
            border-radius: 9px;
            background: #F8FAFC;
            color: ${COLORS.navy};
            font-family: monospace;
            font-size: 11px;
            word-break: break-all;
          }

          /* ================================================
             RESPONSIVE
          ================================================ */

          @media (max-width: 768px) {
            .cors-page {
              padding: 16px;
            }

            .cors-system-content {
              align-items: flex-start;
            }

            .cors-system-status {
              display: none;
            }

            .cors-section-title {
              align-items: flex-start;
              flex-direction: column;
              gap: 4px;
            }

            .cors-table-header {
              align-items: flex-start;
              flex-direction: column;
              padding: 17px;
            }

            .cors-add-btn {
              width: 100%;
            }

            .cors-table-wrapper {
              padding: 0 4px 4px;
            }
          }

          @media (max-width: 480px) {
            .cors-page {
              padding: 12px;
            }

            .cors-system-card .ant-card-body {
              padding: 14px !important;
            }

            .cors-system-description {
              font-size: 11px;
            }

            .section-title {
              font-size: 18px;
            }

            .cors-table-title-icon {
              width: 34px;
              height: 34px;
            }

            .cors-domain-icon {
              width: 34px;
              height: 34px;
              flex-basis: 34px;
            }

            .cors-domain-name {
              max-width: 220px;
            }
          }
        `}
      </style>
    </>
  );
};

export default CorsManagementPage;
