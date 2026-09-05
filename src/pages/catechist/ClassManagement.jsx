import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Avatar,
  Space,
  Modal,
  Form,
  Input,
  message,
  Empty,
  Skeleton,
  Drawer,
  Descriptions,
  Divider,
  Segmented,
  Badge,
} from "antd";

import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  IdcardOutlined,
  PhoneOutlined,
  MailOutlined,
  UserSwitchOutlined,
  FilterOutlined,
  HeartFilled,
  StarFilled,
  SmileOutlined,
} from "@ant-design/icons";
import usePermission from "../../hooks/usePermission";
import AppFormModal from "../../components/common/AppFormModal";
import ClassForm from "../../components/forms/ClassForm";
import StatCard from "../../components/common/StatCard";
import ClassCard from "../../components/class/ClassCard";
import ClassDetailSkeleton from "../../components/class/ClassDetailSkeleton";
import dayjs from "dayjs";
import classApi from "../../api/classApi";
import { useUser } from "../../context/UserContext";
import PageHeroHeader from "../../components/common/PageHeroHeader";
import catechistApi from "../../api/catechistApi";
const { Text } = Typography;

/* =========================================================
   HELPERS & NORMALIZE
========================================================= */

const normalizeListResponse = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeObjectResponse = (response) => {
  const data = response?.data;
  if (data?.data && !Array.isArray(data.data)) return data.data;
  return data || null;
};

const formatTime = (time) => {
  if (!time) return "—";
  return String(time).slice(0, 5);
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = dayjs(date);
  if (!parsed.isValid()) return "—";
  return parsed.format("DD/MM/YYYY");
};

const getDayName = (day) => {
  const days = {
    0: "Chúa Nhật",
    1: "Thứ Hai",
    2: "Thứ Ba",
    3: "Thứ Tư",
    4: "Thứ Năm",
    5: "Thứ Sáu",
    6: "Thứ Bảy",
    7: "Chúa Nhật",
    monday: "Thứ Hai",
    tuesday: "Thứ Ba",
    wednesday: "Thứ Tư",
    thursday: "Thứ Năm",
    friday: "Thứ Sáu",
    saturday: "Thứ Bảy",
    sunday: "Chúa Nhật",
  };
  return days[day] || day || "Chưa cập nhật";
};

const getStatusConfig = (status) => {
  const configs = {
    active: {
      label: "Đang hoạt động",
      color: "#0284C7",
      bg: "#E0F2FE",
      border: "#BAE6FD",
      icon: <CheckCircleOutlined />,
    },
    paused: {
      label: "Tạm dừng",
      color: "#D97706",
      bg: "#FEF3C7",
      border: "#FDE68A",
      icon: <PauseCircleOutlined />,
    },
    completed: {
      label: "Đã kết thúc",
      color: "#64748B",
      bg: "#F1F5F9",
      border: "#E2E8F0",
      icon: <StopOutlined />,
    },
  };
  return configs[status] || configs.active;
};

/* =========================================================
   STATUS TAG CHIBI
========================================================= */

const StatusTag = ({ status }) => {
  const config = getStatusConfig(status);
  return (
    <Tag
      bordered={false}
      style={{
        margin: 0,
        borderRadius: 12,
        padding: "3px 10px",
        fontSize: 10,
        fontWeight: 800,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      {config.icon} {config.label}
    </Tag>
  );
};

/* =========================================================
   SKELETON CHIBI CARD
========================================================= */

const ClassCardSkeleton = () => {
  return (
    <Card
      bordered={false}
      style={{
        height: "100%",
        borderRadius: 26,
        overflow: "hidden",
        border: "2px solid #FFE4E6",
        background: "#FFFFFF",
      }}
      styles={{ body: { padding: 0 } }}
    >
      <div
        style={{
          padding: 20,
          background: "#FFF5F7",
          borderBottom: "1.5px dashed #FFD1D9",
        }}
      >
        <Row justify="space-between" align="start">
          <Space align="start" size={12}>
            <Skeleton.Avatar
              active
              size={48}
              shape="square"
              style={{ borderRadius: 18 }}
            />
            <div>
              <Skeleton.Input
                active
                size="small"
                style={{ width: 150, height: 18, borderRadius: 8 }}
              />
              <div style={{ marginTop: 8 }}>
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 80, height: 16, borderRadius: 8 }}
                />
              </div>
            </div>
          </Space>
          <Skeleton.Button
            active
            size="small"
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
        </Row>
      </div>

      <div style={{ padding: 18 }}>
        <Row gutter={[10, 10]}>
          {[1, 2, 3, 4].map((item) => (
            <Col span={12} key={item}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: "100%", height: 38, borderRadius: 14 }}
              />
            </Col>
          ))}
        </Row>

        <div
          style={{
            marginTop: 14,
            padding: 10,
            borderRadius: 18,
            border: "1.5px solid #FFE4E6",
            background: "#FFF5F7",
          }}
        >
          <Space size={10}>
            <Skeleton.Avatar active size={32} shape="circle" />
            <Skeleton.Input
              active
              size="small"
              style={{ width: 90, height: 16, borderRadius: 8 }}
            />
          </Space>
        </div>
      </div>
    </Card>
  );
};

/* =========================================================
   CATECHIST ITEM CHIBI
========================================================= */

const CatechistItem = ({ catechist, index, classId, onRemove, removing }) => {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: "#FFF9FA",
        border: "1.5px solid #FFE4E6",
        marginBottom: 12,
      }}
    >
      <Row gutter={[12, 12]} align="middle">
        <Col>
          <Avatar
            size={48}
            style={{
              background: index % 2 === 0 ? "#FF6B8B" : "#FFC048",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: 16,
              border: "2px solid #FFFFFF",
              boxShadow: "0 4px 10px rgba(255, 107, 139, 0.2)",
            }}
          >
            {catechist.full_name?.charAt(0)?.toUpperCase() || "G"}
          </Avatar>
        </Col>

        <Col flex="auto">
          <Row justify="space-between" align="middle" gutter={[8, 8]}>
            <Col flex="auto">
              <Text
                strong
                style={{
                  color: "#334155",
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {catechist.holy_name ? `${catechist.holy_name} ` : ""}
                {catechist.full_name || "Giáo lý viên"}
              </Text>
            </Col>

            <Col>
              {catechist.role && (
                <Tag
                  style={{
                    margin: 0,
                    border: 0,
                    borderRadius: 10,
                    background: "#FFE4E6",
                    color: "#FF6B8B",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                  }}
                >
                  🌸 {catechist.role}
                </Tag>
              )}
            </Col>
          </Row>

          <Space wrap size={[10, 4]} style={{ marginTop: 4 }}>
            {catechist.catechist_code && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  fontWeight: 700,
                }}
              >
                <IdcardOutlined style={{ color: "#FF6B8B" }} />{" "}
                {catechist.catechist_code}
              </Text>
            )}

            {catechist.level && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#94A3B8",
                  fontWeight: 700,
                }}
              >
                • Cấp: {catechist.level}
              </Text>
            )}
          </Space>
        </Col>

        {/* NÚT XÓA */}
        <Col>
          <Button
            danger
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            loading={removing}
            disabled={removing}
            onClick={() => onRemove(catechist)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </Col>
      </Row>

      <Divider
        style={{
          margin: "12px 0",
          borderColor: "#FFE4E6",
        }}
      />

      <Row gutter={[10, 8]}>
        <Col xs={24} sm={12}>
          <Text
            style={{
              fontSize: 11,
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            <PhoneOutlined
              style={{
                marginRight: 6,
                color: "#FF6B8B",
              }}
            />
            {catechist.phone || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <Text
            style={{
              fontSize: 11,
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            <MailOutlined
              style={{
                marginRight: 6,
                color: "#FF6B8B",
              }}
            />
            {catechist.email || "Chưa cập nhật"}
          </Text>
        </Col>

        <Col span={24}>
          <Text
            style={{
              fontSize: 11,
              color: "#64748B",
              fontWeight: 600,
            }}
          >
            <CalendarOutlined
              style={{
                marginRight: 6,
                color: "#FFC048",
              }}
            />
            Ngày phân công: {formatDate(catechist.assigned_date)}
          </Text>
        </Col>
      </Row>
    </div>
  );
};

/* =========================================================
   SECTION TITLE CHIBI
========================================================= */

const SectionTitle = ({ icon, title, description, count }) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 14 }}>
      <Col flex="auto">
        <Space align="center" size={10}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 14,
              background: "#FFF5F7",
              color: "#FF6B8B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              border: "1px solid #FFE4E6",
            }}
          >
            {icon}
          </div>

          <div>
            <Text
              strong
              style={{
                display: "block",
                color: "#334155",
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              {title}
            </Text>

            {description && (
              <Text style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>
                {description}
              </Text>
            )}
          </div>
        </Space>
      </Col>

      {count !== undefined && (
        <Col>
          <Badge
            count={count}
            style={{
              backgroundColor: "#FF6B8B",
              fontWeight: 800,
              boxShadow: "0 4px 10px rgba(255, 107, 139, 0.3)",
            }}
          />
        </Col>
      )}
    </Row>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ClassManagement = () => {
  const { user } = useUser();

  const churchId = user?.church_id;
  const { canCreateClass, canEditClass, canDeleteClass } = usePermission();
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [classDetail, setClassDetail] = useState(null);
  const [removingCatechistId, setRemovingCatechistId] = useState(null);

  const [form] = Form.useForm();

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchClasses = useCallback(async (showMessage = false) => {
    try {
      setLoading(true);
      const response = await classApi.getAll();
      const data = normalizeListResponse(response);
      setClassesList(data);

      if (showMessage) {
        message.success("✨ Đã làm mới danh sách lớp học!");
      }
    } catch (error) {
      console.error("❌ GET CLASSES ERROR:", error);
      message.error(
        error?.response?.data?.message || "Không thể tải danh sách lớp học",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);
  useEffect(() => {
    if (!isModalOpen) return;

    if (editingClass) {
      form.setFieldsValue({
        name: editingClass.name || "",
        category: editingClass.category || "Giáo lý Hôn Nhân",
        description: editingClass.description || "",
        room: editingClass.room || "",
        day_of_week: editingClass.day_of_week ?? null,

        start_time: editingClass.start_time
          ? dayjs(editingClass.start_time, "HH:mm:ss")
          : null,

        end_time: editingClass.end_time
          ? dayjs(editingClass.end_time, "HH:mm:ss")
          : null,

        start_date: editingClass.start_date
          ? dayjs(editingClass.start_date)
          : null,

        end_date: editingClass.end_date ? dayjs(editingClass.end_date) : null,

        status: editingClass.status || "active",
      });
    } else {
      form.resetFields();

      form.setFieldsValue({
        category: "Giáo lý Hôn Nhân",
        status: "active",
      });
    }
  }, [editingClass, isModalOpen, form]);
  /* =====================================================
     STATISTICS
  ===================================================== */

  const statistics = useMemo(() => {
    const totalClasses = classesList.length;
    const activeClasses = classesList.filter(
      (item) => item.status === "active",
    ).length;
    const pausedClasses = classesList.filter(
      (item) => item.status === "paused",
    ).length;
    const completedClasses = classesList.filter(
      (item) => item.status === "completed",
    ).length;

    const totalStudents = classesList.reduce(
      (total, item) => total + Number(item.studentsCount || 0),
      0,
    );

    const totalCatechists = classesList.reduce(
      (total, item) => total + Number(item.catechists?.length || 0),
      0,
    );

    return {
      totalClasses,
      activeClasses,
      pausedClasses,
      completedClasses,
      totalStudents,
      totalCatechists,
    };
  }, [classesList]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredClasses = useMemo(() => {
    const keyword = searchText.toLowerCase().trim();

    return classesList.filter((item) => {
      const matchSearch =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.code?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.room?.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classesList, searchText, statusFilter]);

  /* =====================================================
     ACTIONS
  ===================================================== */

  const handleCreate = useCallback(() => {
    if (saving) return;

    setEditingClass(null);
    setIsModalOpen(true);
  }, [saving]);

  const handleEdit = useCallback(
    (item) => {
      if (saving) return;

      setEditingClass(item);
      setIsModalOpen(true);
    },
    [saving],
  );

  const closeModal = useCallback(() => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingClass(null);
    form.resetFields();
  }, [form, saving]);

  const handleSave = useCallback(
    async (values) => {
      if (saving) return;
      if (!churchId) {
        message.error("Không xác định được giáo xứ của tài khoản");
        return;
      }

      try {
        setSaving(true);
        const payload = {
          name: values.name?.trim(),
          church_id: churchId,
          category: values.category || "Giáo lý Hôn Nhân",
          description: values.description?.trim() || null,
          room: values.room?.trim() || null,
          day_of_week: values.day_of_week || null,
          start_time: values.start_time
            ? values.start_time.format("HH:mm:ss")
            : null,
          end_time: values.end_time ? values.end_time.format("HH:mm:ss") : null,
          start_date: values.start_date
            ? values.start_date.format("YYYY-MM-DD")
            : null,
          end_date: values.end_date
            ? values.end_date.format("YYYY-MM-DD")
            : null,
          status: values.status || "active",
        };

        if (editingClass) {
          await classApi.update(editingClass.id, payload);
          message.success("✨ Cập nhật lớp học thành công!");
        } else {
          const response = await classApi.create(payload);
          const generatedCode = response?.data?.data?.code;
          if (generatedCode) {
            message.success(`🎉 Tạo lớp thành công • Mã lớp: ${generatedCode}`);
          } else {
            message.success("🎉 Tạo lớp học thành công!");
          }
        }

        setIsModalOpen(false);
        setEditingClass(null);
        form.resetFields();
        await fetchClasses();
      } catch (error) {
        console.error("❌ SAVE CLASS ERROR:", error);
        message.error(
          error?.response?.data?.message || "Không thể lưu lớp học",
        );
      } finally {
        setSaving(false);
      }
    },
    [editingClass, fetchClasses, form, saving, churchId],
  );

  const handleDelete = useCallback(
    (item) => {
      if (deletingId) return;

      Modal.confirm({
        title: "🌸 Xác nhận xóa lớp học",
        icon: <DeleteOutlined style={{ color: "#FF6B8B" }} />,
        content: (
          <div style={{ marginTop: 10 }}>
            <Text>
              Bạn có chắc chắn muốn xóa lớp <strong>{item.name}</strong>?
            </Text>
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                background: "#FFF5F7",
                border: "1px solid #FFE4E6",
              }}
            >
              <Text style={{ fontSize: 12, color: "#FF6B8B" }}>
                ⚠️ Việc xóa lớp có thể ảnh hưởng đến dữ liệu học viên và Giáo lý
                viên phụ trách.
              </Text>
            </div>
          </div>
        ),
        okText: "Xóa lớp",
        cancelText: "Hủy",
        okButtonProps: {
          danger: true,
          style: { borderRadius: 12, fontWeight: 700 },
        },
        cancelButtonProps: {
          style: { borderRadius: 12 },
        },
        onOk: async () => {
          try {
            setDeletingId(item.id);
            await classApi.remove(item.id);
            message.success("✨ Đã xóa lớp học thành công");
            await fetchClasses();
          } catch (error) {
            console.error("❌ DELETE CLASS ERROR:", error);
            message.error(
              error?.response?.data?.message || "Không thể xóa lớp học",
            );
          } finally {
            setDeletingId(null);
          }
        },
      });
    },
    [deletingId, fetchClasses],
  );

  const handleViewDetail = useCallback(async (item) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setClassDetail(null);
      const response = await classApi.getById(item.id);
      setClassDetail(normalizeObjectResponse(response));
    } catch (error) {
      console.error("❌ GET CLASS DETAIL ERROR:", error);
      message.error(
        error?.response?.data?.message || "Không thể tải thông tin lớp học",
      );
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);
  const handleRemoveCatechist = useCallback(
    (catechist) => {
      const classId = classDetail?.id;

      const catechistId = catechist?.catechist_id ?? catechist?.id;

      if (!classId) {
        message.error("Không xác định được lớp học");
        return;
      }

      if (!catechistId) {
        message.error("Không xác định được giáo lý viên");
        return;
      }

      Modal.confirm({
        title: "🌸 Xóa giáo lý viên khỏi lớp",

        icon: (
          <DeleteOutlined
            style={{
              color: "#FF6B8B",
            }}
          />
        ),

        content: (
          <div style={{ marginTop: 10 }}>
            <Text>
              Bạn có chắc muốn xóa{" "}
              <strong>
                {catechist.holy_name ? `${catechist.holy_name} ` : ""}
                {catechist.full_name}
              </strong>{" "}
              khỏi lớp <strong>{classDetail.name}</strong>?
            </Text>

            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 14,
                background: "#FFF5F7",
                border: "1px solid #FFE4E6",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#D97706",
                }}
              >
                ⚠️ Giáo lý viên sẽ không còn được phân công phụ trách lớp này.
              </Text>
            </div>
          </div>
        ),

        okText: "Xóa khỏi lớp",
        cancelText: "Hủy",

        okButtonProps: {
          danger: true,
          style: {
            borderRadius: 12,
            fontWeight: 700,
          },
        },

        cancelButtonProps: {
          style: {
            borderRadius: 12,
          },
        },

        onOk: async () => {
          try {
            setRemovingCatechistId(catechistId);

            console.log("🚀 REMOVE API:", {
              catechist_id: Number(catechistId),
              class_id: Number(classId),
            });

            // 1. Xóa GLV khỏi lớp
            await catechistApi.removeClass({
              catechist_id: Number(catechistId),
              class_id: Number(classId),
            });

            message.success(`✨ Đã xóa ${catechist.full_name} khỏi lớp`);

            // 2. Reload chi tiết lớp
            const response = await classApi.getById(classId);

            setClassDetail(normalizeObjectResponse(response));

            // 3. Reload danh sách lớp
            await fetchClasses();
          } catch (error) {
            console.error("❌ REMOVE CATECHIST FROM CLASS ERROR:", error);

            message.error(
              error?.response?.data?.message ||
                "Không thể xóa giáo lý viên khỏi lớp",
            );
          } finally {
            setRemovingCatechistId(null);
          }
        },
      });
    },

    // ⭐ CHỈ GIỮ CÁC DEPENDENCY THỰC SỰ
    [classDetail, fetchClasses],
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        backgroundColor: "#FFF9FA",
      }}
    >
      {/* HERO HEADER CHIBI */}
      <PageHeroHeader
        icon={<BookOutlined />}
        badgeText="🌸 QUẢN LÝ GIÁO LÝ"
        title="Quản Lý Lớp Học"
        description="Theo dõi lịch học, danh sách học viên và Giáo lý viên phụ trách."
        onRefresh={() => fetchClasses(true)}
        refreshLoading={loading}
        primaryButtonText={canCreateClass ? "Tạo lớp mới" : undefined}
        primaryButtonIcon={canCreateClass ? <PlusOutlined /> : undefined}
        onPrimaryClick={canCreateClass ? handleCreate : undefined}
        primaryDisabled={loading || saving || !canCreateClass}
      />
      {/* STATISTICS CHIBI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng số lớp"
            value={statistics.totalClasses}
            loading={loading}
            icon={<BookOutlined />}
            iconColor="#FF6B8B"
            description="Tất cả lớp học"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Đang hoạt động"
            value={statistics.activeClasses}
            loading={loading}
            icon={<CheckCircleOutlined />}
            iconColor="#38BDF8"
            description={`${
              statistics.totalClasses
                ? Math.round(
                    (statistics.activeClasses / statistics.totalClasses) * 100,
                  )
                : 0
            }% tổng số lớp`}
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Tổng học viên"
            value={statistics.totalStudents}
            loading={loading}
            suffix="bé"
            icon={<TeamOutlined />}
            iconColor="#FFC048"
            description="Đang được quản lý"
          />
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <StatCard
            title="Giáo lý viên"
            value={statistics.totalCatechists}
            loading={loading}
            suffix="phụ trách"
            icon={<UserSwitchOutlined />}
            iconColor="#A855F7"
            description="Được phân công"
          />
        </Col>
      </Row>

      {/* SEARCH / FILTER BAR CHIBI */}
      <Card
        bordered={false}
        style={{
          borderRadius: 24,
          marginBottom: 20,
          background: "#FFFFFF",
          border: "2px solid #FFE4E6",
          boxShadow: "0 10px 25px rgba(255, 182, 193, 0.15)",
        }}
        styles={{ body: { padding: 14 } }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={15}>
            <Input
              size="large"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#FF6B8B" }} />}
              placeholder="Tìm tên lớp, mã lớp, chương trình hoặc phòng học..."
              style={{
                height: 44,
                borderRadius: 16,
                background: "#FFF5F7",
                border: "1px solid #FFE4E6",
                fontSize: 13,
                fontWeight: 600,
              }}
            />
          </Col>

          <Col xs={24} lg={9}>
            <Segmented
              block
              value={statusFilter}
              onChange={setStatusFilter}
              style={{
                background: "#FFF5F7",
                borderRadius: 16,
                padding: 3,
                border: "1px solid #FFE4E6",
              }}
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Hoạt động", value: "active" },
                { label: "Tạm dừng", value: "paused" },
                { label: "Kết thúc", value: "completed" },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* LIST HEADER */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 16, padding: "0 4px" }}
      >
        <Col>
          <Space size={8} align="center">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: "#FFFFFF",
                border: "1.5px solid #FFE4E6",
                color: "#FF6B8B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FilterOutlined />
            </div>
            <Text
              strong
              style={{
                color: "#334155",
                fontSize: 14,
                fontWeight: 800,
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              Danh sách lớp học ({filteredClasses.length})
            </Text>
          </Space>
        </Col>
      </Row>

      {/* CLASS GRID LIST */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <Col xs={24} sm={12} lg={8} key={key}>
              <ClassCardSkeleton />
            </Col>
          ))}
        </Row>
      ) : filteredClasses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {filteredClasses.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <ClassCard
                item={item}
                onView={handleViewDetail}
                onEdit={canEditClass ? handleEdit : undefined}
                onDelete={canDeleteClass ? handleDelete : undefined}
                canEdit={canEditClass}
                canDelete={canDeleteClass}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Card
          bordered={false}
          style={{
            borderRadius: 26,
            textAlign: "center",
            padding: "40px 20px",
            background: "#FFFFFF",
            border: "2px solid #FFE4E6",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text style={{ color: "#94A3B8", fontWeight: 700 }}>
                Không tìm thấy lớp học phù hợp 🌸
              </Text>
            }
          >
            <Button
              type="primary"
              onClick={handleCreate}
              style={{
                borderRadius: 14,
                background: "#FF6B8B",
                borderColor: "#FF6B8B",
                fontWeight: 800,
              }}
            >
              Tạo lớp mới ngay
            </Button>
          </Empty>
        </Card>
      )}

      {/* MODAL FORM TẠO / SỬA LỚP */}
      <AppFormModal
        title={editingClass ? "🌸 Chỉnh sửa lớp học" : "✨ Tạo lớp học mới"}
        open={isModalOpen}
        onCancel={closeModal}
        confirmLoading={saving}
        onOk={() => form.submit()}
      >
        <ClassForm
          form={form}
          editingClass={editingClass}
          loading={saving}
          onFinish={handleSave}
        />
      </AppFormModal>

      {/* DRAWER CHI TIẾT LỚP HỌC CHIBI */}
      <Drawer
        title={
          <Space align="center" size={10}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 14,
                background: "#FFF5F7",
                color: "#FF6B8B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #FFE4E6",
              }}
            >
              <BookOutlined />
            </div>
            <div>
              <Text
                strong
                style={{
                  display: "block",
                  color: "#334155",
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "'Quicksand', sans-serif",
                }}
              >
                {classDetail?.name || "Chi tiết lớp học"}
              </Text>
              {classDetail?.code && (
                <Tag
                  style={{
                    margin: 0,
                    borderRadius: 8,
                    background: "#FEF3C7",
                    color: "#D97706",
                    border: 0,
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  ✨ {classDetail.code}
                </Tag>
              )}
            </div>
          </Space>
        }
        width={520}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        styles={{
          header: {
            background: "#FFF5F7",
            borderBottom: "1.5px dashed #FFD1D9",
            padding: "16px 24px",
          },
          body: {
            padding: 20,
            background: "#FFFFFF",
          },
        }}
      >
        {detailLoading ? (
          <ClassDetailSkeleton />
        ) : classDetail ? (
          <div>
            {/* TỔNG QUAN LỚP */}
            <SectionTitle
              icon={<StarFilled />}
              title="Thông tin tổng quan"
              description="Lịch học và thời gian khóa học"
            />

            <Descriptions
              column={2}
              bordered
              size="small"
              style={{
                marginBottom: 20,
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid #FFE4E6",
              }}
            >
              <Descriptions.Item label="Lịch học">
                {getDayName(classDetail.day_of_week)}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {formatTime(classDetail.start_time)} -{" "}
                {formatTime(classDetail.end_time)}
              </Descriptions.Item>
              <Descriptions.Item label="Phòng học">
                {classDetail.room || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <StatusTag status={classDetail.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {formatDate(classDetail.start_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {formatDate(classDetail.end_date)}
              </Descriptions.Item>
            </Descriptions>

            {/* DANH SÁCH GIÁO LÝ VIÊN */}
            <SectionTitle
              icon={<HeartFilled />}
              title="Giáo lý viên phụ trách"
              count={classDetail.catechists?.length || 0}
            />

            {classDetail.catechists?.length > 0 ? (
              classDetail.catechists.map((c, idx) => (
                <CatechistItem
                  key={c.id || idx}
                  catechist={c}
                  index={idx}
                  classId={classDetail.id}
                  onRemove={handleRemoveCatechist}
                  removing={removingCatechistId === c.id}
                />
              ))
            ) : (
              <div
                style={{
                  padding: 20,
                  borderRadius: 18,
                  background: "#FFF5F7",
                  border: "1.5px dashed #FFE4E6",
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                <SmileOutlined
                  style={{ fontSize: 24, color: "#FF6B8B", marginBottom: 6 }}
                />
                <Text
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#94A3B8",
                    fontWeight: 700,
                  }}
                >
                  Chưa có Giáo lý viên nào được phân công
                </Text>
              </div>
            )}
          </div>
        ) : (
          <Empty description="Không tìm thấy dữ liệu lớp học" />
        )}
      </Drawer>
    </div>
  );
};

export default ClassManagement;
