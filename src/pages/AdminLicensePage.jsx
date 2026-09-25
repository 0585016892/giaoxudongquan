import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  EyeOutlined,
  FileImageOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  WalletOutlined,
  HistoryOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import adminLicenseApi from "../api/adminLicenseApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ============================================================
   HELPERS
============================================================ */

const getData = (response) => {
  if (!response) return null;

  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

const getList = (response) => {
  const data = getData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.registrations)) {
    return data.registrations;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getDetail = (response) => {
  const data = getData(response);

  if (data?.registration) {
    return data.registration;
  }

  return data;
};

const getStatus = (record) => String(record?.status || "pending").toLowerCase();

const getStatusInfo = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return {
        label: "Đã duyệt",
        color: "success",
        icon: <CheckCircleOutlined />,
      };

    case "rejected":
      return {
        label: "Từ chối",
        color: "error",
        icon: <CloseCircleOutlined />,
      };

    case "pending":
    default:
      return {
        label: "Chờ duyệt",
        color: "warning",
        icon: <ClockCircleOutlined />,
      };
  }
};

const getChurchName = (record) =>
  record?.church_name ||
  record?.churchName ||
  record?.parish_name ||
  record?.church?.name ||
  "Chưa xác định";

const getApplicantName = (record) =>
  record?.name ||
  record?.full_name ||
  record?.applicant_name ||
  record?.user_name ||
  "—";

const getPhone = (record) =>
  record?.phone || record?.phone_number || record?.applicant_phone || "—";

const getEmail = (record) => record?.email || record?.applicant_email || "—";

const getPaymentImage = (record) => {
  const image =
    record?.payment_image ||
    record?.payment_image_url ||
    record?.paymentImage ||
    null;

  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const apiUrl = process.env.REACT_APP_API_URL || "";

  return `${apiUrl.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
};

const getAmount = (record) => Number(record?.amount || record?.price || 299000);

const formatMoney = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// const formatDate = (value) => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return date.toLocaleDateString("vi-VN");
// };

const getLogStatusInfo = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return {
        label: "Đã duyệt",
        color: "success",
        icon: <CheckCircleOutlined />,
      };

    case "rejected":
      return {
        label: "Từ chối",
        color: "error",
        icon: <CloseCircleOutlined />,
      };

    case "pending":
    default:
      return {
        label: "Chờ duyệt",
        color: "warning",
        icon: <ClockCircleOutlined />,
      };
  }
};

/* ============================================================
   PAGE
============================================================ */

const AdminLicensePage = () => {
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [registrations, setRegistrations] = useState([]);

  const [selectedRegistration, setSelectedRegistration] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [rejectForm] = Form.useForm();

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);

      const response = await adminLicenseApi.getRegistrations();

      setRegistrations(getList(response));
    } catch (error) {
      console.error("GET ADMIN LICENSE ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải danh sách đăng ký.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const total = registrations.length;

    const pending = registrations.filter(
      (item) => getStatus(item) === "pending",
    ).length;

    const approved = registrations.filter(
      (item) => getStatus(item) === "approved",
    ).length;

    const rejected = registrations.filter(
      (item) => getStatus(item) === "rejected",
    ).length;

    const revenue = registrations
      .filter((item) => getStatus(item) === "approved")
      .reduce((sum, item) => sum + getAmount(item), 0);

    return {
      total,
      pending,
      approved,
      rejected,
      revenue,
    };
  }, [registrations]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredRegistrations = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return registrations.filter((item) => {
      const status = getStatus(item);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const source = [
        getChurchName(item),
        getApplicantName(item),
        getPhone(item),
        getEmail(item),
        item?.transfer_content,
        item?.transferContent,
        item?.package_name,
        item?.package_code,
        item?.church_id,
        item?.id,
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase();

      return source.includes(keyword);
    });
  }, [registrations, searchText, statusFilter]);

  /* ==========================================================
     VIEW DETAIL
  ========================================================== */

  const handleViewDetail = useCallback(async (record) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelectedRegistration(record);

      const response = await adminLicenseApi.getRegistrationById(record.id);
      const detail = getDetail(response);

      console.log("LICENSE DETAIL:", detail);

      if (detail) {
        setSelectedRegistration(detail);
      }
    } catch (error) {
      console.error("GET LICENSE DETAIL ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể tải chi tiết đăng ký.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ==========================================================
     APPROVE
  ========================================================== */

  const handleApprove = useCallback(
    (record) => {
      Modal.confirm({
        title: "Duyệt đăng ký FaithEdu",
        icon: <CheckCircleOutlined />,

        content: (
          <div style={{ lineHeight: 1.7 }}>
            <div>Xác nhận duyệt đăng ký của:</div>

            <Text strong>{getChurchName(record)}</Text>

            <div
              style={{
                marginTop: 8,
                color: "#64748b",
              }}
            >
              Sau khi duyệt, hệ thống sẽ kích hoạt license theo quy trình của
              backend.
            </div>
          </div>
        ),

        okText: "Duyệt đăng ký",
        cancelText: "Hủy",

        okButtonProps: {
          type: "primary",
        },

        onOk: async () => {
          try {
            setActionLoading(true);

            await adminLicenseApi.approveRegistration(record.id);

            message.success("Đã duyệt đăng ký FaithEdu.");

            await loadRegistrations();

            setDetailOpen(false);
            setSelectedRegistration(null);
          } catch (error) {
            console.error("APPROVE LICENSE ERROR:", error);

            message.error(
              error?.response?.data?.message || "Không thể duyệt đăng ký.",
            );

            throw error;
          } finally {
            setActionLoading(false);
          }
        },
      });
    },
    [loadRegistrations],
  );

  /* ==========================================================
     REJECT
  ========================================================== */

  const openRejectModal = useCallback(
    (record) => {
      setSelectedRegistration(record);
      rejectForm.resetFields();
      setRejectOpen(true);
    },
    [rejectForm],
  );

  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();

      if (!selectedRegistration?.id) {
        message.error("Không xác định được đăng ký.");

        return;
      }

      setActionLoading(true);

      await adminLicenseApi.rejectRegistration(
        selectedRegistration.id,
        values.reason.trim(),
      );

      message.success("Đã từ chối đăng ký.");

      setRejectOpen(false);

      rejectForm.resetFields();

      setSelectedRegistration(null);

      await loadRegistrations();
    } catch (error) {
      if (error?.errorFields) {
        return;
      }

      console.error("REJECT LICENSE ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể từ chối đăng ký.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ==========================================================
     COPY
  ========================================================== */

  const handleCopy = async (value, label = "Nội dung") => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      message.success(`${label} đã được sao chép.`);
    } catch {
      message.error("Không thể sao chép.");
    }
  };

  /* ==========================================================
     TABLE
  ========================================================== */

  const columns = useMemo(
    () => [
      {
        title: "Giáo xứ",
        key: "church",
        width: 270,

        render: (_, record) => (
          <div className="al-church">
            <Avatar
              size={44}
              icon={<ShopOutlined />}
              className="al-church-avatar"
            />

            <div className="al-church-info">
              <Text strong ellipsis className="al-church-name">
                {getChurchName(record)}
              </Text>

              <Text type="secondary" className="al-small">
                Mã đăng ký #{record?.id || "—"}
              </Text>
            </div>
          </div>
        ),
      },

      {
        title: "Người đăng ký",
        key: "applicant",
        width: 230,

        render: (_, record) => (
          <div className="al-applicant">
            <div className="al-person">
              <UserOutlined />

              <Text strong>{getApplicantName(record)}</Text>
            </div>

            <Text type="secondary" className="al-small">
              {getPhone(record)}
            </Text>

            <Text type="secondary" className="al-small">
              {getEmail(record)}
            </Text>
          </div>
        ),
      },

      {
        title: "Gói",
        key: "package",
        width: 180,

        render: (_, record) => (
          <div>
            <Text strong>
              {record?.package_name ||
                record?.packageName ||
                "FaithEdu - Giáo xứ"}
            </Text>

            <div>
              <Text type="secondary" className="al-small">
                {record?.package_code || "FAITHEDU_CHURCH"}
              </Text>
            </div>

            <div>
              <Text strong className="al-money">
                {formatMoney(getAmount(record))}
              </Text>
            </div>
          </div>
        ),
      },

      {
        title: "Trạng thái",
        key: "status",
        width: 145,

        render: (_, record) => {
          const config = getStatusInfo(getStatus(record));

          return (
            <Tag color={config.color} icon={config.icon} className="al-status">
              {config.label}
            </Tag>
          );
        },
      },

      {
        title: "Ngày đăng ký",
        key: "created_at",
        width: 175,

        render: (_, record) => (
          <Text type="secondary">
            {formatDateTime(record?.created_at || record?.createdAt)}
          </Text>
        ),
      },

      {
        title: "",
        key: "actions",
        fixed: "right",
        width: 180,

        render: (_, record) => {
          const status = getStatus(record);

          return (
            <Space size={6}>
              <Tooltip title="Xem chi tiết">
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(record)}
                />
              </Tooltip>

              {status === "pending" && (
                <>
                  <Tooltip title="Duyệt đăng ký">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleApprove(record)}
                    />
                  </Tooltip>

                  <Tooltip title="Từ chối">
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => openRejectModal(record)}
                    />
                  </Tooltip>
                </>
              )}
            </Space>
          );
        },
      },
    ],
    [handleViewDetail, handleApprove, openRejectModal],
  );

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <style>{`
        /* =====================================================
           PAGE
        ===================================================== */

        .admin-license-page {
          min-height: 100%;
          background: #f7f9fc;
          padding: 28px;
          color: #1e293b;
        }

        .admin-license-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .al-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .al-eyebrow {
          display: inline-flex;
          align-items: center;
          color: #d9a441;
          font-size: 11px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: .14em;
          margin-bottom: 8px;
        }

        .al-title {
          margin: 0 !important;
          color: #173b5e !important;
          font-weight: 800 !important;
          letter-spacing: -.02em;
        }

        .al-description {
          display: block;
          margin-top: 5px;
          font-size: 14px;
        }

        .al-refresh-btn {
          height: 42px;
          border-radius: 10px;
          padding: 0 16px;
          font-weight: 600;
        }

        /* =====================================================
           STATS
        ===================================================== */

        .al-stats {
          margin-bottom: 20px;
        }

        .al-stat-card {
          height: 100%;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          overflow: hidden;

          box-shadow:
            0 4px 18px rgba(23, 59, 94, .045);

          transition:
            transform .2s ease,
            box-shadow .2s ease;
        }

        .al-stat-card:hover {
          transform: translateY(-2px);

          box-shadow:
            0 10px 28px rgba(23, 59, 94, .08);
        }

        .al-stat-card .ant-card-body {
          padding: 20px;
        }

        .al-stat-card .ant-statistic-title {
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .al-stat-card .ant-statistic-content {
          color: #173b5e;
          font-weight: 800;
          line-height: 1.1;
        }

        .al-stat-card .ant-statistic-content-prefix {
          color: #d9a441;
          margin-right: 10px;
        }

        .al-stat-card.pending
          .ant-statistic-content-prefix {
          color: #d48806;
        }

        .al-stat-card.approved
          .ant-statistic-content-prefix {
          color: #389e0d;
        }

        .al-stat-card.rejected
          .ant-statistic-content-prefix {
          color: #cf1322;
        }

        /* =====================================================
           FILTER
        ===================================================== */

        .al-filter-card {
          margin-bottom: 16px;
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;

          box-shadow:
            0 4px 18px rgba(23, 59, 94, .035);
        }

        .al-filter-card .ant-card-body {
          padding: 16px;
        }

        .al-filter {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .al-search {
          flex: 1;
          max-width: 580px;
        }

        .al-search .ant-input-affix-wrapper {
          min-height: 42px;
          border-radius: 10px;
        }

        .al-search .ant-input {
          font-size: 14px;
        }

        .al-status-select {
          width: 210px;
        }

        .al-status-select
          .ant-select-selector {
          min-height: 42px !important;
          height: 42px !important;

          display: flex;
          align-items: center;

          border-radius: 10px !important;
        }

        /* =====================================================
           ALERT
        ===================================================== */

        .al-alert {
          margin-bottom: 16px;
          border-radius: 14px;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .al-table-card {
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          overflow: hidden;

          box-shadow:
            0 4px 18px rgba(23, 59, 94, .045);
        }

        .al-table-card .ant-card-body {
          padding: 0;
        }

        .al-table-head {
          min-height: 78px;

          padding: 18px 22px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          border-bottom: 1px solid #e2e8f0;
        }

        .al-table-title {
          margin: 0 0 2px !important;
          color: #173b5e !important;
          font-weight: 750 !important;
        }

        .al-count-badge {
          min-width: 92px;
          height: 34px;

          padding: 0 12px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 999px;

          background: #fff8e8;
          border: 1px solid #f5dfad;

          color: #9a6a00;

          font-size: 12px;
          font-weight: 700;
        }

        .al-table-card .ant-table {
          background: transparent;
        }

        .al-table-card
          .ant-table-thead
          > tr
          > th {
          background: #fafbfd !important;

          color: #64748b;

          border-bottom: 1px solid #e2e8f0;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: .055em;

          text-transform: uppercase;

          white-space: nowrap;
        }

        .al-table-card
          .ant-table-tbody
          > tr
          > td {
          border-bottom: 1px solid #eef2f7;

          padding-top: 15px;
          padding-bottom: 15px;
        }

        .al-table-card
          .ant-table-tbody
          > tr:hover
          > td {
          background: #f8fafc !important;
        }

        /* =====================================================
           CHURCH
        ===================================================== */

        .al-church {
          min-width: 200px;

          display: flex;
          align-items: center;

          gap: 11px;
        }

        .al-church-avatar {
          flex: 0 0 auto;

          background: #edf3f8 !important;
          color: #173b5e !important;
        }

        .al-church-info {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .al-church-name {
          color: #173b5e !important;
        }

        .al-small {
          font-size: 12px;
        }

        .al-money {
          color: #173b5e;
          font-size: 13px;
        }

        .al-person {
          display: flex;
          align-items: center;

          gap: 7px;

          color: #334155;
        }

        .al-person > svg {
          color: #94a3b8;
          font-size: 14px;
        }

        .al-applicant {
          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .al-status {
          border-radius: 999px;

          padding: 4px 10px;

          font-size: 12px;
          font-weight: 700;
        }

        /* =====================================================
           DETAIL MODAL
        ===================================================== */

        .al-modal-eyebrow {
          color: #d9a441;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: .12em;

          margin-bottom: 2px;
        }

        .al-detail-loading {
          min-height: 500px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .al-detail-status {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;
        }

        .al-status-large {
          border-radius: 999px;

          padding: 5px 12px;

          font-weight: 700;
        }

        .al-detail .ant-descriptions {
          border-radius: 10px;
          overflow: hidden;
        }

        .al-detail
          .ant-descriptions-item-label {
          color: #64748b;
          font-weight: 600;

          background: #fafbfd;
        }

        /* =====================================================
           DETAIL SECTION
        ===================================================== */

        .al-section-title {
          display: flex;
          align-items: center;

          gap: 11px;

          margin-bottom: 14px;
        }

        .al-section-icon {
          width: 38px;
          height: 38px;

          flex: 0 0 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #edf3f8;
          color: #173b5e;

          font-size: 17px;
        }

        .al-section-heading {
          display: block;

          color: #173b5e;

          font-size: 15px;
          line-height: 1.4;
        }

        .al-section-description {
          display: block;

          margin-top: 2px;

          font-size: 12px;
        }

        /* =====================================================
           TRANSFER CONTENT
        ===================================================== */

        .al-transfer-content {
          display: flex;
          align-items: center;

          gap: 8px;

          min-width: 0;
        }

        .al-transfer-content
          .ant-typography {
          word-break: break-word;
        }

        /* =====================================================
           LOGS
        ===================================================== */

        .al-logs {
          display: flex;
          flex-direction: column;

          border: 1px solid #e2e8f0;

          border-radius: 14px;

          overflow: hidden;

          background: #fff;
        }

        .al-log-item {
          display: flex;

          gap: 14px;

          padding: 16px 18px;

          border-bottom: 1px solid #eef2f7;
        }

        .al-log-item:last-child {
          border-bottom: none;
        }

        .al-log-icon {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #f8fafc;

          color: #173b5e;
        }

        .al-log-content {
          flex: 1;
          min-width: 0;
        }

        .al-log-top {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;
        }

        .al-log-arrow {
          color: #94a3b8;
          font-size: 13px;
        }

        .al-log-date {
          white-space: nowrap;
          font-size: 12px;
        }

        .al-log-note {
          margin-top: 8px;

          color: #334155;

          font-size: 13px;
          line-height: 1.6;
        }

        .al-log-user {
          margin-top: 5px;

          color: #94a3b8;

          font-size: 12px;
        }

        /* =====================================================
           PAYMENT IMAGE
        ===================================================== */

        .al-payment-image {
          padding: 20px;

          display: flex;
          justify-content: center;

          background: #f8fafc;

          border: 1px solid #e2e8f0;

          border-radius: 14px;
        }

        .al-payment-image .ant-image {
          max-width: 100%;
        }

        .al-payment-image img {
          display: block;

          max-width: 100%;
          max-height: 600px;

          object-fit: contain;

          border-radius: 8px;
        }

        .al-file-path {
          display: flex;
          align-items: center;

          gap: 7px;

          margin-top: 10px;

          padding: 10px 12px;

          border: 1px solid #e2e8f0;

          border-radius: 10px;

          background: #fafbfd;

          overflow: hidden;
        }

        .al-file-path .ant-typography {
          min-width: 0;
        }

        .al-file-path
          .ant-typography-code {
          flex: 1;

          overflow: hidden;

          text-overflow: ellipsis;

          white-space: nowrap;
        }

        .al-no-image {
          min-height: 220px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px dashed #cbd5e1;

          border-radius: 14px;

          background: #fafbfd;
        }

        /* =====================================================
           REJECT MODAL
        ===================================================== */

        .al-reject-alert {
          border-radius: 12px;

          margin-bottom: 20px;
        }

        .al-reject-form
          .ant-form-item:last-child {
          margin-bottom: 0;
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 991px) {
          .admin-license-page {
            padding: 20px;
          }

          .al-header {
            align-items: flex-start;
          }

          .al-filter {
            flex-direction: column;
            align-items: stretch;
          }

          .al-search {
            max-width: none;
            width: 100%;
          }

          .al-status-select {
            width: 100%;
          }
        }

        @media (max-width: 767px) {
          .admin-license-page {
            padding: 14px;
          }

          .al-header {
            flex-direction: column;
            gap: 14px;
          }

          .al-header-actions {
            width: 100%;
          }

          .al-refresh-btn {
            width: 100%;
          }

          .al-title {
            font-size: 24px !important;
          }

          .al-description {
            font-size: 13px;
            line-height: 1.6;
          }

          .al-table-head {
            padding: 16px;

            align-items: flex-start;

            flex-direction: column;
          }

          .al-count-badge {
            width: 100%;
          }

          .al-detail-status {
            align-items: stretch;

            flex-direction: column;
          }

          .al-detail-status
            .ant-space {
            width: 100%;
          }

          .al-detail-status
            .ant-space-item {
            flex: 1;
          }

          .al-detail-status button {
            width: 100%;
          }

          .al-payment-image {
            padding: 10px;
          }

          .al-log-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .al-log-date {
            white-space: normal;
          }

          .al-file-path {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .al-file-path
            .ant-typography-code {
            width: 100%;
            flex: 0 0 100%;
          }
        }

        @media (max-width: 480px) {
          .admin-license-page {
            padding: 10px;
          }

          .al-title {
            font-size: 21px !important;
          }

          .al-stat-card .ant-card-body {
            padding: 16px;
          }

          .al-filter-card .ant-card-body {
            padding: 12px;
          }

          .al-table-head {
            padding: 14px;
          }

          .al-table-card {
            border-radius: 12px !important;
          }
        }
      `}</style>

      <div className="admin-license-page">
        <div className="admin-license-container">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="al-header">
            <div>
              <div className="al-eyebrow">FAITHEDU ADMIN</div>

              <Title level={2} className="al-title">
                Quản lý gói FaithEdu
              </Title>

              <Text type="secondary" className="al-description">
                Theo dõi, kiểm tra và xử lý các yêu cầu đăng ký gói FaithEdu của
                giáo xứ.
              </Text>
            </div>

            <div className="al-header-actions">
              <Button
                className="al-refresh-btn"
                icon={<ReloadOutlined />}
                onClick={loadRegistrations}
                loading={loading}
              >
                Làm mới
              </Button>
            </div>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <Row gutter={[16, 16]} className="al-stats">
            <Col xs={24} sm={12} lg={6}>
              <Card className="al-stat-card">
                <Statistic
                  title="Tổng đăng ký"
                  value={statistics.total}
                  prefix={<WalletOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="al-stat-card pending">
                <Statistic
                  title="Chờ duyệt"
                  value={statistics.pending}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="al-stat-card approved">
                <Statistic
                  title="Đã duyệt"
                  value={statistics.approved}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="al-stat-card">
                <Statistic
                  title="Doanh thu đã duyệt"
                  value={statistics.revenue}
                  formatter={(value) =>
                    `${Number(value || 0).toLocaleString("vi-VN")}đ`
                  }
                  prefix={<WalletOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* ==================================================
              FILTER
          ================================================== */}

          <Card className="al-filter-card">
            <div className="al-filter">
              <Input
                allowClear
                className="al-search"
                prefix={<SearchOutlined />}
                placeholder="Tìm giáo xứ, người đăng ký, SĐT, email, mã gói..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />

              <Select
                className="al-status-select"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  {
                    value: "all",
                    label: "Tất cả trạng thái",
                  },
                  {
                    value: "pending",
                    label: "Chờ duyệt",
                  },
                  {
                    value: "approved",
                    label: "Đã duyệt",
                  },
                  {
                    value: "rejected",
                    label: "Từ chối",
                  },
                ]}
              />
            </div>
          </Card>

          {/* ==================================================
              PENDING ALERT
          ================================================== */}

          {statistics.pending > 0 && (
            <Alert
              className="al-alert"
              type="warning"
              showIcon
              icon={<ClockCircleOutlined />}
              message={
                <span>
                  Có <strong>{statistics.pending}</strong> yêu cầu đang chờ xử
                  lý.
                </span>
              }
              description="Hãy kiểm tra ảnh chuyển khoản trước khi duyệt."
            />
          )}

          {/* ==================================================
              TABLE
          ================================================== */}

          <Card className="al-table-card">
            <div className="al-table-head">
              <div>
                <Title level={4} className="al-table-title">
                  Danh sách đăng ký
                </Title>

                <Text type="secondary">
                  Hiển thị <strong>{filteredRegistrations.length}</strong> đăng
                  ký
                </Text>
              </div>

              <Badge count={statistics.pending} overflowCount={99} showZero>
                <div className="al-count-badge">Chờ xử lý</div>
              </Badge>
            </div>

            <Table
              rowKey={(record) => record?.id}
              loading={loading}
              columns={columns}
              dataSource={filteredRegistrations}
              scroll={{
                x: 1200,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                showTotal: (total) => `Tổng ${total} đăng ký`,
              }}
              locale={{
                emptyText: <Empty description="Chưa có đăng ký nào" />,
              }}
            />
          </Card>
        </div>
      </div>

      {/* ======================================================
          DETAIL MODAL
      ====================================================== */}

      <Modal
        open={detailOpen}
        onCancel={() => {
          if (!actionLoading) {
            setDetailOpen(false);
            setSelectedRegistration(null);
          }
        }}
        footer={null}
        width={950}
        centered
        destroyOnClose
        title={
          <div>
            <div className="al-modal-eyebrow">CHI TIẾT ĐĂNG KÝ</div>

            <Title
              level={4}
              style={{
                margin: 0,
                color: "#173b5e",
              }}
            >
              Đăng ký #{selectedRegistration?.id || "—"}
            </Title>
          </div>
        }
      >
        {detailLoading ? (
          <div className="al-detail-loading">
            <Spin size="large" />
          </div>
        ) : selectedRegistration ? (
          <div className="al-detail">
            {/* ==================================================
                STATUS
            ================================================== */}

            <div className="al-detail-status">
              <div>
                <Text type="secondary">Trạng thái đăng ký</Text>

                <div
                  style={{
                    marginTop: 6,
                  }}
                >
                  {(() => {
                    const config = getStatusInfo(
                      getStatus(selectedRegistration),
                    );

                    return (
                      <Tag
                        color={config.color}
                        icon={config.icon}
                        className="al-status-large"
                      >
                        {config.label}
                      </Tag>
                    );
                  })()}
                </div>
              </div>

              {getStatus(selectedRegistration) === "pending" && (
                <Space>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => openRejectModal(selectedRegistration)}
                  >
                    Từ chối
                  </Button>

                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={actionLoading}
                    onClick={() => handleApprove(selectedRegistration)}
                  >
                    Duyệt đăng ký
                  </Button>
                </Space>
              )}
            </div>

            <Divider />

            {/* ==================================================
                REGISTRATION INFORMATION
            ================================================== */}

            <div className="al-section-title">
              <div className="al-section-icon">
                <UserOutlined />
              </div>

              <div>
                <Text strong className="al-section-heading">
                  Thông tin đăng ký
                </Text>

                <Text type="secondary" className="al-section-description">
                  Thông tin giáo xứ và người thực hiện đăng ký.
                </Text>
              </div>
            </div>

            <Descriptions
              bordered
              column={{
                xs: 1,
                sm: 2,
              }}
              size="middle"
            >
              <Descriptions.Item label="Mã đăng ký">
                <Text strong>#{selectedRegistration?.id || "—"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã giáo xứ">
                {selectedRegistration?.church_id || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Giáo xứ">
                <Text strong>{getChurchName(selectedRegistration)}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Người đăng ký">
                {getApplicantName(selectedRegistration)}
              </Descriptions.Item>

              <Descriptions.Item label="Số điện thoại">
                <Space size={6}>
                  <PhoneOutlined />
                  {getPhone(selectedRegistration)}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Email">
                <Space size={6}>
                  <MailOutlined />
                  {getEmail(selectedRegistration)}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Gói đăng ký">
                <Text strong>
                  {selectedRegistration?.package_name ||
                    selectedRegistration?.packageName ||
                    "—"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Mã gói">
                <Text code>{selectedRegistration?.package_code || "—"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Số tiền">
                <Text
                  strong
                  style={{
                    color: "#173b5e",
                    fontSize: 15,
                  }}
                >
                  {formatMoney(getAmount(selectedRegistration))}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày đăng ký">
                <Space size={6}>
                  <CalendarOutlined />

                  {formatDateTime(
                    selectedRegistration?.created_at ||
                      selectedRegistration?.createdAt,
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Cập nhật lần cuối">
                {formatDateTime(
                  selectedRegistration?.updated_at ||
                    selectedRegistration?.updatedAt,
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày xử lý">
                {formatDateTime(selectedRegistration?.reviewed_at)}
              </Descriptions.Item>

              <Descriptions.Item label="Người xử lý">
                <Space size={6}>
                  <IdcardOutlined />

                  {selectedRegistration?.reviewed_by || "—"}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Nội dung chuyển khoản" span={2}>
                <div className="al-transfer-content">
                  <Text>
                    {selectedRegistration?.transfer_content ||
                      selectedRegistration?.transferContent ||
                      "—"}
                  </Text>

                  {(selectedRegistration?.transfer_content ||
                    selectedRegistration?.transferContent) && (
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() =>
                        handleCopy(
                          selectedRegistration?.transfer_content ||
                            selectedRegistration?.transferContent,
                          "Nội dung chuyển khoản",
                        )
                      }
                    />
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedRegistration?.note ? (
                  <Text>{selectedRegistration.note}</Text>
                ) : (
                  <Text type="secondary">Không có ghi chú</Text>
                )}
              </Descriptions.Item>

              {selectedRegistration?.reject_reason && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  <Alert
                    type="error"
                    showIcon
                    message="Yêu cầu đã bị từ chối"
                    description={selectedRegistration.reject_reason}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            {/* ==================================================
                LOGS
            ================================================== */}

            <div className="al-section-title">
              <div className="al-section-icon">
                <HistoryOutlined />
              </div>

              <div>
                <Text strong className="al-section-heading">
                  Lịch sử xử lý
                </Text>

                <Text type="secondary" className="al-section-description">
                  Toàn bộ thay đổi trạng thái của đăng ký.
                </Text>
              </div>
            </div>

            {Array.isArray(selectedRegistration?.logs) &&
            selectedRegistration.logs.length > 0 ? (
              <div className="al-logs">
                {selectedRegistration.logs.map((log) => {
                  const logStatus = getLogStatusInfo(log?.new_status);

                  const oldStatus = log?.old_status
                    ? getLogStatusInfo(log.old_status)
                    : null;

                  return (
                    <div className="al-log-item" key={log?.id}>
                      <div className="al-log-icon">{logStatus.icon}</div>

                      <div className="al-log-content">
                        <div className="al-log-top">
                          <Space size={8} wrap>
                            {oldStatus && (
                              <>
                                <Tag>{oldStatus.label}</Tag>

                                <span className="al-log-arrow">→</span>
                              </>
                            )}

                            <Tag color={logStatus.color} icon={logStatus.icon}>
                              {logStatus.label}
                            </Tag>
                          </Space>

                          <Text type="secondary" className="al-log-date">
                            {formatDateTime(log?.created_at)}
                          </Text>
                        </div>

                        <div className="al-log-note">
                          {log?.note || "Không có ghi chú"}
                        </div>

                        <div className="al-log-user">
                          Người thực hiện:{" "}
                          <Text strong>#{log?.changed_by || "—"}</Text>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có lịch sử xử lý"
              />
            )}

            <Divider />

            {/* ==================================================
                PAYMENT IMAGE
            ================================================== */}

            <div className="al-section-title">
              <div className="al-section-icon">
                <FileImageOutlined />
              </div>

              <div>
                <Text strong className="al-section-heading">
                  Ảnh chuyển khoản
                </Text>

                <Text type="secondary" className="al-section-description">
                  Kiểm tra ảnh giao dịch trước khi duyệt đăng ký.
                </Text>
              </div>
            </div>

            {getPaymentImage(selectedRegistration) ? (
              <>
                <div className="al-payment-image">
                  <Image
                    src={getPaymentImage(selectedRegistration)}
                    alt="Ảnh chuyển khoản"
                    preview={{
                      mask: (
                        <Space>
                          <EyeOutlined />
                          Xem ảnh
                        </Space>
                      ),
                    }}
                  />
                </div>

                <div className="al-file-path">
                  <Text type="secondary">Đường dẫn:</Text>

                  <Text code>{selectedRegistration?.payment_image || "—"}</Text>

                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() =>
                      handleCopy(
                        selectedRegistration?.payment_image,
                        "Đường dẫn ảnh",
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <div className="al-no-image">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có ảnh chuyển khoản"
                />
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không có dữ liệu" />
        )}
      </Modal>

      {/* ======================================================
          REJECT MODAL
      ====================================================== */}

      <Modal
        open={rejectOpen}
        centered
        destroyOnClose
        title={
          <div>
            <div className="al-modal-eyebrow">XỬ LÝ ĐĂNG KÝ</div>

            <Title
              level={4}
              style={{
                margin: 0,
                color: "#173b5e",
              }}
            >
              Từ chối đăng ký
            </Title>
          </div>
        }
        onCancel={() => {
          if (!actionLoading) {
            setRejectOpen(false);
            rejectForm.resetFields();
          }
        }}
        onOk={handleReject}
        okText="Từ chối đăng ký"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
          loading: actionLoading,
        }}
      >
        <Alert
          className="al-reject-alert"
          type="warning"
          showIcon
          message="Xác nhận từ chối yêu cầu"
          description={
            <span>
              Giáo xứ <strong>{getChurchName(selectedRegistration)}</strong> sẽ
              được chuyển sang trạng thái từ chối.
            </span>
          }
        />

        <Form form={rejectForm} layout="vertical" className="al-reject-form">
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập lý do từ chối.",
              },
              {
                min: 5,
                message: "Lý do cần ít nhất 5 ký tự.",
              },
            ]}
          >
            <TextArea
              rows={5}
              maxLength={500}
              showCount
              placeholder="Ví dụ: Ảnh chuyển khoản chưa rõ, số tiền không đúng hoặc chưa xác nhận được giao dịch..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminLicensePage;
