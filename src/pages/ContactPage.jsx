import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  Typography,
  message,
  Popconfirm,
  Spin,
  Row,
  Col,
  Avatar,
  Tooltip,
  Form,
  Badge,
  Tabs,
  Switch,
  Divider,
} from "antd";

import {
  MailOutlined as MailIcon,
  EyeOutlined as EyeIcon,
  DeleteOutlined as DeleteIcon,
  ReloadOutlined as ReloadIcon,
  SearchOutlined as SearchIcon,
  SendOutlined as SendIcon,
  CompassOutlined,
  FormOutlined,
  SettingOutlined,
  RobotOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";

import {
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  replyContactApi,
  getAutoResponderConfig,
  updateAutoResponderConfig,
} from "../api/contactApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// =====================================================
// PALETTE COLOR CONSTANTS
// =====================================================
const primaryNavy = "#1B365D"; // Xanh Đêm Navy
const accentGold = "#D4AF37"; // Vàng Đồng
const textDark = "#1E293B"; // Chữ tối modern
const softBg = "#FAF9F5"; // Nền dịu ấm

// =====================================================
// EMAIL QUICK REPLY TEMPLATES (MẪU PHẢN HỒI NHANH TRONG MODAL)
// =====================================================
const EMAIL_TEMPLATES = [
  {
    key: "thank_you",
    label: "🙏 Thư Cảm Ơn & Tiếp Nhận",
    subject: "Re: [Giáo Xứ Đồng Quan] Xác nhận đã nhận được thư liên hệ",
    content: (name) =>
      `Kính gửi ${name || "Quý giáo dân / Độc giả"},\n\nBan Hành Giáo - Giáo Xứ Đồng Quan đã nhận được thông điệp liên hệ của ông/bà.\nChúng tôi chân thành cảm ơn ý kiến đóng góp / câu hỏi của quý vị và sẽ xem xét xử lý trong thời gian sớm nhất.\n\nNguyện xin Chúa ban nhiều ơn lành cho quý vị và gia đình.\n\nTrân trọng,\nBan Hành Giáo Giáo Xứ Đồng Quan`,
  },
  {
    key: "schedule",
    label: "📅 Xác Nhận Lịch Lễ & Phụng Vụ",
    subject: "Re: [Giáo Xứ Đồng Quan] Thông tin Lịch Lễ & Phụng Vụ",
    content: (name) =>
      `Kính gửi ${name || "Quý giáo dân"},\n\nBan Hành Giáo xin gửi lời chào trân trọng.\nLiên quan đến câu hỏi về Lịch Phụng Vụ / Giờ Thánh Lễ của Giáo Xứ, chúng tôi xin thông tin như sau:\n- Ngày thường: 05:00 & 18:00\n- Chúa Nhật: 05:30, 08:00 (Thánh lễ Thiếu Nhi) & 17:30\n\nNếu quý vị cần xin ý lễ hoặc hỗ trợ bí tích, xin vui lòng liên hệ trực tiếp Văn phòng Giáo xứ.\n\nTrân trọng,\nBan Hành Giáo Giáo Xứ Đồng Quan`,
  },
  {
    key: "donation",
    label: "🎁 Hướng Dẫn Đóng Góp / Công Đức",
    subject: "Re: [Giáo Xứ Đồng Quan] Hướng dẫn đóng góp & Công đức xây dựng",
    content: (name) =>
      `Kính gửi ${name || "Quý ân nhân"},\n\nGiáo Xứ Đồng Quan xin chân thành cảm ơn tấm lòng hào tâm và tình cảm quý báu mà quý vị dành cho Giáo Xứ.\nMọi sự đóng góp / công đức hỗ trợ xây dựng và duy trì sinh hoạt Giáo xứ xin được chuyển về:\n\n- Tên tài khoản: Giáo Xứ Đồng Quan\n- Số tài khoản: [Số tài khoản ngân hàng]\n- Ngân hàng: [Tên ngân hàng]\n- Nội dung: [Họ tên] - Cong duc GXDQ\n\nXin Chúa trả công bội hậu cho tấm lòng quảng đại của quý vị.\n\nTrân trọng,\nBan Hành Giáo Giáo Xứ Đồng Quan`,
  },
];

const ContactPage = () => {
  // =====================================================
  // STATE MANAGEMENT - TABS & CONTACTS
  // =====================================================
  const [activeTab, setActiveTab] = useState("inbox");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  // State Modal Soạn/Gửi Email
  const [replyOpen, setReplyOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [replyForm] = Form.useForm();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // =====================================================
  // STATE MANAGEMENT - AUTO RESPONDER CONFIG
  // =====================================================
  const [autoResponderForm] = Form.useForm();
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  const [previewData, setPreviewData] = useState({
    enabled: true,
    subject: "[Xác nhận] Giáo Xứ Đồng Quan đã nhận được thông điệp của ông/bà",
    template: `Kính gửi {Name},\n\nCảm ơn ông/bà đã gửi thông điệp đến Ban Hành Giáo Giáo Xứ Đồng Quan về chủ đề "{Subject}".\n\nHệ thống đã ghi nhận thông tin vào ngày {Date}. Chúng tôi sẽ xem xét và phản hồi đến quý vị trong thời gian sớm nhất.\n\nNguyện xin Chúa ban nhiều bình an và ơn lành cho quý vị và gia đình!\n\nTrân trọng,\nBan Hành Giáo Giáo Xứ Đồng Quan`,
  });

  // =====================================================
  // LOAD CONTACTS & CONFIG
  // =====================================================
  const loadContacts = useCallback(
    async (page = 1, limit = 10) => {
      try {
        setLoading(true);

        const result = await getContacts({
          page,
          limit,
          search,
          status,
        });

        if (result?.success) {
          const list = result.data || [];

          setContacts(list);

          setPagination({
            current: result.pagination?.page || page,
            pageSize: result.pagination?.limit || limit,
            total: result.pagination?.total || 0,
          });

          const unreads = list.filter((item) => item.status === "new").length;

          setUnreadCount(unreads);
        }
      } catch (error) {
        console.error(error);

        message.error(
          error.response?.data?.message || "Không thể tải danh sách liên hệ",
        );
      } finally {
        setLoading(false);
      }
    },
    [search, status],
  );

  useEffect(() => {
    const loadAutoResponderConfig = async () => {
      try {
        setLoadingConfig(true);
        const res = await getAutoResponderConfig();
        if (res?.success && res.data) {
          const configData = {
            enabled: res.data.is_enabled,
            subject: res.data.subject,
            template: res.data.template,
          };
          autoResponderForm.setFieldsValue(configData);
          setPreviewData(configData);
        }
      } catch (error) {
        console.error(error);
        message.error(
          error.response?.data?.message ||
            "Không thể lấy cấu hình tự động trả lời",
        );
      } finally {
        setLoadingConfig(false);
      }
    };

    if (activeTab === "auto-responder") {
      loadAutoResponderConfig();
    }
  }, [activeTab, autoResponderForm]);
  useEffect(() => {
    loadContacts(1, pagination.pageSize);
  }, [loadContacts, pagination.pageSize]);

  // =====================================================
  // ACTIONS - CONTACTS
  // =====================================================
  const handleView = async (id) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);

      const result = await getContactById(id);

      if (result?.success) {
        setSelectedContact(result.data);

        setContacts((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              if (item.status === "new") {
                setUnreadCount((c) => Math.max(0, c - 1));
              }
              return { ...item, status: result.data.status };
            }
            return item;
          }),
        );
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Không thể lấy thông tin liên hệ",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateContactStatus(id, newStatus);
      message.success("Cập nhật trạng thái thành công");

      setContacts((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            if (item.status === "new" && newStatus !== "new") {
              setUnreadCount((c) => Math.max(0, c - 1));
            }
            return { ...item, status: newStatus };
          }
          return item;
        }),
      );

      if (selectedContact?.id === id) {
        setSelectedContact((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      message.success("Đã xóa liên hệ thành công");

      const targetItem = contacts.find((item) => item.id === id);
      if (targetItem?.status === "new") {
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      setContacts((prev) => prev.filter((item) => item.id !== id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(prev.total - 1, 0),
      }));

      if (selectedContact?.id === id) {
        setDetailOpen(false);
        setSelectedContact(null);
      }
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Không thể xóa liên hệ");
    }
  };

  const handleOpenReplyModal = (contact) => {
    setSelectedContact(contact);
    replyForm.setFieldsValue({
      to: contact.email,
      subject: `Re: ${contact.subject || "Thư liên hệ từ Giáo Xứ Đồng Quan"}`,
      message: "",
    });
    setReplyOpen(true);
  };

  const handleSelectTemplate = (templateKey) => {
    const selectedTpl = EMAIL_TEMPLATES.find((tpl) => tpl.key === templateKey);
    if (selectedTpl) {
      replyForm.setFieldsValue({
        subject: selectedTpl.subject,
        message: selectedTpl.content(selectedContact?.name),
      });
      message.info("Đã áp dụng mẫu trả lời nhanh!");
    }
  };

  const handleSendReply = async (values) => {
    try {
      setSendingEmail(true);
      await replyContactApi({
        contactId: selectedContact.id,
        to: values.to,
        subject: values.subject,
        message: values.message,
      });

      message.success("Đã gửi email phản hồi thành công!");
      setReplyOpen(false);
      replyForm.resetFields();

      handleStatusChange(selectedContact.id, "replied");
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message || "Gửi email phản hồi thất bại",
      );
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSearch = () => {
    loadContacts(1, pagination.pageSize);
  };

  // =====================================================
  // ACTIONS - AUTO RESPONDER
  // =====================================================
  const handleInsertPlaceholder = (placeholder) => {
    const currentText = autoResponderForm.getFieldValue("template") || "";
    const updatedText = currentText + `${placeholder}`;
    autoResponderForm.setFieldsValue({ template: updatedText });
    setPreviewData((prev) => ({ ...prev, template: updatedText }));
  };

  const handleSaveAutoResponder = async (values) => {
    try {
      setSavingConfig(true);
      const res = await updateAutoResponderConfig({
        enabled: values.enabled,
        subject: values.subject,
        template: values.template,
      });

      if (res?.success) {
        message.success(
          res.message || "Cấu hình tự động trả lời đã được lưu thành công!",
        );
      }
    } catch (error) {
      console.error(error);
      message.error(
        error.response?.data?.message ||
          "Không thể lưu cấu hình tự động trả lời.",
      );
    } finally {
      setSavingConfig(false);
    }
  };

  const renderCompiledPreview = () => {
    const raw = previewData.template || "";
    return raw
      .replace(/{Name}/g, "Giuse Nguyễn Văn A")
      .replace(/{Subject}/g, "Xin Giờ Thánh Lễ & Bố Thí Ý Lễ")
      .replace(
        /{Date}/g,
        new Date().toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      )
      .replace(/{Church_Name}/g, "Giáo Xứ Đồng Quan");
  };

  // =====================================================
  // RENDER COLUMNS & BADGES
  // =====================================================
  const renderStatus = (val) => {
    const config = {
      new: {
        label: "Mới",
        color: accentGold,
        bg: "#FFFDF0",
        border: "#F3E5AB",
      },
      read: {
        label: "Đã đọc",
        color: primaryNavy,
        bg: "#F0F4F8",
        border: "#D0DCEB",
      },
      replied: {
        label: "Đã trả lời",
        color: "#16A34A",
        bg: "#F0FDF4",
        border: "#BBF7D0",
      },
      archived: {
        label: "Lưu trữ",
        color: "#64748B",
        bg: "#F8FAFC",
        border: "#E2E8F0",
      },
    };

    const target = config[val] || {
      label: val,
      color: "#64748B",
      bg: "#F8FAFC",
      border: "#E2E8F0",
    };

    return (
      <Tag
        style={{
          color: target.color,
          backgroundColor: target.bg,
          borderColor: target.border,
          borderRadius: 12,
          padding: "2px 12px",
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {target.label}
      </Tag>
    );
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => (
        <Text style={{ fontWeight: 600, color: "#64748B" }}>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </Text>
      ),
    },
    {
      title: "Người gửi & Email",
      key: "name",
      width: 240,
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            style={{
              backgroundColor:
                record.status === "new"
                  ? accentGold
                  : record.status === "replied"
                    ? "#16A34A"
                    : primaryNavy,
              color: record.status === "new" ? primaryNavy : "#FFFFFF",
              fontWeight: 700,
            }}
          >
            {record.name ? record.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong style={{ color: textDark, fontSize: 14 }}>
              {record.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Chủ đề & Nội dung thư",
      dataIndex: "subject",
      key: "subject",
      render: (value, record) => (
        <div style={{ maxWidth: 360 }}>
          <Text
            strong={record.status === "new"}
            ellipsis
            style={{
              display: "block",
              color: record.status === "new" ? primaryNavy : textDark,
              fontSize: 14,
            }}
          >
            {value || "Không có chủ đề"}
          </Text>
          {record.message && (
            <Text
              ellipsis
              style={{ fontSize: 12, color: "#64748B", display: "block" }}
            >
              {record.message}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: renderStatus,
    },
    {
      title: "Ngày Tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      render: (val) => (
        <Text style={{ fontSize: 13, color: "#64748B" }}>
          {new Date(val).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 130,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={<EyeIcon style={{ color: primaryNavy, fontSize: 16 }} />}
              onClick={() => handleView(record.id)}
              style={{ background: "#F0F4F8" }}
            />
          </Tooltip>

          <Tooltip title="Trả lời Mail trực tiếp">
            <Button
              type="text"
              shape="circle"
              icon={<SendIcon style={{ color: "#16A34A", fontSize: 15 }} />}
              onClick={() => handleOpenReplyModal(record)}
              style={{ background: "#F0FDF4" }}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa liên hệ này?"
            description="Dữ liệu bị xóa sẽ không thể khôi phục."
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                shape="circle"
                danger
                icon={<DeleteIcon style={{ fontSize: 16 }} />}
                style={{ background: "#FEF2F2" }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "32px 40px",
        backgroundColor: softBg,
        minHeight: "100vh",
        fontFamily:
          "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* BADGE CATEGORY */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 16px",
            borderRadius: 20,
            border: `1.5px solid ${accentGold}`,
            backgroundColor: "#FFFDF7",
            color: primaryNavy,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
          }}
        >
          <CompassOutlined style={{ color: primaryNavy, fontSize: 14 }} />
          HỆ THỐNG PHỤNG VỤ LỜI CHÚA
        </div>
      </div>

      {/* HEADER BAR & UNREAD BADGE */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Space align="center" size={12}>
            <Title
              level={1}
              style={{
                margin: 0,
                color: primaryNavy,
                fontFamily:
                  "'Playfair Display', 'Merriweather', 'Georgia', serif",
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              QUẢN LÝ HÒM THƯ LIÊN HỆ
            </Title>

            <Badge
              count={unreadCount}
              overflowCount={99}
              style={{
                backgroundColor: "#EF4444",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                fontWeight: 700,
              }}
            />
          </Space>
          <Text
            style={{
              color: "#64748B",
              fontSize: 15,
              marginTop: 4,
              display: "block",
            }}
          >
            Tiếp nhận thư từ độc giả và cấu hình trả lời tự động cho Giáo Xứ
            Đồng Quan
          </Text>
        </div>

        {/* TOP ACTION BUTTONS */}
        {activeTab === "inbox" && (
          <Space size="middle">
            <Button
              icon={<ReloadIcon />}
              onClick={() =>
                loadContacts(pagination.current, pagination.pageSize)
              }
              style={{
                borderRadius: 12,
                height: 42,
                padding: "0 20px",
                fontWeight: 600,
                borderColor: "#D0D5DD",
                color: textDark,
                backgroundColor: "#FFFFFF",
              }}
            >
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<FormOutlined />}
              onClick={() => {
                replyForm.resetFields();
                setReplyOpen(true);
              }}
              style={{
                borderRadius: 12,
                height: 42,
                padding: "0 22px",
                fontWeight: 600,
                backgroundColor: primaryNavy,
                borderColor: primaryNavy,
                boxShadow: "0 4px 12px rgba(27, 54, 93, 0.15)",
              }}
            >
              Soạn Email Mới
            </Button>
          </Space>
        )}
      </div>

      {/* NAVIGATION TABS */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 20 }}
        items={[
          {
            key: "inbox",
            label: (
              <span style={{ fontSize: 15, fontWeight: 600, padding: "0 8px" }}>
                <MailIcon style={{ marginRight: 8 }} />
                Danh Sách Thư
                {unreadCount > 0 && (
                  <Tag
                    color="error"
                    style={{ marginLeft: 8, borderRadius: 10 }}
                  >
                    {unreadCount}
                  </Tag>
                )}
              </span>
            ),
          },
          {
            key: "auto-responder",
            label: (
              <span style={{ fontSize: 15, fontWeight: 600, padding: "0 8px" }}>
                <RobotOutlined style={{ marginRight: 8 }} />
                Cài Đặt Tự Động Trả Lời (Auto-Responder)
              </span>
            ),
          },
        ]}
      />

      {/* TAB 1: DANH SÁCH THƯ LIÊN HỆ */}
      {activeTab === "inbox" && (
        <>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
              background: "#FFFFFF",
              marginBottom: 20,
              border: "1px solid #E2E8F0",
            }}
            bodyStyle={{ padding: "16px 20px" }}
          >
            <Row gutter={[16, 12]} align="middle">
              <Col xs={24} md={10} lg={8}>
                <Input
                  allowClear
                  placeholder="Tìm tiêu đề / người gửi / nội dung..."
                  prefix={
                    <SearchIcon style={{ color: "#94A3B8", marginRight: 6 }} />
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{
                    borderRadius: 14,
                    height: 44,
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2E8F0",
                  }}
                />
              </Col>

              <Col xs={24} md={7} lg={6}>
                <Select
                  value={status}
                  allowClear
                  placeholder="Lọc theo Trạng Thái"
                  style={{ width: "100%", height: 44 }}
                  onChange={(value) => setStatus(value || "")}
                  options={[
                    { label: "Tất cả trạng thái", value: "" },
                    { label: "Mới", value: "new" },
                    { label: "Đã đọc", value: "read" },
                    { label: "Đã trả lời", value: "replied" },
                    { label: "Lưu trữ", value: "archived" },
                  ]}
                />
              </Col>

              <Col xs={24} md={7} lg={4}>
                <Button
                  type="primary"
                  icon={<SearchIcon />}
                  onClick={handleSearch}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: primaryNavy,
                    borderColor: primaryNavy,
                    fontWeight: 600,
                  }}
                >
                  Lọc Tìm Kiếm
                </Button>
              </Col>
            </Row>
          </Card>

          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              boxShadow: "0 4px 20px rgba(27, 54, 93, 0.04)",
              background: "#FFFFFF",
              border: "1px solid #F1EAD8",
            }}
            bodyStyle={{ padding: 16 }}
          >
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={contacts}
              scroll={{ x: 900 }}
              style={{ borderRadius: 16, overflow: "hidden" }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng số ${total} liên hệ`,
                onChange: (page, pageSize) => loadContacts(page, pageSize),
              }}
            />
          </Card>
        </>
      )}

      {/* TAB 2: CẤU HÌNH TỰ ĐỘNG TRẢ LỜI */}
      {activeTab === "auto-responder" && (
        <Spin spinning={loadingConfig}>
          <Row gutter={[24, 24]}>
            {/* CỘT CẤU HÌNH FORM */}
            <Col xs={24} lg={13}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 20,
                  boxShadow: "0 4px 20px rgba(27, 54, 93, 0.04)",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                }}
                title={
                  <Space>
                    <SettingOutlined
                      style={{ color: primaryNavy, fontSize: 18 }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        color: primaryNavy,
                        fontSize: 16,
                      }}
                    >
                      Thủ Tục Phản Hồi Tự Động
                    </span>
                  </Space>
                }
              >
                <Form
                  form={autoResponderForm}
                  layout="vertical"
                  onFinish={handleSaveAutoResponder}
                  onValuesChange={(_, allValues) => {
                    setPreviewData({
                      enabled: allValues.enabled,
                      subject: allValues.subject || "",
                      template: allValues.template || "",
                    });
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 20px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: 14,
                      border: "1px solid #E2E8F0",
                      marginBottom: 24,
                    }}
                  >
                    <div>
                      <Text
                        strong
                        style={{
                          display: "block",
                          color: textDark,
                          fontSize: 15,
                        }}
                      >
                        Bật Phản Hồi Tự Động Ngay Khi Nhận Thư
                      </Text>
                      <Text style={{ fontSize: 12, color: "#64748B" }}>
                        Tự động gửi email xác nhận ngay lập tức khi người dân
                        gửi form trên web.
                      </Text>
                    </div>
                    <Form.Item name="enabled" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name="subject"
                    label={<Text strong>Tiêu Đề Email Tự Động Send Out</Text>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tiêu đề email",
                      },
                    ]}
                  >
                    <Input
                      style={{ borderRadius: 10, height: 42 }}
                      placeholder="Nhập tiêu đề..."
                    />
                  </Form.Item>

                  <div style={{ marginBottom: 12 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 13,
                        color: primaryNavy,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      <InfoCircleOutlined style={{ marginRight: 6 }} /> Chèn Thẻ
                      Động (Biến):
                    </Text>
                    <Space wrap size={[8, 8]}>
                      <Button
                        size="small"
                        onClick={() => handleInsertPlaceholder("{Name}")}
                        style={{
                          borderRadius: 8,
                          fontSize: 12,
                          backgroundColor: "#F0F4F8",
                        }}
                      >
                        + Tên Người Gửi {"{Name}"}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleInsertPlaceholder("{Subject}")}
                        style={{
                          borderRadius: 8,
                          fontSize: 12,
                          backgroundColor: "#F0F4F8",
                        }}
                      >
                        + Chủ Đề {"{Subject}"}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleInsertPlaceholder("{Date}")}
                        style={{
                          borderRadius: 8,
                          fontSize: 12,
                          backgroundColor: "#F0F4F8",
                        }}
                      >
                        + Ngày Gửi {"{Date}"}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleInsertPlaceholder("{Church_Name}")}
                        style={{
                          borderRadius: 8,
                          fontSize: 12,
                          backgroundColor: "#F0F4F8",
                        }}
                      >
                        + Tên Giáo Xứ {"{Church_Name}"}
                      </Button>
                    </Space>
                  </div>

                  <Form.Item
                    name="template"
                    label={
                      <Text strong>Nội Dung Mẫu Email Trả Lời Tự Động</Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nội dung mẫu email",
                      },
                    ]}
                  >
                    <TextArea
                      rows={8}
                      style={{ borderRadius: 12, padding: 12 }}
                      placeholder="Nhập nội dung mẫu..."
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    htmlType="submit"
                    loading={savingConfig}
                    style={{
                      borderRadius: 12,
                      height: 44,
                      padding: "0 28px",
                      fontWeight: 600,
                      backgroundColor: primaryNavy,
                      borderColor: primaryNavy,
                    }}
                  >
                    Lưu Cấu Hình
                  </Button>
                </Form>
              </Card>
            </Col>

            {/* CỘT LIVE PREVIEW */}
            <Col xs={24} lg={11}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 20,
                  boxShadow: "0 4px 20px rgba(27, 54, 93, 0.04)",
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                }}
                title={
                  <Space>
                    <RobotOutlined
                      style={{ color: accentGold, fontSize: 18 }}
                    />
                    <span style={{ fontWeight: 700, color: primaryNavy }}>
                      XEM TRƯỚC (LIVE PREVIEW)
                    </span>
                  </Space>
                }
              >
                <div
                  style={{
                    background: "#FAF9F5",
                    borderRadius: 14,
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: primaryNavy,
                      padding: "16px 20px",
                      color: "#FFFFFF",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 22,
                        color: accentGold,
                        fontWeight: "bold",
                      }}
                    >
                      ┼
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#FFFFFF",
                        fontSize: 16,
                        letterSpacing: "1px",
                      }}
                    >
                      GIÁO XỨ ĐỒNG QUAN
                    </Text>
                    <br />
                    <Text
                      style={{
                        color: "#CBD5E1",
                        fontSize: 11,
                        fontStyle: "italic",
                      }}
                    >
                      Hệ Thống Phản Hồi Tự Động
                    </Text>
                  </div>

                  <div style={{ height: 4, backgroundColor: accentGold }}></div>

                  <div style={{ padding: 20 }}>
                    <div style={{ marginBottom: 12 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block" }}
                      >
                        Tiêu đề email:
                      </Text>
                      <Text strong style={{ color: textDark, fontSize: 14 }}>
                        {previewData.subject || "(Chưa có tiêu đề)"}
                      </Text>
                    </div>

                    <Divider style={{ margin: "12px 0" }} />

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: "block", mb: 6 }}
                      >
                        Nội dung gửi cho độc giả:
                      </Text>
                      <div
                        style={{
                          background: "#FFFFFF",
                          padding: 16,
                          borderRadius: 8,
                          border: "1px solid #E2E8F0",
                          whiteSpace: "pre-line",
                          fontSize: 13,
                          lineHeight: "1.6",
                          color: textDark,
                        }}
                      >
                        {renderCompiledPreview()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Spin>
      )}

      {/* MODAL 1: XEM CHI TIẾT THƯ */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={650}
        style={{ borderRadius: 20 }}
      >
        <Spin spinning={detailLoading}>
          {selectedContact && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <Space align="center" size={12}>
                  <Avatar
                    size={48}
                    style={{
                      backgroundColor: primaryNavy,
                      fontWeight: 700,
                    }}
                  >
                    {selectedContact.name?.charAt(0)?.toUpperCase() || "U"}
                  </Avatar>
                  <div>
                    <Title level={4} style={{ margin: 0, color: primaryNavy }}>
                      {selectedContact.name}
                    </Title>
                    <Text type="secondary">{selectedContact.email}</Text>
                  </div>
                </Space>
              </div>

              <Card
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              >
                <Paragraph style={{ margin: 0 }}>
                  <Text strong>Chủ đề: </Text>
                  {selectedContact.subject || "Không có chủ đề"}
                </Paragraph>
                <Divider style={{ margin: "12px 0" }} />
                <Text strong>Nội dung lời nhắn:</Text>
                <div
                  style={{
                    marginTop: 8,
                    whiteSpace: "pre-line",
                    fontSize: 14,
                    color: textDark,
                  }}
                >
                  {selectedContact.message}
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <Text type="secondary">Trạng thái hiện tại:</Text>
                  {renderStatus(selectedContact.status)}
                </Space>

                <Space>
                  <Button
                    icon={<SendIcon />}
                    type="primary"
                    style={{
                      backgroundColor: "#16A34A",
                      borderColor: "#16A34A",
                      borderRadius: 10,
                    }}
                    onClick={() => {
                      setDetailOpen(false);
                      handleOpenReplyModal(selectedContact);
                    }}
                  >
                    Trả Lời Ngay
                  </Button>

                  <Select
                    value={selectedContact.status}
                    onChange={(val) =>
                      handleStatusChange(selectedContact.id, val)
                    }
                    style={{ width: 140 }}
                    options={[
                      { label: "Đánh dấu Mới", value: "new" },
                      { label: "Đã đọc", value: "read" },
                      { label: "Đã trả lời", value: "replied" },
                      { label: "Lưu trữ", value: "archived" },
                    ]}
                  />
                </Space>
              </div>
            </div>
          )}
        </Spin>
      </Modal>

      {/* MODAL 2: SOẠN VÀ GỬI EMAIL PHẢN HỒI */}
      <Modal
        open={replyOpen}
        onCancel={() => setReplyOpen(false)}
        title={
          <Space>
            <SendOutlined style={{ color: primaryNavy }} />
            <span style={{ fontWeight: 700, color: primaryNavy }}>
              Gửi Email Phản Hồi Trực Tiếp
            </span>
          </Space>
        }
        footer={null}
        width={680}
      >
        <Form
          form={replyForm}
          layout="vertical"
          onFinish={handleSendReply}
          style={{ marginTop: 16 }}
        >
          {/* CHỌN MẪU PHẢN HỒI NHANH */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13, display: "block", mb: 6 }}>
              Mẫu Phản Hồi Nhanh:
            </Text>
            <Space wrap size={[8, 8]}>
              {EMAIL_TEMPLATES.map((tpl) => (
                <Button
                  key={tpl.key}
                  size="small"
                  onClick={() => handleSelectTemplate(tpl.key)}
                  style={{
                    borderRadius: 8,
                    fontSize: 12,
                    backgroundColor: "#F0F4F8",
                  }}
                >
                  {tpl.label}
                </Button>
              ))}
            </Space>
          </div>

          <Form.Item
            name="to"
            label={<Text strong>Email Người Nhận</Text>}
            rules={[{ required: true, message: "Vui lòng nhập email" }]}
          >
            <Input style={{ borderRadius: 10, height: 40 }} />
          </Form.Item>

          <Form.Item
            name="subject"
            label={<Text strong>Tiêu Đề Email Trả Lời</Text>}
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input style={{ borderRadius: 10, height: 40 }} />
          </Form.Item>

          <Form.Item
            name="message"
            label={<Text strong>Nội Dung Phản Hồi</Text>}
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea rows={7} style={{ borderRadius: 12, padding: 12 }} />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              onClick={() => setReplyOpen(false)}
              style={{ borderRadius: 10, height: 40 }}
            >
              Hủy Bỏ
            </Button>

            <Button
              type="primary"
              icon={<SendIcon />}
              htmlType="submit"
              loading={sendingEmail}
              style={{
                borderRadius: 10,
                height: 40,
                backgroundColor: primaryNavy,
                borderColor: primaryNavy,
              }}
            >
              Phát Thư Ngay
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactPage;
