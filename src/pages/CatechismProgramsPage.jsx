import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  BookOpen,
  CheckCircle2,
  CircleOff,
  FilePlus2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import catechismProgramApi from "../api/catechismProgramApi";

const { Title, Text } = Typography;
const { TextArea } = Input;

const TARGET_OPTIONS = [
  { value: "children", label: "Thiếu nhi" },
  { value: "youth", label: "Giới trẻ" },
  { value: "adult", label: "Người lớn" },
  { value: "catechumen", label: "Dự tòng" },
  { value: "all", label: "Tất cả đối tượng" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
  { value: "archived", label: "Đã lưu trữ" },
];

const STATUS_META = {
  active: { color: "success", label: "Đang hoạt động" },
  inactive: { color: "default", label: "Ngừng hoạt động" },
  archived: { color: "warning", label: "Đã lưu trữ" },
};

const TARGET_LABELS = Object.fromEntries(
  TARGET_OPTIONS.map((item) => [item.value, item.label]),
);

const INITIAL_FILTERS = {
  search: "",
  status: undefined,
  target_type: undefined,
};

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  target_type: "all",
  duration_years: 1,
  sort_order: 0,
  status: "active",
};

const DEFAULT_PAGE_SIZE = 10;

function getPayload(response) {
  return response?.data?.data ?? response?.data ?? {};
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function getProgramList(payload) {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.programs)) return payload.programs;
  if (Array.isArray(payload?.rows)) return payload.rows;

  return [];
}

function StatCard({ title, value, icon, color, loading }) {
  return (
    <Card className="program-stat-card" styles={{ body: { padding: 20 } }}>
      <div className="program-stat-content">
        <div>
          <Text type="secondary">{title}</Text>
          <div className="program-stat-number">
            {loading ? <Spin size="small" /> : value}
          </div>
        </div>

        <div
          className="program-stat-icon"
          style={{ color, background: `${color}14` }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

const pageStyles = `
  .catechism-programs-page {
    min-width: 0;
    padding: 24px;
    color: #243447;
  }

  .catechism-programs-page * {
    box-sizing: border-box;
  }

  .program-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .program-page-heading,
  .program-modal-title {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .program-page-heading .ant-typography,
  .program-modal-title .ant-typography {
    margin: 0;
  }

  .program-page-heading h3 {
    margin-bottom: 6px !important;
    color: #173b5e;
    font-weight: 750;
  }

  .program-heading-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    border-radius: 16px;
    color: #173b5e;
    background: #eef3f7;
  }

  .program-heading-icon.small {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .program-stat-grid {
    margin-bottom: 20px;
  }

  .program-stat-card {
    height: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(16, 42, 67, 0.035);
  }

  .program-stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .program-stat-number {
    margin-top: 10px;
    color: #173b5e;
    font-size: 30px;
    font-weight: 750;
    line-height: 1.2;
  }

  .program-stat-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .program-filter-card,
  .program-table-card {
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 18px rgba(16, 42, 67, 0.035);
  }

  .program-filter-card .ant-card-body {
    padding: 20px;
  }

  .program-filter-select,
  .program-full-width {
    width: 100%;
  }

  .program-filter-actions {
    display: flex;
    width: 100%;
  }

  .program-table-card .ant-card-head {
    min-height: 78px;
    border-bottom-color: #edf1f5;
  }

  .program-table-heading h5 {
    margin: 0 0 5px !important;
    color: #173b5e;
  }

  .program-table-card .ant-table-thead > tr > th {
    color: #526477;
    background: #f7f9fc;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .program-table-card .ant-table-tbody > tr > td {
    padding-top: 15px;
    padding-bottom: 15px;
  }

  .program-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 200px;
  }

  .program-row-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    color: #173b5e;
    background: #eef3f7;
  }

  .program-name-cell .ant-typography {
    display: inline-block;
    max-width: 250px;
    margin-bottom: 3px;
    overflow-wrap: anywhere;
  }

  .program-code {
    font-size: 12px;
  }

  .program-form {
    padding-top: 16px;
  }

  .program-form-alert {
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .program-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 12px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }

  @media (max-width: 768px) {
    .catechism-programs-page {
      padding: 14px;
    }

    .program-page-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .program-page-header > .ant-btn {
      width: 100%;
    }

    .program-page-heading {
      align-items: flex-start;
    }

    .program-heading-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
    }

    .program-stat-number {
      font-size: 26px;
    }

    .program-filter-card .ant-card-body {
      padding: 14px;
    }

    .program-filter-actions {
      display: flex;
    }

    .program-filter-actions .ant-btn-primary {
      flex: 1;
    }

    .program-table-card .ant-card-head {
      padding-inline: 14px;
    }

    .program-table-card .ant-card-body {
      padding: 10px;
    }

    .program-modal-footer {
      flex-wrap: wrap;
    }

    .program-modal-footer .ant-btn {
      flex: 1;
    }
  }
`;

export default function CatechismProgramsPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [keyword, setKeyword] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
  });

  /**
   * Tải danh sách.
   * Không đọc trực tiếp filters hoặc pagination bên trong callback:
   * tất cả dữ liệu cần thiết được truyền qua tham số.
   */
  const loadPrograms = useCallback(
    async ({
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      currentFilters = INITIAL_FILTERS,
      showError = true,
    } = {}) => {
      setLoading(true);

      try {
        const params = {
          page,
          limit: pageSize,
          sort_by: "sort_order",
          sort_order: "asc",
        };

        if (currentFilters.search?.trim()) {
          params.search = currentFilters.search.trim();
        }

        if (currentFilters.status) {
          params.status = currentFilters.status;
        }

        if (currentFilters.target_type) {
          params.target_type = currentFilters.target_type;
        }

        console.log("[CatechismPrograms] Request:", params);

        const response = await catechismProgramApi.getAll(params);
        const payload = getPayload(response);
        const list = getProgramList(payload);
        const paginationData = payload?.pagination || {};

        setRows(list);
        setPagination((previous) => ({
          ...previous,
          current: Number(paginationData.page ?? page),
          pageSize: Number(paginationData.limit ?? pageSize),
          total: Number(paginationData.total ?? list.length),
        }));

        console.log("[CatechismPrograms] Loaded:", {
          count: list.length,
          pagination: paginationData,
        });

        return list;
      } catch (error) {
        console.error("[CatechismPrograms] Load failed:", error);

        if (showError) {
          messageApi.error(
            getErrorMessage(
              error,
              "Không thể tải danh mục chương trình Giáo lý.",
            ),
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    },
    [messageApi],
  );

  /**
   * Thống kê hiện được tính từ tối đa 100 bản ghi đầu tiên.
   * Muốn thống kê chính xác trên số lượng lớn, backend nên có endpoint riêng.
   */
  const loadStatistics = useCallback(async () => {
    setStatisticsLoading(true);

    try {
      const response = await catechismProgramApi.getAll({
        page: 1,
        limit: 100,
      });

      const payload = getPayload(response);
      const list = getProgramList(payload);
      const total = Number(payload?.pagination?.total ?? list.length);

      setStatistics({
        total,
        active: list.filter((item) => item.status === "active").length,
        inactive: list.filter((item) => item.status === "inactive").length,
        archived: list.filter((item) => item.status === "archived").length,
      });
    } catch (error) {
      console.error("[CatechismPrograms] Statistics failed:", error);
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Khi bộ lọc thay đổi, luôn quay về trang đầu tiên.
  useEffect(() => {
    loadPrograms({
      page: 1,
      pageSize: pagination.pageSize,
      currentFilters: filters,
    });
  }, [filters, pagination.pageSize, loadPrograms]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const refreshCurrentPage = async () => {
    await Promise.all([
      loadPrograms({
        page: pagination.current,
        pageSize: pagination.pageSize,
        currentFilters: filters,
      }),
      loadStatistics(),
    ]);
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);

    form.resetFields();
    form.setFieldsValue({
      ...EMPTY_FORM,
      ...record,
      description: record.description || "",
      target_type: record.target_type || "all",
      duration_years: Number(record.duration_years || 1),
      sort_order: Number(record.sort_order ?? 0),
      status: record.status || "active",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);

    const payload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || null,
      target_type: values.target_type,
      duration_years: Number(values.duration_years),
      sort_order: Number(values.sort_order ?? 0),
      status: values.status,
    };

    try {
      console.log("[CatechismPrograms] Save payload:", payload);

      if (editingRecord) {
        await catechismProgramApi.update(editingRecord.id, payload);
        messageApi.success("Cập nhật chương trình Giáo lý thành công.");
      } else {
        await catechismProgramApi.create(payload);
        messageApi.success("Thêm chương trình Giáo lý thành công.");
      }

      setModalOpen(false);
      setEditingRecord(null);
      form.resetFields();

      await Promise.all([
        loadPrograms({
          page: 1,
          pageSize: pagination.pageSize,
          currentFilters: filters,
        }),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error("[CatechismPrograms] Save failed:", error);
      messageApi.error(
        getErrorMessage(error, "Không thể lưu chương trình Giáo lý."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (record, checked) => {
    const nextStatus = checked ? "active" : "inactive";

    setSavingStatusId(record.id);

    try {
      await catechismProgramApi.updateStatus(record.id, nextStatus);

      messageApi.success(
        checked
          ? "Đã bật chương trình Giáo lý."
          : "Đã ngừng chương trình Giáo lý.",
      );

      await Promise.all([
        loadPrograms({
          page: pagination.current,
          pageSize: pagination.pageSize,
          currentFilters: filters,
        }),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error("[CatechismPrograms] Status update failed:", error);
      messageApi.error(
        getErrorMessage(error, "Không thể cập nhật trạng thái."),
      );
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleDelete = async (record) => {
    setDeletingId(record.id);

    try {
      await catechismProgramApi.delete(record.id);
      messageApi.success("Đã xóa chương trình Giáo lý.");

      const nextPage =
        rows.length === 1 && pagination.current > 1
          ? pagination.current - 1
          : pagination.current;

      await Promise.all([
        loadPrograms({
          page: nextPage,
          pageSize: pagination.pageSize,
          currentFilters: filters,
        }),
        loadStatistics(),
      ]);
    } catch (error) {
      console.error("[CatechismPrograms] Delete failed:", error);
      messageApi.error(
        getErrorMessage(
          error,
          "Không thể xóa chương trình. Có thể chương trình đang được sử dụng.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = () => {
    const nextFilters = {
      ...filters,
      search: keyword.trim(),
    };

    setPagination((previous) => ({
      ...previous,
      current: 1,
    }));

    setFilters(nextFilters);
  };

  const handleReset = () => {
    setKeyword("");
    setFilters(INITIAL_FILTERS);
    setPagination((previous) => ({
      ...previous,
      current: 1,
    }));
  };

  const handleFilterStatusChange = (value) => {
    setFilters((previous) => ({
      ...previous,
      status: value,
    }));

    setPagination((previous) => ({
      ...previous,
      current: 1,
    }));
  };

  const handleFilterTargetChange = (value) => {
    setFilters((previous) => ({
      ...previous,
      target_type: value,
    }));

    setPagination((previous) => ({
      ...previous,
      current: 1,
    }));
  };

  // Không dùng useMemo cho columns để tránh lỗi dependency do callback.
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Chương trình Giáo lý",
      dataIndex: "name",
      key: "name",
      width: 300,
      render: (name, record) => (
        <div className="program-name-cell">
          <div className="program-row-icon">
            <BookOpen size={18} />
          </div>
          <div>
            <Text strong>{name}</Text>
            <div>
              <Text type="secondary" className="program-code">
                {record.code}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Đối tượng",
      dataIndex: "target_type",
      key: "target_type",
      width: 150,
      render: (value) => (
        <Tag>{TARGET_LABELS[value] || value || "Chưa xác định"}</Tag>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration_years",
      key: "duration_years",
      width: 120,
      align: "center",
      render: (value) => `${value || 1} năm`,
    },
    {
      title: "Thứ tự",
      dataIndex: "sort_order",
      key: "sort_order",
      width: 90,
      align: "center",
      render: (value) => value ?? 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 160,
      render: (status) => {
        const meta = STATUS_META[status] || {
          color: "default",
          label: status || "Không xác định",
        };

        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Hiển thị",
      key: "enabled",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Switch
          checked={record.status === "active"}
          loading={savingStatusId === record.id}
          disabled={record.status === "archived"}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<Pencil size={16} />}
            title="Chỉnh sửa"
            onClick={() => openEditModal(record)}
          />

          <Popconfirm
            title="Xóa chương trình Giáo lý?"
            description={
              <>
                Bạn có chắc muốn xóa <strong>{record.name}</strong>?
                <br />
                Không nên xóa nếu chương trình đã được sử dụng.
              </>
            }
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
              loading: deletingId === record.id,
            }}
            onConfirm={() => handleDelete(record)}
          >
            <Button
              danger
              type="text"
              icon={<Trash2 size={16} />}
              title="Xóa chương trình"
              loading={deletingId === record.id}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="catechism-programs-page">
      <style>{pageStyles}</style>
      {contextHolder}

      <div className="program-page-header">
        <div className="program-page-heading">
          <div className="program-heading-icon">
            <BookOpen size={25} />
          </div>

          <div>
            <Title level={3}>Danh mục chương trình Giáo lý</Title>
            <Text type="secondary">
              Quản lý danh mục chương trình dùng chung trên toàn hệ thống
              FaithEdu.
            </Text>
          </div>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<FilePlus2 size={17} />}
          onClick={openCreateModal}
        >
          Thêm chương trình
        </Button>
      </div>

      <Row gutter={[16, 16]} className="program-stat-grid">
        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Tổng chương trình"
            value={statistics.total}
            icon={<BookOpen size={23} />}
            color="#173B5E"
            loading={statisticsLoading}
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Đang hoạt động"
            value={statistics.active}
            icon={<CheckCircle2 size={23} />}
            color="#2E7D5B"
            loading={statisticsLoading}
          />
        </Col>

        <Col xs={24} sm={12} xl={8}>
          <StatCard
            title="Ngừng hoạt động / lưu trữ"
            value={statistics.inactive + statistics.archived}
            icon={<CircleOff size={23} />}
            color="#B7791F"
            loading={statisticsLoading}
          />
        </Col>
      </Row>

      <Card className="program-filter-card">
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={9}>
            <Input
              allowClear
              size="large"
              prefix={<Search size={17} />}
              placeholder="Tìm theo mã, tên hoặc mô tả chương trình..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>

          <Col xs={24} sm={12} lg={5}>
            <Select
              allowClear
              size="large"
              className="program-filter-select"
              placeholder="Tất cả trạng thái"
              options={STATUS_OPTIONS}
              value={filters.status}
              onChange={handleFilterStatusChange}
            />
          </Col>

          <Col xs={24} sm={12} lg={5}>
            <Select
              allowClear
              size="large"
              className="program-filter-select"
              placeholder="Tất cả đối tượng"
              options={TARGET_OPTIONS}
              value={filters.target_type}
              onChange={handleFilterTargetChange}
            />
          </Col>

          <Col xs={24} lg={5}>
            <Space className="program-filter-actions">
              <Button
                type="primary"
                size="large"
                icon={<Search size={16} />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>

              <Button
                size="large"
                icon={<RefreshCw size={16} />}
                onClick={handleReset}
                title="Đặt lại bộ lọc"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        className="program-table-card"
        title={
          <div className="program-table-heading">
            <div>
              <Title level={5}>Danh sách chương trình</Title>
              <Text type="secondary">
                {pagination.total} chương trình trong danh mục
              </Text>
            </div>
          </div>
        }
        extra={
          <Button
            icon={<RefreshCw size={16} />}
            onClick={refreshCurrentPage}
            disabled={loading}
          >
            Làm mới
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có chương trình Giáo lý"
              >
                <Button type="primary" onClick={openCreateModal}>
                  Thêm chương trình đầu tiên
                </Button>
              </Empty>
            ),
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} / ${total} chương trình`,
            onChange: (page, pageSize) => {
              loadPrograms({
                page,
                pageSize,
                currentFilters: filters,
              });
            },
          }}
        />
      </Card>

      <Modal
        title={
          <div className="program-modal-title">
            <div className="program-heading-icon small">
              {editingRecord ? <Pencil size={19} /> : <FilePlus2 size={19} />}
            </div>
            <div>
              <Title level={5}>
                {editingRecord
                  ? "Cập nhật chương trình Giáo lý"
                  : "Thêm chương trình Giáo lý"}
              </Title>
              <Text type="secondary">
                Danh mục dùng chung toàn hệ thống, không thuộc riêng giáo xứ
                nào.
              </Text>
            </div>
          </div>
        }
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        width={680}
        destroyOnHidden
        maskClosable={!submitting}
        keyboard={!submitting}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={EMPTY_FORM}
          onFinish={handleSubmit}
          className="program-form"
        >
          <Alert
            type="info"
            showIcon
            message="Mã chương trình phải duy nhất"
            description="Mã được dùng để tham chiếu chương trình từ các chức năng khác của FaithEdu."
            className="program-form-alert"
          />

          <Row gutter={16}>
            <Col xs={24} sm={9}>
              <Form.Item
                label="Mã chương trình"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã chương trình.",
                  },
                  { max: 100, message: "Mã tối đa 100 ký tự." },
                  {
                    pattern: /^[A-Za-z0-9_-]+$/,
                    message:
                      "Chỉ dùng chữ không dấu, số, dấu gạch ngang hoặc gạch dưới.",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="VD: KHAI_TAM"
                  maxLength={100}
                  disabled={submitting}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={15}>
              <Form.Item
                label="Tên chương trình"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên chương trình.",
                  },
                  { max: 255, message: "Tên tối đa 255 ký tự." },
                ]}
              >
                <Input
                  size="large"
                  placeholder="VD: Giáo lý Khai Tâm"
                  maxLength={255}
                  disabled={submitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <TextArea
              rows={3}
              maxLength={5000}
              showCount
              placeholder="Mục tiêu, nội dung hoặc ghi chú của chương trình..."
              disabled={submitting}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Đối tượng học"
                name="target_type"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn đối tượng.",
                  },
                ]}
              >
                <Select
                  size="large"
                  options={TARGET_OPTIONS}
                  disabled={submitting}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Thời lượng (năm)"
                name="duration_years"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập thời lượng.",
                  },
                ]}
              >
                <InputNumber
                  size="large"
                  min={1}
                  max={255}
                  precision={0}
                  className="program-full-width"
                  disabled={submitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Thứ tự hiển thị" name="sort_order">
                <InputNumber
                  size="large"
                  min={0}
                  max={2147483647}
                  precision={0}
                  className="program-full-width"
                  disabled={submitting}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn trạng thái.",
                  },
                ]}
              >
                <Select
                  size="large"
                  options={STATUS_OPTIONS}
                  disabled={submitting}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="program-modal-footer">
            <Button size="large" onClick={closeModal} disabled={submitting}>
              Hủy
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
            >
              {editingRecord ? "Lưu thay đổi" : "Tạo chương trình"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
