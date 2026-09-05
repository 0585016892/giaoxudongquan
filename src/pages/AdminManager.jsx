import React, { useEffect, useState, useCallback } from "react";

import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Upload,
  Switch,
  Space,
  Avatar,
  Popconfirm,
  message,
  Modal,
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Tooltip,
  DatePicker,
  ConfigProvider,
  Statistic,
  Descriptions,
  Divider,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  IdcardOutlined,
  HomeOutlined,
  BookOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  SearchOutlined,
  ClearOutlined,
  CompassOutlined,
  ReloadOutlined,
  CrownOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdmin,
  resetAdminPassword,
} from "../api/adminApi";

import { useUser } from "../context/UserContext";
import { useChurch } from "../hooks/useChurch";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ======================================================
// EDITORIAL SACRED PALETTE
// ======================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

export default function AdminManager() {
  const { user } = useUser();
  const { fetchChurches } = useChurch();

  // ======================================================
  // PERMISSION
  // ======================================================

  const allowRoles = ["admin", "priest"];

  // ======================================================
  // DATA
  // ======================================================

  const [admins, setAdmins] = useState([]);
  const [dataChurch, setDataChurch] = useState([]);

  const [loading, setLoading] = useState(false);
  const [churchLoading, setChurchLoading] = useState(false);

  // ======================================================
  // DRAWER CREATE / EDIT
  // ======================================================

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [fileList, setFileList] = useState([]);
  const [currentRole, setCurrentRole] = useState("admin");

  // ======================================================
  // DRAWER VIEW
  // ======================================================

  const [viewOpen, setViewOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState(null);

  // ======================================================
  // FORMS
  // ======================================================

  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  // ======================================================
  // FILTER
  // ======================================================

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ======================================================
  // LOAD CHURCHES
  // ======================================================

  const loadChurches = useCallback(async () => {
    try {
      setChurchLoading(true);

      const res = await fetchChurches();

      setDataChurch(res?.data || res || []);
    } catch (error) {
      console.error("Lỗi tải giáo xứ:", error);

      message.error("Không thể tải danh sách giáo xứ!");
    } finally {
      setChurchLoading(false);
    }
  }, [fetchChurches]);

  // ======================================================
  // LOAD ADMINS
  // ======================================================

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getAdmins();

      setAdmins(res?.data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách thành viên:", error);

      message.error("Lỗi tải danh sách thành viên!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChurches();
  }, [loadChurches]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalStaff = admins.length;

  const totalPriests = admins.filter((item) => item.role === "priest").length;

  const activeStaff = admins.filter(
    (item) => Number(item.is_active) === 1,
  ).length;

  // const totalMembers = admins.filter(
  //   (item) => item.account_type === "member",
  // ).length;

  // const totalVip = admins.filter((item) => item.account_type === "vip").length;

  // ======================================================
  // AUTO USERNAME FROM EMAIL
  // ======================================================

  const handleEmailChange = (e) => {
    if (editing) return;

    const email = e.target.value;

    if (!email.includes("@")) return;

    const username = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    form.setFieldsValue({
      username,
    });
  };

  // ======================================================
  // OPEN CREATE / EDIT DRAWER
  // ======================================================

  const openDrawer = (record = null) => {
    setEditing(record);
    setOpen(true);

    if (record) {
      const role = record.role || "admin";

      setCurrentRole(role);

      form.setFieldsValue({
        ...record,
        account_type: record.account_type || "member",
        birthday: record.birthday ? dayjs(record.birthday) : null,
        ordination_date: record.ordination_date
          ? dayjs(record.ordination_date)
          : null,
      });

      if (record.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: `${process.env.REACT_APP_API_URL}${record.avatar}`,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setCurrentRole("admin");

      form.resetFields();

      form.setFieldsValue({
        role: "admin",
        account_type: "member",
      });

      setFileList([]);
    }
  };

  // ======================================================
  // CLOSE CREATE / EDIT DRAWER
  // ======================================================

  const closeDrawer = () => {
    setOpen(false);

    setEditing(null);

    setCurrentRole("admin");

    setFileList([]);

    form.resetFields();
  };

  // ======================================================
  // VIEW PROFILE
  // ======================================================

  const openViewDrawer = (record) => {
    setViewRecord(record);
    setViewOpen(true);
  };

  const closeViewDrawer = () => {
    setViewOpen(false);
    setViewRecord(null);
  };

  // ======================================================
  // SUBMIT CREATE / EDIT
  // ======================================================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        // Avatar xử lý riêng
        if (key === "avatar") return;

        const value = values[key];

        if (value === undefined || value === null) {
          return;
        }

        // DatePicker
        if (key === "birthday" || key === "ordination_date") {
          formData.append(key, value ? value.format("YYYY-MM-DD") : "");

          return;
        }

        formData.append(key, value);
      });

      // ==================================================
      // ACCOUNT TYPE
      // LẤY ĐÚNG GIÁ TRỊ USER CHỌN
      // member / vip
      // ==================================================

      const accountType = values.account_type || "member";

      formData.set("account_type", accountType);

      // ==================================================
      // AVATAR
      // ==================================================

      if (fileList && fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      setLoading(true);

      if (editing) {
        await updateAdmin(editing.id, formData);

        message.success(
          `Cập nhật tài khoản ${
            accountType === "vip" ? "VIP" : "Member"
          } thành công!`,
        );
      } else {
        await createAdmin(formData);

        message.success(
          `Tạo tài khoản ${
            accountType === "vip" ? "VIP" : "Member"
          } thành công!`,
        );
      }

      closeDrawer();

      await fetchAdmins();
    } catch (error) {
      console.error("Submit admin error:", error);

      if (error?.errorFields) {
        return;
      }

      message.error(error?.response?.data?.message || "Không thể lưu dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESET PASSWORD
  // ======================================================

  const openResetPassword = (record) => {
    setResetUser(record);
    setResetModalOpen(true);

    resetForm.resetFields();
  };

  const closeResetPassword = () => {
    setResetModalOpen(false);
    setResetUser(null);

    resetForm.resetFields();
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();

      setLoading(true);

      await resetAdminPassword(resetUser.id, values.newPassword);

      message.success(`Đã cấp lại mật khẩu mới cho ${resetUser.full_name}`);

      closeResetPassword();
    } catch (error) {
      console.error("Reset password error:", error);

      if (error?.errorFields) {
        return;
      }

      message.error(error?.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // TOGGLE ACCOUNT
  // ======================================================

  const handleToggle = async (record) => {
    try {
      setLoading(true);

      await toggleAdmin(record.id);

      message.success("Đã cập nhật trạng thái tài khoản!");

      await fetchAdmins();
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái!",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (record) => {
    try {
      setLoading(true);

      await deleteAdmin(record.id);

      message.success("Đã xóa tài khoản!");

      await fetchAdmins();
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Không thể xóa tài khoản!",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // DATE VALIDATION
  // ======================================================

  const disabledFutureDates = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const disabledOrdinationDates = (current) => {
    if (!current) return false;

    const isFuture = current > dayjs().endOf("day");

    const birthdayValue = form.getFieldValue("birthday");

    const isBeforeBirthday = birthdayValue
      ? current.isBefore(dayjs(birthdayValue), "day")
      : false;

    return isFuture || isBeforeBirthday;
  };

  // ======================================================
  // ROLE LABEL
  // ======================================================

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "QUẢN TRỊ";

      case "priest":
        return "LINH MỤC";

      case "liturgy_manager":
        return "QUẢN LÝ PHỤNG VỤ";

      case "media_manager":
        return "QUẢN LÝ TRUYỀN THÔNG";

      case "catechist":
        return "QUẢN TRỊ VIÊN GIÁO LÝ";
      case "teacher":
        return "GIÁO LÝ VIÊN";

      default:
        return role || "THÀNH VIÊN";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "blue";

      case "priest":
        return "red";

      case "liturgy_manager":
        return "gold";

      case "media_manager":
        return "green";

      case "catechist":
        return "purple";

      default:
        return "default";
    }
  };

  // ======================================================
  // ACCOUNT TYPE
  // ======================================================

  const getAccountTypeLabel = (type) => {
    if (type === "vip") {
      return "VIP";
    }

    return "MEMBER";
  };

  // ======================================================
  // TABLE COLUMNS
  // ======================================================

  const columns = [
    {
      title: "Thành viên mục vụ",
      key: "user",
      render: (_, record) => (
        <Space size="middle">
          <Avatar
            size={46}
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
                  : `linear-gradient(135deg, ${primaryNavy} 0%, #0f2342 100%)`,
              border: `1px solid ${accentGold}`,
              boxShadow: "0 2px 8px rgba(27, 54, 93, 0.12)",
            }}
          />

          <div>
            <div
              style={{
                fontWeight: 700,
                color: primaryNavy,
                fontSize: 15,
              }}
            >
              {record.saint_name ? (
                <span>
                  <Text
                    type="secondary"
                    style={{
                      marginRight: 4,
                      fontWeight: 600,
                      fontSize: 13,
                      color: accentGold,
                    }}
                  >
                    {record.saint_name}
                  </Text>

                  {record.full_name}
                </span>
              ) : (
                record.full_name
              )}
            </div>

            <Text
              type="secondary"
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "#64748b",
              }}
            >
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Chức danh",
      dataIndex: "position",
      render: (position) => (
        <span
          style={{
            fontWeight: 600,
            color: textDark,
            fontSize: 13,
          }}
        >
          {position || <Text type="secondary">—</Text>}
        </span>
      ),
    },

    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={getRoleColor(role)}
          style={{
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          {getRoleLabel(role)}
        </Tag>
      ),
    },

    {
      title: "Loại tài khoản",
      dataIndex: "account_type",
      width: 140,
      align: "center",
      render: (type) => (
        <Tag
          icon={type === "vip" ? <CrownOutlined /> : <UserOutlined />}
          color={type === "vip" ? "gold" : "blue"}
          style={{
            fontWeight: 700,
            borderRadius: 8,
          }}
        >
          {getAccountTypeLabel(type)}
        </Tag>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "is_active",
      width: 150,
      align: "center",
      render: (val, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {allowRoles.includes(user?.role) && (
            <Switch
              checked={Number(val) === 1}
              size="small"
              loading={loading}
              onChange={() => handleToggle(record)}
            />
          )}

          <Tag
            color={Number(val) === 1 ? "green" : "default"}
            style={{
              fontWeight: 600,
              borderRadius: 8,
              fontSize: 10,
              margin: 0,
            }}
          >
            {Number(val) === 1 ? "HOẠT ĐỘNG" : "ĐANG KHÓA"}
          </Tag>
        </div>
      ),
    },

    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hồ sơ">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined
                  style={{
                    color: primaryNavy,
                    fontSize: 16,
                  }}
                />
              }
              onClick={() => openViewDrawer(record)}
            />
          </Tooltip>

          {allowRoles.includes(user?.role) && (
            <Tooltip title="Đổi mật khẩu">
              <Button
                type="text"
                shape="circle"
                icon={
                  <KeyOutlined
                    style={{
                      color: accentGold,
                      fontSize: 16,
                    }}
                  />
                }
                onClick={() => openResetPassword(record)}
              />
            </Tooltip>
          )}

          {allowRoles.includes(user?.role) && (
            <Tooltip title="Sửa hồ sơ">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      color: primaryNavy,
                      fontSize: 16,
                    }}
                  />
                }
                onClick={() => openDrawer(record)}
              />
            </Tooltip>
          )}

          {allowRoles.includes(user?.role) && (
            <Popconfirm
              title="Xóa nhân sự này?"
              description="Tài khoản sẽ bị gỡ vĩnh viễn khỏi hệ thống."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Xóa nhân sự">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={
                    <DeleteOutlined
                      style={{
                        fontSize: 16,
                      }}
                    />
                  }
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ======================================================
  // FILTER DATA
  // ======================================================

  const filteredAdmins = admins.filter((item) => {
    const keyword = searchText.trim().toLowerCase();

    const matchName =
      !keyword ||
      item.full_name?.toLowerCase().includes(keyword) ||
      item.username?.toLowerCase().includes(keyword) ||
      item.email?.toLowerCase().includes(keyword);

    const matchRole = !roleFilter || item.role === roleFilter;

    const matchStatus =
      statusFilter === ""
        ? true
        : Number(item.is_active) === Number(statusFilter);

    return matchName && matchRole && matchStatus;
  });

  // ======================================================
  // RENDER
  // ======================================================

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
      <div className="admin-editorial-layout">
        <div className="admin-editorial-container">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="admin-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined />
                HỆ THỐNG ĐIỀU HÀNH MỤC VỤ
              </span>

              <Title level={2} className="admin-main-title">
                BAN ĐIỀU HÀNH & HỘI ĐỒNG MỤC VỤ
              </Title>

              <Paragraph className="admin-sub-title">
                Quản lý phân quyền tài khoản hệ thống nội bộ Giáo xứ Đồng Quan.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchAdmins}
                loading={loading}
                className="refresh-btn"
                style={{
                  marginRight: 10,
                }}
              >
                Làm mới
              </Button>

              {allowRoles.includes(user?.role) && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openDrawer()}
                  className="add-admin-btn"
                >
                  Thêm Nhân Sự Mới
                </Button>
              )}
            </div>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <Row
            gutter={[16, 16]}
            style={{
              marginBottom: 24,
            }}
          >
            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tổng Số Nhân Sự"
                  value={totalStaff}
                  prefix={<TeamOutlined className="stat-icon navy" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Linh Mục"
                  value={totalPriests}
                  prefix={
                    <SafetyCertificateOutlined className="stat-icon gold" />
                  }
                  valueStyle={{
                    fontWeight: 700,
                    color: accentGold,
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={8}>
              <Card bordered={false} className="stat-card">
                <Statistic
                  title="Tài Khoản Hoạt Động"
                  value={activeStaff}
                  prefix={<CheckCircleOutlined className="stat-icon green" />}
                  valueStyle={{
                    fontWeight: 700,
                    color: "#2e7d32",
                    fontFamily: "'Playfair Display', serif",
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* ==================================================
              FILTER
          ================================================== */}

          <Card bordered={false} className="filter-card">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} lg={10}>
                <Input
                  allowClear
                  placeholder="Tìm theo tên, email hoặc username..."
                  prefix={
                    <SearchOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={24} md={12} lg={5}>
                <Select
                  allowClear
                  placeholder="Vai trò"
                  style={{
                    width: "100%",
                  }}
                  value={roleFilter || undefined}
                  onChange={(value) => setRoleFilter(value || "")}
                  className="custom-filter-select"
                  options={[
                    {
                      value: "admin",
                      label: "Quản trị viên",
                    },
                    {
                      value: "priest",
                      label: "Linh mục",
                    },
                    {
                      value: "liturgy_manager",
                      label: "Quản lý phụng vụ",
                    },
                    {
                      value: "media_manager",
                      label: "Quản lý truyền thông",
                    },
                    {
                      value: "catechist",
                      label: "Giáo lý viên",
                    },
                  ]}
                />
              </Col>

              <Col xs={24} md={12} lg={5}>
                <Select
                  allowClear
                  placeholder="Trạng thái"
                  style={{
                    width: "100%",
                  }}
                  value={statusFilter !== "" ? statusFilter : undefined}
                  onChange={(value) => setStatusFilter(value ?? "")}
                  className="custom-filter-select"
                  options={[
                    {
                      value: 1,
                      label: "Đang hoạt động",
                    },
                    {
                      value: 0,
                      label: "Đang khóa",
                    },
                  ]}
                />
              </Col>

              <Col xs={24} lg={4}>
                <Button
                  block
                  icon={<ClearOutlined />}
                  onClick={() => {
                    setSearchText("");
                    setRoleFilter("");
                    setStatusFilter("");
                  }}
                  className="clear-filter-btn"
                >
                  Đặt lại
                </Button>
              </Col>
            </Row>
          </Card>

          {/* ==================================================
              TABLE
          ================================================== */}

          <Card bordered={false} className="main-table-card">
            <Table
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={filteredAdmins}
              pagination={{
                pageSize: 8,
                showTotal: (total) => `Tổng số: ${total} nhân sự`,
                style: {
                  marginTop: 20,
                },
              }}
              scroll={{
                x: 1000,
              }}
              className="custom-admin-table"
            />
          </Card>
        </div>

        {/* ==================================================
            VIEW DRAWER
        ================================================== */}

        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>Hồ Sơ Trích Ngang Nhân Sự</span>
            </div>
          }
          width={640}
          onClose={closeViewDrawer}
          open={viewOpen}
          className="editorial-drawer"
        >
          {viewRecord && (
            <div>
              {/* PROFILE HEADER */}

              <div className="profile-header-card">
                <Avatar
                  size={80}
                  src={
                    viewRecord.avatar
                      ? `${process.env.REACT_APP_API_URL}${viewRecord.avatar}`
                      : null
                  }
                  icon={<UserOutlined />}
                  style={{
                    background:
                      viewRecord.role === "priest" ? "#8b0000" : primaryNavy,
                    border: "2px solid " + accentGold,
                    marginBottom: 12,
                  }}
                />

                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    color: primaryNavy,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  {viewRecord.saint_name
                    ? `${viewRecord.saint_name} ${viewRecord.full_name}`
                    : viewRecord.full_name}
                </Title>

                <Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  Chức danh: <b>{viewRecord.position || "Thành viên"}</b>
                </Text>

                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Tag
                    color={getRoleColor(viewRecord.role)}
                    style={{
                      fontWeight: 600,
                      borderRadius: 6,
                    }}
                  >
                    {getRoleLabel(viewRecord.role)}
                  </Tag>

                  <Tag
                    icon={
                      viewRecord.account_type === "vip" ? (
                        <CrownOutlined />
                      ) : (
                        <UserOutlined />
                      )
                    }
                    color={viewRecord.account_type === "vip" ? "gold" : "blue"}
                    style={{
                      fontWeight: 600,
                      borderRadius: 6,
                    }}
                  >
                    {getAccountTypeLabel(viewRecord.account_type)}
                  </Tag>

                  <Tag
                    color={
                      Number(viewRecord.is_active) === 1 ? "green" : "default"
                    }
                    style={{
                      borderRadius: 6,
                    }}
                  >
                    {Number(viewRecord.is_active) === 1
                      ? "Đang hoạt động"
                      : "Đang khóa"}
                  </Tag>
                </div>
              </div>

              {/* ACCOUNT INFO */}

              <Card
                title={
                  <span className="section-card-title">
                    1. Thông tin tài khoản & Hệ thống
                  </span>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
                style={{
                  marginBottom: 16,
                }}
              >
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="custom-modal-desc"
                >
                  <Descriptions.Item label="Username">
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: primaryNavy,
                      }}
                    >
                      {viewRecord.username}
                    </span>
                  </Descriptions.Item>

                  <Descriptions.Item label="Email">
                    {viewRecord.email || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Số điện thoại">
                    {viewRecord.phone || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại tài khoản">
                    <Tag
                      icon={
                        viewRecord.account_type === "vip" ? (
                          <CrownOutlined />
                        ) : (
                          <UserOutlined />
                        )
                      }
                      color={
                        viewRecord.account_type === "vip" ? "gold" : "blue"
                      }
                    >
                      {getAccountTypeLabel(viewRecord.account_type)}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Giáo xứ">
                    {viewRecord.church_name ||
                      dataChurch.find(
                        (church) =>
                          Number(church.id) === Number(viewRecord.church_id),
                      )?.name ||
                      "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* PERSONAL INFO */}

              <Card
                title={
                  <span className="section-card-title">
                    2. Lý lịch & Nhân thân
                  </span>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
                style={{
                  marginBottom: 16,
                }}
              >
                <Descriptions
                  column={1}
                  bordered
                  size="small"
                  className="custom-modal-desc"
                >
                  <Descriptions.Item label="Ngày sinh">
                    {viewRecord.birthday
                      ? dayjs(viewRecord.birthday).format("DD/MM/YYYY")
                      : "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Quê quán">
                    {viewRecord.hometown || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa chỉ cư trú">
                    {viewRecord.address || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* PRIEST INFO */}

              {viewRecord.role === "priest" && (
                <Card
                  title={
                    <span className="section-card-title">
                      3. Thông tin Chức thánh Mục vụ
                    </span>
                  }
                  size="small"
                  bordered={false}
                  className="modal-prayer-card"
                >
                  <Descriptions
                    column={1}
                    bordered
                    size="small"
                    className="custom-modal-desc"
                  >
                    <Descriptions.Item label="Ngày thụ phong">
                      <span
                        style={{
                          fontWeight: 700,
                          color: primaryNavy,
                        }}
                      >
                        {viewRecord.ordination_date
                          ? dayjs(viewRecord.ordination_date).format(
                              "DD [Tháng] MM, YYYY",
                            )
                          : "—"}
                      </span>
                    </Descriptions.Item>

                    <Descriptions.Item label="Khẩu hiệu mục vụ">
                      <span
                        style={{
                          fontStyle: "italic",
                          fontWeight: 700,
                          color: primaryNavy,
                        }}
                      >
                        "{viewRecord.motto || "Đang cập nhật..."}"
                      </span>
                    </Descriptions.Item>
                  </Descriptions>

                  <Divider
                    style={{
                      margin: "12px 0",
                    }}
                  />

                  <div
                    style={{
                      padding: "0 8px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        color: primaryNavy,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Tiểu sử chặng đường phục vụ:
                    </Text>

                    <Paragraph
                      style={{
                        color: textDark,
                        margin: 0,
                        whiteSpace: "pre-line",
                        fontSize: 13,
                      }}
                    >
                      {viewRecord.bio || "Chưa có dữ liệu tiểu sử."}
                    </Paragraph>
                  </div>
                </Card>
              )}
            </div>
          )}
        </Drawer>

        {/* ==================================================
            CREATE / EDIT DRAWER
        ================================================== */}

        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>
                {editing ? "Cập Nhật Hồ Sơ Nhân Sự" : "Khởi Tạo Nhân Sự Mới"}
              </span>
            </div>
          }
          width={560}
          onClose={closeDrawer}
          open={open}
          destroyOnClose={false}
          extra={
            <Space>
              <Button
                onClick={closeDrawer}
                style={{
                  borderRadius: 8,
                }}
              >
                Hủy
              </Button>

              <Button
                onClick={handleSubmit}
                type="primary"
                loading={loading}
                style={{
                  backgroundColor: primaryNavy,
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Lưu dữ liệu
              </Button>
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            style={{
              paddingTop: 8,
            }}
          >
            {/* ACCOUNT */}

            <Card
              title={
                <Text strong className="form-field-label">
                  1. Quyền hạn & Tài khoản
                </Text>
              }
              size="small"
              bordered={false}
              className="modal-prayer-card"
              style={{
                marginBottom: 16,
              }}
            >
              {/* AVATAR */}

              <Row
                gutter={16}
                align="middle"
                style={{
                  marginBottom: 16,
                }}
              >
                <Col span={6}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Ảnh đại diện
                      </Text>
                    }
                  >
                    <Upload
                      listType="picture-circle"
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setFileList(fileList)}
                      maxCount={1}
                    >
                      {fileList.length < 1 && (
                        <div>
                          <PlusOutlined />

                          <div
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                            }}
                          >
                            Tải lên
                          </div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={18}>
                  <Paragraph
                    type="secondary"
                    style={{
                      fontSize: 12,
                      margin: 0,
                    }}
                  >
                    Tải lên ảnh chân dung rõ nét. Định dạng cho phép PNG, JPG.
                  </Paragraph>
                </Col>
              </Row>

              {/* EMAIL */}

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Địa chỉ Email *
                  </Text>
                }
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Vui lòng điền đúng Email",
                  },
                ]}
              >
                <Input
                  prefix={
                    <MailOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  placeholder="name@example.com"
                  onChange={handleEmailChange}
                  className="custom-form-input"
                />
              </Form.Item>

              {/* USERNAME + ROLE */}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Tên tài khoản (Username)
                      </Text>
                    }
                    name="username"
                  >
                    <Input
                      disabled
                      prefix={
                        <UserOutlined
                          style={{
                            color: "#94a3b8",
                          }}
                        />
                      }
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Vai trò chức vụ
                      </Text>
                    }
                    name="role"
                    initialValue="admin"
                  >
                    <Select
                      onChange={(value) => setCurrentRole(value)}
                      className="custom-form-input"
                    >
                      <Option value="admin">Quản trị viên</Option>

                      <Option value="priest">Linh mục Giáo xứ</Option>

                      <Option value="liturgy_manager">Quản lý phụng vụ</Option>

                      <Option value="media_manager">
                        Quản lý truyền thông
                      </Option>

                      <Option value="catechist">Quản trị viên Giáo lý</Option>
                      <Option value="teacher">Giáo lý viên</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {/* POSITION */}

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Chức danh đảm nhiệm cụ thể
                  </Text>
                }
                name="position"
              >
                <Input
                  placeholder="Ví dụ: Cha chánh xứ, Phó ban hành giáo, Thư ký..."
                  className="custom-form-input"
                />
              </Form.Item>

              {/* CHURCH */}

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Giáo xứ quản lý *
                  </Text>
                }
                name="church_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn giáo xứ",
                  },
                ]}
              >
                <Select
                  showSearch
                  loading={churchLoading}
                  placeholder="Chọn giáo xứ..."
                  optionFilterProp="label"
                  className="custom-form-input"
                  options={dataChurch.map((church) => ({
                    value: church.id,
                    label: church.name,
                  }))}
                />
              </Form.Item>

              {/* ACCOUNT TYPE - READ ONLY */}

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Loại tài khoản
                  </Text>
                }
                name="account_type"
                initialValue="member"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn loại tài khoản",
                  },
                ]}
              >
                <Select className="custom-form-input">
                  <Option value="member">Member</Option>
                  <Option value="vip">VIP</Option>
                </Select>
              </Form.Item>

              {/* PASSWORD */}

              {!editing && (
                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Mật khẩu ban đầu *
                    </Text>
                  }
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Mật khẩu bắt buộc",
                    },
                    {
                      min: 6,
                      message: "Mật khẩu tối thiểu 6 ký tự",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={
                      <LockOutlined
                        style={{
                          color: "#94a3b8",
                        }}
                      />
                    }
                    placeholder="Nhập mật khẩu..."
                    className="custom-form-input"
                  />
                </Form.Item>
              )}
            </Card>

            {/* PERSONAL */}

            <Card
              title={
                <Text strong className="form-field-label">
                  2. Thông tin lý lịch cá nhân
                </Text>
              }
              size="small"
              bordered={false}
              className="modal-prayer-card"
              style={{
                marginBottom: 16,
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Tên Thánh
                      </Text>
                    }
                    name="saint_name"
                  >
                    <Input
                      placeholder="Giuse..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={16}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Họ và tên *
                      </Text>
                    }
                    name="full_name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ tên",
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <IdcardOutlined
                          style={{
                            color: "#94a3b8",
                          }}
                        />
                      }
                      placeholder="Nguyễn Văn A..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Điện thoại di động
                      </Text>
                    }
                    name="phone"
                  >
                    <Input
                      prefix={
                        <PhoneOutlined
                          style={{
                            color: "#94a3b8",
                          }}
                        />
                      }
                      placeholder="09xxxx..."
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={
                      <Text strong className="form-field-label">
                        Ngày sinh
                      </Text>
                    }
                    name="birthday"
                  >
                    <DatePicker
                      style={{
                        width: "100%",
                      }}
                      format="DD/MM/YYYY"
                      placeholder="Chọn ngày..."
                      disabledDate={disabledFutureDates}
                      className="custom-form-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Quê quán nguyên quán
                  </Text>
                }
                name="hometown"
              >
                <Input
                  prefix={
                    <HomeOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  placeholder="Địa chỉ quê hương..."
                  className="custom-form-input"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text strong className="form-field-label">
                    Địa chỉ thường trú hiện nay
                  </Text>
                }
                name="address"
              >
                <Input
                  prefix={
                    <HomeOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  placeholder="Nơi ở hiện nay..."
                  className="custom-form-input"
                />
              </Form.Item>
            </Card>

            {/* PRIEST */}

            {currentRole === "priest" && (
              <Card
                title={
                  <Text strong className="form-field-label">
                    3. Hồ sơ chức thánh Mục vụ
                  </Text>
                }
                size="small"
                bordered={false}
                className="modal-prayer-card"
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Ngày thụ phong Linh mục
                        </Text>
                      }
                      name="ordination_date"
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                        }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày..."
                        disabledDate={disabledOrdinationDates}
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Text strong className="form-field-label">
                          Khẩu hiệu Mục vụ
                        </Text>
                      }
                      name="motto"
                    >
                      <Input
                        prefix={
                          <BookOutlined
                            style={{
                              color: "#94a3b8",
                            }}
                          />
                        }
                        placeholder="Châm ngôn cuộc đời..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Text strong className="form-field-label">
                      Tóm tắt tiểu sử phục vụ
                    </Text>
                  }
                  name="bio"
                >
                  <TextArea
                    rows={4}
                    placeholder="Các nơi đã từng mục vụ, công tác..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Card>
            )}
          </Form>
        </Drawer>

        {/* ==================================================
            RESET PASSWORD MODAL
        ================================================== */}

        <Modal
          open={resetModalOpen}
          onCancel={closeResetPassword}
          onOk={handleResetPassword}
          confirmLoading={loading}
          title={
            <div className="modal-custom-title">
              <KeyOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>Đặt Lại Mật Khẩu Truy Cập</span>
            </div>
          }
          centered
          okButtonProps={{
            style: {
              backgroundColor: primaryNavy,
              borderRadius: 8,
              height: 38,
              fontWeight: 600,
            },
          }}
          cancelButtonProps={{
            style: {
              borderRadius: 8,
              height: 38,
            },
          }}
        >
          <Form
            form={resetForm}
            layout="vertical"
            style={{
              paddingTop: 12,
            }}
          >
            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Mật khẩu mới *
                </Text>
              }
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Bắt buộc nhập",
                },
                {
                  min: 6,
                  message: "Tối thiểu 6 ký tự",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{
                      color: "#94a3b8",
                    }}
                  />
                }
                className="custom-form-input"
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong className="form-field-label">
                  Xác nhận lại mật khẩu *
                </Text>
              }
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Bắt buộc nhập",
                },

                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Mật khẩu gõ lại chưa khớp"),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{
                      color: "#94a3b8",
                    }}
                  />
                }
                className="custom-form-input"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* ==================================================
            STYLES
        ================================================== */}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

              .admin-editorial-layout {
                background: ${softBg};
                min-height: 100vh;
                padding: 40px 20px 80px 20px;
                font-family: 'Be Vietnam Pro', sans-serif;
                color: ${textDark};
              }

              .admin-editorial-container {
                max-width: 1100px;
                margin: 0 auto;
              }

              .admin-header-section {
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

              .admin-main-title {
                font-family: 'Playfair Display', Georgia, serif !important;
                color: ${primaryNavy} !important;
                margin: 0 !important;
                font-weight: 700 !important;
                font-size: clamp(24px, 3.5vw, 32px) !important;
              }

              .admin-sub-title {
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

              .add-admin-btn {
                background: ${primaryNavy} !important;
                border-color: ${primaryNavy} !important;
                height: 42px !important;
                border-radius: 10px !important;
                font-weight: 700 !important;
                box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
              }

              .stat-card {
                border-radius: 16px !important;
                background: #ffffff !important;
                border: 1px solid rgba(27, 54, 93, 0.08) !important;
                box-shadow: 0 4px 16px rgba(27, 54, 93, 0.03) !important;
              }

              .stat-icon {
                margin-right: 8px;
              }

              .stat-icon.navy {
                color: ${primaryNavy};
              }

              .stat-icon.gold {
                color: ${accentGold};
              }

              .stat-icon.green {
                color: #2e7d32;
              }

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

              .custom-admin-table .ant-table-tbody > tr:hover > td {
                background: rgba(27, 54, 93, 0.025) !important;
              }

              .profile-header-card {
                background: #ffffff;
                padding: 24px;
                border-radius: 16px;
                border: 1px solid rgba(212, 175, 55, 0.3);
                text-align: center;
                margin-bottom: 20px;
                box-shadow: 0 4px 16px rgba(27, 54, 93, 0.04);
              }

              .drawer-title-box {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 700;
                color: ${primaryNavy};
              }

              .section-card-title {
                color: ${primaryNavy};
                font-weight: 700;
                font-size: 14px;
              }

              .modal-custom-title {
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

              .form-field-label {
                font-size: 13px;
                color: ${primaryNavy};
              }

              .custom-form-input {
                border-radius: 8px !important;
              }

              .custom-modal-desc {
                border-radius: 12px;
                overflow: hidden;
              }

              .account-type-fixed {
                min-height: 40px;
                display: flex;
                align-items: center;
                padding: 0 12px;
                background: #ffffff;
                border: 1px solid rgba(27, 54, 93, 0.12);
                border-radius: 8px;
              }

              @media (max-width: 768px) {
                .admin-editorial-layout {
                  padding: 24px 12px 60px;
                }

                .admin-header-section {
                  align-items: flex-start;
                  flex-direction: column;
                }

                .header-action-group {
                  width: 100%;
                  display: flex;
                }

                .header-action-group .refresh-btn {
                  flex: 1;
                }

                .header-action-group .add-admin-btn {
                  flex: 1;
                }
              }

              @media (max-width: 480px) {
                .admin-editorial-layout {
                  padding: 20px 8px 50px;
                }

                .header-action-group {
                  flex-direction: column;
                  gap: 8px;
                }

                .header-action-group .refresh-btn,
                .header-action-group .add-admin-btn {
                  width: 100%;
                  margin-right: 0 !important;
                }

                .profile-header-card {
                  padding: 18px;
                }
              }
            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
