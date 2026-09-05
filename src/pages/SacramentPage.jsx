import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  Popconfirm,
  Card,
  Typography,
  Select,
  Row,
  Col,
  Tag,
  Divider,
  Tooltip,
  DatePicker,
  ConfigProvider,
  Descriptions,
  Tabs,
  Alert,
  Upload,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PrinterOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { QRCodeSVG } from "qrcode.react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { useSacrament } from "../hooks/useSacrament";
import { getChurches } from "../api/churchApi";
import { getParishionersAll } from "../api/parishionerApi";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const softBg = "#FAFAFA";

const SACRAMENT_TYPES = {
  BAPTISM: { label: "Rửa Tội", color: "blue", dateKey: "baptism_date" },
  FIRST_COMMUNION: {
    label: "Rước Lễ Lần Đầu",
    color: "green",
    dateKey: "first_communion_date",
  },
  CONFIRMATION: {
    label: "Thêm Sức",
    color: "purple",
    dateKey: "confirmation_date",
  },
  MATRIMONY: { label: "Hôn Phối", color: "gold", dateKey: null },
  HOLY_ORDERS: { label: "Truyền Chức", color: "red", dateKey: null },
};

const SacramentPage = () => {
  const {
    loading,
    data,
    pagination,
    fetchSacraments,
    getSacramentById,
    addSacrament,
    editSacrament,
    deleteSacrament,
  } = useSacrament();

  const [form] = Form.useForm();

  const [activeTab, setActiveTab] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [selectedType, setSelectedType] = useState("BAPTISM");

  // State lưu danh sách tham chiếu
  const [churchesList, setChurchesList] = useState([]);
  const [parishionersList, setParishionersList] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // State Cảnh báo Bí tích hiện tại của Giáo Dân đang chọn
  const [selectedParishionerInfo, setSelectedParishionerInfo] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Modal Trích lục Print
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);

  // 1. TẢI DỮ LIỆU BÍ TÍCH
  const loadData = useCallback(
    (page = 1, currentTab = activeTab) => {
      fetchSacraments({
        page,
        limit: pagination.limit,
        keyword,
        type: currentTab === "ALL" ? "" : currentTab,
      });
    },
    [fetchSacraments, keyword, activeTab, pagination.limit],
  );

  // 2. TẢI DANH SÁCH GIÁO DÂN & GIÁO XỨ
  const loadDropdownData = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const [churchRes, parishRes] = await Promise.all([
        getChurches({ limit: 500, is_active: 1 }),
        getParishionersAll({ limit: 1000, status: "active" }),
      ]);

      const cData = churchRes?.data || churchRes || [];
      const pData = parishRes?.data?.data || parishRes?.data || parishRes || [];

      setChurchesList(Array.isArray(cData) ? cData : []);
      setParishionersList(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error("Lỗi tải danh sách tham chiếu:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  useEffect(() => {
    loadData(1, activeTab);
    loadDropdownData();
  }, [loadData, loadDropdownData, activeTab]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    loadData(1, key);
  };

  // 💡 XỬ LÝ CHỌN GIÁO DÂN -> CẬP NHẬT THÔNG TIN TỰ ĐỘNG & BẬT CẢNH BÁO
  const handleParishionerSelect = (parishionerId) => {
    if (!parishionerId) {
      setSelectedParishionerInfo(null);
      return;
    }

    const selectedPerson = parishionersList.find(
      (p) => Number(p.id) === Number(parishionerId),
    );

    if (selectedPerson) {
      setSelectedParishionerInfo(selectedPerson);

      // Tự động điền Tên Thánh
      if (selectedPerson.saint_name) {
        form.setFieldValue("saint_name", selectedPerson.saint_name);
      }

      // Tự động điền Ngày cử hành nếu có
      const dateKey = SACRAMENT_TYPES[selectedType]?.dateKey;
      if (dateKey && selectedPerson[dateKey]) {
        form.setFieldValue("date_received", dayjs(selectedPerson[dateKey]));
      }
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    const currentParishionerId = form.getFieldValue("parishioner_id");

    if (currentParishionerId && selectedParishionerInfo) {
      const dateKey = SACRAMENT_TYPES[type]?.dateKey;
      if (dateKey && selectedParishionerInfo[dateKey]) {
        form.setFieldValue(
          "date_received",
          dayjs(selectedParishionerInfo[dateKey]),
        );
      }
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      const formatted = {
        ...item,
        date_received: item.date_received ? dayjs(item.date_received) : null,
      };
      setSelectedType(item.type);
      form.setFieldsValue(formatted);

      // Tìm thông tin giáo dân để hiện cảnh báo khi edit
      const person = parishionersList.find(
        (p) => Number(p.id) === Number(item.parishioner_id),
      );
      setSelectedParishionerInfo(person || null);
    } else {
      form.resetFields();
      setSelectedParishionerInfo(null);
      const defaultType = activeTab !== "ALL" ? activeTab : "BAPTISM";
      setSelectedType(defaultType);
      form.setFieldsValue({ type: defaultType });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        date_received: values.date_received
          ? values.date_received.format("YYYY-MM-DD")
          : null,
      };

      if (editingItem) {
        await editSacrament(editingItem.id, payload);
      } else {
        await addSacrament(payload);
      }

      setIsModalOpen(false);
      loadData(1, activeTab);
    } catch (e) {
      console.error("Validation error:", e);
    }
  };

  const handleOpenPrintModal = async (id) => {
    const res = await getSacramentById(id);
    if (res?.success || res) {
      setPrintData(res.data || res);
      setIsPrintModalOpen(true);
    }
  };

  // ==========================================
  // 🚀 TÍNH NĂNG NHẬP / XUẤT EXCEL HÀNG LOẠT
  // ==========================================

  // 1. Xuất file Excel danh sách hiện tại
  const handleExportExcel = () => {
    if (!data || data.length === 0) {
      message.warning("Không có dữ liệu để xuất Excel!");
      return;
    }

    const exportData = data.map((item, index) => ({
      STT: index + 1,
      "Loại Bí Tích": SACRAMENT_TYPES[item.type]?.label || item.type,
      "ID Giáo Dân": item.parishioner_id,
      "Tên Giáo Dân": item.parishioner_name || "",
      "Tên Thánh": item.saint_name || item.parishioner_saint || "",
      "Ngày Cử Hành": item.date_received
        ? dayjs(item.date_received).format("DD/MM/YYYY")
        : "",
      "Linh Mục Ban": item.officiant_name || "",
      "Người Đỡ Đầu": item.godparent_name || "",
      "SĐT Đỡ Đầu": item.godparent_phone || "",
      "Quyển Số": item.book_number || "",
      "Trang Số": item.page_number || "",
      "Số Thứ Tự": item.entry_number || "",
      "Ghi Chú": item.notes || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SoBiTich");
    XLSX.writeFile(
      workbook,
      `Danh_Sach_So_Bi_Tich_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`,
    );
    message.success("Đã xuất file Excel thành công!");
  };

  // 2. Tải file Excel mẫu
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        parishioner_id: 1,
        type: "BAPTISM",
        date_received: "2026-08-15",
        saint_name: "Giuse",
        officiant_name: "Lm. Giuse Nguyễn Văn A",
        godparent_name: "Trần Văn B",
        godparent_phone: "0912345678",
        book_number: "01/2026",
        page_number: "10",
        entry_number: "01",
        notes: "Mẫu nhập file Rửa tội",
      },
      {
        parishioner_id: 2,
        type: "CONFIRMATION",
        date_received: "2026-08-15",
        saint_name: "Maria",
        officiant_name: "Lm. Giuse Nguyễn Văn A",
        godparent_name: "Nguyễn Thị C",
        godparent_phone: "0987654321",
        book_number: "01/2026",
        page_number: "10",
        entry_number: "02",
        notes: "Mẫu nhập file Thêm sức",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MauNhapData");
    XLSX.writeFile(workbook, "File_Mau_Nhap_Bi_Tich.xlsx");
  };

  // 3. Đọc & Nhập Excel Hàng Loạt
  const handleImportExcel = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const rawSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!rawSheet || rawSheet.length === 0) {
          message.error("File Excel rỗng!");
          return;
        }

        let successCount = 0;
        message.loading({
          content: "Đang đọc và nhập danh sách...",
          key: "import",
        });

        for (const row of rawSheet) {
          if (row.parishioner_id && row.type && row.date_received) {
            try {
              await addSacrament({
                parishioner_id: row.parishioner_id,
                type: row.type,
                date_received: row.date_received,
                saint_name: row.saint_name || null,
                officiant_name: row.officiant_name || null,
                godparent_name: row.godparent_name || null,
                godparent_phone: row.godparent_phone || null,
                book_number: row.book_number || null,
                page_number: row.page_number || null,
                entry_number: row.entry_number || null,
                notes: row.notes || "Nhập từ file Excel",
              });
              successCount++;
            } catch (err) {}
          }
        }

        message.success({
          content: `Nhập thành công ${successCount}/${rawSheet.length} hồ sơ!`,
          key: "import",
        });
        loadData(1, activeTab);
      } catch (err) {
        console.error(err);
        message.error({ content: "Lỗi đọc file Excel!", key: "import" });
      }
    };
    reader.readAsArrayBuffer(file);
    return false; // Ngăn Upload mặc định của Antd
  };

  const columns = [
    {
      title: "Loại Bí Tích",
      dataIndex: "type",
      key: "type",
      width: 140,
      render: (type) => (
        <Tag
          color={SACRAMENT_TYPES[type]?.color || "default"}
          style={{ fontWeight: 700 }}
        >
          {SACRAMENT_TYPES[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: "Giáo Dân Nhận Bí Tích",
      key: "parishioner",
      width: 230,
      render: (_, r) => (
        <div>
          <Text strong style={{ color: primaryNavy, fontSize: 14 }}>
            {r.saint_name
              ? `${r.saint_name} `
              : r.parishioner_saint
                ? `${r.parishioner_saint} `
                : ""}
            {r.parishioner_name || `Giáo dân ID: ${r.parishioner_id}`}
          </Text>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            ID GD: {r.parishioner_id}{" "}
            {r.parishioner_code ? `- Mã: ${r.parishioner_code}` : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày Cử Hành",
      dataIndex: "date_received",
      key: "date_received",
      width: 120,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---"),
    },
    {
      title: "Chi Tiết Cử Hành",
      key: "details",
      width: 280,
      render: (_, r) => (
        <Space direction="vertical" size={2} style={{ fontSize: 12 }}>
          {r.officiant_name && (
            <div>
              <UserOutlined style={{ color: primaryNavy, marginRight: 4 }} />
              LM: <strong>{r.officiant_name}</strong>
            </div>
          )}
          {r.godparent_name && (
            <div>
              <BookOutlined style={{ color: accentGold, marginRight: 4 }} />
              Đỡ đầu: <strong>{r.godparent_name}</strong>{" "}
              {r.godparent_phone ? `(${r.godparent_phone})` : ""}
            </div>
          )}
          {r.type === "MATRIMONY" &&
            (r.spouse_name || r.spouse_custom_name) && (
              <div>
                Hôn phối:{" "}
                <strong>
                  {r.spouse_saint ? `${r.spouse_saint} ` : ""}
                  {r.spouse_name || r.spouse_custom_name}
                </strong>
              </div>
            )}
          {(r.church_name || r.church_name_custom) && (
            <div>
              <HomeOutlined style={{ color: "#64748b", marginRight: 4 }} />
              Nơi nhận: {r.church_name || r.church_name_custom}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: "Đối Chiếu Sổ",
      key: "registry",
      width: 140,
      render: (_, r) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Quyển: {r.book_number || "-"} | Trang: {r.page_number || "-"} | STT:{" "}
          {r.entry_number || "-"}
        </Text>
      ),
    },
    {
      title: "Thao Tác",
      align: "center",
      width: 130,
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="In Giấy Trích Lục">
            <Button
              type="text"
              icon={
                <PrinterOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => handleOpenPrintModal(r.id)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={
                <EditOutlined style={{ color: primaryNavy, fontSize: 16 }} />
              }
              onClick={() => openModal(r)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa hồ sơ bí tích này?"
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() =>
              deleteSacrament(r.id).then(() => loadData(1, activeTab))
            }
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "ALL",
      label: (
        <span>
          <AppstoreOutlined /> Tất Cả Bí Tích
        </span>
      ),
    },
    ...Object.keys(SACRAMENT_TYPES).map((key) => ({
      key,
      label: (
        <span>
          <Tag
            color={SACRAMENT_TYPES[key].color}
            style={{ marginRight: 6, borderRadius: 10 }}
          >
            ●
          </Tag>
          {SACRAMENT_TYPES[key].label}
        </span>
      ),
    })),
  ];

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
      <div
        style={{ padding: "30px 20px", background: softBg, minHeight: "100vh" }}
      >
        <div style={{ maxWidth: 1250, margin: "0 auto" }}>
          {/* HEADER BAR & NHÓM NÚT EXCEL / THÊM MỚI */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <Tag color="gold" style={{ borderRadius: 20, fontWeight: 700 }}>
                <SafetyCertificateOutlined /> SỔ MỤC VỤ GIÁO PHẬN
              </Tag>
              <Title
                level={2}
                style={{ color: primaryNavy, margin: "6px 0 0 0" }}
              >
                QUẢN LÝ SỔ BÍ TÍCH
              </Title>
            </div>
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadData(1, activeTab)}
              >
                Làm mới
              </Button>

              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportExcel}
                style={{ fontWeight: 600 }}
              >
                Xuất Excel
              </Button>

              <Upload
                beforeUpload={handleImportExcel}
                showUploadList={false}
                accept=".xlsx, .xls"
              >
                <Button icon={<UploadOutlined />}>Nhập Excel</Button>
              </Upload>

              <Button
                type="link"
                size="small"
                onClick={handleDownloadTemplate}
                style={{ color: "#64748b", padding: 0 }}
              >
                Tải file mẫu
              </Button>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
                style={{ background: primaryNavy, fontWeight: 700, height: 40 }}
              >
                Khai Báo Bí Tích Mới
              </Button>
            </Space>
          </div>

          {/* TABS CHIA CÁC BÍ TÍCH */}
          <Card
            bordered={false}
            style={{ marginBottom: 16, borderRadius: 16, paddingBottom: 0 }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems}
              size="large"
              style={{ marginBottom: -12 }}
            />
          </Card>

          {/* FILTER SEARCH BAR */}
          <Card bordered={false} style={{ marginBottom: 20, borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={18}>
                <Input
                  placeholder="Tìm theo tên giáo dân, linh mục, người đỡ đầu..."
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={() => loadData(1, activeTab)}
                  allowClear
                  size="large"
                />
              </Col>
              <Col xs={24} md={6}>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={() => loadData(1, activeTab)}
                >
                  Tra Cứu
                </Button>
              </Col>
            </Row>
          </Card>

          {/* TABLE DATA */}
          <Card bordered={false} style={{ borderRadius: 16 }}>
            <Table
              loading={loading}
              dataSource={data}
              columns={columns}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: (page) => loadData(page, activeTab),
              }}
            />
          </Card>

          {/* MODAL FORM TÍCH HỢP BỘ KIỂM TRA TIẾN TRÌNH BÍ TÍCH */}
          <Modal
            title={
              <span
                style={{ color: primaryNavy, fontWeight: 700, fontSize: 17 }}
              >
                <BookOutlined style={{ color: accentGold, marginRight: 8 }} />
                {editingItem
                  ? "Chỉnh Sửa Hồ Sơ Bí Tích"
                  : "Khai Báo Hồ Sơ Bí Tích Mới"}
              </span>
            }
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            onOk={handleSave}
            width={900}
            centered
            destroyOnClose
            style={{ top: 20 }}
          >
            <Form form={form} layout="vertical" style={{ paddingTop: 12 }}>
              {/* BLOCK 1: THÔNG TIN CƠ BẢN */}
              <Divider
                orientation="left"
                plain
                style={{
                  fontSize: 13,
                  color: primaryNavy,
                  fontWeight: 700,
                  margin: "0 0 16px 0",
                }}
              >
                1. Thông tin Giáo Dân & Bí Tích
              </Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="parishioner_id"
                    label="Giáo Dân Nhận Bí Tích *"
                    rules={[
                      { required: true, message: "Bắt buộc chọn Giáo dân" },
                    ]}
                  >
                    <Select
                      showSearch
                      loading={loadingDropdowns}
                      placeholder="Gõ tên hoặc mã giáo dân..."
                      optionFilterProp="children"
                      onChange={handleParishionerSelect}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={parishionersList.map((p) => ({
                        value: p.id,
                        label: `${p.saint_name ? `${p.saint_name} ` : ""}${p.full_name} (${p.code || `ID:${p.id}`})`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="type"
                    label="Loại Bí Tích *"
                    rules={[{ required: true }]}
                  >
                    <Select onChange={handleTypeSelect}>
                      {Object.keys(SACRAMENT_TYPES).map((key) => (
                        <Option key={key} value={key}>
                          {SACRAMENT_TYPES[key].label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="date_received"
                    label="Ngày Cử Hành *"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 🌟 CẢNH BÁO TIẾN TRÌNH BÍ TÍCH (RULE CHECKER) */}
              {selectedParishionerInfo && (
                <div style={{ marginBottom: 16 }}>
                  <Alert
                    type="info"
                    showIcon
                    icon={
                      <SafetyCertificateOutlined
                        style={{ color: primaryNavy }}
                      />
                    }
                    message={
                      <div style={{ fontSize: 13 }}>
                        <strong>
                          Tiến trình Bí Tích của{" "}
                          {selectedParishionerInfo.full_name}:
                        </strong>
                        <Space
                          wrap
                          size={[8, 4]}
                          style={{ marginTop: 6, display: "flex" }}
                        >
                          {selectedParishionerInfo.baptism_date ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                              Đã Rửa Tội (
                              {dayjs(
                                selectedParishionerInfo.baptism_date,
                              ).format("DD/MM/YYYY")}
                              )
                            </Tag>
                          ) : (
                            <Tag color="volcano" icon={<WarningOutlined />}>
                              Chưa có Rửa Tội
                            </Tag>
                          )}

                          {selectedParishionerInfo.first_communion_date ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                              Đã Rước Lễ Lần Đầu
                            </Tag>
                          ) : (
                            <Tag color="warning" icon={<WarningOutlined />}>
                              Chưa Rước Lễ
                            </Tag>
                          )}

                          {selectedParishionerInfo.confirmation_date ? (
                            <Tag color="green" icon={<CheckCircleOutlined />}>
                              Đã Thêm Sức
                            </Tag>
                          ) : (
                            <Tag color="warning" icon={<WarningOutlined />}>
                              Chưa Thêm Sức
                            </Tag>
                          )}
                        </Space>
                      </div>
                    }
                  />
                </div>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="saint_name"
                    label="Tên Thánh Nhận Riêng Dịp Này"
                  >
                    <Input placeholder="Ví dụ: Giuse, Maria, Phêrô..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="officiant_name"
                    label="Linh Mục Ban Bí Tích / Chứng Hôn"
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: "#94a3b8" }} />}
                      placeholder="Lm. Giuse Nguyễn Văn A..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="church_id"
                    label="Giáo Xứ/Họ Cử Hành (Nội Xứ)"
                  >
                    <Select
                      showSearch
                      allowClear
                      loading={loadingDropdowns}
                      placeholder="Chọn Giáo xứ/Giáo họ..."
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={churchesList.map((c) => ({
                        value: c.id,
                        label: `${c.name} (${c.type === "GIAO_XU" ? "Xứ" : "Họ"})`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="church_name_custom"
                    label="Tên Giáo Xứ Tự Nhập (Nếu Ngoại xứ)"
                  >
                    <Input placeholder="Giáo xứ Kẻ Sặt, Giáo xứ Tân Định..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* BLOCK 2: NGƯỜI ĐỠ ĐẦU */}
              {selectedType !== "MATRIMONY" && (
                <>
                  <Divider
                    orientation="left"
                    plain
                    style={{
                      fontSize: 13,
                      color: primaryNavy,
                      fontWeight: 700,
                    }}
                  >
                    2. Thông tin Người Đỡ Đầu
                  </Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="godparent_name"
                        label="Tên Thánh & Họ Tên Người Đỡ Đầu"
                      >
                        <Input placeholder="Giuse Trần Văn B..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="godparent_phone"
                        label="Số Điện Thoại Người Đỡ Đầu"
                      >
                        <Input
                          prefix={
                            <PhoneOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="09xxxx..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="godparent_address"
                        label="Địa Chỉ Người Đỡ Đầu"
                      >
                        <Input
                          prefix={
                            <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="Thôn xóm, quận huyện..."
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="godparent_church"
                        label="Giáo Xứ Của Người Đỡ Đầu"
                      >
                        <Input placeholder="Giáo xứ Đồng Quan..." />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {/* BLOCK 3: BÍ TÍCH HÔN PHỐI */}
              {selectedType === "MATRIMONY" && (
                <>
                  <Divider
                    orientation="left"
                    plain
                    style={{
                      fontSize: 13,
                      color: primaryNavy,
                      fontWeight: 700,
                    }}
                  >
                    2. Thông tin Hôn Phối & Người Làm Chứng
                  </Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="spouse_parishioner_id"
                        label="Người Phối Ngẫu (Nếu Nội xứ)"
                      >
                        <Select
                          showSearch
                          allowClear
                          loading={loadingDropdowns}
                          placeholder="Gõ tên chọn Vợ/Chồng..."
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={parishionersList.map((p) => ({
                            value: p.id,
                            label: `${p.saint_name ? `${p.saint_name} ` : ""}${p.full_name} (${p.code || `ID:${p.id}`})`,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="spouse_custom_name"
                        label="Tên Thánh & Họ Tên Phối Ngẫu (Ngoại xứ/Đạo)"
                      >
                        <Input placeholder="Maria Nguyễn Thị C..." />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Text
                    strong
                    style={{
                      color: primaryNavy,
                      display: "block",
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    • Người Làm Chứng 1:
                  </Text>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item
                        name="witness_1_name"
                        label="Họ Tên Nhân Chứng 1"
                      >
                        <Input placeholder="Nguyễn Văn X..." />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="witness_1_phone"
                        label="SĐT Nhân Chứng 1"
                      >
                        <Input
                          prefix={
                            <PhoneOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="09xxxx..."
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="witness_1_address"
                        label="Địa Chỉ Nhân Chứng 1"
                      >
                        <Input
                          prefix={
                            <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="Xã/Huyện..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Text
                    strong
                    style={{
                      color: primaryNavy,
                      display: "block",
                      marginBottom: 8,
                      fontSize: 12,
                    }}
                  >
                    • Người Làm Chứng 2:
                  </Text>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item
                        name="witness_2_name"
                        label="Họ Tên Nhân Chứng 2"
                      >
                        <Input placeholder="Trần Thị Y..." />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="witness_2_phone"
                        label="SĐT Nhân Chứng 2"
                      >
                        <Input
                          prefix={
                            <PhoneOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="09xxxx..."
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="witness_2_address"
                        label="Địa Chỉ Nhân Chứng 2"
                      >
                        <Input
                          prefix={
                            <EnvironmentOutlined style={{ color: "#94a3b8" }} />
                          }
                          placeholder="Xã/Huyện..."
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {/* BLOCK 4: SỔ BÍ TÍCH & GHI CHÚ */}
              <Divider
                orientation="left"
                plain
                style={{ fontSize: 13, color: primaryNavy, fontWeight: 700 }}
              >
                3. Đối Chiếu Sổ Bí Tích Truyền Thống & Ghi Chú
              </Divider>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="book_number" label="Quyển Số">
                    <Input placeholder="Quyển 01/2026..." />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="page_number" label="Trang Số">
                    <Input placeholder="12..." />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="entry_number" label="Số Thứ Tự (STT)">
                    <Input placeholder="05..." />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="notes" label="Ghi Chú Mục Vụ">
                <TextArea
                  prefix={<FileTextOutlined style={{ color: "#94a3b8" }} />}
                  rows={2}
                  placeholder="Ghi chú thêm (Đã rao hôn phối 3 lần, chuyển xứ...)"
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* MODAL IN TRÍCH LỤC BÍ TÍCH (TÍCH HỢP CSS @PRINT & QR CODE XÁC THỰC) */}
          <Modal
            open={isPrintModalOpen}
            onCancel={() => setIsPrintModalOpen(false)}
            width={750}
            footer={[
              <Button key="close" onClick={() => setIsPrintModalOpen(false)}>
                Đóng
              </Button>,
              <Button
                key="print"
                type="primary"
                icon={<PrinterOutlined />}
                style={{ background: primaryNavy }}
                onClick={() => window.print()}
              >
                In Giấy Trích Lục (A4)
              </Button>,
            ]}
          >
            {printData && (
              <div
                id="print-certificate"
                style={{ padding: 24, background: "#fff" }}
              >
                {/* TIÊU ĐỀ PHÔNG BẠT */}
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <Text
                    strong
                    style={{
                      textTransform: "uppercase",
                      fontSize: 13,
                      letterSpacing: 1,
                    }}
                  >
                    GIÁO PHẬN THÁI BÌNH • GIÁO XỨ ĐỒNG QUAN
                  </Text>
                  <Title
                    level={2}
                    style={{
                      color: primaryNavy,
                      margin: "8px 0 4px 0",
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}
                  >
                    GIẤY TRÍCH LỤC BÍ TÍCH{" "}
                    {SACRAMENT_TYPES[printData.type]?.label?.toUpperCase()}
                  </Title>
                  <Text italic style={{ color: "#64748b" }}>
                    Trích từ Sổ Bí Tích Mụcvụ lưu trữ tại Văn phòng Giáo xứ
                  </Text>
                </div>

                {/* BẢNG THÔNG TIN TRÍCH LỤC */}
                <Descriptions
                  column={2}
                  bordered
                  size="middle"
                  style={{ marginTop: 20 }}
                >
                  <Descriptions.Item label="Họ và Tên">
                    <strong>
                      {printData.parishioner_name ||
                        `ID Giáo dân: ${printData.parishioner_id}`}
                    </strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên Thánh">
                    <strong>
                      {printData.saint_name ||
                        printData.parishioner_saint ||
                        "---"}
                    </strong>
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngày Sinh">
                    {printData.parishioner_dob
                      ? dayjs(printData.parishioner_dob).format("DD/MM/YYYY")
                      : "---"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới Tính">
                    {printData.parishioner_gender === "male"
                      ? "Nam"
                      : printData.parishioner_gender === "female"
                        ? "Nữ"
                        : "---"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngày Cử Hành" span={2}>
                    <strong style={{ color: primaryNavy, fontSize: 15 }}>
                      {printData.date_received
                        ? dayjs(printData.date_received).format("DD/MM/YYYY")
                        : "---"}
                    </strong>
                  </Descriptions.Item>

                  <Descriptions.Item label="Linh Mục Ban">
                    {printData.officiant_name || "---"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nơi Cử Hành">
                    {printData.church_name ||
                      printData.church_name_custom ||
                      "Giáo xứ Đồng Quan"}
                  </Descriptions.Item>

                  {printData.type !== "MATRIMONY" && (
                    <>
                      <Descriptions.Item label="Người Đỡ Đầu">
                        {printData.godparent_name || "---"}
                      </Descriptions.Item>
                      <Descriptions.Item label="GX Người Đỡ Đầu">
                        {printData.godparent_church || "---"}
                      </Descriptions.Item>
                    </>
                  )}

                  {printData.type === "MATRIMONY" && (
                    <>
                      <Descriptions.Item label="Phối Ngẫu">
                        {printData.spouse_name ||
                          printData.spouse_custom_name ||
                          "---"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Người Làm Chứng 1">
                        {printData.witness_1_name || "---"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Người Làm Chứng 2" span={2}>
                        {printData.witness_2_name || "---"}
                      </Descriptions.Item>
                    </>
                  )}

                  <Descriptions.Item label="Trích Sổ">
                    Quyển {printData.book_number || "---"} - Trang{" "}
                    {printData.page_number || "---"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số Thứ Tự">
                    {printData.entry_number || "---"}
                  </Descriptions.Item>

                  {printData.notes && (
                    <Descriptions.Item label="Ghi Chú Mục Vụ" span={2}>
                      {printData.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {/* FOOTER CHỮ KÝ & MÃ QR CODE XÁC THỰC */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: 36,
                    paddingTop: 12,
                  }}
                >
                  {/* Mã QR Code Tra Cứu Thực Tế */}
                  <div style={{ textAlign: "center" }}>
                    <QRCodeSVG
                      value={`https://giaoxudongquan.vn/verify-sacrament/${printData.id}`}
                      size={85}
                      level="H"
                    />
                    <div
                      style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}
                    >
                      Mã tra cứu: #{printData.id}
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <Text italic style={{ fontSize: 13 }}>
                      Đồng Quan, ngày {dayjs().format("DD")} tháng{" "}
                      {dayjs().format("MM")} năm {dayjs().format("YYYY")}
                    </Text>
                    <div
                      style={{
                        marginTop: 4,
                        fontWeight: 700,
                        color: primaryNavy,
                      }}
                    >
                      Linh mục Chánh xứ
                    </div>
                    <div style={{ height: 65 }} />
                    <Text italic style={{ fontSize: 12, color: "#94a3b8" }}>
                      (Ký tên & Đóng dấu)
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>

      {/* 🖨️ CSS CHUYÊN DỤNG CHO IN ẤN PRINT A4/A5 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* Hide everything on screen */
          body * {
            visibility: hidden;
          }
          /* Only display the certificate modal content */
          #print-certificate, #print-certificate * {
            visibility: visible;
          }
          #print-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px !important;
          }
          .ant-modal-mask, .ant-modal-footer, .ant-modal-close, .ant-modal-header {
            display: none !important;
          }
          .ant-modal {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            top: 0 !important;
          }
          .ant-modal-content {
            box-shadow: none !important;
            padding: 0 !important;
          }
        }
      `,
        }}
      />
    </ConfigProvider>
  );
};

export default SacramentPage;
