import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  BankOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { useDiocese } from "../../hooks/useDiocese";

import { useDeanery } from "../../hooks/useDeanery";

import "./DioceseManagement.css";

const { Title, Text } = Typography;

const { Option } = Select;

const DioceseManagement = () => {
  const [dioceseForm] = Form.useForm();
  const [deaneryForm] = Form.useForm();

  /**
   * ======================================================
   * HOOKS
   * ======================================================
   */

  const {
    fetchDioceses,
    fetchArchdioceses,
    addDiocese,
    editDiocese,
    removeDiocese,
    toggleActive: toggleDioceseActive,
  } = useDiocese();

  const {
    fetchDeaneries,
    addDeanery,
    editDeanery,
    removeDeanery,
    toggleActive: toggleDeaneryActive,
  } = useDeanery();

  /**
   * ======================================================
   * STATE
   * ======================================================
   */

  const [activeTab, setActiveTab] = useState("dioceses");

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  /**
   * Diocese
   */
  const [dioceses, setDioceses] = useState([]);

  const [archdioceses, setArchdioceses] = useState([]);

  const [selectedArchdioceseId, setSelectedArchdioceseId] = useState(null);

  const [selectedDioceseId, setSelectedDioceseId] = useState(null);

  /**
   * Deanery
   */
  const [deaneries, setDeaneries] = useState([]);

  const [deaneryDioceses, setDeaneryDioceses] = useState([]);

  /**
   * Search
   */
  const [dioceseKeyword, setDioceseKeyword] = useState("");

  const [deaneryKeyword, setDeaneryKeyword] = useState("");

  /**
   * Modal
   */
  const [dioceseModalOpen, setDioceseModalOpen] = useState(false);

  const [deaneryModalOpen, setDeaneryModalOpen] = useState(false);

  const [editingDiocese, setEditingDiocese] = useState(null);

  const [editingDeanery, setEditingDeanery] = useState(null);

  /**
   * ======================================================
   * LOAD TỔNG GIÁO PHẬN
   * ======================================================
   */

  const loadArchdioceses = useCallback(async () => {
    try {
      const res = await fetchArchdioceses();

      console.log("[DioceseManagement] archdioceses:", res);

      setArchdioceses(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("[DioceseManagement] loadArchdioceses:", error);

      message.error("Không thể tải danh sách Tổng Giáo phận");
    }
  }, [fetchArchdioceses]);

  /**
   * ======================================================
   * LOAD GIÁO PHẬN
   * ======================================================
   */

  const loadDioceses = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (selectedArchdioceseId) {
        params.parent_diocese_id = selectedArchdioceseId;
      }

      if (dioceseKeyword.trim()) {
        params.keyword = dioceseKeyword.trim();
      }

      const res = await fetchDioceses(params);

      console.log("[DioceseManagement] dioceses:", res);

      setDioceses(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("[DioceseManagement] loadDioceses:", error);

      message.error("Không thể tải danh sách Giáo phận");
    } finally {
      setLoading(false);
    }
  }, [fetchDioceses, selectedArchdioceseId, dioceseKeyword]);

  /**
   * ======================================================
   * LOAD GIÁO HẠT
   * ======================================================
   */

  const loadDeaneries = useCallback(async () => {
    try {
      setLoading(true);

      const params = {};

      if (selectedDioceseId) {
        params.diocese_id = selectedDioceseId;
      }

      if (deaneryKeyword.trim()) {
        params.keyword = deaneryKeyword.trim();
      }

      const res = await fetchDeaneries(params);

      console.log("[DioceseManagement] deaneries:", res);

      setDeaneries(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("[DioceseManagement] loadDeaneries:", error);

      message.error("Không thể tải danh sách Giáo hạt");
    } finally {
      setLoading(false);
    }
  }, [fetchDeaneries, selectedDioceseId, deaneryKeyword]);

  /**
   * ======================================================
   * LOAD DIOCESES CHO MODAL GIÁO HẠT
   * ======================================================
   */

  const loadDeaneryDioceses = useCallback(async () => {
    try {
      const res = await fetchDioceses({
        type: "GIAO_PHAN",
        is_active: 1,
      });

      setDeaneryDioceses(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error("[DioceseManagement] loadDeaneryDioceses:", error);

      message.error("Không thể tải Giáo phận");
    }
  }, [fetchDioceses]);

  /**
   * ======================================================
   * INITIAL LOAD
   * ======================================================
   */

  useEffect(() => {
    loadArchdioceses();
    loadDeaneryDioceses();
  }, [loadArchdioceses, loadDeaneryDioceses]);

  useEffect(() => {
    if (activeTab === "dioceses") {
      loadDioceses();
    }
  }, [activeTab, loadDioceses]);

  useEffect(() => {
    if (activeTab === "deaneries") {
      loadDeaneries();
    }
  }, [activeTab, loadDeaneries]);

  /**
   * ======================================================
   * FILTER TỔNG GIÁO PHẬN
   * ======================================================
   */

  const handleArchdioceseFilter = async (value) => {
    setSelectedArchdioceseId(value || null);
  };

  /**
   * ======================================================
   * FILTER GIÁO PHẬN
   * ======================================================
   */

  const handleDioceseFilter = async (value) => {
    setSelectedDioceseId(value || null);
  };

  /**
   * ======================================================
   * MODAL GIÁO PHẬN
   * ======================================================
   */

  const openCreateDiocese = () => {
    setEditingDiocese(null);

    dioceseForm.resetFields();

    dioceseForm.setFieldsValue({
      type: "GIAO_PHAN",
      is_active: true,
    });

    setDioceseModalOpen(true);
  };

  const openEditDiocese = (record) => {
    console.log("[EDIT DIOCESE]", record);

    setEditingDiocese(record);

    dioceseForm.setFieldsValue({
      code: record.code,
      name: record.name,
      bishop_name: record.bishop_name || "",
      address: record.address || "",
      phone: record.phone || "",
      email: record.email || "",
      parent_diocese_id: record.parent_diocese_id || undefined,
      type: record.type || "GIAO_PHAN",
      is_active: Boolean(record.is_active),
    });

    setDioceseModalOpen(true);
  };

  const closeDioceseModal = () => {
    if (saving) {
      return;
    }

    setDioceseModalOpen(false);
    setEditingDiocese(null);
    dioceseForm.resetFields();
  };

  /**
   * ======================================================
   * SAVE GIÁO PHẬN
   * ======================================================
   */

  const handleSaveDiocese = async () => {
    try {
      const values = await dioceseForm.validateFields();

      setSaving(true);

      const payload = {
        code: values.code?.trim(),
        name: values.name?.trim(),
        bishop_name: values.bishop_name?.trim() || null,
        address: values.address?.trim() || null,
        phone: values.phone?.trim() || null,
        email: values.email?.trim() || null,

        parent_diocese_id:
          values.type === "GIAO_PHAN" ? values.parent_diocese_id || null : null,

        type: values.type || "GIAO_PHAN",

        is_active: values.is_active ? 1 : 0,
      };

      console.log("[SAVE DIOCESE] payload:", payload);

      if (editingDiocese) {
        await editDiocese(editingDiocese.id, payload);

        message.success("Cập nhật Giáo phận thành công");
      } else {
        await addDiocese(payload);

        message.success("Thêm Giáo phận thành công");
      }

      closeDioceseModal();

      await Promise.all([
        loadArchdioceses(),
        loadDioceses(),
        loadDeaneryDioceses(),
      ]);
    } catch (error) {
      console.error("[SAVE DIOCESE] ERROR:", error);

      if (error?.errorFields) {
        return;
      }

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu Giáo phận",
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ======================================================
   * DELETE GIÁO PHẬN
   * ======================================================
   */

  const handleDeleteDiocese = async (record) => {
    try {
      setLoading(true);

      console.log("[DELETE DIOCESE]", record.id);

      await removeDiocese(record.id);

      message.success("Xóa Giáo phận thành công");

      await Promise.all([
        loadDioceses(),
        loadArchdioceses(),
        loadDeaneryDioceses(),
      ]);
    } catch (error) {
      console.error("[DELETE DIOCESE] ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể xóa Giáo phận",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ======================================================
   * TOGGLE GIÁO PHẬN
   * ======================================================
   */

  const handleToggleDiocese = async (record) => {
    try {
      await toggleDioceseActive(record.id);

      message.success(
        record.is_active ? "Đã khóa Giáo phận" : "Đã kích hoạt Giáo phận",
      );

      await Promise.all([
        loadDioceses(),
        loadArchdioceses(),
        loadDeaneryDioceses(),
      ]);
    } catch (error) {
      console.error("[TOGGLE DIOCESE] ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể thay đổi trạng thái",
      );
    }
  };

  /**
   * ======================================================
   * MODAL GIÁO HẠT
   * ======================================================
   */

  const openCreateDeanery = () => {
    setEditingDeanery(null);

    deaneryForm.resetFields();

    deaneryForm.setFieldsValue({
      is_active: true,
    });

    setDeaneryModalOpen(true);
  };

  const openEditDeanery = (record) => {
    console.log("[EDIT DEANERY]", record);

    setEditingDeanery(record);

    deaneryForm.setFieldsValue({
      code: record.code,
      name: record.name,
      diocese_id: record.diocese_id,
      address: record.address || "",
      phone: record.phone || "",
      email: record.email || "",
      is_active: Boolean(record.is_active),
    });

    setDeaneryModalOpen(true);
  };

  const closeDeaneryModal = () => {
    if (saving) {
      return;
    }

    setDeaneryModalOpen(false);
    setEditingDeanery(null);
    deaneryForm.resetFields();
  };

  /**
   * ======================================================
   * SAVE GIÁO HẠT
   * ======================================================
   */

  const handleSaveDeanery = async () => {
    try {
      const values = await deaneryForm.validateFields();

      setSaving(true);

      const payload = {
        code: values.code?.trim(),
        name: values.name?.trim(),

        diocese_id: values.diocese_id,

        address: values.address?.trim() || null,

        phone: values.phone?.trim() || null,

        email: values.email?.trim() || null,

        is_active: values.is_active ? 1 : 0,
      };

      console.log("[SAVE DEANERY] payload:", payload);

      if (editingDeanery) {
        await editDeanery(editingDeanery.id, payload);

        message.success("Cập nhật Giáo hạt thành công");
      } else {
        await addDeanery(payload);

        message.success("Thêm Giáo hạt thành công");
      }

      closeDeaneryModal();

      await loadDeaneries();
    } catch (error) {
      console.error("[SAVE DEANERY] ERROR:", error);

      if (error?.errorFields) {
        return;
      }

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu Giáo hạt",
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ======================================================
   * DELETE GIÁO HẠT
   * ======================================================
   */

  const handleDeleteDeanery = async (record) => {
    try {
      setLoading(true);

      console.log("[DELETE DEANERY]", record.id);

      await removeDeanery(record.id);

      message.success("Xóa Giáo hạt thành công");

      await loadDeaneries();
    } catch (error) {
      console.error("[DELETE DEANERY] ERROR:", error);

      message.error(error?.response?.data?.message || "Không thể xóa Giáo hạt");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ======================================================
   * TOGGLE GIÁO HẠT
   * ======================================================
   */

  const handleToggleDeanery = async (record) => {
    try {
      await toggleDeaneryActive(record.id);

      message.success(
        record.is_active ? "Đã khóa Giáo hạt" : "Đã kích hoạt Giáo hạt",
      );

      await loadDeaneries();
    } catch (error) {
      console.error("[TOGGLE DEANERY] ERROR:", error);

      message.error(
        error?.response?.data?.message || "Không thể thay đổi trạng thái",
      );
    }
  };

  /**
   * ======================================================
   * STATISTICS
   * ======================================================
   */

  const dioceseStats = useMemo(() => {
    const total = dioceses.length;

    const active = dioceses.filter((item) => Boolean(item.is_active)).length;

    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [dioceses]);

  const deaneryStats = useMemo(() => {
    const total = deaneries.length;

    const active = deaneries.filter((item) => Boolean(item.is_active)).length;

    const inactive = total - active;

    return {
      total,
      active,
      inactive,
    };
  }, [deaneries]);

  /**
   * ======================================================
   * TABLE DIOCESE
   * ======================================================
   */

  const dioceseColumns = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },

    {
      title: "Mã",
      dataIndex: "code",
      width: 180,
      render: (value) => <Text strong>{value}</Text>,
    },

    {
      title: "Giáo phận",
      dataIndex: "name",
      render: (value, record) => (
        <div className="entity-name">
          <div className="entity-icon">
            <BankOutlined />
          </div>

          <div>
            <Text strong>{value}</Text>

            {record.parent_name && (
              <div>
                <Text type="secondary" className="entity-subtitle">
                  {record.parent_name}
                </Text>
              </div>
            )}
          </div>
        </div>
      ),
    },

    {
      title: "Giám mục",
      dataIndex: "bishop_name",
      width: 190,
      render: (value) => value || <Text type="secondary">Chưa cập nhật</Text>,
    },

    {
      title: "Loại",
      dataIndex: "type",
      width: 150,
      render: (value) =>
        value === "TONG_GIAO_PHAN" ? (
          <Tag color="gold">TỔNG GIÁO PHẬN</Tag>
        ) : (
          <Tag color="blue">GIÁO PHẬN</Tag>
        ),
    },

    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 120,
      align: "center",
      render: (value, record) => (
        <Switch
          checked={Boolean(value)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          onChange={() => handleToggleDiocese(record)}
        />
      ),
    },

    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditDiocese(record)}
          />

          <Popconfirm
            title="Xóa Giáo phận?"
            description={
              <>
                <div>Bạn có chắc muốn xóa:</div>

                <strong>{record.name}</strong>
              </>
            }
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() => handleDeleteDiocese(record)}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * ======================================================
   * TABLE DEANERY
   * ======================================================
   */

  const deaneryColumns = [
    {
      title: "#",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },

    {
      title: "Mã",
      dataIndex: "code",
      width: 170,
      render: (value) => <Text strong>{value}</Text>,
    },

    {
      title: "Giáo hạt",
      dataIndex: "name",
      render: (value, record) => (
        <div className="entity-name">
          <div className="entity-icon deanery">
            <ApartmentOutlined />
          </div>

          <div>
            <Text strong>{value}</Text>

            <div>
              <Text type="secondary" className="entity-subtitle">
                {record.diocese_name || "Chưa xác định Giáo phận"}
              </Text>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Giáo phận",
      dataIndex: "diocese_name",
      width: 220,
    },

    {
      title: "Điện thoại",
      dataIndex: "phone",
      width: 150,
      render: (value) => value || <Text type="secondary">—</Text>,
    },

    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 120,
      align: "center",
      render: (value, record) => (
        <Switch
          checked={Boolean(value)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
          onChange={() => handleToggleDeanery(record)}
        />
      ),
    },

    {
      title: "Thao tác",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditDeanery(record)}
          />

          <Popconfirm
            title="Xóa Giáo hạt?"
            description={
              <>
                <div>Bạn có chắc muốn xóa:</div>

                <strong>{record.name}</strong>
              </>
            }
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
            onConfirm={() => handleDeleteDeanery(record)}
          >
            <Button danger type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  /**
   * ======================================================
   * RENDER
   * ======================================================
   */

  return (
    <div className="diocese-management-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-hero">
        <div>
          <div className="page-eyebrow">
            <SettingOutlined />
            QUẢN TRỊ GIÁO HỘI
          </div>

          <Title level={2} className="page-title">
            Giáo phận & Giáo hạt
          </Title>

          <Text className="page-description">
            Quản lý hệ thống Tổng Giáo phận, Giáo phận và Giáo hạt trong
            FaithEdu.
          </Text>
        </div>

        <div className="hero-actions">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              loadArchdioceses();
              loadDioceses();
              loadDeaneries();
            }}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* =================================================
          ALERT
      ================================================= */}

      <Alert
        className="hierarchy-alert"
        type="info"
        showIcon
        message="Cấu trúc quản lý"
        description={
          <>
            <strong>Tổng Giáo phận</strong> → <strong>Giáo phận</strong> →{" "}
            <strong>Giáo hạt</strong> → Giáo xứ.
          </>
        }
      />

      {/* =================================================
          TABS
      ================================================= */}

      <div className="management-tabs">
        <button
          type="button"
          className={
            activeTab === "dioceses"
              ? "management-tab active"
              : "management-tab"
          }
          onClick={() => setActiveTab("dioceses")}
        >
          <BankOutlined />
          <span>Giáo phận</span>

          <span className="tab-count">{dioceses.length}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === "deaneries"
              ? "management-tab active"
              : "management-tab"
          }
          onClick={() => setActiveTab("deaneries")}
        >
          <ApartmentOutlined />
          <span>Giáo hạt</span>

          <span className="tab-count">{deaneries.length}</span>
        </button>
      </div>

      {/* =================================================
          DIOCESES
      ================================================= */}

      {activeTab === "dioceses" && (
        <>
          {/* STAT */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Giáo phận"
                  value={dioceseStats.total}
                  prefix={<BankOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Đang hoạt động"
                  value={dioceseStats.active}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Tổng Giáo phận"
                  value={archdioceses.length}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* TABLE CARD */}
          <Card className="management-card" bordered={false}>
            <div className="table-toolbar">
              <div>
                <Title level={4} className="section-title">
                  Danh sách Giáo phận
                </Title>

                <Text type="secondary">
                  Quản lý thông tin các Giáo phận thuộc Giáo hội.
                </Text>
              </div>

              <Space wrap>
                <Select
                  allowClear
                  showSearch
                  placeholder="Lọc Tổng Giáo phận"
                  style={{
                    width: 260,
                  }}
                  value={selectedArchdioceseId}
                  optionFilterProp="children"
                  onChange={handleArchdioceseFilter}
                >
                  {archdioceses.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>

                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Tìm mã, tên, Giám mục..."
                  value={dioceseKeyword}
                  onChange={(e) => setDioceseKeyword(e.target.value)}
                  onPressEnter={loadDioceses}
                  style={{
                    width: 280,
                  }}
                />

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateDiocese}
                >
                  Thêm Giáo phận
                </Button>
              </Space>
            </div>

            <Table
              rowKey="id"
              loading={loading}
              columns={dioceseColumns}
              dataSource={dioceses}
              scroll={{
                x: 1100,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} Giáo phận`,
              }}
            />
          </Card>
        </>
      )}

      {/* =================================================
          DEANERIES
      ================================================= */}

      {activeTab === "deaneries" && (
        <>
          {/* STAT */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Giáo hạt"
                  value={deaneryStats.total}
                  prefix={<ApartmentOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Đang hoạt động"
                  value={deaneryStats.active}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card className="stat-card">
                <Statistic
                  title="Giáo phận"
                  value={deaneryDioceses.length}
                  prefix={<BankOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card className="management-card" bordered={false}>
            <div className="table-toolbar">
              <div>
                <Title level={4} className="section-title">
                  Danh sách Giáo hạt
                </Title>

                <Text type="secondary">
                  Quản lý các Giáo hạt trực thuộc Giáo phận.
                </Text>
              </div>

              <Space wrap>
                <Select
                  allowClear
                  showSearch
                  placeholder="Lọc theo Giáo phận"
                  style={{
                    width: 260,
                  }}
                  value={selectedDioceseId}
                  optionFilterProp="children"
                  onChange={handleDioceseFilter}
                >
                  {deaneryDioceses.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>

                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Tìm mã, tên Giáo hạt..."
                  value={deaneryKeyword}
                  onChange={(e) => setDeaneryKeyword(e.target.value)}
                  onPressEnter={loadDeaneries}
                  style={{
                    width: 280,
                  }}
                />

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateDeanery}
                >
                  Thêm Giáo hạt
                </Button>
              </Space>
            </div>

            <Table
              rowKey="id"
              loading={loading}
              columns={deaneryColumns}
              dataSource={deaneries}
              scroll={{
                x: 1050,
              }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} Giáo hạt`,
              }}
            />
          </Card>
        </>
      )}

      {/* =================================================
          MODAL GIÁO PHẬN
      ================================================= */}

      <Modal
        open={dioceseModalOpen}
        title={
          <div className="modal-title">
            <div className="modal-title-icon">
              <BankOutlined />
            </div>

            <div>
              <div>
                {editingDiocese ? "Chỉnh sửa Giáo phận" : "Thêm Giáo phận"}
              </div>

              <Text type="secondary" className="modal-subtitle">
                {editingDiocese
                  ? "Cập nhật thông tin Giáo phận"
                  : "Tạo Giáo phận mới"}
              </Text>
            </div>
          </div>
        }
        width={700}
        centered
        destroyOnClose
        onCancel={closeDioceseModal}
        onOk={handleSaveDiocese}
        confirmLoading={saving}
        okText={editingDiocese ? "Lưu thay đổi" : "Thêm Giáo phận"}
        cancelText="Hủy"
      >
        <Form form={dioceseForm} layout="vertical" className="management-form">
          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                label="Mã Giáo phận"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã",
                  },
                ]}
              >
                <Input
                  placeholder="VD: GP_THAI_BINH"
                  disabled={Boolean(editingDiocese)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={14}>
              <Form.Item
                label="Tên Giáo phận"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên",
                  },
                ]}
              >
                <Input placeholder="VD: Giáo phận Thái Bình" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Loại"
                name="type"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select>
                  <Option value="GIAO_PHAN">Giáo phận</Option>

                  <Option value="TONG_GIAO_PHAN">Tổng Giáo phận</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                noStyle
                shouldUpdate={(prev, current) => prev.type !== current.type}
              >
                {({ getFieldValue }) =>
                  getFieldValue("type") === "GIAO_PHAN" ? (
                    <Form.Item
                      label="Thuộc Tổng Giáo phận"
                      name="parent_diocese_id"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn Tổng Giáo phận",
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        showSearch
                        placeholder="Chọn Tổng Giáo phận"
                        optionFilterProp="children"
                      >
                        {archdioceses.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Đức Giám mục" name="bishop_name">
                <Input placeholder="Nhập tên Đức Giám mục" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea
                  rows={2}
                  placeholder="Địa chỉ Tòa Giám mục..."
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Điện thoại" name="phone">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Trạng thái"
                name="is_active"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm khóa"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* =================================================
          MODAL GIÁO HẠT
      ================================================= */}

      <Modal
        open={deaneryModalOpen}
        title={
          <div className="modal-title">
            <div className="modal-title-icon">
              <ApartmentOutlined />
            </div>

            <div>
              <div>
                {editingDeanery ? "Chỉnh sửa Giáo hạt" : "Thêm Giáo hạt"}
              </div>

              <Text type="secondary" className="modal-subtitle">
                {editingDeanery
                  ? "Cập nhật thông tin Giáo hạt"
                  : "Tạo Giáo hạt mới"}
              </Text>
            </div>
          </div>
        }
        width={700}
        centered
        destroyOnClose
        onCancel={closeDeaneryModal}
        onOk={handleSaveDeanery}
        confirmLoading={saving}
        okText={editingDeanery ? "Lưu thay đổi" : "Thêm Giáo hạt"}
        cancelText="Hủy"
      >
        <Form form={deaneryForm} layout="vertical" className="management-form">
          <Row gutter={16}>
            <Col xs={24} sm={10}>
              <Form.Item
                label="Mã Giáo hạt"
                name="code"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã Giáo hạt",
                  },
                ]}
              >
                <Input
                  placeholder="VD: HAT_DONG_QUAN"
                  disabled={Boolean(editingDeanery)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={14}>
              <Form.Item
                label="Tên Giáo hạt"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên Giáo hạt",
                  },
                ]}
              >
                <Input placeholder="VD: Giáo hạt Đông Quan" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Giáo phận"
                name="diocese_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn Giáo phận",
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn Giáo phận"
                  optionFilterProp="children"
                >
                  {deaneryDioceses.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Địa chỉ" name="address">
                <Input.TextArea rows={2} placeholder="Địa chỉ Giáo hạt..." />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Điện thoại" name="phone">
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Trạng thái"
                name="is_active"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm khóa"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DioceseManagement;
