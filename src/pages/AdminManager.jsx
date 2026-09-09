import React, { useEffect, useState, useCallback, useMemo } from "react";

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
  Descriptions,
  Divider,
  Tabs,
  Badge,
  Empty,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  KeyOutlined,
  MailOutlined,
  LockOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EyeOutlined,
  SearchOutlined,
  ClearOutlined,
  CrownOutlined,
  BankOutlined,
  AppstoreOutlined,
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

import PageHeroHeader from "../components/common/PageHeroHeader";
import StatCard from "../components/common/StatCard";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ======================================================
// EDITORIAL SACRED PALETTE
// ======================================================

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
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
  // ACTIVE CHURCH TAB
  // ======================================================

  const [activeChurchTab, setActiveChurchTab] = useState("all");

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
  // CHURCH MAP
  // ======================================================

  const churchMap = useMemo(() => {
    const map = {};

    dataChurch.forEach((church) => {
      map[church.id] = church;
    });

    return map;
  }, [dataChurch]);

  // ======================================================
  // ADMINS BY ACTIVE CHURCH
  // ======================================================

  const adminsByChurch = useMemo(() => {
    if (activeChurchTab === "all") {
      return admins;
    }

    return admins.filter(
      (item) => Number(item.church_id) === Number(activeChurchTab),
    );
  }, [admins, activeChurchTab]);

  // ======================================================
  // STATISTICS
  // ======================================================

  const totalStaff = adminsByChurch.length;

  const totalPriests = adminsByChurch.filter(
    (item) => item.role === "priest",
  ).length;

  const activeStaff = adminsByChurch.filter(
    (item) => Number(item.is_active) === 1,
  ).length;

  // ======================================================
  // CHURCH TAB COUNT
  // ======================================================
  const getChurchStaffCount = useCallback(
    (churchId) => {
      return admins.filter(
        (admin) => Number(admin.church_id) === Number(churchId),
      ).length;
    },
    [admins],
  );

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

        // Nếu đang ở tab giáo xứ thì tự chọn giáo xứ đó
        church_id:
          activeChurchTab !== "all" ? Number(activeChurchTab) : undefined,
      });

      setFileList([]);
    }
  };

  // ======================================================
  // CLOSE DRAWER
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
        if (key === "avatar") return;

        const value = values[key];

        if (value === undefined || value === null) {
          return;
        }

        if (key === "birthday" || key === "ordination_date") {
          formData.append(key, value ? value.format("YYYY-MM-DD") : "");

          return;
        }

        formData.append(key, value);
      });

      const accountType = values.account_type || "member";

      formData.set("account_type", accountType);

      // AVATAR

      if (fileList && fileList.length > 0 && fileList[0]?.originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      setLoading(true);

      if (editing) {
        await updateAdmin(editing.id, formData);

        message.success("Cập nhật tài khoản thành công!");
      } else {
        await createAdmin(formData);

        message.success("Tạo tài khoản mới thành công!");
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
  // ROLE
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

      case "admin_catechist":
        return "QUẢN TRỊ GIÁO LÝ";

      case "catechist":
        return "HUẤN LUYỆN VIÊN";

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

      case "admin_catechist":
        return "orange";

      case "catechist":
        return "purple";

      case "teacher":
        return "cyan";

      default:
        return "default";
    }
  };

  // ======================================================
  // ACCOUNT TYPE
  // ======================================================

  const getAccountTypeLabel = (type) => {
    return type === "vip" ? "VIP" : "MEMBER";
  };

  // ======================================================
  // FILTER DATA
  // ======================================================

  const filteredAdmins = useMemo(() => {
    return adminsByChurch.filter((item) => {
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
  }, [adminsByChurch, searchText, roleFilter, statusFilter]);

  // ======================================================
  // TABLE COLUMNS
  // ======================================================

  const columns = [
    {
      title: "Nhân sự",
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
                  ? "linear-gradient(135deg, #8b0000, #a81c1c)"
                  : `linear-gradient(135deg, ${primaryNavy}, #0f2342)`,

              border: `1px solid ${accentGold}`,
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
              {record.saint_name && (
                <span
                  style={{
                    color: accentGold,
                    marginRight: 4,
                    fontSize: 13,
                  }}
                >
                  {record.saint_name}
                </span>
              )}

              {record.full_name}
            </div>

            <Text
              type="secondary"
              style={{
                fontSize: 11,
                fontFamily: "monospace",
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
            fontSize: 13,
          }}
        >
          {position || "—"}
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

    // Chỉ hiện giáo xứ khi đang xem tất cả

    ...(activeChurchTab === "all"
      ? [
          {
            title: "Giáo xứ",
            key: "church",

            render: (_, record) => (
              <Tag
                icon={<BankOutlined />}
                color="geekblue"
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {record.church_name ||
                  churchMap[record.church_id]?.name ||
                  "Chưa xác định"}
              </Tag>
            ),
          },
        ]
      : []),

    {
      title: "Loại TK",
      dataIndex: "account_type",
      width: 120,
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
      width: 130,
      align: "center",

      render: (val, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            flexDirection: "column",
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
              fontSize: 10,
              margin: 0,
              borderRadius: 8,
              fontWeight: 600,
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
        <Space size={2}>
          <Tooltip title="Xem hồ sơ">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined
                  style={{
                    color: primaryNavy,
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
                    }}
                  />
                }
                onClick={() => openResetPassword(record)}
              />
            </Tooltip>
          )}

          {allowRoles.includes(user?.role) && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                shape="circle"
                icon={
                  <EditOutlined
                    style={{
                      color: primaryNavy,
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
              description="Tài khoản sẽ bị xóa khỏi hệ thống."
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
              }}
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ======================================================
  // TAB ITEMS
  // ======================================================

  const tabItems = useMemo(() => {
    const items = [
      {
        key: "all",

        label: (
          <div className="church-tab-label">
            <AppstoreOutlined />

            <span>Tất cả</span>

            <Badge
              count={admins.length}
              showZero
              overflowCount={999}
              className="church-tab-badge"
            />
          </div>
        ),
      },
    ];

    dataChurch.forEach((church) => {
      const count = getChurchStaffCount(church.id);

      items.push({
        key: String(church.id),

        label: (
          <div className="church-tab-label">
            <BankOutlined />

            <span>{church.name}</span>

            <Badge
              count={count}
              showZero
              overflowCount={999}
              className="church-tab-badge"
            />
          </div>
        ),
      });
    });

    return items;
  }, [dataChurch, admins, getChurchStaffCount]);
  // ======================================================
  // ACTIVE CHURCH NAME
  // ======================================================

  const activeChurchName =
    activeChurchTab === "all"
      ? "Toàn bộ hệ thống"
      : churchMap[activeChurchTab]?.name || "Giáo xứ";

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

          <PageHeroHeader
            badge="HỆ THỐNG ĐIỀU HÀNH MỤC VỤ"
            title="BAN ĐIỀU HÀNH & HỘI ĐỒNG MỤC VỤ"
            description="Quản lý nhân sự và tài khoản theo từng giáo xứ trong hệ thống."
            onRefresh={fetchAdmins}
            refreshLoading={loading}
            actionText="Thêm Nhân Sự Mới"
            onAction={() => openDrawer()}
            showAction={allowRoles.includes(user?.role)}
          />

          {/* ==================================================
              CHURCH TABS
          ================================================== */}

          <Card bordered={false} className="church-tabs-card">
            <div className="church-tabs-header">
              <div>
                <Text className="church-tabs-title">
                  <BankOutlined />
                  PHÂN LOẠI THEO GIÁO XỨ
                </Text>

                <Text className="church-tabs-desc">
                  Chọn giáo xứ để quản lý nhân sự riêng biệt.
                </Text>
              </div>

              <Tag
                color="gold"
                style={{
                  borderRadius: 20,
                  fontWeight: 700,
                  padding: "4px 10px",
                }}
              >
                {dataChurch.length} GIÁO XỨ
              </Tag>
            </div>

            <Tabs
              activeKey={activeChurchTab}
              onChange={setActiveChurchTab}
              items={tabItems}
              className="church-tabs"
              tabBarGutter={8}
            />
          </Card>
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
              <StatCard
                title="Tổng Số Nhân Sự"
                value={totalStaff}
                prefix={
                  <TeamOutlined
                    style={{
                      color: primaryNavy,
                    }}
                  />
                }
                valueColor={primaryNavy}
              />
            </Col>

            <Col xs={24} sm={8}>
              <StatCard
                title="Linh Mục"
                value={totalPriests}
                prefix={
                  <SafetyCertificateOutlined
                    style={{
                      color: accentGold,
                    }}
                  />
                }
                valueColor={accentGold}
              />
            </Col>

            <Col xs={24} sm={8}>
              <StatCard
                title="Tài Khoản Hoạt Động"
                value={activeStaff}
                prefix={
                  <CheckCircleOutlined
                    style={{
                      color: "#2e7d32",
                    }}
                  />
                }
                valueColor="#2e7d32"
              />
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
                      value: "admin_catechist",
                      label: "Quản trị viên giáo lý",
                    },
                    {
                      value: "catechist",
                      label: "Huấn luyện viên",
                    },
                    {
                      value: "teacher",
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
            <div className="table-card-header">
              <div>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: primaryNavy,
                  }}
                >
                  DANH SÁCH NHÂN SỰ
                </Title>

                <Text type="secondary">
                  {activeChurchName}
                  {" · "}
                  {filteredAdmins.length} nhân sự
                </Text>
              </div>

              {activeChurchTab !== "all" && (
                <Tag
                  color="blue"
                  icon={<BankOutlined />}
                  style={{
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  Đang lọc theo giáo xứ
                </Tag>
              )}
            </div>

            <Divider
              style={{
                margin: "12px 0 16px",
              }}
            />

            {filteredAdmins.length === 0 && !loading ? (
              <Empty
                description="Chưa có nhân sự phù hợp"
                style={{
                  padding: "40px 0",
                }}
              >
                {allowRoles.includes(user?.role) && (
                  <Button type="primary" onClick={() => openDrawer()}>
                    Thêm nhân sự
                  </Button>
                )}
              </Empty>
            ) : (
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
            )}
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
                  <Tag color={getRoleColor(viewRecord.role)}>
                    {getRoleLabel(viewRecord.role)}
                  </Tag>

                  <Tag
                    color={
                      Number(viewRecord.is_active) === 1 ? "green" : "default"
                    }
                  >
                    {Number(viewRecord.is_active) === 1
                      ? "Đang hoạt động"
                      : "Đang khóa"}
                  </Tag>
                </div>
              </div>

              <Card
                title="Thông tin tài khoản"
                size="small"
                className="modal-prayer-card"
                style={{
                  marginBottom: 16,
                }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Username">
                    @{viewRecord.username}
                  </Descriptions.Item>

                  <Descriptions.Item label="Email">
                    {viewRecord.email || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Điện thoại">
                    {viewRecord.phone || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Giáo xứ">
                    {viewRecord.church_name ||
                      churchMap[viewRecord.church_id]?.name ||
                      "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card
                title="Lý lịch cá nhân"
                size="small"
                className="modal-prayer-card"
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Ngày sinh">
                    {viewRecord.birthday
                      ? dayjs(viewRecord.birthday).format("DD/MM/YYYY")
                      : "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Quê quán">
                    {viewRecord.hometown || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa chỉ">
                    {viewRecord.address || "—"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
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
              <Button onClick={closeDrawer}>Hủy</Button>

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
            <Card
              title={<Text strong>1. Quyền hạn & Tài khoản</Text>}
              size="small"
              className="modal-prayer-card"
              style={{
                marginBottom: 16,
              }}
            >
              {/* AVATAR */}

              <Form.Item label="Ảnh đại diện">
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

              <Form.Item
                label="Địa chỉ Email *"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Vui lòng nhập đúng Email",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="name@example.com"
                  onChange={handleEmailChange}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Username" name="username">
                    <Input disabled prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Vai trò" name="role">
                    <Select onChange={(value) => setCurrentRole(value)}>
                      <Option value="admin">Quản trị viên</Option>

                      <Option value="priest">Linh mục</Option>

                      <Option value="liturgy_manager">Quản lý phụng vụ</Option>

                      <Option value="media_manager">
                        Quản lý truyền thông
                      </Option>

                      <Option value="admin_catechist">
                        Quản trị viên giáo lý
                      </Option>

                      <Option value="catechist">Huấn luyện viên</Option>

                      <Option value="teacher">Giáo lý viên</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Chức danh" name="position">
                <Input placeholder="Cha chánh xứ, thư ký..." />
              </Form.Item>

              <Form.Item
                label="Giáo xứ quản lý *"
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
                  options={dataChurch.map((church) => ({
                    value: church.id,
                    label: church.name,
                  }))}
                />
              </Form.Item>

              <Form.Item label="Loại tài khoản" name="account_type">
                <Select>
                  <Option value="member">Member</Option>

                  <Option value="vip">VIP</Option>
                </Select>
              </Form.Item>

              {!editing && (
                <Form.Item
                  label="Mật khẩu ban đầu *"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Mật khẩu bắt buộc",
                    },
                    {
                      min: 6,
                      message: "Tối thiểu 6 ký tự",
                    },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
              )}
            </Card>

            <Card
              title="2. Thông tin lý lịch cá nhân"
              size="small"
              className="modal-prayer-card"
              style={{
                marginBottom: 16,
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Tên Thánh" name="saint_name">
                    <Input placeholder="Giuse..." />
                  </Form.Item>
                </Col>

                <Col span={16}>
                  <Form.Item
                    label="Họ và tên *"
                    name="full_name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ tên",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Điện thoại" name="phone">
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item label="Ngày sinh" name="birthday">
                    <DatePicker
                      style={{
                        width: "100%",
                      }}
                      format="DD/MM/YYYY"
                      disabledDate={disabledFutureDates}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Quê quán" name="hometown">
                <Input />
              </Form.Item>

              <Form.Item label="Địa chỉ" name="address">
                <Input />
              </Form.Item>
            </Card>

            {currentRole === "priest" && (
              <Card
                title="3. Hồ sơ chức thánh Mục vụ"
                size="small"
                className="modal-prayer-card"
              >
                <Form.Item label="Ngày thụ phong" name="ordination_date">
                  <DatePicker
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledOrdinationDates}
                  />
                </Form.Item>

                <Form.Item label="Khẩu hiệu Mục vụ" name="motto">
                  <Input />
                </Form.Item>

                <Form.Item label="Tiểu sử phục vụ" name="bio">
                  <TextArea rows={4} />
                </Form.Item>
              </Card>
            )}
          </Form>
        </Drawer>

        {/* ==================================================
            RESET PASSWORD
        ================================================== */}

        <Modal
          open={resetModalOpen}
          onCancel={closeResetPassword}
          onOk={handleResetPassword}
          confirmLoading={loading}
          title="Đặt Lại Mật Khẩu Truy Cập"
          centered
        >
          <Form
            form={resetForm}
            layout="vertical"
            style={{
              paddingTop: 12,
            }}
          >
            <Form.Item
              label="Mật khẩu mới *"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Bắt buộc nhập mật khẩu",
                },
                {
                  min: 6,
                  message: "Tối thiểu 6 ký tự",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu *"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Bắt buộc xác nhận",
                },

                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("Mật khẩu chưa khớp"));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Form>
        </Modal>

        {/* ==================================================
            STYLE
        ================================================== */}

        <style
          dangerouslySetInnerHTML={{
            __html: `

              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

              .admin-editorial-layout {
                background: ${softBg};
                min-height: 100vh;
                padding: 40px 20px 80px;
                font-family: 'Be Vietnam Pro', sans-serif;
              }

              .admin-editorial-container {
                max-width: 1200px;
                margin: 0 auto;
              }

              /* ============================
                 CHURCH TABS
              ============================ */

              .church-tabs-card {
                border-radius: 18px !important;
                margin-bottom: 16px;
                border: 1px solid rgba(27,54,93,.08) !important;
                box-shadow: 0 6px 24px rgba(27,54,93,.04);
              }

              .church-tabs-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 16px;
              }

              .church-tabs-title {
                display: flex;
                align-items: center;
                gap: 8px;
                color: ${primaryNavy};
                font-size: 13px;
                font-weight: 800;
                letter-spacing: .4px;
              }

              .church-tabs-title svg {
                color: ${accentGold};
              }

              .church-tabs-desc {
                display: block;
                color: #64748b;
                font-size: 12px;
                margin-top: 5px;
              }

              .church-tabs .ant-tabs-nav {
                margin-bottom: 0 !important;
              }

              .church-tabs .ant-tabs-nav::before {
                border-bottom: none !important;
              }

              .church-tabs .ant-tabs-tab {
                background: #f8fafc;
                border-radius: 10px 10px 0 0;
                padding: 10px 14px !important;
                border: 1px solid rgba(27,54,93,.08);
              }

              .church-tabs .ant-tabs-tab-active {
                background: rgba(27,54,93,.05);
                border-color: rgba(212,175,55,.5);
              }

              .church-tab-label {
                display: flex;
                align-items: center;
                gap: 7px;
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
              }

              .church-tab-label svg {
                color: ${primaryNavy};
              }

              .church-tab-badge {
                margin-left: 3px;
              }

              /* ============================
                 ACTIVE CHURCH
              ============================ */

              .active-church-banner {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 18px;
                margin-bottom: 24px;

                background:
                  linear-gradient(
                    135deg,
                    rgba(27,54,93,.98),
                    #102744
                  );

                border-radius: 14px;

                box-shadow:
                  0 8px 22px rgba(27,54,93,.12);
              }

              .active-church-icon {
                width: 42px;
                height: 42px;

                border-radius: 10px;

                background:
                  rgba(212,175,55,.16);

                border:
                  1px solid rgba(212,175,55,.5);

                display: flex;
                align-items: center;
                justify-content: center;

                color: ${accentGold};
                font-size: 19px;
              }

              .active-church-label {
                display: block;
                color: rgba(255,255,255,.55);
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 1px;
              }

              .active-church-name {
                margin: 2px 0 0 !important;
                color: #fff !important;
                font-family:
                  'Playfair Display',
                  serif !important;
              }

              /* ============================
                 FILTER
              ============================ */

              .filter-card {
                border-radius: 16px !important;
                border:
                  1px solid rgba(27,54,93,.08) !important;
                margin-bottom: 20px;
              }

              .custom-filter-input {
                border-radius: 10px !important;
                height: 42px !important;
              }

              .custom-filter-select .ant-select-selector {
                border-radius: 10px !important;
                min-height: 42px !important;
                align-items: center;
              }

              .clear-filter-btn {
                height: 42px !important;
                border-radius: 10px !important;
              }

              /* ============================
                 TABLE
              ============================ */

              .main-table-card {
                border-radius: 20px !important;
                border:
                  1px solid rgba(212,175,55,.25) !important;
                box-shadow:
                  0 10px 30px rgba(27,54,93,.05);
              }

              .table-card-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex-wrap: wrap;
              }

              .custom-admin-table .ant-table-thead > tr > th {
                background: ${softBg} !important;
                color: ${primaryNavy} !important;
                font-weight: 700 !important;
              }

              .custom-admin-table .ant-table-tbody > tr:hover > td {
                background:
                  rgba(27,54,93,.025) !important;
              }

              /* ============================
                 PROFILE
              ============================ */

              .profile-header-card {
                background: #fff;
                padding: 24px;
                border-radius: 16px;
                border:
                  1px solid rgba(212,175,55,.3);
                text-align: center;
                margin-bottom: 20px;
              }

              .drawer-title-box {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 700;
                color: ${primaryNavy};
              }

              .modal-prayer-card {
                border-radius: 12px !important;
                border:
                  1px solid rgba(27,54,93,.08) !important;
              }

              /* ============================
                 MOBILE
              ============================ */

              @media (max-width: 768px) {

                .admin-editorial-layout {
                  padding: 24px 12px 60px;
                }

                .church-tabs-header {
                  flex-direction: column;
                }

                .church-tabs .ant-tabs-nav-wrap {
                  overflow-x: auto;
                }

                .church-tabs .ant-tabs-nav-list {
                  min-width: max-content;
                }

                .active-church-banner {
                  padding: 12px;
                }

              }

              @media (max-width: 480px) {

                .admin-editorial-layout {
                  padding: 16px 8px 50px;
                }

                .church-tab-label {
                  font-size: 12px;
                }

                .church-tabs .ant-tabs-tab {
                  padding: 8px 10px !important;
                }

                .table-card-header {
                  align-items: flex-start;
                  flex-direction: column;
                }

              }

            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
