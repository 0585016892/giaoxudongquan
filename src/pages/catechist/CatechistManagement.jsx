import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Table,
  Card,
  Typography,
  Tag,
  Avatar,
  Space,
  Input,
  Select,
  Row,
  Col,
  Pagination,
  message,
  Dropdown,
  Tooltip,
  Form,
  DatePicker,
  Popconfirm,
  Descriptions,
  Tabs,
  Divider,
  Empty,
  Badge,
  ConfigProvider,
} from "antd";

import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  SwapOutlined,
  IdcardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  PhoneOutlined,
  BookOutlined,
  SmileOutlined,
  CrownOutlined,
  MailOutlined,
} from "@ant-design/icons";

// Import Custom Common Components
import StatCard from "../../components/common/StatCard";
import AppButton from "../../components/common/AppButton";
import AppFormModal from "../../components/common/AppFormModal";
import AppDetailModal from "../../components/common/AppDetailModal";
import PageHeroHeader from "../../components/common/PageHeroHeader";

import catechistApi from "../../api/catechistApi";
import classApi from "../../api/classApi";

import dayjs from "dayjs";

import avataImg from "../../assets/images/jesusImg.png";

const { Title, Text } = Typography;

const LEVEL_OPTIONS = [
  { value: "Dự bị", label: "Dự bị" },
  { value: "Cấp 1", label: "Cấp 1" },
  { value: "Cấp 2", label: "Cấp 2" },
  { value: "Cấp 3", label: "Cấp 3" },
  { value: "Huấn luyện viên", label: "Huấn luyện viên" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "paused", label: "Tạm nghỉ" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

export default function CatechistManagement() {
  const [catechists, setCatechists] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCatechist, setEditingCatechist] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCatechist, setDetailCatechist] = useState(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignCatechist, setAssignCatechist] = useState(null);

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  /* =========================
     FORMAT DATA
  ========================= */
  const formatCatechist = (item) => ({
    ...item,
    key: item.id,
    catechist_code: item.catechist_code || "-",
    holy_name: item.holy_name || "",
    full_name: item.full_name || "Chưa có tên",
    gender: item.gender || "Nam",
    date_of_birth: item.date_of_birth || null,
    phone: item.phone || "",
    email: item.email || "",
    address: item.address || "",
    parish: item.parish || "",
    diocese: item.diocese || "",
    baptism_date: item.baptism_date || null,
    baptism_place: item.baptism_place || "",
    first_communion_date: item.first_communion_date || null,
    confirmation_date: item.confirmation_date || null,
    oath_date: item.oath_date || null,
    father_name: item.father_name || "",
    father_phone: item.father_phone || "",
    mother_name: item.mother_name || "",
    mother_phone: item.mother_phone || "",
    level: item.level || "Dự bị",
    status: item.status || "active",
    notes: item.notes || "",
    classes: item.classes || [],
    created_at: item.created_at || null,
    updated_at: item.updated_at || null,
    avatar: item.avatar ? item.avatar : avataImg,
  });

  const formatDateStr = (dateStr) => {
    return dateStr ? dayjs(dateStr).format("DD/MM/YYYY") : "—";
  };

  /* =========================
     FETCH DATA
  ========================= */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        catechistApi.getAll(),
        classApi?.getAll ? classApi.getAll() : Promise.resolve({ data: [] }),
      ]);

      if (results[0].status === "fulfilled") {
        const response = results[0].value;
        const catechistData = response?.data?.data || response?.data || [];
        const list = Array.isArray(catechistData) ? catechistData : [];
        setCatechists(list.map(formatCatechist));
      } else {
        message.error("Không thể tải danh sách Giáo lý viên!");
      }

      if (results[1].status === "fulfilled") {
        const response = results[1].value;
        const classData = response?.data?.data || response?.data || [];
        const list = Array.isArray(classData) ? classData : [];
        setClasses(
          list.map((item) => ({
            id: item.id,
            name: item.name || item.class_name || "Chưa đặt tên",
          })),
        );
      }
    } catch (error) {
      console.error("FETCH CATECHIST DATA ERROR:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* =========================
     FILTER & STATS
  ========================= */
  const filteredData = useMemo(() => {
    let result = [...catechists];
    if (searchText.trim()) {
      const keyword = searchText.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.full_name?.toLowerCase().includes(keyword) ||
          item.holy_name?.toLowerCase().includes(keyword) ||
          item.catechist_code?.toLowerCase().includes(keyword) ||
          item.phone?.toLowerCase().includes(keyword) ||
          item.email?.toLowerCase().includes(keyword),
      );
    }
    if (selectedLevel !== "all") {
      result = result.filter((item) => item.level === selectedLevel);
    }
    if (selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus);
    }
    return result;
  }, [catechists, searchText, selectedLevel, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedLevel, selectedStatus]);

  const statistics = useMemo(() => {
    return {
      total: catechists.length,
      active: catechists.filter((item) => item.status === "active").length,
      paused: catechists.filter((item) => item.status === "paused").length,
      trainer: catechists.filter((item) => item.level === "Huấn luyện viên")
        .length,
    };
  }, [catechists]);

  /* =========================
     MODAL ACTIONS
  ========================= */
  const handleOpenCreateModal = () => {
    setEditingCatechist(null);
    form.resetFields();
    form.setFieldsValue({
      gender: "Nam",
      level: "Dự bị",
      status: "active",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingCatechist(record);
    form.setFieldsValue({
      ...record,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      baptism_date: record.baptism_date ? dayjs(record.baptism_date) : null,
      first_communion_date: record.first_communion_date
        ? dayjs(record.first_communion_date)
        : null,
      confirmation_date: record.confirmation_date
        ? dayjs(record.confirmation_date)
        : null,
      oath_date: record.oath_date ? dayjs(record.oath_date) : null,
    });
    setIsFormModalOpen(true);
  };

  const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD") : null);

  const handleSave = async (values) => {
    try {
      setSaving(true);

      const payload = {
        ...values,

        date_of_birth: formatDate(values.date_of_birth),
        baptism_date: formatDate(values.baptism_date),
        first_communion_date: formatDate(values.first_communion_date),
        confirmation_date: formatDate(values.confirmation_date),
        oath_date: formatDate(values.oath_date),
      };

      // Không gửi field xác nhận mật khẩu lên backend
      delete payload.password_confirm;

      // Khi chỉnh sửa:
      // Nếu để trống password => backend giữ nguyên password cũ
      if (editingCatechist && !payload.password) {
        delete payload.password;
      }

      // Khi tạo mới:
      // Nếu không nhập password => mặc định 123456
      if (!editingCatechist && !payload.password) {
        payload.password = "123456";
      }

      if (editingCatechist) {
        await catechistApi.update(editingCatechist.id, payload);

        message.success("Cập nhật Giáo lý viên thành công!");
      } else {
        await catechistApi.create(payload);

        message.success("Thêm Giáo lý viên mới thành công!");
      }

      setIsFormModalOpen(false);
      form.resetFields();

      await fetchData();
    } catch (error) {
      console.error("SAVE CATECHIST ERROR:", error);

      message.error(
        error?.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin!",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetail = async (record) => {
    try {
      setIsDetailModalOpen(true);
      setDetailCatechist(record);

      const response = await catechistApi.getById(record.id);
      const data = response?.data?.data || response?.data;
      if (data) {
        setDetailCatechist(formatCatechist(data));
      }
    } catch (error) {
      message.warning("Không thể tải thêm thông tin chi tiết.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await catechistApi.delete(id);
      message.success("Xóa Giáo lý viên thành công!");
      await fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể xóa Giáo lý viên!",
      );
    }
  };

  const handleOpenAssignModal = (record) => {
    setAssignCatechist(record);
    assignForm.resetFields();

    const currentClassAssignment =
      record.classes && record.classes.length > 0
        ? record.classes.find((c) => c.status === "teaching") ||
          record.classes[0]
        : null;

    assignForm.setFieldsValue({
      class_id: currentClassAssignment
        ? currentClassAssignment.class_id
        : undefined,
      role: currentClassAssignment
        ? currentClassAssignment.role
        : "Giáo lý viên",
      assigned_date:
        currentClassAssignment && currentClassAssignment.assigned_date
          ? dayjs(currentClassAssignment.assigned_date)
          : dayjs(),
      notes: currentClassAssignment ? currentClassAssignment.notes : null,
    });

    setIsAssignModalOpen(true);
  };

  const handleAssignClass = async (values) => {
    try {
      setSaving(true);
      const payload = {
        catechist_id: assignCatechist.id,
        class_id: values.class_id,
        role: values.role,
        assigned_date: values.assigned_date
          ? values.assigned_date.format("YYYY-MM-DD")
          : null,
        notes: values.notes || null,
      };

      await catechistApi.assignClass(payload);
      message.success("Phân công lớp thành công!");
      setIsAssignModalOpen(false);
      assignForm.resetFields();
      await fetchData();
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Không thể phân công lớp!",
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusConfig = (status) => {
    const config = {
      active: {
        label: "Đang hoạt động",
        color: "#10B981",
        bg: "#ECFDF5",
        border: "#A7F3D0",
      },
      paused: {
        label: "Tạm nghỉ",
        color: "#F59E0B",
        bg: "#FFFBEB",
        border: "#FDE68A",
      },
      inactive: {
        label: "Ngừng hoạt động",
        color: "#EF4444",
        bg: "#FEF2F2",
        border: "#FECACA",
      },
    };
    return config[status] || config.active;
  };

  /* =========================
     TABLE COLUMNS
  ========================= */
  const columns = [
    {
      title: "Giáo lý viên",
      key: "catechist",
      render: (_, record) => (
        <Space size={12}>
          <div className=".chibi-avatar-wrapper--a">
            <Avatar size={48} src={record.avatar} className="chibi-avatar" />
          </div>
          <div>
            <Text
              strong
              className="chibi-name-text"
              onClick={() => handleOpenDetail(record)}
            >
              {record.holy_name ? `${record.holy_name} ` : ""}
              {record.full_name}
            </Text>
            <div>
              <Tag className="chibi-code-tag">
                <IdcardOutlined style={{ marginRight: 4 }} />
                {record.catechist_code}
              </Tag>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin liên hệ",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
            <PhoneOutlined style={{ color: "#FF6B8B", marginRight: 6 }} />
            {record.phone || "—"}
          </Text>
          <Text style={{ fontSize: 12, color: "#94A3B8" }}>
            <MailOutlined style={{ color: "#A855F7", marginRight: 6 }} />
            {record.email || "—"}
          </Text>
        </div>
      ),
    },
    {
      title: "Cấp bậc",
      dataIndex: "level",
      render: (level) => (
        <Tag className="chibi-level-tag">
          <CrownOutlined style={{ marginRight: 4, color: "#F59E0B" }} />
          {level}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            style={{
              color: config.color,
              background: config.bg,
              borderColor: config.border,
              borderRadius: 20,
              padding: "4px 12px",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            ● {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="Xem chi tiết">
            <AppButton
              className="chibi-action-btn chibi-btn-view"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <AppButton
              className="chibi-action-btn chibi-btn-edit"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "assign",
                  label: "Phân công lớp giảng dạy",
                  icon: <SwapOutlined style={{ color: "#FF6B8B" }} />,
                  onClick: () => handleOpenAssignModal(record),
                },
                { type: "divider" },
                {
                  key: "delete",
                  danger: true,
                  label: (
                    <Popconfirm
                      title="Xóa Giáo lý viên?"
                      description="Dữ liệu này sẽ không thể khôi phục lại!"
                      onConfirm={() => handleDelete(record.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true, shape: "round" }}
                    >
                      Xóa thông tin
                    </Popconfirm>
                  ),
                  icon: <DeleteOutlined />,
                },
              ],
            }}
          >
            <AppButton
              className="chibi-action-btn chibi-btn-more"
              shape="circle"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const assignedClassColumns = [
    {
      title: "Tên Lớp Giảng Dạy",
      key: "class_name",
      render: (_, record) => (
        <Space>
          <BookOutlined style={{ color: "#FF6B8B" }} />
          <Text strong style={{ color: "#334155" }}>
            {record.class_name || `Lớp #${record.class_id}`}
          </Text>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag className="chibi-role-tag">{role || "Giáo lý viên"}</Tag>
      ),
    },
    {
      title: "Ngày phân công",
      dataIndex: "assigned_date",
      key: "assigned_date",
      render: (date) => formatDateStr(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "teaching" ? "processing" : "default"}
          text={
            <span
              style={{
                fontWeight: 600,
                color: status === "teaching" ? "#10B981" : "#64748B",
              }}
            >
              {status === "teaching" ? "Đang dạy" : "Đã hoàn thành"}
            </span>
          }
        />
      ),
    },
  ];

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
      <div className="chibi-catechist-container">
        {/* ================= HEADER ================= */}
        <PageHeroHeader
          icon={<SmileOutlined />}
          badgeText="🌸 QUẢN LÝ GIÁO LÝ VIÊN TNTT"
          title="Danh Sách Giáo Lý Viên ✨"
          description="Quản lý hồ sơ cá nhân, cấp bậc Huấn luyện và phân công lớp học dễ dàng."
          // Refresh Props
          onRefresh={fetchData}
          refreshLoading={loading}
          // Primary Button Props
          primaryButtonText="Thêm GLV Mới"
          primaryButtonIcon={<PlusOutlined />}
          onPrimaryClick={handleOpenCreateModal}
          primaryDisabled={loading || saving}
        />

        {/* ================= STATISTICS ================= */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={12} sm={6}>
            <StatCard
              title="Tổng số GLV"
              value={statistics.total}
              loading={loading}
              icon={<TeamOutlined />}
              iconColor="#FF6B8B"
              description="Toàn bộ Giáo lý viên"
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Đang hoạt động"
              value={statistics.active}
              loading={loading}
              icon={<CheckCircleOutlined />}
              iconColor="#10B981"
              description="GLV đang giảng dạy"
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Tạm nghỉ"
              value={statistics.paused}
              loading={loading}
              icon={<PauseCircleOutlined />}
              iconColor="#F59E0B"
              description="GLV đang tạm nghỉ"
            />
          </Col>
          <Col xs={12} sm={6}>
            <StatCard
              title="Huấn luyện viên"
              value={statistics.trainer}
              loading={loading}
              icon={<CrownOutlined />}
              iconColor="#A855F7"
              description="Cấp Huấn luyện viên"
            />
          </Col>
        </Row>

        {/* ================= FILTER ================= */}
        <Card bordered={false} className="chibi-filter-card">
          <Row gutter={[12, 12]}>
            <Col xs={24} md={10}>
              <Input
                size="large"
                placeholder="Tìm tên, tên Thánh, mã GLV, SĐT..."
                prefix={<SearchOutlined style={{ color: "#FF6B8B" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="chibi-input-rounded"
              />
            </Col>
            <Col xs={12} md={5}>
              <Select
                size="large"
                value={selectedLevel}
                onChange={setSelectedLevel}
                style={{ width: "100%" }}
                className="chibi-select-rounded"
                options={[
                  { value: "all", label: "✨ Tất cả cấp bậc" },
                  ...LEVEL_OPTIONS,
                ]}
              />
            </Col>
            <Col xs={12} md={5}>
              <Select
                size="large"
                value={selectedStatus}
                onChange={setSelectedStatus}
                style={{ width: "100%" }}
                className="chibi-select-rounded"
                options={[
                  { value: "all", label: "🌸 Tất cả trạng thái" },
                  ...STATUS_OPTIONS,
                ]}
              />
            </Col>
            <Col xs={24} md={4}>
              <AppButton
                block
                size="large"
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText("");
                  setSelectedLevel("all");
                  setSelectedStatus("all");
                }}
              >
                Xóa bộ lọc
              </AppButton>
            </Col>
          </Row>
        </Card>

        {/* ================= TABLE MAIN ================= */}
        <Card bordered={false} className="chibi-table-card">
          <div className="chibi-table-header">
            <Text strong className="chibi-table-title">
              Danh Sách Giáo Lý Viên
            </Text>
            <span className="chibi-count-badge">{filteredData.length}</span>
          </div>

          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredData.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize,
            )}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có thông tin Giáo lý viên"
                />
              ),
            }}
            scroll={{ x: 900 }}
          />

          <Divider style={{ margin: 0 }} />

          <Row
            justify="space-between"
            align="middle"
            style={{ padding: "16px 20px" }}
          >
            <Col>
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 13 }}>
                Hiển thị{" "}
                {filteredData.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                {" - "}
                {Math.min(currentPage * pageSize, filteredData.length)}
                {" / "}
                {filteredData.length} Giáo lý viên
              </Text>
            </Col>
            <Col>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredData.length}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                onChange={(page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }}
              />
            </Col>
          </Row>
        </Card>

        {/* ================= MODAL CREATE / EDIT (APPFORMMODAL) ================= */}
        <AppFormModal
          title={
            <div className="chibi-modal-title">
              <Avatar
                icon={<UserOutlined />}
                style={{ background: "#FFE4E6", color: "#FF6B8B" }}
              />
              <span>
                {editingCatechist
                  ? "Cập Nhật Hồ Sơ Giáo Lý Viên"
                  : "Thêm Giáo Lý Viên Mới"}
              </span>
            </div>
          }
          open={isFormModalOpen}
          onCancel={() => {
            setIsFormModalOpen(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          confirmLoading={saving}
          okText={editingCatechist ? "Cập Nhật" : "Thêm Mới"}
          cancelText="Hủy"
          width={800}
          className="chibi-modal"
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Tabs
              defaultActiveKey="personal"
              className="chibi-tabs"
              items={[
                {
                  key: "personal",
                  label: "🎀 Thông Tin Cá Nhân",
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col xs={24} md={6}>
                          <Form.Item name="holy_name" label="Tên Thánh">
                            <Input placeholder="VD: Giuse, Đaminh..." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="full_name"
                            label="Họ và Tên"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập họ và tên!",
                              },
                            ]}
                          >
                            <Input placeholder="Nhập họ và tên đầy đủ" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item name="gender" label="Giới tính">
                            <Select
                              options={[
                                { value: "Nam", label: "Nam" },
                                { value: "Nữ", label: "Nữ" },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item name="date_of_birth" label="Ngày sinh">
                            <DatePicker
                              style={{ width: "100%" }}
                              format="DD/MM/YYYY"
                              placeholder="Chọn ngày"
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item name="phone" label="Số điện thoại">
                            <Input placeholder="09xxxxxxxx" />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={8}>
                          <Form.Item
                            name="email"
                            label="Email đăng nhập"
                            rules={[
                              {
                                type: "email",
                                message: "Email không hợp lệ!",
                              },
                            ]}
                          >
                            <Input
                              prefix={<MailOutlined />}
                              placeholder="example@email.com"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="password"
                            label={
                              editingCatechist
                                ? "Mật khẩu mới"
                                : "Mật khẩu đăng nhập"
                            }
                            extra={
                              editingCatechist
                                ? "Để trống nếu không muốn thay đổi mật khẩu."
                                : "Nếu để trống, mật khẩu mặc định là 123456."
                            }
                          >
                            <Input.Password
                              placeholder={
                                editingCatechist
                                  ? "Nhập mật khẩu mới nếu muốn đổi"
                                  : "Để trống = 123456"
                              }
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="password_confirm"
                            label="Xác nhận mật khẩu"
                            dependencies={["password"]}
                            rules={[
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    value === getFieldValue("password")
                                  ) {
                                    return Promise.resolve();
                                  }

                                  return Promise.reject(
                                    new Error("Mật khẩu xác nhận không khớp!"),
                                  );
                                },
                              }),
                            ]}
                          >
                            <Input.Password placeholder="Nhập lại mật khẩu" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="address" label="Địa chỉ hiện tại">
                        <Input placeholder="Nhập địa chỉ cư trú..." />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="level" label="Cấp bậc Giáo lý viên">
                            <Select options={LEVEL_OPTIONS} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="status" label="Trạng thái">
                            <Select options={STATUS_OPTIONS} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: "church",
                  label: "⛪ Giáo Xứ & Bí Tích",
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="parish" label="Giáo xứ">
                            <Input placeholder="VD: Giáo xứ Đồng Quan" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="diocese" label="Giáo phận">
                            <Input placeholder="VD: Thái Bình" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="baptism_date" label="Ngày Rửa tội">
                            <DatePicker
                              format="DD/MM/YYYY"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="baptism_place" label="Nơi Rửa tội">
                            <Input placeholder="Tên Giáo xứ Rửa tội" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="first_communion_date"
                            label="Ngày Rước lễ lần đầu"
                          >
                            <DatePicker
                              format="DD/MM/YYYY"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item
                            name="confirmation_date"
                            label="Ngày Thêm sức"
                          >
                            <DatePicker
                              format="DD/MM/YYYY"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="oath_date" label="Ngày Tuyên hứa GLV">
                        <DatePicker
                          format="DD/MM/YYYY"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </>
                  ),
                },
                {
                  key: "family",
                  label: "🏡 Gia Đình & Ghi Chú",
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="father_name" label="Họ tên Cha">
                            <Input placeholder="Nhập họ tên Cha" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="father_phone" label="SĐT Cha">
                            <Input placeholder="SĐT Cha" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item name="mother_name" label="Họ tên Mẹ">
                            <Input placeholder="Nhập họ tên Mẹ" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item name="mother_phone" label="SĐT Mẹ">
                            <Input placeholder="SĐT Mẹ" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="notes" label="Ghi chú thêm">
                        <Input.TextArea
                          rows={3}
                          placeholder="Nhập thêm ghi chú về quá trình hoạt động..."
                        />
                      </Form.Item>
                    </>
                  ),
                },
              ]}
            />
          </Form>
        </AppFormModal>

        {/* ================= MODAL DETAIL (APPDETAILMODAL) ================= */}
        <AppDetailModal
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          width={750}
          className="chibi-modal"
        >
          {detailCatechist && (
            <div>
              <div className="chibi-detail-header">
                <Avatar
                  size={70}
                  src={detailCatechist.avatar}
                  className="chibi-avatar"
                />
                <div>
                  <Title level={4} style={{ margin: 0, color: "#FF6B8B" }}>
                    {detailCatechist.holy_name} {detailCatechist.full_name}
                  </Title>
                  <Space style={{ marginTop: 4 }}>
                    <Tag className="chibi-level-tag">
                      {detailCatechist.level}
                    </Tag>
                    <Tag className="chibi-code-tag">
                      {detailCatechist.catechist_code}
                    </Tag>
                  </Space>
                </div>
              </div>

              <Tabs
                defaultActiveKey="info"
                className="chibi-tabs"
                items={[
                  {
                    key: "info",
                    label: "Thông tin chi tiết",
                    children: (
                      <Descriptions
                        bordered
                        column={{ xs: 1, sm: 2 }}
                        size="small"
                        className="chibi-descriptions"
                      >
                        <Descriptions.Item label="Ngày sinh">
                          {formatDateStr(detailCatechist.date_of_birth)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giới tính">
                          {detailCatechist.gender}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
                          {detailCatechist.phone || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                          {detailCatechist.email || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>
                          {detailCatechist.address || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giáo xứ">
                          {detailCatechist.parish || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giáo phận">
                          {detailCatechist.diocese || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Rửa Tội">
                          {formatDateStr(detailCatechist.baptism_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Nơi Rửa Tội">
                          {detailCatechist.baptism_place || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Rước Lễ">
                          {formatDateStr(detailCatechist.first_communion_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Thêm Sức">
                          {formatDateStr(detailCatechist.confirmation_date)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày Tuyên Hứa" span={2}>
                          {formatDateStr(detailCatechist.oath_date)}
                        </Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                  {
                    key: "classes",
                    label: "Lớp học phụ trách",
                    children: (
                      <Table
                        columns={assignedClassColumns}
                        dataSource={detailCatechist.classes || []}
                        rowKey="class_id"
                        pagination={false}
                        size="small"
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}
        </AppDetailModal>

        {/* ================= MODAL ASSIGN CLASS (APPFORMMODAL) ================= */}
        <AppFormModal
          title={
            <div className="chibi-modal-title">
              <SwapOutlined style={{ color: "#A855F7" }} />
              <span>Phân Công Lớp Giảng Dạy</span>
            </div>
          }
          open={isAssignModalOpen}
          onCancel={() => setIsAssignModalOpen(false)}
          onOk={() => assignForm.submit()}
          confirmLoading={saving}
          okText="Phân Công"
          cancelText="Hủy"
          className="chibi-modal"
        >
          <Form
            form={assignForm}
            layout="vertical"
            onFinish={handleAssignClass}
          >
            <Form.Item
              name="class_id"
              label="Chọn Lớp Học"
              rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
            >
              <Select
                placeholder="Chọn lớp học"
                options={classes.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>

            <Form.Item name="role" label="Vai Trò">
              <Select
                options={[
                  { value: "Giáo lý viên", label: "Giáo lý viên Phụ Trách" },
                  { value: "Trợ tá", label: "Trợ tá" },
                  { value: "Trưởng lớp", label: "Trưởng lớp" },
                  { value: "Phó lớp", label: "Phó lớp" },
                ]}
              />
            </Form.Item>

            <Form.Item name="assigned_date" label="Ngày Bắt Đầu Phân Công">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="notes" label="Ghi Chú">
              <Input.TextArea placeholder="Ghi chú phân công..." />
            </Form.Item>
          </Form>
        </AppFormModal>

        {/* CSS SCOPED STYLES */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

          .chibi-catechist-container {
            min-height: 100vh;
            background: #FFF5F7;
            padding: 24px;
            font-family: 'Quicksand', 'Be Vietnam Pro', sans-serif;
          }

          /* HEADER */
          .chibi-page-header {
            margin-bottom: 24px;
          }
          .chibi-sacred-badge {
            display: inline-flex;
            align-items: center;
            background: #FFE4E6;
            color: #FF6B8B;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .chibi-main-title {
            color: #334155 !important;
            font-weight: 800 !important;
            margin-bottom: 4px !important;
          }
          .chibi-sub-title {
            color: #64748B !important;
            font-size: 13px !important;
            margin-bottom: 0 !important;
          }

          /* FILTER */
          .chibi-filter-card {
            border-radius: 20px !important;
            margin-bottom: 20px !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.02) !important;
          }
          .chibi-input-rounded input {
            border-radius: 12px;
          }

          /* TABLE CARD */
          .chibi-table-card {
            border-radius: 20px !important;
            overflow: hidden !important;
            box-shadow: 0 6px 24px rgba(255, 182, 193, 0.12) !important;
          }
          .chibi-table-header {
            padding: 18px 24px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: #FFFFFF;
            border-bottom: 1px solid #FFE4E6;
          }
          .chibi-table-title {
            font-size: 16px;
            color: #334155;
            font-weight: 800;
          }
          .chibi-count-badge {
            background: #FFE4E6;
            color: #FF6B8B;
            padding: 2px 10px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 12px;
          }

          /* TABLE STYLES */
          ..chibi-avatar-wrapper--a {
            padding: 2px;
            background: linear-gradient(135deg, #FF6B8B, #A855F7);
            border-radius: 50%;
            display: inline-block;
          }
          .chibi-avatar {
            border: 2px solid #FFFFFF;
          }
          .chibi-name-text {
            color: #1E293B;
            font-size: 14px;
            cursor: pointer;
            transition: color 0.2s;
          }
          .chibi-name-text:hover {
            color: #FF6B8B;
          }
          .chibi-code-tag {
            background: #F1F5F9;
            color: #64748B;
            border: none;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 4px;
          }
          .chibi-level-tag {
            background: #FFFBEB;
            color: #D97706;
            border: 1px solid #FDE68A;
            border-radius: 20px;
            padding: 2px 10px;
            font-weight: 700;
          }
          .chibi-role-tag {
            background: #F3E8FF;
            color: #A855F7;
            border: none;
            border-radius: 10px;
            font-weight: 700;
          }

          /* ACTION BUTTONS */
          .chibi-action-btn {
            border: none !important;
            background: #F8FAFC !important;
            transition: all 0.2s !important;
          }
          .chibi-btn-view:hover { background: #E0F2FE !important; color: #0284C7 !important; }
          .chibi-btn-edit:hover { background: #FEF3C7 !important; color: #D97706 !important; }
          .chibi-btn-more:hover { background: #F3E8FF !important; color: #A855F7 !important; }

          /* MODAL STYLES */
          .chibi-modal .ant-modal-content {
            border-radius: 24px !important;
            padding: 24px !important;
          }
          .chibi-modal-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 800;
            color: #334155;
            font-size: 18px;
          }
          .chibi-detail-header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-bottom: 16px;
            border-bottom: 1px dashed #FFE4E6;
            margin-bottom: 16px;
          }
          .chibi-descriptions .ant-descriptions-item-label {
            font-weight: 700 !important;
            color: #64748B !important;
            background: #FFF5F7 !important;
          }

          /* MOBILE RESPONSIVE */
          @media (max-width: 640px) {
            .chibi-catechist-container {
              padding: 12px;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}
