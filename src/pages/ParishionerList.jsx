import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  message,
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
  ConfigProvider,
  Drawer,
  Descriptions,
  Radio,
  DatePicker,
  Spin,
  Empty,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  UserOutlined,
  SearchOutlined,
  CompassOutlined,
  ReloadOutlined,
  EyeOutlined,
  BookOutlined,
  HeartOutlined,
  TeamOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";

import {
  getParishioners,
  createParishioner,
  updateParishioner,
  deleteParishioner,
  getFamilyMembers,
  getAllHouseheads,
} from "../api/parishionerApi";

import { getChurches } from "../api/churchApi";
import { useUser } from "../context/UserContext";

const { Title, Text, Paragraph } = Typography;

/* =========================================================
   DESIGN SYSTEM
========================================================= */

const primaryNavy = "#1B365D";
const accentGold = "#D4AF37";
const textDark = "#1E293B";
const softBg = "#FAFAFA";

const ALLOW_ROLES = ["admin", "priest"];

/* =========================================================
   HELPER
========================================================= */

const isHouseHead = (value) => {
  return value === 1 || value === "1" || value === true;
};

const formatDate = (value) => {
  if (!value) return "---";

  const date = dayjs(value);

  if (!date.isValid()) return "---";

  return date.format("DD/MM/YYYY");
};

const getGenderText = (gender) => {
  if (gender === "male") return "Nam";
  if (gender === "female") return "Nữ";

  return "---";
};

const getMaritalStatusText = (status) => {
  switch (status) {
    case "single":
      return "Độc thân";

    case "married":
      return "Đã kết hôn";

    case "religious":
      return "Tu sĩ / Dâng hiến";

    case "widowed":
      return "Góa bụa";

    default:
      return "---";
  }
};

const getStatusTag = (status) => {
  switch (status) {
    case "active":
      return <Tag color="green">Đang sinh hoạt</Tag>;

    case "inactive":
      return <Tag color="orange">Tạm ngưng</Tag>;

    case "moved":
      return <Tag color="blue">Chuyển xứ</Tag>;

    case "deceased":
      return <Tag color="red">Đã qua đời</Tag>;

    default:
      return <Tag>---</Tag>;
  }
};

/* =========================================================
   FAMILY MEMBERS TABLE
========================================================= */

function FamilyMembersTable({ record, onViewDetail, onEdit, onDelete }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getFamilyMembers(record.id);

      setMembers(res?.data?.data || []);
    } catch (error) {
      console.error("Lỗi lấy thành viên hộ:", error);

      message.error("Không thể tải danh sách thành viên trong hộ");
    } finally {
      setLoading(false);
    }
  }, [record.id]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const columns = [
    {
      title: "Mã Nhân Khẩu",
      dataIndex: "code",
      width: 130,
      render: (code) => (
        <span
          style={{
            color: primaryNavy,
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          {code || "---"}
        </span>
      ),
    },

    {
      title: "Tên Thánh",
      dataIndex: "saint_name",
      width: 130,
      render: (value) => (
        <span
          style={{
            fontWeight: 600,
            color: primaryNavy,
          }}
        >
          {value || "---"}
        </span>
      ),
    },

    {
      title: "Họ và Tên",
      dataIndex: "full_name",
      render: (value) => (
        <span
          style={{
            fontWeight: 600,
            color: textDark,
          }}
        >
          {value || "---"}
        </span>
      ),
    },

    {
      title: "Quan hệ",
      dataIndex: "relationship_with_head",
      width: 150,
      render: (value) => (
        <Tag className="gold-category-tag">{value || "Thành viên"}</Tag>
      ),
    },

    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 90,
      align: "center",
      render: (gender) =>
        gender === "male" ? (
          <Tag color="blue">Nam</Tag>
        ) : gender === "female" ? (
          <Tag color="magenta">Nữ</Tag>
        ) : (
          <Tag>---</Tag>
        ),
    },

    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      width: 120,
      render: (date) => formatDate(date),
    },

    {
      title: "Nghề nghiệp",
      dataIndex: "occupation",
      render: (value) => value || "---",
    },

    {
      title: "Thao tác",
      width: 120,
      align: "center",

      render: (_, member) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              shape="circle"
              icon={
                <EyeOutlined
                  style={{
                    color: primaryNavy,
                    fontSize: 15,
                  }}
                />
              }
              onClick={() => onViewDetail(member)}
              className="action-btn-view"
            />
          </Tooltip>

          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              shape="circle"
              icon={
                <EditOutlined
                  style={{
                    color: primaryNavy,
                    fontSize: 15,
                  }}
                />
              }
              onClick={() => onEdit(member)}
              className="action-btn-edit"
            />
          </Tooltip>

          <Popconfirm
            title="Xóa thành viên khỏi hộ?"
            description="Dữ liệu giáo dân này sẽ bị xóa khỏi hệ thống."
            onConfirm={() => onDelete(member.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{
              danger: true,
            }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                shape="circle"
                icon={
                  <DeleteOutlined
                    style={{
                      fontSize: 15,
                    }}
                  />
                }
                className="action-btn-delete"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="sub-table-container">
      <div className="sub-table-header">
        <TeamOutlined
          style={{
            color: accentGold,
            marginRight: 6,
          }}
        />

        <span>DANH SÁCH THÀNH VIÊN THUỘC HỘ GIA ĐÌNH</span>
      </div>

      <Spin spinning={loading} tip="Đang tải thành viên...">
        {members.length > 0 ? (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={members}
            pagination={false}
            size="small"
            bordered={false}
            className="custom-sub-table"
            scroll={{ x: 850 }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Hộ gia đình chưa có thành viên"
          />
        )}
      </Spin>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ParishionerManagement() {
  const { user } = useUser();

  const canManage = ALLOW_ROLES.includes(user?.role);

  /* =======================================================
     DATA
  ======================================================= */

  const [parishioners, setParishioners] = useState([]);
  const [churches, setChurches] = useState([]);
  const [houseHeads, setHouseHeads] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  /* =======================================================
     FILTER
  ======================================================= */

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [churchFilter, setChurchFilter] = useState("all");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* =======================================================
     MODAL / DRAWER
  ======================================================= */

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [editing, setEditing] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);

  /* =======================================================
     FORM
  ======================================================= */

  const [form] = Form.useForm();

  const [isHeadWatch, setIsHeadWatch] = useState(1);

  /* =======================================================
     LOAD CHURCHES
  ======================================================= */

  const loadChurches = useCallback(async () => {
    try {
      const res = await getChurches();

      setChurches(res?.data || []);
    } catch (error) {
      console.error("Không tải được giáo xứ:", error);

      message.error("Không thể tải danh sách giáo xứ");
    }
  }, []);

  /* =======================================================
     LOAD HOUSE HEADS
  ======================================================= */

  const loadHouseHeadsOptions = useCallback(async () => {
    try {
      const res = await getAllHouseheads();

      setHouseHeads(res?.data?.data || []);
    } catch (error) {
      console.error("Không tải được danh sách chủ hộ:", error);

      message.error("Không thể tải danh sách chủ hộ");
    }
  }, []);

  /* =======================================================
     LOAD PARISHIONERS

     QUAN TRỌNG:
     Không lấy pagination/search/filter trực tiếp
     bên trong callback.

     Mọi giá trị đều truyền từ bên ngoài vào.
  ======================================================= */

  const loadData = useCallback(
    async ({ page, pageSize, search, status, churchId }) => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: pageSize,
        };

        if (search?.trim()) {
          params.keyword = search.trim();
        }

        if (status && status !== "all") {
          params.status = status;
        }

        if (churchId && churchId !== "all") {
          params.churches_id = churchId;
        }

        const res = await getParishioners(params);

        setParishioners(res?.data?.data || []);

        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize,
          total: Number(res?.data?.total || 0),
        }));
      } catch (error) {
        console.error("Lỗi tải giáo dân:", error);

        message.error(
          error?.response?.data?.message || "Không thể tải danh sách giáo dân",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /* =======================================================
     INITIAL LOAD

     Chỉ chạy một lần khi component mount.
  ======================================================= */

  useEffect(() => {
    loadChurches();

    loadData({
      page: 1,
      pageSize: 10,
      search: "",
      status: "all",
      churchId: "all",
    });
  }, [loadChurches, loadData]);

  /* =======================================================
     FILTER CHANGE

     Khi trạng thái hoặc giáo xứ thay đổi thì tự lọc.
  ======================================================= */

  useEffect(() => {
    loadData({
      page: 1,
      pageSize: pagination.pageSize,
      search: searchKeyword,
      status: statusFilter,
      churchId: churchFilter,
    });
  }, [
    statusFilter,
    churchFilter,
    pagination.pageSize,
    searchKeyword,
    loadData,
  ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = useCallback(() => {
    loadData({
      page: 1,
      pageSize: pagination.pageSize,
      search: searchKeyword,
      status: statusFilter,
      churchId: churchFilter,
    });
  }, [
    loadData,
    pagination.pageSize,
    searchKeyword,
    statusFilter,
    churchFilter,
  ]);

  /* =======================================================
     RESET FILTER
  ======================================================= */

  const handleResetSearch = useCallback(() => {
    setSearchKeyword("");
    setStatusFilter("all");
    setChurchFilter("all");

    loadData({
      page: 1,
      pageSize: pagination.pageSize,
      search: "",
      status: "all",
      churchId: "all",
    });
  }, [loadData, pagination.pageSize]);

  /* =======================================================
     TABLE CHANGE
  ======================================================= */

  const handleTableChange = useCallback(
    (newPagination) => {
      loadData({
        page: newPagination.current,
        pageSize: newPagination.pageSize,
        search: searchKeyword,
        status: statusFilter,
        churchId: churchFilter,
      });
    },
    [loadData, searchKeyword, statusFilter, churchFilter],
  );

  /* =======================================================
     OPEN CREATE
  ======================================================= */

  const handleOpenCreate = useCallback(async () => {
    setEditing(null);

    setIsHeadWatch(1);

    form.resetFields();

    form.setFieldsValue({
      gender: "male",
      status: "active",
      marital_status: "single",
      is_head: 1,
    });

    await loadHouseHeadsOptions();

    setFormOpen(true);
  }, [form, loadHouseHeadsOptions]);

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const handleEdit = useCallback(
    async (record) => {
      try {
        const headValue = isHouseHead(record?.is_head) ? 1 : 0;

        setEditing(record);
        setIsHeadWatch(headValue);

        await loadHouseHeadsOptions();

        form.setFieldsValue({
          ...record,

          is_head: headValue,

          date_of_birth: record.date_of_birth
            ? dayjs(record.date_of_birth)
            : null,

          baptism_date: record.baptism_date ? dayjs(record.baptism_date) : null,

          confirmation_date: record.confirmation_date
            ? dayjs(record.confirmation_date)
            : null,

          first_communion_date: record.first_communion_date
            ? dayjs(record.first_communion_date)
            : null,

          churches_id: record.churches_id
            ? Number(record.churches_id)
            : undefined,

          head_id: record.head_id ? Number(record.head_id) : undefined,
        });

        setFormOpen(true);
      } catch (error) {
        console.error(error);

        message.error("Không thể mở hồ sơ giáo dân");
      }
    },
    [form, loadHouseHeadsOptions],
  );

  /* =======================================================
     CLOSE FORM
  ======================================================= */

  const handleCloseForm = useCallback(() => {
    if (submitLoading) return;

    setFormOpen(false);

    setEditing(null);

    setIsHeadWatch(1);

    form.resetFields();
  }, [form, submitLoading]);

  /* =======================================================
     ROLE CHANGE
  ======================================================= */

  const handleRoleChange = useCallback(
    (event) => {
      const value = Number(event.target.value);

      setIsHeadWatch(value);

      if (value === 1) {
        form.setFieldsValue({
          head_id: undefined,
          relationship_with_head: undefined,
        });
      }
    },
    [form],
  );

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      setSubmitLoading(true);

      const currentPage = editing ? pagination.current : 1;
      const currentPageSize = pagination.pageSize;

      const payload = {
        ...values,

        is_head: Number(values.is_head),

        churches_id: values.churches_id ? Number(values.churches_id) : null,

        head_id:
          Number(values.is_head) === 0 && values.head_id
            ? Number(values.head_id)
            : null,

        date_of_birth: values.date_of_birth
          ? values.date_of_birth.format("YYYY-MM-DD")
          : null,

        baptism_date: values.baptism_date
          ? values.baptism_date.format("YYYY-MM-DD")
          : null,

        confirmation_date: values.confirmation_date
          ? values.confirmation_date.format("YYYY-MM-DD")
          : null,

        first_communion_date: values.first_communion_date
          ? values.first_communion_date.format("YYYY-MM-DD")
          : null,
      };

      if (editing) {
        await updateParishioner(editing.id, payload);

        message.success("Cập nhật hồ sơ giáo dân thành công");
      } else {
        await createParishioner(payload);

        message.success("Khai báo giáo dân mới thành công");
      }

      handleCloseForm();

      await loadData({
        page: currentPage,
        pageSize: currentPageSize,
        search: searchKeyword,
        status: statusFilter,
        churchId: churchFilter,
      });

      await loadHouseHeadsOptions();
    } catch (error) {
      console.error("Lỗi submit:", error);

      if (error?.errorFields) {
        message.warning("Vui lòng kiểm tra lại các trường bắt buộc");
      } else {
        message.error(
          error?.response?.data?.message || "Không thể lưu dữ liệu giáo dân",
        );
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [
    form,
    editing,
    pagination,
    handleCloseForm,
    loadData,
    searchKeyword,
    statusFilter,
    churchFilter,
    loadHouseHeadsOptions,
  ]);

  /* =======================================================
     VIEW DETAIL
  ======================================================= */

  const handleViewDetail = useCallback((record) => {
    setViewingRecord(record);
    setDetailOpen(true);
  }, []);

  /* =======================================================
     DELETE
  ======================================================= */
  const handleDelete = useCallback(
    async (id) => {
      try {
        setLoading(true);

        await deleteParishioner(id);

        message.success("Xóa dữ liệu giáo dân thành công");

        const currentPage = pagination.current;
        const pageSize = pagination.pageSize;

        const shouldGoPreviousPage =
          parishioners.length === 1 && currentPage > 1;

        const nextPage = shouldGoPreviousPage ? currentPage - 1 : currentPage;

        await loadData({
          page: nextPage,
          pageSize,
          search: searchKeyword,
          status: statusFilter,
          churchId: churchFilter,
        });

        await loadHouseHeadsOptions();
      } catch (error) {
        console.error("Lỗi xóa giáo dân:", error);

        message.error(
          error?.response?.data?.message || "Không thể thực hiện thao tác xóa",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      pagination,
      parishioners.length,
      searchKeyword,
      statusFilter,
      churchFilter,
      loadData,
      loadHouseHeadsOptions,
    ],
  );

  /* =======================================================
     GET CHURCH NAME
  ======================================================= */

  const getChurchName = useCallback(
    (churchId) => {
      if (!churchId) {
        return (
          <span
            style={{
              color: "#94a3b8",
            }}
          >
            Chưa phân xứ
          </span>
        );
      }

      const church = churches.find(
        (item) => Number(item.id) === Number(churchId),
      );

      return church?.name || "Chưa xác định";
    },
    [churches],
  );

  /* =======================================================
     ACTION COLUMN

     Không dùng useMemo nữa.
     Không còn warning dependency.
  ======================================================= */

  const actionColumn = {
    title: "Thao tác",
    width: 125,
    fixed: "right",
    align: "center",

    render: (_, record) => (
      <Space size="small">
        <Tooltip title="Xem chi tiết">
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
            onClick={() => handleViewDetail(record)}
            className="action-btn-view"
          />
        </Tooltip>

        {canManage && (
          <>
            <Tooltip title="Chỉnh sửa">
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
                onClick={() => handleEdit(record)}
                className="action-btn-edit"
              />
            </Tooltip>

            <Popconfirm
              title="Xác nhận xóa hồ sơ?"
              description="Dữ liệu sẽ bị xóa khỏi hệ thống."
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{
                danger: true,
              }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  danger
                  shape="circle"
                  icon={
                    <DeleteOutlined
                      style={{
                        fontSize: 16,
                      }}
                    />
                  }
                  className="action-btn-delete"
                />
              </Tooltip>
            </Popconfirm>
          </>
        )}
      </Space>
    ),
  };

  /* =======================================================
     TABLE COLUMNS

     Không dùng useMemo nữa.
  ======================================================= */

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",

      render: (_, __, index) => (
        <span
          style={{
            fontWeight: 600,
            color: "#94a3b8",
          }}
        >
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },

    {
      title: "Mã Hộ",
      dataIndex: "code",
      key: "code",
      width: 130,

      render: (code) => (
        <span
          style={{
            fontWeight: 700,
            color: primaryNavy,
            fontFamily: "monospace",
          }}
        >
          {code || "---"}
        </span>
      ),
    },

    {
      title: "Tên Thánh",
      dataIndex: "saint_name",
      key: "saint_name",
      width: 130,

      render: (name) => (
        <Text
          strong
          style={{
            color: primaryNavy,
            fontSize: 14,
          }}
        >
          {name || "Chưa cập nhật"}
        </Text>
      ),
    },

    {
      title: "Họ Tên Chủ Hộ",
      dataIndex: "full_name",
      key: "full_name",
      width: 190,

      render: (name) => (
        <Text
          strong
          style={{
            color: primaryNavy,
            fontSize: 15,
          }}
        >
          {name || "Chưa cập nhật"}
        </Text>
      ),
    },

    {
      title: "Giới tính",
      dataIndex: "gender",
      width: 100,
      align: "center",

      render: (value) =>
        value === "male" ? (
          <Tag color="blue">Nam</Tag>
        ) : value === "female" ? (
          <Tag color="magenta">Nữ</Tag>
        ) : (
          <Tag>---</Tag>
        ),
    },

    {
      title: "Số điện thoại",
      dataIndex: "phone",
      width: 140,

      render: (phone) =>
        phone ? (
          <span>{phone}</span>
        ) : (
          <span
            style={{
              color: "#94a3b8",
            }}
          >
            ---
          </span>
        ),
    },

    {
      title: "Giáo Xứ / Giáo Họ",
      dataIndex: "churches_id",
      width: 190,

      render: (id) => (
        <Tag className="gold-category-tag">{getChurchName(id)}</Tag>
      ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      align: "center",

      render: (status) => getStatusTag(status),
    },
  ];

  if (canManage) {
    columns.push(actionColumn);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: primaryNavy,
          borderRadius: 12,
          colorBgLayout: softBg,
          fontFamily:
            "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif",
        },
      }}
    >
      <div className="parishioner-editorial-layout">
        <div className="parishioner-editorial-container">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="parishioner-header-section">
            <div className="header-text-group">
              <span className="sacred-badge">
                <CompassOutlined />
                HỆ THỐNG SỔ SÁCH MỤC VỤ GIÁO DÂN
              </span>

              <Title level={2} className="parishioner-main-title">
                HỘ GIA ĐÌNH
              </Title>

              <Paragraph className="parishioner-sub-title">
                Quản lý thông tin hồ sơ giáo dân, phân cấp hộ gia đình và đời
                sống bí tích toàn xứ.
              </Paragraph>
            </div>

            <div className="header-action-group">
              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={() =>
                  loadData({
                    page: pagination.current,
                    pageSize: pagination.pageSize,
                    search: searchKeyword,
                    status: statusFilter,
                    churchId: churchFilter,
                  })
                }
                className="refresh-btn"
              >
                Làm mới
              </Button>

              {canManage && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleOpenCreate}
                  className="add-parishioner-btn"
                >
                  Thêm Giáo Dân Mới
                </Button>
              )}
            </div>
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <Card bordered={false} className="filter-card">
            <Row gutter={[16, 16]} align="bottom">
              <Col xs={24} md={8} lg={8}>
                <Text strong className="form-field-label">
                  Tìm kiếm từ khóa
                </Text>

                <Input
                  placeholder="Nhập họ tên, mã hộ, SĐT..."
                  prefix={
                    <SearchOutlined
                      style={{
                        color: "#94a3b8",
                      }}
                    />
                  }
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  onPressEnter={handleSearch}
                  allowClear
                  className="custom-filter-input"
                />
              </Col>

              <Col xs={12} md={5} lg={5}>
                <Text strong className="form-field-label">
                  Trạng thái sinh hoạt
                </Text>

                <Select
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || "all")}
                  style={{
                    width: "100%",
                  }}
                  className="custom-filter-select"
                >
                  <Select.Option value="all">Tất cả trạng thái</Select.Option>

                  <Select.Option value="active">Đang sinh hoạt</Select.Option>

                  <Select.Option value="inactive">Tạm ngưng</Select.Option>

                  <Select.Option value="moved">Chuyển xứ</Select.Option>

                  <Select.Option value="deceased">Đã qua đời</Select.Option>
                </Select>
              </Col>

              <Col xs={12} md={6} lg={6}>
                <Text strong className="form-field-label">
                  Thuộc Giáo Xứ / Giáo Họ
                </Text>

                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn Giáo xứ"
                  value={churchFilter === "all" ? undefined : churchFilter}
                  onChange={(value) => setChurchFilter(value || "all")}
                  style={{
                    width: "100%",
                  }}
                  optionFilterProp="children"
                  className="custom-filter-select"
                >
                  <Select.Option value="all">
                    Tất cả Giáo xứ / Giáo họ
                  </Select.Option>

                  {churches.map((church) => (
                    <Select.Option key={church.id} value={church.id}>
                      {church.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={5} lg={5}>
                <div className="filter-button-group">
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearch}
                    className="filter-search-button"
                  >
                    Lọc
                  </Button>

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetSearch}
                    className="filter-reset-button"
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* =================================================
              TABLE
          ================================================= */}

          <Card
            bordered={false}
            className="main-table-card"
            title={
              <div className="section-card-header">
                <HomeOutlined
                  style={{
                    color: accentGold,
                  }}
                />

                <span>Sổ Quản Lý Hộ Gia Đình Toàn Xứ</span>
              </div>
            }
          >
            <Spin spinning={loading} tip="Đang tải danh sách hồ sơ giáo dân...">
              <Table
                rowKey="id"
                columns={columns}
                dataSource={parishioners}
                expandable={{
                  expandedRowRender: (record) => (
                    <FamilyMembersTable
                      record={record}
                      onViewDetail={handleViewDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ),

                  rowExpandable: (record) => isHouseHead(record.is_head),
                }}
                pagination={{
                  current: pagination.current,

                  pageSize: pagination.pageSize,

                  total: pagination.total,

                  showSizeChanger: true,

                  pageSizeOptions: ["10", "20", "50", "100"],

                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} / ${total} giáo dân`,
                }}
                onChange={handleTableChange}
                scroll={{
                  x: 1200,
                }}
                className="custom-admin-table"
              />
            </Spin>
          </Card>
        </div>

        {/* =================================================
            DETAIL DRAWER
        ================================================= */}

        <Drawer
          title={
            <div className="drawer-title-box">
              <UserOutlined
                style={{
                  color: accentGold,
                }}
              />

              <div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    display: "block",
                  }}
                >
                  HỒ SƠ CHI TIẾT GIÁO DÂN
                </span>

                <small
                  style={{
                    color: "#64748b",
                    fontFamily: "monospace",
                  }}
                >
                  Mã số: {viewingRecord?.code || "---"}
                  {" ("}
                  {viewingRecord && isHouseHead(viewingRecord.is_head)
                    ? "Chủ hộ"
                    : "Thành viên"}
                  {")"}
                </small>
              </div>
            </div>
          }
          placement="right"
          width={650}
          onClose={() => setDetailOpen(false)}
          open={detailOpen}
          className="editorial-drawer"
        >
          {viewingRecord && (
            <div>
              {/* NHÂN THÂN */}

              <Divider
                orientation="left"
                style={{
                  marginTop: 0,
                  color: primaryNavy,
                  borderColor: accentGold,
                }}
              >
                <UserOutlined
                  style={{
                    marginRight: 6,
                  }}
                />
                Thông Tin Nhân Thân
              </Divider>

              <Descriptions
                column={2}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Họ và Tên" span={2}>
                  <strong
                    style={{
                      fontSize: 16,
                      color: primaryNavy,
                    }}
                  >
                    {viewingRecord.saint_name
                      ? `${viewingRecord.saint_name} `
                      : ""}

                    {viewingRecord.full_name || "---"}
                  </strong>
                </Descriptions.Item>

                <Descriptions.Item label="Vai trò hộ">
                  {isHouseHead(viewingRecord.is_head) ? (
                    <Tag className="gold-category-tag">Chủ Hộ</Tag>
                  ) : (
                    <Tag>Thành viên</Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Mối quan hệ">
                  {isHouseHead(viewingRecord.is_head)
                    ? "Đại diện chủ hộ"
                    : viewingRecord.relationship_with_head || "Chưa cập nhật"}
                </Descriptions.Item>

                <Descriptions.Item label="Giới tính">
                  {getGenderText(viewingRecord.gender)}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày sinh">
                  {formatDate(viewingRecord.date_of_birth)}
                </Descriptions.Item>

                <Descriptions.Item label="Số điện thoại">
                  {viewingRecord.phone || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Email" span={2}>
                  {viewingRecord.email || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Giáo xứ trực thuộc" span={2}>
                  {getChurchName(viewingRecord.churches_id)}
                </Descriptions.Item>

                <Descriptions.Item label="Nghề nghiệp" span={2}>
                  {viewingRecord.occupation || "---"}
                </Descriptions.Item>

                <Descriptions.Item label="Địa chỉ" span={2}>
                  {viewingRecord.address || "---"}
                </Descriptions.Item>
              </Descriptions>

              {/* BÍ TÍCH */}

              <Divider
                orientation="left"
                style={{
                  color: primaryNavy,
                  borderColor: accentGold,
                  marginTop: 24,
                }}
              >
                <BookOutlined
                  style={{
                    marginRight: 6,
                  }}
                />
                Đời Sống Đức Tin
              </Divider>

              <Descriptions
                column={1}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Bí tích Rửa Tội">
                  {viewingRecord.baptism_date
                    ? formatDate(viewingRecord.baptism_date)
                    : "Chưa cập nhật dữ liệu"}
                </Descriptions.Item>

                <Descriptions.Item label="Rước Lễ Lần Đầu">
                  {viewingRecord.first_communion_date
                    ? formatDate(viewingRecord.first_communion_date)
                    : "Chưa cập nhật dữ liệu"}
                </Descriptions.Item>

                <Descriptions.Item label="Bí tích Thêm Sức">
                  {viewingRecord.confirmation_date
                    ? formatDate(viewingRecord.confirmation_date)
                    : "Chưa cập nhật dữ liệu"}
                </Descriptions.Item>
              </Descriptions>

              {/* MỤC VỤ */}

              <Divider
                orientation="left"
                style={{
                  color: primaryNavy,
                  borderColor: accentGold,
                  marginTop: 24,
                }}
              >
                <HeartOutlined
                  style={{
                    marginRight: 6,
                  }}
                />
                Tình Trạng Mục Vụ
              </Divider>

              <Descriptions
                column={2}
                bordered
                size="small"
                className="custom-modal-desc"
              >
                <Descriptions.Item label="Hôn nhân">
                  {getMaritalStatusText(viewingRecord.marital_status)}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(viewingRecord.status)}
                </Descriptions.Item>

                <Descriptions.Item label="Ghi chú mục vụ" span={2}>
                  {viewingRecord.notes || "Không có ghi chú nào thêm."}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Drawer>

        {/* =================================================
            CREATE / EDIT MODAL
        ================================================= */}

        <Modal
          width={1150}
          open={formOpen}
          onCancel={handleCloseForm}
          onOk={handleSubmit}
          confirmLoading={submitLoading}
          centered
          destroyOnClose={false}
          okText={editing ? "Cập nhật dữ liệu" : "Xác nhận khai báo"}
          cancelText="Hủy bỏ"
          title={
            <div className="modal-custom-title">
              <IdcardOutlined
                style={{
                  color: accentGold,
                }}
              />

              <span>
                {editing
                  ? "Cập Nhật Thông Tin Hồ Sơ Giáo Dân"
                  : "Khai Báo Thành Viên Giáo Dân Mới"}
              </span>
            </div>
          }
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
            form={form}
            layout="vertical"
            initialValues={{
              gender: "male",
              status: "active",
              marital_status: "single",
              is_head: 1,
            }}
            style={{
              paddingTop: 12,
            }}
          >
            {/* VAI TRÒ HỘ */}

            <div className="role-selector-box">
              <Form.Item
                name="is_head"
                label={
                  <Text strong className="form-field-label">
                    Vai trò định danh trong Hộ gia đình
                  </Text>
                }
                rules={[
                  {
                    required: true,
                  },
                ]}
                style={{
                  marginBottom: 0,
                }}
              >
                <Radio.Group
                  onChange={handleRoleChange}
                  disabled={!!editing}
                  optionType="button"
                  buttonStyle="solid"
                >
                  <Radio.Button value={1}>
                    <HomeOutlined
                      style={{
                        marginRight: 6,
                      }}
                    />
                    Thiết lập làm Chủ Hộ
                  </Radio.Button>

                  <Radio.Button value={0}>
                    <TeamOutlined
                      style={{
                        marginRight: 6,
                      }}
                    />
                    Là Thành viên
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>

            <Row gutter={32}>
              {/* LEFT */}

              <Col xs={24} lg={12} className="form-left-column">
                <div className="form-section-title">
                  <UserOutlined
                    style={{
                      color: accentGold,
                    }}
                  />

                  <span>Thông tin hành chính & Cư trú</span>
                </div>

                {isHeadWatch === 0 && (
                  <Form.Item
                    name="head_id"
                    label={
                      <Text strong className="form-field-label">
                        Thuộc Hộ Gia Đình Của Chủ Hộ *
                      </Text>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn chủ hộ!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Tìm kiếm họ tên hoặc mã chủ hộ"
                      showSearch
                      allowClear
                      className="custom-form-input"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        String(option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                    >
                      {houseHeads.map((head) => (
                        <Select.Option
                          key={head.id}
                          value={Number(head.id)}
                          label={`${head.full_name} ${head.code}`}
                        >
                          <div>
                            <strong>{head.full_name}</strong>

                            <span
                              style={{
                                color: "#94a3b8",
                                marginLeft: 8,
                                fontSize: 12,
                              }}
                            >
                              ({head.code || "Chưa có mã"})
                            </span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="code"
                      label={
                        <Text strong className="form-field-label">
                          {isHeadWatch === 1 ? "Mã Số Hộ" : "Mã Định Danh"}
                        </Text>
                      }
                    >
                      <Input
                        disabled
                        placeholder="Hệ thống tự động tạo mã"
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                        }}
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="full_name"
                      label={
                        <Text strong className="form-field-label">
                          Họ và Tên khai sinh *
                        </Text>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập họ tên!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Ví dụ: NGUYỄN VĂN A"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  {isHeadWatch === 0 && (
                    <Col span={12}>
                      <Form.Item
                        name="relationship_with_head"
                        label={
                          <Text strong className="form-field-label">
                            Quan hệ với Chủ Hộ *
                          </Text>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn mối quan hệ!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Chọn mối quan hệ"
                          className="custom-form-input"
                        >
                          <Select.Option value="Vợ">Vợ</Select.Option>

                          <Select.Option value="Chồng">Chồng</Select.Option>

                          <Select.Option value="Con ruột">
                            Con ruột
                          </Select.Option>

                          <Select.Option value="Con nuôi">
                            Con nuôi
                          </Select.Option>

                          <Select.Option value="Con dâu">Con dâu</Select.Option>

                          <Select.Option value="Con rể">Con rể</Select.Option>

                          <Select.Option value="Cháu">
                            Cháu nội/ngoại
                          </Select.Option>

                          <Select.Option value="Cha/Mẹ">Cha / Mẹ</Select.Option>

                          <Select.Option value="Anh/Chị/Em">
                            Anh / Chị / Em
                          </Select.Option>

                          <Select.Option value="Khác">
                            Quan hệ khác
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  )}

                  <Col span={isHeadWatch === 0 ? 12 : 24}>
                    <Form.Item
                      name="gender"
                      label={
                        <Text strong className="form-field-label">
                          Giới tính
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Select.Option value="male">Nam giới</Select.Option>

                        <Select.Option value="female">Nữ giới</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="saint_name"
                  label={
                    <Text strong className="form-field-label">
                      Tên Thánh *
                    </Text>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên thánh!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Ví dụ: Daminh, Giuse, Maria..."
                    className="custom-form-input"
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="date_of_birth"
                      label={
                        <Text strong className="form-field-label">
                          Ngày sinh
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                        }}
                        format="DD/MM/YYYY"
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label={
                        <Text strong className="form-field-label">
                          Số điện thoại
                        </Text>
                      }
                      rules={[
                        {
                          pattern: /^[0-9]{10}$/,
                          message: "SĐT phải gồm đúng 10 chữ số!",
                        },
                      ]}
                    >
                      <Input
                        maxLength={10}
                        placeholder="Nhập SĐT liên hệ"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label={
                        <Text strong className="form-field-label">
                          Hòm thư Email
                        </Text>
                      }
                      rules={[
                        {
                          type: "email",
                          message: "Email không hợp lệ!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="nhap@email.com"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="occupation"
                      label={
                        <Text strong className="form-field-label">
                          Nghề nghiệp
                        </Text>
                      }
                    >
                      <Input
                        placeholder="Ví dụ: Công nhân, Học sinh..."
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="churches_id"
                  label={
                    <Text strong className="form-field-label">
                      Thuộc Giáo Xứ / Giáo Họ
                    </Text>
                  }
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Lựa chọn giáo xứ quản lý"
                    optionFilterProp="children"
                    className="custom-form-input"
                  >
                    {churches.map((church) => (
                      <Select.Option key={church.id} value={Number(church.id)}>
                        {church.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="address"
                  label={
                    <Text strong className="form-field-label">
                      Địa chỉ thường trú
                    </Text>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Số nhà, đường, xóm..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>

              {/* RIGHT */}

              <Col xs={24} lg={12} className="form-right-column">
                <div className="form-section-title">
                  <BookOutlined
                    style={{
                      color: accentGold,
                    }}
                  />

                  <span>Đời sống đức tin & Bí tích</span>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="baptism_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày Bí tích Rửa Tội
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                        }}
                        format="DD/MM/YYYY"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="first_communion_date"
                      label={
                        <Text strong className="form-field-label">
                          Ngày Rước Lễ Lần Đầu
                        </Text>
                      }
                    >
                      <DatePicker
                        style={{
                          width: "100%",
                        }}
                        format="DD/MM/YYYY"
                        className="custom-form-input"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="confirmation_date"
                  label={
                    <Text strong className="form-field-label">
                      Ngày Bí tích Thêm Sức
                    </Text>
                  }
                >
                  <DatePicker
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                    className="custom-form-input"
                  />
                </Form.Item>

                <div
                  className="form-section-title"
                  style={{
                    marginTop: 20,
                  }}
                >
                  <HeartOutlined
                    style={{
                      color: accentGold,
                    }}
                  />

                  <span>Tình trạng hôn nhân & Mục vụ</span>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="marital_status"
                      label={
                        <Text strong className="form-field-label">
                          Tình trạng Hôn nhân
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Select.Option value="single">Độc thân</Select.Option>

                        <Select.Option value="married">
                          Đã kết hôn
                        </Select.Option>

                        <Select.Option value="religious">
                          Đời sống tu sĩ dâng hiến
                        </Select.Option>

                        <Select.Option value="widowed">
                          Góa phụ / Góa chồng
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label={
                        <Text strong className="form-field-label">
                          Trạng thái sinh hoạt
                        </Text>
                      }
                    >
                      <Select className="custom-form-input">
                        <Select.Option value="active">
                          Đang sinh hoạt
                        </Select.Option>

                        <Select.Option value="inactive">
                          Tạm ngưng
                        </Select.Option>

                        <Select.Option value="moved">
                          Đã chuyển xứ
                        </Select.Option>

                        <Select.Option value="deceased">
                          Đã qua đời
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="notes"
                  label={
                    <Text strong className="form-field-label">
                      Ghi chú mục vụ
                    </Text>
                  }
                >
                  <Input.TextArea
                    rows={7}
                    placeholder="Nhập ghi chú đặc biệt về giáo dân..."
                    className="custom-form-input"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

        {/* =================================================
            CSS
        ================================================= */}

        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap');

              * {
                box-sizing: border-box;
              }

              .parishioner-editorial-layout {
                background: ${softBg};
                min-height: 100vh;
                padding: 40px 20px 80px;
                font-family: 'Be Vietnam Pro', sans-serif;
                color: ${textDark};
              }

              .parishioner-editorial-container {
                max-width: 1250px;
                margin: 0 auto;
              }

              .parishioner-header-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-bottom: 28px;
                flex-wrap: wrap;
                gap: 20px;
              }

              .header-text-group {
                min-width: 0;
              }

              .header-action-group {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
              }

              .sacred-badge {
                background: rgba(212, 175, 55, 0.15);
                border: 1px solid ${accentGold};
                color: ${primaryNavy};
                padding: 5px 14px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 1px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 10px;
              }

              .parishioner-main-title {
                font-family: 'Playfair Display', Georgia, serif !important;
                color: ${primaryNavy} !important;
                margin: 0 !important;
                font-weight: 700 !important;
                font-size: clamp(24px, 3.5vw, 34px) !important;
              }

              .parishioner-sub-title {
                color: #64748b;
                margin: 5px 0 0 !important;
                font-size: 14px;
                line-height: 1.7;
              }

              .refresh-btn {
                border-radius: 10px !important;
                border-color: rgba(27, 54, 93, 0.2) !important;
                color: ${primaryNavy} !important;
                font-weight: 600;
                height: 42px;
              }

              .add-parishioner-btn {
                background: ${primaryNavy} !important;
                border-color: ${primaryNavy} !important;
                height: 42px !important;
                border-radius: 10px !important;
                font-weight: 700 !important;
                box-shadow: 0 4px 14px rgba(27, 54, 93, 0.2);
              }

              .filter-card {
                border-radius: 16px !important;
                background: #fff !important;
                border: 1px solid rgba(27, 54, 93, 0.08) !important;
                margin-bottom: 20px;
                padding: 4px;
              }

              .form-field-label {
                font-size: 13px;
                color: ${primaryNavy};
                display: inline-block;
                margin-bottom: 6px;
              }

              .custom-filter-input {
                border-radius: 10px !important;
                height: 40px !important;
              }

              .custom-filter-select .ant-select-selector {
                border-radius: 10px !important;
                min-height: 40px !important;
                height: 40px !important;
                display: flex;
                align-items: center;
              }

              .filter-button-group {
                display: flex;
                gap: 8px;
                width: 100%;
              }

              .filter-search-button {
                background: ${primaryNavy} !important;
                border-color: ${primaryNavy} !important;
                border-radius: 10px !important;
                height: 40px !important;
                font-weight: 600;
                flex: 1;
              }

              .filter-reset-button {
                border-radius: 10px !important;
                height: 40px !important;
                width: 42px;
              }

              .main-table-card {
                border-radius: 20px !important;
                background: #fff !important;
                border: 1px solid rgba(212, 175, 55, 0.25) !important;
                box-shadow: 0 10px 30px rgba(27, 54, 93, 0.05) !important;
                padding: 8px;
              }

              .section-card-header {
                display: flex;
                align-items: center;
                gap: 8px;
                color: ${primaryNavy};
                font-family: 'Playfair Display', serif;
                font-size: 16px;
                font-weight: 700;
              }

              .custom-admin-table .ant-table-thead > tr > th {
                background: ${softBg} !important;
                color: ${primaryNavy} !important;
                font-weight: 700 !important;
                border-bottom: 1px solid rgba(27, 54, 93, 0.1) !important;
                white-space: nowrap;
              }

              .custom-admin-table .ant-table-tbody > tr:hover > td {
                background: rgba(212, 175, 55, 0.035) !important;
              }

              .gold-category-tag {
                background: rgba(212, 175, 55, 0.12) !important;
                border: 1px solid ${accentGold} !important;
                color: ${primaryNavy} !important;
                border-radius: 6px;
                font-weight: 600;
                font-size: 11px;
              }

              .action-btn-view:hover,
              .action-btn-edit:hover {
                background: rgba(27, 54, 93, 0.1) !important;
              }

              .action-btn-delete:hover {
                background: #fff5f5 !important;
              }

              .sub-table-container {
                padding: 14px 16px;
                background: ${softBg};
                border-radius: 12px;
                border: 1px solid rgba(212, 175, 55, 0.3);
                margin: 8px 0;
              }

              .sub-table-header {
                margin-bottom: 10px;
                font-weight: 700;
                color: ${primaryNavy};
                font-size: 12px;
                letter-spacing: 0.5px;
              }

              .custom-sub-table .ant-table-thead > tr > th {
                background: #fff !important;
                color: ${primaryNavy} !important;
                font-size: 12px;
              }

              .drawer-title-box {
                display: flex;
                align-items: center;
                gap: 10px;
              }

              .custom-modal-desc .ant-descriptions-item-label {
                font-weight: 600;
                color: ${primaryNavy};
                background: ${softBg};
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

              .role-selector-box {
                background: ${softBg};
                padding: 14px 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid rgba(27, 54, 93, 0.1);
              }

              .form-section-title {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 16px;
                color: ${primaryNavy};
                font-weight: 700;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }

              .custom-form-input {
                border-radius: 8px !important;
              }

              .form-left-column {
                border-right: 1px solid rgba(27, 54, 93, 0.08);
                padding-right: 28px !important;
              }

              .form-right-column {
                padding-left: 28px !important;
              }

              @media (max-width: 991px) {
                .form-left-column {
                  border-right: none;
                  border-bottom: 1px solid rgba(27, 54, 93, 0.08);
                  padding-right: 12px !important;
                  padding-bottom: 25px;
                  margin-bottom: 25px;
                }

                .form-right-column {
                  padding-left: 12px !important;
                }
              }

              @media (max-width: 768px) {
                .parishioner-editorial-layout {
                  padding: 20px 10px 50px;
                }

                .parishioner-header-section {
                  align-items: flex-start;
                }

                .header-action-group {
                  width: 100%;
                }

                .refresh-btn,
                .add-parishioner-btn {
                  flex: 1;
                }

                .filter-card {
                  border-radius: 12px !important;
                }

                .main-table-card {
                  border-radius: 14px !important;
                  padding: 4px;
                }

                .sacred-badge {
                  font-size: 9px;
                  letter-spacing: 0.5px;
                }

                .parishioner-sub-title {
                  font-size: 13px;
                }

                .role-selector-box {
                  padding: 12px;
                  overflow-x: auto;
                }

                .role-selector-box .ant-radio-group {
                  display: flex;
                  min-width: max-content;
                }

                .role-selector-box .ant-radio-button-wrapper {
                  padding: 0 14px !important;
                }
              }

              @media (max-width: 576px) {
                .parishioner-main-title {
                  font-size: 26px !important;
                }

                .header-action-group {
                  flex-direction: column;
                }

                .refresh-btn,
                .add-parishioner-btn {
                  width: 100%;
                }

                .filter-button-group {
                  margin-top: 5px;
                }

                .drawer-title-box span {
                  font-size: 14px !important;
                }

                .drawer-title-box small {
                  font-size: 10px;
                }
              }
            `,
          }}
        />
      </div>
    </ConfigProvider>
  );
}
